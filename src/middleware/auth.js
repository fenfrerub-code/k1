const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware xac thuc: doc Bearer token tu header Authorization,
 * verify chu ky JWT, va gan req.user = { id, email }.
 * Phai chay TRUOC middleware tenantContext (tenantContext can req.user.id).
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw AppError.unauthorized('Thieu access token. Hay gui header Authorization: Bearer <token>');
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    throw AppError.unauthorized('Access token khong hop le hoac da het han');
  }
});

module.exports = { authenticate };
