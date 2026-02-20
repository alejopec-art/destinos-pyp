import React, { useState } from 'react';
import {
    ShieldCheck, Settings, Users, AlertTriangle, Activity,
    Lock, Save, AlertCircle, CheckCircle, FileText,
    Database, DollarSign, ToggleLeft, ToggleRight, History,
    Eye, Edit3, FileClock, Filter, Search, X, ChevronRight,
    BarChart3, TrendingUp, Wallet, Clock, Calendar, MapPin,
    LogOut, LayoutDashboard, Menu
} from 'lucide-react';
import TeamMonitor from './TeamMonitor';

const AdminPanel = ({ config, onUpdateConfig, logs, quotes = [], isLoading, onEditQuote, onExit }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingChange, setPendingChange] = useState(null);
    const [localConfig, setLocalConfig] = useState(config);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Estados de Filtrado
    const [searchTerm, setSearchTerm] = useState('');
    const [advisorFilter, setAdvisorFilter] = useState('all');
    const [dateRange, setDateRange] = useState('7d');

    // --- CÁLCULOS DINÁMICOS ---
    const filteredQuotes = quotes.filter(q => {
        const matchesSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.client.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAdvisor = advisorFilter === 'all' || q.advisor === advisorFilter;
        // Lógica de fecha simplificada para el demo/v1
        return matchesSearch && matchesAdvisor;
    });

    const confirmedQuotes = filteredQuotes.filter(q => q.status === 'Completado');
    const totalSalesUSD = confirmedQuotes.reduce((acc, q) => {
        const val = q.data?.salePrice || q.data?.totalPrice || q.data?.totalCharged || 0;
        return acc + parseFloat(val);
    }, 0);

    const conversionRate = quotes.length > 0 ? (confirmedQuotes.length / quotes.length) * 100 : 0;
    const avgTicket = confirmedQuotes.length > 0 ? totalSalesUSD / confirmedQuotes.length : 0;

    const uniqueAdvisors = [...new Set(quotes.map(q => q.advisor))];

    // Manejo de cambios locales antes de guardar
    const handleChange = (section, field, value) => {
        setLocalConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const requestSave = () => setPendingChange(true);
    const confirmSave = () => {
        onUpdateConfig(localConfig);
        setPendingChange(false);
    };

    // --- SUB-COMPONENTES ---

    const handleExportCSV = () => {
        if (filteredQuotes.length === 0) return;

        const headers = ["Folio", "Fecha", "Asesor", "Cliente", "Estado", "Valor (USD)", "Tipo"];
        const rows = filteredQuotes.map(q => [
            q.id,
            q.date,
            q.advisor,
            q.client,
            q.status,
            q.data?.salePrice || q.data?.totalPrice || 0,
            q.data?.serviceType || 'Vacacional'
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_admin_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleMonthlyClosing = () => {
        // Esta función disparará la generación del PDF de cierre
        if (confirmedQuotes.length === 0) {
            alert("No hay ventas confirmadas en este periodo para realizar el cierre.");
            return;
        }

        // Obtenemos el mes actual para el título
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const currentMonth = monthNames[new Date().getMonth()];

        // Llamada a la utilidad PDF (se asume inyectada o importada)
        if (window.generateMonthlyReportPdf) {
            window.generateMonthlyReportPdf({
                month: currentMonth,
                year: new Date().getFullYear(),
                quotes: confirmedQuotes,
                totalSales: totalSalesUSD,
                avgTicket: avgTicket,
                conversion: conversionRate,
                advisor: "Gerencia"
            });
        } else {
            console.warn("Utilidad generateMonthlyReportPdf no encontrada");
            alert("Generando cierre de mes para " + currentMonth + "... (PDF en proceso)");
        }
    };

    // --- SUB-COMPONENTES ---

    const FilterBar = () => (
        <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 mb-8 flex flex-wrap gap-4 items-center animate-fade-in relative z-20">
            <div className="flex-1 min-w-[200px] relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar por Folio o Cliente..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-xl border border-slate-700">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                    className="bg-transparent text-xs text-slate-300 font-bold border-none outline-none cursor-pointer"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="7d">Últimos 7 Días</option>
                    <option value="30d">Últimos 30 Días</option>
                    <option value="month">Mes Actual</option>
                </select>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-xl border border-slate-700">
                <Users className="w-4 h-4 text-slate-400" />
                <select
                    className="bg-transparent text-xs text-slate-300 font-bold border-none outline-none cursor-pointer"
                    value={advisorFilter}
                    onChange={(e) => setAdvisorFilter(e.target.value)}
                >
                    <option value="all">Todos los Asesores</option>
                    {uniqueAdvisors.map(adv => <option key={adv} value={adv}>{adv}</option>)}
                </select>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-xl border border-slate-600 hover:bg-slate-600 transition-all text-xs font-bold flex items-center gap-2"
                >
                    <FileText className="w-4 h-4" /> Exportar CSV
                </button>
                <button
                    onClick={handleMonthlyClosing}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/40 hover:scale-105 transition-all text-xs font-bold flex items-center gap-2"
                >
                    <ShieldCheck className="w-4 h-4" /> Cierre de Mes
                </button>
            </div>
        </div>
    );

    const KPICard = ({ title, value, subtext, icon: Icon, color, trend }) => (
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-600 transition-all">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-${color}-500/20 transition-all`}></div>
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-${color}-400`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend && (
                        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[10px] font-bold">{trend}</span>
                        </div>
                    )}
                </div>
                <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>
                <p className="text-3xl font-black text-white mb-2">{value}</p>
                <p className="text-slate-500 text-[10px]">{subtext}</p>
            </div>
        </div>
    );

    const DashboardView = () => (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                    title="Conversión Ventas"
                    value={`${conversionRate.toFixed(1)}%`}
                    subtext={`De ${quotes.length} cotizaciones totales`}
                    icon={Activity}
                    color="blue"
                />
                <KPICard
                    title="Volumen Ventas"
                    value={`$${(totalSalesUSD).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    subtext="USD Total Confirmado"
                    icon={Wallet}
                    color="emerald"
                    trend={confirmedQuotes.length > 0 ? `+${confirmedQuotes.length} ventas` : '0 ventas'}
                />
                <KPICard
                    title="Ticket Promedio"
                    value={`$${(avgTicket).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    subtext="Por venta confirmada (USD)"
                    icon={BarChart3}
                    color="purple"
                />
                <KPICard
                    title="Tiempo Respuesta"
                    value="Pendiente"
                    subtext="Métrica en desarrollo"
                    icon={Clock}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Simulado: Ventas por Módulo */}
                <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 min-h-[300px] relative">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-emerald-400" /> Rendimiento de Ventas (USD)
                    </h3>
                    <div className="flex items-end justify-between h-48 gap-4 px-4 pb-2 border-b border-slate-700/50">
                        {/* Gráfico dinámico basado en las últimas 7 ventas o similar */}
                        {confirmedQuotes.slice(-7).map((q, i) => {
                            const val = q.data?.salePrice || 1000;
                            const h = Math.min((val / (avgTicket || 1)) * 50, 100);
                            return (
                                <div key={i} className="w-full flex flex-col items-center justify-end h-full group">
                                    <div className="text-[8px] text-slate-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">${val}</div>
                                    <div className="w-8 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all hover:scale-110" style={{ height: `${h}%` }}></div>
                                </div>
                            );
                        })}
                        {confirmedQuotes.length === 0 && (
                            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs italic">No hay ventas confirmadas para graficar</div>
                        )}
                    </div>
                    <div className="flex justify-between mt-4 text-xs text-slate-500 uppercase font-bold">
                        <span>Últimas Operaciones Confirmadas</span>
                    </div>
                </div>

                {/* Top Advisors */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-400" /> Ranking de Asesores
                    </h3>
                    <div className="space-y-4">
                        {uniqueAdvisors.slice(0, 5).map((advisor, i) => {
                            const advQuotes = quotes.filter(q => q.advisor === advisor);
                            const advConfirmed = advQuotes.filter(q => q.status === 'Completado');
                            const advSales = advConfirmed.reduce((acc, q) => acc + (parseFloat(q.data?.salePrice || 0)), 0);

                            return (
                                <div key={advisor} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/30 border border-slate-700/30">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                                        {advisor.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-bold">{advisor}</p>
                                        <p className="text-slate-500 text-[10px]">{advQuotes.length} cotizaciones / {advConfirmed.length} ventas</p>
                                    </div>
                                    <span className="text-emerald-400 font-mono font-bold text-sm">${advSales.toLocaleString()}</span>
                                </div>
                            );
                        })}
                        {uniqueAdvisors.length === 0 && (
                            <p className="text-slate-500 text-xs italic text-center py-4">Sin datos de asesores</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Reutilizamos SupervisionView pero sin el contenedor externo para encajar en el layout nuevo
    const SupervisionContent = () => (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-md">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                    <tr>
                        <th className="p-4">Consecutivo</th>
                        <th className="p-4">Asesor</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Estado / Paso</th>
                        <th className="p-4 text-slate-400 text-xs">Tipo de Servicio</th>
                        <th className="p-4 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                    {filteredQuotes.map((quote) => (
                        <tr key={quote.id} className="hover:bg-slate-700/30 transition-colors group">
                            <td className="p-4">
                                <div className="font-bold text-white font-mono">{quote.id}</div>
                                <div className="text-[10px] text-slate-500">{quote.date}</div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold uppercase">
                                        {quote.advisor.charAt(0)}
                                    </div>
                                    <span className="text-slate-300">{quote.advisor}</span>
                                </div>
                            </td>
                            <td className="p-4 text-slate-200 font-medium">{quote.client}</td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1">
                                    <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${quote.status === 'Completado' ? 'bg-emerald-500/20 text-emerald-400' :
                                        quote.status === 'En Proceso' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {quote.status}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <span>Paso {quote.step}/4</span>
                                        <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-cyan-500"
                                                style={{ width: `${(quote.step / 4) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-mono text-emerald-400 mt-1">
                                    ${(quote.data?.salePrice || quote.data?.totalPrice || 0).toLocaleString()} USD
                                </div>
                            </td>
                            <td className="p-4 text-slate-400 text-xs">
                                {quote.data?.serviceType || 'Vacacional'}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setSelectedQuote(quote)}
                                        className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg text-slate-400 transition-colors"
                                        title="Ver Historial"
                                    >
                                        <FileClock className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEditQuote(quote)}
                                        className="p-2 bg-slate-800 hover:bg-purple-600 hover:text-white rounded-lg text-slate-400 transition-colors"
                                        title="Edición Correctiva"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredQuotes.length === 0 && (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                                No se encontraron registros que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // Render principal
    return (
        <div className="flex h-full min-h-screen bg-[#0f172a] text-slate-200 font-sans -m-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR ADMIN (Izquierda) */}
            <aside className={`fixed md:sticky top-0 left-0 z-40 w-80 h-screen bg-[#0f172a]/95 backdrop-blur-3xl border-r border-slate-700/50 flex flex-col shadow-2xl p-8 transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="absolute top-4 right-4 md:hidden">
                    <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="py-6 border-b border-slate-700/50 flex flex-col items-center justify-center mb-4">
                    <div className="mb-4 relative group">
                        <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
                        <img src="/logo-destinos.png" alt="Destinos P&P" className="h-28 w-auto relative z-10 drop-shadow-2xl hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="text-center w-full">
                        <h2 className="font-black text-2xl tracking-tight uppercase text-white mb-1">Gerencia</h2>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 mx-auto mb-2 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
                        <p className="text-[10px] text-purple-300 font-bold tracking-[0.25em] uppercase">Executive Suite</p>
                    </div>
                </div>

                <nav className="flex-1 py-2 space-y-2 overflow-hidden flex flex-col">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-1">Inteligencia</p>
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-white border border-purple-500/40 shadow-lg shadow-purple-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-purple-400' : 'text-slate-500 group-hover:text-purple-400'}`} />
                        <span className="font-bold text-sm tracking-wide">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveTab('supervision')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'supervision' ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-white border border-cyan-500/40 shadow-lg shadow-cyan-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <Eye className={`w-5 h-5 ${activeTab === 'supervision' ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                        <span className="font-bold text-sm tracking-wide">Supervisión</span>
                    </button>

                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-1 mt-4">Configuración</p>
                    <button onClick={() => setActiveTab('params')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'params' ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 text-white border border-blue-500/40 shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <Settings className={`w-5 h-5 ${activeTab === 'params' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
                        <span className="font-medium text-sm tracking-wide">Parámetros</span>
                    </button>
                    <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'inventory' ? 'bg-gradient-to-r from-blue-900/60 to-indigo-900/60 text-white border border-blue-500/40 shadow-lg shadow-blue-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <Database className={`w-5 h-5 ${activeTab === 'inventory' ? 'text-blue-400' : 'text-slate-500 group-hover:text-blue-400'}`} />
                        <span className="font-medium text-sm tracking-wide">Inventarios</span>
                    </button>
                    <button onClick={() => setActiveTab('commissions')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'commissions' ? 'bg-gradient-to-r from-emerald-900/60 to-teal-900/60 text-white border border-emerald-500/40 shadow-lg shadow-emerald-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <DollarSign className={`w-5 h-5 ${activeTab === 'commissions' ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                        <span className="font-medium text-sm tracking-wide">Comisiones</span>
                    </button>

                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-1 mt-4">Auditoría</p>
                    <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'audit' ? 'bg-gradient-to-r from-amber-900/60 to-orange-900/60 text-white border border-amber-500/40 shadow-lg shadow-amber-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <History className={`w-5 h-5 ${activeTab === 'audit' ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                        <span className="font-medium text-sm tracking-wide">Logs Sistema</span>
                    </button>
                </nav>

                <div className="pt-4 border-t border-slate-700/50 space-y-4 bg-[#0f172a]/60 backdrop-blur-xl mt-auto">
                    <TeamMonitor embedded={true} fullWidth={true} />
                    <button
                        onClick={onExit}
                        className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-[10px] font-bold uppercase tracking-[0.15em] group border border-slate-800 hover:border-slate-600 shadow-lg"
                    >
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-red-400" /> Salir a Módulos
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-hidden relative z-10 p-4 md:p-8 flex flex-col h-screen">
                {/* Header Contextual */}
                <div className="flex justify-between items-center mb-6 shrink-0 gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden p-2 bg-slate-800 rounded-lg text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
                            {activeTab === 'dashboard' && 'Dashboard de Resultados'}
                            {activeTab === 'supervision' && 'Centro de Supervisión'}
                            {activeTab === 'params' && 'Reglas de Negocio'}
                            {activeTab === 'inventory' && 'Gestión de Inventarios'}
                            {activeTab === 'commissions' && 'Estructura de Comisiones'}
                            {activeTab === 'audit' && 'Auditoría del Sistema'}
                        </h1>
                        <p className="text-slate-400 text-sm">Vista Ejecutiva y Control de Operaciones</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-white font-bold">Paola Palacios</p>
                            <p className="text-xs text-purple-400 font-bold uppercase">Gerente General</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-purple-600 border border-purple-400 shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                            <img src="https://i.pravatar.cc/150?u=paola" alt="Admin" className="w-full h-full rounded-full opacity-90" />
                        </div>
                    </div>
                </div>

                {/* Filtros Globales */}
                <div className="shrink-0 mb-6">
                    <FilterBar />
                </div>

                {/* Contenido Dinámico - SCROLLABLE AREA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                    {activeTab === 'dashboard' && <DashboardView />}
                    {activeTab === 'supervision' && <SupervisionContent />}

                    {activeTab === 'params' && (
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Settings className="text-purple-400" /> Configuración de Tarifas
                                </h3>
                                <button onClick={requestSave} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2 shadow-lg shadow-purple-900/20">
                                    <Save className="w-4 h-4" /> Guardar Cambios
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="block text-slate-400 text-xs font-bold uppercase">Precio Mínimo Cotizable (COP)</label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-3 text-slate-500">$</span>
                                        <input
                                            type="number"
                                            value={localConfig.limits.minPrice}
                                            onChange={(e) => handleChange('limits', 'minPrice', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 group-hover:border-purple-500 rounded-xl pl-8 p-3 text-white font-mono transition-all outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-slate-400 text-xs font-bold uppercase">Margen Mínimo Obligatorio (%)</label>
                                    <div className="relative group">
                                        <span className="absolute left-3 top-3 text-slate-500">%</span>
                                        <input
                                            type="number"
                                            value={localConfig.limits.minMargin}
                                            onChange={(e) => handleChange('limits', 'minMargin', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-slate-700 group-hover:border-purple-500 rounded-xl pl-8 p-3 text-white font-mono transition-all outline-none focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'inventory' && (
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 animate-fade-in">
                            <div className="space-y-4">
                                {localConfig.inventory.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-700/50 rounded-xl hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{item.name}</p>
                                                <p className="text-slate-500 text-xs uppercase">{item.type}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newInv = [...localConfig.inventory];
                                                newInv[idx].active = !newInv[idx].active;
                                                setLocalConfig({ ...localConfig, inventory: newInv });
                                            }}
                                            className={`p-2 rounded-lg transition-colors ${item.active ? 'text-emerald-400 hover:bg-emerald-900/20' : 'text-slate-500 hover:bg-slate-800'}`}
                                        >
                                            {item.active ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'commissions' && (
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 animate-fade-in">
                            <div className="p-6 bg-emerald-900/10 border border-emerald-500/20 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                <div className="relative z-10 grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-2">Comisión Global (%)</label>
                                        <input
                                            type="number"
                                            value={localConfig.commissions.globalPercent}
                                            onChange={(e) => handleChange('commissions', 'globalPercent', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4 text-white font-mono text-2xl font-bold outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-emerald-400 uppercase font-bold block mb-2">Fee Administrativo (COP)</label>
                                        <input
                                            type="number"
                                            value={localConfig.commissions.adminFee}
                                            onChange={(e) => handleChange('commissions', 'adminFee', e.target.value)}
                                            className="w-full bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4 text-white font-mono text-2xl font-bold outline-none focus:border-emerald-500"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button onClick={requestSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase transition-colors shadow-lg shadow-emerald-900/20">
                                        Actualizar Reglas
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'audit' && (
                        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 animate-fade-in">
                            <div className="overflow-hidden rounded-xl border border-slate-700/50">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                                        <tr>
                                            <th className="p-4">Fecha</th>
                                            <th className="p-4">Usuario</th>
                                            <th className="p-4">Acción</th>
                                            <th className="p-4">Detalle</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50 bg-slate-800/30">
                                        {logs.map((log, i) => (
                                            <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="p-4 text-slate-500 font-mono text-xs">{log.date}</td>
                                                <td className="p-4 font-bold text-white">{log.user}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.type === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                                        }`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-300 text-xs">{log.detail}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={() => { window.location.href = '/intranet'; }}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 text-[10px] font-bold uppercase tracking-[0.18em] border border-slate-700 hover:border-slate-500 shadow-lg shadow-slate-900/40"
                        >
                            <LogOut className="w-4 h-4 text-red-400" />
                            Salir a Módulos
                        </button>
                    </div>
                </div>
            </main>

            {/* Modal de Confirmación Doble Factor */}
            {pendingChange && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#1e293b] border border-red-500/30 rounded-2xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mb-4 border border-red-500/50 animate-pulse">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase mb-2">¡Acción Crítica!</h3>
                            <p className="text-slate-400 text-sm">
                                Está a punto de modificar parámetros globales que afectarán a todas las cotizaciones en curso.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setPendingChange(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors">Cancelar</button>
                            <button onClick={confirmSave} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2">
                                <ShieldCheck className="w-4 h-4" /> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Timeline (Reutilizado) */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-[#1e293b] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl relative">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white">Historial: {selectedQuote.id}</h3>
                            <button onClick={() => setSelectedQuote(null)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {selectedQuote.history?.map((event, idx) => (
                                <div key={idx} className="mb-4 pb-4 border-b border-slate-700/50 last:border-0">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-slate-300">{event.action}</span>
                                        <span className="text-slate-500">{event.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-slate-400">{event.details}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper component for chevron
const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default AdminPanel;
