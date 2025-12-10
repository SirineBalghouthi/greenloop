const express = require('express');
const router = express.Router();
const { login, verifyCode, getProfile, updateProfile, adminLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');


router.post('/login', login);
router.post('/verify', verifyCode);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/admin-login', adminLogin);

module.exports = router;