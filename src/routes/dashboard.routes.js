const { Router } = require('express');
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const tenantContext = require('../middleware/tenantContext');
const controller = require('../controllers/dashboardController');

const router = Router();
router.use(authenticate, tenantContext);

const rangeValidator = query('range').optional().isIn(['today', '7_days', '30_days', 'custom']);

/**
 * @openapi
 * /api/dashboard/summary:
 *   get:
 *     tags: [Dashboard]
 *     summary: So lieu tong quan (tong don, theo trang thai, tong gia tri)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: range, in: query, schema: { type: string, enum: [today, 7_days, 30_days, custom] } }
 *       - { name: dateFrom, in: query, schema: { type: string, format: date } }
 *       - { name: dateTo, in: query, schema: { type: string, format: date } }
 *     responses: { 200: { description: OK } }
 */
router.get('/summary', rangeValidator, validate, controller.summary);

/**
 * @openapi
 * /api/dashboard/platforms:
 *   get:
 *     tags: [Dashboard]
 *     summary: Thong ke theo tung nen tang (Shopee/TikTok Shop/Lazada)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/platforms', rangeValidator, validate, controller.byPlatform);

/**
 * @openapi
 * /api/dashboard/orders-over-time:
 *   get:
 *     tags: [Dashboard]
 *     summary: Du lieu ve bieu do so luong don theo ngay/tuan/thang
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: granularity, in: query, schema: { type: string, enum: [day, week, month] } }
 *     responses: { 200: { description: OK } }
 */
router.get('/orders-over-time', rangeValidator, validate, controller.ordersOverTime);

module.exports = router;
