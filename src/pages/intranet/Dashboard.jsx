import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palmtree, Briefcase, Calculator, LayoutDashboard, Plus, ArrowRight, LogOut, Calendar, Gift, Plane } from 'lucide-react';

const Dashboard = () => {
  const modules = [
    { 
      title: "Vacacional", 
      icon: <Palmtree className="w-10 h-10" />, 
      desc: "Gestión de paquetes turísticos y reservas personales.",
      color: "from-teal-400 to-teal-600",
      link: "/intranet/vacacional"
    },
    { 
      title: "Corporativo", 
      icon: <Briefcase className="w-10 h-10" />, 
      desc: "Servicios para empresas y eventos ejecutivos.",
      color: "from-blue-500 to-blue-700",
      link: "/intranet/corporativo"
    },
    { 
      title: "Contabilidad", 
      icon: <Calculator className="w-10 h-10" />, 
      desc: "Informes financieros, pagos y facturación.",
      color: "from-indigo-500 to-indigo-700",
      link: "/intranet/contabilidad"
    },
    { 
      title: "Administración", 
      icon: <LayoutDashboard className="w-10 h-10" />, 
      desc: "Panel de control gerencial y análisis de datos.",
      color: "from-purple-600 to-pink-600",
      link: "/intranet/admin",
      isSpecial: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans selection:bg-blue-500 selection:text-white relative pb-10">
      
      {/* Floating Logout Button */}
      <Link to="/" className="fixed top-8 right-8 z-50">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/10 text-white font-bold hover:bg-white/20 hover:shadow-xl transition-all group"
        >
          <span className="group-hover:text-red-400 transition-colors">Cerrar Sesión</span>
          <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
        </motion.button>
      </Link>

      <div className="container mx-auto px-6 pt-20">
        <div className="mb-10 text-center max-w-2xl mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1.5 bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest rounded-full mb-4"
            >
                Portal Interno
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
                Panel de Control Destinos P&P
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg"
            >
                Selecciona tu módulo de trabajo para acceder a las herramientas especializadas.
            </motion.p>
        </div>

        {/* Widgets Informativos - Estilo Glass Neon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto">
            {/* Widget Cumpleaños */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="relative bg-slate-900/60 backdrop-blur-xl border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] p-6 rounded-2xl flex items-center gap-6 group transition-all duration-300"
            >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-pink-300 opacity-70 tracking-widest border border-pink-500/20 px-1.5 rounded">HOY</div>
                <div className="p-4 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/20 group-hover:scale-110 transition-transform">
                    <Gift className="w-8 h-8 animate-[pulse_3s_ease-in-out_infinite]" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Cumpleaños</p>
                    <p className="text-white font-bold text-lg leading-tight group-hover:text-pink-200 transition-colors">Luisa Fernanda</p>
                    <p className="text-xs text-slate-500 mt-1">¡Deséale un gran día!</p>
                </div>
            </motion.div>

            {/* Widget Fecha */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="relative bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] p-6 rounded-2xl flex items-center gap-6 group transition-all duration-300"
            >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-cyan-300 opacity-70 tracking-widest border border-cyan-500/20 px-1.5 rounded">ONLINE</div>
                <div className="p-4 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Calendar className="w-8 h-8" />
                </div>
                <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Fecha Actual</p>
                    <p className="text-white font-bold text-lg leading-tight capitalize group-hover:text-cyan-200 transition-colors">
                        {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">{new Date().getFullYear()}</p>
                </div>
            </motion.div>

            {/* Widget Próximo Viaje */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="relative bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] p-6 rounded-2xl flex items-center gap-6 group transition-all duration-300"
            >
                <div className="absolute top-2 right-2 text-[10px] font-mono text-emerald-300 opacity-70 tracking-widest border border-emerald-500/20 px-1.5 rounded">PRÓXIMO</div>
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Plane className="w-8 h-8" />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Salida Grupal</p>
                    <p className="text-white font-bold text-lg leading-tight group-hover:text-emerald-200 transition-colors">Cancún - 15 Pax</p>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-1 text-right font-mono">T-Minus: 24h</p>
                </div>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {modules.map((mod, idx) => (
                <Link to={mod.link} key={idx} className="block group h-full">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        whileHover={{ y: -12 }}
                        className={`relative h-96 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden shadow-xl transition-all duration-500 ${
                            mod.isSpecial 
                            ? 'ring-4 ring-yellow-400/30 shadow-2xl shadow-purple-900/20' 
                            : 'bg-[#1e293b] border border-slate-700/50 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20'
                        }`}
                    >
                        {/* Background Styles */}
                        {mod.isSpecial ? (
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a2e] to-[#1a1a40] z-0">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                            </div>
                        ) : (
                            <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl ${mod.color} opacity-[0.05] rounded-bl-[100%] transition-all duration-500 group-hover:scale-150 group-hover:opacity-10`}></div>
                        )}

                        <div className="relative z-10">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-lg transition-transform duration-500 group-hover:scale-110 ${
                                mod.isSpecial 
                                ? 'bg-white/10 text-white backdrop-blur-md border border-white/10' 
                                : 'bg-slate-800 text-blue-400 border border-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500'
                            }`}>
                                {mod.icon}
                            </div>
                            <h3 className={`text-2xl font-bold mb-3 ${mod.isSpecial ? 'text-white' : 'text-white'}`}>
                                {mod.title}
                            </h3>
                            <p className={`text-sm leading-relaxed ${mod.isSpecial ? 'text-blue-200' : 'text-slate-400'}`}>
                                {mod.desc}
                            </p>
                        </div>

                        <div className="relative z-10 flex justify-end items-center">
                            {mod.isSpecial && <span className="mr-4 text-xs font-bold text-yellow-400 tracking-wider uppercase">Acceso Gerencial</span>}
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                                mod.isSpecial 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-[0_0_25px_rgba(255,200,0,0.4)] group-hover:shadow-[0_0_35px_rgba(255,200,0,0.6)]' 
                                : 'bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white'
                            }`}>
                                {mod.isSpecial ? <Plus className="w-7 h-7" /> : <ArrowRight className="w-6 h-6" />}
                            </div>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;