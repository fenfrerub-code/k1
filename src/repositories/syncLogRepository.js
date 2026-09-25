async function create(db, userId, { shopId, integrationId, syncType }) {
  const { rows } = await db.query(
    `INSERT INTO sync_logs (user_id, shop_id, integration_id, sync_type, status, started_at)
     VALUES ($1,$2,$3,$4,'running', now()) RETURNING *`,
    [userId, shopId, integrationId || null, syncType]
  );
  return rows[0];
}

async function complete(db, logId, { status, recordsProcessed, errorMessage }) {
  const { rows } = await db.query(
    `UPDATE sync_logs SET status = $2, records_processed = $3, error_message = $4, completed_at = now()
     WHERE id = $1 RETURNING *`,
    [logId, status, recordsProcessed || 0, errorMessage || null]
  );
  return rows[0];
}

module.exports = { create, complete };
