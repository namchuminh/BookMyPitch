const express = require('express');
const router = express.Router();
const logoutController = require('../../controllers/admin/logout.controller');

router.get('/', logoutController.logout);

module.exports = router;