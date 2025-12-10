import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Leaf, Users, MapPin, TrendingUp, Award } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: 'Carte Interactive',
      description: 'Trouvez les déchets près de chez vous avec filtres par type et distance'
    },
    {
      icon: Users,
      title: 'Communauté Active',
      description: 'Connectez déposants, collecteurs et recycleurs en toute simplicité'
    },
    {
      icon: TrendingUp,
      title: 'Optimisation Routes',
      description: 'Calculez le meilleur itinéraire pour collecter plusieurs déchets'
    },
    {
      icon: Award,
      title: 'Gamification',
      description: 'Gagnez des points, badges et montez de niveau en recyclant'
    },
    {
      icon: Leaf,
      title: 'Impact Mesurable',
      description: 'Suivez votre contribution : kg recyclés, CO₂ évité, arbres sauvés'
    },
    {
      icon: Recycle,
      title: '5 Types de Déchets',
      description: 'Médicaments, plastiques, piles, textiles et électronique'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-green-600">GreenLoop</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 text-green-600 font-medium hover:text-green-700 transition"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
              >
                Inscription
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transformez vos déchets
            <br />
            <span className="text-green-600">en ressources</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            GreenLoop connecte déposants, collecteurs et recycleurs en Tunisie.
            Recyclez facilement, gagnez des points et mesurez votre impact environnemental.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-green-600 transition shadow-lg"
            >
              Commencer Gratuitement
            </button>
            <button className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold text-lg hover:bg-gray-50 transition border-2 border-green-500">
              En Savoir Plus
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">20K+</div>
            <div className="text-gray-600">Utilisateurs Actifs</div>
          </div>
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">5K+</div>
            <div className="text-gray-600">Transactions/Mois</div>
          </div>
          <div className="bg-white rounded-xl p-8 text-center shadow-lg">
            <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
            <div className="text-gray-600">Partenaires</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Fonctionnalités Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-6 rounded-xl border border-gray-200 hover:border-green-500 transition">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à faire la différence ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers d'utilisateurs qui recyclent intelligemment
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-white text-green-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition"
          >
            Créer mon compte
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">GreenLoop</span>
            </div>
            <p className="text-gray-400">
              © 2024 GreenLoop - ISITCOM. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;