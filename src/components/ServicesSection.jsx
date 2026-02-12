import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Plane, Ship, Users, 
  Map, Heart, ShieldCheck, Car, 
  Lock, Headphones, BadgeCheck, Clock,
  FileText, Syringe, Globe, CreditCard, Smartphone 
} from 'lucide-react';

const ServicesSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* 1. Encabezado de Identidad */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight"
          >
            Diseñamos experiencias únicas con <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000080] to-blue-600">soluciones integrales</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 mb-6"
          >
            Todo en un solo lugar con Destinos P&P. Planifica, reserva y viaja sin complicaciones.
          </motion.p>
        </div>

        {/* 2. Bloque: Explora el Mundo a tu Manera (Categorías Principales) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {[
            {
              icon: Building2,
              title: "Alojamiento & Hoteles",
              desc: "Hoteles verificados, desde boutique hasta todo incluido.",
              color: "bg-blue-500"
            },
            {
              icon: Plane,
              title: "Tiquetes Aéreos",
              desc: "Las mejores tarifas y conexiones seguras.",
              color: "bg-sky-500"
            },
            {
              icon: Ship,
              title: "Cruceros",
              desc: "Itinerarios espectaculares y experiencias a bordo.",
              color: "bg-indigo-500"
            },
            {
              icon: Users,
              title: "Eventos & Corporativo",
              desc: "Organización de convenciones, incentivos y reuniones con impacto.",
              color: "bg-amber-500"
            }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group relative h-full bg-white/60 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 relative z-10`}>
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-[#000080] transition-colors relative z-10">{item.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 3. Bloque: Experiencias Especializadas (Módulos de Nicho) */}
        <div className="mb-20">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Experiencias Especializadas</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { icon: Map, title: "Excursiones", desc: "Planes educativos y seguros para colegios y universidades." },
              { icon: Heart, title: "Planes Románticos", desc: "Experiencias diseñadas exclusivamente para parejas." },
              { icon: ShieldCheck, title: "Asesoría de Visas y Asistencia", desc: "Acompañamiento profesional y seguridad 24/7." },
              { icon: Car, title: "Tours y Alquiler", desc: "Aventuras guiadas y movilidad flexible en cualquier destino." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="flex items-start gap-4 p-6 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 border border-transparent hover:border-slate-100"
              >
                <div className="p-3 bg-slate-100 rounded-xl text-slate-600 group-hover:text-[#000080] transition-colors">
                  <item.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 4. Sección de Valor: Te Garantizamos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {[
            { icon: Lock, title: "Bloqueos Especiales", desc: "Cupos limitados reservados con anticipación para los mejores precios." },
            { icon: BadgeCheck, title: "Seguridad de Inversión", desc: "Protocolos que garantizan la protección de tu dinero en cada experiencia." }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="bg-[#000080] text-white p-8 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <item.icon size={100} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
                  <item.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 5. Support Section (Replaces Gestion Personalizada) */}
        <div className="mb-20">
             <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1e293b] border border-slate-700/50 shadow-2xl group">
                 {/* Glassmorphism & Background */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"></div>

                <div className="relative z-10 grid md:grid-cols-2 gap-12 p-8 md:p-12 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                                <ShieldCheck className="w-4 h-4" /> Soporte Premium
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                                Asesoría y asistencia <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">antes y durante tu viaje</span>
                            </h3>
                            <p className="text-blue-200 text-lg font-medium mb-4">
                                Estamos contigo en cada paso de tu aventura ✈️
                            </p>
                            <p className="text-slate-400 leading-relaxed text-lg">
                                Te brindamos acompañamiento personalizado antes y durante tu viaje para que te sientas tranquilo y bien respaldado en todo momento.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors group/card">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                                    <Clock className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h4 className="text-white font-bold mb-2">Horarios de Atención</h4>
                                <p className="text-slate-400 text-sm">
                                    <span className="block mb-1">Lun - Vie: 8:00 a.m. - 6:00 p.m.</span>
                                    <span>Sábados: 9:00 a.m. - 12:00 p.m.</span>
                                </p>
                            </div>

                            <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-500/20 hover:bg-blue-900/30 transition-colors group/card">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                                <h4 className="text-white font-bold mb-2">Soporte en Viaje</h4>
                                <p className="text-blue-200/80 text-sm italic">
                                    "Cuentas con atención 24 horas para cualquier imprevisto. Viaja con seguridad."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group/image">
                        <img 
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" 
                            alt="Support Team" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>
                        
                        <div className="absolute bottom-0 left-0 p-8">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex -space-x-4">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center overflow-hidden">
                                            <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Agent" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-white font-bold text-sm">+15 Expertos</span>
                            </div>
                            <p className="text-white font-medium">"Tu tranquilidad es nuestra prioridad"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 6. Módulo Informativo & 7. Cierre */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Informativo */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">¿Sabes qué necesitas para viajar?</h3>
              <p className="text-slate-600 mb-8">
                En Destinos P&P te damos la guía clara y actualizada de las normas de cada país.
              </p>
              <div className="flex gap-6 mb-8">
                {[
                  { icon: FileText, label: "Visas" },
                  { icon: BadgeCheck, label: "Pasaportes" },
                  { icon: Globe, label: "Migración" },
                  { icon: Syringe, label: "Vacunas" }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-[#D4AF37] group-hover:text-[#D4AF37] transition-all">
                      <item.icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide group-hover:text-slate-800 transition-colors">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Medios de Pago */}
            <div className="lg:border-l lg:border-slate-100 lg:pl-12">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-[#000080]" />
                Medios de Pago Flexibles
              </h4>
              <p className="text-sm text-slate-500 mb-6">
                Aceptamos tarjetas de crédito, débito, transferencias y pagos digitales. ¡Tú eliges!
              </p>
              <div className="flex flex-wrap gap-4 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded border border-slate-200">
                  <CreditCard size={16} /> <span className="text-xs font-bold">Visa/MC</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded border border-slate-200">
                   <Globe size={16} /> <span className="text-xs font-bold">PSE</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded border border-slate-200">
                   <Smartphone size={16} /> <span className="text-xs font-bold">Nequi</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ServicesSection;