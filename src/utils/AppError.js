/**
 * Loi nghiep vu co the du doan (khac voi loi he thong/bug).
 * Moi loi co statusCode HTTP tuong ung + code ngan de frontend xu ly.
 */
class AppError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static unauthorized(message = 'Ban chua dang nhap hoac phien da het han') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Ban khong co quyen truy cap tai nguyen nay') {
    return new AppError(message, 403, 'FORBIDDEN');
  }
  static notFound(message = 'Khong tim thay du lieu') {
    return new AppError(message, 404, 'NOT_FOUND');
  }
  static validation(message = 'Du lieu khong hop le', details) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }
  static conflict(message = 'Du lieu bi trung') {
    return new AppError(message, 409, 'CONFLICT');
  }
  static invalidStatusTransition(from, to) {
    return new AppError(
      `Khong the chuyen trang thai tu "${from}" sang "${to}"`,
      409,
      'INVALID_STATUS_TRANSITION'
    );
  }
  static integration(message = 'Loi ket noi voi nen tang ben thu ba') {
    return new AppError(message, 502, 'INTEGRATION_ERROR');
  }
  static database(message = 'Loi database') {
    return new AppError(message, 500, 'DATABASE_ERROR');
  }
}

module.exports = AppError;
