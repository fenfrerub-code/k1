const orderRepository = require('../repositories/orderRepository');
const historyRepository = require('../repositories/orderStatusHistoryRepository');
const AppError = require('../utils/AppError');

// Cac trang thai hop le - PHAI khop voi CHECK constraint cua bang orders
// trong database-schema.sql.
const STATUSES = [
  'new', 'pending', 'confirmed', 'picked_up', 'shipping',
  'out_for_delivery', 'delivered', 'cancelled', 'returned',
];

// So do chuyen trang thai hop le. Trang thai khong co trong map (hoac
// mang rong) la trang thai "ket thuc" (terminal), khong the doi tiep.
const TRANSITIONS = {
  new: ['pending', 'confirmed', 'cancelled'],
  pending: ['confirmed', 'cancelled'],
  confirmed: ['picked_up', 'cancelled'],
  picked_up: ['shipping', 'cancelled'],
  shipping: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

function assertValidStatus(status) {
  if (!STATUSES.includes(status)) {
    throw AppError.validation(`Trang thai "${status}" khong hop le. Cac gia tri cho phep: ${STATUSES.join(', ')}`);
  }
}

/**
 * Doi trang thai 1 don hang: kiem tra transition hop le, cap nhat
 * orders.status, VA ghi 1 dong vao order_status_history - khong bao gio
 * chi doi status hien tai ma khong luu lich su.
 */
async function changeStatus(db, userId, orderId, newStatus, source = 'manual') {
  assertValidStatus(newStatus);

  const order = await orderRepository.findById(db, userId, orderId);
  if (!order) throw AppError.notFound('Khong tim thay don hang');

  if (order.status === newStatus) return order; // idempotent, khong lam gi them

  const allowed = TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw AppError.invalidStatusTransition(order.status, newStatus);
  }

  const updated = await orderRepository.updateStatus(db, userId, orderId, newStatus);
  await historyRepository.create(db, userId, orderId, newStatus, source);
  return updated;
}

module.exports = { changeStatus, assertValidStatus, STATUSES, TRANSITIONS };
