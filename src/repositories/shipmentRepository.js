async function findAllByUser(db, userId, { limit, offset }) {
  const { rows } = await db.query(
    `SELECT sh.*, sp.name AS provider_name, sp.code AS provider_code
     FROM shipments sh JOIN shipping_providers sp ON sp.id = sh.shipping_provider_id
     WHERE sh.user_id = $1 ORDER BY sh.created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  const { rows: countRows } = await db.query(
    'SELECT count(*)::int AS total FROM shipments WHERE user_id = $1', [userId]
  );
  return { rows, total: countRows[0].total };
}

async function findById(db, userId, shipmentId) {
  const { rows } = await db.query(
    `SELECT sh.*, sp.name AS provider_name, sp.code AS provider_code
     FROM shipments sh JOIN shipping_providers sp ON sp.id = sh.shipping_provider_id
     WHERE sh.id = $1 AND sh.user_id = $2`,
    [shipmentId, userId]
  );
  return rows[0] || null;
}

async function findByOrder(db, userId, orderId) {
  const { rows } = await db.query(
    `SELECT sh.*, sp.name AS provider_name, sp.code AS provider_code
     FROM shipments sh JOIN shipping_providers sp ON sp.id = sh.shipping_provider_id
     WHERE sh.order_id = $1 AND sh.user_id = $2
     ORDER BY sh.created_at DESC`,
    [orderId, userId]
  );
  return rows;
}

async function findProviderByCode(db, code) {
  const { rows } = await db.query('SELECT * FROM shipping_providers WHERE code = $1', [code]);
  return rows[0] || null;
}

async function create(db, userId, { orderId, providerId, trackingNumber, status }) {
  const { rows } = await db.query(
    `INSERT INTO shipments (order_id, user_id, shipping_provider_id, tracking_number, status)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [orderId, userId, providerId, trackingNumber, status || 'pending']
  );
  return rows[0];
}

module.exports = { findAllByUser, findById, findByOrder, findProviderByCode, create };
