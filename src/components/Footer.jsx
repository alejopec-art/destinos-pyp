import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, ArrowRight, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-[#000020] text-white pt-24 pb-12 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#000080] rounded-full blur-[100px] opacity-20"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#D4AF37] rounded-full blur-[100px] opacity-10"></div>
        
        {/* World Map Overlay (SVG Pattern) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg")', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 group">
              <img src="/logo-destinos.png" alt="Destinos P&P Logo" className="h-20 w-auto transition-transform duration-500 group-hover:scale-105" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transformamos sueños en destinos. Viaja con seguridad, estilo y experiencias inolvidables alrededor del mundo.
            </p>
            <div className="flex gap-4 pt-2">
              {[Twitter, Facebook, Instagram, Linkedin].map((Icon, index) => (
                <a key={index} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#D4AF37] hover:text-white hover:-translate-y-1 transition-all duration-300 group">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-bold mb-8 relative inline-block">
              Enlaces Rápidos
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#D4AF37]"></span>
            </h3>
            <ul className="space-y-4 text-gray-400">
              {['Sobre Nosotros', 'Nuestros Tours', 'Blog de Viajes', 'Contactos'].map((item) => (
                <li key={item}>
                  <a href="#" className="flex items-center gap-2 hover:text-[#D4AF37] hover:translate-x-2 transition-all duration-300 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-8 relative inline-block">
              Contacto
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#D4AF37]"></span>
            </h3>
            <ul className="space-y-6 text-gray-400">
              <li className="flex items-start gap-4 group">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#000080]/20 transition-colors">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className="group-hover:text-white transition-colors">Bogotá, Colombia</span>
              </li>
              <li className="flex items-center gap-4 group">
                 <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#000080]/20 transition-colors">
                    <Phone className="w-5 h-5 text-[#D4AF37]" />
                 </div>
                <span className="group-hover:text-white transition-colors">+57 301 763 6478</span>
              </li>
              <li className="flex items-center gap-4 group">
                 <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#000080]/20 transition-colors">
                    <Mail className="w-5 h-5 text-[#D4AF37]" />
                 </div>
                <span className="group-hover:text-white transition-colors">viajes@destinospp.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Mini */}
          <div>
            <h3 className="text-lg font-bold mb-8 relative inline-block">
              Mantente al día
              <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-[#D4AF37]"></span>
            </h3>
            <p className="text-gray-400 text-sm mb-6">Recibe inspiración diaria en tu bandeja de entrada.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Tu correo" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white/10 transition-all text-white placeholder-gray-500"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#D4AF37] rounded-lg text-white hover:bg-white hover:text-[#000080] transition-all duration-300">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
          <p className="flex items-center gap-1">
            &copy; 2024 Destinos P&P. Hecho con <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" /> para viajeros.
          </p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-[#D4AF37] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-[#D4AF37] hover:after:w-full after:transition-all">Política de Privacidad</a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-[#D4AF37] hover:after:w-full after:transition-all">Términos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
