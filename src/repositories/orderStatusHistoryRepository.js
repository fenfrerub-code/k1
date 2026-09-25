async function findByOrder(db, orderId) {
  const { rows } = await db.query(
    'SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY occurred_at ASC',
    [orderId]
  );
  return rows;
}

async function create(db, userId, orderId, status, source = 'manual', occurredAt) {
  const { rows } = await db.query(
    `INSERT INTO order_status_history (order_id, user_id, status, source, occurred_at)
     VALUES ($1,$2,$3,$4, COALESCE($5, now())) RETURNING *`,
    [orderId, userId, status, source, occurredAt || null]
  );
  return rows[0];
}

module.exports = { findByOrder, create };
