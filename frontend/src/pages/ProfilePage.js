import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { 
  User, 
  Phone, 
  MapPin, 
  Edit2, 
  Save,
  Award,
  Leaf,
  Trash2
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    address: user?.address || '',
    city: user?.city || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess('Profil mis à jour avec succès!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      address: user?.address || '',
      city: user?.city || ''
    });
    setIsEditing(false);
    setError('');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {success}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium capitalize mt-1">
                  {user?.user_type}
                </span>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition"
              >
                <Edit2 className="w-4 h-4" />
                Modifier mon profil
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={user?.phone}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Le numéro de téléphone ne peut pas être modifié
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse ou zone
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Rue X, Quartier Y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Tunis, Sousse, Sfax..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                    <div className="font-medium text-gray-900">{user?.phone}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Adresse</div>
                    <div className="font-medium text-gray-900">
                      {user?.address || 'Non renseigné'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Ville</div>
                    <div className="font-medium text-gray-900">
                      {user?.city || 'Non renseigné'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-sm text-gray-500">Date d'inscription</div>
                    <div className="font-medium text-gray-900">
                      {new Date(user?.created_at || Date.now()).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {user?.points || 12}
            </div>
            <div className="text-sm text-gray-600 mb-1">Annonces</div>
          </div>

          <div className="bg-green-100 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {user?.points || 45}
            </div>
            <div className="text-sm text-gray-600 mb-1">Points</div>
          </div>

          <div className="bg-blue-100 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              8
            </div>
            <div className="text-sm text-gray-600 mb-1">Mes Collectes</div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-8 text-white">
          <div className="flex items-center gap-3 mb-6">
            <Leaf className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Mon Impact Environnemental</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl font-bold mb-1">
                {user?.kg_recycled || '0'} kg
              </div>
              <div className="text-green-100">Déchets recyclés</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                {user?.co2_saved || '0'} kg
              </div>
              <div className="text-green-100">CO₂ évité</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">
                {user?.trees_saved || '0'}
              </div>
              <div className="text-green-100">Arbres sauvés</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;