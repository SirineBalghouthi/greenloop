import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, Heart, MessageCircle, ArrowLeft, ExternalLink, Package, Calendar, QrCode, Download } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import QRCodeScanner from '../components/QRCodeScanner';

const wasteTypeColors = {
  medicaments: '#ef4444',
  plastiques: '#10b981',
  piles: '#f59e0b',
  textiles: '#8b5cf6',
  electronique: '#3b82f6'
};

const wasteTypeLabels = {
  medicaments: 'Médicaments',
  plastiques: 'Plastiques',
  piles: 'Piles',
  textiles: 'Textiles',
  electronique: 'Électronique'
};

const AnnouncementDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, API_URL, user } = useAuth();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    loadAnnouncement();
    if (token) {
      checkFavorite();
    }
  }, [id, token]);

  const loadAnnouncement = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAnnouncement(response.data.announcement);
      } else {
        setError('Annonce non trouvée');
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'annonce');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const response = await axios.get(`${API_URL}/favorites/check/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(response.data.isFavorite);
    } catch (err) {
      console.error('Erreur vérification favoris:', err);
    }
  };

  const toggleFavorite = async () => {
    if (!token) {
      alert('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`${API_URL}/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(false);
      } else {
        await axios.post(`${API_URL}/favorites`, {
          announcement_id: id
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Erreur toggleFavorite:', err);
      alert(err.response?.data?.message || 'Erreur lors de l\'ajout aux favoris');
    }
  };

  const handleChat = async () => {
    if (!token) {
      alert('Connectez-vous pour envoyer un message');
      navigate('/login');
      return;
    }

    try {
      // Obtenir l'ID de l'utilisateur déposant
      const deposantId = announcement.user_id?._id || announcement.user_id?.id || announcement.user_id;
      
      if (!deposantId) {
        alert('Impossible de contacter le déposant');
        return;
      }

      // Créer ou obtenir la conversation
      const response = await axios.get(`${API_URL}/messages/conversation/${deposantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Naviguer vers la page de messages avec la conversation sélectionnée
        navigate('/messages', {
          state: {
            conversationId: response.data.conversation._id,
            otherUserId: deposantId
          }
        });
      }
    } catch (err) {
      console.error('Erreur création conversation:', err);
      // Naviguer quand même vers les messages avec l'ID du déposant
      const deposantId = announcement.user_id?._id || announcement.user_id?.id || announcement.user_id;
      navigate('/messages', {
        state: {
          otherUserId: deposantId
        }
      });
    }
  };

  const handleViewOnMap = () => {
    navigate('/carte', {
      state: {
        center: [announcement.latitude, announcement.longitude],
        zoom: 15,
        highlightAnnouncement: id
      }
    });
  };

  const loadQRCode = async () => {
    try {
      const response = await axios.get(`${API_URL}/announcements/${id}/qrcode`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setQrCodeImage(response.data.qr_code_image);
        setShowQRCode(true);
      }
    } catch (err) {
      console.error('Erreur chargement QR code:', err);
    }
  };

  const handleQRScanSuccess = () => {
    loadAnnouncement(); // Recharger l'annonce pour mettre à jour le statut
  };

  const isOwner = user && announcement && (
    user.id === announcement.user_id?._id || 
    user.id === announcement.user_id?.toString() ||
    user.userId === announcement.user_id?._id?.toString()
  );
  const isCollector = user && announcement && announcement.reserved_by && (
    user.id === announcement.reserved_by?._id || 
    user.id === announcement.reserved_by?.toString() ||
    user.userId === announcement.reserved_by?.toString()
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de l'annonce...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !announcement) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Annonce non trouvée'}</p>
          <button
            onClick={() => navigate('/annonces')}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Retour aux annonces
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/annonces')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex-1">Détails de l'annonce</h1>
          {token && (
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition ${
                isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Image */}
          {announcement.image_url && (
            <div className="relative h-96 bg-gray-200">
              <img
                src={`${API_URL.replace('/api', '')}${announcement.image_url}`}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span
                  className="px-4 py-2 rounded-full text-white font-semibold text-sm"
                  style={{ backgroundColor: wasteTypeColors[announcement.waste_type] }}
                >
                  {wasteTypeLabels[announcement.waste_type]}
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{announcement.title}</h2>
              <p className="text-gray-600">{announcement.description || 'Pas de description'}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Quantité</p>
                  <p className="font-semibold">{announcement.quantity || 'Non spécifiée'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Localisation</p>
                  <p className="font-semibold">{announcement.address || 'Non spécifiée'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Publié le</p>
                  <p className="font-semibold">
                    {new Date(announcement.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Déposant</p>
                  <p className="font-semibold">{announcement.user_name || 'Anonyme'}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Statut:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                announcement.status === 'disponible' ? 'bg-green-100 text-green-700' :
                announcement.status === 'reserve' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {announcement.status === 'disponible' ? 'Disponible' :
                 announcement.status === 'reserve' ? 'Réservé' : 'Collecté'}
              </span>
            </div>

            {/* Planning de Disponibilité */}
            {announcement.availability_schedule && announcement.availability_schedule.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Planning de Disponibilité
                </h3>
                <div className="space-y-2">
                  {announcement.availability_schedule.map((schedule, index) => {
                    const dayLabels = {
                      monday: 'Lundi',
                      tuesday: 'Mardi',
                      wednesday: 'Mercredi',
                      thursday: 'Jeudi',
                      friday: 'Vendredi',
                      saturday: 'Samedi',
                      sunday: 'Dimanche'
                    };
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="font-medium text-gray-900 mb-2">
                          {dayLabels[schedule.day] || schedule.day}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {schedule.time_slots && schedule.time_slots.map((slot, slotIndex) => (
                            <span
                              key={slotIndex}
                              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                            >
                              {slot.start} - {slot.end}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QR Code Section */}
            {isOwner && announcement.status === 'reserve' && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  QR Code de Collecte
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Montrez ce QR code au collecteur pour valider la collecte. Vous gagnerez +30 points !
                </p>
                {showQRCode && qrCodeImage ? (
                  <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                    <img src={qrCodeImage} alt="QR Code" className="w-48 h-48 mx-auto mb-3" />
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = qrCodeImage;
                        link.download = `qr-code-${id}.png`;
                        link.click();
                      }}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger le QR Code
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={loadQRCode}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Générer le QR Code
                  </button>
                )}
              </div>
            )}

            {isCollector && announcement.status === 'reserve' && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-600" />
                  Scanner le QR Code
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Scannez le QR code du déposant pour confirmer la collecte. Vous gagnerez +50 points !
                </p>
                <button
                  onClick={() => setShowQRScanner(true)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  Scanner le QR Code
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <button
                onClick={handleChat}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                <MessageCircle className="w-5 h-5" />
                Contacter le déposant
              </button>
              <button
                onClick={handleViewOnMap}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                <ExternalLink className="w-5 h-5" />
                Voir sur la carte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Scanner Modal */}
      {showQRScanner && (
        <QRCodeScanner
          announcementId={id}
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </Layout>
  );
};

export default AnnouncementDetailPage;

