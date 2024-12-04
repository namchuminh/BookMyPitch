const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/order.controller');

router.get('/:id/action/:action', orderController.action);
router.get('/:id/paid/:action', orderController.paid);
router.get('/:id', orderController.view);
router.get('/print/:id', orderController.print);
router.get('/', orderController.index);

module.exports = router;