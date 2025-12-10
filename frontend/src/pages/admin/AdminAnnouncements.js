import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { 
  Search, 
  Package,
  Trash2,
  Eye,
  MapPin,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';

const AdminAnnouncements = () => {
  const { token, API_URL } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    waste_type: 'all',
    status: 'all',
    page: 1
  });
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const wasteTypes = [
    { value: 'all', label: 'Tous les types' },
    { value: 'medicaments', label: 'Médicaments', color: 'red' },
    { value: 'plastiques', label: 'Plastiques', color: 'green' },
    { value: 'piles', label: 'Piles', color: 'yellow' },
    { value: 'textiles', label: 'Textiles', color: 'blue' },
    { value: 'electronique', label: 'Électronique', color: 'purple' }
  ];

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setAnnouncements(response.data.announcements);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, filters]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette annonce?')) {
      return;
    }

    try {
      setActionLoading(announcementId);
      await axios.delete(`${API_URL}/admin/announcements/${announcementId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  };

  const getWasteTypeColor = (type) => {
    const wasteType = wasteTypes.find(w => w.value === type);
    return wasteType?.color || 'gray';
  };

  const getStatusBadge = (status) => {
    const badges = {
      disponible: { label: 'Disponible', class: 'bg-green-100 text-green-700' },
      reserve: { label: 'Réservé', class: 'bg-yellow-100 text-yellow-700' },
      collecte: { label: 'Collecté', class: 'bg-blue-100 text-blue-700' }
    };
    return badges[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Annonces</h1>
            <p className="text-gray-600 mt-1">
              {announcements.length} annonces au total
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
            <Package className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-600">{announcements.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filters.waste_type}
                onChange={(e) => setFilters({ ...filters, waste_type: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {wasteTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="disponible">Disponibles</option>
                <option value="reserve">Réservées</option>
                <option value="collecte">Collectées</option>
              </select>
            </div>
          </div>
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune annonce trouvée</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((announcement) => {
                const statusInfo = getStatusBadge(announcement.status);
                return (
                  <div
                    key={announcement._id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
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
                      
                      {/* Badges */}
                      <div className={`absolute top-3 left-3 px-3 py-1 bg-${getWasteTypeColor(announcement.waste_type)}-500 text-white text-xs font-medium rounded-full`}>
                        {wasteTypes.find(w => w.value === announcement.waste_type)?.label}
                      </div>
                      
                      <div className={`absolute top-3 right-3 px-3 py-1 ${statusInfo.class} text-xs font-medium rounded-full`}>
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                        {announcement.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {announcement.description || 'Pas de description'}
                      </p>

                      {/* User Info */}
                      {announcement.user_id && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <User className="w-4 h-4" />
                          <span>{announcement.user_id.full_name}</span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {announcement.user_id.role}
                          </span>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{announcement.address || 'Non spécifié'}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(announcement.created_at)}</span>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                          disabled={actionLoading === announcement._id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm font-medium">Supprimer</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-700">
                  Page {filters.page} sur {totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncements;