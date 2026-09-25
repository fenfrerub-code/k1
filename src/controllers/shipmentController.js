const asyncHandler = require('../utils/asyncHandler');
const shipmentService = require('../services/shipmentService');

const list = asyncHandler(async (req, res) => {
  res.json(await shipmentService.listShipments(req.db, req.user.id, req.query));
});

const getOne = asyncHandler(async (req, res) => {
  res.json(await shipmentService.getShipment(req.db, req.user.id, req.params.id));
});

module.exports = { list, getOne };
