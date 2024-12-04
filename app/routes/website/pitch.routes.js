const express = require('express');
const router = express.Router();
const pitchController = require('../../controllers/website/pitch.controller');

router.get('/:id', pitchController.viewDetail);
router.get('/', pitchController.viewAll);


module.exports = router;