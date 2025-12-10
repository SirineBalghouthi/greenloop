import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Map, 
  Package,
  Heart,
  PlusCircle,
  User,
  Settings,
  LogOut,
  Recycle,
  ChevronLeft
} from 'lucide-react';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
    { icon: Package, label: 'Annonces', path: '/annonces' },
    { icon: Map, label: 'Carte', path: '/carte' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Heart, label: 'Favoris', path: '/favoris' },
    { icon: PlusCircle, label: 'Créer', path: '/creer-annonce' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-green-600">GreenLoop</span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase">
            Accueil
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? 'bg-green-50 text-green-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate('/profil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition mb-2 ${
              isActive('/profil')
                ? 'bg-green-50 text-green-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Profil</span>
          </button>

          <button
            onClick={() => navigate('/parametres')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition mb-2"
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </button>

          {/* User Info */}
          <div className="px-4 py-3 bg-gray-50 rounded-lg mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {user?.full_name}
                </div>
                <div className="text-sm text-gray-500 capitalize">
                  {user?.user_type}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;