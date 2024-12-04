const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/admin.controller');

router.get('/', adminController.view);
router.post('/', adminController.update);

module.exports = router;