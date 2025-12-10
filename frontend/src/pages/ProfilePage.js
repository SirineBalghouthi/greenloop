import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import axios from 'axios';
import { 
  User, 
  Phone, 
  MapPin, 
  Edit2, 
  Save,
  Award,
  Leaf,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  X,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, token, API_URL, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    address: user?.address || '',
    city: user?.city || ''
  });

  useEffect(() => {
    if (activeTab === 'announcements') {
      loadMyAnnouncements();
    }
  }, [activeTab]);

  const loadMyAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const response = await axios.get(`${API_URL}/announcements/my-announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Erreur chargement mes annonces:', error);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.patch(`${API_URL}/users/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuccess('Profil mis à jour avec succès!');
        setIsEditing(false);
        setTimeout(() => {
          setSuccess('');
          window.location.reload(); // Recharger pour mettre à jour les données utilisateur
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      address: user?.address || '',
      city: user?.city || ''
    });
    setIsEditing(false);
    setError('');
  };

  const handleStatusChange = async (announcementId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_URL}/announcements/${announcementId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccess(`Statut mis à jour: ${newStatus}`);
        setTimeout(() => setSuccess(''), 3000);
        loadMyAnnouncements();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du changement de statut');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible': return 'bg-green-100 text-green-700 border-green-300';
      case 'reserve': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'collecte': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'reserve': return 'Réservé';
      case 'collecte': return 'Collecté';
      default: return status;
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'announcements', label: 'Mes Annonces', icon: Award },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">Gérez vos informations et préférences</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <Check className="w-5 h-5" />
            {success}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <X className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize mt-2">
                      {user?.user_type || 'Membre'}
                    </span>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold">{user?.points || 0} points</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Leaf className="w-4 h-4" />
                        <span>Niveau {user?.level || 'Bronze'}</span>
                      </div>
                    </div>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                  )}
                </div>

                {/* Profile Form */}
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={user?.phone}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Le numéro de téléphone ne peut pas être modifié
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse ou zone
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: Rue X, Quartier Y"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ex: Tunis, Sousse, Sfax..."
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition"
                      >
                        <Save className="w-5 h-5" />
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Téléphone</div>
                        <div className="font-medium text-gray-900">{user?.phone}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Adresse</div>
                        <div className="font-medium text-gray-900">
                          {user?.address || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Ville</div>
                        <div className="font-medium text-gray-900">
                          {user?.city || 'Non renseigné'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="text-sm text-gray-500">Membre depuis</div>
                        <div className="font-medium text-gray-900">
                          {new Date(user?.created_at || Date.now()).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {user?.points || 0}
                    </div>
                    <div className="text-sm text-gray-600">Points</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {myAnnouncements.length}
                    </div>
                    <div className="text-sm text-gray-600">Mes Annonces</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2 capitalize">
                      {user?.level || 'Bronze'}
                    </div>
                    <div className="text-sm text-gray-600">Niveau</div>
                  </div>
                </div>

                {/* Environmental Impact */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white">
                  <div className="flex items-center gap-3 mb-6">
                    <Leaf className="w-8 h-8" />
                    <h2 className="text-2xl font-bold">Mon Impact Environnemental</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <div className="text-3xl font-bold mb-1">
                        {user?.kg_recycled || '0'} kg
                      </div>
                      <div className="text-green-100">Déchets recyclés</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">
                        {user?.co2_saved || '0'} kg
                      </div>
                      <div className="text-green-100">CO₂ évité</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">
                        {user?.trees_saved || '0'}
                      </div>
                      <div className="text-green-100">Arbres sauvés</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Announcements Tab */}
            {activeTab === 'announcements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Mes Annonces</h2>
                  <button
                    onClick={() => navigate('/creer-annonce')}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                  >
                    + Nouvelle annonce
                  </button>
                </div>

                {loadingAnnouncements ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                  </div>
                ) : myAnnouncements.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Vous n'avez pas encore créé d'annonce</p>
                    <button
                      onClick={() => navigate('/creer-annonce')}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      Créer ma première annonce
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAnnouncements.map((ann) => (
                      <div key={ann.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{ann.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{ann.description}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ann.status)}`}>
                            {getStatusLabel(ann.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            {ann.reserved_by_name && (
                              <span>Réservé par: <strong>{ann.reserved_by_name}</strong></span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={ann.status}
                              onChange={(e) => handleStatusChange(ann.id, e.target.value)}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                              <option value="disponible">Disponible</option>
                              <option value="reserve">Réservé</option>
                              <option value="collecte">Collecté</option>
                            </select>
                            <button
                              onClick={() => navigate(`/annonces/${ann.id}`)}
                              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                              Voir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Paramètres</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Notifications</div>
                          <div className="text-sm text-gray-600">Recevoir des notifications</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Confidentialité</div>
                          <div className="text-sm text-gray-600">Gérer vos paramètres de confidentialité</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                        Modifier
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Aide & Support</div>
                          <div className="text-sm text-gray-600">Besoin d'aide ? Contactez-nous</div>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                        Contacter
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition w-full justify-center"
                  >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
