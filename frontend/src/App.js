import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import VerificationPage from './pages/VerificationPage';
import DashboardPage from './pages/DashboardPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import MapPage from './pages/MapPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import CreateAnnouncementPage from './pages/CreateAnnouncementPage';
import FavoritesPage from './pages/FavoritesPage';
import AnnouncementDetailPage from './pages/AnnouncementDetailPage';
import VideosPage from './pages/VideosPage';
import VideoDetailPage from './pages/VideoDetailPage';
import CreateVideoPage from './pages/CreateVideoPage';
import SeedPage from './pages/SeedPage';
import MarketplacePage from './pages/MarketplacePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CreateProductPage from './pages/CreateProductPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';

// Composant pour protéger les routes admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

// Composant pour protéger les routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verification" element={<VerificationPage />} />

             {/* Routes Admin */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/announcements" 
              element={
                <AdminRoute>
                  <AdminAnnouncements />
                </AdminRoute>
              } 
            />

            {/* Routes protégées */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/annonces" 
              element={
                <ProtectedRoute>
                  <AnnouncementsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/annonces/:id" 
              element={
                <ProtectedRoute>
                  <AnnouncementDetailPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/carte" 
              element={
                <ProtectedRoute>
                  <MapPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profil" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/creer-annonce" 
              element={
                <ProtectedRoute>
                  <CreateAnnouncementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/favoris" 
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/videos" 
              element={<VideosPage />} 
            />
            <Route 
              path="/videos/create" 
              element={
                <ProtectedRoute>
                  <CreateVideoPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/videos/:id" 
              element={<VideoDetailPage />} 
            />
            <Route 
              path="/graine" 
              element={
                <ProtectedRoute>
                  <SeedPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/marketplace" 
              element={<MarketplacePage />} 
            />
            <Route 
              path="/marketplace/create" 
              element={
                <ProtectedRoute>
                  <CreateProductPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/marketplace/:id" 
              element={<ProductDetailPage />} 
            />
          </Routes>
        </div>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;