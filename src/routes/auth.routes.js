const { Router } = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/authController');

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Dang ky tai khoan seller moi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *               phone: { type: string }
 *     responses:
 *       201: { description: Dang ky thanh cong, tra ve user + JWT token }
 *       409: { description: Email da ton tai }
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email khong hop le').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Mat khau toi thieu 8 ky tu'),
    body('name').trim().notEmpty().withMessage('Ten khong duoc de trong'),
    body('phone').optional().isString(),
  ],
  validate,
  controller.register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Dang nhap
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Dang nhap thanh cong, tra ve user + JWT token }
 *       401: { description: Sai email hoac mat khau }
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email khong hop le').normalizeEmail(),
    body('password').notEmpty().withMessage('Vui long nhap mat khau'),
  ],
  validate,
  controller.login
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Dang xuat (client tu xoa JWT - endpoint chi de log lai)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Da dang xuat }
 */
router.post('/logout', authenticate, controller.logout);

module.exports = router;
