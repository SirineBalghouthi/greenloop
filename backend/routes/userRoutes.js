const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Obtenir les statistiques d'un utilisateur
router.get('/stats', protect, async (req, res) => {
  try {
    const User = require('../models/userModel');
    const Announcement = require('../models/announcementModel');
    const Collection = require('../models/collectionModel');
    const EnvironmentalImpact = require('../models/environmentalImpactModel');

    const userId = req.user.userId;

    // Compter les annonces
    const announcementsCount = await Announcement.countDocuments({ user_id: userId });

    // Compter les collectes
    const collectionsCount = await Collection.countDocuments({ 
      collector_id: userId,
      status: 'completee'
    });

    // Récupérer l'impact environnemental
    const impact = await EnvironmentalImpact.findOne({ user_id: userId });

    // Récupérer l'utilisateur
    const user = await User.findById(userId);

    res.json({
      success: true,
      stats: {
        announcements_count: announcementsCount,
        collections_count: collectionsCount,
        points: user?.points || 0,
        level: user?.level || 'bronze',
        kg_recycled: impact?.kg_recycled || 0,
        co2_saved: impact?.co2_saved || 0,
        trees_saved: impact?.trees_saved || 0
      }
    });
  } catch (error) {
    console.error('Erreur stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});

module.exports = router;