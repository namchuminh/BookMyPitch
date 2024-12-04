const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/website/news.controller');

router.get('/:id', newsController.viewDetail);
router.get('/', newsController.viewAll);


module.exports = router;