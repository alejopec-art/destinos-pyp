import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BarChart3, Users, DollarSign, Target, TrendingUp, CheckCircle, ArrowLeft, Filter, 
    Calendar, AlertTriangle, Briefcase, Plane, Calculator, UserCheck, AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [managerFilter, setManagerFilter] = useState('global'); // global | paola_p | paola_c
  const [selectedModule, setSelectedModule] = useState('vacacional'); // vacacional | corporativo | contabilidad

  // KPIs Dinámicos según Gerente
  const kpiData = {
    global: { sales: '506.2M', growth: '+12%', active: 45 },
    paola_p: { sales: '290.5M', growth: '+15%', active: 28 },
    paola_c: { sales: '215.7M', growth: '+8%', active: 17 }
  };

  const currentKPIs = kpiData[managerFilter];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans p-6 md:p-10">
        {/* Header Dashboard - VISTA DE DUEÑAS */}
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
                <Link to="/intranet/dashboard" className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Panel de Gerencia</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-slate-400">Vista:</span>
                        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                            <button onClick={() => setManagerFilter('global')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${managerFilter === 'global' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}>GLOBAL</button>
                            <button onClick={() => setManagerFilter('paola_p')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${managerFilter === 'paola_p' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'}`}>PAOLA P.</button>
                            <button onClick={() => setManagerFilter('paola_c')} className={`px-3 py-1 rounded text-xs font-bold transition-all ${managerFilter === 'paola_c' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>PAOLA C.</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* SELECTOR DE MÓDULO */}
            <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md">
                <button 
                    onClick={() => setSelectedModule('vacacional')} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${selectedModule === 'vacacional' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Plane className="w-4 h-4" /> Vacacional
                </button>
                <button 
                    onClick={() => setSelectedModule('corporativo')} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${selectedModule === 'corporativo' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Briefcase className="w-4 h-4" /> Corporativo
                </button>
                <button 
                    onClick={() => setSelectedModule('contabilidad')} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${selectedModule === 'contabilidad' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    <Calculator className="w-4 h-4" /> Contabilidad
                </button>
            </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        <AnimatePresence mode="wait">
            <motion.div 
                key={selectedModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-4 gap-6"
            >
                
                {/* --- VISTA VACACIONAL --- */}
                {selectedModule === 'vacacional' && (
                    <>
                        {/* KPI Principal */}
                        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-[2rem] p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Plane className="w-32 h-32" /></div>
                            <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Ventas Vacacionales ({managerFilter === 'global' ? 'Total' : managerFilter === 'paola_p' ? 'P. Palacios' : 'P. Caicedo'})</h3>
                            <p className="text-4xl font-bold text-white mb-2">$ {currentKPIs.sales}</p>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" /> {currentKPIs.growth} vs mes anterior
                            </div>
                        </div>

                        {/* Top Destinos */}
                        <div className="col-span-1 md:col-span-2 bg-[#1e293b] border border-slate-700/50 rounded-[2rem] p-8">
                            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-6">Destinos Trending</h3>
                            <div className="space-y-4">
                                {[{name: 'Punta Cana', val: 85}, {name: 'Cancún', val: 72}, {name: 'Europa', val: 45}].map((d, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between text-sm font-bold mb-1">
                                            <span>{d.name}</span>
                                            <span className="text-blue-400">{d.val} pax</span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500" style={{width: `${d.val}%`}}></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Auditoría Empleados (Vacacional) */}
                        <div className="col-span-1 md:col-span-4 bg-[#1e293b] border border-slate-700/50 rounded-[2rem] p-8">
                            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2"><UserCheck className="w-5 h-5 text-blue-400" /> Rendimiento de Asesores (Vacacional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {['Ana María', 'Carlos R.', 'Luisa F.'].map((name, i) => (
                                    <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">{name.charAt(0)}</div>
                                                <div>
                                                    <p className="font-bold text-white">{name}</p>
                                                    <p className="text-xs text-slate-400">Asesor {i===0 ? 'Senior' : 'Junior'}</p>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${i===0 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{i===0 ? 'Excelente' : 'Regular'}</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-slate-400"><span>Cotizaciones:</span> <span className="text-white font-bold">24</span></div>
                                            <div className="flex justify-between text-slate-400"><span>Cierres:</span> <span className="text-white font-bold">8</span></div>
                                            <div className="flex justify-between text-slate-400"><span>Tasa Conv.:</span> <span className="text-blue-400 font-bold">33%</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {/* --- VISTA CORPORATIVO --- */}
                {selectedModule === 'corporativo' && (
                    <>
                        <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-purple-900/40 to-slate-900 border border-purple-500/30 rounded-[2rem] p-8">
                            <h3 className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-2">Facturación Corporativa</h3>
                            <p className="text-4xl font-bold text-white mb-2">$ 320.8M</p>
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                                <TrendingUp className="w-4 h-4" /> +5% vs mes anterior
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-2 bg-[#1e293b] border border-slate-700/50 rounded-[2rem] p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <AlertCircle className="w-8 h-8 text-orange-400" />
                                <div>
                                    <h4 className="font-bold text-white">Alertas de Contratos</h4>
                                    <p className="text-sm text-slate-400">2 contratos vencen en 30 días</p>
                                </div>
                            </div>
                            <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors">Ver Detalles</button>
                        </div>
                    </>
                )}

                {/* --- VISTA CONTABILIDAD --- */}
                {selectedModule === 'contabilidad' && (
                    <>
                         <div className="col-span-1 md:col-span-4 bg-gradient-to-r from-emerald-900/40 to-slate-900 border border-emerald-500/30 rounded-[2rem] p-8 text-center">
                            <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-4">Salud Financiera Global</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Ingresos Totales</p>
                                    <p className="text-3xl font-bold text-white">$ 506.2M</p>
                                </div>
                                <div className="border-x border-slate-700/50">
                                    <p className="text-slate-400 text-sm mb-1">Cuentas por Pagar</p>
                                    <p className="text-3xl font-bold text-red-400">$ 42.5M</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Utilidad Neta</p>
                                    <p className="text-3xl font-bold text-emerald-400">$ 120.8M</p>
                                </div>
                            </div>
                         </div>
                    </>
                )}

            </motion.div>
        </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;