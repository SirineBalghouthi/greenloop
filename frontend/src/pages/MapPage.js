import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLocation } from 'react-router-dom';
import { MapPin, Filter, X, Heart, Navigation } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Couleurs par type de déchet (selon spécifications)
const wasteTypeColors = {
  medicaments: '#ef4444', // Rouge
  plastiques: '#10b981', // Vert
  piles: '#fbbf24', // Jaune (#f59e0b -> #fbbf24 pour plus de jaune)
  textiles: '#3b82f6', // Bleu
  electronique: '#8b5cf6' // Violet
};

const wasteTypeLabels = {
  medicaments: 'Médicaments',
  plastiques: 'Plastiques',
  piles: 'Piles',
  textiles: 'Textiles',
  electronique: 'Électronique'
};

// Composant pour centrer la carte sur la position de l'utilisateur
function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// Créer une icône personnalisée avec couleur
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.4);">
      <div style="transform: rotate(45deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 14px; font-weight: bold;">🗑️</span>
      </div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const MapPage = () => {
  const { token, API_URL } = useAuth();
  const location = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([36.8065, 10.1815]); // Tunis par défaut
  const [mapZoom, setMapZoom] = useState(12);
  const [highlightedAnnouncement, setHighlightedAnnouncement] = useState(null);
  
  // Filtres
  const [filters, setFilters] = useState({
    waste_type: '',
    distance: '',
    quantity: '',
    status: '', // Par défaut, afficher tous les statuts
    date: '' // Filtre par date
  });

  // Charger les annonces
  useEffect(() => {
    loadAnnouncements();
    getUserLocation();
    
    // Vérifier si on vient d'une autre page avec des paramètres
    if (location.state) {
      if (location.state.center) {
        setMapCenter(location.state.center);
        setMapZoom(location.state.zoom || 15);
      }
      if (location.state.highlightAnnouncement) {
        setHighlightedAnnouncement(location.state.highlightAnnouncement);
      }
    }
  }, [filters, location.state]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
        },
        (err) => {
          console.log('Erreur géolocalisation:', err);
        }
      );
    }
  };

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.waste_type) params.append('waste_type', filters.waste_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.quantity) params.append('quantity', filters.quantity);
      if (filters.date) params.append('date', filters.date);
      if (userLocation) {
        params.append('latitude', userLocation.lat);
        params.append('longitude', userLocation.lng);
        if (filters.distance) params.append('distance', filters.distance);
      }

      const response = await fetch(`${API_URL}/announcements?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnnouncements(data.announcements);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Erreur lors du chargement des annonces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (announcementId) => {
    if (!token) {
      alert('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      // Vérifier si déjà en favoris
      const checkResponse = await fetch(`${API_URL}/favorites/check/${announcementId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const checkData = await checkResponse.json();

      if (checkData.isFavorite) {
        // Retirer des favoris
        await fetch(`${API_URL}/favorites/${announcementId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Ajouter aux favoris
        await fetch(`${API_URL}/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ announcement_id: announcementId })
        });
      }

      // Recharger pour mettre à jour l'état
      loadAnnouncements();
    } catch (err) {
      console.error('Erreur toggleFavorite:', err);
    }
  };

  const resetFilters = () => {
    setFilters({
      waste_type: '',
      distance: '',
      quantity: '',
      status: '',
      date: ''
    });
  };

  return (
    <Layout>
      <div className="h-screen flex flex-col">
        {/* Header avec bouton filtres */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between z-10">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Carte Interactive (Tous)</h1>
            <p className="text-sm text-gray-600">{announcements.length} annonce(s) trouvée(s)</p>
          </div>
          
          {/* Légende des couleurs */}
          <div className="hidden lg:flex items-center gap-3 mr-4 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteTypeColors.medicaments }}></div>
              <span className="text-gray-700">Médicaments</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteTypeColors.plastiques }}></div>
              <span className="text-gray-700">Plastiques</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteTypeColors.piles }}></div>
              <span className="text-gray-700">Piles</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteTypeColors.textiles }}></div>
              <span className="text-gray-700">Textiles</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: wasteTypeColors.electronique }}></div>
              <span className="text-gray-700">Électronique</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {userLocation && (
              <button
                onClick={() => {
                  setMapCenter([userLocation.lat, userLocation.lng]);
                  setMapZoom(15);
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Ma position
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtres
            </button>
          </div>
        </div>

        {/* Sidebar Filtres */}
        {showFilters && (
          <div className="absolute left-4 top-24 bg-white rounded-xl shadow-xl p-6 z-20 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Filtres</h2>
              <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type de déchet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de déchet</label>
                <select
                  value={filters.waste_type}
                  onChange={(e) => setFilters({...filters, waste_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tous les types</option>
                  {Object.entries(wasteTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Distance */}
              {userLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
                  <select
                    value={filters.distance}
                    onChange={(e) => setFilters({...filters, distance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Toutes distances</option>
                    <option value="1">1 km</option>
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="20">20 km</option>
                  </select>
                </div>
              )}

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Tous les statuts</option>
                  <option value="disponible">Disponible</option>
                  <option value="reserve">Réservé</option>
                  <option value="collecte">Collecté</option>
                </select>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantité minimale</label>
                <input
                  type="number"
                  value={filters.quantity}
                  onChange={(e) => setFilters({...filters, quantity: e.target.value})}
                  placeholder="Ex: 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Date de publication */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de publication</label>
                <select
                  value={filters.date}
                  onChange={(e) => setFilters({...filters, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Toutes les dates</option>
                  <option value={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}>Aujourd'hui</option>
                  <option value={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}>Cette semaine</option>
                  <option value={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}>Ce mois</option>
                  <option value={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()}>3 derniers mois</option>
                </select>
              </div>

              {/* Boutons */}
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Carte */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement de la carte...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapCenter center={mapCenter} zoom={mapZoom} />
              
              {announcements.map((ann) => {
                const isHighlighted = highlightedAnnouncement === ann.id || highlightedAnnouncement === ann._id;
                return (
                  <Marker
                    key={ann.id || ann._id}
                    position={[ann.latitude, ann.longitude]}
                    icon={createCustomIcon(
                      isHighlighted ? '#ff0000' : (wasteTypeColors[ann.waste_type] || '#6b7280')
                    )}
                  >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <div className="flex items-start justify-between mb-2">
                        <h3 
                          className="font-bold text-gray-900 cursor-pointer hover:text-green-600"
                          onClick={() => window.location.href = `/annonces/${ann.id || ann._id}`}
                        >
                          {ann.title}
                        </h3>
                        {token && (
                          <button
                            onClick={() => toggleFavorite(ann.id || ann._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{ann.description}</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Type:</span>
                          <span className="px-2 py-1 rounded text-white" style={{ backgroundColor: wasteTypeColors[ann.waste_type] }}>
                            {wasteTypeLabels[ann.waste_type]}
                          </span>
                        </div>
                        <div><span className="font-semibold">Quantité:</span> {ann.quantity}</div>
                        {ann.distance && (
                          <div><span className="font-semibold">Distance:</span> {ann.distance} km</div>
                        )}
                        <div><span className="font-semibold">Adresse:</span> {ann.address || 'Non spécifiée'}</div>
                        <div><span className="font-semibold">Déposant:</span> {ann.user_name}</div>
                      </div>
                      {ann.image_url && (
                        <img 
                          src={`${API_URL.replace('/api', '')}${ann.image_url}`} 
                          alt={ann.title}
                          className="mt-2 w-full h-24 object-cover rounded cursor-pointer"
                          onClick={() => window.location.href = `/annonces/${ann.id || ann._id}`}
                        />
                      )}
                      <button
                        onClick={() => window.location.href = `/annonces/${ann.id || ann._id}`}
                        className="mt-2 w-full px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        Voir les détails
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
              })}
            </MapContainer>
          )}
        </div>

        {error && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-30">
            {error}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MapPage;
