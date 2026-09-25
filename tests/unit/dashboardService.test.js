jest.mock('../../src/repositories/dashboardRepository');
const dashboardRepository = require('../../src/repositories/dashboardRepository');
const dashboardService = require('../../src/services/dashboardService');

const fakeDb = {};

describe('dashboardService', () => {
  beforeEach(() => jest.clearAllMocks());

  test('getSummary: chuyen doi dung dinh dang so & tra dung cac truong yeu cau', async () => {
    dashboardRepository.summary.mockResolvedValue({
      total_orders: 227, new_orders: 10, pending_orders: 20, shipping_orders: 30,
      delivered_orders: 150, cancelled_orders: 10, returned_orders: 7,
      total_order_value: '125000000.00', // Postgres numeric tra ve dang string
    });

    const result = await dashboardService.getSummary(fakeDb, 'u1', { range: '30_days' });

    expect(result.total_orders).toBe(227);
    expect(result.total_order_value).toBe(125000000);
    expect(typeof result.total_order_value).toBe('number');
  });

  test('range khong hop le -> nem loi validation', async () => {
    await expect(dashboardService.getSummary(fakeDb, 'u1', { range: 'nam_nay' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  test('range=custom bat buoc phai co dateFrom va dateTo', async () => {
    await expect(dashboardService.getSummary(fakeDb, 'u1', { range: 'custom' }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  test('getByPlatform: khong hard-code ten nen tang, lay het tu database', async () => {
    dashboardRepository.byPlatform.mockResolvedValue([
      { platform: 'shopee', platform_name: 'Shopee', orders: 120, delivered: 80, shipping: 35, total_value: '50000000' },
    ]);
    const result = await dashboardService.getByPlatform(fakeDb, 'u1', { range: 'today' });
    expect(result[0]).toMatchObject({ platform: 'Shopee', platform_code: 'shopee', orders: 120 });
  });
});
