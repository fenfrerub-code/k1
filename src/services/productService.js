const productRepository = require('../repositories/productRepository');
const shopRepository = require('../repositories/shopRepository');
const AppError = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

async function listProducts(db, userId, query) {
  const pagination = parsePagination(query);
  const { rows, total } = await productRepository.findAllByUser(db, userId, {
    search: query.search, shopId: query.shopId, limit: pagination.limit, offset: pagination.offset,
  });
  return { data: rows, pagination: buildPaginationMeta(pagination, total) };
}

async function getProduct(db, userId, productId) {
  const product = await productRepository.findById(db, userId, productId);
  if (!product) throw AppError.notFound('Khong tim thay san pham');
  return product;
}

async function createProduct(db, userId, payload) {
  const shop = await shopRepository.findById(db, userId, payload.shopId);
  if (!shop) throw AppError.validation('shopId khong hop le hoac khong thuoc ve ban');
  return productRepository.create(db, userId, payload);
}

async function updateProduct(db, userId, productId, payload) {
  const updated = await productRepository.update(db, userId, productId, payload);
  if (!updated) throw AppError.notFound('Khong tim thay san pham');
  return updated;
}

async function deleteProduct(db, userId, productId) {
  const deleted = await productRepository.remove(db, userId, productId);
  if (!deleted) throw AppError.notFound('Khong tim thay san pham');
  return { id: deleted.id, deleted: true };
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
