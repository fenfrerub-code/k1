const shopRepository = require('../repositories/shopRepository');
const AppError = require('../utils/AppError');

async function listShops(db, userId) {
  return shopRepository.findAllByUser(db, userId);
}

async function getShop(db, userId, shopId) {
  const shop = await shopRepository.findById(db, userId, shopId);
  if (!shop) throw AppError.notFound('Khong tim thay shop');
  return shop;
}

async function createShop(db, userId, { platformCode, shopName, externalShopId }) {
  const platform = await shopRepository.findPlatformByCode(db, platformCode);
  if (!platform) throw AppError.validation(`Nen tang "${platformCode}" khong ton tai`);
  return shopRepository.create(db, userId, { platformId: platform.id, shopName, externalShopId });
}

async function updateShop(db, userId, shopId, fields) {
  const updated = await shopRepository.update(db, userId, shopId, fields);
  if (!updated) throw AppError.notFound('Khong tim thay shop');
  return updated;
}

async function deleteShop(db, userId, shopId) {
  const deleted = await shopRepository.softDelete(db, userId, shopId);
  if (!deleted) throw AppError.notFound('Khong tim thay shop');
  return { id: deleted.id, deleted: true };
}

module.exports = { listShops, getShop, createShop, updateShop, deleteShop };
