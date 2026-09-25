jest.mock('../../src/repositories/orderRepository');
jest.mock('../../src/repositories/orderStatusHistoryRepository');

const orderRepository = require('../../src/repositories/orderRepository');
const historyRepository = require('../../src/repositories/orderStatusHistoryRepository');
const orderStatusService = require('../../src/services/orderStatusService');
const AppError = require('../../src/utils/AppError');

const fakeDb = {}; // khong can query that vi repository da bi mock

describe('orderStatusService.changeStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  test('cho phep chuyen trang thai hop le (new -> confirmed) va ghi history', async () => {
    orderRepository.findById.mockResolvedValue({ id: 'o1', status: 'new' });
    orderRepository.updateStatus.mockResolvedValue({ id: 'o1', status: 'confirmed' });
    historyRepository.create.mockResolvedValue({});

    const result = await orderStatusService.changeStatus(fakeDb, 'u1', 'o1', 'confirmed');

    expect(result.status).toBe('confirmed');
    expect(orderRepository.updateStatus).toHaveBeenCalledWith(fakeDb, 'u1', 'o1', 'confirmed');
    expect(historyRepository.create).toHaveBeenCalledWith(fakeDb, 'u1', 'o1', 'confirmed', 'manual');
  });

  test('tu choi chuyen trang thai khong hop le (new -> delivered)', async () => {
    orderRepository.findById.mockResolvedValue({ id: 'o1', status: 'new' });

    await expect(orderStatusService.changeStatus(fakeDb, 'u1', 'o1', 'delivered'))
      .rejects.toMatchObject({ code: 'INVALID_STATUS_TRANSITION', statusCode: 409 });
    expect(orderRepository.updateStatus).not.toHaveBeenCalled();
  });

  test('tu choi trang thai khong ton tai trong danh sach hop le', async () => {
    await expect(orderStatusService.changeStatus(fakeDb, 'u1', 'o1', 'khong_ton_tai'))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  test('trang thai terminal (cancelled) khong the chuyen tiep', async () => {
    orderRepository.findById.mockResolvedValue({ id: 'o1', status: 'cancelled' });
    await expect(orderStatusService.changeStatus(fakeDb, 'u1', 'o1', 'confirmed'))
      .rejects.toBeInstanceOf(AppError);
  });

  test('don khong ton tai (hoac khong thuoc user) -> 404', async () => {
    orderRepository.findById.mockResolvedValue(null);
    await expect(orderStatusService.changeStatus(fakeDb, 'u1', 'o-khac', 'confirmed'))
      .rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
