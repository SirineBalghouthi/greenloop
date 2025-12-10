const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/adminAuth');
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getAllAnnouncements,
  deleteAnnouncement,
  getUserDetails
} = require('../controllers/adminController');

// Toutes les routes nécessitent authentification ET droits admin
router.use(protect, isAdmin);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Gestion utilisateurs
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetails);
router.patch('/users/:userId/toggle-status', toggleUserStatus);
router.delete('/users/:userId', deleteUser);

// Gestion annonces
router.get('/announcements', getAllAnnouncements);
router.delete('/announcements/:announcementId', deleteAnnouncement);

module.exports = router;