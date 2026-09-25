const { query } = require('../config/db');

// users KHONG bat RLS (chinh no la bang dinh danh tenant), nen dung pool
// chung, khong can tenant client.
async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function create({ email, passwordHash, name, phone }) {
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, name, phone)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, phone, status, created_at`,
    [email, passwordHash, name, phone || null]
  );
  return rows[0];
}

async function updateProfile(id, { name, phone }) {
  const { rows } = await query(
    `UPDATE users SET name = COALESCE($2, name), phone = COALESCE($3, phone)
     WHERE id = $1
     RETURNING id, email, name, phone, status, created_at, updated_at`,
    [id, name ?? null, phone ?? null]
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findById, create, updateProfile };
