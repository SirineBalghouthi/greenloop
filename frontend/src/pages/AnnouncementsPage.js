import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  Search, 
  Plus, 
  Heart, 
  MapPin, 
  Clock,
  Package
} from 'lucide-react';

const AnnouncementsPage = () => {
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const wasteTypes = [
    { value: 'all', label: 'Tous', color: 'gray' },
    { value: 'medicaments', label: 'Médicaments', color: 'red' },
    { value: 'plastiques', label: 'Plastiques', color: 'green' },
    { value: 'piles', label: 'Piles', color: 'yellow' },
    { value: 'textiles', label: 'Textiles', color: 'blue' },
    { value: 'electronique', label: 'Électronique', color: 'purple' }
  ];

  const loadAnnouncements = useCallback(async () => {
    try {
      const params = {};
      if (filterType !== 'all') {
        params.waste_type = filterType;
      }
      params.status = 'disponible';

      const response = await axios.get(`${API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType, API_URL, token]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const getWasteColor = (type) => {
    const wasteType = wasteTypes.find(w => w.value === type);
    return wasteType?.color || 'gray';
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Annonces</h1>
            <p className="text-gray-600 mt-1">
              Trouvez les annonces et collecteurs près de chez vous
            </p>
          </div>
          <button
            onClick={() => navigate('/creer-annonce')}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
          >
            <Plus className="w-5 h-5" />
            Créer
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {wasteTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filterType === type.value
                    ? `bg-${type.color}-500 text-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune annonce trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos filtres ou créez une nouvelle annonce
            </p>
            <button
              onClick={() => navigate('/creer-annonce')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
            >
              Créer une annonce
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/annonces/${announcement.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {announcement.image_url ? (
                    <img
                      src={`${API_URL.replace('/api', '')}${announcement.image_url}`}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 bg-${getWasteColor(announcement.waste_type)}-500 text-white text-xs font-medium rounded-full`}>
                    {wasteTypes.find(w => w.value === announcement.waste_type)?.label}
                  </div>

                  {/* Favorite Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {announcement.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {announcement.description || 'Pas de description'}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{announcement.address || 'Non spécifié'}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(announcement.created_at)}</span>
                    </div>
                    <span className="text-xs text-gray-500 capitalize">
                      {announcement.user_type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AnnouncementsPage;