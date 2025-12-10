const express = require('express');
const router = express.Router();
const {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addFavorite);
router.delete('/:id', protect, removeFavorite);
router.get('/', protect, getMyFavorites);
router.get('/check/:id', protect, checkFavorite);

module.exports = router;

