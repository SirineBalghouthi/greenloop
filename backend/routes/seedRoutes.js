const express = require('express');
const router = express.Router();
const {
  getSeed,
  updateSeed
} = require('../controllers/seedController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getSeed);
router.put('/', protect, updateSeed);

module.exports = router;

