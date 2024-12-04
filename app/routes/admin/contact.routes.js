const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/admin/contact.controller');

router.get('/view/:id', contactController.view);
router.get('/', contactController.index);

module.exports = router;