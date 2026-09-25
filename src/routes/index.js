const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/me', require('./user.routes'));
router.use('/shops', require('./shop.routes'));
router.use('/orders', require('./order.routes'));
router.use('/customers', require('./customer.routes'));
router.use('/products', require('./product.routes'));
router.use('/shipments', require('./shipment.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
