import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PackagesPage from './pages/PackagesPage';
import HotelBlog from './pages/HotelBlog';
import AboutUs from './pages/AboutUs';
import EventsPage from './pages/EventsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/intranet/LoginPage';
import IntranetDashboard from './pages/intranet/Dashboard';
import AdminDashboard from './pages/intranet/AdminDashboard';
import IntranetLayout from './layout/IntranetLayout';
import QuotesPage from './pages/intranet/QuotesPage';
import SalesPage from './pages/intranet/SalesPage';
import FinancePage from './pages/intranet/FinancePage';
import LogisticsPage from './pages/intranet/LogisticsPage';
import SettingsPage from './pages/intranet/SettingsPage';
import WhatsAppWidget from './components/WhatsAppWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AccessDeniedPage from './pages/intranet/AccessDenied';

import ProductModule from './pages/intranet/ProductModule';

function App() {
  return (
    <AuthProvider>
      <Router>
        <WhatsAppWidget />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/paquetes" element={<PackagesPage />} />
          <Route path="/blog" element={<HotelBlog />} />
          <Route path="/empresas" element={<EventsPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/nosotros" element={<AboutUs />} />
          <Route path="/intranet/login" element={<LoginPage />} />
          <Route path="/intranet/denied" element={<AccessDeniedPage />} />
          <Route
            path="/intranet"
            element={
              <ProtectedRoute module="dashboard">
                <IntranetDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intranet/dashboard"
            element={
              <ProtectedRoute module="dashboard">
                <IntranetDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intranet/quotes"
            element={
              <ProtectedRoute module="vacacional">
                <QuotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intranet/vacacional"
            element={
              <ProtectedRoute module="vacacional">
                <QuotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intranet/corporativo"
            element={
              <ProtectedRoute module="corporativo">
                <QuotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/intranet/admin"
            element={
              <ProtectedRoute module="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route element={<IntranetLayout />}>
            <Route
              path="/intranet/producto"
              element={
                <ProtectedRoute module="vacacional">
                  <ProductModule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intranet/sales"
              element={
                <ProtectedRoute module="corporativo">
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intranet/finance"
              element={
                <ProtectedRoute module="contabilidad">
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intranet/contabilidad"
              element={
                <ProtectedRoute module="contabilidad">
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intranet/logistics"
              element={
                <ProtectedRoute module="vacacional">
                  <LogisticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intranet/settings"
              element={
                <ProtectedRoute module="admin">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
