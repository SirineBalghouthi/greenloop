const express = require('express');
const router = express.Router();
const {
  createVideo,
  getAllVideos,
  getVideoById,
  likeVideo,
  shareVideo,
  deleteVideo
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.single('thumbnail_url'), createVideo);
router.get('/', getAllVideos); // Public
router.get('/:id', getVideoById); // Public
router.post('/:id/like', likeVideo); // Public
router.post('/:id/share', shareVideo); // Public
router.delete('/:id', protect, deleteVideo);

module.exports = router;

