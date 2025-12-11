const mongoose = require('mongoose');

const seedSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  current_stage: {
    type: String,
    enum: ['seed', 'sprout', 'plant', 'tree'],
    default: 'seed'
  },
  points: {
    type: Number,
    default: 0
  },
  growth_history: [{
    stage: String,
    points_required: Number,
    achieved_at: Date
  }],
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Méthode pour calculer le stage basé sur les points
seedSchema.methods.calculateStage = function() {
  if (this.points >= 5000) return 'tree';
  if (this.points >= 2001) return 'plant';
  if (this.points >= 501) return 'sprout';
  return 'seed';
};

// Méthode pour mettre à jour le stage
seedSchema.methods.updateStage = function(newPoints) {
  this.points = newPoints;
  const newStage = this.calculateStage();
  
  if (newStage !== this.current_stage) {
    this.growth_history.push({
      stage: newStage,
      points_required: newPoints,
      achieved_at: new Date()
    });
    this.current_stage = newStage;
    this.last_updated = new Date();
    return true; // Stage changed
  }
  
  this.last_updated = new Date();
  return false; // No change
};

seedSchema.index({ user_id: 1 });

module.exports = mongoose.model('Seed', seedSchema);

