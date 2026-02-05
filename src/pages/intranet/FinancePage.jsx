import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Search, Filter, TrendingUp, TrendingDown, FileText, Download, CreditCard, DollarSign } from 'lucide-react';

const FinancePage = () => {
    const [activeTab, setActiveTab] = useState('cashflow'); // cashflow, suppliers, reports

    return (
        <div className="max-w-7xl mx-auto min-h-screen pb-20">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Módulo Financiero</h1>
                    <p className="text-slate-400">Control contable y gestión de tesorería.</p>
                </div>
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                    <button onClick={() => setActiveTab('cashflow')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cashflow' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Flujo de Caja</button>
                    <button onClick={() => setActiveTab('suppliers')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'suppliers' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Proveedores</button>
                    <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Reportes Fiscales</button>
                </div>
            </header>

            {/* TAB: FLUJO DE CAJA */}
            {activeTab === 'cashflow' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><TrendingUp className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-slate-400 text-sm">Ingresos Totales</p>
                                    <p className="text-2xl font-bold text-white">$ 480.5M</p>
                                </div>
                            </div>
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="w-[75%] h-full bg-emerald-500"></div></div>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-400"><TrendingDown className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-slate-400 text-sm">Egresos Totales</p>
                                    <p className="text-2xl font-bold text-white">$ 320.1M</p>
                                </div>
                            </div>
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="w-[45%] h-full bg-red-500"></div></div>
                        </div>
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><DollarSign className="w-6 h-6" /></div>
                                <div>
                                    <p className="text-slate-400 text-sm">Utilidad Neta</p>
                                    <p className="text-2xl font-bold text-white">$ 160.4M</p>
                                </div>
                            </div>
                            <div className="h-1 bg-slate-700 rounded-full overflow-hidden"><div className="w-[60%] h-full bg-blue-500"></div></div>
                        </div>
                    </div>

                    <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700/50 flex gap-4">
                            <div className="relative flex-1">
                                <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder="Buscar transacción por folio o cliente..." className="w-full bg-slate-800 border-none rounded-lg pl-10 py-2 text-white focus:ring-1 focus:ring-blue-500" />
                            </div>
                            <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"><Filter className="w-5 h-5" /></button>
                        </div>
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-800 text-xs uppercase font-bold text-slate-300">
                                <tr>
                                    <th className="px-6 py-4">Folio</th>
                                    <th className="px-6 py-4">Concepto</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4 text-right">Monto</th>
                                    <th className="px-6 py-4 text-center">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {[
                                    {id: 'COT-2026-0012', concept: 'Pago Cliente - Tech Solutions', type: 'in', amount: 18500000, date: '04 Feb'},
                                    {id: 'OP-2026-0045', concept: 'Pago Proveedor - Hotel Xcaret', type: 'out', amount: -12000000, date: '03 Feb'},
                                    {id: 'COT-2026-0013', concept: 'Anticipo - Familia Ruiz', type: 'in', amount: 4800000, date: '03 Feb'},
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-500">{row.id}</td>
                                        <td className="px-6 py-4 text-white font-medium">{row.concept}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${row.type === 'in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {row.type === 'in' ? 'INGRESO' : 'EGRESO'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${row.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(row.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center">{row.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* TAB: PROVEEDORES */}
            {activeTab === 'suppliers' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Cuentas por Pagar</h2>
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-600">
                            <Upload className="w-4 h-4" /> Subir Comprobante
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'Hotel Xcaret', debt: 15400000, due: '15 Feb', status: 'pending' },
                            { name: 'Avianca Holdings', debt: 8200000, due: '28 Feb', status: 'partial' },
                            { name: 'Assist Card', debt: 0, due: '-', status: 'paid' },
                        ].map((sup, i) => (
                            <div key={i} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden group hover:border-blue-500/50 transition-all">
                                <div className={`absolute top-0 right-0 p-2 rounded-bl-xl text-xs font-bold uppercase ${
                                    sup.status === 'pending' ? 'bg-red-500/20 text-red-400' : 
                                    sup.status === 'partial' ? 'bg-amber-500/20 text-amber-400' : 
                                    'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                    {sup.status === 'pending' ? 'Pendiente' : sup.status === 'partial' ? 'Parcial' : 'Al Día'}
                                </div>
                                <h3 className="font-bold text-white text-lg mb-4">{sup.name}</h3>
                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Saldo Pendiente:</span>
                                        <span className="text-white font-mono font-bold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(sup.debt)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Vencimiento:</span>
                                        <span className="text-orange-400">{sup.due}</span>
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors">
                                    Registrar Pago
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* TAB: REPORTES FISCALES */}
            {activeTab === 'reports' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border border-blue-500/30 rounded-2xl p-8 text-center">
                        <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Generador de Reportes Fiscales</h2>
                        <p className="text-slate-400 max-w-lg mx-auto mb-8">
                            Descarga los informes consolidados para contabilidad con desglose de Base Gravable, IVA, Retenciones e Ingresos para Terceros.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all">
                                <Download className="w-5 h-5" /> Reporte Mensual (Excel)
                            </button>
                            <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold flex items-center gap-2 border border-slate-600 transition-all">
                                <Download className="w-5 h-5" /> Certificados de Retención
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
export default FinancePage;