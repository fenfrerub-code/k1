// Moi repository o day nhan `db` (chinh la req.db - tenant-scoped client)
// lam tham so dau tien. RLS da tu loc theo user_id, nhung van them
// WHERE user_id = $1 tuong minh o tang application lam lop bao ve thu 2
// (defense in depth), dung nhu yeu cau "khong chi dua vao 1 lop bao mat".

async function findAllByUser(db, userId) {
  const { rows } = await db.query(
    `SELECT s.*, p.code AS platform_code, p.name AS platform_name
     FROM shops s JOIN platforms p ON p.id = s.platform_id
     WHERE s.user_id = $1 AND s.deleted_at IS NULL
     ORDER BY s.created_at DESC`,
    [userId]
  );
  return rows;
}

async function findById(db, userId, shopId) {
  const { rows } = await db.query(
    `SELECT s.*, p.code AS platform_code, p.name AS platform_name
     FROM shops s JOIN platforms p ON p.id = s.platform_id
     WHERE s.id = $1 AND s.user_id = $2 AND s.deleted_at IS NULL`,
    [shopId, userId]
  );
  return rows[0] || null;
}

async function findPlatformByCode(db, code) {
  const { rows } = await db.query('SELECT * FROM platforms WHERE code = $1', [code]);
  return rows[0] || null;
}

async function create(db, userId, { platformId, shopName, externalShopId }) {
  const { rows } = await db.query(
    `INSERT INTO shops (user_id, platform_id, shop_name, external_shop_id, status)
     VALUES ($1, $2, $3, $4, 'disconnected')
     RETURNING *`,
    [userId, platformId, shopName, externalShopId || null]
  );
  return rows[0];
}

async function update(db, userId, shopId, { shopName, status }) {
  const { rows } = await db.query(
    `UPDATE shops SET
        shop_name = COALESCE($3, shop_name),
        status    = COALESCE($4, status)
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING *`,
    [shopId, userId, shopName ?? null, status ?? null]
  );
  return rows[0] || null;
}

async function softDelete(db, userId, shopId) {
  const { rows } = await db.query(
    `UPDATE shops SET deleted_at = now(), status = 'disconnected'
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING id`,
    [shopId, userId]
  );
  return rows[0] || null;
}

async function markSynced(db, userId, shopId) {
  const { rows } = await db.query(
    `UPDATE shops SET last_synced_at = now(), status = 'connected'
     WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
     RETURNING *`,
    [shopId, userId]
  );
  return rows[0] || null;
}

module.exports = { findAllByUser, findById, findPlatformByCode, create, update, softDelete, markSynced };
