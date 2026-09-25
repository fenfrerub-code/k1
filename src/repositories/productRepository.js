async function findAllByUser(db, userId, { search, shopId, limit, offset }) {
  const params = [userId];
  let where = 'WHERE p.user_id = $1';
  if (shopId) { params.push(shopId); where += ` AND p.shop_id = $${params.length}`; }
  if (search) { params.push(`%${search}%`); where += ` AND (p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`; }

  const listParams = [...params, limit, offset];
  const { rows } = await db.query(
    `SELECT * FROM products p ${where} ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams
  );
  const { rows: countRows } = await db.query(`SELECT count(*)::int AS total FROM products p ${where}`, params);
  return { rows, total: countRows[0].total };
}

async function findById(db, userId, productId) {
  const { rows } = await db.query('SELECT * FROM products WHERE id = $1 AND user_id = $2', [productId, userId]);
  return rows[0] || null;
}

async function create(db, userId, { shopId, sku, name, price, externalProductId }) {
  const { rows } = await db.query(
    `INSERT INTO products (user_id, shop_id, external_product_id, sku, name, price)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, shopId, externalProductId || null, sku || null, name, price]
  );
  return rows[0];
}

async function update(db, userId, productId, { sku, name, price, status }) {
  const { rows } = await db.query(
    `UPDATE products SET
       sku = COALESCE($3, sku), name = COALESCE($4, name),
       price = COALESCE($5, price), status = COALESCE($6, status)
     WHERE id = $1 AND user_id = $2 RETURNING *`,
    [productId, userId, sku ?? null, name ?? null, price ?? null, status ?? null]
  );
  return rows[0] || null;
}

async function remove(db, userId, productId) {
  const { rows } = await db.query(
    'DELETE FROM products WHERE id = $1 AND user_id = $2 RETURNING id',
    [productId, userId]
  );
  return rows[0] || null;
}

async function findByExternalId(db, shopId, externalProductId) {
  const { rows } = await db.query(
    'SELECT * FROM products WHERE shop_id = $1 AND external_product_id = $2',
    [shopId, externalProductId]
  );
  return rows[0] || null;
}

module.exports = { findAllByUser, findById, create, update, remove, findByExternalId };
