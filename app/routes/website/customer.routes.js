const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/website/customer.controller');
const {requireLogin, requireLogout} = require('../../middlewares/customerAuth.middlewares');

router.get('/dang-nhap', requireLogout, customerController.viewLogin);
router.post('/dang-nhap', requireLogout, customerController.login);
router.get('/dang-ky', requireLogout, customerController.viewRegister);
router.post('/dang-ky', requireLogout, customerController.register);
router.post('/update', requireLogin, customerController.update);
router.get('/dang-xuat', customerController.logout);
router.get('/dang-ky-chu-san', requireLogin, customerController.registerOwner);
router.get('/dang-ky-chu-san/gui-yeu-cau', requireLogin, customerController.registerOwnerPedding);
router.get('/', requireLogin, customerController.index);



module.exports = router;