const { Router } = require('express');
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const tenantContext = require('../middleware/tenantContext');
const controller = require('../controllers/shipmentController');

const router = Router();
router.use(authenticate, tenantContext);

/**
 * @openapi
 * /api/shipments:
 *   get:
 *     tags: [Shipments]
 *     summary: Danh sach van don (mock data - sau nay noi SPX/GHN/GHTK/J&T)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/', controller.list);

/**
 * @openapi
 * /api/shipments/{id}:
 *   get:
 *     tags: [Shipments]
 *     summary: Chi tiet van don
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/:id', param('id').isUUID(), validate, controller.getOne);

module.exports = router;
