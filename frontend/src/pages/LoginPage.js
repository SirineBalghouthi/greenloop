import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Recycle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { sendVerificationCode } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }

    setLoading(true);

    try {
      const result = await sendVerificationCode(phone);
      navigate('/verification', { 
        state: { 
          phone: result.phone || phone,
          code: result.code, // Pour le mode dev uniquement
          devMode: result.dev_mode
        } 
      });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'envoi du code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Recycle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600">GreenLoop</h2>
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
          <p className="text-gray-600 text-center mb-8">
            Entrez votre numéro pour recevoir un code
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Format: +216 12 345 678
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition"
            >
              {loading ? 'Envoi en cours...' : 'Recevoir le code'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          Pas encore de compte ? Inscrivez-vous en 2 minutes ! 🌱
        </p>
      </div>
    </div>
  );
};

export default LoginPage;