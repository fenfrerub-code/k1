const { Pool } = require('pg');
const { databaseUrl, databaseSsl } = require('./env');
const logger = require('../utils/logger');

// Pool ket noi dung chung cho toan bo app.
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseSsl ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
});

/**
 * Chay 1 query dung pool chung (dung cho cac truong hop KHONG can tenant
 * context, vi du: auth - tra cuu user theo email truoc khi dang nhap).
 */
async function query(text, params) {
  return pool.query(text, params);
}

/**
 * Moi request cua user da dang nhap PHAI chay trong 1 transaction rieng,
 * voi bien phien "app.current_user_id" duoc SET LOCAL truoc khi chay bat
 * ky query nao. Day la co che de tang cuong Row Level Security o tang
 * database: du code backend co lo quen loc WHERE user_id = ..., Postgres
 * van tu chan truy cap du lieu cua tenant khac.
 *
 * Tra ve 1 pg Client da BEGIN + SET LOCAL, cong voi 2 ham commit()/rollback()
 * tien loi de middleware goi khi ket thuc request.
 */
async function acquireTenantClient(userId) {
  const client = await pool.connect();
  await client.query('BEGIN');
  await client.query('SET LOCAL app.current_user_id = $1', [userId]);
  return client;
}

module.exports = { pool, query, acquireTenantClient };
