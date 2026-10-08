import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Car, Bell, User, LogOut, ChevronDown, 
  LayoutDashboard, CalendarCheck,
  Menu, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, markNotificationRead } from '../../services/dataService';
import { Button } from '../../components/common/Button';

export const Navbar = () => {
  const { user, role, isAdmin, logout } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getNotifications(user?.id || 'all').then((list) => {
      if (isMounted) {
        setNotifications(list);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id) => {
    markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#023e8a] to-[#0077b6] flex items-center justify-center shadow-lg shadow-[#023e8a]/25 group-hover:scale-105 transition-transform text-white">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                Rent<span className="text-[#023e8a] dark:text-[#38bdf8]">Flow</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 -mt-1 font-semibold">
                Fleet & Rentals
              </span>
            </div>
          </Link>

          {/* Primary Nav Links: Home, All Vehicles, About Us, Contact Us */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActivePath('/')
                  ? 'text-[#023e8a] dark:text-[#38bdf8] bg-[#023e8a]/10 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </Link>

            <Link
              to="/catalog"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActivePath('/catalog')
                  ? 'text-[#023e8a] dark:text-[#38bdf8] bg-[#023e8a]/10 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Vehicles
            </Link>

            <Link
              to="/about"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActivePath('/about')
                  ? 'text-[#023e8a] dark:text-[#38bdf8] bg-[#023e8a]/10 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/contact"
              className={`px-3.5 py-2 rounded-lg transition-colors ${
                isActivePath('/contact')
                  ? 'text-[#023e8a] dark:text-[#38bdf8] bg-[#023e8a]/10 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Contact Us
            </Link>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-[#023e8a] dark:hover:text-[#38bdf8] hover:border-[#023e8a]/40 transition-colors btn-tactile"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Currency Switcher */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#023e8a] cursor-pointer font-semibold"
            >
              <option value="LKR">LKR (Rs.)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#023e8a] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 bg-white dark:bg-slate-950">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#023e8a] dark:text-[#38bdf8]" /> Notifications
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</span>
                </div>

                <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkAsRead(n.id)}
                        className={`py-3 px-1 cursor-pointer transition-colors ${
                          !n.is_read ? 'bg-[#023e8a]/5' : 'opacity-70'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                          {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[#023e8a] dark:bg-[#38bdf8] mt-1" />}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Auth Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700"
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || 'User'}`}
                  alt={user.full_name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#023e8a]/30"
                />
                <span className="hidden xl:block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                  {user.full_name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 bg-white dark:bg-slate-950">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#023e8a]/15 text-[#023e8a] dark:text-[#38bdf8] uppercase">
                      {role}
                    </span>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <CalendarCheck className="w-4 h-4 text-slate-400" /> My Bookings
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Profile & Documents
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-purple-600 dark:text-purple-300 hover:bg-purple-500/10 dark:hover:bg-purple-950/40 rounded-lg font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-500 dark:text-purple-400" /> Admin Dashboard
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg font-medium"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Register</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-sm font-medium"
          >
            Home
          </Link>
          <Link
            to="/catalog"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-sm font-medium"
          >
            All Vehicles
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-sm font-medium"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 text-sm font-medium"
          >
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
};
