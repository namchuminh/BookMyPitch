const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/category.controller');
const upload = require('../../middlewares/upload.middlewares'); // Đường dẫn đến file middleware upload

router.get('/add', categoryController.viewAdd);
router.post('/add', upload.single('avatar'), categoryController.add);
router.get('/update/:id', categoryController.viewUpdate);
router.post('/update/:id', upload.single('avatar'), categoryController.update);
router.get('/delete/:id', categoryController.delete);
router.get('/', categoryController.index);

module.exports = router;