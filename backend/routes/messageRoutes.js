const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getConversations,
  getMessages,
  sendMessage,
  getOrCreateConversation
} = require('../controllers/messageController');

router.get('/conversations', protect, getConversations);
router.get('/conversation/:otherUserId', protect, getOrCreateConversation);
router.get('/:otherUserId', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;