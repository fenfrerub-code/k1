const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const tenantContext = require('../middleware/tenantContext');
const controller = require('../controllers/customerController');

const router = Router();
router.use(authenticate, tenantContext);

/**
 * @openapi
 * /api/customers:
 *   get:
 *     tags: [Customers]
 *     summary: Danh sach khach hang (search theo ten/sdt)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: [Customers]
 *     summary: Tao khach hang moi
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Da tao } }
 */
router.get('/', controller.list);
router.post('/', [body('name').trim().notEmpty()], validate, controller.create);

/**
 * @openapi
 * /api/customers/{id}:
 *   get:
 *     tags: [Customers]
 *     summary: Chi tiet khach hang
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 *   put:
 *     tags: [Customers]
 *     summary: Cap nhat khach hang
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Da cap nhat } }
 */
router.get('/:id', param('id').isUUID(), validate, controller.getOne);
router.put('/:id', param('id').isUUID(), validate, controller.update);

/**
 * @openapi
 * /api/customers/{id}/orders:
 *   get:
 *     tags: [Customers]
 *     summary: Danh sach don hang cua 1 khach hang
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/:id/orders', param('id').isUUID(), validate, controller.orders);

module.exports = router;
