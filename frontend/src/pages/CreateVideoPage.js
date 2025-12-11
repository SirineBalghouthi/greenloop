import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Upload, ArrowLeft, Image as ImageIcon, X } from 'lucide-react';

const CreateVideoPage = () => {
  const navigate = useNavigate();
  const { token, API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    description: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('description', formData.description);
      data.append('title', 'Vidéo partagée'); // Titre par défaut
      data.append('category', 'temoignage'); // Catégorie par défaut
      data.append('waste_type', 'tous');
      data.append('video_url', ''); // URL vide car on utilise l'image
      
      if (formData.image) {
        data.append('thumbnail_url', formData.image);
      }

      await axios.post(`${API_URL}/videos`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Vidéo/Image ajoutée avec succès! 🎉');
      setTimeout(() => {
        navigate('/videos');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/videos')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ajouter depuis la galerie</h1>
            <p className="text-gray-600 mt-1">
              Partagez une image ou vidéo avec une description
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm">
          <div className="p-6 space-y-6">
            {/* Image/Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image ou Vidéo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">
                      Cliquez pour sélectionner depuis la galerie
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG, MP4 jusqu'à 10MB
                    </p>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ajoutez une description à votre image ou vidéo..."
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ImageIcon className="w-4 h-4" />
              <span>Partagez depuis votre galerie</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/videos')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || !formData.image}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition"
              >
                {loading ? 'Publication...' : 'Publier'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateVideoPage;

