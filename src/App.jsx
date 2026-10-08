import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Customer Pages
import { Home } from './pages/customer/Home';
import { BrowseVehicles } from './pages/customer/BrowseVehicles';
import { VehicleDetail } from './pages/customer/VehicleDetail';
import { MyBookings } from './pages/customer/MyBookings';
import { CustomerProfile } from './pages/customer/CustomerProfile';
import { AboutUs } from './pages/customer/AboutUs';
import { ContactUs } from './pages/customer/ContactUs';

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

// Seamless Admin Access (allows visiting /admin directly)
const AdminRoute = ({ children }) => {
  const { user, isAdmin, loginAsDemo } = useAuth();
  if (!user || !isAdmin) {
    loginAsDemo('admin');
  }
  return children;
};

const CustomerRoute = ({ children }) => {
  const { user, loginAsDemo } = useAuth();
  if (!user) {
    loginAsDemo('customer');
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CurrencyProvider>
          <ToastProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
                <Navbar />

                <main className="flex-1">
                  <Routes>
                    {/* Primary Customer & Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/catalog" element={<BrowseVehicles />} />
                    <Route path="/vehicles" element={<Navigate to="/catalog" replace />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
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

                    {/* Admin Command Center via /admin */}
                    <Route
                      path="/admin"
                      element={
                        <AdminRoute>
                          <AdminLayout />
                        </AdminRoute>
                      }
                    >
                      {/* Direct /admin lands on AdminDashboard */}
                      <Route index element={<AdminDashboard />} />
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
    </ThemeProvider>
  );
}

export default App;
