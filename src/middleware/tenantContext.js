const { acquireTenantClient } = require('../config/db');
const logger = require('../utils/logger');

/**
 * Mo 1 transaction rieng cho request nay, SET LOCAL app.current_user_id
 * de Row Level Security cua Postgres tu dong loc du lieu theo dung tenant
 * (seller) dang dang nhap. req.db se la client dung xuyen suot request.
 *
 * PHAI dat SAU middleware `authenticate` trong chuoi middleware.
 */
function tenantContext(req, res, next) {
  acquireTenantClient(req.user.id)
    .then((client) => {
      req.db = client;

      let settled = false;
      const finalize = async (commit) => {
        if (settled) return;
        settled = true;
        try {
          await client.query(commit ? 'COMMIT' : 'ROLLBACK');
        } catch (err) {
          logger.error('Failed to finalize tenant transaction', { error: err.message });
        } finally {
          client.release();
        }
      };

      res.on('finish', () => finalize(res.statusCode < 400));
      res.on('close', () => finalize(false));

      next();
    })
    .catch(next);
}

module.exports = tenantContext;
