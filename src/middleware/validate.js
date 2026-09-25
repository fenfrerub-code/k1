const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Chay sau cac rule cua express-validator (vd: body('email').isEmail()).
 * Neu co loi validation, gom lai va nem AppError.validation thay vi de
 * controller phai tu kiem tra.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    throw AppError.validation('Du lieu gui len khong hop le', details);
  }
  next();
}

module.exports = validate;
