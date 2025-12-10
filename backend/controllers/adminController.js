const User = require('../models/userModel');
const Announcement = require('../models/announcementModel');
const Collection = require('../models/collectionModel');
const EnvironmentalImpact = require('../models/environmentalImpactModel');

// Dashboard - Statistiques générales
exports.getDashboardStats = async (req, res) => {
  try {
    // Compter les utilisateurs
    const totalUsers = await User.countDocuments();
    const deposantsCount = await User.countDocuments({ user_type: 'deposant' });
    const collecteursCount = await User.countDocuments({ user_type: 'collecteur' });
    const recycleursCount = await User.countDocuments({ user_type: 'recycleur' });
    const newUsersThisMonth = await User.countDocuments({
      created_at: { $gte: new Date(new Date().setDate(1)) }
    });

    // Compter les annonces
    const totalAnnouncements = await Announcement.countDocuments();
    const activeAnnouncements = await Announcement.countDocuments({ status: 'disponible' });
    const completedAnnouncements = await Announcement.countDocuments({ status: 'collecte' });

    // Compter les collectes
    const totalCollections = await Collection.countDocuments();
    const completedCollections = await Collection.countDocuments({ status: 'termine' });

    // Impact environnemental total
    const environmentalImpact = await EnvironmentalImpact.aggregate([
      {
        $group: {
          _id: null,
          totalKgRecycled: { $sum: '$kg_recycled' },
          totalCo2Saved: { $sum: '$co2_saved' },
          totalTreesSaved: { $sum: '$trees_saved' }
        }
      }
    ]);

    const impact = environmentalImpact[0] || {
      totalKgRecycled: 0,
      totalCo2Saved: 0,
      totalTreesSaved: 0
    };

    // Statistiques par type de déchet
    const wasteTypeStats = await Announcement.aggregate([
      {
        $group: {
          _id: '$waste_type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Évolution des utilisateurs (derniers 6 mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { created_at: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$created_at' },
            month: { $month: '$created_at' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          deposants: deposantsCount,
          collecteurs: collecteursCount,
          recycleurs: recycleursCount,
          newThisMonth: newUsersThisMonth
        },
        announcements: {
          total: totalAnnouncements,
          active: activeAnnouncements,
          completed: completedAnnouncements
        },
        collections: {
          total: totalCollections,
          completed: completedCollections
        },
        environmentalImpact: impact,
        wasteTypeStats,
        userGrowth
      }
    });
  } catch (error) {
    console.error('Erreur getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Gestion des utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && role !== 'all') query.user_type = role;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erreur getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// Bloquer/Débloquer un utilisateur
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ne pas permettre de bloquer un admin
    if (user.user_type === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de modifier le statut d\'un administrateur'
      });
    }

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();

    res.json({
      success: true,
      message: `Utilisateur ${user.status === 'blocked' ? 'bloqué' : 'débloqué'} avec succès`,
      user: {
        id: user._id,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Erreur toggleUserStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du statut',
      error: error.message
    });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Ne pas permettre de supprimer un admin
    if (user.user_type === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Impossible de supprimer un administrateur'
      });
    }

    // Supprimer aussi ses annonces et données liées
    await Announcement.deleteMany({ user_id: userId });
    await Collection.deleteMany({ collector_id: userId });
    await EnvironmentalImpact.deleteOne({ user_id: userId });
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Utilisateur et ses données supprimés avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Gestion des annonces
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { waste_type, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (waste_type && waste_type !== 'all') query.waste_type = waste_type;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const announcements = await Announcement.find(query)
      .populate('user_id', 'full_name phone user_type')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Announcement.countDocuments(query);

    res.json({
      success: true,
      announcements,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Erreur getAllAnnouncements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des annonces',
      error: error.message
    });
  }
};

// Supprimer une annonce
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;

    const announcement = await Announcement.findByIdAndDelete(announcementId);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Annonce supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteAnnouncement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Obtenir les détails d'un utilisateur
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const announcements = await Announcement.countDocuments({ user_id: userId });
    const collections = await Collection.countDocuments({ collector_id: userId });
    const impact = await EnvironmentalImpact.findOne({ user_id: userId });

    res.json({
      success: true,
      user,
      stats: {
        announcements,
        collections,
        impact: impact || { kg_recycled: 0, co2_saved: 0, trees_saved: 0 }
      }
    });
  } catch (error) {
    console.error('Erreur getUserDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des détails',
      error: error.message
    });
  }
};