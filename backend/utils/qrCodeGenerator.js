const QRCode = require('qrcode');
const crypto = require('crypto');

// Générer un QR code unique pour une annonce
exports.generateQRCode = async (announcementId) => {
  try {
    // Créer un token unique sécurisé
    const token = crypto.randomBytes(32).toString('hex');
    const data = JSON.stringify({
      announcement_id: announcementId.toString(),
      token: token,
      timestamp: Date.now()
    });

    // Générer le QR code en base64
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2
    });

    return {
      qr_code: token,
      qr_code_image: qrCodeDataURL,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    };
  } catch (error) {
    console.error('Erreur génération QR code:', error);
    throw error;
  }
};

// Valider un QR code scanné
exports.validateQRCode = (scannedData, announcementId, expectedToken) => {
  try {
    const data = JSON.parse(scannedData);
    
    // Vérifier que le token correspond
    if (data.token !== expectedToken) {
      return { valid: false, message: 'Token invalide' };
    }

    // Vérifier que l'ID de l'annonce correspond
    if (data.announcement_id !== announcementId.toString()) {
      return { valid: false, message: 'Annonce invalide' };
    }

    // Vérifier que le QR code n'est pas expiré (7 jours)
    const timestamp = data.timestamp;
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 jours

    if (now - timestamp > maxAge) {
      return { valid: false, message: 'QR code expiré' };
    }

    return { valid: true, message: 'QR code valide' };
  } catch (error) {
    return { valid: false, message: 'Format QR code invalide' };
  }
};

