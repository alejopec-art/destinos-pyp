import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, Search, User, MapPin, Menu, X, Home, Briefcase, Building2, Users, Mountain, Mail, Calendar } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path 
      ? "text-[#000080] font-bold border-b-2 border-[#000080] flex items-center gap-2" 
      : "hover:text-[#000080] transition-colors border-b-2 border-transparent hover:border-[#000080] flex items-center gap-2";
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm shadow-md transition-all duration-300">
      {/* Top Bar / Main Nav */}
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/">
            <img src="/logo-destinos.png" alt="Destinos P&P Logo" className="h-16 w-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold tracking-wider opacity-90 text-gray-800">
          <Link to="/" className={isActive('/')}>
            <Home className="w-4 h-4" /> HOGAR
          </Link>
          <Link to="/paquetes" className={isActive('/paquetes')}>
            <Briefcase className="w-4 h-4" /> PAQUETES
          </Link>
          <Link to="/blog" className={isActive('/blog')}>
            <Building2 className="w-4 h-4" /> HOTELES
          </Link>
          <Link to="/eventos" className={isActive('/eventos')}>
            <Calendar className="w-4 h-4" /> EVENTOS
          </Link>
          <Link to="/nosotros" className={isActive('/nosotros')}>
            <Users className="w-4 h-4" /> SOBRE NOSOTROS
          </Link>
          <Link to="/contacto" className={isActive('/contacto')}>
            <Mail className="w-4 h-4" /> CONTACTOS
          </Link>
        </nav>

        {/* Right Icons */}
        <div className="hidden lg:flex items-center gap-6 text-gray-800">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            <span className="font-semibold">+57 3017636478</span>
          </div>
          <Search className="w-5 h-5 cursor-pointer hover:text-[#000080] transition-colors" />
          <Link to="/intranet/login">
            <User className="w-5 h-5 cursor-pointer hover:text-[#000080] transition-colors" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-gray-800 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden bg-gray-900/95 absolute top-full left-0 w-full py-4 border-t border-gray-700">
            <nav className="flex flex-col items-center gap-4 text-sm font-semibold">
              <Link 
                to="/" 
                className={`py-2 ${location.pathname === '/' ? 'text-yellow-500' : 'hover:text-primary'}`} 
                onClick={() => setIsOpen(false)}
              >
                HOGAR
              </Link>
              <Link 
                to="/paquetes" 
                className={`py-2 ${location.pathname === '/paquetes' ? 'text-yellow-500' : 'hover:text-primary'}`} 
                onClick={() => setIsOpen(false)}
              >
                PAQUETES
              </Link>
              <Link 
                to="/blog" 
                className={`py-2 flex items-center gap-2 ${location.pathname === '/blog' ? 'text-yellow-500' : 'hover:text-primary'}`} 
                onClick={() => setIsOpen(false)}
              >
                <Building2 className="w-4 h-4" /> HOTELES
              </Link>
              <Link 
                to="/eventos" 
                className={`py-2 flex items-center gap-2 ${location.pathname === '/eventos' ? 'text-yellow-500' : 'hover:text-primary'}`} 
                onClick={() => setIsOpen(false)}
              >
                <Calendar className="w-4 h-4" /> EVENTOS
              </Link>
            <Link 
              to="/nosotros" 
              className={`py-2 flex items-center gap-2 ${location.pathname === '/nosotros' ? 'text-yellow-500' : 'hover:text-primary'}`}
              onClick={() => setIsOpen(false)}
            >
              <Users className="w-4 h-4" /> SOBRE NOSOTROS
            </Link>
            <Link 
              to="/contacto" 
              className={`py-2 flex items-center gap-2 ${location.pathname === '/contacto' ? 'text-yellow-500' : 'hover:text-primary'}`}
              onClick={() => setIsOpen(false)}
            >
              <Mail className="w-4 h-4" /> CONTACTOS
            </Link>
            <div className="flex items-center gap-2 py-2 border-t border-gray-700 w-full justify-center mt-2 pt-4">
              <Phone className="w-4 h-4" />
              <span>+57 3017636478</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;