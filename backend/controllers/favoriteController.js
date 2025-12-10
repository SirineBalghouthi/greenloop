const Favorite = require('../models/favoriteModel');
const Announcement = require('../models/announcementModel');

// Ajouter aux favoris
exports.addFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { announcement_id } = req.body;

    if (!announcement_id) {
      return res.status(400).json({
        success: false,
        message: 'ID de l\'annonce requis'
      });
    }

    // Vérifier que l'annonce existe
    const announcement = await Announcement.findById(announcement_id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Annonce non trouvée'
      });
    }

    // Vérifier si déjà en favoris
    const existing = await Favorite.findOne({ user_id: userId, announcement_id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Déjà dans vos favoris'
      });
    }

    const favorite = await Favorite.create({
      user_id: userId,
      announcement_id
    });

    res.status(201).json({
      success: true,
      message: 'Ajouté aux favoris',
      favorite
    });
  } catch (error) {
    console.error('Erreur addFavorite:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Déjà dans vos favoris'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout aux favoris'
    });
  }
};

// Retirer des favoris
exports.removeFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user_id: userId,
      announcement_id: id
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favori non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Retiré des favoris'
    });
  } catch (error) {
    console.error('Erreur removeFavorite:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

// Obtenir tous les favoris de l'utilisateur
exports.getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const favorites = await Favorite.find({ user_id: userId })
      .populate({
        path: 'announcement_id',
        populate: {
          path: 'user_id',
          select: 'full_name phone user_type'
        }
      })
      .sort({ created_at: -1 });

    const formattedFavorites = favorites
      .filter(fav => fav.announcement_id) // Filtrer les annonces supprimées
      .map(fav => ({
        id: fav._id,
        announcement_id: fav.announcement_id._id,
        created_at: fav.created_at,
        announcement: {
          id: fav.announcement_id._id,
          title: fav.announcement_id.title,
          description: fav.announcement_id.description,
          waste_type: fav.announcement_id.waste_type,
          quantity: fav.announcement_id.quantity,
          image_url: fav.announcement_id.image_url,
          latitude: fav.announcement_id.latitude,
          longitude: fav.announcement_id.longitude,
          address: fav.announcement_id.address,
          status: fav.announcement_id.status,
          user_name: fav.announcement_id.user_id?.full_name,
          phone: fav.announcement_id.user_id?.phone,
          user_type: fav.announcement_id.user_id?.user_type,
          created_at: fav.announcement_id.created_at
        }
      }));

    res.json({
      success: true,
      count: formattedFavorites.length,
      favorites: formattedFavorites
    });
  } catch (error) {
    console.error('Erreur getMyFavorites:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris'
    });
  }
};

// Vérifier si une annonce est en favoris
exports.checkFavorite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const favorite = await Favorite.findOne({
      user_id: userId,
      announcement_id: id
    });

    res.json({
      success: true,
      isFavorite: !!favorite
    });
  } catch (error) {
    console.error('Erreur checkFavorite:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
};

