const Message = require('../models/messageModel');
const User = require('../models/userModel');

// Obtenir toutes les conversations avec le dernier message
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Récupérer tous les messages de l'utilisateur
    const messages = await Message.find({
      $or: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    })
    .populate('sender_id', 'full_name phone user_type')
    .populate('receiver_id', 'full_name phone user_type')
    .sort({ created_at: -1 });

    // Grouper par conversation (autre utilisateur)
    const conversationsMap = new Map();

    messages.forEach(msg => {
      const otherUserId = msg.sender_id._id.toString() === userId.toString() 
        ? msg.receiver_id._id.toString() 
        : msg.sender_id._id.toString();
      
      const otherUser = msg.sender_id._id.toString() === userId.toString() 
        ? msg.receiver_id 
        : msg.sender_id;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          _id: otherUserId,
          other_user: {
            _id: otherUser._id,
            full_name: otherUser.full_name,
            phone: otherUser.phone,
            user_type: otherUser.user_type
          },
          last_message: msg.content || msg.message,
          last_message_at: msg.created_at,
          unread_count: 0
        });
      }
    });

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des conversations'
    });
  }
};

// Obtenir les messages d'une conversation
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ]
    })
    .populate('sender_id', 'full_name')
    .populate('receiver_id', 'full_name')
    .sort({ created_at: 1 });

    // Marquer les messages comme lus
    await Message.updateMany(
      {
        sender_id: otherUserId,
        receiver_id: userId,
        is_read: false
      },
      { is_read: true }
    );

    res.json({
      success: true,
      messages: messages.map(msg => ({
        _id: msg._id,
        id: msg._id,
        content: msg.content || msg.message,
        sender_id: msg.sender_id._id,
        receiver_id: msg.receiver_id._id,
        created_at: msg.created_at,
        is_read: msg.is_read
      }))
    });
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { receiver_id, content, announcement_id } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Destinataire et contenu requis'
      });
    }

    const message = await Message.create({
      sender_id: userId,
      receiver_id,
      content: content,
      message: content, // Compatibilité avec l'ancien format
      announcement_id: announcement_id || null,
      is_read: false
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender_id', 'full_name phone')
      .populate('receiver_id', 'full_name phone');

    res.status(201).json({
      success: true,
      message: {
        _id: populatedMessage._id,
        id: populatedMessage._id,
        content: populatedMessage.content || populatedMessage.message,
        sender_id: populatedMessage.sender_id._id,
        receiver_id: populatedMessage.receiver_id._id,
        created_at: populatedMessage.created_at,
        is_read: populatedMessage.is_read
      }
    });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message'
    });
  }
};

// Créer ou obtenir une conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    // Vérifier si l'utilisateur existe
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Retourner les informations de la conversation
    res.json({
      success: true,
      conversation: {
        _id: otherUserId,
        other_user: {
          _id: otherUser._id,
          full_name: otherUser.full_name,
          phone: otherUser.phone,
          user_type: otherUser.user_type
        }
      }
    });
  } catch (error) {
    console.error('Erreur getOrCreateConversation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la conversation'
    });
  }
};

