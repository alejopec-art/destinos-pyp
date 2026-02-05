import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, TrendingUp, DollarSign, Briefcase } from 'lucide-react';

const SalesPage = () => {
    return (
        <div className="max-w-7xl mx-auto">
             <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Informe de Ventas</h1>
                <div className="flex gap-4 mt-4">
                    {['Todos', 'Vacacional', 'Corporativo', 'Eventos'].map((filter, i) => (
                        <button key={i} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Mini Stats */}
                {[
                    { label: 'Ventas Totales', val: '$ 180.5M COP', icon: DollarSign, color: 'text-green-400' },
                    { label: 'Ticket Promedio', val: '$ 4.2M COP', icon: TrendingUp, color: 'text-blue-400' },
                    { label: 'Tasa Conversión', val: '24%', icon: PieChart, color: 'text-purple-400' },
                    { label: 'Nuevos Leads', val: '18', icon: Briefcase, color: 'text-orange-400' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }} className="bg-[#1e293b] p-6 rounded-2xl border border-slate-700/50">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-slate-400 text-xs font-bold uppercase">{stat.label}</span>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{stat.val}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Gráficos Visuales (Simulados con CSS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700/50">
                    <h3 className="text-white font-bold mb-6">Rendimiento por Unidad</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Corporativo', val: 65, color: 'bg-blue-500' },
                            { label: 'Vacacional', val: 45, color: 'bg-teal-400' },
                            { label: 'Eventos', val: 30, color: 'bg-purple-500' }
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm text-slate-300 mb-2">
                                    <span>{item.label}</span>
                                    <span>{item.val}%</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-3">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.val}%` }} transition={{ duration: 1 }} className={`h-full rounded-full ${item.color}`}></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SalesPage;