import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Package,
  LogOut,
  Shield
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
    { path: '/admin/announcements', icon: Package, label: 'Annonces' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-gradient-to-b from-green-600 to-green-700 text-white fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">GreenLoop</h1>
              <p className="text-xs text-green-200">Administration</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <p className="text-sm opacity-75">Connecté en tant que</p>
            <p className="font-semibold">{user?.full_name || 'Admin'}</p>
            <p className="text-xs text-green-200">{user?.role}</p>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-green-600 font-medium'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-red-500 transition-colors mt-8"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <div className="ml-64 flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;