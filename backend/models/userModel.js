const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Le numéro de téléphone est requis'],
    unique: true,
    trim: true
  },
  password: { 
    type: String, 
    required: false, // Optionnel pour les utilisateurs SMS
    select: false // Ne pas inclure par défaut dans les requêtes
  },
  full_name: {
    type: String,
    required: false, // Optionnel pour les utilisateurs temporaires (sera rempli lors de l'inscription)
    trim: true,
    default: 'Utilisateur Temporaire'
  },
  user_type: {
    type: String,
    enum: ['deposant', 'collecteur', 'entreprise', 'point_collecte','admin'],
    default: 'deposant'
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: String,
    enum: ['bronze', 'argent', 'or', 'platine'],
    default: 'bronze'
  },
  verification_code: {
    type: String
  },
  verification_code_expires: {
    type: Date
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  profile_picture: {
    type: String
  },
  is_online: {
    type: Boolean,
    default: false
  },
  last_seen: {
    type: Date,
    default: Date.now
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

// Index pour recherche rapide
userSchema.index({ phone: 1 });
userSchema.index({ user_type: 1 });
userSchema.index({ city: 1 });

// Méthode pour calculer le niveau basé sur les points
userSchema.methods.calculateLevel = function() {
  if (this.points >= 5000) this.level = 'platine';
  else if (this.points >= 2001) this.level = 'or';
  else if (this.points >= 501) this.level = 'argent';
  else this.level = 'bronze';
  return this.level;
};

// Hook pre-save pour mettre à jour le niveau
userSchema.pre('save', function(next) {
  if (this.isModified('points')) {
    this.calculateLevel();
  }
  next();
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);