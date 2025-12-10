const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Gestion des événements de connexion
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connecté à MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Erreur de connexion Mongoose:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose déconnecté');
});

// Fermeture propre
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔴 Mongoose déconnecté suite à l\'arrêt de l\'application');
  process.exit(0);
});

module.exports = connectDB;