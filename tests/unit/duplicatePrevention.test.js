jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/shopRepository');
jest.mock('../../src/repositories/customerRepository', () => ({ create: jest.fn() }));
jest.mock('../../src/repositories/productRepository');
jest.mock('../../src/repositories/orderItemRepository');
jest.mock('../../src/repositories/shipmentRepository');
jest.mock('../../src/repositories/orderStatusHistoryRepository');
jest.mock('../../src/repositories/integrationRepository');
jest.mock('../../src/repositories/syncLogRepository');
jest.mock('../../src/integrations/MockIntegrationAdapter');

const orderRepository = require('../../src/repositories/orderRepository');
const shopRepository = require('../../src/repositories/shopRepository');
const productRepository = require('../../src/repositories/productRepository');
const customerRepository = require('../../src/repositories/customerRepository');
const orderItemRepository = require('../../src/repositories/orderItemRepository');
const historyRepository = require('../../src/repositories/orderStatusHistoryRepository');
const integrationRepository = require('../../src/repositories/integrationRepository');
const syncLogRepository = require('../../src/repositories/syncLogRepository');
const MockIntegrationAdapter = require('../../src/integrations/MockIntegrationAdapter');
const syncService = require('../../src/services/syncService');

const fakeDb = {};
const shop = { id: 'shop-1', user_id: 'u1', platform_id: 1, platform_code: 'shopee', external_shop_id: 'EXT-1' };

describe('syncService - duplicate prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    shopRepository.findById.mockResolvedValue(shop);
    integrationRepository.findByShop.mockResolvedValue({ id: 'int-1' });
    syncLogRepository.create.mockResolvedValue({ id: 'log-1' });
    syncLogRepository.complete.mockResolvedValue({});
    productRepository.findByExternalId.mockResolvedValue({ id: 'p1' }); // san pham da ton tai -> khong tao lai
    orderItemRepository.createMany.mockResolvedValue([]);
    historyRepository.create.mockResolvedValue({});
    shopRepository.markSynced.mockResolvedValue(shop);
    integrationRepository.upsert.mockResolvedValue({});
  });

  test('don da ton tai theo (shop_id, external_order_id) -> bo qua, KHONG tao ban ghi moi', async () => {
    const rawOrder = {
      externalOrderId: 'EXT-ORD-1',
      customer: { name: 'Khach A' },
      items: [{ productName: 'SP1', quantity: 1, unitPrice: 1000 }],
      totalAmount: 1000, status: 'new', paymentStatus: 'paid',
    };
    MockIntegrationAdapter.mockImplementation(() => ({
      sync: async () => ({ orders: [rawOrder], products: [] }),
    }));
    // gia lap: don voi external_order_id nay DA CO san trong shop
    orderRepository.findByExternalId.mockResolvedValue({ id: 'existing-order' });

    const result = await syncService.syncShop(fakeDb, 'u1', 'shop-1');

    expect(orderRepository.create).not.toHaveBeenCalled();
    expect(result.ordersImported).toBe(0);
  });

  test('don moi (chua co external_order_id) -> duoc tao 1 lan', async () => {
    const rawOrder = {
      externalOrderId: 'EXT-ORD-NEW',
      customer: { name: 'Khach B' },
      items: [{ productName: 'SP1', quantity: 2, unitPrice: 2000 }],
      totalAmount: 4000, status: 'new', paymentStatus: 'cod',
    };
    MockIntegrationAdapter.mockImplementation(() => ({
      sync: async () => ({ orders: [rawOrder], products: [] }),
    }));
    orderRepository.findByExternalId.mockResolvedValue(null); // chua ton tai
    orderRepository.create.mockResolvedValue({ id: 'new-order-id' });

    customerRepository.create.mockResolvedValue({ id: 'c1' });

    const result = await syncService.syncShop(fakeDb, 'u1', 'shop-1');

    expect(orderRepository.create).toHaveBeenCalledTimes(1);
    expect(result.ordersImported).toBe(1);
  });
});
