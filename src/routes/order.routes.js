const { Router } = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const tenantContext = require('../middleware/tenantContext');
const orderStatusService = require('../services/orderStatusService');
const controller = require('../controllers/orderController');

const router = Router();
router.use(authenticate, tenantContext);

/**
 * @openapi
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Danh sach don hang (pagination + search + filter + sort)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { name: page, in: query, schema: { type: integer } }
 *       - { name: limit, in: query, schema: { type: integer } }
 *       - { name: status, in: query, schema: { type: string } }
 *       - { name: platform, in: query, schema: { type: string }, description: "ma san, vd shopee" }
 *       - { name: shopId, in: query, schema: { type: string } }
 *       - { name: search, in: query, schema: { type: string }, description: "tim theo ma don hoac ten khach" }
 *       - { name: dateFrom, in: query, schema: { type: string, format: date } }
 *       - { name: dateTo, in: query, schema: { type: string, format: date } }
 *       - { name: sortBy, in: query, schema: { type: string, enum: [order_created_at, total_amount, status] } }
 *       - { name: sortDir, in: query, schema: { type: string, enum: [asc, desc] } }
 *     responses: { 200: { description: "{ data, pagination }" } }
 *   post:
 *     tags: [Orders]
 *     summary: Tao don hang thu cong
 *     security: [{ bearerAuth: [] }]
 *     responses: { 201: { description: Da tao don hang } }
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('status').optional().isIn(orderStatusService.STATUSES),
    query('sortDir').optional().isIn(['asc', 'desc']),
  ],
  validate,
  controller.list
);
router.post(
  '/',
  [
    body('shopId').isUUID().withMessage('shopId phai la UUID hop le'),
    body('items').optional().isArray(),
    body('totalAmount').optional().isFloat({ min: 0 }),
    body('status').optional().isIn(orderStatusService.STATUSES),
  ],
  validate,
  controller.create
);

/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Chi tiet don hang (order, customer, items, shipment, status history)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ name: id, in: path, required: true, schema: { type: string } }]
 *     responses: { 200: { description: OK }, 404: { description: Khong tim thay } }
 *   put:
 *     tags: [Orders]
 *     summary: Cap nhat don hang (doi status se tu dong ghi status history + kiem tra transition hop le)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Da cap nhat }, 409: { description: Chuyen trang thai khong hop le } }
 *   delete:
 *     tags: [Orders]
 *     summary: Xoa don hang
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Da xoa } }
 */
router.get('/:id', param('id').isUUID(), validate, controller.getOne);
router.put(
  '/:id',
  [param('id').isUUID(), body('status').optional().isIn(orderStatusService.STATUSES)],
  validate,
  controller.update
);
router.delete('/:id', param('id').isUUID(), validate, controller.remove);

/**
 * @openapi
 * /api/orders/{id}/history:
 *   get:
 *     tags: [Orders]
 *     summary: Lich su trang thai cua don hang
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/:id/history', param('id').isUUID(), validate, controller.history);

/**
 * @openapi
 * /api/orders/{id}/shipment:
 *   get:
 *     tags: [Orders]
 *     summary: Thong tin van chuyen cua don hang
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/:id/shipment', param('id').isUUID(), validate, controller.shipment);

module.exports = router;
