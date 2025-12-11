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
  LogOut,
  Recycle,
  Play,
  Sprout,
  ShoppingBag,
  Bell
} from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, token, API_URL } = useAuth();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = React.useState([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [lang, setLang] = React.useState(i18n.language || 'fr');

  const menuItems = [
    { icon: LayoutDashboard, label: t('common.dashboard', 'Tableau de bord'), path: '/dashboard' },
    { icon: Sprout, label: t('common.seed', 'Ma Graine'), path: '/graine' },
    { icon: MessageSquare, label: t('common.messages', 'Messages'), path: '/messages' },
    { icon: Heart, label: t('common.favorites', 'Favoris'), path: '/favoris' },
    { icon: Package, label: t('common.announcements', 'Annonces'), path: '/annonces' },
    { icon: Map, label: t('common.map', 'Carte'), path: '/carte' },
    { icon: Play, label: t('common.videos', 'Vidéos'), path: '/videos' },
    { icon: ShoppingBag, label: t('common.marketplace', 'Marketplace'), path: '/marketplace' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleLanguage = (lng) => {
    setLang(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem('gl_lang', lng);
  };

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 5 }
      });
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread || 0);
    } catch (error) {
      console.error('Erreur notifications:', error);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur mark read:', error);
    }
  };

  React.useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Header minimaliste */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Recycle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">GreenLoop</span>
            </div>
            <button
              onClick={() => navigate('/creer-annonce')}
              className="p-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              title="Créer une annonce"
            >
              <PlusCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Navigation - Avec scroll */}
        <nav className="flex-1 p-5 overflow-y-auto">
          <div className="flex flex-col space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all text-base ${
                    active
                      ? 'bg-green-500 text-white font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </aside>

      {/* Contenu Principal avec Header */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Global */}
        <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-end gap-3">
            {/* Switch langue */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
              <button
                onClick={() => handleLanguage('fr')}
                className={`px-2 py-1 text-sm rounded ${lang === 'fr' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                FR
              </button>
              <button
                onClick={() => handleLanguage('dar')}
                className={`px-2 py-1 text-sm rounded ${lang === 'dar' ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
              >
                Derja
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  const next = !showNotifications;
                  setShowNotifications(next);
                  if (next) loadNotifications();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 relative"
                title={t('common.notifications', 'Notifications')}
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      {t('common.notifications', 'Notifications')}
                    </span>
                    <button
                      className="text-sm text-green-600 hover:text-green-700"
                      onClick={() => {
                        notifications.forEach(n => markNotificationRead(n._id));
                      }}
                    >
                      Marquer tout lu
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif._id}
                          onClick={() => {
                            markNotificationRead(notif._id);
                            setShowNotifications(false);
                            if (notif.data?.announcement_id) {
                              navigate(`/annonces/${notif.data.announcement_id}`);
                            }
                          }}
                          className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 ${notif.is_read ? 'text-gray-600' : 'bg-green-50'}`}
                        >
                          <div className="font-semibold text-gray-900">{notif.title}</div>
                          <div className="text-sm text-gray-600">{notif.message}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(notif.created_at).toLocaleString()}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profil et actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/profil')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive('/profil')
                    ? 'bg-green-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span className="font-medium">{t('common.profile', 'Profil')}</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900">{user?.full_name || 'Utilisateur'}</div>
                  <div className="text-xs text-gray-500">{user?.points || 0} pts</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title={t('common.logout', 'Déconnexion')}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Contenu Principal */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 md:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;