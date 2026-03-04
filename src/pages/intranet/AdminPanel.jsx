import React, { useState, useEffect } from 'react';
import {
    ShieldCheck, Settings, Users, AlertTriangle, Activity,
    Lock, Save, AlertCircle, CheckCircle, FileText,
    Database, DollarSign, ToggleLeft, ToggleRight, History,
    Eye, Edit3, FileClock, Filter, Search, X, ChevronRight,
    BarChart3, TrendingUp, Wallet, Clock, Calendar, MapPin,
    LogOut, LayoutDashboard, Menu, Building2, Plus, Trash2, Upload, UserPlus, RefreshCcw
} from 'lucide-react';
import TeamMonitor from './TeamMonitor';
import { CompaniesApi } from '../../services/companiesApi';
import { QuotesApi } from '../../services/quotesApi';
import { StorageApi } from '../../services/storageApi';
import { UsersApi } from '../../services/usersApi';
import { useAuth, RBAC_MATRIX } from '../../context/AuthContext';
import { compressImage, dataURLToBlob, IMAGE_RECOMMENDATIONS } from '../../utils/image';
import { getProcessStep, PROCESS_STEPS } from '../../utils/status';

const AdminPanel = ({ config, onUpdateConfig, logs, quotes = [], isLoading, onEditQuote, onExit }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [pendingChange, setPendingChange] = useState(null);
    const [localConfig, setLocalConfig] = useState(config);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [companyForm, setCompanyForm] = useState({ name: '', nit: '', address: '', phone: '', email: '', logo_url: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
    const [reassigningQuote, setReassigningQuote] = useState(null);
    const [newAdvisorEmail, setNewAdvisorEmail] = useState('');
    const [isReassigning, setIsReassigning] = useState(false);
    const [reassignError, setReassignError] = useState('');
    const [storageStats, setStorageStats] = useState({ totalBytes: 0, percentage: 0, limitGB: 1 });
    const [isCleaning, setIsCleaning] = useState(false);

    // Estados para Gestión de Usuarios
    const [users, setUsers] = useState([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userForm, setUserForm] = useState({
        email: '',
        full_name: '',
        role: 'advisor_corporate',
        professional_role: 'Asesora Comercial'
    });
    const [isSavingUser, setIsSavingUser] = useState(false);
    const [isSavingCompany, setIsSavingCompany] = useState(false);

    useEffect(() => {
        if (activeTab === 'companies') {
            loadCompanies();
        }
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

    const loadUsers = async () => {
        const data = await UsersApi.listUsers();
        setUsers(data);
    };

    const loadCompanies = async () => {
        const data = await CompaniesApi.listCompanies();
        setCompanies(data);
    };

    const loadStorageStats = async () => {
        const stats = await StorageApi.getStorageUsage();
        setStorageStats(stats);
    };

    useEffect(() => {
        loadStorageStats();
    }, []);

    // Estados de Filtrado y Paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [advisorFilter, setAdvisorFilter] = useState('all');
    const [dateRange, setDateRange] = useState('7d');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reiniciar paginación al filtrar
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, advisorFilter, dateRange]);

    // --- CÁLCULOS DINÁMICOS ---
    const filteredQuotes = quotes.filter(q => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = q.id.toLowerCase().includes(term) ||
            q.client.toLowerCase().includes(term) ||
            (q.data?.clientDoc || '').toLowerCase().includes(term) ||
            (q.data?.destination || '').toLowerCase().includes(term);
        const matchesAdvisor = advisorFilter === 'all' || q.advisor === advisorFilter;
        return matchesSearch && matchesAdvisor;
    });

    // Validar Paginación
    const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage) || 1;
    const paginatedQuotes = filteredQuotes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Los ingresos son todos los folios que han superado Cotización y Confirmación (Pasos >= 3)
    const confirmedQuotes = filteredQuotes.filter(q => getProcessStep(q) >= 3);
    const totalSalesUSD = confirmedQuotes.reduce((acc, q) => {
        const val = q.data?.salePrice || q.data?.totalPrice || q.data?.totalCharged || 0;
        return acc + parseFloat(val);
    }, 0);

    const conversionRate = quotes.length > 0 ? (confirmedQuotes.length / quotes.length) * 100 : 0;
    const avgTicket = confirmedQuotes.length > 0 ? totalSalesUSD / confirmedQuotes.length : 0;

    // --- SINCRONIZACIÓN DE USUARIOS (HARDCODED + DB) ---
    const staticUsers = Object.entries(RBAC_MATRIX).map(([email, info]) => ({
        email,
        full_name: info.name,
        role: info.role,
        professional_role: info.role_label,
        isStatic: true,
        modules: info.modules
    }));

    // Evitar duplicados si un usuario estático ya fue migrado a la DB
    const dbEmails = new Set(users.map(u => u.email));
    const allSystemUsers = [
        ...users,
        ...staticUsers.filter(su => !dbEmails.has(su.email))
    ];

    const uniqueAdvisors = [...new Set([
        ...quotes.map(q => q.advisor),
        ...allSystemUsers.filter(u => u.role === 'advisor_corporate' || u.role === 'manager').map(u => u.full_name)
    ])].filter(name => name !== 'N/A' && name !== 'Sistema');

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
        setPendingChange(null);
    };

    const handleReassign = async () => {
        if (!newAdvisorEmail || !reassigningQuote) return;
        setIsReassigning(true);
        setReassignError('');
        try {
            const result = await QuotesApi.reassignQuote(reassigningQuote.id, newAdvisorEmail);
            if (result.ok) {
                setIsReassignModalOpen(false);
                setNewAdvisorEmail('');
                setReassigningQuote(null);
                // Opcional: recargar datos o notificar éxito
                if (typeof window !== 'undefined' && window.location) window.location.reload();
            } else {
                setReassignError(result.error || 'Error al reasignar');
            }
        } catch (err) {
            setReassignError(err.message);
        } finally {
            setIsReassigning(false);
        }
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

            alert("Generando cierre de mes para " + currentMonth + "... (PDF en proceso)");
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        try {
            // Comprimir imagen y convertir a Blob para la subida
            const compressedDataUrl = await compressImage(file);
            const blob = dataURLToBlob(compressedDataUrl);

            // Recrear el archivo para mantener compatibilidad con la API (supabase espera File/Blob)
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });

            const res = await CompaniesApi.uploadLogo(compressedFile);
            if (res.ok) {
                setCompanyForm(prev => ({ ...prev, logo_url: res.url }));
            } else {
                alert('Error al subir logo: ' + res.error);
            }
        } catch (error) {

            alert("Error al procesar el logo. Intente con otra imagen.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveCompany = async () => {
        if (!companyForm.name || !companyForm.nit) {
            alert('Nombre y NIT son obligatorios');
            return;
        }

        setIsSavingCompany(true);
        try {
            let res;
            if (editingCompany) {
                res = await CompaniesApi.updateCompany(editingCompany.id, companyForm);
            } else {
                res = await CompaniesApi.createCompany(companyForm);
            }

            if (res.ok) {
                setIsCompanyModalOpen(false);
                setEditingCompany(null);
                setCompanyForm({ name: '', nit: '', address: '', phone: '', email: '', logo_url: '' });
                await loadCompanies();
            } else {
                alert('Error al guardar empresa: ' + res.error);
            }
        } catch (err) {
            console.error("Error saving company:", err);
            alert('Error inesperado al guardar empresa');
        } finally {
            setIsSavingCompany(false);
        }
    };

    const handleDeleteCompany = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
            const res = await CompaniesApi.deleteCompany(id);
            if (res.ok) loadCompanies();
            else alert('Error al eliminar: ' + res.error);
        }
    };

    const handleSaveUser = async () => {
        if (!userForm.email || !userForm.full_name) {
            alert('Email y nombre son obligatorios');
            return;
        }
        setIsSavingUser(true);
        let res;
        if (editingUser) {
            res = await UsersApi.updateUser(editingUser.email, userForm);
        } else {
            res = await UsersApi.createUser(userForm);
        }

        if (res.ok) {
            setIsUserModalOpen(false);
            setEditingUser(null);
            setUserForm({
                email: '',
                full_name: '',
                role: 'advisor_corporate',
                professional_role: 'Asesora Comercial'
            });
            loadUsers();
        } else {
            alert('Error al guardar usuario: ' + res.error);
        }
        setIsSavingUser(false);
    };

    const handleDeleteUser = async (email) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            const res = await UsersApi.deleteUser(email);
            if (res.ok) loadUsers();
            else alert('Error al eliminar: ' + res.error);
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
                        {[...uniqueAdvisors]
                            .map(advisor => {
                                const advQuotes = quotes.filter(q => q.advisor === advisor);
                                // Consideramos ventas a todos los folios en paso 3, 4 o 5 (PAGOS, FACTURACIÓN, VOUCHER)
                                const advConfirmed = advQuotes.filter(q => getProcessStep(q) >= 3);
                                const advSales = advConfirmed.reduce((acc, q) => {
                                    const val = q.data?.salePrice || q.data?.totalPrice || q.data?.totalCharged || 0;
                                    return acc + (parseFloat(val) || 0);
                                }, 0);
                                return { name: advisor, quotes: advQuotes.length, sales: advConfirmed.length, volume: advSales };
                            })
                            .sort((a, b) => b.volume - a.volume)
                            .slice(0, 5)
                            .map((adv, i) => (
                                <div key={adv.name} className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/30 border border-slate-700/30">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase ${i === 0 ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-slate-700'}`}>
                                        {i === 0 ? '🏆' : adv.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-bold">{adv.name}</p>
                                        <p className="text-slate-500 text-[10px]">{adv.quotes} Documentos Generados / {adv.sales} Ventas</p>
                                    </div>
                                    <span className="text-emerald-400 font-mono font-bold text-sm">${adv.volume.toLocaleString()}</span>
                                </div>
                            ))}
                        {uniqueAdvisors.length === 0 && (
                            <p className="text-slate-500 text-xs italic text-center py-4">Sin datos de asesores</p>
                        )}
                    </div>
                </div>

                {/* Folios Cancelados Log */}
                <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 mt-8">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" /> Folios Cancelados
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {quotes.filter(q => q.status === 'Cancelado').slice(0, 10).map((q) => (
                            <div key={q.id} className="p-3 rounded-xl bg-slate-900/30 border border-red-500/20 hover:border-red-500/40 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-red-400 font-bold font-mono text-xs">{q.id}</span>
                                    <span className="text-[10px] text-slate-500">{new Date(q.data?.updated_at || q.date).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-300 text-xs mb-1 font-medium">{q.client}</p>
                                <p className="text-slate-500 text-[10px]">Por: {q.advisor}</p>
                                {(q.history?.filter(h => h.action === 'CANCELADO' || h.type === 'cancellation')?.pop()?.details) ? (
                                    <p className="text-red-400/80 text-[10px] mt-2 italic bg-red-500/10 p-2 rounded-lg">
                                        Motivo: {q.history.filter(h => h.action === 'CANCELADO' || h.type === 'cancellation').pop().details}
                                    </p>
                                ) : (
                                    <p className="text-slate-600 text-[10px] mt-1 italic">Cancelado en flujo de venta</p>
                                )}
                            </div>
                        ))}
                        {quotes.filter(q => q.status === 'Cancelado').length === 0 && (
                            <p className="text-slate-500 text-xs italic text-center py-4">Log de bajas vacío</p>
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
                    {paginatedQuotes.map((quote) => (
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
                                    <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getProcessStep(quote) === 5 ? 'bg-emerald-500/20 text-emerald-400' :
                                        getProcessStep(quote) >= 2 ? 'bg-blue-500/20 text-blue-400' :
                                            getProcessStep(quote) === 0 ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                        }`}>
                                        {getProcessStep(quote) === 5 ? 'Completado' :
                                            getProcessStep(quote) === 0 ? 'Cancelado' : 'En Proceso'}
                                    </span>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                        <span>Paso {getProcessStep(quote)}/5</span>
                                        <div className="w-12 h-1 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${getProcessStep(quote) === 5 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                                                style={{ width: `${(getProcessStep(quote) / 5) * 100}%` }}
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
                                        onClick={() => {
                                            setReassigningQuote(quote);
                                            setIsReassignModalOpen(true);
                                        }}
                                        className="p-2 bg-slate-800 hover:bg-amber-600 hover:text-white rounded-lg text-slate-400 transition-colors"
                                        title="Re-asignar Propiedad"
                                    >
                                        <UserPlus className="w-4 h-4" />
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
                    {paginatedQuotes.length === 0 && (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-500 italic">
                                No se encontraron registros que coincidan con los filtros.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <p className="text-xs text-slate-500">
                        Mostrando <span className="text-white font-bold">{paginatedQuotes.length}</span> de <span className="text-white font-bold">{filteredQuotes.length}</span> registros
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            className="p-1 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
                        >
                            Anterior
                        </button>
                        <span className="text-xs text-slate-400 font-medium px-2">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            className="p-1 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg text-xs font-bold transition-all border border-slate-700"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const ReassignModal = () => {
        if (!isReassignModalOpen) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
                    <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                        <UserPlus className="w-8 h-8 text-amber-400" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Re-asignar Propiedad</h2>
                        <p className="text-slate-400 text-xs">Transfiere la cotización <span className="text-amber-400 font-mono font-bold">{reassigningQuote?.id}</span> a otro asesor.</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Seleccionar Nuevo Asesor Responsable</label>
                            <select
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-amber-500 transition-all font-medium appearance-none"
                                value={newAdvisorEmail}
                                onChange={e => setNewAdvisorEmail(e.target.value)}
                            >
                                <option value="">Seleccione un asesor...</option>
                                {allSystemUsers
                                    .filter(u => u.role === 'advisor_corporate' || u.role === 'manager')
                                    .map(u => (
                                        <option key={u.email} value={u.email}>
                                            {u.full_name} ({u.email})
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        {reassignError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold text-center">
                                {reassignError}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                setIsReassignModalOpen(false);
                                setReassignError('');
                                setNewAdvisorEmail('');
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleReassign}
                            disabled={isReassigning || !newAdvisorEmail}
                            className={`flex-1 px-4 py-3 rounded-xl font-bold uppercase text-xs transition-all flex items-center justify-center gap-2 ${isReassigning || !newAdvisorEmail ? 'bg-slate-800 text-slate-600' : 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-500/20'}`}
                        >
                            {isReassigning ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

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

                <nav className="flex-1 py-2 space-y-2 overflow-y-auto custom-scrollbar flex flex-col pr-2">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-1">Inteligencia</p>
                    <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-white border border-purple-500/40 shadow-lg shadow-purple-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <LayoutDashboard className={`w-5 h-5 ${activeTab === 'dashboard' ? 'text-purple-400' : 'text-slate-500 group-hover:text-purple-400'}`} />
                        <span className="font-bold text-sm tracking-wide">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveTab('supervision')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'supervision' ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 text-white border border-cyan-500/40 shadow-lg shadow-cyan-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <Eye className={`w-5 h-5 ${activeTab === 'supervision' ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                        <span className="font-bold text-sm tracking-wide">Supervisión</span>
                    </button>
                    <button onClick={() => setActiveTab('reassign')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'reassign' ? 'bg-gradient-to-r from-amber-900/60 to-orange-900/60 text-white border border-amber-500/40 shadow-lg shadow-amber-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <UserPlus className={`w-5 h-5 ${activeTab === 'reassign' ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                        <span className="font-bold text-sm tracking-wide">Re-asignación</span>
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
                    <button onClick={() => setActiveTab('companies')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'companies' ? 'bg-gradient-to-r from-orange-900/60 to-amber-900/60 text-white border border-orange-500/40 shadow-lg shadow-orange-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <Building2 className={`w-5 h-5 ${activeTab === 'companies' ? 'text-orange-400' : 'text-slate-500 group-hover:text-orange-400'}`} />
                        <span className="font-medium text-sm tracking-wide">Gestión de Empresas</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'users' ? 'bg-gradient-to-r from-teal-900/60 to-emerald-900/60 text-white border border-teal-500/40 shadow-lg shadow-teal-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <Users className={`w-5 h-5 ${activeTab === 'users' ? 'text-teal-400' : 'text-slate-500 group-hover:text-teal-400'}`} />
                        <span className="font-medium text-sm tracking-wide">Gestión de Usuarios</span>
                    </button>

                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-1 mt-4">Auditoría</p>
                    <button onClick={() => setActiveTab('audit')} className={`w-full flex items-center gap-4 px-5 py-2.5 rounded-xl transition-all group ${activeTab === 'audit' ? 'bg-gradient-to-r from-amber-900/60 to-orange-900/60 text-white border border-amber-500/40 shadow-lg shadow-amber-900/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white border border-transparent'}`}>
                        <History className={`w-5 h-5 ${activeTab === 'audit' ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                        <span className="font-medium text-sm tracking-wide">Logs Sistema</span>
                    </button>
                </nav>

                <div className="pt-4 border-t border-slate-700/50 space-y-4 shrink-0 bg-[#0f172a]/60 backdrop-blur-xl mt-4">
                    {/* Indicador de Almacenamiento */}
                    <div className="px-2 py-3 bg-slate-900/60 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Almacenamiento Supabase</span>
                            <span className="text-[10px] text-blue-400 font-bold">{storageStats.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
                            <div
                                className={`h-full transition-all duration-1000 ${storageStats.percentage > 90 ? 'bg-red-500' : storageStats.percentage > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, storageStats.percentage)}%` }}
                            ></div>
                        </div>
                        <p className="text-[8px] text-slate-600 mt-1 uppercase font-bold">Usado: {(storageStats.totalBytes / (1024 * 1024)).toFixed(1)} MB / {storageStats.limitGB} GB</p>
                    </div>

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
                            {activeTab === 'reassign' && 'Re-asignación de Cotizaciones'}
                            {activeTab === 'params' && 'Reglas de Negocio'}
                            {activeTab === 'inventory' && 'Gestión de Inventarios'}
                            {activeTab === 'commissions' && 'Estructura de Comisiones'}
                            {activeTab === 'companies' && 'Gestión de Empresas Corporativas'}
                            {activeTab === 'users' && 'Gestión de Usuarios Multi-Módulo'}
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
                    {activeTab === 'users' && (
                        <UsersManagementView
                            users={allSystemUsers}
                            isUserModalOpen={isUserModalOpen}
                            setIsUserModalOpen={setIsUserModalOpen}
                            editingUser={editingUser}
                            setEditingUser={setEditingUser}
                            userForm={userForm}
                            setUserForm={setUserForm}
                            isSavingUser={isSavingUser}
                            handleSaveUser={handleSaveUser}
                            handleDeleteUser={handleDeleteUser}
                        />
                    )}

                    {activeTab === 'reassign' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
                                <UserPlus className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-amber-300 font-bold text-sm">Módulo de Re-asignación de Propiedad</p>
                                    <p className="text-slate-400 text-xs mt-1">Transfiere la propiedad de una cotización de un asesor a otro. Esta acción queda registrada en el historial de la cotización para trazabilidad completa.</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-md">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
                                        <tr>
                                            <th className="p-4">Folio / Fecha</th>
                                            <th className="p-4">Asesor Actual</th>
                                            <th className="p-4">Cliente</th>
                                            <th className="p-4">Estado</th>
                                            <th className="p-4 text-right">Re-asignar</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {filteredQuotes.map((quote) => (
                                            <tr key={quote.id} className="hover:bg-slate-700/20 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-white font-mono text-xs">{quote.id}</div>
                                                    <div className="text-[10px] text-slate-500">{quote.date}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold uppercase">{quote.advisor.charAt(0)}</div>
                                                        <div>
                                                            <p className="text-slate-200 text-xs font-bold">{quote.advisor}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-300 text-xs font-medium">{quote.client}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${quote.status === 'Completado' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                        }`}>{quote.status}</span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => { setReassigningQuote(quote); setIsReassignModalOpen(true); }}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-white transition-all"
                                                    >
                                                        <UserPlus className="w-3.5 h-3.5" /> Re-asignar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredQuotes.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-slate-500 italic text-xs">
                                                    No hay cotizaciones disponibles para re-asignar.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

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

                            {/* Nueva Sección de Mantenimiento de Storage */}
                            <div className="mt-8 pt-8 border-t border-slate-700/50">
                                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Database className="text-blue-400 w-4 h-4" /> Mantenimiento de Almacenamiento
                                </h4>
                                <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex-1">
                                        <p className="text-slate-200 text-sm font-bold mb-1">Limpieza de Archivos Temporales</p>
                                        <p className="text-slate-500 text-xs">Se eliminarán permanentemente los PDFs y fotos de cotizaciones con más de 45 días de antigüedad para liberar espacio en el storage.</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('¿Confirmas que deseas limpiar los archivos antiguos (>45 días)? Esta acción no afectará los datos de texto de las cotizaciones.')) {
                                                setIsCleaning(true);
                                                const res = await StorageApi.cleanupOldFiles(45);
                                                if (res.ok) {
                                                    alert(`Limpieza completada. Se eliminaron ${res.deletedCount} archivos.`);
                                                    loadStorageStats();
                                                } else {
                                                    alert('Error en la limpieza: ' + res.error);
                                                }
                                                setIsCleaning(false);
                                            }
                                        }}
                                        disabled={isCleaning}
                                        className={`px-6 py-3 rounded-xl font-bold text-xs uppercase transition-all flex items-center gap-2 ${isCleaning ? 'bg-slate-800 text-slate-600' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40'}`}
                                    >
                                        {isCleaning ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        {isCleaning ? 'Limpiando...' : 'Limpiar Storage (>45 días)'}
                                    </button>
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

                    {activeTab === 'companies' && (
                        <CompaniesManagementView
                            companies={companies}
                            isCompanyModalOpen={isCompanyModalOpen}
                            setIsCompanyModalOpen={setIsCompanyModalOpen}
                            editingCompany={editingCompany}
                            setEditingCompany={setEditingCompany}
                            companyForm={companyForm}
                            setCompanyForm={setCompanyForm}
                            isUploading={isUploading}
                            handleLogoUpload={handleLogoUpload}
                            handleSaveCompany={handleSaveCompany}
                            handleDeleteCompany={handleDeleteCompany}
                            isSavingCompany={isSavingCompany}
                        />
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

            <ReassignModal />
        </div>
    );
};
const CompaniesManagementView = ({
    companies,
    isCompanyModalOpen,
    setIsCompanyModalOpen,
    editingCompany,
    setEditingCompany,
    companyForm,
    setCompanyForm,
    isUploading,
    handleLogoUpload,
    handleSaveCompany,
    handleDeleteCompany,
    isSavingCompany
}) => (
    <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex justify-between items-center text-white pb-2 border-b border-slate-700/30">
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="text-orange-400" /> Lista de Empresas
            </h3>
            <button
                onClick={() => {
                    setEditingCompany(null);
                    setCompanyForm({ name: '', nit: '', address: '', phone: '', email: '', logo_url: '' });
                    setIsCompanyModalOpen(true);
                }}
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Agregar Empresa
            </button>
        </div>

        <div className="grid gap-4">
            {companies.map((company) => (
                <div key={company.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-wrap md:flex-nowrap items-center gap-6 group hover:border-orange-500/30">
                    <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden shrink-0">
                        {company.logo_url ? (
                            <img src={company.logo_url} alt={company.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                            <Building2 className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <h4 className="text-white font-bold text-lg mb-1">{company.name}</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            <p className="text-slate-400 text-xs">NIT: <span className="text-slate-200">{company.nit}</span></p>
                            <p className="text-slate-400 text-xs text-nowrap">Tel: <span className="text-slate-200">{company.phone || 'N/A'}</span></p>
                            <p className="text-slate-400 text-xs col-span-2">Email: <span className="text-slate-200 font-mono">{company.email || 'N/A'}</span></p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setEditingCompany(company);
                                setCompanyForm(company);
                                setIsCompanyModalOpen(true);
                            }}
                            className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-orange-400 hover:border-orange-500/50 transition-all"
                        >
                            <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteCompany(company.id)}
                            className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-400 hover:text-red-400 hover:border-red-500/50 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
            {companies.length === 0 && (
                <div className="text-center py-12 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700 text-slate-500 w-full font-bold">
                    No hay empresas registradas. Comienza agregando una nueva.
                </div>
            )}
        </div>

        {/* Modal Formulario */}
        {isCompanyModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-fade-in overflow-y-auto">
                <div className="bg-[#1e293b] border border-slate-700 rounded-3xl max-w-2xl w-full p-8 shadow-2xl relative my-10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                            {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                        </h3>
                        <button onClick={() => setIsCompanyModalOpen(false)} className="text-slate-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Nombre</label>
                                <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-orange-500" value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">NIT</label>
                                <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-orange-500" value={companyForm.nit} onChange={e => setCompanyForm({ ...companyForm, nit: e.target.value })} />
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pl-1">Logo</label>
                                <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl border border-slate-700">
                                    <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-1 shrink-0">
                                        {companyForm.logo_url ? <img src={companyForm.logo_url} className="max-w-full max-h-full" alt="Preview" /> : <Upload className="text-slate-400" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <input type="file" onChange={handleLogoUpload} className="text-xs text-slate-400" />
                                        <p className="text-[10px] text-slate-500 italic mt-1">{IMAGE_RECOMMENDATIONS.logo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsCompanyModalOpen(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 font-bold">Cancelar</button>
                            <button
                                onClick={handleSaveCompany}
                                disabled={isSavingCompany}
                                className="flex-1 py-3 rounded-xl bg-orange-600 text-white font-bold flex items-center justify-center gap-2 hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSavingCompany || isUploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                                {isSavingCompany ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);

const UsersManagementView = ({
    users,
    isUserModalOpen,
    setIsUserModalOpen,
    editingUser,
    setEditingUser,
    userForm,
    setUserForm,
    isSavingUser,
    handleSaveUser,
    handleDeleteUser
}) => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                    <Users className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Gestión de Usuarios</h3>
                    <p className="text-slate-500 text-xs">Administra los accesos y roles de tu equipo</p>
                </div>
            </div>
            <button
                onClick={() => {
                    setEditingUser(null);
                    setUserForm({
                        email: '',
                        full_name: '',
                        role: 'advisor_corporate',
                        professional_role: 'Asesora Comercial'
                    });
                    setIsUserModalOpen(true);
                }}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold uppercase text-xs transition-all flex items-center gap-2 shadow-lg shadow-teal-900/40"
            >
                <UserPlus className="w-4 h-4" /> Nuevo Usuario
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
                <div key={user.email} className={`bg-slate-800/40 backdrop-blur-md border ${user.isStatic ? 'border-blue-500/20' : 'border-slate-700/50'} rounded-2xl p-6 hover:border-teal-500/30 transition-all group flex flex-col justify-between relative overflow-hidden`}>
                    {user.isStatic && (
                        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rotate-45 flex items-end justify-center pb-2">
                            <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">Estático</span>
                        </div>
                    )}
                    <div className="flex items-start gap-4 mb-4">
                        <div className={`w-12 h-12 rounded-full bg-slate-900 border ${user.isStatic ? 'border-blue-500/30' : 'border-slate-700'} flex items-center justify-center text-lg font-bold text-teal-400 overflow-hidden shrink-0`}>
                            {user.photo_url ? (
                                <img src={user.photo_url} alt={user.full_name} className="w-full h-full object-cover" />
                            ) : (
                                user.full_name.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm truncate">{user.full_name}</h4>
                            <p className="text-slate-500 text-[10px] font-mono truncate">{user.email}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter ${user.role === 'manager' ? 'bg-purple-500/20 text-purple-400' :
                                    user.role === 'accounting' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {user.role}
                                </span>
                                <span className="px-2 py-0.5 bg-slate-700/50 rounded text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {user.professional_role}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-slate-700/30 mt-auto">
                        <button
                            disabled={user.isStatic}
                            onClick={() => {
                                setEditingUser(user);
                                setUserForm(user);
                                setIsUserModalOpen(true);
                            }}
                            className={`flex-1 py-2 bg-slate-900 border ${user.isStatic ? 'border-slate-800 text-slate-600' : 'border-slate-700 text-slate-400 hover:text-teal-400 hover:border-teal-500/50'} rounded-lg text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2`}
                        >
                            <Edit3 className="w-3 h-3" /> Editar
                        </button>
                        <button
                            disabled={user.isStatic}
                            onClick={() => handleDeleteUser(user.email)}
                            className={`p-2 bg-slate-900 border ${user.isStatic ? 'border-slate-800 text-slate-700' : 'border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50'} rounded-lg transition-all`}
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                    {user.isStatic && (
                        <p className="text-[7px] text-slate-600 italic mt-2 text-center w-full">Usuario de sistema protegido</p>
                    )}
                </div>
            ))}
            {users.length === 0 && (
                <div className="col-span-full py-16 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-20" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No hay usuarios registrados en la base de datos dinámica</p>
                    <p className="text-slate-600 text-[10px] mt-1 italic">Los usuarios hardcoded no aparecen en esta lista</p>
                </div>
            )}
        </div>

        {/* User Modal */}
        {isUserModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 animate-fade-in overflow-y-auto">
                <div className="bg-[#0f172a] border border-slate-700/50 rounded-[2.5rem] max-w-lg w-full p-10 shadow-3xl relative">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                                {editingUser ? 'Actualizar Usuario' : 'Crear Perfil de Usuario'}
                            </h3>
                            <p className="text-slate-500 text-xs mt-1">Define el rol y acceso administrativo</p>
                        </div>
                        <button onClick={() => setIsUserModalOpen(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-all">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Corporativo</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-teal-400 transition-colors" />
                                    <input
                                        type="email"
                                        disabled={!!editingUser}
                                        value={userForm.email}
                                        placeholder="usuario@destinospp.com"
                                        onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                                        className={`w-full bg-slate-900/50 border ${editingUser ? 'border-slate-800 text-slate-500' : 'border-slate-700 focus:border-teal-500'} rounded-2xl pl-12 pr-4 py-4 text-white outline-none transition-all font-medium`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    value={userForm.full_name}
                                    placeholder="Nombre del funcionario"
                                    onChange={e => setUserForm({ ...userForm, full_name: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-teal-500 outline-none transition-all font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Rol de Acceso</label>
                                    <select
                                        value={userForm.role}
                                        onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-4 text-white focus:border-teal-500 outline-none transition-all font-bold text-xs appearance-none"
                                    >
                                        <option value="advisor_corporate">Asesor Corporativo/Ventas</option>
                                        <option value="manager">Gerente / Administrador</option>
                                        <option value="accounting">Contabilidad</option>
                                        <option value="operations_vac">Operaciones Vacacional</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Cargo Profesional</label>
                                    <input
                                        type="text"
                                        value={userForm.professional_role}
                                        placeholder="Ej: Asesora Senior"
                                        onChange={e => setUserForm({ ...userForm, professional_role: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white focus:border-teal-500 outline-none transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {!editingUser && (
                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                                <p className="text-[10px] text-amber-200/70 font-medium italic">
                                    Nota: El usuario debe registrarse manualmente en el sistema con este email para activar su contraseña. Este panel solo define sus permisos.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => setIsUserModalOpen(false)}
                                className="flex-1 px-6 py-4 rounded-2xl bg-slate-800 text-slate-400 font-bold uppercase text-xs hover:bg-slate-700 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveUser}
                                disabled={isSavingUser || !userForm.email || !userForm.full_name}
                                className={`flex-[1.5] px-6 py-4 rounded-2xl font-black uppercase text-xs transition-all flex items-center justify-center gap-2 ${isSavingUser || !userForm.email || !userForm.full_name ? 'bg-slate-800 text-slate-600' : 'bg-teal-600 text-white hover:bg-teal-500 shadow-xl shadow-teal-900/40'}`}
                            >
                                {isSavingUser ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
);


// Helper component for chevron
const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export default AdminPanel;
