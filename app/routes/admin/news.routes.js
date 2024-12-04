const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/admin/news.controller');
const upload = require('../../middlewares/upload.middlewares'); // Đường dẫn đến file middleware upload


router.get('/add', newsController.viewAdd);
router.post('/add', upload.single('anhchinh'), newsController.add);
router.get('/update/:id', newsController.viewUpdate);
router.post('/update/:id', upload.single('anhchinh'), newsController.update);
router.get('/delete/:id', newsController.delete);
router.get('/', newsController.index);


module.exports = router;