import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Eye,
  User,
  Package
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, API_URL, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderData, setOrderData] = useState({
    shipping_address: '',
    payment_method: 'card'
  });

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/marketplace/${id}`);
      setProduct(response.data.product);
    } catch (error) {
      console.error('Erreur chargement produit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!token) {
      alert('Connectez-vous pour commander');
      navigate('/login');
      return;
    }

    if (!orderData.shipping_address) {
      alert('Veuillez entrer une adresse de livraison');
      return;
    }

    try {
      setOrderLoading(true);
      const response = await axios.post(
        `${API_URL}/marketplace/${id}/order`,
        {
          quantity,
          shipping_address: orderData.shipping_address,
          payment_method: orderData.payment_method
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Commande créée avec succès!');
      navigate('/marketplace/my-orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setOrderLoading(false);
    }
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

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produit non trouvé</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-green-600 hover:text-green-700"
          >
            Retour à la marketplace
          </button>
        </div>
      </Layout>
    );
  }

  const isOwner = token && user && product.user_id && product.user_id._id === user.id;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à la marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-gray-200 rounded-xl overflow-hidden aspect-square">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].startsWith('http') ? product.images[0] : `${API_URL.replace('/api', '')}${product.images[0]}`}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1, 5).map((img, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg overflow-hidden aspect-square">
                    <img
                      src={img.startsWith('http') ? img : `${API_URL.replace('/api', '')}${img}`}
                      alt={`${product.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.title}
              </h1>
              {product.user_id && (
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <User className="w-4 h-4" />
                  <span>Par {product.user_id.full_name}</span>
                </div>
              )}
              <div className="text-4xl font-bold text-green-600 mb-4">
                {product.price} TND
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Catégorie:</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Matériau source:</span>
                <span className="font-medium">{product.material_source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stock disponible:</span>
                <span className="font-medium">{product.stock} unité(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vues:</span>
                <span className="font-medium flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {product.views || 0}
                </span>
              </div>
            </div>

            {/* Order Section */}
            {!isOwner && product.status === 'active' && product.stock > 0 && (
              <div className="border-t border-gray-200 pt-6">
                {!showOrderForm ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-gray-700">Quantité:</label>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(product.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <span className="text-gray-600">sur {product.stock} disponible(s)</span>
                    </div>
                    <button
                      onClick={() => setShowOrderForm(true)}
                      className="w-full px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Commander maintenant
                    </button>
                    <p className="text-sm text-gray-500 text-center">
                      Commission de 5% sur chaque vente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adresse de livraison *
                      </label>
                      <textarea
                        value={orderData.shipping_address}
                        onChange={(e) => setOrderData({...orderData, shipping_address: e.target.value})}
                        placeholder="Entrez votre adresse complète"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Méthode de paiement
                      </label>
                      <select
                        value={orderData.payment_method}
                        onChange={(e) => setOrderData({...orderData, payment_method: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      >
                        <option value="card">Carte bancaire</option>
                        <option value="bank_transfer">Virement bancaire</option>
                        <option value="mobile_payment">Paiement mobile</option>
                      </select>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Prix unitaire:</span>
                        <span>{product.price} TND</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Quantité:</span>
                        <span>{quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Commission (5%):</span>
                        <span>{(product.price * quantity * 0.05).toFixed(2)} TND</span>
                      </div>
                      <div className="border-t border-blue-200 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{(product.price * quantity * 1.05).toFixed(2)} TND</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowOrderForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleOrder}
                        disabled={orderLoading}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        {orderLoading ? 'Traitement...' : 'Confirmer la commande'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isOwner && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Ceci est votre produit. Vous pouvez le modifier depuis votre profil.
                </p>
              </div>
            )}

            {product.stock === 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">
                  Ce produit est actuellement épuisé.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;

