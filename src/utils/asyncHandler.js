// Boc controller async de tu dong bat loi va chuyen cho errorHandler,
// khong can try/catch lap lai o moi controller.
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
