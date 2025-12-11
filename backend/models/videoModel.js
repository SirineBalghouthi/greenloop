const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  video_url: {
    type: String,
    default: ''
  },
  thumbnail_url: {
    type: String
  },
  category: {
    type: String,
    enum: ['tutoriel_diy', 'avant_apres', 'guide_tri', 'impact_environnemental', 'temoignage'],
    required: [true, 'La catégorie est requise']
  },
  waste_type: {
    type: String,
    enum: ['medicaments', 'plastiques', 'piles', 'textiles', 'electronique', 'tous'],
    default: 'tous'
  },
  duration: {
    type: Number, // en secondes
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true
  }],
  is_offline_available: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index pour recherche
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ category: 1 });
videoSchema.index({ waste_type: 1 });
videoSchema.index({ created_at: -1 });

module.exports = mongoose.model('Video', videoSchema);

