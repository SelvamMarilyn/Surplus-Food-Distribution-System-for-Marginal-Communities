const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/login', adminController.login);
router.get('/donors', adminController.getDonors);
router.post('/approve-donor/:id', adminController.approve);
router.post('/reject-donor/:id', adminController.reject);
router.get('/all-donors', adminController.getAllDonors);
router.post('/block-donor/:id', adminController.block);
router.delete('/delete-donor/:id', adminController.remove);
router.post('/unblock-donor/:id', adminController.unblock);
router.get('/ngos', adminController.getNgos);
router.post('/approve-ngo/:id', adminController.approveNgoController);
router.post('/reject-ngo/:id', adminController.rejectNgoController);
router.post('/block-ngo/:id', adminController.blockNgoController);
router.post('/unblock-ngo/:id', adminController.unblockNgoController);
router.delete('/delete-ngo/:id', adminController.deleteNgoController);


module.exports = router;
