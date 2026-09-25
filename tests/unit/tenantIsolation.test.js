// Test QUAN TRONG NHAT theo yeu cau: User A khong duoc truy cap Order cua
// User B. Repository luon nhan userId lam dieu kien WHERE, nen ta kiem tra
// rang orderService dua dung userId cua NGUOI DANG DANG NHAP xuong repository,
// khong bao giio dung id lay tu noi khac (vd tu body payload).

jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/orderItemRepository');
jest.mock('../../src/repositories/shipmentRepository');
jest.mock('../../src/repositories/orderStatusHistoryRepository');

const orderRepository = require('../../src/repositories/orderRepository');
const orderItemRepository = require('../../src/repositories/orderItemRepository');
const shipmentRepository = require('../../src/repositories/shipmentRepository');
const historyRepository = require('../../src/repositories/orderStatusHistoryRepository');
const orderService = require('../../src/services/orderService');
const AppError = require('../../src/utils/AppError');

const fakeDb = {};

describe('Tenant isolation - orderService.getOrderDetail', () => {
  beforeEach(() => jest.clearAllMocks());

  test('luon truyen dung userId dang dang nhap xuong repository (khong the doi userId qua param khac)', async () => {
    orderRepository.findById.mockResolvedValue({ id: 'order-1', user_id: 'user-A' });
    orderItemRepository.findByOrder.mockResolvedValue([]);
    shipmentRepository.findByOrder.mockResolvedValue([]);
    historyRepository.findByOrder.mockResolvedValue([]);

    await orderService.getOrderDetail(fakeDb, 'user-A', 'order-1');

    expect(orderRepository.findById).toHaveBeenCalledWith(fakeDb, 'user-A', 'order-1');
  });

  test('User B goi don cua User A -> repository (co WHERE user_id) tra null -> service nem 404, KHONG lo du lieu', async () => {
    // repository, khi loc dung user_id = 'user-B', se khong tim thay don cua user-A -> null
    orderRepository.findById.mockResolvedValue(null);

    await expect(orderService.getOrderDetail(fakeDb, 'user-B', 'order-1'))
      .rejects.toMatchObject({ code: 'NOT_FOUND', statusCode: 404 });

    // Xac nhan query van duoc goi dung voi user-B (chu khong bi "hack" thanh user-A)
    expect(orderRepository.findById).toHaveBeenCalledWith(fakeDb, 'user-B', 'order-1');
  });
});
