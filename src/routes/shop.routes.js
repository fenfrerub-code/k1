const { Router } = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const tenantContext = require('../middleware/tenantContext');
const controller = require('../controllers/shopController');

const router = Router();
router.use(authenticate, tenantContext);

/**
 * @openapi
 * /api/shops:
 *   get:
 *     tags: [Shops]
 *     summary: Danh sach shop cua user hien tai
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 *   post:
 *     tags: [Shops]
 *     summary: Ket noi 1 shop moi (MVP - luu ban ghi, chua goi OAuth that)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [platformCode, shopName]
 *             properties:
 *               platformCode: { type: string, example: shopee }
 *               shopName: { type: string }
 *               externalShopId: { type: string }
 *     responses: { 201: { description: Da tao shop } }
 */
router.get('/', controller.list);
router.post(
  '/',
  [
    body('platformCode').isString().notEmpty(),
    body('shopName').trim().notEmpty(),
    body('externalShopId').optional().isString(),
  ],
  validate,
  controller.create
);

/**
 * @openapi
 * /api/shops/{id}:
 *   get:
 *     tags: [Shops]
 *     summary: Chi tiet 1 shop
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK }, 404: { description: Khong tim thay } }
 *   put:
 *     tags: [Shops]
 *     summary: Cap nhat shop
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Da cap nhat } }
 *   delete:
 *     tags: [Shops]
 *     summary: Xoa mem shop (giu lai orders lien quan)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Da xoa } }
 */
router.get('/:id', param('id').isUUID(), validate, controller.getOne);
router.put(
  '/:id',
  [param('id').isUUID(), body('shopName').optional().trim().notEmpty(), body('status').optional().isIn(['connected', 'disconnected', 'error'])],
  validate,
  controller.update
);
router.delete('/:id', param('id').isUUID(), validate, controller.remove);

/**
 * @openapi
 * /api/shops/{id}/sync:
 *   post:
 *     tags: [Shops]
 *     summary: Dong bo don hang/san pham cho shop (hien dung MockIntegrationAdapter)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: Ket qua dong bo } }
 */
router.post('/:id/sync', param('id').isUUID(), validate, controller.sync);

module.exports = router;
