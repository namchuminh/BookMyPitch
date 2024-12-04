const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/admin/customer.controller');

router.get('/is-owner/:id', customerController.owner);
router.get('/', customerController.index);

module.exports = router;