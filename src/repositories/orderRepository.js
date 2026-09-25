const ALLOWED_SORT = new Set(['order_created_at', 'total_amount', 'status']);

/**
 * Danh sach don hang co filter + search + sort + pagination.
 * Moi dieu kien deu tham so hoa ($1, $2...) de tranh SQL injection.
 */
async function findAll(db, userId, {
  status, platformCode, shopId, search, dateFrom, dateTo,
  sortBy = 'order_created_at', sortDir = 'desc', limit, offset,
}) {
  const params = [userId];
  let where = 'WHERE o.user_id = $1';

  if (status) { params.push(status); where += ` AND o.status = $${params.length}`; }
  if (shopId) { params.push(shopId); where += ` AND o.shop_id = $${params.length}`; }
  if (platformCode) { params.push(platformCode); where += ` AND pl.code = $${params.length}`; }
  if (dateFrom) { params.push(dateFrom); where += ` AND o.order_created_at >= $${params.length}`; }
  if (dateTo) { params.push(dateTo); where += ` AND o.order_created_at <= $${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (o.external_order_id ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
  }

  const safeSort = ALLOWED_SORT.has(sortBy) ? sortBy : 'order_created_at';
  const safeDir = sortDir === 'asc' ? 'ASC' : 'DESC';

  const baseQuery = `
    FROM orders o
    JOIN platforms pl ON pl.id = o.platform_id
    LEFT JOIN customers c ON c.id = o.customer_id
    ${where}`;

  const listParams = [...params, limit, offset];
  const { rows } = await db.query(
    `SELECT o.*, pl.code AS platform_code, pl.name AS platform_name,
            c.name AS customer_name
     ${baseQuery}
     ORDER BY o.${safeSort} ${safeDir}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams
  );

  const { rows: countRows } = await db.query(`SELECT count(*)::int AS total ${baseQuery}`, params);
  return { rows, total: countRows[0].total };
}

async function findById(db, userId, orderId) {
  const { rows } = await db.query(
    `SELECT o.*, pl.code AS platform_code, pl.name AS platform_name
     FROM orders o JOIN platforms pl ON pl.id = o.platform_id
     WHERE o.id = $1 AND o.user_id = $2`,
    [orderId, userId]
  );
  return rows[0] || null;
}

async function findByExternalId(db, shopId, externalOrderId) {
  const { rows } = await db.query(
    'SELECT * FROM orders WHERE shop_id = $1 AND external_order_id = $2',
    [shopId, externalOrderId]
  );
  return rows[0] || null;
}

async function create(db, userId, {
  shopId, platformId, customerId, externalOrderId, status, paymentStatus,
  totalAmount, currency, orderCreatedAt,
}) {
  const { rows } = await db.query(
    `INSERT INTO orders (user_id, shop_id, platform_id, customer_id, external_order_id,
                          status, payment_status, total_amount, currency, order_created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [userId, shopId, platformId, customerId || null, externalOrderId,
      status || 'new', paymentStatus || 'unpaid', totalAmount || 0, currency || 'VND',
      orderCreatedAt || new Date()]
  );
  return rows[0];
}

async function updateFields(db, userId, orderId, fields) {
  const setClauses = [];
  const params = [orderId, userId];
  for (const [col, value] of Object.entries(fields)) {
    params.push(value);
    setClauses.push(`${col} = $${params.length}`);
  }
  if (setClauses.length === 0) return findById(db, userId, orderId);

  const { rows } = await db.query(
    `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`,
    params
  );
  return rows[0] || null;
}

async function updateStatus(db, userId, orderId, status) {
  const { rows } = await db.query(
    `UPDATE orders SET status = $3 WHERE id = $1 AND user_id = $2 RETURNING *`,
    [orderId, userId, status]
  );
  return rows[0] || null;
}

async function remove(db, userId, orderId) {
  const { rows } = await db.query(
    'DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING id',
    [orderId, userId]
  );
  return rows[0] || null;
}

module.exports = { findAll, findById, findByExternalId, create, updateFields, updateStatus, remove };
