import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield, Recycle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VerificationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyCode: verifyCodeAPI, sendVerificationCode } = useAuth();
  
  const phone = location.state?.phone || '';
  const devCode = location.state?.code; // Code en mode dev
  const devMode = location.state?.devMode;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [userData, setUserData] = useState({
    full_name: '',
    user_type: 'deposant',
    address: '',
    city: ''
  });
  const [resendTimer, setResendTimer] = useState(60);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  // Timer pour renvoyer le code
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-remplir le code en mode dev
  React.useEffect(() => {
    if (devCode && devMode) {
      const codeArray = devCode.split('');
      setCode(codeArray);
    }
  }, [devCode, devMode]);

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez entrer les 6 chiffres');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // D'abord vérifier le code sans données utilisateur
      const result = await verifyCodeAPI(phone, fullCode, {});
      
      // Si succès, vérifier si c'est une inscription ou connexion
      if (result.message === 'Connexion réussie') {
        navigate('/dashboard');
      } else if (result.message === 'Inscription réussie') {
        navigate('/dashboard');
      } else if (result.needsRegistration) {
        // Code valide mais besoin d'inscription
        setShowRegisterForm(true);
      }
    } catch (err) {
      if (err.message === 'INSCRIPTION_REQUIRED') {
        // Code valide, afficher le formulaire d'inscription
        setShowRegisterForm(true);
      } else {
        setError(err.message || 'Code invalide');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    setError('');
    try {
      const result = await sendVerificationCode(phone);
      setResendTimer(60);
      setCode(['', '', '', '', '', '']);
      // Mettre à jour le code en mode dev si disponible
      if (result.code && result.dev_mode) {
        const codeArray = result.code.split('');
        setCode(codeArray);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du renvoi du code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!userData.full_name || !userData.user_type) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const fullCode = code.join('');
      await verifyCodeAPI(phone, fullCode, userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (showRegisterForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button 
            onClick={() => setShowRegisterForm(false)}
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

            <h1 className="text-2xl font-bold text-center mb-2">Inscription</h1>
            <p className="text-gray-600 text-center mb-8">
              Complétez votre profil pour continuer
            </p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  type="text"
                  value={userData.full_name}
                  onChange={(e) => setUserData({...userData, full_name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de compte *
                </label>
                <select
                  value={userData.user_type}
                  onChange={(e) => setUserData({...userData, user_type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="deposant">Déposant</option>
                  <option value="collecteur">Collecteur</option>
                  <option value="entreprise">Entreprise</option>
                  <option value="point_collecte">Point de Collecte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={userData.address}
                  onChange={(e) => setUserData({...userData, address: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={userData.city}
                  onChange={(e) => setUserData({...userData, city: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
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
                {loading ? 'Inscription...' : 'Créer mon compte'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/login')}
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

          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-center mb-2">Vérification</h1>
          <p className="text-gray-600 text-center mb-2">
            Entrez le code reçu par SMS
          </p>
          <p className="text-green-600 text-center font-medium mb-8">
            Code envoyé au {phone}
          </p>

          <div className="flex gap-2 justify-center mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-500"
              />
            ))}
          </div>

          {devMode && devCode && (
            <p className="text-sm text-center text-green-600 mb-6 font-semibold">
              Mode développement - Code: <span className="font-mono font-bold">{devCode}</span>
            </p>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 transition mb-4"
          >
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>

          <button 
            onClick={handleResendCode}
            disabled={resendTimer > 0 || loading}
            className="text-green-600 hover:underline text-sm block mx-auto disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `Renvoyer dans ${resendTimer}s` : 'Renvoyer le code'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerificationPage;