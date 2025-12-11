import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Upload, MapPin, Package, ArrowLeft, Calendar, Clock, Plus, X } from 'lucide-react';

const CreateAnnouncementPage = () => {
  const navigate = useNavigate();
  const { token, API_URL } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    waste_type: 'plastiques',
    quantity: '',
    latitude: 36.8065,
    longitude: 10.1815,
    address: '',
    image: null,
    availability_schedule: []
  });

  const wasteTypes = [
    { value: 'medicaments', label: 'Médicaments', color: 'red' },
    { value: 'plastiques', label: 'Plastiques', color: 'green' },
    { value: 'piles', label: 'Piles', color: 'yellow' },
    { value: 'textiles', label: 'Textiles', color: 'blue' },
    { value: 'electronique', label: 'Électronique', color: 'purple' }
  ];

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
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('waste_type', formData.waste_type);
      data.append('quantity', formData.quantity);
      data.append('latitude', formData.latitude);
      data.append('longitude', formData.longitude);
      data.append('address', formData.address);
      data.append('availability_schedule', JSON.stringify(formData.availability_schedule));
      if (formData.image) {
        data.append('image', formData.image);
      }

      await axios.post(`${API_URL}/announcements`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Annonce créée avec succès! +10 points 🎉');
      setTimeout(() => {
        navigate('/annonces');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestCategory = async () => {
    setError('');
    setSuggestionLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/announcements/classify`,
        {
          title: formData.title,
          description: formData.description
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.category) {
        setFormData(prev => ({ ...prev, waste_type: response.data.category }));
      }
    } catch (err) {
      setError('Impossible de suggérer une catégorie pour le moment.');
    } finally {
      setSuggestionLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/annonces')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Créer une annonce</h1>
            <p className="text-gray-600 mt-1">
              Partagez vos déchets recyclables et gagnez des points
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
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (optionnelle)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">
                      Cliquez pour télécharger une photo
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG jusqu'à 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Bouteilles plastiques propres"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez vos déchets..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Waste Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de déchet *
              </label>
              <div className="flex items-center gap-2">
                <select
                  name="waste_type"
                  value={formData.waste_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {wasteTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSuggestCategory}
                  disabled={suggestionLoading || !formData.title}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50"
                >
                  {suggestionLoading ? '...' : 'Suggérer'}
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité approximative
              </label>
              <input
                type="text"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Ex: 5kg, 10 bouteilles, 1 sac..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ex: Avenue Habib Bourguiba, Tunis"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Planning de Disponibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Planning de Disponibilité (optionnel)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Définissez vos créneaux horaires disponibles pour la collecte
              </p>
              
              <div className="space-y-3">
                {formData.availability_schedule.map((schedule, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Jour</label>
                        <select
                          value={schedule.day}
                          onChange={(e) => {
                            const newSchedule = [...formData.availability_schedule];
                            newSchedule[index].day = e.target.value;
                            setFormData({...formData, availability_schedule: newSchedule});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="monday">Lundi</option>
                          <option value="tuesday">Mardi</option>
                          <option value="wednesday">Mercredi</option>
                          <option value="thursday">Jeudi</option>
                          <option value="friday">Vendredi</option>
                          <option value="saturday">Samedi</option>
                          <option value="sunday">Dimanche</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const newSchedule = formData.availability_schedule.filter((_, i) => i !== index);
                            setFormData({...formData, availability_schedule: newSchedule});
                          }}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {schedule.time_slots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => {
                              const newSchedule = [...formData.availability_schedule];
                              newSchedule[index].time_slots[slotIndex].start = e.target.value;
                              setFormData({...formData, availability_schedule: newSchedule});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <span className="text-gray-500">à</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => {
                              const newSchedule = [...formData.availability_schedule];
                              newSchedule[index].time_slots[slotIndex].end = e.target.value;
                              setFormData({...formData, availability_schedule: newSchedule});
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newSchedule = [...formData.availability_schedule];
                              newSchedule[index].time_slots = newSchedule[index].time_slots.filter((_, i) => i !== slotIndex);
                              setFormData({...formData, availability_schedule: newSchedule});
                            }}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newSchedule = [...formData.availability_schedule];
                          newSchedule[index].time_slots.push({ start: '09:00', end: '17:00' });
                          setFormData({...formData, availability_schedule: newSchedule});
                        }}
                        className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter un créneau
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      availability_schedule: [
                        ...formData.availability_schedule,
                        {
                          day: 'monday',
                          time_slots: [{ start: '09:00', end: '17:00' }]
                        }
                      ]
                    });
                  }}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un jour
                </button>
              </div>
            </div>

            {/* Coordinates (hidden for now) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="any"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package className="w-4 h-4" />
              <span>Vous gagnerez 10 points</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/annonces')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 transition"
              >
                {loading ? 'Création...' : 'Publier l\'annonce'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateAnnouncementPage;