import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  Search, 
  Play, 
  Heart, 
  Share2, 
  Filter,
  Download,
  Clock,
  Eye,
  Plus
} from 'lucide-react';

const VideosPage = () => {
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    waste_type: ''
  });

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'tutoriel_diy', label: 'Tutoriels DIY' },
    { value: 'avant_apres', label: 'Avant/Après' },
    { value: 'guide_tri', label: 'Guides de tri' },
    { value: 'impact_environnemental', label: 'Impact environnemental' },
    { value: 'temoignage', label: 'Témoignages' }
  ];

  const wasteTypes = [
    { value: '', label: 'Tous les types' },
    { value: 'medicaments', label: 'Médicaments' },
    { value: 'plastiques', label: 'Plastiques' },
    { value: 'piles', label: 'Piles' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronique', label: 'Électronique' }
  ];

  useEffect(() => {
    loadVideos();
  }, [filters, searchTerm]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.waste_type) params.waste_type = filters.waste_type;
      if (searchTerm) params.search = searchTerm;

      const response = await axios.get(`${API_URL}/videos`, { params });
      setVideos(response.data.videos || []);
    } catch (error) {
      console.error('Erreur chargement vidéos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId) => {
    try {
      await axios.post(`${API_URL}/videos/${videoId}/like`);
      loadVideos();
    } catch (error) {
      console.error('Erreur like:', error);
    }
  };

  const handleShare = async (videoId) => {
    try {
      await axios.post(`${API_URL}/videos/${videoId}/share`);
      if (navigator.share) {
        await navigator.share({
          title: 'Vidéo GreenLoop',
          text: 'Regardez cette vidéo éducative sur le recyclage!',
          url: window.location.href
        });
      }
      loadVideos();
    } catch (error) {
      console.error('Erreur share:', error);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vidéos Éducatives</h1>
            <p className="text-gray-600 mt-1">
              Apprenez le recyclage avec nos tutoriels et guides
            </p>
          </div>
          {token && (
            <button
              onClick={() => navigate('/videos/create')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Ajouter une vidéo
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par mot-clé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            {/* Waste Type Filter */}
            <select
              value={filters.waste_type}
              onChange={(e) => setFilters({...filters, waste_type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {wasteTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune vidéo trouvée
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/videos/${video._id}`)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gray-200">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url.startsWith('http') ? video.thumbnail_url : `${API_URL.replace('/api', '')}${video.thumbnail_url}`}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {video.duration > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(video.duration)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {video.likes || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      {video.shares || 0}
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {categories.find(c => c.value === video.category)?.label || video.category}
                    </span>
                    {video.is_offline_available && (
                      <Download className="w-4 h-4 text-gray-400" />
                    )}
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

export default VideosPage;

