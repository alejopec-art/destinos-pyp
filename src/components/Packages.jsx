import React from 'react';
import { 
  Percent, 
  FileText, 
  Map, 
  CreditCard, 
  Search, 
  Calendar, 
  MapPin, 
  Users,
  Plane,
  Building2,
  Car,
  Bus,
  Camera
} from 'lucide-react';

const searchTabs = [
  { icon: Building2, label: 'Hoteles' },
  { icon: Plane, label: 'Vuelos' },
  { icon: Map, label: 'Paquetes', active: true },
  { icon: Bus, label: 'Traslados' },
  { icon: Camera, label: 'Tours' },
  { icon: Car, label: 'Autos' },
];

const features = [
  { 
    icon: Percent, 
    label: 'Precios exclusivos',
    desc: 'Encuentra tarifas y descuentos especiales.'
  },
  { 
    icon: FileText, 
    label: 'Facturación en línea',
    desc: 'Factura fácil y rápido después de tu reserva.'
  },
  { 
    icon: Map, 
    label: 'Expertos en turismo',
    desc: 'Años de experiencia nos respaldan.'
  },
  { 
    icon: CreditCard, 
    label: 'Opciones de pago',
    desc: 'Paga con tarjeta de crédito o débito de manera segura.'
  },
];

const offers = [
  {
    title: "Punta Cana",
    hotel: "Bahia Principe Grand",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    discount: "45%",
    extra: "+1 menor GRATIS"
  },
  {
    title: "Riviera Maya",
    hotel: "Hotel La Riviera",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    discount: "35%",
    extra: "Todo Incluido"
  },
  {
    title: "Cancún",
    hotel: "oxoHotel",
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    discount: "32%",
    extra: "Vista al mar"
  }
];

const Packages = () => {
  return (
    <section id="packages" className="relative bg-slate-50 font-sans">
      
      {/* --- HERO & SEARCH SECTION --- */}
      <div className="relative h-[600px] lg:h-[700px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540541338287-41700207dee6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Punta Cana Beach" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content (Hero Text) */}
          <div className="text-white space-y-4 text-center lg:text-left">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight drop-shadow-lg">
              PUNTA CANA
            </h2>
            <div className="space-y-2">
              <p className="text-2xl md:text-3xl font-light">Hasta</p>
              <p className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-xl">
                55%
              </p>
              <p className="text-2xl md:text-3xl font-light">de descuento</p>
            </div>
          </div>

          {/* Right Content (Search Widget) */}
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md mx-auto lg:mr-0 w-full animate-fade-in-up">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 justify-center lg:justify-start border-b border-gray-100 pb-4">
              {searchTabs.map((tab, idx) => (
                <button 
                  key={idx}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    tab.active 
                      ? 'bg-[#000080] text-white shadow-lg shadow-blue-900/30' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Origen</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Ciudad de origen" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 outline-none transition-all text-gray-700" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Destino</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-[#000080] w-5 h-5" />
                  <input type="text" placeholder="Ciudad destino" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 outline-none transition-all text-gray-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ida</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="dd/mm/aaaa" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 outline-none transition-all text-gray-700" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Regreso</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input type="text" placeholder="dd/mm/aaaa" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 outline-none transition-all text-gray-700" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Adultos</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <select className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 outline-none transition-all text-gray-700 appearance-none">
                      <option>2 Adultos</option>
                      <option>1 Adulto</option>
                      <option>3 Adultos</option>
                    </select>
                  </div>
                </div>
                <button className="col-span-1 bg-[#000080] hover:bg-blue-900 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-900/30 transition-all flex items-center justify-center gap-2 mt-5">
                  <Search className="w-5 h-5" />
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- WHY CHOOSE US SECTION --- */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#000080] mb-4">
            ¿Por qué reservar con nosotros?
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-[#000080] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white p-8 rounded-[2rem] shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-center border border-gray-100"
            >
              <div className="w-20 h-20 mx-auto bg-blue-50 rounded-2xl flex items-center justify-center text-[#000080] mb-6 group-hover:bg-[#000080] group-hover:text-white transition-colors duration-300 shadow-inner">
                <feature.icon strokeWidth={1.5} className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* --- FEATURED OFFERS SECTION --- */}
      <div className="bg-white py-24 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] -mr-20 -mt-20 opacity-60"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ofertas <span className="text-[#000080]">destacadas</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Los destinos más solicitados con precios que no se repetirán.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {offers.map((offer, index) => (
              <div key={index} className="group relative rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-[500px]">
                {/* Image */}
                <img 
                  src={offer.image} 
                  alt={offer.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000080] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/30">
                    {offer.hotel}
                  </span>
                  <h3 className="text-4xl font-bold mb-2">{offer.title}</h3>
                  
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-lg font-light opacity-90">Hasta</span>
                    <span className="text-5xl font-bold text-yellow-400">{offer.discount}</span>
                  </div>
                  <p className="text-xl font-medium mb-6">de descuento</p>

                  <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
                    <Percent className="w-4 h-4" />
                    {offer.extra}
                  </div>
                  
                  {/* Floating Action Button */}
                  <button className="absolute bottom-8 right-8 w-12 h-12 bg-white text-[#000080] rounded-full flex items-center justify-center shadow-lg transform translate-y-20 group-hover:translate-y-0 transition-transform duration-500 delay-100 hover:bg-blue-50">
                    <MapPin className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Packages;