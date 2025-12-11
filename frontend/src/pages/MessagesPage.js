import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';
import { MessageCircle, Send, Search, Image as ImageIcon, MapPin, Phone, Video, Smile, Paperclip, MoreVertical, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';

const MessagesPage = () => {
  const { user, token, API_URL } = useAuth();
  const { socket, isConnected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadConversations();
    
    // Si on vient d'une autre page avec une conversation à sélectionner
    if (location.state?.otherUserId) {
      setTimeout(() => {
        const conv = conversations.find(c => c.other_user._id === location.state.otherUserId);
        if (conv) {
          handleSelectConversation(conv);
        } else {
          // Créer une nouvelle conversation
          const newConv = {
            _id: location.state.otherUserId,
            other_user: {
              _id: location.state.otherUserId,
              full_name: location.state.otherUserName || 'Utilisateur',
              phone: location.state.otherUserPhone || '',
              user_type: location.state.otherUserType || ''
            },
            last_message: '',
            last_message_at: new Date()
          };
          handleSelectConversation(newConv);
        }
      }, 500);
    }
  }, []);
  
  useEffect(() => {
    if (location.state?.otherUserId && conversations.length > 0) {
      const conv = conversations.find(c => c.other_user._id === location.state.otherUserId);
      if (conv && !selectedConversation) {
        handleSelectConversation(conv);
      }
    }
  }, [conversations, location.state]);

  // Socket.io - Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (socket && selectedConversation) {
      const roomId = selectedConversation._id;
      
      // Rejoindre la room de conversation
      socket.emit('join_room', roomId);

      // Écouter les nouveaux messages
      const handleReceiveMessage = (data) => {
        if (data.roomId === roomId || data.message?.sender_id === selectedConversation.other_user._id) {
          const newMsg = data.message || data;
          // Vérifier si le message n'existe pas déjà
          setMessages(prev => {
            const exists = prev.some(m => m._id === newMsg._id || m.id === newMsg._id);
            if (exists) return prev;
            return [...prev, newMsg];
          });
          // Mettre à jour la dernière conversation
          setConversations(prev => 
            prev.map(conv => 
              conv._id === roomId 
                ? { ...conv, last_message: newMsg.content || newMsg.message || '', last_message_at: new Date() }
                : conv
            )
          );
        }
      };

      // Écouter le statut de frappe
      const handleTyping = (data) => {
        if (data.roomId === roomId && data.userId !== user?.userId) {
          setTyping(true);
          setTimeout(() => setTyping(false), 3000);
        }
      };

      socket.on('receive_message', handleReceiveMessage);
      socket.on('typing', handleTyping);

      return () => {
        socket.off('receive_message', handleReceiveMessage);
        socket.off('typing', handleTyping);
      };
    }
  }, [socket, selectedConversation, user?.userId]);

  // Auto-scroll vers le bas quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus sur l'input quand une conversation est sélectionnée
  useEffect(() => {
    if (selectedConversation && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const sorted = (response.data.conversations || []).sort((a, b) => 
        new Date(b.last_message_at) - new Date(a.last_message_at)
      );
      setConversations(sorted);
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      if (error.response?.status === 404) {
        setMessages([]);
      }
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // Envoyer le message via API
      const response = await axios.post(`${API_URL}/messages`, {
        receiver_id: selectedConversation.other_user._id,
        content: messageText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sentMessage = response.data.message;

      // Ajouter le message localement immédiatement
      setMessages(prev => [...prev, sentMessage]);

      // Envoyer via Socket.io pour le temps réel
      if (socket && isConnected && selectedConversation) {
        socket.emit('send_message', {
          roomId: selectedConversation._id,
          message: sentMessage
        });
      }

      // Mettre à jour la conversation
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv._id === selectedConversation._id 
            ? { ...conv, last_message: messageText, last_message_at: new Date() }
            : conv
        );
        // Réorganiser pour mettre la conversation en haut
        const selected = updated.find(c => c._id === selectedConversation._id);
        const others = updated.filter(c => c._id !== selectedConversation._id);
        return selected ? [selected, ...others] : updated;
      });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setNewMessage(messageText); // Restaurer le message en cas d'erreur
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socket && selectedConversation && newMessage.trim()) {
      socket.emit('typing', {
        roomId: selectedConversation._id,
        userId: user?.userId
      });
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateString, prevDateString) => {
    const date = new Date(dateString);
    const prevDate = prevDateString ? new Date(prevDateString) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messageDate = new Date(date);
    messageDate.setHours(0, 0, 0, 0);

    if (prevDate && new Date(prevDate).setHours(0, 0, 0, 0) === messageDate.getTime()) {
      return null; // Même jour que le message précédent
    }

    if (messageDate.getTime() === today.getTime()) {
      return 'Aujourd\'hui';
    }
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Hier';
    }
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Liste des conversations */}
        <div className="w-full md:w-96 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600">
                  {isConnected ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucune conversation</p>
                <p className="text-xs mt-2 text-gray-400">Commencez une nouvelle conversation depuis une annonce</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const unreadCount = 0; // À implémenter si nécessaire
                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?._id === conv._id ? 'bg-green-50 border-l-4 border-l-green-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                          {conv.other_user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        {conv.other_user?.is_online && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conv.other_user?.full_name || 'Utilisateur'}
                            </h3>
                            {conv.other_user?.is_online ? (
                              <span className="text-xs text-green-600 font-medium">En ligne</span>
                            ) : (
                              <span className="text-xs text-gray-400">Hors ligne</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.last_message || 'Pas de messages'}
                        </p>
                        {unreadCount > 0 && (
                          <div className="mt-1">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-green-500 text-white text-xs font-bold rounded-full">
                              {unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Header de conversation */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversation.other_user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {selectedConversation.other_user?.is_online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-900">
                        {selectedConversation.other_user?.full_name || 'Utilisateur'}
                      </h2>
                      {selectedConversation.other_user?.is_online ? (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          En ligne
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Hors ligne</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {selectedConversation.other_user?.user_type || 'Membre'} • {selectedConversation.other_user?.phone || ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">Aucun message</p>
                    <p className="text-sm">Commencez la conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.sender_id === user?.userId || msg.sender_id?._id === user?.userId;
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const dateHeader = formatDateHeader(msg.created_at || msg.createdAt, prevMsg?.created_at || prevMsg?.createdAt);
                    
                    return (
                      <React.Fragment key={msg._id || msg.id}>
                        {dateHeader && (
                          <div className="flex justify-center my-4">
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                              {dateHeader}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                          {!isOwn && (
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {selectedConversation.other_user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-green-500 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content || msg.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              <span className="text-xs">
                                {formatTime(msg.created_at || msg.createdAt)}
                              </span>
                              {isOwn && (
                                <CheckCheck className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                          {isOwn && (
                            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {user?.full_name?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                          )}
                        </div>
                      </React.Fragment>
                    );
                  })
                )}
                {typing && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      {selectedConversation.other_user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    title="Pièce jointe"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Écrire un message..."
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
                      title="Émojis"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
                  >
                    {sending ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">Sélectionnez une conversation</p>
                <p className="text-sm text-gray-400">Ou commencez une nouvelle conversation depuis une annonce</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MessagesPage;
