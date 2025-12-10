const twilio = require('twilio');

// Normaliser le numéro de téléphone
const normalizePhone = (phone) => {
  // Supprimer les espaces et caractères spéciaux
  let normalized = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  // Si commence par 0, remplacer par +216
  if (normalized.startsWith('0')) {
    normalized = '+216' + normalized.substring(1);
  }
  // Si commence par 216, ajouter +
  else if (normalized.startsWith('216')) {
    normalized = '+' + normalized;
  }
  // Si ne commence pas par +, ajouter +216
  else if (!normalized.startsWith('+')) {
    normalized = '+216' + normalized;
  }
  
  return normalized;
};

// Envoyer SMS avec Twilio
const sendSMS = async (phone, code) => {
  try {
    const normalizedPhone = normalizePhone(phone);
    
    // Si Twilio n'est pas configuré, utiliser le mode développement
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.log(`\n📱 ============================================`);
      console.log(`📱 [MODE DEV] SMS SIMULÉ`);
      console.log(`📱 Destinataire: ${normalizedPhone}`);
      console.log(`📱 Code de vérification: ${code}`);
      console.log(`📱 ============================================\n`);
      console.log(`⚠️  Pour activer l'envoi réel de SMS, configurez dans backend/.env :`);
      console.log(`   - TWILIO_ACCOUNT_SID`);
      console.log(`   - TWILIO_AUTH_TOKEN`);
      console.log(`   - TWILIO_PHONE_NUMBER\n`);
      return { success: true, mode: 'dev' };
    }

    // Initialiser le client Twilio
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Envoyer le SMS avec format optimisé
    const message = await client.messages.create({
      body: `🌱 GreenLoop\n\nVotre code de vérification est: ${code}\n\nValide 10 minutes.\n\nNe partagez jamais ce code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone
    });

    console.log(`\n✅ ============================================`);
    console.log(`✅ SMS ENVOYÉ AVEC SUCCÈS`);
    console.log(`✅ Destinataire: ${normalizedPhone}`);
    console.log(`✅ Code: ${code}`);
    console.log(`✅ Twilio SID: ${message.sid}`);
    console.log(`✅ ============================================\n`);
    
    return { success: true, mode: 'production', sid: message.sid };
  } catch (error) {
    console.error('\n❌ ============================================');
    console.error('❌ ERREUR ENVOI SMS');
    console.error(`❌ Destinataire: ${phone}`);
    console.error(`❌ Erreur: ${error.message}`);
    console.error(`❌ Code: ${error.code}`);
    console.error(`❌ ============================================\n`);
    
    // En mode développement, continuer même si Twilio échoue
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 [FALLBACK DEV] Code de vérification pour ${phone}: ${code}`);
      return { success: true, mode: 'dev-fallback' };
    }
    
    throw new Error('Erreur lors de l\'envoi du SMS. Veuillez réessayer.');
  }
};

module.exports = { sendSMS, normalizePhone };

