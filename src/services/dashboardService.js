const dashboardRepository = require('../repositories/dashboardRepository');
const AppError = require('../utils/AppError');

/**
 * Chuan hoa filter thoi gian dung chung cho ca 3 endpoint dashboard:
 * today / 7_days / 30_days / custom (tu ?dateFrom=&dateTo=).
 */
function resolveDateRange(query) {
  const now = new Date();
  const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);

  if (query.range === 'today' || !query.range) {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    return { dateFrom: start, dateTo: endOfToday };
  }
  if (query.range === '7_days') {
    const start = new Date(now); start.setDate(start.getDate() - 6); start.setHours(0, 0, 0, 0);
    return { dateFrom: start, dateTo: endOfToday };
  }
  if (query.range === '30_days') {
    const start = new Date(now); start.setDate(start.getDate() - 29); start.setHours(0, 0, 0, 0);
    return { dateFrom: start, dateTo: endOfToday };
  }
  if (query.range === 'custom') {
    if (!query.dateFrom || !query.dateTo) {
      throw AppError.validation('range=custom yeu cau ca dateFrom va dateTo');
    }
    return { dateFrom: new Date(query.dateFrom), dateTo: new Date(query.dateTo) };
  }
  throw AppError.validation('range phai la today | 7_days | 30_days | custom');
}

async function getSummary(db, userId, query) {
  const range = resolveDateRange(query);
  const row = await dashboardRepository.summary(db, userId, range);
  return {
    range: query.range || 'today',
    total_orders: row.total_orders,
    new_orders: row.new_orders,
    pending_orders: row.pending_orders,
    shipping_orders: row.shipping_orders,
    delivered_orders: row.delivered_orders,
    cancelled_orders: row.cancelled_orders,
    returned_orders: row.returned_orders,
    total_order_value: Number(row.total_order_value),
  };
}

async function getByPlatform(db, userId, query) {
  const range = resolveDateRange(query);
  const rows = await dashboardRepository.byPlatform(db, userId, range);
  return rows.map((r) => ({
    platform: r.platform_name,
    platform_code: r.platform,
    orders: r.orders,
    delivered: r.delivered,
    shipping: r.shipping,
    total_value: Number(r.total_value),
  }));
}

async function getOrdersOverTime(db, userId, query) {
  const range = resolveDateRange(query);
  const granularity = ['day', 'week', 'month'].includes(query.granularity) ? query.granularity : 'day';
  const rows = await dashboardRepository.ordersOverTime(db, userId, { ...range, granularity });
  return rows.map((r) => ({ date: r.bucket, orders: r.orders, total_value: Number(r.total_value) }));
}

module.exports = { getSummary, getByPlatform, getOrdersOverTime, resolveDateRange };
