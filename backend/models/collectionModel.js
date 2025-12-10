const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  announcement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Announcement',
    required: true
  },
  collector_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deposant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['en_attente', 'completee', 'annulee'],
    default: 'en_attente'
  },
  kg_collected: {
    type: Number
  },
  collected_at: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

// Index
collectionSchema.index({ announcement_id: 1 });
collectionSchema.index({ collector_id: 1 });
collectionSchema.index({ deposant_id: 1 });
collectionSchema.index({ status: 1 });

module.exports = mongoose.model('Collection', collectionSchema);