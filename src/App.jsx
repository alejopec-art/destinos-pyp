import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PackagesPage from './pages/PackagesPage';
import HotelBlog from './pages/HotelBlog';
import AboutUs from './pages/AboutUs';
import EventsPage from './pages/EventsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/paquetes" element={<PackagesPage />} />
        <Route path="/blog" element={<HotelBlog />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/nosotros" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
