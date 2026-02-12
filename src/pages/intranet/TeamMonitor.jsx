import React, { useState } from 'react';
import { 
    Users, Clock, Activity, LogIn, LogOut, ChevronDown, 
    MoreHorizontal, Circle
} from 'lucide-react';

const TeamMonitor = ({ advisors, embedded = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAdvisor, setSelectedAdvisor] = useState(null);

    // Mock data si no se proveen props (para preview)
    const teamData = advisors || [
        { 
            id: 1, name: 'Paola Palacios', status: 'online', 
            loginTime: '08:00 AM', lastActive: 'Hace 2 min', totalTime: '4h 30m',
            avatar: 'https://i.pravatar.cc/150?u=paola'
        },
        { 
            id: 2, name: 'Carlos Ruiz', status: 'idle', 
            loginTime: '08:15 AM', lastActive: 'Hace 15 min', totalTime: '4h 15m',
            avatar: 'https://i.pravatar.cc/150?u=carlos'
        },
        { 
            id: 3, name: 'Ana María', status: 'offline', 
            loginTime: '08:00 AM', logoutTime: '12:00 PM', totalTime: '4h 00m',
            avatar: 'https://i.pravatar.cc/150?u=ana'
        },
        { 
            id: 4, name: 'Jorge Pérez', status: 'online', 
            loginTime: '09:00 AM', lastActive: 'Ahora', totalTime: '3h 30m',
            avatar: 'https://i.pravatar.cc/150?u=jorge'
        }
    ];

    const onlineCount = teamData.filter(a => a.status !== 'offline').length;

    const getStatusColor = (status) => {
        switch(status) {
            case 'online': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
            case 'idle': return 'bg-amber-500';
            case 'offline': return 'bg-slate-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className={`${embedded ? 'w-full relative' : 'fixed bottom-6 right-6 z-50'} animate-fade-in flex flex-col items-end gap-4`}>
            
            {/* Tarjeta de Detalle (Popover) */}
            {selectedAdvisor && (
                <div className={`bg-[#1e293b]/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl w-80 relative overflow-hidden animate-slide-up ${embedded ? 'absolute left-full bottom-0 ml-4 mb-0 z-50' : 'mb-2'}`}>
                    {/* Efecto Border Beam simulado */}
                    <div className="absolute inset-0 rounded-2xl border border-transparent pointer-events-none overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-scan-horizontal"></div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img src={selectedAdvisor.avatar} alt={selectedAdvisor.name} className="w-10 h-10 rounded-full border-2 border-slate-700" />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(selectedAdvisor.status)}`}></div>
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-sm">{selectedAdvisor.name}</h4>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                                    {selectedAdvisor.status === 'online' ? 'Conectado' : selectedAdvisor.status === 'idle' ? 'Ausente' : 'Desconectado'}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedAdvisor(null)} className="text-slate-500 hover:text-white transition-colors">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-slate-900/50 rounded-xl p-3 flex justify-between items-center border border-slate-700/50">
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <LogIn className="w-3.5 h-3.5 text-blue-400" /> Entrada
                            </div>
                            <span className="text-white font-mono text-xs font-bold">{selectedAdvisor.loginTime}</span>
                        </div>
                        
                        {selectedAdvisor.status === 'offline' && (
                            <div className="bg-slate-900/50 rounded-xl p-3 flex justify-between items-center border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    <LogOut className="w-3.5 h-3.5 text-red-400" /> Salida
                                </div>
                                <span className="text-white font-mono text-xs font-bold">{selectedAdvisor.logoutTime}</span>
                            </div>
                        )}

                        <div className="bg-slate-900/50 rounded-xl p-3 flex justify-between items-center border border-slate-700/50">
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <Clock className="w-3.5 h-3.5 text-purple-400" /> Duración
                            </div>
                            <span className="text-white font-mono text-xs font-bold">{selectedAdvisor.totalTime}</span>
                        </div>

                        <div className="bg-slate-900/50 rounded-xl p-3 flex justify-between items-center border border-slate-700/50">
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Actividad
                            </div>
                            <span className="text-emerald-400 text-[10px] font-bold uppercase">{selectedAdvisor.lastActive}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Botón Principal Flotante */}
            <div className={`relative group ${embedded ? 'w-full' : ''}`}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative flex items-center gap-3 bg-slate-900 border border-slate-700/50 hover:border-cyan-500/50 text-white px-5 py-3 rounded-full shadow-xl transition-all justify-between ${embedded ? 'w-full' : 'w-64'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Users className="w-5 h-5 text-cyan-400" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        </div>
                        <div className="text-left flex-1">
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-0.5">Equipo en Línea</span>
                            <span className="block text-[10px] text-cyan-500 font-mono tracking-wide">{onlineCount}/{teamData.length} Activos</span>
                        </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Lista Desplegable Expandida */}
                {isOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-4 bg-[#1e293b]/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-slide-up origin-bottom">
                        <div className="p-3 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                            {teamData.map(advisor => (
                                <button
                                    key={advisor.id}
                                    onClick={() => {
                                        setSelectedAdvisor(advisor);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/60 transition-all group/item border border-transparent hover:border-slate-700/50"
                                >
                                    <div className="relative shrink-0">
                                        <img src={advisor.avatar} alt={advisor.name} className="w-10 h-10 rounded-full border-2 border-slate-600 group-hover/item:border-cyan-500 transition-colors" />
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(advisor.status)}`}></div>
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-200 truncate group-hover/item:text-white transition-colors">{advisor.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate group-hover/item:text-slate-400">{advisor.lastActive}</p>
                                    </div>
                                    <Activity className="w-4 h-4 text-slate-600 group-hover/item:text-cyan-400 shrink-0" />
                                </button>
                            ))}
                        </div>
                        <div className="bg-slate-900/90 p-3 text-center border-t border-slate-800">
                            <p className="text-[9px] text-slate-500 uppercase font-bold tracking-[0.2em]">Monitoreo en Tiempo Real</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamMonitor;
