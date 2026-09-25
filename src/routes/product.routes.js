const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const tenantContext = require('../middleware/tenantContext');
const controller = require('../controllers/productController');

const router = Router();
router.use(authenticate, tenantContext);

/**
 * @openapi
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Danh sach san pham (search + filter shop + pagination)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: [Products]
 *     summary: Tao san pham
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Da tao } }
 */
router.get('/', controller.list);
router.post(
  '/',
  [body('shopId').isUUID(), body('name').trim().notEmpty(), body('price').isFloat({ min: 0 })],
  validate,
  controller.create
);

/**
 * @openapi
 * /api/products/{id}:
 *   get: { tags: [Products], summary: Chi tiet san pham, security: [{ bearerAuth: [] }], responses: { 200: { description: OK } } }
 *   put: { tags: [Products], summary: Cap nhat san pham, security: [{ bearerAuth: [] }], responses: { 200: { description: Da cap nhat } } }
 *   delete: { tags: [Products], summary: Xoa san pham, security: [{ bearerAuth: [] }], responses: { 200: { description: Da xoa } } }
 */
router.get('/:id', param('id').isUUID(), validate, controller.getOne);
router.put('/:id', param('id').isUUID(), validate, controller.update);
router.delete('/:id', param('id').isUUID(), validate, controller.remove);

module.exports = router;
