const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/userModel');

const createAdmin = async () => {
  try {
    // Connexion directe à MongoDB (changez l'URI si nécessaire)
    await mongoose.connect('mongodb://localhost:27017/greenloop_db');
    console.log('✅ Connecté à MongoDB');

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ phone: '+21627347177' });
    
    if (existingAdmin) {
      console.log('⚠️ Un utilisateur avec ce numéro existe déjà');
      console.log('📋 Mise à jour en admin avec mot de passe...');
      
      // Mettre à jour l'utilisateur existant
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.user_type = 'admin';
      existingAdmin.full_name = 'Admin GreenLoop';
      existingAdmin.is_verified = true;
      existingAdmin.updated_at = new Date();
      
      await existingAdmin.save();
      console.log('✅ Utilisateur mis à jour en admin avec succès!');
      console.log('📱 Téléphone:', existingAdmin.phone);
      console.log('🔑 Mot de passe: admin123');
      console.log('👤 Type:', existingAdmin.user_type);
      console.log('🔒 Password dans BDD:', existingAdmin.password ? 'OUI ✅' : 'NON ❌');
    } else {
      // Créer un nouveau compte admin
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = await User.create({
        phone: '+21627347177',
        full_name: 'Admin GreenLoop',
        password: hashedPassword,
        user_type: 'admin',
        is_verified: true,
        points: 0,
        level: 'bronze'
      });

      console.log('✅ Compte admin créé avec succès!');
      console.log('📱 Téléphone:', admin.phone);
      console.log('🔑 Mot de passe: admin123');
      console.log('👤 Type:', admin.user_type);
      console.log('🔒 Password dans BDD:', admin.password ? 'OUI ✅' : 'NON ❌');
    }
    
    await mongoose.connection.close();
    console.log('✅ Connexion fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Détails:', error);
    process.exit(1);
  }
};

createAdmin();