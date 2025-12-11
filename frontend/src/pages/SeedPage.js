import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Sparkles, TrendingUp } from 'lucide-react';

const SeedPage = () => {
  const { token, API_URL, user } = useAuth();
  const [seed, setSeed] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadSeed();
    }
  }, [token]);

  const loadSeed = async () => {
    try {
      const response = await axios.get(`${API_URL}/seed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeed(response.data.seed);
    } catch (error) {
      console.error('Erreur chargement graine:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageInfo = (stage) => {
    const stages = {
      seed: {
        emoji: '🌱',
        name: 'Graine',
        description: 'Votre aventure commence ici!',
        color: 'from-green-400 to-green-600',
        nextStage: 'sprout',
        pointsRequired: 501
      },
      sprout: {
        emoji: '🌿',
        name: 'Pousse',
        description: 'Votre graine grandit!',
        color: 'from-green-500 to-emerald-600',
        nextStage: 'plant',
        pointsRequired: 2001
      },
      plant: {
        emoji: '🌳',
        name: 'Plante',
        description: 'Vous devenez un vrai champion du recyclage!',
        color: 'from-emerald-500 to-teal-600',
        nextStage: 'tree',
        pointsRequired: 5000
      },
      tree: {
        emoji: '🌲',
        name: 'Arbre',
        description: 'Niveau maximum atteint! Vous êtes un héros de l\'environnement!',
        color: 'from-teal-500 to-cyan-600',
        nextStage: null,
        pointsRequired: null
      }
    };
    return stages[stage] || stages.seed;
  };

  const getProgressPercentage = (points, currentStage) => {
    const stageInfo = getStageInfo(currentStage);
    if (!stageInfo.nextStage) return 100;
    
    const prevStage = currentStage === 'sprout' ? 'seed' : 
                     currentStage === 'plant' ? 'sprout' : 'plant';
    const prevInfo = getStageInfo(prevStage);
    const currentPoints = points - prevInfo.pointsRequired;
    const neededPoints = stageInfo.pointsRequired - prevInfo.pointsRequired;
    return Math.min(100, Math.max(0, (currentPoints / neededPoints) * 100));
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

  if (!seed) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">Chargement de votre graine...</p>
        </div>
      </Layout>
    );
  }

  const stageInfo = getStageInfo(seed.current_stage);
  const progress = getProgressPercentage(seed.points, seed.current_stage);
  const pointsToNext = stageInfo.nextStage 
    ? stageInfo.pointsRequired - seed.points 
    : 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ma Graine Virtuelle 🌱</h1>
          <p className="text-gray-600 mt-1">
            Votre graine grandit avec vos points de recyclage!
          </p>
        </div>

        {/* Seed Card */}
        <div className={`bg-gradient-to-r ${stageInfo.color} rounded-xl p-8 text-white text-center`}>
          <div className="text-8xl mb-4 animate-pulse">
            {stageInfo.emoji}
          </div>
          <h2 className="text-3xl font-bold mb-2">{stageInfo.name}</h2>
          <p className="text-lg opacity-90 mb-6">{stageInfo.description}</p>
          
          {/* Points */}
          <div className="bg-white/20 rounded-lg p-4 mb-4">
            <div className="text-4xl font-bold mb-1">{seed.points || 0}</div>
            <div className="text-sm opacity-90">Points totaux</div>
          </div>

          {/* Progress Bar */}
          {stageInfo.nextStage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progression vers {getStageInfo(stageInfo.nextStage).name}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              {pointsToNext > 0 && (
                <p className="text-sm opacity-90">
                  {pointsToNext} points pour évoluer vers {getStageInfo(stageInfo.nextStage).name} {getStageInfo(stageInfo.nextStage).emoji}
                </p>
              )}
            </div>
          )}

          {!stageInfo.nextStage && (
            <div className="bg-white/20 rounded-lg p-4">
              <p className="text-lg font-semibold">🎉 Niveau maximum atteint!</p>
              <p className="text-sm opacity-90 mt-1">Vous êtes un vrai héros de l'environnement!</p>
            </div>
          )}
        </div>

        {/* Growth History */}
        {seed.growth_history && seed.growth_history.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              Historique d'évolution
            </h3>
            <div className="space-y-3">
              {seed.growth_history.map((milestone, index) => {
                const milestoneInfo = getStageInfo(milestone.stage);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-3xl">{milestoneInfo.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {milestoneInfo.name} atteint!
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(milestone.achieved_at).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} - {milestone.points_required} points
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Comment faire grandir votre graine?
          </h3>
          <ul className="space-y-2 text-green-800 text-sm">
            <li>• Créez des annonces (+10 points)</li>
            <li>• Collectez des déchets (+50 points)</li>
            <li>• Vendez des créations recyclées (+points selon le montant)</li>
            <li>• Partagez des vidéos éducatives</li>
            <li>• Engagez-vous dans la communauté</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default SeedPage;

