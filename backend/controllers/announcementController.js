const Announcement = require('../models/announcementModel');
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const EnvironmentalImpact = require('../models/environmentalImpactModel');

// Créer une annonce
exports.createAnnouncement = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, waste_type, quantity, latitude, longitude, address } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const announcement = await Announcement.create({
      user_id: userId,
      title,
      description,
      waste_type,
      quantity,
      image_url,
      latitude,
      longitude,
      address
    });

    // Ajouter des points à l'utilisateur
    await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });

    res.status(201).json({ 
      success: true, 
      message: 'Annonce créée avec succès',
      announcement 
    });
  } catch (error) {
    console.error('Erreur createAnnouncement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création de l\'annonce' 
    });
  }
};

// Obtenir toutes les annonces (avec filtres)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { waste_type, status, latitude, longitude, distance } = req.query;
    
    let query = {};

    if (waste_type) {
      query.waste_type = waste_type;
    }

    if (status) {
      query.status = status;
    }

    // Filtre par distance (si coordonnées fournies)
    if (latitude && longitude && distance) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const dist = parseFloat(distance);

      // Recherche approximative par distance (formule haversine)
      query.$where = function() {
        const earthRadius = 6371; // km
        const lat1 = lat * Math.PI / 180;
        const lat2 = this.latitude * Math.PI / 180;
        const deltaLat = (this.latitude - lat) * Math.PI / 180;
        const deltaLon = (this.longitude - lon) * Math.PI / 180;

        const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = earthRadius * c;

        return distance <= dist;
      };
    }

    const announcements = await Announcement.find(query)
      .populate('user_id', 'full_name phone user_type')
      .sort({ created_at: -1 });

    // Formater les résultats
    const formattedAnnouncements = announcements.map(ann => ({
      id: ann._id,
      ...ann.toObject(),
      user_name: ann.user_id?.full_name,
      phone: ann.user_id?.phone,
      user_type: ann.user_id?.user_type
    }));

    res.json({ 
      success: true, 
      count: formattedAnnouncements.length,
      announcements: formattedAnnouncements 
    });
  } catch (error) {
    console.error('Erreur getAllAnnouncements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des annonces' 
    });
  }
};

// Obtenir une annonce par ID
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id)
      .populate('user_id', 'full_name phone user_type');

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Annonce non trouvée' 
      });
    }

    res.json({ 
      success: true, 
      announcement: {
        id: announcement._id,
        ...announcement.toObject(),
        user_name: announcement.user_id?.full_name,
        phone: announcement.user_id?.phone,
        user_type: announcement.user_id?.user_type
      }
    });
  } catch (error) {
    console.error('Erreur getAnnouncementById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération de l\'annonce' 
    });
  }
};

// Réserver une annonce
exports.reserveAnnouncement = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const announcement = await Announcement.findById(id);

    if (!announcement) {
      return res.status(404).json({ 
        success: false, 
        message: 'Annonce non trouvée' 
      });
    }

    if (announcement.status !== 'disponible') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cette annonce n\'est plus disponible' 
      });
    }

    // Réserver pour 24 heures
    const reservedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);

    announcement.status = 'reserve';
    announcement.reserved_by = userId;
    announcement.reserved_until = reservedUntil;
    await announcement.save();

    // Créer une entrée dans la table collections
    await Collection.create({
      announcement_id: id,
      collector_id: userId,
      deposant_id: announcement.user_id
    });

    res.json({ 
      success: true, 
      message: 'Annonce réservée avec succès',
      announcement 
    });
  } catch (error) {
    console.error('Erreur reserveAnnouncement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la réservation' 
    });
  }
};

// Confirmer la collecte
exports.confirmCollection = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { kg_collected } = req.body;

    const announcement = await Announcement.findOne({ 
      _id: id, 
      reserved_by: userId 
    });

    if (!announcement) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous n\'avez pas réservé cette annonce' 
      });
    }

    // Mettre à jour l'annonce
    announcement.status = 'collecte';
    await announcement.save();

    // Mettre à jour la collection
    await Collection.findOneAndUpdate(
      { announcement_id: id, collector_id: userId },
      { 
        status: 'completee', 
        collected_at: new Date(),
        kg_collected 
      }
    );

    // Ajouter des points au collecteur
    await User.findByIdAndUpdate(userId, { $inc: { points: 50 } });

    // Mettre à jour l'impact environnemental
    if (kg_collected) {
      const co2Saved = kg_collected * 2.5;
      const treesSaved = Math.floor(kg_collected / 10);

      // Impact du collecteur
      let collectorImpact = await EnvironmentalImpact.findOne({ user_id: userId });
      if (collectorImpact) {
        collectorImpact.addImpact(kg_collected);
        await collectorImpact.save();
      }

      // Impact du déposant
      let deposantImpact = await EnvironmentalImpact.findOne({ user_id: announcement.user_id });
      if (deposantImpact) {
        deposantImpact.addImpact(kg_collected);
        await deposantImpact.save();
      }
    }

    res.json({ 
      success: true, 
      message: 'Collecte confirmée avec succès! +50 points' 
    });
  } catch (error) {
    console.error('Erreur confirmCollection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la confirmation' 
    });
  }
};

// Supprimer une annonce
exports.deleteAnnouncement = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const announcement = await Announcement.findOne({ 
      _id: id, 
      user_id: userId 
    });

    if (!announcement) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous ne pouvez supprimer que vos propres annonces' 
      });
    }

    await Announcement.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Annonce supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur deleteAnnouncement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression' 
    });
  }
};

// Obtenir mes annonces
exports.getMyAnnouncements = async (req, res) => {
  try {
    const userId = req.user.userId;

    const announcements = await Announcement.find({ user_id: userId })
      .populate('reserved_by', 'full_name')
      .sort({ created_at: -1 });

    const formattedAnnouncements = announcements.map(ann => ({
      id: ann._id,
      ...ann.toObject(),
      reserved_by_name: ann.reserved_by?.full_name
    }));

    res.json({ 
      success: true, 
      count: formattedAnnouncements.length,
      announcements: formattedAnnouncements 
    });
  } catch (error) {
    console.error('Erreur getMyAnnouncements:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération de vos annonces' 
    });
  }
};