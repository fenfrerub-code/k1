const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = Router();
router.use(authenticate);

/**
 * @openapi
 * /api/me:
 *   get:
 *     tags: [User]
 *     summary: Lay thong tin user dang dang nhap (tu JWT)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
router.get('/', authController.me);

/**
 * @openapi
 * /api/me/profile:
 *   get:
 *     tags: [User]
 *     summary: Lay ho so chi tiet cua user hien tai
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 *   put:
 *     tags: [User]
 *     summary: Cap nhat ho so (chi name/phone - khong sua duoc user_id/role)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *     responses: { 200: { description: Da cap nhat } }
 */
router.get('/profile', userController.getProfile);
router.put(
  '/profile',
  [body('name').optional().trim().notEmpty(), body('phone').optional().isString()],
  validate,
  userController.updateProfile
);

module.exports = router;
