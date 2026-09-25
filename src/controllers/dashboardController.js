const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboardService');

const summary = asyncHandler(async (req, res) => {
  res.json(await dashboardService.getSummary(req.db, req.user.id, req.query));
});

const byPlatform = asyncHandler(async (req, res) => {
  res.json({ data: await dashboardService.getByPlatform(req.db, req.user.id, req.query) });
});

const ordersOverTime = asyncHandler(async (req, res) => {
  res.json({ data: await dashboardService.getOrdersOverTime(req.db, req.user.id, req.query) });
});

module.exports = { summary, byPlatform, ordersOverTime };
