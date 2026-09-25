const asyncHandler = require('../utils/asyncHandler');
const shopService = require('../services/shopService');
const syncService = require('../services/syncService');

const list = asyncHandler(async (req, res) => {
  res.json({ data: await shopService.listShops(req.db, req.user.id) });
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await shopService.getShop(req.db, req.user.id, req.params.id));
});

const create = asyncHandler(async (req, res) => {
  const shop = await shopService.createShop(req.db, req.user.id, req.body);
  res.status(201).json(shop);
});

const update = asyncHandler(async (req, res) => {
  res.json(await shopService.updateShop(req.db, req.user.id, req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await shopService.deleteShop(req.db, req.user.id, req.params.id));
});

const sync = asyncHandler(async (req, res) => {
  res.json(await syncService.syncShop(req.db, req.user.id, req.params.id));
});

module.exports = { list, getOne, create, update, remove, sync };
