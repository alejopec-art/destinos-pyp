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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/paquetes" element={<PackagesPage />} />
        <Route path="/blog" element={<HotelBlog />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        {/* Intranet Routes */}
        <Route path="/intranet/login" element={<LoginPage />} />
        <Route path="/intranet/dashboard" element={<IntranetDashboard />} />
        
        {/* Modules with Sidebar */}
        <Route element={<IntranetLayout />}>
          <Route path="/intranet/admin" element={<AdminDashboard />} />
          <Route path="/intranet/quotes" element={<QuotesPage />} />
          <Route path="/intranet/vacacional" element={<QuotesPage />} /> {/* Alias */}
          <Route path="/intranet/corporativo" element={<QuotesPage />} /> {/* Alias */}
          <Route path="/intranet/sales" element={<SalesPage />} />
          <Route path="/intranet/finance" element={<FinancePage />} />
          <Route path="/intranet/contabilidad" element={<FinancePage />} /> {/* Alias */}
          <Route path="/intranet/logistics" element={<LogisticsPage />} />
          <Route path="/intranet/settings" element={<SettingsPage />} />
        </Route>

        <Route path="/nosotros" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;