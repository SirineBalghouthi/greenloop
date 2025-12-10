import React from 'react';
import Layout from '../components/Layout';
import { MapPin, Construction } from 'lucide-react';

const MapPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carte Interactive</h1>
          <p className="text-gray-600 mt-1">
            Visualisez toutes les annonces sur la carte
          </p>
        </div>

        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Construction className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Carte en cours de développement
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Cette fonctionnalité sera bientôt disponible avec Google Maps pour afficher toutes les annonces
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Géolocalisation</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Filtres par distance</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Optimisation itinéraires</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MapPage;