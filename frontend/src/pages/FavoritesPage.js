import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Trash2, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const FavoritesPage = () => {
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadFavorites();
  }, [token, navigate]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement des favoris');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (announcementId) => {
    try {
      const response = await fetch(`${API_URL}/favorites/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setFavorites(favorites.filter(fav => fav.announcement_id !== announcementId));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const openInMap = (announcement) => {
    navigate('/map', {
      state: {
        center: [announcement.latitude, announcement.longitude],
        zoom: 15
      }
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de vos favoris...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            Mes Favoris
          </h1>
          <p className="text-gray-600 mt-1">
            {favorites.length} annonce(s) sauvegardée(s)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
            {error}
          </div>
        )}

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun favori pour le moment
            </h3>
            <p className="text-gray-600 mb-6">
              Explorez la carte et ajoutez des annonces à vos favoris en cliquant sur l'icône cœur
            </p>
            <button
              onClick={() => navigate('/carte')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center gap-2 mx-auto"
            >
              <MapPin className="w-5 h-5" />
              Explorer la carte
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const ann = favorite.announcement;
              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {ann.image_url && (
                    <img
                      src={`${API_URL.replace('/api', '')}${ann.image_url}`}
                      alt={ann.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {ann.title}
                      </h3>
                      <button
                        onClick={() => removeFavorite(ann.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Retirer des favoris"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {ann.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: wasteTypeColors[ann.waste_type] }}
                      >
                        {wasteTypeLabels[ann.waste_type]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {ann.quantity}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {ann.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{ann.address}</span>
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">Déposant:</span> {ann.user_name}
                      </div>
                      {ann.distance && (
                        <div>
                          <span className="font-semibold">Distance:</span> {ann.distance} km
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openInMap(ann)}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-2 text-sm font-semibold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Voir sur la carte
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;

