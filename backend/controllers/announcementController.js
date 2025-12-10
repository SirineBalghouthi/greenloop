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

// Fonction pour calculer la distance entre deux points (formule Haversine)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Obtenir toutes les annonces (avec filtres)
exports.getAllAnnouncements = async (req, res) => {
  try {
    const { waste_type, status, latitude, longitude, distance, quantity, date } = req.query;
    
    let query = {};

    if (waste_type) {
      query.waste_type = waste_type;
    }

    // Par défaut, si aucun statut n'est spécifié, afficher tous les statuts
    if (status) {
      query.status = status;
    }
    // Si status est vide, on n'ajoute pas de filtre = tous les statuts

    // Note: La quantité est stockée comme String, donc on ne peut pas filtrer directement
    // On filtrera après avoir récupéré les résultats

    if (date) {
      // Filtrer par date (annonces créées après cette date)
      query.created_at = { $gte: new Date(date) };
    }

    let announcements = await Announcement.find(query)
      .populate('user_id', 'full_name phone user_type')
      .sort({ created_at: -1 });

    // Filtrer par quantité si fournie
    if (quantity) {
      const minQuantity = parseFloat(quantity);
      announcements = announcements.filter(ann => {
        const annQuantity = parseFloat(ann.quantity) || 0;
        return annQuantity >= minQuantity;
      });
    }

    // Filtrer par distance si coordonnées fournies
    if (latitude && longitude && distance) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      const maxDistance = parseFloat(distance);

      announcements = announcements.filter(ann => {
        const annDistance = calculateDistance(
          userLat, 
          userLon, 
          ann.latitude, 
          ann.longitude
        );
        ann.distance = annDistance; // Ajouter la distance calculée
        return annDistance <= maxDistance;
      });
    } else if (latitude && longitude) {
      // Calculer la distance même sans filtre de distance
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);
      announcements = announcements.map(ann => {
        ann.distance = calculateDistance(
          userLat, 
          userLon, 
          ann.latitude, 
          ann.longitude
        );
        return ann;
      });
    }

    // Trier par distance si disponible
    if (latitude && longitude) {
      announcements.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    // Formater les résultats
    const formattedAnnouncements = announcements.map(ann => ({
      id: ann._id,
      ...ann.toObject(),
      user_name: ann.user_id?.full_name,
      phone: ann.user_id?.phone,
      user_type: ann.user_id?.user_type,
      distance: ann.distance ? Math.round(ann.distance * 10) / 10 : null // Arrondir à 1 décimale
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
      .populate('reserved_by', 'full_name phone')
      .sort({ created_at: -1 });

    const formattedAnnouncements = announcements.map(ann => ({
      id: ann._id,
      ...ann.toObject(),
      reserved_by_name: ann.reserved_by?.full_name,
      reserved_by_phone: ann.reserved_by?.phone
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

// Mettre à jour le statut d'une annonce (par le déposant)
exports.updateAnnouncementStatus = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;

    // Vérifier que le statut est valide
    const validStatuses = ['disponible', 'reserve', 'collecte'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Statut invalide. Statuts possibles: disponible, reserve, collecte' 
      });
    }

    // Trouver l'annonce et vérifier que l'utilisateur est le propriétaire
    const announcement = await Announcement.findOne({ 
      _id: id, 
      user_id: userId 
    });

    if (!announcement) {
      return res.status(403).json({ 
        success: false, 
        message: 'Vous ne pouvez modifier que vos propres annonces' 
      });
    }

    // Si on passe à "disponible", réinitialiser la réservation
    if (status === 'disponible') {
      announcement.status = 'disponible';
      announcement.reserved_by = null;
      announcement.reserved_until = null;
    } else {
      announcement.status = status;
    }

    await announcement.save();

    res.json({ 
      success: true, 
      message: `Statut de l'annonce mis à jour: ${status}`,
      announcement 
    });
  } catch (error) {
    console.error('Erreur updateAnnouncementStatus:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour du statut' 
    });
  }
};