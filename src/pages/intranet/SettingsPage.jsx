import React, { useState } from 'react';
import { UserCog, Lock, Shield, FileText, Upload, RefreshCw, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile'); // profile | consecutives | users

    return (
        <div className="max-w-6xl mx-auto min-h-screen pb-20">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Configuración & Ajustes</h1>
                    <p className="text-slate-400">Personaliza tu perfil y gestiona los parámetros del sistema.</p>
                </div>
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                    <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Mi Perfil</button>
                    <button onClick={() => setActiveTab('consecutives')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'consecutives' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Consecutivos</button>
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Usuarios</button>
                </div>
            </header>

            {/* TAB: MI PERFIL */}
            {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1 bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 text-center">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg shadow-purple-900/50 border-4 border-slate-800">
                            AM
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">Ana María</h2>
                        <p className="text-slate-400 text-sm mb-6">Asesor Senior</p>
                        <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-bold border border-slate-600 flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" /> Cambiar Foto
                        </button>
                    </div>
                    <div className="col-span-1 md:col-span-2 bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Firma Digital</h3>
                        <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-slate-800/30">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-slate-300 font-medium">Sube tu firma escaneada (PNG transparente)</p>
                            <p className="text-xs text-slate-500 mt-1">Esta firma aparecerá automáticamente en tus cotizaciones PDF.</p>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-white mb-4">Metas Personales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Meta de Ventas Mensual (COP)</label>
                                    <input type="text" defaultValue="$ 50.000.000" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none font-mono" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Notificaciones</label>
                                    <div className="flex items-center gap-2 mt-3">
                                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-slate-300 text-sm">Alertas de Vencimiento</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20">
                                <Save className="w-5 h-5" /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB: CONSECUTIVOS */}
            {activeTab === 'consecutives' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-emerald-400" /> Control Maestro de Consecutivos</h3>
                            <p className="text-slate-400 mt-1">Zona restringida. Solo Administración puede modificar estos valores.</p>
                        </div>
                        <button className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg text-sm font-bold border border-slate-700 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4" /> Reset Anual
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Cotizaciones Vacacional', prefix: 'COT-2026-', current: '0014' },
                            { label: 'Cotizaciones Corporativo', prefix: 'CORP-2026-', current: '0089' },
                            { label: 'Cuentas de Cobro', prefix: 'CC-2026-', current: '0102' },
                        ].map((item, i) => (
                            <div key={i} className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                                <p className="text-slate-400 text-xs uppercase font-bold mb-4">{item.label}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-mono text-lg">{item.prefix}</span>
                                    <input type="text" defaultValue={item.current} className="w-20 bg-slate-800 border border-slate-600 rounded text-center text-white font-mono text-xl font-bold focus:border-emerald-500 outline-none" />
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Siguiente folio automático</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-3">
                        <Shield className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-400 font-bold text-sm">Advertencia de Seguridad</p>
                            <p className="text-yellow-200/70 text-xs mt-1">Modificar manualmente los consecutivos puede causar inconsistencias en la base de datos y duplicidad de documentos. Realice cambios solo si es estrictamente necesario.</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TAB: USUARIOS (Existing Content Enhanced) */}
            {activeTab === 'users' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e293b] border border-slate-700/50 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><UserCog className="w-5 h-5 text-blue-400" /> Gestión de Usuarios</h3>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-900/20">
                            + Nuevo Usuario
                        </button>
                    </div>
                    <div className="p-6 space-y-4">
                        {['Ana María', 'Carlos Rodríguez', 'Luisa Fernanda'].map((user, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">{user.charAt(0)}</div>
                                    <div>
                                        <p className="text-white font-medium">{user}</p>
                                        <p className="text-xs text-slate-400">Asesor Comercial</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="text-sm text-slate-400 hover:text-white font-medium px-3 py-1 bg-slate-700 rounded-lg transition-colors">Editar</button>
                                    <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 transition-colors">
                                        <Lock className="w-3 h-3" /> Clave
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
export default SettingsPage;