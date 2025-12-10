import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au chargement
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Récupérer les infos utilisateur si token existe
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Envoyer le code de vérification
  const sendVerificationCode = async (phone) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l\'envoi du code');
      }

      return data;
    } catch (error) {
      console.error('Erreur sendVerificationCode:', error);
      throw error;
    }
  };

  // Vérifier le code et se connecter
  const verifyCode = async (phone, code, userData = {}) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone,
          code,
          ...userData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Si besoin d'inscription
        if (data.needsRegistration) {
          throw new Error('INSCRIPTION_REQUIRED');
        }
        throw new Error(data.message || 'Code invalide');
      }

      // Si succès, connecter l'utilisateur
      if (data.token && data.user) {
        login(data.user, data.token);
      }

      return data;
    } catch (error) {
      console.error('Erreur verifyCode:', error);
      throw error;
    }
  };

  const login = (userData, authToken) => {
    // ✅ IMPORTANT: Stocker uniquement les données nécessaires
    console.log('AuthContext login - userData:', userData);
    console.log('AuthContext login - authToken:', authToken);
    
    // S'assurer que userData est un objet propre
    const cleanUserData = {
      userId: userData.id || userData.userId,
      full_name: userData.full_name,
      phone: userData.phone,
      user_type: userData.user_type,
      points: userData.points || 0,
      level: userData.level || 'bronze'
    };
    
    setUser(cleanUserData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    
    // ❌ NE PAS stocker l'objet user dans localStorage
    // localStorage.setItem('user', JSON.stringify(userData)); // À ÉVITER
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // Au cas où
  };

  // URL de l'API backend
  const API_URL = 'http://localhost:5000/api';

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token,
    sendVerificationCode,
    verifyCode,
    API_URL
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};