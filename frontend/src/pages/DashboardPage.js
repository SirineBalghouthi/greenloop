import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  TrendingUp, 
  Package, 
  Award, 
  Leaf,
  Plus,
  MapPin
} from 'lucide-react';

const DashboardPage = () => {
  const { user, token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/users/stats`, {
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

  const getLevelColor = (level) => {
    const colors = {
      bronze: 'from-yellow-600 to-yellow-700',
      argent: 'from-gray-400 to-gray-500',
      or: 'from-yellow-400 to-yellow-500',
      platine: 'from-blue-400 to-purple-500'
    };
    return colors[level] || colors.bronze;
  };

  const getLevelProgress = (points) => {
    if (points >= 5000) return 100;
    if (points >= 2001) return ((points - 2001) / 2999) * 100;
    if (points >= 501) return ((points - 501) / 1500) * 100;
    return (points / 500) * 100;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header - Amélioré */}
        <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div>
            <h1 className="text-3xl font-bold">
              Bonjour, {user?.full_name}! 👋
            </h1>
            <p className="text-green-50 mt-1">
              Voici votre activité et votre impact environnemental
            </p>
          </div>
          <button
            onClick={() => navigate('/creer-annonce')}
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition shadow-md"
          >
            <Plus className="w-5 h-5" />
            Nouvelle annonce
          </button>
        </div>

        {/* Level Card - Amélioré */}
        <div className={`bg-gradient-to-r ${getLevelColor(stats?.level)} rounded-xl p-6 text-white shadow-xl`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm opacity-90 mb-1">Niveau Actuel</div>
              <div className="text-3xl font-bold capitalize">{stats?.level || 'Bronze'}</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">Points</div>
              <div className="text-3xl font-bold">{stats?.points || 0}</div>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${getLevelProgress(stats?.points || 0)}%` }}
            ></div>
          </div>
          <p className="text-sm opacity-90 mt-2">
            {stats?.points < 500 && `${500 - stats?.points} points pour Argent`}
            {stats?.points >= 500 && stats?.points < 2001 && `${2001 - stats?.points} points pour Or`}
            {stats?.points >= 2001 && stats?.points < 5000 && `${5000 - stats?.points} points pour Platine`}
            {stats?.points >= 5000 && 'Niveau maximum atteint! 🎉'}
          </p>
        </div>

        {/* Stats Grid - Amélioré */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.announcements_count || 0}
            </div>
            <div className="text-sm text-gray-600 font-medium">Annonces créées</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                <Award className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.collections_count || 0}
            </div>
            <div className="text-sm text-gray-600 font-medium">Collectes réalisées</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Leaf className="w-7 h-7 text-white" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats?.kg_recycled || 0} kg
            </div>
            <div className="text-sm text-gray-600 font-medium">Déchets recyclés</div>
          </div>
        </div>

        {/* Impact Environnemental - Amélioré */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Votre Impact Environnemental</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">
                {stats?.kg_recycled || 0} kg
              </div>
              <div className="text-green-100">Déchets recyclés</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">
                {stats?.co2_saved || 0} kg
              </div>
              <div className="text-green-100">CO₂ évité</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">
                {stats?.trees_saved || 0}
              </div>
              <div className="text-green-100">Arbres équivalents</div>
            </div>
          </div>

          <p className="text-green-100 mt-6 text-center">
            Continuez comme ça ! Chaque action compte pour la planète 🌍
          </p>
        </div>

        {/* Quick Actions - Amélioré */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/annonces')}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:border-green-500 transition text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Voir les annonces
            </h3>
            <p className="text-gray-600 text-sm">
              Découvrez les déchets disponibles près de chez vous
            </p>
          </button>

          <button
            onClick={() => navigate('/carte')}
            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg hover:border-green-500 transition text-left group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Carte interactive
            </h3>
            <p className="text-gray-600 text-sm">
              Visualisez toutes les annonces sur la carte
            </p>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;