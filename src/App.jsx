import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';

// Layout components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Customer Pages
import { Home } from './pages/customer/Home';
import { BrowseVehicles } from './pages/customer/BrowseVehicles';
import { VehicleDetail } from './pages/customer/VehicleDetail';
import { MyBookings } from './pages/customer/MyBookings';
import { CustomerProfile } from './pages/customer/CustomerProfile';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Admin Layout & Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminFleet } from './pages/admin/AdminFleet';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

// Role Guard
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const CustomerRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <CurrencyProvider>
        <ToastProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
              <Navbar />

              <main className="flex-1">
                <Routes>
                  {/* Public & Customer Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<BrowseVehicles />} />
                  <Route path="/vehicle/:id" element={<VehicleDetail />} />
                  <Route
                    path="/my-bookings"
                    element={
                      <CustomerRoute>
                        <MyBookings />
                      </CustomerRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <CustomerRoute>
                        <CustomerProfile />
                      </CustomerRoute>
                    }
                  />

                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Admin Command Center */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="fleet" element={<AdminFleet />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="payments" element={<AdminPayments />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </AuthProvider>
        </ToastProvider>
      </CurrencyProvider>
    </BrowserRouter>
  );
}

export default App;
