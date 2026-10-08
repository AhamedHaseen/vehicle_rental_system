import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Car, CalendarClock, Users, 
  CreditCard, BarChart3, Settings, Shield, ChevronRight, LogOut 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/admin', name: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/fleet', name: 'Fleet Inventory', icon: Car },
  { path: '/admin/bookings', name: 'Bookings & Ops', icon: CalendarClock },
  { path: '/admin/customers', name: 'Customer CRM', icon: Users },
  { path: '/admin/payments', name: 'Payments', icon: CreditCard },
  { path: '/admin/reports', name: 'Reports & Analytics', icon: BarChart3 },
  { path: '/admin/settings', name: 'System Settings', icon: Settings },
];

export const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl p-4 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6">
          {/* Header Badge */}
          <div className="px-3 py-2 bg-purple-500/10 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 rounded-xl flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200">Admin Command</h4>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-medium">Operations & Fleet Dispatch</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/dashboard');
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600/15 dark:bg-purple-600/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Switch to Customer */}
        <div className="p-3 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=Admin`}
              alt="Admin"
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-purple-500/40"
            />
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">System Admin</p>
            </div>
          </div>
          <Link
            to="/catalog"
            className="block text-center py-1.5 px-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-[11px] font-medium transition-colors"
          >
            Switch to Customer Portal
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
