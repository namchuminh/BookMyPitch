const express = require('express');
const router = express.Router();
const loginController = require('../../controllers/admin/login.controller');

router.get('/', loginController.viewLogin);
router.post('/', loginController.login);


module.exports = router;