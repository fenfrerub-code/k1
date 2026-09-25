const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { isProduction } = require('../config/env');

/**
 * Xu ly loi tap trung - MOI loi trong app deu di qua day.
 * Khong bao gio tra stack trace / chi tiet ky thuat ve cho client khi production.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    logger.warn('Handled error', {
      code: err.code, path: req.path, method: req.method, message: err.message,
    });
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }

  // Loi khoa duy nhat / khoa ngoai tu Postgres -> tra ve dang loi nghiep vu de dang hieu
  if (err.code === '23505') {
    return res.status(409).json({ error: { code: 'DUPLICATE', message: 'Du lieu da ton tai (vi pham unique constraint)' } });
  }
  if (err.code === '23503') {
    return res.status(422).json({ error: { code: 'INVALID_REFERENCE', message: 'Tham chieu khong hop le (foreign key)' } });
  }

  logger.error('Unhandled error', {
    path: req.path, method: req.method, message: err.message, stack: err.stack,
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Da xay ra loi he thong. Vui long thu lai sau.',
      ...(isProduction ? {} : { debug: err.message }),
    },
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: `Khong tim thay route ${req.method} ${req.path}` } });
}

module.exports = { errorHandler, notFoundHandler };
