/**
 * Logger toi gian, co cau truc, tu dong an cac truong nhay cam
 * (password, token...) de khong bao gio bi ghi log.
 */
const REDACT_KEYS = new Set([
  'password', 'password_hash', 'token', 'access_token', 'refresh_token',
  'access_token_ref', 'refresh_token_ref', 'jwt', 'authorization',
]);

function redact(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  const clean = {};
  for (const [key, value] of Object.entries(meta)) {
    clean[key] = REDACT_KEYS.has(key.toLowerCase()) ? '[REDACTED]' : value;
  }
  return clean;
}

function log(level, message, meta) {
  const entry = {
    time: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta: redact(meta) } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
