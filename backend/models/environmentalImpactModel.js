const mongoose = require('mongoose');

const environmentalImpactSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  kg_recycled: {
    type: Number,
    default: 0
  },
  co2_saved: {
    type: Number,
    default: 0
  },
  trees_saved: {
    type: Number,
    default: 0
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: false, updatedAt: 'updated_at' }
});

// Index
environmentalImpactSchema.index({ user_id: 1 });

// Méthode pour ajouter un impact
environmentalImpactSchema.methods.addImpact = function(kg) {
  this.kg_recycled += kg;
  this.co2_saved += kg * 2.5; // Approximation
  this.trees_saved += Math.floor(kg / 10);
  return this;
};

module.exports = mongoose.model('EnvironmentalImpact', environmentalImpactSchema);