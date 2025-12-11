const Notification = require('../models/notificationModel');

// Lister les notifications de l'utilisateur
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unread] = await Promise.all([
      Notification.find({ user_id: userId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments({ user_id: userId }),
      Notification.countDocuments({ user_id: userId, is_read: false })
    ]);

    res.json({
      success: true,
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total
      },
      unread
    });
  } catch (error) {
    console.error('Erreur getNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
};

// Nombre non lus
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const unread = await Notification.countDocuments({ user_id: userId, is_read: false });
    res.json({ success: true, unread });
  } catch (error) {
    console.error('Erreur getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du compteur'
    });
  }
};

// Marquer comme lu
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { is_read: true }
    );

    res.json({ success: true, message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
};

// Marquer tout comme lu
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );

    res.json({ success: true, message: 'Toutes les notifications sont marquées comme lues' });
  } catch (error) {
    console.error('Erreur markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour'
    });
  }
};

