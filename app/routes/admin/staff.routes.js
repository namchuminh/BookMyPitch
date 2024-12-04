const express = require('express');
const router = express.Router();
const staffController = require('../../controllers/admin/staff.controller');

router.get('/add', staffController.add);
router.post('/add', staffController.store);
router.get('/delete/:id', staffController.destroy);
router.get('/profile', staffController.profile);
router.post('/profile', staffController.changePassword);
router.get('/', staffController.index);

module.exports = router;