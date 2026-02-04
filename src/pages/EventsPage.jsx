import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  Building2, Utensils, Bus, MonitorPlay, 
  ClipboardCheck, Hotel, Users, Languages,
  Calendar, CheckCircle, ArrowRight
} from 'lucide-react';

const EventsPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [formStatus, setFormStatus] = useState('idle');

  const services = [
    {
      id: 1,
      title: "Salones y Espacios",
      desc: "Auditorios modulables con acústica de precisión.",
      icon: Building2,
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      size: "large"
    },
    {
      id: 2,
      title: "Catering Gourmet",
      desc: "Experiencias culinarias para paladares exigentes.",
      icon: Utensils,
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      size: "medium"
    },
    {
      id: 3,
      title: "Logística VIP",
      desc: "Flota de lujo para traslados ejecutivos.",
      icon: Bus,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      size: "medium"
    },
    {
      id: 4,
      title: "Producción AV",
      desc: "Streaming 4K, Mapping y Sonido Dolby Atmos.",
      icon: MonitorPlay,
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      size: "large"
    }
  ];

  const galleryImages = [
    { id: 1, category: 'congresos', img: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 2, category: 'lanzamientos', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 3, category: 'cenas', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 4, category: 'outdoor', img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 5, category: 'congresos', img: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 6, category: 'lanzamientos', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 7, category: 'cenas', img: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 8, category: 'outdoor', img: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 9, category: 'congresos', img: 'https://images.unsplash.com/photo-1560523159-4a9692d222f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  ];

  const handleFilter = (filter) => setActiveFilter(filter);

  const filteredImages = activeFilter === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeFilter);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('loading');
    setTimeout(() => setFormStatus('sent'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-600 selection:text-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Corporate Event" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#000020]/95 via-[#000020]/80 to-[#000020]/40"></div>
        </div>
        
        <div className="relative z-10 container max-w-[1440px] mx-auto px-6 md:px-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
              Eventos que <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Trascienden</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-lg font-light border-l-4 border-blue-500 pl-6 mb-8">
              Logística integral para empresas que buscan la excelencia. 
              Donde la tecnología y el servicio se encuentran.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30">
                Explorar Servicios
              </button>
            </div>
          </motion.div>

          {/* Floating Quote Form */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-lg mx-auto lg:ml-auto"
          >
            {/* Glow Effect behind form */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-[2.5rem] blur opacity-20 animate-pulse"></div>
            
            <div className="relative bg-[#000080]/90 backdrop-blur-sm border border-blue-400/30 p-10 md:p-12 rounded-[2rem] shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:border-blue-400/50">
              <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-4">
                <div className="bg-white/10 p-3 rounded-xl border border-white/20">
                  <Calendar className="w-8 h-8 text-blue-300" />
                </div>
                Cotizar Evento
              </h3>
              
              {formStatus === 'sent' ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 text-green-400 mb-6 border border-green-500/30">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold mb-3 text-white">¡Solicitud Enviada!</h4>
                  <p className="text-blue-100 text-lg">Un especialista le contactará en breve.</p>
                  <button onClick={() => setFormStatus('idle')} className="mt-8 text-blue-300 hover:text-white font-semibold hover:underline transition-colors">Nueva cotización</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm text-white mb-2 font-medium tracking-wide">Empresa / Organización</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-inner" 
                      placeholder="Nombre de su empresa" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm text-white mb-2 font-medium tracking-wide">Asistentes</label>
                      <input 
                        type="number" 
                        required 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-inner" 
                        placeholder="Ej: 200" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white mb-2 font-medium tracking-wide">Fecha</label>
                      <input 
                        type="date" 
                        required 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-inner" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-white mb-2 font-medium tracking-wide">Tipo de Evento</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 shadow-inner appearance-none cursor-pointer">
                      <option>Congreso / Convención</option>
                      <option>Cena de Gala</option>
                      <option>Lanzamiento de Producto</option>
                      <option>Team Building</option>
                      <option>Otro</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    disabled={formStatus === 'loading'}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-lg py-5 rounded-xl shadow-lg shadow-blue-900/40 transform transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                  >
                    {formStatus === 'loading' ? (
                      <span className="animate-pulse">Procesando...</span>
                    ) : (
                      <>Solicitar Propuesta <ArrowRight className="w-6 h-6" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid Services */}
      <section className="py-24 bg-[#000020] text-white">
        <div className="container max-w-[1440px] mx-auto px-6 md:px-20">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl font-bold text-center mb-16"
          >
            Infraestructura de Clase Mundial
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative rounded-3xl overflow-hidden cursor-pointer ${
                  service.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'
                }`}
              >
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="bg-blue-600/20 backdrop-blur-md p-3 rounded-xl inline-block mb-4 border border-blue-400/30">
                    <service.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>
                  <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions 360 */}
      <section className="py-24 bg-gray-50">
        <div className="container max-w-[1440px] mx-auto px-6 md:px-20">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Soluciones 360</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Todo en un solo lugar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: ClipboardCheck, title: "Gestión de Registros", desc: "Plataformas digitales de acreditación." },
              { icon: Hotel, title: "Alojamiento Grupal", desc: "Negociación de tarifas corporativas." },
              { icon: Users, title: "Team Building", desc: "Actividades de integración de alto impacto." },
              { icon: Languages, title: "Traducción Simultánea", desc: "Equipos multilingües en tiempo real." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group"
              >
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                  <div className="relative bg-blue-50 p-4 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <item.icon className="w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container max-w-[1440px] mx-auto px-6 md:px-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#000020] mb-4">Nuestros Montajes</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Inspírese con nuestra galería de eventos realizados. Cada detalle cuenta.</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['all', 'congresos', 'lanzamientos', 'cenas', 'outdoor'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilter(filter)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  activeFilter === filter 
                    ? 'bg-[#000020] text-white shadow-lg transform scale-105' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((img) => (
              <motion.div 
                key={img.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group relative rounded-2xl overflow-hidden aspect-video cursor-pointer shadow-lg"
              >
                <img 
                  src={img.img} 
                  alt={img.category} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Overlay Effect */}
                <div className="absolute inset-0 bg-blue-900/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-bold text-lg uppercase tracking-wider">
                      {img.category}
                    </p>
                    <div className="w-8 h-1 bg-blue-400 mx-auto mt-2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;