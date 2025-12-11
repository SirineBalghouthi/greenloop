const Video = require('../models/videoModel');
const User = require('../models/userModel');

// Créer une vidéo
exports.createVideo = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { title, description, video_url, category, waste_type } = req.body;
    
    // Gérer l'image uploadée
    let thumbnail_url = null;
    if (req.file) {
      thumbnail_url = `/uploads/${req.file.filename}`;
    }

    const video = await Video.create({
      title: title || 'Vidéo partagée',
      description: description || '',
      video_url: video_url || '',
      thumbnail_url: thumbnail_url || req.body.thumbnail_url || null,
      category: category || 'temoignage',
      waste_type: waste_type || 'tous',
      duration: 0,
      tags: [],
      user_id: userId || null,
      is_offline_available: false
    });

    res.status(201).json({
      success: true,
      message: 'Vidéo créée avec succès',
      video
    });
  } catch (error) {
    console.error('Erreur createVideo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la vidéo'
    });
  }
};

// Obtenir toutes les vidéos (avec filtres)
exports.getAllVideos = async (req, res) => {
  try {
    const { category, waste_type, search, sort = 'created_at' } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (waste_type && waste_type !== 'tous') {
      query.waste_type = waste_type;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let sortOption = {};
    if (sort === 'views') sortOption = { views: -1 };
    else if (sort === 'likes') sortOption = { likes: -1 };
    else sortOption = { created_at: -1 };

    const videos = await Video.find(query)
      .populate('user_id', 'full_name')
      .sort(sortOption);

    res.json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error('Erreur getAllVideos:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des vidéos'
    });
  }
};

// Obtenir une vidéo par ID
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id)
      .populate('user_id', 'full_name');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    // Incrémenter les vues
    video.views += 1;
    await video.save();

    res.json({
      success: true,
      video
    });
  } catch (error) {
    console.error('Erreur getVideoById:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la vidéo'
    });
  }
};

// Liker une vidéo
exports.likeVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    video.likes += 1;
    await video.save();

    res.json({
      success: true,
      message: 'Vidéo likée',
      likes: video.likes
    });
  } catch (error) {
    console.error('Erreur likeVideo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du like'
    });
  }
};

// Partager une vidéo
exports.shareVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vidéo non trouvée'
      });
    }

    video.shares += 1;
    await video.save();

    res.json({
      success: true,
      message: 'Vidéo partagée',
      shares: video.shares
    });
  } catch (error) {
    console.error('Erreur shareVideo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du partage'
    });
  }
};

// Supprimer une vidéo
exports.deleteVideo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const video = await Video.findOne({
      _id: id,
      user_id: userId
    });

    if (!video) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres vidéos'
      });
    }

    await Video.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Vidéo supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteVideo:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};

