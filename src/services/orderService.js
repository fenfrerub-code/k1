const orderRepository = require('../repositories/orderRepository');
const orderItemRepository = require('../repositories/orderItemRepository');
const historyRepository = require('../repositories/orderStatusHistoryRepository');
const shipmentRepository = require('../repositories/shipmentRepository');
const shopRepository = require('../repositories/shopRepository');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const orderStatusService = require('./orderStatusService');

async function listOrders(db, userId, query) {
  const pagination = parsePagination(query);
  const { rows, total } = await orderRepository.findAll(db, userId, {
    status: query.status,
    platformCode: query.platform,
    shopId: query.shopId,
    search: query.search,
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    limit: pagination.limit,
    offset: pagination.offset,
  });
  return { data: rows, pagination: buildPaginationMeta(pagination, total) };
}

/**
 * Chi tiet 1 don hang: gop du lieu order + items + shipment + status history
 * trong 1 lan goi service, dung cho GET /api/orders/:id.
 */
async function getOrderDetail(db, userId, orderId) {
  const order = await orderRepository.findById(db, userId, orderId);
  if (!order) throw AppError.notFound('Khong tim thay don hang');

  const [items, shipments, statusHistory] = await Promise.all([
    orderItemRepository.findByOrder(db, orderId),
    shipmentRepository.findByOrder(db, userId, orderId),
    historyRepository.findByOrder(db, orderId),
  ]);

  return { order, items, shipment: shipments[0] || null, shipments, statusHistory };
}

async function getOrderHistory(db, userId, orderId) {
  const order = await orderRepository.findById(db, userId, orderId);
  if (!order) throw AppError.notFound('Khong tim thay don hang');
  return historyRepository.findByOrder(db, orderId);
}

async function getOrderShipment(db, userId, orderId) {
  const order = await orderRepository.findById(db, userId, orderId);
  if (!order) throw AppError.notFound('Khong tim thay don hang');
  return shipmentRepository.findByOrder(db, userId, orderId);
}

/**
 * Tao don hang THU CONG (khong qua sync). Dung cho POST /api/orders khi
 * seller tu nhap tay 1 don (vd don ban truc tiep, khong tu san TMDT).
 */
async function createOrder(db, userId, payload) {
  const shop = await shopRepository.findById(db, userId, payload.shopId);
  if (!shop) throw AppError.validation('shopId khong hop le hoac khong thuoc ve ban');

  const externalOrderId = payload.externalOrderId || `MANUAL-${Date.now()}`;
  const existing = await orderRepository.findByExternalId(db, shop.id, externalOrderId);
  if (existing) throw AppError.conflict('Don hang voi ma nay da ton tai trong shop nay');

  const order = await orderRepository.create(db, userId, {
    shopId: shop.id,
    platformId: shop.platform_id,
    customerId: payload.customerId || null,
    externalOrderId,
    status: payload.status || 'new',
    paymentStatus: payload.paymentStatus || 'unpaid',
    totalAmount: payload.totalAmount || 0,
    currency: payload.currency || 'VND',
    orderCreatedAt: payload.orderCreatedAt || new Date(),
  });

  if (Array.isArray(payload.items) && payload.items.length > 0) {
    await orderItemRepository.createMany(db, userId, order.id, payload.items);
  }
  await historyRepository.create(db, userId, order.id, order.status, 'manual');

  return getOrderDetail(db, userId, order.id);
}

/**
 * Cap nhat don hang. Neu payload co `status`, di qua orderStatusService de
 * dam bao transition hop le + tu dong ghi status history (khong cho phep
 * "nhay coc" trang thai tuy y qua endpoint PUT chung chung).
 */
async function updateOrder(db, userId, orderId, payload) {
  const order = await orderRepository.findById(db, userId, orderId);
  if (!order) throw AppError.notFound('Khong tim thay don hang');

  const editableFields = {};
  if (payload.paymentStatus) editableFields.payment_status = payload.paymentStatus;
  if (payload.customerId !== undefined) editableFields.customer_id = payload.customerId;

  if (Object.keys(editableFields).length > 0) {
    await orderRepository.updateFields(db, userId, orderId, editableFields);
  }
  if (payload.status && payload.status !== order.status) {
    await orderStatusService.changeStatus(db, userId, orderId, payload.status, 'manual');
  }
  return getOrderDetail(db, userId, orderId);
}

async function deleteOrder(db, userId, orderId) {
  const deleted = await orderRepository.remove(db, userId, orderId);
  if (!deleted) throw AppError.notFound('Khong tim thay don hang');
  return { id: deleted.id, deleted: true };
}

module.exports = {
  listOrders, getOrderDetail, getOrderHistory, getOrderShipment,
  createOrder, updateOrder, deleteOrder,
};
