const shopRepository = require('../repositories/shopRepository');
const customerRepository = require('../repositories/customerRepository');
const productRepository = require('../repositories/productRepository');
const orderRepository = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const shipmentRepository = require('../repositories/shipmentRepository');
const historyRepository = require('../repositories/orderStatusHistoryRepository');
const integrationRepository = require('../repositories/integrationRepository');
const syncLogRepository = require('../repositories/syncLogRepository');
const MockIntegrationAdapter = require('../integrations/MockIntegrationAdapter');
const { normalizeOrder } = require('../integrations/normalizeOrder');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * Chon adapter theo platform_code cua shop. HIEN TAI moi platform deu tra
 * ve MockIntegrationAdapter. Sau nay them API that:
 *
 *   const ADAPTERS = {
 *     shopee: new ShopeeAdapter(credentials),
 *     tiktok_shop: new TikTokShopAdapter(credentials),
 *     lazada: new LazadaAdapter(credentials),
 *   };
 *
 * -> chi sua ham nay, KHONG dong gi den syncShop() ben duoi.
 */
function resolveAdapter(/* platformCode */) {
  return new MockIntegrationAdapter();
}

/**
 * Luong dong bo 1 shop:
 *   Shop -> Adapter.sync() -> raw orders/products
 *         -> normalizeOrder() cho tung don
 *         -> chong trung theo (shop_id, external_order_id)
 *         -> luu Database (orders, order_items, shipments, status history)
 *         -> cap nhat shops.last_synced_at + integrations + sync_logs
 */
async function syncShop(db, userId, shopId) {
  const shop = await shopRepository.findById(db, userId, shopId);
  if (!shop) throw AppError.notFound('Khong tim thay shop');

  const integration = await integrationRepository.findByShop(db, userId, shopId);
  const log = await syncLogRepository.create(db, userId, {
    shopId, integrationId: integration?.id, syncType: 'full',
  });

  let processed = 0;
  try {
    const adapter = resolveAdapter(shop.platform_code);
    const { orders: rawOrders, products: rawProducts } = await adapter.sync(shop);

    // 1) dong bo san pham (upsert don gian theo external_product_id)
    for (const rawProduct of rawProducts) {
      const existingProduct = await productRepository.findByExternalId(db, shop.id, rawProduct.externalProductId);
      if (!existingProduct) {
        await productRepository.create(db, userId, {
          shopId: shop.id,
          externalProductId: rawProduct.externalProductId,
          sku: rawProduct.sku,
          name: rawProduct.name,
          price: rawProduct.price,
        });
      }
    }

    // 2) dong bo don hang
    for (const raw of rawOrders) {
      const normalized = normalizeOrder(raw);

      // CHONG DUPLICATE: khoa duy nhat la (shop_id, external_order_id).
      // Neu don da ton tai -> bo qua, khong tao ban ghi moi, khong loi.
      const existingOrder = await orderRepository.findByExternalId(db, shop.id, normalized.externalOrderId);
      if (existingOrder) continue;

      const customer = await customerRepository.create(db, userId, normalized.customer);

      const order = await orderRepository.create(db, userId, {
        shopId: shop.id,
        platformId: shop.platform_id,
        customerId: customer.id,
        externalOrderId: normalized.externalOrderId,
        status: normalized.status,
        paymentStatus: normalized.paymentStatus,
        totalAmount: normalized.totalAmount,
        orderCreatedAt: normalized.orderCreatedAt,
      });

      if (normalized.items.length > 0) {
        await orderItemRepository.createMany(db, userId, order.id, normalized.items);
      }
      await historyRepository.create(db, userId, order.id, normalized.status, 'api_sync', normalized.orderCreatedAt);

      if (normalized.shipment) {
        const provider = await shipmentRepository.findProviderByCode(db, normalized.shipment.providerCode);
        if (provider) {
          await shipmentRepository.create(db, userId, {
            orderId: order.id,
            providerId: provider.id,
            trackingNumber: normalized.shipment.trackingNumber,
            status: normalized.shipment.status,
          });
        }
      }
      processed += 1;
    }

    await shopRepository.markSynced(db, userId, shopId);
    await integrationRepository.upsert(db, userId, shop.id, shop.platform_id, { status: 'active', lastSyncAt: new Date() });
    await syncLogRepository.complete(db, log.id, { status: 'success', recordsProcessed: processed });

    logger.info('Shop sync completed', { shopId, userId, processed });
    return { shopId, ordersImported: processed, status: 'success' };
  } catch (err) {
    await syncLogRepository.complete(db, log.id, { status: 'failed', recordsProcessed: processed, errorMessage: err.message });
    logger.error('Shop sync failed', { shopId, userId, error: err.message });
    throw AppError.integration(`Dong bo shop that bai: ${err.message}`);
  }
}

module.exports = { syncShop, resolveAdapter };
