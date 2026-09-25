const IntegrationAdapter = require('./IntegrationAdapter');

const MOCK_PRODUCTS = ['Ao thun basic', 'Quan jean nam', 'Giay sneaker', 'Tai nghe bluetooth', 'Balo laptop'];
const MOCK_STATUSES = ['new', 'confirmed', 'picked_up', 'shipping', 'out_for_delivery', 'delivered'];
const MOCK_PROVIDERS = ['spx', 'ghn', 'ghtk', 'jt'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

/**
 * Adapter mock - MVP chua co API credentials that, nen dung adapter nay de
 * toan bo backend (Order Service, Sync Service, Dashboard...) van chay va
 * kiem thu duoc binh thuong. Khi thay bang ShopeeAdapter/TikTokShopAdapter/
 * LazadaAdapter that, chi can implement cung 4 phuong thuc nay - phan con
 * lai cua he thong khong doi.
 */
class MockIntegrationAdapter extends IntegrationAdapter {
  async getShops() {
    return [{ externalShopId: 'MOCK-SHOP-1', shopName: 'Mock Shop' }];
  }

  async getProducts() {
    return MOCK_PRODUCTS.map((name, i) => ({
      externalProductId: `MOCK-P-${i}`,
      sku: `SKU-MOCK-${i}`,
      name,
      price: randomInt(50, 500) * 1000,
    }));
  }

  /**
   * Sinh ra 1 lo don hang gia lap (raw, CHUA chuan hoa) cho 1 shop.
   * externalOrderId duoc sinh ngau nhien nhung on dinh trong pham vi mot
   * lan goi - viec chong trung se do OrderService dam nhiem dua tren
   * (shop_id, external_order_id).
   */
  async getOrders(shopExternalId, { count = 5 } = {}) {
    const orders = [];
    for (let i = 0; i < count; i++) {
      const itemCount = randomInt(1, 3);
      const items = Array.from({ length: itemCount }, () => {
        const unitPrice = randomInt(50, 500) * 1000;
        const quantity = randomInt(1, 3);
        return {
          externalProductId: `MOCK-P-${randomInt(0, MOCK_PRODUCTS.length - 1)}`,
          productName: randomItem(MOCK_PRODUCTS),
          sku: `SKU-MOCK-${randomInt(0, 99)}`,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        };
      });
      const totalAmount = items.reduce((s, it) => s + it.totalPrice, 0);
      const status = randomItem(MOCK_STATUSES);

      orders.push({
        externalOrderId: `MOCK-${shopExternalId}-${Date.now()}-${i}`,
        customer: { name: `Khach hang ${randomInt(1, 999)}`, phone: `09${randomInt(10000000, 99999999)}` },
        items,
        totalAmount,
        paymentStatus: Math.random() < 0.6 ? 'paid' : 'cod',
        status,
        shipment: status === 'new'
          ? null
          : {
              providerCode: randomItem(MOCK_PROVIDERS),
              trackingNumber: `${randomItem(MOCK_PROVIDERS).toUpperCase()}${randomInt(1000000, 9999999)}`,
              status: status === 'delivered' ? 'delivered' : 'in_transit',
            },
        orderCreatedAt: new Date(Date.now() - randomInt(0, 30) * 86400000),
      });
    }
    return orders;
  }

  async sync(shop) {
    const [orders, products] = await Promise.all([
      this.getOrders(shop.external_shop_id || shop.id, { count: randomInt(3, 8) }),
      this.getProducts(),
    ]);
    return { orders, products };
  }
}

module.exports = MockIntegrationAdapter;
