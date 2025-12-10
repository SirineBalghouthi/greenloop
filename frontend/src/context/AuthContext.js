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

  const login = (userData, authToken) => {
    // ✅ IMPORTANT: Stocker uniquement les données nécessaires
    console.log('AuthContext login - userData:', userData);
    console.log('AuthContext login - authToken:', authToken);
    
    // S'assurer que userData est un objet propre
    const cleanUserData = {
      userId: userData.userId,
      full_name: userData.full_name,
      phone: userData.phone,
      user_type: userData.user_type,
      points: userData.points,
      level: userData.level
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

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};