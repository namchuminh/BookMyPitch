const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/website/order.controller');

router.get('/', orderController.indexAfterLogin);
router.post('/', orderController.index);
router.post('/thanh-toan', orderController.pay);
router.get('/tra-cuu', orderController.viewLockup);
router.post('/tra-cuu', orderController.lockup);


module.exports = router;