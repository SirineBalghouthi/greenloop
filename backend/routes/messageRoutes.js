const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Message = require('../models/messageModel');

// Obtenir toutes les conversations
router.get('/conversations', protect, async (req, res) => {
  try {
    const userId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    })
    .populate('sender_id', 'full_name')
    .populate('receiver_id', 'full_name')
    .sort({ created_at: -1 });

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Erreur conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations'
    });
  }
});

// Envoyer un message
router.post('/send', protect, async (req, res) => {
  try {
    const { receiver_id, message, announcement_id } = req.body;
    const sender_id = req.user.userId;

    const newMessage = await Message.create({
      sender_id,
      receiver_id,
      message,
      announcement_id
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender_id', 'full_name')
      .populate('receiver_id', 'full_name');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Erreur send message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
});

// Marquer comme lu
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { is_read: true });

    res.json({
      success: true,
      message: 'Message marqué comme lu'
    });
  } catch (error) {
    console.error('Erreur mark read:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
});

module.exports = router;