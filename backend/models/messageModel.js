const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  announcement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement'
  },
  message: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Index pour recherche rapide
messageSchema.index({ sender_id: 1, receiver_id: 1 });
messageSchema.index({ created_at: -1 });
messageSchema.index({ is_read: 1 });

module.exports = mongoose.model('Message', messageSchema);