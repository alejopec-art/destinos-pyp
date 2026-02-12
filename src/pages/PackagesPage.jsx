import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { MapPin, Calendar, Search, Filter, Star, Clock, Users, ArrowRight, Percent, FileText, CreditCard, ShieldCheck, Plane, Car, Bus, Camera, BedDouble, Briefcase } from 'lucide-react';

const packagesData = [
  {
    id: 1,
    title: "Punta Cana Todo Incluido",
    location: "República Dominicana",
    duration: "5 Días / 4 Noches",
    price: 4800000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Playa", "Todo Incluido", "Familia"]
  },
  {
    id: 2,
    title: "Cancún y Riviera Maya",
    location: "México",
    duration: "6 Días / 5 Noches",
    price: 5800000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Playa", "Aventura", "Parejas"]
  },
  {
    id: 3,
    title: "Tour Eje Cafetero",
    location: "Colombia",
    duration: "4 Días / 3 Noches",
    price: 1800000,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
    tags: ["Naturaleza", "Cultura", "Café"]
  },
  {
    id: 4,
    title: "Escapada a Cartagena",
    location: "Colombia",
    duration: "4 Días / 3 Noches",
    price: 2200000,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1583531352515-8884af319dc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Historia", "Playa", "Romántico"]
  },
  {
    id: 5,
    title: "Aventura en Amazonas",
    location: "Colombia",
    duration: "5 Días / 4 Noches",
    price: 2800000,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=800&q=80",
    tags: ["Ecoturismo", "Selva", "Exótico"]
  },
  {
    id: 6,
    title: "San Andrés Islas",
    location: "Colombia",
    duration: "5 Días / 4 Noches",
    price: 2400000,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    tags: ["Playa", "Buceo", "Relax"]
  }
];

const PackagesPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("Todos");
  const [activeTab, setActiveTab] = useState("Paquetes");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Buscando las mejores ofertas de ${activeTab} para Destinos P&P...`);
    }, 2000);
  };

  const tabs = [
    { id: 'Paquetes', icon: <Briefcase className="w-5 h-5" />, label: 'Paquetes' },
    { id: 'Hoteles', icon: <BedDouble className="w-5 h-5" />, label: 'Hoteles' },
    { id: 'Vuelos', icon: <Plane className="w-5 h-5" />, label: 'Vuelos' },
    { id: 'Traslados', icon: <Bus className="w-5 h-5" />, label: 'Traslados' },
    { id: 'Excursiones', icon: <Camera className="w-5 h-5" />, label: 'Excursiones' },
    { id: 'Autos', icon: <Car className="w-5 h-5" />, label: 'Autos' },
  ];

  const filteredPackages = packagesData.filter(pkg => {
    const matchesSearch = pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pkg.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "Todos" || pkg.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = ["Todos", ...new Set(packagesData.flatMap(p => p.tags))];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* --- BANNER SUPERIOR --- */}
      <div className="relative h-[400px] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Travel Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#000080]/60 mix-blend-multiply"></div>
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg tracking-tight">
            Nuestros Paquetes
          </h1>
          <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto opacity-90">
            Descubre los mejores destinos con todo incluido para tus próximas vacaciones.
          </p>
        </div>
      </div>

      {/* --- FILTROS Y BÚSQUEDA --- */}
      <div className="container mx-auto px-4 -mt-10 relative z-30">
        <style>{`
            @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-spin-slow {
                animation: spin-slow 4s linear infinite;
            }
        `}</style>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col lg:flex-row gap-6 items-center justify-between border border-white/50 ring-1 ring-black/5">
          
          {/* Search Bar */}
          <div className="relative w-full lg:w-1/3 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#000080] transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="¿A dónde quieres ir?" 
              className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-0 rounded-xl text-gray-800 placeholder-gray-400 ring-1 ring-gray-200 focus:ring-2 focus:ring-[#000080] focus:bg-white transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tags Filter */}
          <div className="flex gap-3 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-hide">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 active:scale-95 ${
                  selectedTag === tag 
                    ? 'bg-[#000080] text-white shadow-lg ring-2 ring-[#000080] ring-offset-2' 
                    : 'bg-gray-100 text-gray-600 hover:bg-white hover:shadow-md hover:text-[#000080]'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {/* Tech Result Badge (Fixed Layout) */}
          <div className="relative flex-shrink-0 p-[2px] rounded-full overflow-hidden hover:scale-105 transition-transform duration-300 shadow-sm group">
             <div className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,#00F5FF,#000080,#00F5FF)] animate-spin-slow opacity-100"></div>
             <div className="relative z-10 bg-white rounded-full px-6 py-2.5 flex items-center justify-center gap-2 whitespace-nowrap">
                <Filter className="w-4 h-4 text-[#000080]" />
                <span className="font-bold text-gray-700 text-sm">
                    <span className="text-[#000080] font-extrabold text-lg">{filteredPackages.length}</span> Resultados
                </span>
             </div>
          </div>

        </div>
      </div>

      {/* --- CARRUSEL DESTACADO --- */}
      <FeaturedCarousel />

      {/* --- SECCIÓN DE BUSCADOR AVANZADO --- */}
      <div className="container mx-auto px-4 mt-8 mb-16 relative z-10">
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
          }
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}</style>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Menú de Categorías */}
          <div className="lg:w-1/6 w-full flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group py-4 px-5 rounded-2xl font-bold text-left shadow-sm border transition-all duration-300 flex items-center gap-3 whitespace-nowrap hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-[#000080] text-white border-[#000080] shadow-lg ring-2 ring-blue-200'
                    : 'bg-white text-gray-600 border-gray-100 hover:bg-blue-50 hover:text-[#000080]'
                }`}
              >
                <span className={`transition-colors duration-300 ${activeTab === tab.id ? 'text-yellow-400' : 'text-gray-400 group-hover:text-[#000080]'}`}>
                  {tab.icon}
                </span>
                <span className="text-sm tracking-wide">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Formulario de Búsqueda Dinámico - Glassmorphism */}
          <div className="lg:w-5/6 w-full bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl p-8 md:p-10 border border-white/50 relative overflow-hidden">
            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            
            <div key={activeTab} className="animate-fade-in-up relative z-10">
              <h2 className="text-3xl font-bold text-[#000080] mb-8 flex items-center gap-3">
                {tabs.find(t => t.id === activeTab)?.icon}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#000080] to-blue-600">
                  Buscar {activeTab}
                </span>
              </h2>

              {/* Campos Dinámicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Origen / Punto de Recogida */}
                {(activeTab !== 'Hoteles' && activeTab !== 'Excursiones') && (
                  <div className="group">
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                      {activeTab === 'Autos' ? 'Punto de Recogida:' : 'Origen:'}
                    </label>
                    <div className="relative transform transition-all duration-300 group-hover:-translate-y-1">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000080] opacity-50" />
                      <input 
                        type="text" 
                        placeholder={activeTab === 'Autos' ? "Ciudad, Aeropuerto o Dirección" : "Ciudad de origen"}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#000080] transition-all shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                )}

                {/* Destino / Punto de Entrega */}
                <div className="group">
                  <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    {activeTab === 'Autos' ? 'Punto de Entrega (Opcional):' : 'Destino:'}
                  </label>
                  <div className="relative transform transition-all duration-300 group-hover:-translate-y-1">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000080] opacity-50" />
                    <input 
                      type="text" 
                      placeholder="Ciudad destino"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#000080] transition-all shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Fechas */}
                <div className="group">
                  <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                    {activeTab === 'Autos' ? 'Recogida:' : 'Ida:'}
                  </label>
                  <div className="relative transform transition-all duration-300 group-hover:-translate-y-1">
                    <input 
                      type="date" 
                      className="w-full pl-4 pr-10 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#000080] transition-all shadow-sm hover:shadow-md"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000080] opacity-50 pointer-events-none" />
                  </div>
                </div>

                {(activeTab !== 'Excursiones' && activeTab !== 'Traslados') && (
                  <div className="group">
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">
                      {activeTab === 'Autos' ? 'Devolución:' : 'Regreso:'}
                    </label>
                    <div className="relative transform transition-all duration-300 group-hover:-translate-y-1">
                      <input 
                        type="date" 
                        className="w-full pl-4 pr-10 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#000080] transition-all shadow-sm hover:shadow-md"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#000080] opacity-50 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Habitaciones (Solo Hoteles y Paquetes) */}
                {(activeTab === 'Paquetes' || activeTab === 'Hoteles') && (
                  <div className="group">
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Habitaciones:</label>
                    <div className="relative transform transition-all duration-300 group-hover:-translate-y-1">
                      <select className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-[#000080] transition-all shadow-sm hover:shadow-md appearance-none">
                        <option>1 Habitación</option>
                        <option>2 Habitaciones</option>
                        <option>3+ Habitaciones</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowRight className="w-4 h-4 text-gray-400 rotate-90" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pasajeros / Personas */}
              {activeTab !== 'Autos' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                  <div className="group">
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Adultos:</label>
                    <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm group-hover:shadow-md transition-all">
                      <Users className="ml-4 w-5 h-5 text-[#000080] opacity-60" />
                      <select className="w-full bg-transparent p-3 text-gray-700 font-bold focus:outline-none rounded-xl">
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4+</option>
                      </select>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Menores (2-17):</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#000080]/20 shadow-sm group-hover:shadow-md transition-all">
                      <option>0</option>
                      <option>1</option>
                      <option>2+</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="block text-gray-500 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Infantes (0-23 m):</label>
                    <select className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#000080]/20 shadow-sm group-hover:shadow-md transition-all">
                      <option>0</option>
                      <option>1</option>
                      <option>2+</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
                {activeTab === 'Paquetes' && (
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer group select-none">
                    <div className="relative">
                      <input type="checkbox" className="peer sr-only" />
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-md peer-checked:bg-[#000080] peer-checked:border-[#000080] transition-all"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="group-hover:text-[#000080] transition-colors font-medium">Solo necesito hotel para una parte de mi viaje</span>
                  </label>
                )}
                <div className="flex-grow"></div>
                <button 
                  onClick={handleSearch}
                  disabled={isLoading}
                  className={`w-full md:w-auto bg-gradient-to-r from-[#84cc16] to-[#65a30d] text-white font-bold py-5 px-10 rounded-2xl shadow-xl transition-all uppercase tracking-wide flex items-center justify-center gap-3 transform ${isLoading ? 'opacity-80 cursor-not-allowed' : 'hover:scale-105 hover:shadow-[0_0_20px_rgba(132,204,22,0.4)] hover:-translate-y-1'}`}
                >
                  {isLoading ? (
                    <>
                      <Clock className="animate-spin w-6 h-6" />
                      Buscando Ofertas...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      Buscar {activeTab}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE GARANTÍAS --- */}
      <div className="container mx-auto px-4 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center p-4">
            <Percent className="w-12 h-12 text-[#000080] mb-4" strokeWidth={2.5} />
            <h3 className="text-[#000080] text-lg font-bold mb-2">Precios exclusivos</h3>
            <p className="text-sm text-gray-600">Encuentra tarifas y descuentos especiales.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <FileText className="w-12 h-12 text-[#000080] mb-4" strokeWidth={2.5} />
            <h3 className="text-[#000080] text-lg font-bold mb-2">Facturación en línea</h3>
            <p className="text-sm text-gray-600">Factura fácil y rápido después de tu reserva.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <ShieldCheck className="w-12 h-12 text-[#000080] mb-4" strokeWidth={2.5} />
            <h3 className="text-[#000080] text-lg font-bold mb-2">Expertos en turismo</h3>
            <p className="text-sm text-gray-600">Años de experiencia nos respaldan.</p>
          </div>
          <div className="flex flex-col items-center p-4">
            <CreditCard className="w-12 h-12 text-[#000080] mb-4" strokeWidth={2.5} />
            <h3 className="text-[#000080] text-lg font-bold mb-2">Opciones de pago</h3>
            <p className="text-sm text-gray-600">Paga con tarjeta de crédito o débito de manera segura.</p>
          </div>
        </div>
      </div>

      {/* --- CUADRÍCULA DE PAQUETES --- */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
           <h2 className="text-3xl md:text-4xl font-bold text-[#000080] mb-4">Ofertas Destacadas</h2>
           <p className="text-gray-600 max-w-2xl mx-auto">Seleccionamos las mejores experiencias para ti con precios inigualables.</p>
        </div>

        {filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPackages.map((pkg, index) => (
              <div 
                key={pkg.id} 
                className="group bg-white rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
              >
                
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={pkg.image} 
                    alt={pkg.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000080]/60 to-transparent opacity-60"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#000080] shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {pkg.rating}
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                     <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-black/20 backdrop-blur-sm px-3 py-1 rounded-lg w-fit">
                        <MapPin className="w-3 h-3" />
                        {pkg.location}
                      </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-[#000080] mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                    {pkg.title}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-gray-500 text-sm mb-8">
                    <div className="flex items-center gap-1.5 bg-blue-50/50 px-3 py-1.5 rounded-lg text-[#000080]">
                      <Clock className="w-4 h-4" />
                      {pkg.duration}
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50/50 px-3 py-1.5 rounded-lg text-[#000080]">
                      <Users className="w-4 h-4" />
                      2-4 Pers.
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6 border-t border-gray-50">
                    <div>
                      <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wider">Desde</p>
                      <p className="text-2xl font-bold text-[#000080]">
                        $ {pkg.price.toLocaleString('es-CO')} COP
                      </p>
                    </div>
                    <button className="bg-gradient-to-r from-[#84cc16] to-[#65a30d] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all flex items-center gap-2 text-sm uppercase tracking-wide">
                      Ver Detalle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No encontramos resultados</h3>
            <p className="text-gray-500">Intenta con otros términos de búsqueda o filtros.</p>
            <button 
              onClick={() => {setSearchTerm(""); setSelectedTag("Todos");}}
              className="mt-6 text-[#000080] font-semibold hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default PackagesPage;