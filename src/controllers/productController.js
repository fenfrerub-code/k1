const asyncHandler = require('../utils/asyncHandler');
const productService = require('../services/productService');

const list = asyncHandler(async (req, res) => {
  res.json(await productService.listProducts(req.db, req.user.id, req.query));
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await productService.getProduct(req.db, req.user.id, req.params.id));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await productService.createProduct(req.db, req.user.id, req.body));
});

const update = asyncHandler(async (req, res) => {
  res.json(await productService.updateProduct(req.db, req.user.id, req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await productService.deleteProduct(req.db, req.user.id, req.params.id));
});

module.exports = { list, getOne, create, update, remove };
