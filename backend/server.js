const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const adminRoutes = require('./routes/adminRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const videoRoutes = require('./routes/videoRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const seedRoutes = require('./routes/seedRoutes'); 

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connecter à MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/seed', seedRoutes);

// Socket.IO pour le chat en temps réel
const User = require('./models/userModel');

io.on('connection', (socket) => {
  console.log('✅ Nouvel utilisateur connecté:', socket.id);

  // Authentification Socket.io
  socket.on('authenticate', async (data) => {
    if (data.token && data.userId) {
      socket.userId = data.userId;
      // Mettre l'utilisateur en ligne
      await User.findByIdAndUpdate(data.userId, { 
        is_online: true,
        last_seen: new Date()
      });
      // Notifier les autres utilisateurs
      io.emit('user_online', { userId: data.userId });
      console.log(`🔐 Utilisateur ${data.userId} authentifié sur Socket.io`);
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Utilisateur ${socket.id} a rejoint la room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    // Diffuser le message à tous les utilisateurs de la room
    io.to(data.roomId).emit('receive_message', data);
    console.log(`💬 Message envoyé dans la room ${data.roomId}`);
  });

  socket.on('typing', (data) => {
    // Diffuser le statut de frappe aux autres utilisateurs de la room
    socket.to(data.roomId).emit('typing', data);
  });

  socket.on('stop_typing', (data) => {
    // Arrêter le statut de frappe
    socket.to(data.roomId).emit('stop_typing', data);
  });

  socket.on('disconnect', async () => {
    if (socket.userId) {
      // Mettre l'utilisateur hors ligne
      await User.findByIdAndUpdate(socket.userId, { 
        is_online: false,
        last_seen: new Date()
      });
      // Notifier les autres utilisateurs
      io.emit('user_offline', { userId: socket.userId });
    }
    console.log('❌ Utilisateur déconnecté:', socket.id);
  });
});

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'GreenLoop API (MongoDB) fonctionne!',
    database: 'MongoDB',
    version: '1.0.0'
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur serveur', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     🌱 GreenLoop API (MongoDB)       ║
║                                       ║
║  Serveur:    http://localhost:${PORT}  ║
║  Environnement: ${process.env.NODE_ENV || 'development'}            ║
║  Base de données: MongoDB             ║
╚═══════════════════════════════════════╝
  `);
});