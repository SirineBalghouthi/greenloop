const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  waste_type: {
    type: String,
    enum: ['medicaments', 'plastiques', 'piles', 'textiles', 'electronique'],
    required: [true, 'Le type de déchet est requis']
  },
  quantity: {
    type: String,
    trim: true
  },
  image_url: {
    type: String
  },
  latitude: {
    type: Number,
    required: [true, 'La latitude est requise']
  },
  longitude: {
    type: Number,
    required: [true, 'La longitude est requise']
  },
  address: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['disponible', 'reserve', 'collecte'],
    default: 'disponible'
  },
  reserved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reserved_until: {
    type: Date
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

// Index géospatial pour recherche par distance
announcementSchema.index({ latitude: 1, longitude: 1 });
announcementSchema.index({ waste_type: 1 });
announcementSchema.index({ status: 1 });
announcementSchema.index({ user_id: 1 });
announcementSchema.index({ created_at: -1 });

// Méthode pour vérifier si la réservation est expirée
announcementSchema.methods.isReservationExpired = function() {
  if (!this.reserved_until) return false;
  return new Date() > this.reserved_until;
};

// Hook pre-save pour vérifier les réservations expirées
announcementSchema.pre('save', function(next) {
  if (this.status === 'reserve' && this.isReservationExpired()) {
    this.status = 'disponible';
    this.reserved_by = null;
    this.reserved_until = null;
  }
  next();
});

module.exports = mongoose.model('Announcement', announcementSchema);