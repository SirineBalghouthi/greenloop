const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware pour vérifier que l'utilisateur est admin
exports.isAdmin = async (req, res, next) => {
  try {
    // Vérifier le token (déjà fait par protect middleware)
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'utilisateur est admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur de vérification des droits',
      error: error.message
    });
  }
};