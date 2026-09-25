const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/orderService');

const list = asyncHandler(async (req, res) => {
  res.json(await orderService.listOrders(req.db, req.user.id, req.query));
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await orderService.getOrderDetail(req.db, req.user.id, req.params.id));
});

const create = asyncHandler(async (req, res) => {
  const detail = await orderService.createOrder(req.db, req.user.id, req.body);
  res.status(201).json(detail);
});

const update = asyncHandler(async (req, res) => {
  res.json(await orderService.updateOrder(req.db, req.user.id, req.params.id, req.body));
});

const remove = asyncHandler(async (req, res) => {
  res.json(await orderService.deleteOrder(req.db, req.user.id, req.params.id));
});

const history = asyncHandler(async (req, res) => {
  res.json({ data: await orderService.getOrderHistory(req.db, req.user.id, req.params.id) });
});

const shipment = asyncHandler(async (req, res) => {
  res.json({ data: await orderService.getOrderShipment(req.db, req.user.id, req.params.id) });
});

module.exports = { list, getOne, create, update, remove, history, shipment };
