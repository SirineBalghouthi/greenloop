const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const EnvironmentalImpact = require('../models/environmentalImpactModel');
const { sendSMS, normalizePhone } = require('../utils/smsHelper');

// Générer un code de vérification
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};


// Connexion/Inscription par téléphone
exports.login = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le numéro de téléphone est requis' 
      });
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhone(phone);

    // Générer le code de vérification
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Chercher ou créer l'utilisateur
    let user = await User.findOne({ phone: normalizedPhone });

    if (user) {
      // Utilisateur existant - mettre à jour le code
      user.verification_code = verificationCode;
      user.verification_code_expires = codeExpires;
      await user.save();
    } else {
      // Nouveau numéro - créer un enregistrement temporaire
      user = await User.create({
        phone: normalizedPhone,
        password: '', // Mot de passe vide pour les utilisateurs SMS
        full_name: 'Utilisateur Temporaire',
        verification_code: verificationCode,
        verification_code_expires: codeExpires,
        is_verified: false
      });
    }

    // Envoyer le SMS
    const smsResult = await sendSMS(normalizedPhone, verificationCode);

    // En mode développement, inclure le code dans la réponse
    const response = { 
      success: true, 
      message: 'Code de vérification envoyé',
      exists: user.is_verified,
      phone: normalizedPhone
    };

    // Ne renvoyer le code qu'en développement
    if (process.env.NODE_ENV === 'development' || smsResult.mode === 'dev' || smsResult.mode === 'dev-fallback') {
      response.code = verificationCode;
      response.dev_mode = true;
    }

    res.json(response);
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Erreur lors de l\'envoi du code' 
    });
  }
};

// Vérifier le code et connecter
exports.verifyCode = async (req, res) => {
  try {
    const { phone, code, full_name, user_type, address, city } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Téléphone et code requis' 
      });
    }

    // Normaliser le numéro de téléphone
    const normalizedPhone = normalizePhone(phone);

    // Chercher l'utilisateur
    const user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Vérifier le code
    if (user.verification_code !== code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code invalide' 
      });
    }

    // Vérifier l'expiration
    if (new Date() > user.verification_code_expires) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code expiré' 
      });
    }

    // Si utilisateur non vérifié = inscription
    if (!user.is_verified) {
      if (!full_name || !user_type) {
        return res.status(400).json({ 
          success: false, 
          message: 'Complétez votre inscription',
          needsRegistration: true 
        });
      }

      // Compléter l'inscription
      user.full_name = full_name;
      user.user_type = user_type;
      user.address = address || '';
      user.city = city || '';
      user.is_verified = true;
      user.verification_code = null;
      user.verification_code_expires = null;

      await user.save();

      // Créer l'impact environnemental
      await EnvironmentalImpact.create({ user_id: user._id });

      const token = generateToken(user._id);

      return res.status(201).json({ 
        success: true, 
        message: 'Inscription réussie',
        token,
        user: {
          id: user._id,
          phone: user.phone,
          full_name: user.full_name,
          user_type: user.user_type,
          address: user.address,
          city: user.city,
          points: user.points,
          level: user.level,
          created_at: user.created_at
        }
      });
    }

    // Utilisateur existant - connexion simple
    user.verification_code = null;
    user.verification_code_expires = null;
    await user.save();

    const token = generateToken(user._id);

    res.json({ 
      success: true, 
      message: 'Connexion réussie',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        full_name: user.full_name,
        user_type: user.user_type,
        address: user.address,
        city: user.city,
        points: user.points,
        level: user.level,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Erreur verifyCode:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la vérification' 
    });
  }
};

// Obtenir le profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-verification_code -verification_code_expires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    // Récupérer l'impact environnemental
    const impact = await EnvironmentalImpact.findOne({ user_id: user._id });

    res.json({ 
      success: true, 
      user: {
        ...user.toObject(),
        kg_recycled: impact?.kg_recycled || 0,
        co2_saved: impact?.co2_saved || 0,
        trees_saved: impact?.trees_saved || 0
      }
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du profil' 
    });
  }
};

// Mettre à jour le profil
exports.updateProfile = async (req, res) => {
  try {
    const { full_name, address, city } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { full_name, address, city },
      { new: true, runValidators: true }
    ).select('-verification_code -verification_code_expires');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Profil mis à jour',
      user
    });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour' 
    });
  }
};

// Login admin avec mot de passe
exports.adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Téléphone et mot de passe requis'
      });
    }

    // Chercher l'utilisateur avec le mot de passe
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // ✅ CORRECTION: Vérifier user_type au lieu de role
    if (user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    // Vérifier si le mot de passe existe
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'Compte sans mot de passe configuré'
      });
    }

    // Vérifier le mot de passe
    const bcrypt = require('bcryptjs');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants invalides'
      });
    }

    // Générer le token
    const token = jwt.sign(
      { userId: user._id, user_type: user.user_type }, // ✅ user_type
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion admin réussie',
      token,
      user: {
        userId: user._id,
        full_name: user.full_name,
        phone: user.phone,
        user_type: user.user_type // ✅ user_type
      }
    });
  } catch (error) {
    console.error('Erreur adminLogin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};