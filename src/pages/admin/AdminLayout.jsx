import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Car, CalendarClock, MessageSquare, 
  Banknote, History, FolderKanban, Users, MapPin,
  BarChart3, Settings, Shield, ChevronLeft, ChevronRight,
  Menu, X, ExternalLink, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';

const NAV_ITEMS = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard, badge: null },
  { path: '/admin/fleet', name: 'Vehicles Fleet', icon: Car, badge: 'Fleet' },
  { path: '/admin/locations', name: 'Pickup & Drop', icon: MapPin, badge: 'Hubs' },
  { path: '/admin/bookings', name: 'Booking Details', icon: CalendarClock, badge: null },
  { path: '/admin/cash', name: 'Cash Details', icon: Banknote, badge: 'Finance' },
  { path: '/admin/contacts', name: 'Contact Inquiries', icon: MessageSquare, badge: 'New' },
  { path: '/admin/categories', name: 'Categories', icon: FolderKanban, badge: null },
  { path: '/admin/history', name: 'Rental History', icon: History, badge: null },
  { path: '/admin/customers', name: 'Customer CRM', icon: Users, badge: null },
  { path: '/admin/reports', name: 'Financial Reports', icon: BarChart3, badge: null },
  { path: '/admin/settings', name: 'System Settings', icon: Settings, badge: null },
];

export const AdminLayout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  // Find active nav item name
  const currentNavItem = NAV_ITEMS.find(item => 
    location.pathname === item.path || 
    (item.path === '/admin' && (location.pathname === '/admin/dashboard' || location.pathname === '/admin/'))
  );

  // Minimize / Maximize state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('rentflow_admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('rentflow_admin_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    } catch {
      // storage unavailable
    }
  }, [isCollapsed]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 z-40 md:z-30 h-screen border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:w-20' : 'md:w-64'
        } ${
          mobileMenuOpen ? 'translate-x-0 w-68 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar py-3 px-3">
          {/* Header & Collapse Toggle */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-2 border-b border-slate-200/80 dark:border-slate-800/80">
            {!isCollapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] flex items-center justify-center font-bold shrink-0">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate tracking-tight">Admin Console</h4>
                  <p className="text-[10px] text-[#0373b9] dark:text-[#38bdf8] font-semibold truncate">Dispatch & Ops</p>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-xl bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] flex items-center justify-center font-bold">
                  <Shield className="w-4.5 h-4.5" />
                </div>
              </div>
            )}

            {/* Minimize / Maximize Toggle Button (Desktop) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isCollapsed ? "Maximize Sidebar" : "Minimize Sidebar"}
              aria-label={isCollapsed ? "Maximize Sidebar" : "Minimize Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Close Button (Mobile) */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/admin' && (location.pathname === '/admin/dashboard' || location.pathname === '/admin/'));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-[#0373b9]/15 dark:bg-[#0373b9]/25 text-[#0373b9] dark:text-[#38bdf8] border border-[#0373b9]/30 dark:border-[#0373b9]/40 shadow-xs shadow-[#0373b9]/10 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#0373b9] dark:text-[#38bdf8]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                  }`} />
                  
                  {!isCollapsed && (
                    <span className="truncate flex-1">{item.name}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#0373b9]/10 dark:bg-[#0373b9]/25 text-[#0373b9] dark:text-[#38bdf8] border border-[#0373b9]/30">
                      {item.badge}
                    </span>
                  )}

                  {/* Floating Tooltip for Minimized Sidebar */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-lg shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer User Profile & Portal Switch */}
          <div className="pt-3 mt-2 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
            {!isCollapsed ? (
              <div className="p-2.5 bg-slate-100/80 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=Admin`}
                    alt="Admin"
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#0373b9]/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">{user?.full_name || 'System Administrator'}</p>
                    <p className="text-[9px] text-[#0373b9] dark:text-[#38bdf8] font-bold uppercase tracking-wider">Super Admin</p>
                  </div>
                </div>
                <Link
                  to="/catalog"
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span>Customer Fleet</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=Admin`}
                  alt="Admin"
                  className="w-8 h-8 rounded-lg object-cover ring-1 ring-[#0373b9]/40"
                  title={user?.full_name || 'Super Admin'}
                />
                <Link
                  to="/catalog"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Switch to Customer Fleet"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Dedicated Admin Top Bar (Replacing Public Navbar) */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">RentFlow Operations</span>
              <span className="text-xs text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
              <span className="text-xs sm:text-sm font-extrabold text-[#0373b9] dark:text-[#38bdf8] flex items-center gap-2">
                {currentNavItem?.name || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0373b9] dark:hover:text-[#38bdf8] transition-colors cursor-pointer"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="hidden sm:block bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0373b9] font-semibold cursor-pointer"
            >
              <option value="LKR">LKR (Rs.)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            {/* Portal Link Back to Customer Site */}
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0373b9]/10 text-[#0373b9] dark:text-[#38bdf8] border border-[#0373b9]/30 dark:border-[#0373b9]/40 hover:bg-[#0373b9]/20 transition-colors"
              title="Return to customer website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Customer Site</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div key={location.pathname} className="admin-fast-page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
