const express = require('express');
const router = express.Router();
const contactController = require('../../controllers/website/contact.controller');
const {requireLogin} = require('../../middlewares/customerAuth.middlewares');

router.post('/post', requireLogin, contactController.postContact);
router.get('/', contactController.index);

module.exports = router;