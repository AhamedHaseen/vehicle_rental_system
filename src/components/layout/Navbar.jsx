import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Car, Bell, User, LogOut, ChevronDown, ChevronRight,
  LayoutDashboard, CalendarCheck,
  Menu, X, Sun, Moon, Home, Info, PhoneCall
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotifOpen(false);
  }, [location.pathname]);

  // Click outside to close desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key closes open menus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY || window.pageYOffset;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScroll / totalHeight) * 100));
        setScrollProgress(progress);
      }
      setIsScrolled(currentScroll > 15);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id) => {
    markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-30 md:hidden pointer-events-auto transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <header className="sticky top-0 z-40 w-full px-3 sm:px-6 lg:px-8 pt-2 sm:pt-2.5 pb-1 pointer-events-none transition-all duration-300">
        {/* Complete Floating Box Navbar */}
        <div
          className={`max-w-7xl mx-auto pointer-events-auto rounded-2xl glass-panel border bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-all duration-300 relative shadow-md ${
            isScrolled
              ? 'border-[#0077b6]/35 dark:border-[#38bdf8]/35 shadow-xl shadow-[#0077b6]/10 dark:shadow-slate-950/70'
              : 'border-slate-200/90 dark:border-slate-800/90'
          }`}
        >
          <div className="px-3.5 sm:px-6 h-15 sm:h-17 flex items-center justify-between gap-2">
            {/* Brand Logo */}
            <div className="flex items-center gap-4 lg:gap-8 min-w-0">
              <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0077b6] to-[#023e8a] flex items-center justify-center shadow-lg shadow-[#0077b6]/25 group-hover:scale-105 transition-transform text-white">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="text-base sm:text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-0.5">
                    Rent<span className="text-[#0077b6] dark:text-[#38bdf8]">Flow</span>
                  </span>
                  <span className="hidden sm:block text-[9px] sm:text-[10px] tracking-widest uppercase text-slate-500 dark:text-slate-400 -mt-1 font-bold">
                    Fleet & Rentals
                  </span>
                </div>
              </Link>

              {/* Primary Desktop Nav Links: Home, All Vehicles, About Us, Contact Us */}
              <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                    isActivePath('/')
                      ? 'text-[#0077b6] dark:text-[#38bdf8] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 border-[#0077b6]/30 dark:border-[#38bdf8]/30 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  Home
                </Link>

                <Link
                  to="/catalog"
                  className={`px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                    isActivePath('/catalog')
                      ? 'text-[#0077b6] dark:text-[#38bdf8] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 border-[#0077b6]/30 dark:border-[#38bdf8]/30 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  All Vehicles
                </Link>

                <Link
                  to="/about"
                  className={`px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                    isActivePath('/about')
                      ? 'text-[#0077b6] dark:text-[#38bdf8] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 border-[#0077b6]/30 dark:border-[#38bdf8]/30 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  About Us
                </Link>

                <Link
                  to="/contact"
                  className={`px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                    isActivePath('/contact')
                      ? 'text-[#0077b6] dark:text-[#38bdf8] bg-[#0077b6]/10 dark:bg-[#023e8a]/25 border-[#0077b6]/30 dark:border-[#38bdf8]/30 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 border-transparent hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800'
                  }`}
                >
                  Contact Us
                </Link>
              </nav>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Theme Toggle Button (Light / Dark) */}
              <button
                onClick={toggleTheme}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-[#0077b6] dark:hover:text-[#38bdf8] hover:border-[#0077b6]/40 transition-colors btn-tactile cursor-pointer"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle Theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                )}
              </button>

              {/* Currency Switcher (Hidden on narrow mobile screens, available in mobile drawer) */}
              <div className="relative hidden sm:block">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0077b6] cursor-pointer font-semibold"
                >
                  <option value="LKR">LKR (Rs.)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    setIsUserMenuOpen(false);
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#0077b6] dark:bg-[#023e8a] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-88 glass-panel rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 bg-white dark:bg-slate-950">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Bell className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" /> Notifications
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{unreadCount} unread</span>
                    </div>

                    <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 sm:max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center">No notifications yet</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`py-3 px-1 cursor-pointer transition-colors ${
                              !n.is_read ? 'bg-[#0077b6]/5 dark:bg-[#023e8a]/10' : 'opacity-70'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{n.title}</p>
                              {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-[#0077b6] dark:bg-[#38bdf8] mt-1" />}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Account Dropdown (Desktop) */}
              {user ? (
                <div className="relative hidden md:block" ref={userMenuRef}>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(!isUserMenuOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || 'User'}`}
                      alt={user.full_name || 'User'}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-[#0077b6]/30 dark:ring-[#023e8a]/40"
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
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#0077b6]/15 text-[#0077b6] dark:bg-[#023e8a]/20 dark:text-[#38bdf8] uppercase">
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
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 rounded-lg font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="sm">Register</Button>
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger / Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                  setIsUserMenuOpen(false);
                  setIsNotifOpen(false);
                }}
                className={`md:hidden p-2 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  isMobileMenuOpen
                    ? 'bg-[#0077b6] text-white shadow-md shadow-[#0077b6]/25'
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-[#0077b6]'
                }`}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Dynamic Scroll Progress Line Directly Attached to the Header Row */}
          <div className="h-[2px] w-full bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0077b6] via-[#0096c7] to-[#023e8a] dark:from-[#38bdf8] dark:via-[#60a5fa] dark:to-[#0077b6] transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Comprehensive Mobile Navigation Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-950/98 backdrop-blur-2xl p-4 space-y-4 max-h-[calc(100vh-5.5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User Account Banner (Logged In) OR Quick Auth (Guest) */}
              {user ? (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.full_name || 'User'}`}
                        alt={user.full_name}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#0077b6]/30 shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{user.full_name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#0077b6]/15 text-[#0077b6] dark:text-[#38bdf8] shrink-0">
                      {role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <Link
                      to="/my-bookings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <CalendarCheck className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
                      <span>My Bookings</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      <User className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
                      <span>Profile</span>
                    </Link>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-purple-500" />
                        <span>Admin Operations</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Welcome to RentFlow</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Sign in to manage bookings or reserve premium vehicles</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <Button variant="ghost" size="sm" className="w-full font-bold justify-center">Sign In</Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <Button variant="primary" size="sm" className="w-full font-bold justify-center">Register</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Primary Mobile Nav Links */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
                  Menu Navigation
                </div>
                {[
                  { to: '/', label: 'Home', icon: Home },
                  { to: '/catalog', label: 'All Vehicles', icon: Car },
                  { to: '/about', label: 'About Us', icon: Info },
                  { to: '/contact', label: 'Contact Us', icon: PhoneCall },
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActivePath(to)
                        ? 'bg-[#0077b6]/10 text-[#0077b6] dark:bg-[#023e8a]/25 dark:text-[#38bdf8] border border-[#0077b6]/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#0077b6] dark:text-[#38bdf8]" />
                      <span>{label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>

              {/* Quick Preferences: Currency Switcher Pills */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">Display Currency</span>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                  {['LKR', 'USD', 'EUR'].map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                        currency === curr
                          ? 'bg-[#0077b6] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hotline Support Note */}
              <div className="text-center pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>24/7 Roadside Assistance: </span>
                <a href="tel:+94112345678" className="font-bold text-[#0077b6] dark:text-[#38bdf8] hover:underline">
                  +94 11 234 5678
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};
