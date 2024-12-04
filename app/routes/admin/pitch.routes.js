const express = require('express');
const router = express.Router();
const pitchController = require('../../controllers/admin/pitch.controller');
const upload = require('../../middlewares/upload.middlewares'); // Đường dẫn đến file middleware upload

router.get('/add', pitchController.viewAdd);
router.post('/add', upload.single('avatar'), pitchController.add);
router.get('/update/:id', pitchController.viewUpdate);
router.post('/update/:id', upload.single('avatar'), pitchController.update);
router.get('/delete/:id', pitchController.delete);
router.get('/:id/facility', pitchController.facility);
router.post('/:id/facility', pitchController.updateFacility);
router.get('/:id/rule', pitchController.rule);
router.post('/:id/rule', pitchController.updateRule);
router.get('/:id/image', pitchController.image);
router.post('/:id/image', upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 }
]), pitchController.updateImage);
router.get('/', pitchController.index);

module.exports = router;