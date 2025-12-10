import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Leaf,
  Award,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const { token, API_URL } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const wasteTypeLabels = {
    medicaments: 'Médicaments',
    plastiques: 'Plastiques',
    piles: 'Piles',
    textiles: 'Textiles',
    electronique: 'Électronique'
  };

  const wasteTypeColors = {
    medicaments: 'bg-red-500',
    plastiques: 'bg-green-500',
    piles: 'bg-yellow-500',
    textiles: 'bg-blue-500',
    electronique: 'bg-purple-500'
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme GreenLoop</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                +{stats?.users?.newThisMonth || 0} ce mois
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.users?.total || 0}
            </div>
            <div className="text-sm text-gray-600">Utilisateurs totaux</div>
            <div className="mt-4 flex gap-3 text-xs">
              <span className="text-gray-500">D: {stats?.users?.deposants || 0}</span>
              <span className="text-gray-500">C: {stats?.users?.collecteurs || 0}</span>
              <span className="text-gray-500">R: {stats?.users?.recycleurs || 0}</span>
            </div>
          </div>

          {/* Total Announcements */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.announcements?.total || 0}
            </div>
            <div className="text-sm text-gray-600">Annonces totales</div>
            <div className="mt-4 flex gap-3 text-xs">
              <span className="text-green-600">Actives: {stats?.announcements?.active || 0}</span>
              <span className="text-gray-500">Terminées: {stats?.announcements?.completed || 0}</span>
            </div>
          </div>

          {/* Collections */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.collections?.total || 0}
            </div>
            <div className="text-sm text-gray-600">Collectes totales</div>
            <div className="mt-4 text-xs text-green-600">
              {stats?.collections?.completed || 0} terminées
            </div>
          </div>

          {/* Environmental Impact */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <Leaf className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.environmentalImpact?.totalKgRecycled || 0} kg
            </div>
            <div className="text-sm text-gray-600">Déchets recyclés</div>
            <div className="mt-4 text-xs text-gray-500">
              {stats?.environmentalImpact?.totalCo2Saved || 0} kg CO₂ évité
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waste Types Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribution par type de déchet
            </h2>
            <div className="space-y-3">
              {stats?.wasteTypeStats?.map((item) => {
                const total = stats.wasteTypeStats.reduce((acc, curr) => acc + curr.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={item._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {wasteTypeLabels[item._id] || item._id}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${wasteTypeColors[item._id] || 'bg-gray-500'} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Croissance des utilisateurs (6 derniers mois)
            </h2>
            <div className="space-y-3">
              {stats?.userGrowth?.map((item) => {
                const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                const monthLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
                return (
                  <div key={`${item._id.year}-${item._id.month}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{monthLabel}</span>
                      <span className="text-sm text-gray-600">{item.count} nouveaux</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(item.count / 50) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Environmental Impact Details */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Impact Environnemental Global</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">
                {stats?.environmentalImpact?.totalKgRecycled || 0} kg
              </div>
              <div className="text-green-100">Déchets recyclés</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">
                {stats?.environmentalImpact?.totalCo2Saved || 0} kg
              </div>
              <div className="text-green-100">CO₂ évité</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">
                {stats?.environmentalImpact?.totalTreesSaved || 0}
              </div>
              <div className="text-green-100">Arbres équivalents sauvés</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;