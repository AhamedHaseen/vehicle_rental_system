import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageTransition } from './components/common/PageTransition';

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

const CustomerRoute = ({ children }) => {
  const { user, loginAsDemo } = useAuth();
  React.useEffect(() => {
    if (!user) {
      loginAsDemo('customer');
    }
  }, [user, loginAsDemo]);
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <CurrencyProvider>
          <ToastProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200 overflow-x-clip">
                <Navbar />

                <main className="flex-1">
                  <PageTransition>
                    <Routes>
                      {/* Primary Customer & Public Routes */}
                      <Route path="/" element={<Home />} />
                      <Route path="/catalog" element={<BrowseVehicles />} />
                      <Route path="/vehicles" element={<Navigate to="/catalog" replace />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/vehicle/:id" element={<VehicleDetail />} />
                      <Route path="/vehicles/:id" element={<VehicleDetail />} />

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


                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </PageTransition>
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
