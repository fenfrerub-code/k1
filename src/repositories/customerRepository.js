async function findAllByUser(db, userId, { search }) {
  const params = [userId];
  let where = 'WHERE c.user_id = $1';
  if (search) {
    params.push(`%${search}%`);
    where += ` AND (c.name ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
  }
  const { rows } = await db.query(
    `SELECT * FROM customers c ${where} ORDER BY c.created_at DESC`,
    params
  );
  return rows;
}

async function findById(db, userId, customerId) {
  const { rows } = await db.query(
    'SELECT * FROM customers WHERE id = $1 AND user_id = $2',
    [customerId, userId]
  );
  return rows[0] || null;
}

async function create(db, userId, { name, phone, email, address }) {
  const { rows } = await db.query(
    `INSERT INTO customers (user_id, name, phone, email, address)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, name, phone || null, email || null, address || null]
  );
  return rows[0];
}

async function update(db, userId, customerId, { name, phone, email, address }) {
  const { rows } = await db.query(
    `UPDATE customers SET
       name = COALESCE($3, name), phone = COALESCE($4, phone),
       email = COALESCE($5, email), address = COALESCE($6, address)
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [customerId, userId, name ?? null, phone ?? null, email ?? null, address ?? null]
  );
  return rows[0] || null;
}

async function findOrdersByCustomer(db, userId, customerId, { limit, offset }) {
  const { rows } = await db.query(
    `SELECT * FROM orders WHERE customer_id = $1 AND user_id = $2
     ORDER BY order_created_at DESC LIMIT $3 OFFSET $4`,
    [customerId, userId, limit, offset]
  );
  const { rows: countRows } = await db.query(
    'SELECT count(*)::int AS total FROM orders WHERE customer_id = $1 AND user_id = $2',
    [customerId, userId]
  );
  return { rows, total: countRows[0].total };
}

module.exports = { findAllByUser, findById, create, update, findOrdersByCustomer };
