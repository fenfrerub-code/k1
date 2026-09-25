async function findByShop(db, userId, shopId) {
  const { rows } = await db.query(
    'SELECT * FROM integrations WHERE shop_id = $1 AND user_id = $2',
    [shopId, userId]
  );
  return rows[0] || null;
}

async function upsert(db, userId, shopId, platformId, { status, lastSyncAt }) {
  const { rows } = await db.query(
    `INSERT INTO integrations (user_id, shop_id, platform_id, status, last_sync_at)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (shop_id, platform_id)
     DO UPDATE SET status = EXCLUDED.status, last_sync_at = EXCLUDED.last_sync_at
     RETURNING *`,
    [userId, shopId, platformId, status || 'active', lastSyncAt || new Date()]
  );
  return rows[0];
}

module.exports = { findByShop, upsert };
