const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  announcement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Index pour éviter les doublons
favoriteSchema.index({ user_id: 1, announcement_id: 1 }, { unique: true });
favoriteSchema.index({ user_id: 1 });
favoriteSchema.index({ announcement_id: 1 });

module.exports = mongoose.model('Favorite', favoriteSchema);

