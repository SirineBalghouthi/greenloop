import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  Search, 
  ShoppingBag, 
  Filter,
  Eye,
  TrendingUp,
  Plus
} from 'lucide-react';

const MarketplacePage = () => {
  const { token, API_URL } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    material_source: '',
    sort: 'created_at'
  });

  const categories = [
    { value: '', label: 'Toutes les catégories' },
    { value: 'meubles', label: 'Meubles' },
    { value: 'deco', label: 'Déco' },
    { value: 'bijoux', label: 'Bijoux' },
    { value: 'sacs', label: 'Sacs' },
    { value: 'art', label: 'Art' },
    { value: 'autre', label: 'Autre' }
  ];

  const materialSources = [
    { value: '', label: 'Tous les matériaux' },
    { value: 'medicaments', label: 'Médicaments' },
    { value: 'plastiques', label: 'Plastiques' },
    { value: 'piles', label: 'Piles' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronique', label: 'Électronique' },
    { value: 'mixte', label: 'Mixte' }
  ];

  useEffect(() => {
    loadProducts();
  }, [filters, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = { status: 'active' };
      if (filters.category) params.category = filters.category;
      if (filters.material_source) params.material_source = filters.material_source;
      if (searchTerm) params.search = searchTerm;
      if (filters.sort) params.sort = filters.sort;

      const response = await axios.get(`${API_URL}/marketplace`, { params });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketplace Créative 🛍️</h1>
            <p className="text-gray-600 mt-1">
              Découvrez des créations uniques à partir de déchets recyclés
            </p>
          </div>
          {token && (
            <button
              onClick={() => navigate('/marketplace/create')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Vendre un produit
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
                placeholder="Rechercher un produit..."
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

            {/* Material Filter */}
            <select
              value={filters.material_source}
              onChange={(e) => setFilters({...filters, material_source: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {materialSources.map(mat => (
                <option key={mat.value} value={mat.value}>{mat.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={filters.sort}
              onChange={(e) => setFilters({...filters, sort: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="created_at">Plus récent</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="popular">Plus populaire</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun produit trouvé
            </h3>
            <p className="text-gray-600">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/marketplace/${product._id}`)}
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].startsWith('http') ? product.images[0] : `${API_URL.replace('/api', '')}${product.images[0]}`}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Épuisé
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {product.views || 0}
                    </div>
                    {product.sales_count > 0 && (
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        {product.sales_count} ventes
                      </div>
                    )}
                  </div>

                  {/* Price and Category */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-green-600">
                      {product.price} TND
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {categories.find(c => c.value === product.category)?.label || product.category}
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

export default MarketplacePage;

