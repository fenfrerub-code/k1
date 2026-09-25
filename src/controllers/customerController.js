const asyncHandler = require('../utils/asyncHandler');
const customerService = require('../services/customerService');

const list = asyncHandler(async (req, res) => {
  res.json({ data: await customerService.listCustomers(req.db, req.user.id, req.query) });
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await customerService.getCustomer(req.db, req.user.id, req.params.id));
});

const orders = asyncHandler(async (req, res) => {
  res.json(await customerService.getCustomerOrders(req.db, req.user.id, req.params.id, req.query));
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json(await customerService.createCustomer(req.db, req.user.id, req.body));
});

const update = asyncHandler(async (req, res) => {
  res.json(await customerService.updateCustomer(req.db, req.user.id, req.params.id, req.body));
});

module.exports = { list, getOne, orders, create, update };
