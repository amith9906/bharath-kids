import Notification from './components/common/Notification';
import React, { useState, useCallback } from 'react';
import { NotificationProvider } from './contexts/NotificationContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { StoreProvider } from './contexts/StoreContext';
import { CompareProvider } from './contexts/CompareContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import WhatsAppButton from './components/common/WhatsAppButton';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Public Pages
import Home from './pages/Home';
import Items from './pages/Items';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import MyCourses from './pages/MyCourses';
import Compare from './pages/Compare';
import About from './pages/About';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import QuotationsList from './pages/admin/QuotationsList';
import QuotationDetails from './pages/admin/QuotationDetails';
import CoursesManagement from './pages/admin/CoursesManagement';
import QuoteSettings from './pages/admin/QuoteSettings';
import StoreSettings from './pages/admin/StoreSettings';
import AdminRegistrations from './pages/admin/AdminRegistrations';

// Layout component for public pages
const PublicLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

function App() {
  const [notification, setNotification] = useState({ message: '', type: 'info' });
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);
  const clearNotification = useCallback(() => setNotification({ message: '', type: 'info' }), []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CompareProvider>
          <StoreProvider>
          <NotificationProvider showNotification={showNotification}>
            <Notification message={notification.message} type={notification.type} onClose={clearNotification} />
            <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              }
            />
            <Route
              path="/courses"
              element={
                <PublicLayout>
                  <Items />
                </PublicLayout>
              }
            />
            <Route
              path="/items"
              element={
                <PublicLayout>
                  <Items />
                </PublicLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <PublicLayout>
                  <Cart />
                </PublicLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <PublicLayout>
                  <Checkout />
                </PublicLayout>
              }
            />
            <Route
              path="/login"
              element={
                <PublicLayout>
                  <Login />
                </PublicLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PublicLayout>
                  <Register />
                </PublicLayout>
              }
            />
            <Route
              path="/compare"
              element={
                <PublicLayout>
                  <Compare />
                </PublicLayout>
              }
            />
            <Route
              path="/about"
              element={
                <PublicLayout>
                  <About />
                </PublicLayout>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <PublicLayout>
                    <MyCourses />
                  </PublicLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/quotations/:id"
              element={
                <ProtectedRoute>
                  <PublicLayout>
                    <QuotationDetails />
                  </PublicLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="quotations" element={<QuotationsList />} />
              <Route path="quotations/:id" element={<QuotationDetails />} />
              <Route path="courses" element={<CoursesManagement />} />
              <Route path="settings/quote" element={<QuoteSettings />} />
              <Route path="settings/store" element={<StoreSettings />} />
              <Route path="registrations" element={<AdminRegistrations />} />
            </Route>
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          </NotificationProvider>
          </StoreProvider>
          </CompareProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
