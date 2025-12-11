const express = require('express');
const router = express.Router();
const { 
  createAnnouncement, 
  getAllAnnouncements, 
  getAnnouncementById,
  reserveAnnouncement,
  confirmCollection,
  deleteAnnouncement,
  getMyAnnouncements,
  updateAnnouncementStatus,
  getQRCode,
  scanQRCode,
  classifyAnnouncement
} = require('../controllers/announcementController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('image'), createAnnouncement);
router.post('/classify', protect, classifyAnnouncement);
router.get('/', protect, getAllAnnouncements);
router.get('/my-announcements', protect, getMyAnnouncements);
router.get('/:id', protect, getAnnouncementById);
router.post('/:id/reserve', protect, reserveAnnouncement);
router.post('/:id/confirm', protect, confirmCollection);
router.get('/:id/qrcode', protect, getQRCode);
router.post('/scan-qrcode', protect, scanQRCode);
router.patch('/:id/status', protect, updateAnnouncementStatus);
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;