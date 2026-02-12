import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import { 
  Briefcase, Users, Zap, MonitorPlay, Truck, ShieldCheck, 
  TrendingUp, Award, CreditCard, Globe, Headphones, Gift, 
  Building, Layout, Camera, Mic, Smartphone, ArrowRight, 
  CheckCircle2, PenTool, ClipboardList, Hammer, Star,
  Speaker, Lightbulb, Wifi, Palette, Plane, PartyPopper, 
  Rocket, Layers, MapPin, Target
} from 'lucide-react';

const EventsPage = () => {
  const pipelineSteps = [
    { id: "01", title: "Diseño y Conceptualización", desc: "Planos y Renders 3D", icon: PenTool },
    { id: "02", title: "Planeación y Logística", desc: "Ingeniería y Cronogramas", icon: ClipboardList },
    { id: "03", title: "Ejecución y Montaje", desc: "Instalación Supervisada", icon: Hammer },
  ];

  const benefits = [
    { title: "Financiero", icon: CreditCard, items: ["Tarifas Exclusivas", "Facturación Electrónica", "Reportes de Viáticos"] },
    { title: "Soporte", icon: Headphones, items: ["Asesor Exclusivo", "Gestión 24/7", "Resolución Inmediata"] },
    { title: "Fidelización", icon: Gift, items: ["Planes Vacacionales", "Descuentos Empleados", "Beneficios Premium"] },
  ];

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      <Header />

      {/* 1. Hero Section de Impacto */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background Particles (Simulated) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1e1b4b] via-[#020205] to-[#020205] opacity-50"></div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Floating Legal Bar */}
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-12 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-shadow"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs md:text-sm font-mono text-cyan-100 tracking-wider">
              NIT: 901721152-3 | RNT: 175012 • 175017 • 175075
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
              Construimos
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
              Experiencias
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed"
          >
            Fortalecemos relaciones y cumplimos objetivos a través de soluciones integrales en viajes corporativos.
          </motion.p>
        </div>
      </section>

      {/* 2. Misión y Visión (3D Tilt Cards) */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              whileHover={{ rotateX: 5, rotateY: 5, scale: 1.02 }}
              className="p-10 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-xl shadow-2xl group transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Misión</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Transformamos sueños en realidades con <strong className="text-cyan-400">Conexiones Significativas</strong> y soluciones personalizadas.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ rotateX: 5, rotateY: -5, scale: 1.02 }}
              className="p-10 rounded-3xl bg-gradient-to-bl from-purple-500/10 to-white/0 border border-white/10 backdrop-blur-xl shadow-2xl group transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Visión 2028</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Ser la agencia líder global impulsada por la <strong className="text-purple-400">Innovación</strong> y la excelencia en el servicio.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. Pipeline Interactivo */}
      <section className="py-32 bg-[#020205] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-900 to-transparent"></div>
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-white mb-4">Pipeline de Ejecución</h2>
            <p className="text-gray-500">Nuestro proceso certificado paso a paso</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full"></div>
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 -translate-y-1/2 rounded-full opacity-30"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {pipelineSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="bg-[#0a0a12] p-8 rounded-2xl border border-gray-800 hover:border-cyan-500/50 transition-all text-center group"
                >
                  <div className="w-20 h-20 mx-auto bg-[#020205] border-4 border-gray-800 rounded-full flex items-center justify-center mb-6 group-hover:border-cyan-500 transition-colors relative z-20">
                    <step.icon className="w-8 h-8 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="absolute -top-3 -right-3 w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {step.id}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bento Grid de Servicios */}
      <section className="py-24 bg-[#050510]">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white mb-16 text-center">Ecosistema de Servicios</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)]">
            
            {/* Eventos Large Card */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 lg:col-span-2 row-span-2 p-8 rounded-3xl bg-gradient-to-br from-blue-900/20 to-[#0a0a12] border border-white/5 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PartyPopper className="w-32 h-32 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Briefcase className="text-blue-400" /> Eventos Corporativos
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                {['Congresos', 'Lanzamientos', 'Fiestas', 'Team Building'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-300 bg-black/20 p-3 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Audiovisuales */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="md:col-span-1 lg:col-span-2 p-8 rounded-3xl bg-[#0f172a] border border-white/5 hover:border-purple-500/30 transition-colors"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <MonitorPlay className="text-purple-400" /> Audiovisuales
              </h3>
              <div className="flex flex-wrap gap-3">
                {['Pantallas LED', 'Sonido Pro', 'Iluminación', 'Streaming'].map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-sm border border-purple-500/20">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Infraestructura */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="p-8 rounded-3xl bg-[#0f172a] border border-white/5 hover:border-pink-500/30 transition-colors"
            >
              <Layout className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Infraestructura</h3>
              <p className="text-gray-400 text-sm">Branding, Mobiliario y Arquitectura Efímera.</p>
            </motion.div>

            {/* Transporte */}
            <motion.div 
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 lg:col-span-1 row-span-2 p-8 rounded-3xl bg-gradient-to-b from-cyan-900/20 to-[#0a0a12] border border-white/5 relative overflow-hidden"
            >
              <div className="absolute bottom-0 right-0 p-4 opacity-10">
                <Truck className="w-24 h-24 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Truck className="text-cyan-400" /> Transporte Élite
              </h3>
              <ul className="space-y-4 relative z-10">
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500" /> 4x4 y Vans
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-500" /> Buses (1-40 pax)
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-cyan-500" /> Monitoreo GPS
                </li>
              </ul>
            </motion.div>

             {/* Filler / Extra */}
             <motion.div 
              whileHover={{ scale: 0.98 }}
              className="p-8 rounded-3xl bg-[#0f172a] border border-white/5 flex items-center justify-center"
            >
              <div className="text-center">
                <Award className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
                <span className="text-yellow-100 font-bold">Top Quality</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Smart Benefits Panel */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="bg-[#0f172a]/50 backdrop-blur-xl rounded-[40px] border border-white/5 p-8 md:p-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Ventajas del Convenio</h2>
            
            <div className="grid md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-800">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="px-4 py-4 md:py-0 text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-800 rounded-2xl flex items-center justify-center mb-6">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-6">{benefit.title}</h3>
                  <ul className="space-y-3">
                    {benefit.items.map((item, i) => (
                      <li key={i} className="text-gray-400 text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section (Re-integrated) */}
      <Contact />

      {/* 6. Cierre con Medios de Pago */}
      <section className="py-12 bg-black border-t border-gray-900">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center items-center gap-12 grayscale hover:grayscale-0 transition-all duration-500 opacity-70 hover:opacity-100">
            {/* Simulated Payment Logos using Lucide & Text */}
            <div className="flex items-center gap-2">
              <CreditCard className="w-8 h-8 text-white" />
              <span className="font-bold text-white text-lg">VISA / MC</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-8 h-8 text-blue-400" />
              <span className="font-bold text-blue-400 text-lg">PSE</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-8 h-8 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-lg">Nequi</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-8 h-8 text-green-500" />
              <span className="font-bold text-green-500 text-lg">Swift</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventsPage;