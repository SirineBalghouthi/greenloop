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

// Socket.IO pour le chat en temps réel
io.on('connection', (socket) => {
  console.log('✅ Nouvel utilisateur connecté:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`👤 Utilisateur ${socket.id} a rejoint la room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
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