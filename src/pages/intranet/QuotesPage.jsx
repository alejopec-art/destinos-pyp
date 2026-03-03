import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from './AdminPanel';
import HelpSection from '../../components/intranet/HelpSection';
import TeamMonitor from './TeamMonitor';
import { useAuth } from '../../context/AuthContext';
import {
    Plane, Settings, ArrowLeft, Plus, CheckCircle, CreditCard,
    ClipboardList, Briefcase, Book, Search, Upload, AlertCircle, ChevronDown, ChevronRight,
    Globe, Map, Ship, Car, HeartPulse, UserPlus, Users2, FileSpreadsheet, Receipt,
    ShieldCheck, Users, User, DollarSign, FileCheck, FileText, LayoutDashboard,
    Calendar, Anchor, MapPin, Utensils, Wine, Music, AlertTriangle, Check,
    Trash2, Save, FileDown, Lock, Menu, X, Camera, Key, PieChart, RefreshCcw, Baby,
    Image as ImageIcon, CalendarHeart, Hotel, HeartHandshake, Zap, Award, Trophy
} from 'lucide-react';
import { ERP } from '../../services/mockERP';
import { Folios, getSubKeyFromTab } from '../../services/foliosApi';
import { QuotesApi } from '../../services/quotesApi';
import { CompaniesApi } from '../../services/companiesApi';
import { generateConfirmationPdf, generateQuotePdf, generateVoucherPdf, generateMonthlyReportPdf, generateEventPdf, generateAccommodationPdf, generateVacacionesMedidaPdf } from '../../utils/pdf';
import { compressImage, processImageUpload, IMAGE_RECOMMENDATIONS } from '../../utils/image';
import { getProcessStep, PROCESS_STEPS } from '../../utils/status';

// Expose Monthly Report Generator
if (typeof window !== 'undefined') {
    window.generateMonthlyReportPdf = generateMonthlyReportPdf;
    window.QuotesApi = QuotesApi; // Para pruebas de estrés
    window.Folios = Folios; // Para pruebas de estrés
}
const DEFAULT_CONDITIONS = `FORMA DE PAGO:
• Pago en pesos colombianos a la TRM del día (Planes Internacionales)
• Transferencia Bancaria
• Código QR
• Pagos PSE – Pago con tarjeta de crédito incremento del 3% por manejo bancario.

RESTRICCIONES PROGRAMA:
• Una vez realizado el pago, en caso de anulación de viaje, se generan gastos de cancelación del 100%.
• SERVICIOS NO TOMADOS NO SON REEMBOLSABLES.

DOCUMENTOS DE VIAJE PARA COLOMBIANOS:
• Cédula de ciudadanía en original.`;

const DEFAULT_CLOSING_NOTE = `La presente propuesta tiene carácter informativo y no constituye confirmación de servicios. Las tarifas, condiciones y disponibilidad están sujetas a variación sin previo aviso por parte de los operadores y proveedores. La reserva se considerará formalmente garantizada únicamente cuando se emita la confirmación escrita y se reciba el pago correspondiente.

En Destinos P&P brindamos acompañamiento integral y gestión en cada proceso, asegurando seguimiento oportuno, transparencia en la información y respaldo permanente antes, durante y después de su viaje.`;

// La utilidad de compresión ahora se importa desde src/utils/image.js
const DEFAULT_IMAGES = {
    HOTEL: '/images/defaults/hospedaje_lujo.png',
    FLIGHT: '/images/defaults/experiencia_vuelo.png',
    CRUISE: '/images/defaults/experiencia_mar.png',
    DESTINATION: '/images/defaults/destino_inspiracional.png',
    EVENT: '/images/defaults/montaje_eventos.png',
    AVATAR: '/images/defaults/avatar_funcionario.png'
};

const QuotesPage = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [activeMainTab, setActiveMainTab] = useState('cotizaciones');
    const [activeSubTab, setActiveSubTab] = useState(null);
    const [userRole, setUserRole] = useState('advisor');
    const [isEditing, setIsEditing] = useState(false); // Para permitir edición correctiva a admins
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [corporateCompanies, setCorporateCompanies] = useState([]);

    // New Structural Changes: Branding & Advisor Identity
    const isCorporativo = activeSubTab === 'corporativo' || activeSubTab === 'tiquetes';
    const activeCorporateBrand = isCorporativo ? { name: 'Syscom/Sonreír', logo: '/syscom-logo.png', key: 'syscom' } : null;
    const advisorName = user?.full_name || user?.name || 'Asesor';
    const advisorRole = user?.professional_role || 'Asesora Comercial';

    useEffect(() => {
        if (!user) {
            setUserRole('advisor');
            return;
        }
        if (typeof window !== 'undefined') {
            window.auth = { user }; // Para pruebas de estrés
        }
        if (user.role === 'manager') {
            setUserRole('admin');
            return;
        }
        setUserRole('advisor');
    }, [user]);

    useEffect(() => {
        const fetchCompanies = async () => {
            const data = await CompaniesApi.listCompanies();
            setCorporateCompanies(data);
        };
        fetchCompanies();
    }, []);

    const [adminConfig, setAdminConfig] = useState({
        limits: { minPrice: 1000000, minMargin: 10 },
        inventory: [
            { name: 'Hotel Decameron', type: 'Hotel', active: true },
            { name: 'Tour Xcaret', type: 'Actividad', active: true },
            { name: 'Vuelos Charter', type: 'Aéreo', active: false },
            { name: 'Assist Card', type: 'Seguros', active: true }
        ],
        commissions: { globalPercent: 12, adminFee: 50000 }
    });

    // Mock Quotes Data para Supervisión (Ahora transicionado a datos reales)
    const [realQuotes, setRealQuotes] = useState([]);
    const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);

    useEffect(() => {
        const loadAdminData = async () => {
            if (activeMainTab === 'admin' || userRole === 'admin') {
                setIsLoadingAdminData(true);
                try {
                    // Cargar todos los folios sin límite de 50 para métricas globales exactas
                    const quotesResponse = await QuotesApi.listQuotes('', 9999, 0, null);
                    // Normalizar para que el Admin Panel entienda el formato
                    const normalized = (quotesResponse.data || []).map(q => {
                        const currentStep = getProcessStep(q);
                        const statusLabel = currentStep === 5 ? 'Completado' : (currentStep === 0 ? 'Cancelado' : 'En Proceso');

                        return {
                            id: q.folio,
                            date: new Date(q.created_at).toISOString().split('T')[0],
                            advisor: q.data?.advisorName || 'N/A',
                            client: q.data?.clientName || 'Sin Cliente',
                            status: statusLabel,
                            step: currentStep,
                            missing: q.data?.missingItems || [],
                            history: q.data?.history || [
                                { type: 'creation', action: 'CREACIÓN', timestamp: new Date(q.created_at).toLocaleString(), user: 'Sistema', details: 'Documento registrado en base de datos' }
                            ],
                            data: q.data
                        };
                    });
                    setRealQuotes(normalized);
                } catch (err) {

                } finally {
                    setIsLoadingAdminData(false);
                }
            }
        };
        loadAdminData();
    }, [activeMainTab, userRole]);

    const handleCorrectiveEdit = (quote) => {
        // Permitir a admins editar una cotización específica

        const data = quote.data || {};
        // Sincronizar estados de edición
        if (data.serviceType) setActiveSubTab(data.serviceType);
        setActiveMainTab('cotizaciones');
        setIsEditing(true);
        // Aquí se dispararía la lógica de carga de datos en el formulario
        // pero por ahora habilitamos la vista.
    };

    const [auditLogs, setAuditLogs] = useState([
        { date: '2026-02-10', user: 'Gerencia', action: 'UPDATE', detail: 'Ajuste de margen mínimo a 10%' },
        { date: '2026-02-09', user: 'Gerencia', action: 'CRITICAL', detail: 'Desactivación proveedor Charter' }
    ]);

    const handleAdminUpdate = (newConfig) => {
        setAdminConfig(newConfig);
        setAuditLogs(prev => [{
            date: new Date().toISOString().split('T')[0],
            user: 'Gerencia',
            action: 'UPDATE',
            detail: 'Actualización de parámetros globales desde Panel Maestro'
        }, ...prev]);
    };

    const handleVCHQuote = async () => {
        let ref = previewFolio;
        if (!ref) {
            ref = await Folios.getNext(activeSubTab === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || serviceType || 'nacional'));
            setPreviewFolio(ref);
        }
        const url = `https://vch.travel/?ref=${encodeURIComponent(ref)}`;
        window.open(url, '_blank', 'noopener');
        setAuditLogs(prev => [{
            date: new Date().toISOString(),
            user: advisorName,
            action: 'VCH',
            detail: `Inició cotización externa en VCH para ${ref}`
        }, ...prev]);
        // Consola inalterable
        try { } catch { }
    };
    const StatusProgressBar = ({ step }) => {
        if (step === 0) return (
            <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">🔴 Cancelado</span>
            </div>
        );

        return (
            <div className="flex items-center gap-1.5 min-w-[140px] justify-center">
                {PROCESS_STEPS.map((s, i) => {
                    const active = i + 1 <= step;
                    const isStep3 = i + 1 === 3;
                    const isStep5 = i + 1 === 5;

                    let dotClass = "bg-slate-900 border-slate-700 text-slate-500";
                    if (active) {
                        if (isStep5) dotClass = "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-900/40";
                        else if (isStep3) dotClass = "bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-900/40";
                        else dotClass = "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/40";
                    }

                    return (
                        <div key={s.id} className="flex flex-col items-center gap-1 group relative">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black transition-all border-2 ${dotClass}`}>
                                {active ? (isStep5 ? '🟢' : (isStep3 ? '🟡' : i + 1)) : i + 1}
                            </div>
                            <span className={`text-[7px] font-bold uppercase tracking-tighter transition-colors ${active ? (isStep5 ? 'text-emerald-400' : (isStep3 ? 'text-amber-400' : 'text-blue-400')) : 'text-slate-600'}`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };


    const HistoryView = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const [debouncedTerm, setDebouncedTerm] = useState('');
        const [items, setItems] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [reportPeriod, setReportPeriod] = useState('month'); // daily, weekly, month, year, all
        const [showGlobal, setShowGlobal] = useState(user?.role === 'admin' || user?.role === 'manager');
        const [viewMode, setViewMode] = useState('standard'); // standard, metrics
        const [filterType, setFilterType] = useState('all');
        const [filterStep, setFilterStep] = useState('all');
        const [filterAdvisor, setFilterAdvisor] = useState('all');
        const [currentPage, setCurrentPage] = useState(1);
        const [totalItems, setTotalItems] = useState(0);
        const ITEMS_PER_PAGE = 10;

        const getFilteredByScope = (data) => {
            if (showGlobal) return data;
            return data.filter(row => row.created_by === (user?.id || user?.uid));
        };

        const getFilteredByPeriod = (data) => {
            const now = new Date();
            let filtered = getFilteredByScope(data);

            // Filtrado por Periodo
            filtered = filtered.filter(row => {
                const d = new Date(row.created_at);
                if (reportPeriod === 'daily') return d.toDateString() === now.toDateString();
                if (reportPeriod === 'weekly') {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(now.getDate() - 7);
                    return d >= oneWeekAgo;
                }
                if (reportPeriod === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                if (reportPeriod === 'year') return d.getFullYear() === now.getFullYear();
                return true;
            });

            // Filtrado por Tipo
            if (filterType !== 'all') {
                filtered = filtered.filter(row => (row.data?.quoteType || row.data?.serviceType) === filterType);
            }

            // Filtrado por Paso
            if (filterStep !== 'all') {
                filtered = filtered.filter(row => getProcessStep(row) === parseInt(filterStep));
            }

            // Filtrado por Asesora
            if (filterAdvisor !== 'all') {
                filtered = filtered.filter(row => row.created_by === filterAdvisor);
            }

            return filtered;
        };


        const load = async (term = searchTerm, page = currentPage) => {
            setLoading(true);
            setError('');
            try {
                // Para métricas o exportación cargamos un set más grande temporalmente si es necesario,
                // Pero para la vista estándar usamos paginación.
                const isAggregatedView = viewMode === 'metrics' || reportPeriod !== 'all';

                // Si estamos en modo métricas o tenemos filtros de periodo, cargamos más datos (ej: 1000)
                // para que el filtrado cliente-side funcione decentemente sin complicar el backend hoy.
                // Pero la PAGINACIÓN visual siempre mostrará de a 10.
                const limit = isAggregatedView ? 1000 : ITEMS_PER_PAGE;
                const offset = isAggregatedView ? 0 : (page - 1) * ITEMS_PER_PAGE;
                const filterUserId = showGlobal ? null : (user?.id || user?.uid);

                const { data, count } = await QuotesApi.listQuotes(term, limit, offset, filterUserId);
                setItems(Array.isArray(data) ? data : []);
                setTotalItems(count || 0);
            } catch (err) {

                setError('No se pudieron cargar las cotizaciones.');
            } finally {
                setLoading(false);
            }
        };

        // Debounce para búsqueda reactiva
        useEffect(() => {
            const timer = setTimeout(() => {
                setDebouncedTerm(searchTerm);
                setCurrentPage(1); // Reset a pág 1 al buscar
            }, 400);
            return () => clearTimeout(timer);
        }, [searchTerm]);

        useEffect(() => {
            load(debouncedTerm, currentPage);
        }, [debouncedTerm, currentPage, reportPeriod, viewMode]);

        const displayCount = totalItems;


        const handleDownload = (row) => {
            const data = row.data || {};
            const isConfirmation = !!data.serviceConfirmed;

            const hotels = data.hotels || [];
            const extras = data.extras || {};

            let mergedIncludes = data.includes || [];
            if (!Array.isArray(mergedIncludes) || mergedIncludes.length === 0) {
                mergedIncludes = Array.isArray(hotels) && hotels.length
                    ? hotels.flatMap(h => h.includes || [])
                    : extras.includes || [];
            }

            const pdfOpts = {
                folio: row.folio,
                ...data,
                includes: mergedIncludes,
                excludes: data.excludes || extras.excludes || '',
                notes: data.notes || extras.notes || '',
                luggage: data.luggage || data.equipaje || { personal: true, hand: true, checked: false },
                advisorName: data.advisorName || advisorName,
                advisorRole: data.advisorRole || advisorRole
            };

            if (data.quoteType === 'eventos') {
                generateEventPdf(pdfOpts);
                return;
            }

            if (data.quoteType === 'alojamiento') {
                generateAccommodationPdf(pdfOpts);
                return;
            }

            if (data.quoteType === 'vacaciones-medida') {
                generateVacacionesMedidaPdf(pdfOpts);
                return;
            }

            if (isConfirmation) {
                generateConfirmationPdf(pdfOpts);
            } else {
                generateQuotePdf(pdfOpts);
            }
        };

        const handleReCotizar = async (row) => {
            const data = row.data || {};
            const originalFolio = row.folio;

            // Lógica de versionamiento elite
            let baseFolio = originalFolio;
            let currentVersion = 0;

            // Detectar si ya tiene un sufijo de versión _vN
            const vMatch = originalFolio.match(/_v(\d+)$/);
            if (vMatch) {
                baseFolio = originalFolio.replace(/_v\d+$/, '');
                currentVersion = parseInt(vMatch[1]);
            }

            const nextVersion = currentVersion + 1;
            const newFolio = `${baseFolio}_v${nextVersion}`;

            // Preparar datos de clonación completos para inyectar en los formularios
            cloneDataRef.current = {
                ...data,
                _sourceFolio: originalFolio,
                _baseFolio: baseFolio,
                _newFolio: newFolio
            };

            setPreviewFolio(newFolio);
            setIsReadOnly(false);

            // Navegar al formulario correcto según el tipo de servicio
            let serviceType = data.serviceType || data.quoteType || 'nacional';
            if (serviceType === 'vuelos') serviceType = 'tiquetes';
            if (serviceType === 'cruceros') serviceType = 'crucero';
            if (serviceType === 'alojamiento') serviceType = 'alojamiento';
            if (serviceType === 'vacaciones-medida') serviceType = 'vacaciones-medida';

            setActiveSubTab(serviceType);
            setActiveMainTab('cotizaciones');
        };

        const handleViewDetail = (row) => {
            const data = row.data || {};
            setPreviewFolio(row.folio);

            // Cargar los datos EXACTOS sin versionar para sólo lectura
            cloneDataRef.current = {
                ...data,
                _sourceFolio: row.folio,
                _baseFolio: row.folio,
                _newFolio: row.folio
            };
            setIsReadOnly(true); // Ver detalle = Modo lectura

            let serviceType = data.serviceType || data.quoteType || 'nacional';
            if (serviceType === 'vuelos') serviceType = 'tiquetes';
            if (serviceType === 'cruceros') serviceType = 'crucero';
            if (serviceType === 'alojamiento') serviceType = 'alojamiento';
            if (serviceType === 'vacaciones-medida') serviceType = 'vacaciones-medida';

            setActiveSubTab(serviceType);
            setActiveMainTab('cotizaciones');
        };

        const handleDeleteQuote = async (folio) => {
            if (!window.confirm(`¿Estás seguro de eliminar la cotización ${folio}? Esta acción no se puede deshacer.`)) return;
            try {
                const res = await QuotesApi.deleteQuote(folio);
                if (res.ok) {
                    load(searchTerm);
                } else {
                    alert(res.error || 'Error al eliminar');
                }
            } catch (err) {

            }
        };

        const handleExportCSV = () => {
            const filtered = getFilteredByPeriod(items);
            if (!filtered.length) {
                alert("No hay datos para este periodo");
                return;
            }

            const delimiter = ';';
            const companyHeader = [
                ['DESTINOS P&P S.A.S - Agencia de Viajes y Turismo'],
                ['NIT: 901.456.789-0'],
                [`Filtro: REPORTE POR ${reportPeriod.toUpperCase()}`],
                [`Generado el: ${new Date().toLocaleString()}`],
                [''],
                ['Folio', 'Cliente', 'Destino', 'Fecha', 'Valor USD', 'Estado Proceso', 'Asesora Responsable', 'Email Asesora']
            ];

            const rows = filtered.map(row => {
                const d = row.data || {};
                const val = d.salePrice || d.totalCharged || d.totalPrice || 0;
                return [
                    row.folio,
                    d.clientName || 'Sin Cliente',
                    d.destination || 'Sin Destino',
                    new Date(row.created_at).toLocaleDateString(),
                    parseFloat(val).toFixed(2),
                    `Paso ${getProcessStep(row)}`,
                    d.advisorName || 'Sin Asignar',
                    row.created_by_email || ''
                ];
            });


            const BOM = '\uFEFF';
            const sepLine = `sep=${delimiter}\n`;

            // Función para limpiar cada celda y asegurar que Excel no interprete mal los datos
            const formatRow = (r) => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(delimiter);

            const csvContent = BOM + sepLine + [...companyHeader, ...rows].map(formatRow).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Ventas_DestinosPyP_${reportPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const calculateMetrics = () => {
            const filtered = getFilteredByPeriod(items);
            const stats = {
                totalSales: 0,
                totalQuotes: filtered.length,
                advisorRanking: {},
                auditLog: []
            };

            filtered.forEach(row => {
                const d = row.data || {};
                const step = getProcessStep(row);
                const val = parseFloat(d.salePrice || d.totalCharged || 0) || 0;
                const advisor = d.advisorName || 'Sin Asignar';
                const advId = row.created_by;

                if (step === 5) stats.totalSales += val;

                // Ranking
                if (!stats.advisorRanking[advId]) {
                    stats.advisorRanking[advId] = {
                        name: advisor,
                        total: 0,
                        converted: 0,
                        cancelled: 0,
                        vol: 0,
                        lastActive: row.created_at
                    };
                }
                const r = stats.advisorRanking[advId];
                r.total++;
                if (step === 5) r.converted++;
                if (step === 1 && d.status === 'cancelled') r.cancelled++; // Suposición de campo status
                r.vol += val;
                if (new Date(row.created_at) > new Date(r.lastActive)) r.lastActive = row.created_at;

                // Log
                if (d.history && Array.isArray(d.history)) {
                    d.history.forEach(h => {
                        stats.auditLog.push({
                            folio: row.folio,
                            advisor: advisor,
                            action: h.action || h.type,
                            timestamp: h.timestamp || row.created_at
                        });
                    });
                }
            });

            // Ordenar log
            stats.auditLog.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            return stats;
        };

        const metrics = calculateMetrics();
        const advisorList = Array.from(new Set(items.map(it => ({ id: it.created_by, name: it.data?.advisorName || 'Sin Asignar' }))));

        const AdminMetricsView = () => {
            const { totalSales, totalQuotes, advisorRanking, auditLog } = metrics;
            const topAdvisor = Object.values(advisorRanking).sort((a, b) => b.vol - a.vol)[0]?.name || '—';

            return (
                <div className="space-y-8 animate-fade-in pb-20">
                    {/* Cards Superiores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-6 backdrop-blur-xl shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Ventas Totales (Paso 5)</p>
                                <h3 className="text-3xl font-black text-emerald-400">${totalSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Basado en periodo seleccionado</p>
                            </div>
                            <DollarSign className="absolute -right-4 -bottom-4 w-20 h-20 text-emerald-500/10" />
                        </div>
                        <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-6 backdrop-blur-xl shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Cotizaciones Totales</p>
                                <h3 className="text-3xl font-black text-blue-400">{totalQuotes}</h3>
                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Flujo de documentos activos</p>
                            </div>
                            <FileText className="absolute -right-4 -bottom-4 w-20 h-20 text-blue-500/10" />
                        </div>
                        <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-6 backdrop-blur-xl shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Asesora del Mes (Vol)</p>
                                <h3 className="text-2xl font-black text-white truncate">{topAdvisor}</h3>
                                <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase tracking-tighter flex items-center gap-1">
                                    <Trophy className="w-3 h-3" /> Mayor volumen facturado
                                </p>
                            </div>
                            <Award className="absolute -right-4 -bottom-4 w-20 h-20 text-amber-500/10" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Matriz de Rendimiento */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Users className="w-6 h-6 text-blue-400" />
                                    Matriz de Rendimiento por Asesora
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
                                                <th className="pb-4 text-left">Asesora</th>
                                                <th className="pb-4 text-center">Folios</th>
                                                <th className="pb-4 text-center">Conv %</th>
                                                <th className="pb-4 text-center">Cancel.</th>
                                                <th className="pb-4 text-right">Facturación</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(advisorRanking).map(([id, row]) => (
                                                <tr key={id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-4 font-bold text-slate-200">
                                                        {row.name}
                                                        <p className="text-[9px] text-slate-500 mt-0.5 font-normal">UA: {new Date(row.lastActive).toLocaleString()}</p>
                                                    </td>
                                                    <td className="py-4 text-center text-slate-300">{row.total}</td>
                                                    <td className="py-4 text-center">
                                                        <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg font-black text-[10px]">
                                                            {((row.converted / (row.total || 1)) * 100).toFixed(1)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-center text-red-400/70 font-bold">{row.cancelled}</td>
                                                    <td className="py-4 text-right font-black text-emerald-400">
                                                        ${row.vol.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Audit Log */}
                        <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-amber-400" />
                                Log de Auditoría (Pasos)
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                {auditLog.slice(0, 50).map((log, idx) => (
                                    <div key={idx} className="p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30 text-xs">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-mono text-blue-400 font-bold">{log.folio}</span>
                                            <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                                        </div>
                                        <p className="text-slate-300"><b className="text-white">{log.advisor}</b>: {log.action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };


        return (
            <div className="space-y-6 animate-fade-in">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                            <FileText className="w-8 h-8 text-blue-400" />
                            Historial de Cotizaciones
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Consulta y gestiona tu productividad y documentos generados.
                        </p>
                    </div>

                    {/* Widget de Documentos Generados (Migrado de Configuración) */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 shadow-lg shadow-blue-900/20 border border-white/10 min-w-[280px] relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest opacity-80">Documentos Generados</p>
                                {(user?.role === 'admin' || user?.role === 'manager') && (
                                    <div className="flex gap-1 bg-black/20 p-0.5 rounded-full backdrop-blur-sm">
                                        <button
                                            onClick={() => { setShowGlobal(true); setViewMode('standard'); }}
                                            className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter transition-all ${showGlobal && viewMode === 'standard' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-200 hover:text-white'}`}
                                        >
                                            Global
                                        </button>
                                        <button
                                            onClick={() => { setShowGlobal(false); setViewMode('standard'); }}
                                            className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter transition-all ${!showGlobal && viewMode === 'standard' ? 'bg-white text-blue-600 shadow-sm' : 'text-blue-200 hover:text-white'}`}
                                        >
                                            Mis Folios
                                        </button>
                                        <button
                                            onClick={() => { setViewMode('metrics'); setShowGlobal(true); }}
                                            className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter transition-all ${viewMode === 'metrics' ? 'bg-amber-400 text-black shadow-sm' : 'text-amber-400/60 hover:text-amber-400'}`}
                                        >
                                            Métricas
                                        </button>
                                    </div>
                                )}

                            </div>
                            <div className="flex items-baseline gap-2">
                                <h2 className="text-3xl font-black text-white transition-all transform group-hover:scale-105 duration-500">{displayCount}</h2>
                                <span className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">{showGlobal ? 'Equipo' : 'Perfil Actual'}</span>
                            </div>
                        </div>
                        <PieChart className="absolute -right-4 -bottom-4 w-16 h-16 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                </header>
                <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            className="bg-slate-900/70 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
                            placeholder="Buscar folio, cliente, documento o destino..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtros Avanzados (Solo visibles en modo métricas o para admin) */}
                    {(user?.role === 'admin' || user?.role === 'manager') && (
                        <div className="flex gap-2">
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                className="bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none"
                            >
                                <option value="all">TODOS LOS TIPOS</option>
                                <option value="tiquetes">VUELOS (NAC/INT)</option>
                                <option value="crucero">CRUCEROS</option>
                                <option value="alojamiento">ALOJAMIENTO</option>
                                <option value="eventos">EVENTOS</option>
                                <option value="vacaciones-medida">VACACIONES</option>
                            </select>
                            <select
                                value={filterStep}
                                onChange={e => setFilterStep(e.target.value)}
                                className="bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 text-[10px] font-bold text-white outline-none"
                            >
                                <option value="all">Paso: TODOS</option>
                                <option value="1">PASO 1 (COT)</option>
                                <option value="2">PASO 2 (CONF)</option>
                                <option value="3">PASO 3 (PAGO)</option>
                                <option value="4">PASO 4 (INV)</option>
                                <option value="5">PASO 5 (VOUCH)</option>
                            </select>
                        </div>
                    )}

                    <button
                        onClick={() => load(searchTerm)}
                        className="px-4 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-600 transition-all flex items-center gap-2"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" /> Recargar
                    </button>

                    <div className="h-6 w-px bg-slate-700 hidden md:block"></div>

                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-700 shadow-inner">
                        {[
                            { id: 'daily', label: 'Día' },
                            { id: 'weekly', label: 'Semana' },
                            { id: 'month', label: 'Mes' },
                            { id: 'year', label: 'Año' },
                            { id: 'all', label: 'Todo' }
                        ].map(p => (
                            <button
                                key={p.id}
                                onClick={() => setReportPeriod(p.id)}
                                className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-all ${reportPeriod === p.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex rounded-xl overflow-hidden border border-slate-700/60 shadow-lg">
                        <button
                            onClick={() => handleExportCSV()}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-emerald-500 hover:to-green-500 transition-all flex items-center gap-2 border-r border-emerald-500/30"
                        >
                            <FileSpreadsheet className="w-4 h-4" /> Excel
                        </button>
                        <button
                            onClick={() => {
                                const filtered = getFilteredByPeriod(items);
                                if (!filtered.length) return alert("Sin datos");
                                const total = filtered.reduce((acc, row) => acc + (parseFloat(row.data?.salePrice || row.data?.totalCharged || 0) || 0), 0);
                                const confirmed = filtered.filter(row => getProcessStep(row) === 5);
                                generateMonthlyReportPdf({
                                    month: reportPeriod === 'month' ? new Date().toLocaleString('es-ES', { month: 'long' }) : reportPeriod.toUpperCase(),
                                    year: new Date().getFullYear().toString(),
                                    quotes: filtered.map(it => ({
                                        id: it.folio,
                                        date: new Date(it.created_at).toLocaleDateString(),
                                        client: it.data?.clientName || 'Sin Cliente',
                                        advisor: it.data?.advisorName || 'Sin Asignar',
                                        data: it.data
                                    })),
                                    totalSales: total,
                                    avgTicket: filtered.length > 0 ? (total / filtered.length) : 0,
                                    conversion: filtered.length > 0 ? (confirmed.length / filtered.length) * 100 : 0,
                                    advisor: advisorName
                                });
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:from-blue-500 hover:to-indigo-500 transition-all flex items-center gap-2"
                        >
                            <PieChart className="w-4 h-4" /> Informe
                        </button>
                    </div>
                </div>

                {viewMode === 'metrics' ? (
                    <AdminMetricsView />
                ) : (
                    <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 md:p-6 shadow-2xl">
                        {loading && (
                            <p className="text-slate-400 text-sm">Cargando cotizaciones...</p>
                        )}
                        {!loading && error && (
                            <p className="text-red-400 text-sm">{error}</p>
                        )}
                        {!loading && !error && items.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                                <Search className="w-12 h-12 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-widest">No se encontraron cotizaciones</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setReportPeriod('all'); }}
                                    className="text-blue-500 text-[10px] font-black uppercase hover:underline"
                                >
                                    Limpiar todos los filtros
                                </button>
                            </div>
                        )}
                        {!loading && !error && items.length > 0 && (
                            <div className="w-full">
                                <div className="max-h-[700px] overflow-y-auto overflow-x-auto relative rounded-xl border border-slate-800/50 custom-scrollbar">
                                    <table className="w-full text-xs md:text-sm border-collapse translate-z-0">
                                        <thead className="sticky top-0 z-20 bg-slate-900 shadow-sm">
                                            <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-700">
                                                <th className="py-4 pr-4 text-left font-black pl-4 bg-slate-900">Folio / ID</th>
                                                <th className="py-4 pr-4 text-left font-black bg-slate-900">Cliente Titular</th>
                                                <th className="py-4 px-4 text-center font-black bg-slate-900">ESTADO DE PROCESO</th>
                                                <th className="py-4 pr-4 text-left font-black bg-slate-900">Destino / Detalle</th>
                                                <th className="py-4 pr-4 text-left hidden md:table-cell font-black bg-slate-900">Valor Estimado</th>
                                                <th className="py-4 pr-4 text-left hidden md:table-cell font-black bg-slate-900">Asesora</th>
                                                <th className="py-4 pr-4 text-left hidden md:table-cell font-black bg-slate-900 text-center">Fecha</th>
                                                <th className="py-4 pl-4 text-right font-black bg-slate-900 pr-4">OPCIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getFilteredByPeriod(items).slice(0, ITEMS_PER_PAGE).map(row => {
                                                const data = row.data || {};
                                                const currentStep = getProcessStep(row);
                                                return (
                                                    <tr
                                                        key={row.folio}
                                                        className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors group"
                                                    >
                                                        <td className="py-3 pr-4 font-mono pl-2">
                                                            <button
                                                                className="text-blue-400 hover:text-blue-300 font-mono font-bold hover:underline transition-colors text-left"
                                                                onClick={() => handleViewDetail(row)}
                                                            >
                                                                {row.folio}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-100 font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{data.clientName || '—'}</span>
                                                                <span className="text-[9px] text-slate-500">{data.clientDoc || 'S/D'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <StatusProgressBar step={currentStep} />
                                                                <p className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">
                                                                    Paso {currentStep}/5
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-400 italic">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-300 not-italic font-bold">{data.destination || '—'}</span>
                                                                <span className="text-[9px] uppercase tracking-tighter">{data.serviceType || data.quoteType || 'Vacacional'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 pr-4 hidden md:table-cell">
                                                            <div className="flex flex-col">
                                                                <span className="text-emerald-400 font-black">
                                                                    {(data.currency === 'COP' ? '$' : 'USD ')}
                                                                    {(data.salePrice || data.totalCharged || data.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                                                </span>
                                                                <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">{data.currency || 'USD'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 pr-4 hidden md:table-cell">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-400">
                                                                    {(data.advisorName || 'S/A').split(' ').map(n => n[0]).join('')}
                                                                </div>
                                                                <span className="text-slate-400 text-xs truncate max-w-[80px]">{data.advisorName || 'Sin Asignar'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 pr-4 text-slate-500 hidden md:table-cell text-xs text-center">
                                                            {new Date(row.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 pl-4 text-right pr-4">
                                                            <div className="flex gap-1 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleDownload(row)}
                                                                    className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                                                                    title="Redescargar PDF"
                                                                >
                                                                    <FileDown className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReCotizar(row)}
                                                                    className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                                                                    title="Clonar / Nueva Versión"
                                                                >
                                                                    <RefreshCcw className="w-3.5 h-3.5" />
                                                                </button>
                                                                {user?.role === 'admin' && (
                                                                    <button
                                                                        onClick={() => handleDeleteQuote(row.folio)}
                                                                        className="p-2 bg-slate-800 hover:bg-red-600 rounded-lg text-slate-600 hover:text-white transition-all shadow-sm"
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Center Logic */}
                                <div className="mt-8 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Anterior
                                        </button>

                                        {Array.from({ length: Math.min(5, Math.ceil(totalItems / ITEMS_PER_PAGE)) }).map((_, i) => {
                                            // Lógica simple para mostrar páginas cercanas (podría ser más compleja)
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all border ${currentPage === pageNum
                                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20 scale-110'
                                                        : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        {Math.ceil(totalItems / ITEMS_PER_PAGE) > 5 && <span className="text-slate-600 mx-1">...</span>}

                                        <button
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            disabled={currentPage >= Math.ceil(totalItems / ITEMS_PER_PAGE)}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-all text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
                                        Mostrando <span className="text-slate-400">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="text-slate-400">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> de <span className="text-blue-500/80">{totalItems}</span> registros
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // Estado para el acordeón del sidebar
    const [isQuotesOpen, setIsQuotesOpen] = useState(true);

    // --- ESTADO INTERNO DEL MÓDULO COTIZACIONES ---
    const [formTab, setFormTab] = useState('client'); // client, itinerary, finance, summary
    const [folio, setFolio] = useState('');
    const [previewFolio, setPreviewFolio] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [ownerId, setOwnerId] = useState(null);
    const cloneDataRef = useRef(null); // Para Re-cotizar: datos a clonar en el form

    // --- ESTADO DEL FORMULARIO (COTIZACIÓN) ---
    const [formData, setFormData] = useState({
        // Datos Cliente
        clientName: '',
        clientDoc: '',
        destination: '',
        dateStart: '',
        dateEnd: '',
        costCenter: '',
        // Itinerario
        supplier: '',
        supplierInfo: {},
        itineraryItems: [{ day: 1, port: '', arrival: '', departure: '', activity: '' }],
        // Finanzas
        currency: 'USD',
        exchangeRate: 1,
        usdPrice: 0,
        taxes: 0,
        netCost: 0,
        rateType: '',
        rateValue: '',
        marginPercent: 15,
        salePrice: 0,
        profit: 0,
        payments: { downPayment: 0, balance: 0, deadline: '' },
        // Extras
        includes: { beverages: false, tips: false, excursions: false, wifi: false },
        status: 'Cotizado'
    });

    // --- Auto-guardado de borrador ---
    const DRAFT_KEY = `DRAFT_FORM_${user?.id || 'guest'}`;
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [savedDraftTime, setSavedDraftTime] = useState(null);

    // Detectar borrador al cargar
    useEffect(() => {
        if (!activeSubTab) return;
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (raw) {
                const draft = JSON.parse(raw);
                if (draft?.savedAt) {
                    setSavedDraftTime(draft.savedAt);
                    setShowDraftModal(true);
                }
            }
        } catch { /* ignorar errores de parsing */ }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSubTab]);

    // Auto-guardar cada 30 segundos cuando hay datos relevantes
    useEffect(() => {
        if (!activeSubTab || isReadOnly) return;
        const hasData = formData.clientName || formData.destination || formData.dateStart;
        if (!hasData) return;

        const interval = setInterval(() => {
            try {
                localStorage.setItem(DRAFT_KEY, JSON.stringify({
                    ...formData,
                    activeSubTab,
                    savedAt: new Date().toISOString()
                }));
            } catch { /* ignorar */ }
        }, 30000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData, activeSubTab, isReadOnly]);

    const recoverDraft = () => {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            const { savedAt, activeSubTab: draftTab, ...draftData } = draft;
            setFormData(prev => ({ ...prev, ...draftData }));
            if (draftTab) setActiveSubTab(draftTab);
            setShowDraftModal(false);
            localStorage.removeItem(DRAFT_KEY);
        } catch { setShowDraftModal(false); }
    };

    const discardDraft = () => {
        localStorage.removeItem(DRAFT_KEY);
        setShowDraftModal(false);
    };

    // --- ESTRUCTURA DE NAVEGACIÓN (DIAGRAMA)
    const quoteOptions = [
        { id: 'nacional', label: 'Nacional', icon: Map },
        { id: 'internacional', label: 'Internacional', icon: Globe },
        { id: 'tiquetes', label: 'Tiquetes', icon: Plane },
        { id: 'terrestre', label: 'Porción Terrestre', icon: Briefcase },
        { id: 'quince', label: 'Quinceañeras', icon: UserPlus },
        { id: 'grupos', label: 'Grupos', icon: Users2 },
        { id: 'eventos', label: 'Eventos', icon: CalendarHeart },
        { id: 'alojamiento', label: 'Alojamiento', icon: Hotel },
        { id: 'vacaciones-medida', label: 'Vacaciones a tu Medida', icon: HeartHandshake }
    ];

    const mainTabs = [
        { id: 'confirmation', label: 'Confirmación', icon: CheckCircle, desc: 'Aceptación y Pasajeros' },
        { id: 'payments', label: 'Pagos', icon: CreditCard, desc: 'Recibos y Soportes' },
        { id: 'billing', label: 'Facturación', icon: Receipt, desc: 'Liquidación Operadores' },
        { id: 'voucher', label: 'Voucher', icon: FileSpreadsheet, desc: 'Generación Excel' },
        { id: 'reconfirm', label: 'Re-confirmación', icon: ClipboardList, desc: 'Checklist y Novedades' },
        { id: 'history', label: 'Historial', icon: LayoutDashboard, desc: 'Registro de cotizaciones' },
        { id: 'settings', label: 'Configuración', icon: Settings, desc: 'Perfil y Estadísticas' },
    ];

    // --- EFECTOS ---
    useEffect(() => {
        if (!folio) {
            setPreviewFolio(ERP.getNextFolio('COT'));
        }
    }, [folio]);

    // Lógica Centralizada de Permisos (Ownership)
    useEffect(() => {
        if (previewFolio && user?.id) {
            QuotesApi.getQuoteByFolio(previewFolio).then(data => {
                if (data && data._ownerId) {
                    setOwnerId(data._ownerId);
                    // Si el usuario no es el dueño Y no es admin, es Solo Lectura
                    if (data._ownerId !== user.id && user.role !== 'admin' && user.role !== 'manager') {
                        setIsReadOnly(true);
                    } else {
                        setIsReadOnly(false);
                    }
                } else {
                    // Si es un folio nuevo (sin dueño aún), no es solo lectura
                    setIsReadOnly(false);
                }
            });
        }
    }, [previewFolio, user?.id, user?.role]);

    useEffect(() => {
        // Cálculos financieros básicos
        let net = parseFloat(formData.netCost) || 0;
        // Priorizar cálculo por tipo de tarifa cuando esté presente
        const commissionPercent = adminConfig?.commissions?.globalPercent ?? 0;
        const rateVal = parseFloat(formData.rateValue) || 0;
        if (formData.rateType === 'neta') {
            net = rateVal;
        } else if (formData.rateType === 'comisionable') {
            net = rateVal * (1 - (commissionPercent / 100));
        } else if (formData.currency === 'USD') {
            const usd = parseFloat(formData.usdPrice) || 0;
            const taxes = parseFloat(formData.taxes) || 0;
            net = (usd + taxes);
        }
        const margin = parseFloat(formData.marginPercent) || 0;
        const sale = net > 0 && margin < 100 ? net / (1 - (margin / 100)) : 0;
        const profit = sale - net;

        setFormData(prev => ({
            ...prev,
            netCost: net,
            salePrice: sale,
            profit: profit,
            payments: {
                ...prev.payments,
                balance: sale - (prev.payments.downPayment || 0)
            }
        }));
    }, [formData.netCost, formData.marginPercent, formData.payments.downPayment, formData.currency, formData.usdPrice, formData.taxes, formData.exchangeRate, formData.rateType, formData.rateValue, adminConfig.commissions.globalPercent]);

    // --- MANEJADORES ---
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: type === 'checkbox' ? checked : value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // --- VISTAS AUXILIARES ---

    const SupervisionLockScreen = ({ title, message }) => (
        <div className="bg-[#1e293b] border border-red-500/30 rounded-3xl p-12 text-center animate-fade-in relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mb-6 border border-red-500/50">
                    <Lock className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase mb-3">{title || 'Acceso Restringido'}</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    {message || 'Su perfil tiene restringida la creación de nuevas cotizaciones operativas.'}
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveMainTab('history')}
                        className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
                    >
                        <LayoutDashboard className="w-4 h-4" /> Ver Historial
                    </button>
                </div>
            </div>
        </div>
    );

    const ConfirmationView = () => {
        const [serviceConfirmed, setServiceConfirmed] = useState(false);
        const [serviceType, setServiceType] = useState('');
        const [planType, setPlanType] = useState('');
        const [totalPrice, setTotalPrice] = useState('');
        const [depositDate, setDepositDate] = useState('');
        const [firstDeposit, setFirstDeposit] = useState('');
        const [secondDeposit, setSecondDeposit] = useState('');
        const [secondDepositDate, setSecondDepositDate] = useState('');
        const [dueDate, setDueDate] = useState('');
        const [hotelCategory, setHotelCategory] = useState('');
        const [clientNameC, setClientNameC] = useState('');
        const [clientEmailC, setClientEmailC] = useState('');
        const [destinationC, setDestinationC] = useState('');
        const [clientPhoneC, setClientPhoneC] = useState('');
        const [dateStartC, setDateStartC] = useState('');
        const [dateEndC, setDateEndC] = useState('');
        const [hotelNameC, setHotelNameC] = useState('');

        const [showConfirmErrors, setShowConfirmErrors] = useState(false);
        const [flightRows, setFlightRows] = useState([{ id: 1, airline: '', eticket: '', pnr: '', passengerName: '', passengerId: '', route: '', flightDate: '', depTime: '', arrTime: '', observaciones: '' }]);
        const [passengerRows, setPassengerRows] = useState([{ id: 1, fullName: '', docId: '', birthDate: '', accommodation: '' }]);
        const [folioInput, setFolioInput] = useState('');
        const [confirmSaved, setConfirmSaved] = useState(false);

        const includes = (() => {
            if (!serviceConfirmed) return { air: false, hotel: false };
            switch (serviceType) {
                case 'nacional': return { air: true, hotel: true };
                case 'internacional': return { air: true, hotel: true };
                case 'terrestre': return { air: false, hotel: false };
                case 'auto': return { air: false, hotel: false };
                case 'hotel': return { air: false, hotel: true };
                case 'crucero': return { air: false, hotel: false };
                default: return { air: false, hotel: false };
            }
        })();
        const addFlightRow = () => setFlightRows(prev => [...prev, { id: Date.now(), airline: '', eticket: '', pnr: '', passengerName: '', passengerId: '', route: '', flightDate: '', depTime: '', arrTime: '', observaciones: '' }]);
        const removeFlightRow = (id) => setFlightRows(prev => prev.filter(r => r.id !== id));
        const setFlightField = (id, field, value) => setFlightRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
        const addPassengerRow = () => setPassengerRows(prev => [...prev, { id: Date.now(), fullName: '', docId: '', birthDate: '', accommodation: '' }]);
        const removePassengerRow = (id) => setPassengerRows(prev => prev.filter(r => r.id !== id));
        const setPassengerField = (id, field, value) => setPassengerRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
        const getConfirmErrors = () => {
            const list = [];
            if (!serviceConfirmed) list.push("Aceptar Confirmación de Servicios en el encabezado.");
            if (!serviceType) list.push("Seleccionar el Tipo de Servicio (Nacional, Internacional...).");
            if (!clientNameC || !clientEmailC || !clientPhoneC || !destinationC) {
                list.push("Faltan datos del titular (Nombre, Email, Teléfono, Destino).");
            }
            if (!planType) list.push("Especificar el Tipo de Plan.");
            if (!totalPrice) list.push("Valor Total del Plan requerido.");
            if (!depositDate || !firstDeposit) list.push("Fecha y monto del Primer Abono obligatorios.");
            if (!dueDate) list.push("Establecer Fecha Límite de Pago para el Saldo.");

            if (includes.hotel && String(hotelCategory || '').trim() === '') list.push("Categoría del hotel requerida.");
            if (includes.air) {
                if (!flightRows.length || !flightRows.every(r => [r.airline, r.eticket, r.pnr, r.route, r.flightDate, r.depTime, r.arrTime].every(v => String(v || '').trim() !== ''))) {
                    list.push("Itinerario Aéreo: Completar todos los campos (Aero, PNR, E-Ticket, Ruta, Horas).");
                }
            }
            if (!passengerRows.length || !passengerRows.every(r => [r.fullName, r.docId, r.birthDate].every(v => String(v || '').trim() !== ''))) {
                list.push("Pasajeros: Registrar Nombre, Documento y Nacimiento obligatoriamente.");
            }
            return list;
        };

        const validateConfirm = () => getConfirmErrors().length === 0;
        useEffect(() => {
            const init = async () => {
                setFolioInput(previewFolio || '');
                if (previewFolio) {
                    const loaded = await QuotesApi.getQuoteByFolio(previewFolio);
                    if (loaded) {
                        if (loaded.serviceConfirmed !== undefined) setServiceConfirmed(!!loaded.serviceConfirmed);
                        if (loaded.serviceType) setServiceType(loaded.serviceType);
                        if (loaded.planType) setPlanType(loaded.planType);
                        if (loaded.totalPrice) setTotalPrice(String(loaded.totalPrice));
                        if (loaded.depositDate) setDepositDate(loaded.depositDate);
                        if (loaded.firstDeposit) setFirstDeposit(String(loaded.firstDeposit));
                        if (loaded.secondDeposit) setSecondDeposit(String(loaded.secondDeposit));
                        if (loaded.secondDepositDate) setSecondDepositDate(loaded.secondDepositDate);
                        if (loaded.dueDate) setDueDate(loaded.dueDate);
                        if (loaded.hotelCategory) setHotelCategory(loaded.hotelCategory);
                        if (loaded.clientName) setClientNameC(loaded.clientName);
                        if (loaded.clientEmail) setClientEmailC(loaded.clientEmail);
                        if (loaded.clientPhone) setClientPhoneC(loaded.clientPhone);
                        if (loaded.destination) setDestinationC(loaded.destination);
                        if (loaded.dateStart) setDateStartC(loaded.dateStart);
                        if (loaded.dateEnd) setDateEndC(loaded.dateEnd);
                        if (loaded.hotelName) setHotelNameC(loaded.hotelName);
                        if (Array.isArray(loaded.flightRows) && loaded.flightRows.length) setFlightRows(loaded.flightRows.map((r, i) => ({ id: r.id || i + 1, ...r })));
                        if (Array.isArray(loaded.passengerRows) && loaded.passengerRows.length) setPassengerRows(loaded.passengerRows.map((r, i) => ({ id: r.id || i + 1, ...r })));
                    }
                }
            };
            init();
        }, [previewFolio]);
        const handleLoadByFolio = async () => {
            const folio = (folioInput || '').trim();
            if (!folio) return;
            const data = await QuotesApi.getQuoteByFolio(folio);
            if (data) {
                if (data.serviceConfirmed !== undefined) setServiceConfirmed(!!data.serviceConfirmed);
                if (data.serviceType) setServiceType(data.serviceType);
                if (data.planType) setPlanType(data.planType);
                if (data.totalPrice) setTotalPrice(String(data.totalPrice));
                if (data.depositDate) setDepositDate(data.depositDate);
                if (data.firstDeposit) setFirstDeposit(String(data.firstDeposit));
                if (data.secondDeposit) setSecondDeposit(String(data.secondDeposit));
                if (data.secondDepositDate) setSecondDepositDate(data.secondDepositDate);
                if (data.dueDate) setDueDate(data.dueDate);
                if (data.hotelCategory) setHotelCategory(data.hotelCategory);
                if (data.clientName) setClientNameC(data.clientName);
                if (data.clientEmail) setClientEmailC(data.clientEmail);
                if (data.clientPhone) setClientPhoneC(data.clientPhone);
                if (data.destination) setDestinationC(data.destination);
                if (data.dateStart) setDateStartC(data.dateStart);
                if (data.dateEnd) setDateEndC(data.dateEnd);
                if (data.hotelName) setHotelNameC(data.hotelName);

                if (Array.isArray(data.flightRows) && data.flightRows.length) setFlightRows(data.flightRows.map((r, i) => ({ id: r.id || i + 1, ...r })));
                if (Array.isArray(data.passengerRows) && data.passengerRows.length) setPassengerRows(data.passengerRows.map((r, i) => ({ id: r.id || i + 1, ...r })));
                setPreviewFolio(folio);
            }
        };
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');

        const handleSaveConfirm = async () => {
            setIsSaving(true);
            setSaveStatus('Certificando Folio...');
            try {
                let folio = (folioInput || previewFolio || '').trim();
                // EMERGENCY RULE: Async fallback handled
                if (!folio || folio.startsWith('TEMP')) {

                    folio = await Folios.getNext(activeSubTab === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || serviceType || 'nacional'));
                    setPreviewFolio(folio);
                    setFolioInput(folio);
                }
                const payload = {
                    folio,
                    serviceConfirmed: true,
                    serviceType,
                    planType,
                    totalPrice,
                    depositDate,
                    firstDeposit,
                    secondDeposit,
                    secondDepositDate,
                    dueDate,
                    hotelCategory,
                    clientName: clientNameC,
                    clientEmail: clientEmailC,
                    clientPhone: clientPhoneC,
                    destination: destinationC,
                    dateStart: dateStartC,
                    dateEnd: dateEndC,
                    hotelName: hotelNameC,
                    corporateBrand: activeCorporateBrand,
                    flightRows,
                    passengerRows,
                    advisorName,
                    advisorRole,
                    updatedAt: new Date().toISOString()
                };
                const result = await QuotesApi.confirmQuote(payload, user);
                if (result?.ok) {
                    setConfirmSaved(true);
                    setSaveStatus('¡Certificado!');

                    // Registrar en historial para Atribución de Ventas
                    const historyLog = payload.history || [];
                    historyLog.push({
                        type: 'step_2',
                        action: 'CONFIRMACIÓN',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: 'Paso 2 Completado: Cliente aceptó propuesta y se registraron pasajeros.'
                    });

                    // Actualizar quote con el historial
                    await QuotesApi.updateQuote(folio, { ...payload, history: historyLog, status: 'confirmed' });

                    setAuditLogs(prev => [{
                        date: new Date().toISOString(),
                        user: advisorName,
                        action: 'CONFIRMACIÓN',
                        detail: `Paso 2 Completado para ${folio}`
                    }, ...prev]);
                } else {
                    setSaveStatus('Error: ' + result.error);
                }
            } catch (err) {
                setSaveStatus('Error de conexión.');
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveStatus(''), 3000);
            }
        };
        return (
            <div className="animate-fade-in p-4 md:p-8 min-h-screen flex justify-center items-start pt-10">
                <div className="bg-white/95 backdrop-blur-2xl text-slate-900 shadow-2xl w-full max-w-5xl overflow-hidden text-xs md:text-sm font-sans border border-white/40 rounded-3xl relative z-10">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                        <CheckCircle className="w-[500px] h-[500px] text-slate-900" />
                    </div>

                    {/* 1. Encabezado Premium - Logos Estilizados */}
                    <div className="relative z-10 p-8 pb-6 border-b border-slate-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            {/* Logo Principal Izquierda */}
                            <div className="flex-1 flex justify-start">
                                <img src="/logo-destinos.png" alt="Destinos P&P" className="h-20 w-auto object-contain hover:scale-105 transition-transform duration-500" />
                            </div>

                            {/* Título Central */}
                            <div className="flex-1 flex flex-col items-center text-center">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black mb-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Agencia de Viajes Certificada
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-1">
                                    CONFIRMACIÓN
                                </h1>
                                <p className="text-slate-400 text-[10px] uppercase tracking-[0.4em] font-medium">De Servicios Turísticos</p>
                            </div>

                            <div className="flex-1 flex justify-end">
                                <div className="flex flex-col items-end gap-3">
                                    {activeCorporateBrand ? (
                                        <img src={activeCorporateBrand.logo} alt={activeCorporateBrand.name} className="h-16 w-auto object-contain opacity-90" />
                                    ) : (
                                        <div className="w-32"></div> // Placeholder balanceador
                                    )}
                                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col items-center shadow-sm w-full md:w-64 border-t-4 border-t-blue-500">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Folio de Servicio</span>
                                        <span className="font-mono text-xl md:text-2xl font-black text-blue-600 tracking-tighter w-full text-center overflow-hidden text-ellipsis whitespace-nowrap">
                                            {previewFolio || 'COT-001'}
                                        </span>
                                        <div className="mt-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" /> Confirmado
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-8 pt-4">
                        <div className="flex flex-col md:flex-row gap-3 items-center justify-end">
                            <input value={folioInput} onChange={e => setFolioInput(e.target.value)} placeholder="COT-2026-0001" className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono outline-none w-full md:w-64" />
                            <button onClick={handleLoadByFolio} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">Cargar</button>
                            <button onClick={handleSaveConfirm} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">Guardar</button>
                        </div>
                    </div>

                    {/* Selector Maestro y Control Financiero */}
                    <div className="relative z-10 p-8 pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/50">
                        <div className="md:col-span-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center gap-3">
                                    <input type="checkbox" className="w-6 h-6 accent-emerald-600 rounded" checked={serviceConfirmed} onChange={e => setServiceConfirmed(e.target.checked)} />
                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Servicio Confirmado</span>
                                </label>
                            </div>
                            {serviceConfirmed && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <select value={serviceType} onChange={e => setServiceType(e.target.value)} className={`bg-slate-50 border rounded-xl p-3 text-slate-700 font-bold uppercase outline-none ${showConfirmErrors && !serviceType ? 'border-red-400' : 'border-slate-200'}`}>
                                        <option value="">Seleccione Tipo</option>
                                        <option value="nacional">Plan Nacional</option>
                                        <option value="internacional">Plan Internacional</option>
                                        <option value="terrestre">Porción Terrestre</option>
                                        <option value="auto">Alquiler de Auto</option>
                                        <option value="hotel">Hotel</option>
                                        <option value="crucero">Crucero</option>
                                        <option value="otros">Otros</option>
                                    </select>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-700 text-[11px] font-bold uppercase tracking-widest text-center flex flex-col items-center gap-1">
                                        <span className="text-slate-500 font-black">Asesor Comercial Responsable:</span>
                                        <span className="text-blue-900 text-sm">{advisorName}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="grid grid-cols-2 gap-3">
                                <input value={planType} onChange={e => setPlanType(e.target.value)} placeholder="Tipo de Plan" className={`bg-slate-50 border rounded-xl p-3 text-slate-700 font-bold uppercase outline-none col-span-2 ${showConfirmErrors && !planType ? 'border-red-400' : 'border-slate-200'}`} />
                                <div className={`bg-slate-50 border rounded-xl p-3 ${showConfirmErrors && !totalPrice ? 'border-red-400' : 'border-slate-200'}`}>
                                    <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Precio Total (USD)</div>
                                    <input value={totalPrice} onChange={e => setTotalPrice(e.target.value)} placeholder="0.00" className="w-full bg-transparent font-black text-xl text-slate-800 outline-none" />
                                </div>
                                <div className={`${dueDate && new Date(dueDate) < new Date() ? 'ring-2 ring-red-400 rounded-xl' : ''}`}>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Fecha Límite Pago Total</div>
                                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`w-full bg-transparent font-bold text-slate-700 outline-none ${showConfirmErrors && !dueDate ? 'text-red-500' : ''}`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Datos del Solicitante y Viaje */}
                    <div className="relative z-10 p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/30 border-t border-slate-100">
                        <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-bl-full"></div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Datos del Solicitante</span>
                            </div>
                            <input type="text" className="w-full bg-slate-50/50 outline-none font-bold text-slate-700 uppercase mb-3 text-sm border-b border-slate-200 focus:border-blue-300 pb-1" value={clientNameC} onChange={e => setClientNameC(e.target.value.toUpperCase())} placeholder="NOMBRE COMPLETO DEL CLIENTE" />
                            <div className="grid grid-cols-1 gap-3">
                                <input type="email" className="w-full bg-slate-50/50 outline-none text-xs text-slate-600 lowercase placeholder-slate-400 border-b border-slate-200 focus:border-blue-300 pb-1" value={clientEmailC} onChange={e => setClientEmailC(e.target.value)} placeholder="Correo electrónico" />
                                <input type="tel" className="w-full bg-slate-50/50 outline-none text-xs text-slate-600 placeholder-slate-400 border-b border-slate-200 focus:border-blue-300 pb-1" value={clientPhoneC || ''} onChange={e => setClientPhoneC(e.target.value)} placeholder="Celular de contacto" />
                            </div>
                        </div>

                        <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Detalles del Viaje</span>
                            </div>
                            <input type="text" className="w-full bg-slate-50/50 outline-none font-bold text-slate-800 uppercase mb-3 text-lg border-b border-slate-200 focus:border-emerald-300 pb-1" value={destinationC} onChange={e => setDestinationC(e.target.value.toUpperCase())} placeholder="DESTINO DEL VIAJE (EJ: ARUBA)" />

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <label className="text-[9px] text-slate-400 uppercase font-black tracking-wider block mb-1">Fecha de Inicio</label>
                                    <input type="date" className="w-full bg-slate-50/50 outline-none text-sm text-slate-700 font-medium border-b border-slate-200 focus:border-emerald-300 pb-1" value={dateStartC || ''} onChange={e => setDateStartC(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[9px] text-slate-400 uppercase font-black tracking-wider block mb-1">Fecha Final</label>
                                    <input type="date" className="w-full bg-slate-50/50 outline-none text-sm text-slate-700 font-medium border-b border-slate-200 focus:border-emerald-300 pb-1" value={dateEndC || ''} onChange={e => setDateEndC(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all group">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Asesor Responsable</span>
                            </div>
                            <input type="text" readOnly className="w-full bg-transparent outline-none font-black text-slate-800 uppercase mb-1" value={advisorName} />
                            <div className="text-xs text-slate-500 font-medium">{advisorRole}</div>

                            <div className="mt-5 pt-4 border-t border-slate-100">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fecha Emisión</span>
                                <p className="font-bold text-slate-700">{new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* 3. Detalles del Viaje & Alojamiento */}
                    <div className="relative z-10 px-8 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Alojamiento Card */}
                            {includes.hotel && (
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-red-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-start mb-6 pl-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg uppercase flex items-center gap-2">
                                                <Briefcase className="w-5 h-5 text-orange-500" /> Alojamiento Confirmado
                                            </h3>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Detalles del Hotel</p>
                                        </div>
                                        <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-orange-100">
                                            Todo Incluido
                                        </div>
                                    </div>

                                    <div className="pl-4 space-y-4">
                                        <div>
                                            <input type="text" value={hotelNameC} onChange={e => setHotelNameC(e.target.value)} className="w-full font-black text-xl md:text-2xl text-slate-700 outline-none uppercase placeholder-slate-300 border-b border-transparent focus:border-orange-200 transition-all" placeholder="NOMBRE DEL HOTEL (EJ: HOTEL RIU PALACE)" />
                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-tight mt-1">
                                                (Hora Check-In (llegada): 03:00 p.m. Hora Check-Out (salida): 12:00 m)
                                                <br />
                                                <span className="font-semibold italic text-[9px] opacity-80">*Sujeto a cambios de acuerdo a políticas del hotel*</span>
                                            </p>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Categoría de Habitación</div>
                                            <input value={hotelCategory} onChange={e => setHotelCategory(e.target.value)} className={`w-full bg-slate-50 rounded-xl p-3 text-xs text-slate-600 outline-none border ${showConfirmErrors && !hotelCategory ? 'border-red-400' : 'border-slate-100'}`} placeholder="EJ: SUPERIOR, SUITE, ESTÁNDAR" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Check-in</span>
                                                <input type="date" className="bg-transparent font-bold text-slate-700 text-sm outline-none w-full" />
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Check-out</span>
                                                <input type="date" className="bg-transparent font-bold text-slate-700 text-sm outline-none w-full" />
                                            </div>
                                        </div>
                                        <textarea className="w-full bg-slate-50 rounded-xl p-3 text-xs text-slate-500 outline-none resize-none border border-slate-100 focus:border-orange-300 transition-colors h-20" placeholder="Observaciones del hotel..."></textarea>
                                    </div>
                                </div>
                            )}

                            {/* Vuelos Card */}
                            {includes.air && (
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-indigo-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-start mb-6 pl-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg uppercase flex items-center gap-2">
                                                <Plane className="w-5 h-5 text-blue-500" /> Itinerario Aéreo
                                            </h3>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Vuelos Confirmados</p>
                                        </div>
                                        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-blue-100">
                                            Ida y Regreso
                                        </div>
                                    </div>

                                    <div className="pl-2 space-y-4">
                                        <div className="overflow-hidden rounded-xl border border-slate-200">
                                            <table className="w-full text-left text-[11px]">
                                                <thead className="bg-slate-100/50 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-200">
                                                    <tr>
                                                        <th className="p-4 text-center w-[25%]">Identificación</th>
                                                        <th className="p-4 text-center w-[25%]">Pasajero</th>
                                                        <th className="p-4 text-center w-[30%]">Itinerario</th>
                                                        <th className="p-4 text-center w-[20%]">Observaciones</th>
                                                        <th className="p-4 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {flightRows.map(fr => (
                                                        <tr key={fr.id} className="bg-white hover:bg-slate-50 transition-colors border-b border-slate-100">
                                                            <td className="p-4">
                                                                <div className="flex flex-col gap-2">
                                                                    <input value={fr.airline} onChange={e => setFlightField(fr.id, 'airline', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-bold uppercase text-xs text-center focus:border-blue-500/50 transition-all" placeholder="AEROLÍNEA" />
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <input value={fr.eticket} onChange={e => setFlightField(fr.id, 'eticket', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono text-[9px] text-center" placeholder="E-TICKET" />
                                                                        <input value={fr.pnr} onChange={e => setFlightField(fr.id, 'pnr', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono text-[9px] uppercase text-center" placeholder="PNR" />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex flex-col gap-2">
                                                                    <input value={fr.passengerName} onChange={e => setFlightField(fr.id, 'passengerName', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-bold uppercase text-xs text-center focus:border-blue-500/50 transition-all" placeholder="NOMBRE PASAJERO" />
                                                                    <input value={fr.passengerId} onChange={e => setFlightField(fr.id, 'passengerId', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none font-mono text-[9px] text-center" placeholder="DOCUMENTO ID" />
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <div className="flex flex-col gap-2">
                                                                    <input value={fr.route} onChange={e => setFlightField(fr.id, 'route', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none font-bold uppercase text-xs text-center focus:border-blue-500/50 transition-all" placeholder="BOG-ADZ" />
                                                                    <div className="grid grid-cols-3 gap-1">
                                                                        <input value={fr.flightDate} onChange={e => setFlightField(fr.id, 'flightDate', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 outline-none text-[8px] text-center" placeholder="FECHA" />
                                                                        <input value={fr.depTime} onChange={e => setFlightField(fr.id, 'depTime', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 outline-none text-[8px] text-center" placeholder="DEP" />
                                                                        <input value={fr.arrTime} onChange={e => setFlightField(fr.id, 'arrTime', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 outline-none text-[8px] text-center" placeholder="ARR" />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="p-4">
                                                                <textarea
                                                                    value={fr.observaciones || ''}
                                                                    onChange={e => setFlightField(fr.id, 'observaciones', e.target.value)}
                                                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 outline-none text-[10px] text-slate-600 resize-none focus:border-blue-400/50 transition-colors"
                                                                    placeholder="Observaciones del vuelo..."
                                                                    rows={3}
                                                                />
                                                            </td>
                                                            <td className="p-4 text-right">
                                                                <button onClick={() => removeFlightRow(fr.id)} className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold text-lg">×</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <button onClick={addFlightRow} className="w-full py-2 bg-slate-50 text-slate-600 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest border-t border-slate-200">
                                                + Agregar Vuelo
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Lista de Pasajeros y Acomodación */}
                    <div className="relative z-10 p-8 pt-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                <Users2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase text-sm">Datos de los Pasajeros</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Información detallada y acomodación</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {passengerRows.map((pr, index) => (
                                <div key={pr.id} className="flex relative items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                                    {passengerRows.length > 1 && (
                                        <button onClick={() => removePassengerRow(pr.id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-xs hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100">×</button>
                                    )}
                                    <div className="w-10 h-10 mt-1 rounded-full bg-slate-50 flex shrink-0 items-center justify-center text-slate-400 font-black text-lg group-hover:bg-blue-500 group-hover:text-white transition-colors border border-slate-200 group-hover:border-transparent">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <input value={pr.fullName || ''} onChange={e => setPassengerField(pr.id, 'fullName', e.target.value)} className="w-full bg-slate-50 rounded-xl px-3 py-2 font-bold text-slate-700 text-xs outline-none uppercase placeholder-slate-400 border border-transparent focus:border-blue-200 focus:bg-white transition-colors" placeholder="NOMBRES Y APELLIDOS" />
                                        <div className="flex gap-2">
                                            <input value={pr.docId || ''} onChange={e => setPassengerField(pr.id, 'docId', e.target.value)} className="w-1/2 bg-slate-50 rounded-xl px-3 py-2 font-mono text-[10px] text-slate-600 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-colors" placeholder="DOCUMENTO ID" />
                                            <div className="w-1/2 relative">
                                                <label className="absolute -top-1.5 left-2 bg-white px-1 text-[8px] font-black uppercase text-slate-400">Nacimiento</label>
                                                <input type="date" value={pr.birthDate || ''} onChange={e => setPassengerField(pr.id, 'birthDate', e.target.value)} className="w-full bg-slate-50 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-600 outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-colors" />
                                            </div>
                                        </div>
                                        <input value={pr.accommodation || ''} onChange={e => setPassengerField(pr.id, 'accommodation', e.target.value)} className="w-full bg-indigo-50/50 rounded-xl px-3 py-2 font-bold text-[10px] text-indigo-700 outline-none placeholder-indigo-300 border border-indigo-100 focus:bg-white focus:border-indigo-300 uppercase transition-colors" placeholder="ACOMODACIÓN (EJ: 1 HABITACIÓN JR. SUITE)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addPassengerRow} className="mt-4 px-4 py-3 w-full border border-dashed border-slate-300 rounded-2xl text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-all flex justify-center items-center gap-2">
                            + Agregar Pasajero
                        </button>
                    </div>

                    {/* LIQUIDACIÓN FINANCIERA Y FORMAS DE PAGO */}
                    <div className="relative z-10 px-8 py-6 bg-slate-50/80 border-t border-b border-slate-200 text-slate-800">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                            {/* Liquidación de Pagos Tabla */}
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase text-sm mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-emerald-600" /> Liquidación de Pagos
                                </h3>
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                    <table className="w-full text-xs">
                                        <tbody className="divide-y divide-slate-100">
                                            <tr>
                                                <td className="p-3 font-bold bg-slate-50 text-slate-600 uppercase w-1/3">Valor Total del Plan</td>
                                                <td className="p-3 font-black text-right text-base text-slate-800 bg-white">
                                                    <div className="flex justify-end items-center gap-1">
                                                        <span className="text-emerald-600 text-[10px]">$</span>
                                                        <input value={totalPrice} readOnly className="bg-transparent text-right outline-none w-24 border-none pointer-events-none" /> USD
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 bg-slate-50 text-slate-600 h-full border-r border-slate-100">
                                                    <div className="font-bold uppercase mb-1 text-[11px]">Primer Abono</div>
                                                    <input type="date" value={depositDate || ''} onChange={e => setDepositDate(e.target.value)} className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-mono outline-none focus:border-emerald-400 w-full" />
                                                </td>
                                                <td className="p-3 align-middle bg-white">
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2 font-black text-sm text-slate-800 mb-1">
                                                            <input value={firstDeposit || ''} onChange={e => setFirstDeposit(e.target.value)} placeholder="0.00" className="w-24 text-right border-b border-slate-200 focus:border-emerald-400 outline-none" /> USD
                                                        </div>
                                                        <span className="text-[9px] text-slate-400 font-medium italic">(Liquidado a la TRM del día)</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="p-3 bg-slate-50 text-slate-600 border-r border-slate-100">
                                                    <div className="font-bold uppercase mb-1 text-[11px]">Segundo Abono</div>
                                                    <input type="date" value={secondDepositDate || ''} onChange={e => setSecondDepositDate(e.target.value)} className="bg-white border border-slate-200 px-2 py-1 rounded text-[10px] font-mono outline-none focus:border-emerald-400 w-full" />
                                                </td>
                                                <td className="p-3 align-middle bg-white">
                                                    <div className="flex flex-col items-end">
                                                        <div className="flex items-center gap-2 font-black text-sm text-slate-800 mb-1">
                                                            <input value={secondDeposit || ''} onChange={e => setSecondDeposit(e.target.value)} placeholder="0.00" className="w-24 text-right border-b border-slate-200 focus:border-emerald-400 outline-none" /> USD
                                                        </div>
                                                        <span className="text-[9px] text-slate-400 font-medium italic">(Liquidado a la TRM del día)</span>
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                                                <td className="p-3 border-r border-slate-700">
                                                    <div className="font-black uppercase mb-1 text-[11px] text-blue-200">Saldo Total</div>
                                                    <div className="flex items-center gap-1 text-[9px] mt-1 text-slate-300">
                                                        Lim. <input type="date" value={dueDate || ''} onChange={e => setDueDate(e.target.value)} className="bg-slate-800 border-b border-slate-600 text-white/90 px-1 py-0.5 rounded-none font-mono outline-none focus:border-blue-400 flex-1" />
                                                    </div>
                                                </td>
                                                <td className="p-3 align-middle text-right">
                                                    <span className="font-black text-lg text-white">
                                                        {(() => {
                                                            const t = parseFloat(totalPrice) || 0;
                                                            const p1 = parseFloat(firstDeposit) || 0;
                                                            const p2 = parseFloat(secondDeposit) || 0;
                                                            const rem = t - p1 - p2;
                                                            return rem >= 0 ? rem.toFixed(3) : "0.00";
                                                        })()} USD
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Formas de Pago */}
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase text-sm mb-4 flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-blue-600" /> Formas de Pago Aceptadas
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v3m4-3v3m4-3v3" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[11px] text-slate-800 uppercase">Transferencia Bancaria</h4>
                                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Cuenta Bancolombia No. 15400007028</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[11px] text-slate-800 uppercase">Código QR</h4>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Escanea nuestro QR para pagos rápidos desde la app Bancolombia.</p>
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[11px] text-slate-800 uppercase">Link de Pagos PSE / Tarjetas</h4>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Pago con tarjeta de crédito tiene un incremento del 3% por uso de pasarela.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 5. Legales & Footer (Blocks) */}
                    <div className="relative z-10 bg-slate-50/50 border-t border-slate-200/60 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest mb-2">Condiciones y Garantía</h4>
                                <p className="text-[9px] text-slate-500 text-justify leading-relaxed font-medium">
                                    <strong>CONDICIONES PLAN TURÍSTICO:</strong> El cliente declara que conoce y acepta las condiciones de este plan turístico. Tarifas sujetas a cambios y disponibilidad. Servicios no tomados no son reembolsables.<br /><br />
                                    <strong>GARANTÍA DE LA RESERVA:</strong> Esta reserva se encuentra garantizada por Destinos P&P S.A.S, agencia de viajes con RNT N°175017 y se ajusta a las condiciones aquí descritas, a las políticas de aerolíneas, hoteles, y en lo no previsto, a las normas comerciales y de protección al consumidor.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest mb-2">Menores de Edad</h4>
                                <p className="text-[9px] text-slate-500 text-justify leading-relaxed font-medium">
                                    <strong>CUMPLIMIENTO LEY 679 DE 2001:</strong><br />Destinos P&P S.A.S está comprometida con la divulgación de la protección de niños, niñas y adolescentes en Colombia; en contra de la explotación sexual y demás formas de abuso sexual con menores de edad. Los menores que no viajen con sus padres deben llevar permiso autenticado en notaría, de lo contrario no podrán ingresar al hotel o salir del país.
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-sm">
                                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-3">
                                    <FileCheck className="w-5 h-5" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-widest mb-2">Habeas Data</h4>
                                <p className="text-[9px] text-slate-500 text-justify leading-relaxed font-medium">
                                    <strong>PROTECCIÓN GENERAL (LEY 1581 DE 2012):</strong><br />Los datos de los pasajeros suministrados, serán utilizados únicamente para garantizar la comunicación durante la operación de la reserva y garantizar el servicio contratado. Como responsables del uso de la información, damos estricto cumplimiento a la ley 1581 para la protección de la confidencialidad de la información personal de nuestros clientes.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col justify-between items-center md:items-stretch gap-6 pt-6 border-t border-slate-200">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                                <div className="text-center md:text-left flex-1">
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Destinos P&P S.A.S</p>
                                    <p className="text-[10px] text-slate-400 mt-1">RNT 175017 | NIT 901.721.152-3</p>
                                </div>
                                <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                    {showConfirmErrors && getConfirmErrors().length > 0 && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-3 rounded-xl text-[10px] w-full max-w-sm shadow-sm animate-fade-in text-left">
                                            <p className="font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" /> Datos requieridos para avanzar:
                                            </p>
                                            <ul className="list-disc pl-5 space-y-1 font-medium">
                                                {getConfirmErrors().map((err, idx) => <li key={idx}>{err}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <button className={`px-6 py-2.5 rounded-xl ${validateConfirm() && confirmSaved ? 'bg-white' : 'bg-slate-100 cursor-not-allowed'} border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm`} disabled={!validateConfirm() || !confirmSaved || isSaving} onClick={() => { if (!validateConfirm()) { setShowConfirmErrors(true); return; } if (!confirmSaved) return; generateConfirmationPdf({ folio: previewFolio || folioInput, clientName: clientNameC, clientEmail: clientEmailC, destination: destinationC, corporateBrand: activeCorporateBrand, flightRows, passengerRows, hotelName: hotelNameC, dateStart: dateStartC, dateEnd: dateEndC, totalPrice, firstDeposit, depositDate, secondDeposit, secondDepositDate, dueDate, advisorName, advisorRole, currency: formData.currency }); }}>
                                            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Descargar PDF
                                        </button>
                                        <button className={`px-6 py-2.5 rounded-xl ${validateConfirm() ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-slate-300'} text-white font-bold text-xs hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 shadow-md`} disabled={isSaving} onClick={() => { if (!validateConfirm()) { setShowConfirmErrors(true); return; } handleSaveConfirm(); }}>
                                            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle className="w-4 h-4" />}
                                            {isSaving ? 'Certificando...' : 'Aceptar Confirmación'}
                                            {saveStatus && <span className="text-[10px] ml-1">{saveStatus}</span>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const PaymentsView = () => {
        const [paymentType, setPaymentType] = useState('Transferencia');
        const [payFolio, setPayFolio] = useState('');
        const [payData, setPayData] = useState(null);
        const [supportAmount, setSupportAmount] = useState('');
        const [supports, setSupports] = useState([]);
        const [selectedFile, setSelectedFile] = useState(null);
        const fileInputRef = React.useRef(null);

        useEffect(() => {
            const init = async () => {
                const fol = previewFolio || '';
                setPayFolio(fol);
                if (fol) {
                    const data = await QuotesApi.getQuoteByFolio(fol);
                    if (data) {
                        setPayData(data);
                        setSupports(data.supports || []);
                    }
                }
            };
            init();
        }, [previewFolio]);
        const loadByFolio = async () => {
            const folio = (payFolio || '').trim();
            if (!folio) return;
            const data = await QuotesApi.getQuoteByFolio(folio);
            setPayData(data || null);
            setSupports((data && data.supports) || []);
        };
        const totalPrice = (() => {
            const v = payData?.totalPrice ?? formData?.salePrice ?? 0;
            const n = parseFloat(String(v).replace(/[^\d.]/g, '')) || 0;
            return n;
        })();
        const totalPaid = supports.reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
        const saldo = Math.max(totalPrice - totalPaid, 0);
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');

        const clientOk = !!(payData && (payData.clientName || payData.titular || payData.solicitante));

        const getPaymentErrors = () => {
            const list = [];
            if (!payFolio) list.push("Debe cargar un Folio válido.");
            else if (!clientOk) list.push("El Folio no tiene registrado un titular o cliente principal.");

            if (!selectedFile) list.push("Debe adjuntar el archivo de soporte de pago (PDF o Imagen).");
            if (!(parseFloat(supportAmount) > 0)) list.push("Debe ingresar el monto exacto del soporte referenciado.");
            return list;
        };
        const canRegister = getPaymentErrors().length === 0 && !isSaving;
        const handleRegister = async () => {
            if (!canRegister) return;
            setIsSaving(true);
            setSaveStatus('Registrando...');
            try {
                const folio = payFolio.trim();
                const newSupport = {
                    id: Date.now(),
                    type: paymentType,
                    amount: parseFloat(supportAmount),
                    fileName: selectedFile?.name || 'soporte',
                    date: new Date().toISOString(),
                    advisor: advisorName
                };
                const existing = await QuotesApi.getQuoteByFolio(folio) || {};
                const merged = { ...existing, folio, supports: [...(existing.supports || []), newSupport] };

                const result = await QuotesApi.updateQuote(folio, merged);
                if (result.ok) {
                    setSupports(merged.supports);
                    setSupportAmount('');
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';

                    // Registrar en historial para Atribución de Ventas (Paso 3)
                    const historyLog = existing.history || [];
                    historyLog.push({
                        type: 'step_3',
                        action: 'PAGO REGISTRADO',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: `Paso 3 en Proceso/Completado: Registro de pago por $ ${newSupport.amount.toLocaleString()}.`
                    });
                    await QuotesApi.updateQuote(folio, { ...merged, history: historyLog });

                    setAuditLogs(prev => [{
                        date: new Date().toISOString(),
                        user: advisorName,
                        action: 'PAGO',
                        detail: `Asesor ${advisorName} cargó soporte para ${folio} por USD ${newSupport.amount.toLocaleString()}`
                    }, ...prev]);
                    setSaveStatus('¡Registrado!');
                } else {
                    setSaveStatus('Error: ' + result.error);
                }
            } catch (err) {
                setSaveStatus('Error crítico.');
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveStatus(''), 3000);
            }
        };
        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-blue-500" /> Gestión de Pagos y Soportes
                </h2>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400 uppercase">Folio</span>
                            <input value={payFolio} onChange={e => setPayFolio(e.target.value.toUpperCase())} placeholder="COT-YYYY-XXXX" className="bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2 text-white text-sm outline-none font-mono" />
                            <button onClick={loadByFolio} className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold">Cargar</button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Precio Total</div>
                                <div className="text-lg font-black text-white">$ {totalPrice.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Saldo Pendiente</div>
                                <div className={`text-lg font-black ${saldo > 0 ? 'text-yellow-300' : 'text-emerald-400'}`}>$ {saldo.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {['Transferencia', 'Tarjeta Crédito', 'PSE'].map(type => (
                            <button
                                key={type}
                                onClick={() => setPaymentType(type)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${paymentType === type ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-300 mb-2">Soportes de Pago</h4>
                            <div className="p-8 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors cursor-pointer bg-slate-900/50" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="w-10 h-10 mb-2" />
                                <span className="text-sm font-medium">{selectedFile ? selectedFile.name : 'Cargar Soporte (PDF/IMG)'}</span>
                            </div>
                            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Monto del Soporte (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-cyan-400">USD</span>
                                    <input type="number" value={supportAmount} onChange={e => setSupportAmount(e.target.value)} className="w-full bg-slate-900/70 border border-slate-700/60 pl-12 p-3 rounded-xl text-white outline-none focus:border-blue-500 transition-colors" placeholder="0.00" />
                                </div>
                            </div>
                            {supports.length > 0 && (
                                <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3">
                                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Soportes Registrados</h5>
                                    <ul className="space-y-1">
                                        {supports.map(s => (
                                            <li key={s.id} className="flex justify-between text-xs text-slate-300">
                                                <span>{s.type} • {s.fileName}</span>
                                                <span>$ {parseFloat(s.amount).toLocaleString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-400 text-sm">Alerta Contable</h4>
                                    <p className="text-xs text-yellow-200/80 mt-1">El soporte cargado será enviado automáticamente a contabilidad para la generación del Recibo de Caja.</p>
                                    <p className="text-[11px] text-yellow-300 mt-1">Vinculado a: <span className="font-bold">{payData?.clientName || '—'}</span> - Folio: <span className="font-mono">{payFolio || '—'}</span></p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {getPaymentErrors().length > 0 && (
                                    <div className="bg-red-50/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-[10px] w-full shadow-sm animate-fade-in text-left">
                                        <p className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" /> Requisitos para procesar el pago:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 font-medium">
                                            {getPaymentErrors().map((err, idx) => <li key={idx}>{err}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <button
                                    onClick={handleRegister}
                                    disabled={!canRegister}
                                    className={`w-full py-3 font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 ${canRegister ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                >
                                    Registrar Pago
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const [showBillingErrors, setShowBillingErrors] = useState(false);
    const [billingSearchFolio, setBillingSearchFolio] = useState('');
    const [billingLoadMsg, setBillingLoadMsg] = useState('');

    const isFilledTop = (v) => v !== null && v !== undefined && String(v).trim() !== '';
    const validateBilling = () => isFilledTop(formData.rateType) && isFilledTop(formData.rateValue);

    const BillingView = () => {
        const [operators, setOperators] = useState([{ id: 1, name: '', amount: '', rateType: '' }]);
        const [adminFee, setAdminFee] = useState('');
        const [adminFeeVAT, setAdminFeeVAT] = useState('');
        const [serviceFeeWithVAT, setServiceFeeWithVAT] = useState('');
        const [segment, setSegment] = useState(activeSubTab === 'corporativo' ? 'CORPORATIVA' : 'NACIONAL');
        const [locked, setLocked] = useState(false);
        const [corporateLock, setCorporateLock] = useState(false);
        useEffect(() => {
            const init = async () => {
                if (previewFolio) {
                    const data = await QuotesApi.getQuoteByFolio(previewFolio);
                    if (data) {
                        setOperators(data.operators || [{ id: 1, name: '', amount: '', rateType: '' }]);
                        setAdminFee(String(data.adminFee || ''));
                        setAdminFeeVAT(String(data.adminFeeVAT || ''));
                        setServiceFeeWithVAT(String(data.serviceFeeWithVAT || ''));
                        setSegment((data.segment || segment || '').toString().toUpperCase() || (activeSubTab === 'corporativo' ? 'CORPORATIVA' : 'NACIONAL'));
                        setLocked(!!data.lockedBilling);
                        if (data.corporateBrand) {
                            setSegment('CORPORATIVA');
                            setCorporateLock(true);
                        } else {
                            setCorporateLock(false);
                        }
                    }
                }
            };
            init();
        }, [previewFolio]);
        const addOp = () => setOperators(prev => [...prev, { id: Date.now(), name: '', amount: '', rateType: '' }]);
        const removeOp = (id) => setOperators(prev => prev.filter(o => o.id !== id));
        const setOpField = (id, field, value) => setOperators(prev => prev.map(o => o.id === id ? { ...o, [field]: value } : o));
        const parseNum = (v) => parseFloat(String(v).replace(/[^\d.]/g, '')) || 0;
        const totalOperators = operators.reduce((acc, o) => acc + parseNum(o.amount), 0);
        const grandTotal = totalOperators + parseNum(adminFee) + parseNum(adminFeeVAT) + parseNum(serviceFeeWithVAT);

        const getBillingErrors = () => {
            const list = [];
            if (locked && userRole !== 'admin') list.push("La Liquidación (Paso 4) ya ha sido confirmada y finalizada por Contabilidad.");
            if (!operators.some(o => o.name.trim() && parseNum(o.amount) > 0 && o.rateType)) {
                list.push("Debe registrar al menos un Operador válido (Nombre, Monto > 0, Tipo de Tarifa NETA/COMIS).");
            }
            if (totalOperators === 0) list.push("El total de pagos a operadores no puede ser cero.");
            return list;
        };
        const canSave = getBillingErrors().length === 0;

        const loadByFolio = async () => {
            const folio = (billingSearchFolio || '').trim();
            const data = await QuotesApi.getQuoteByFolio(folio);
            if (data) {
                setPreviewFolio(data.folio || folio);
                setOperators(data.operators || operators);
                setAdminFee(String(data.adminFee || ''));
                setAdminFeeVAT(String(data.adminFeeVAT || ''));
                setServiceFeeWithVAT(String(data.serviceFeeWithVAT || ''));
                setSegment((data.segment || segment || '').toString().toUpperCase());
                setLocked(!!data.lockedBilling);
                setBillingLoadMsg('Cargada correctamente');
            } else {
                setBillingLoadMsg('No encontrada');
            }
            setTimeout(() => setBillingLoadMsg(''), 2500);
        };
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');

        const handleSave = async () => {
            if (!canSave) return;
            setIsSaving(true);
            setSaveStatus('Liquidando...');
            try {
                const folio = (previewFolio || '').trim();
                const existing = await QuotesApi.getQuoteByFolio(folio) || {};
                const payload = {
                    ...existing,
                    folio,
                    operators,
                    adminFee: parseNum(adminFee),
                    adminFeeVAT: parseNum(adminFeeVAT),
                    serviceFeeWithVAT: parseNum(serviceFeeWithVAT),
                    segment,
                    totalCharged: grandTotal,
                    lockedBilling: userRole !== 'admin' ? true : existing.lockedBilling || false
                };
                const result = await QuotesApi.updateQuote(folio, payload);
                if (result.ok) {
                    setAuditLogs(prev => [{
                        date: new Date().toISOString(),
                        user: advisorName,
                        action: 'LIQUIDACIÓN',
                        detail: `Paso 4 Completado: Asesor ${advisorName} liquidó la cotización ${folio} con total de USD ${grandTotal.toLocaleString()}`
                    }, ...prev]);

                    // Actualizar historial persistente
                    const historyLog = payload.history || [];
                    historyLog.push({
                        type: 'step_4',
                        action: 'FACTURACIÓN / LIQUIDACIÓN',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: `Se liquidaron costos de operadores por total de USD ${grandTotal.toLocaleString()} (Paso 4)`
                    });
                    await QuotesApi.updateQuote(folio, { ...payload, history: historyLog });

                    if (userRole !== 'admin') setLocked(true);
                    setSaveStatus('¡Liquidado!');
                } else {
                    setSaveStatus('Error: ' + result.error);
                }
            } catch (err) {
                setSaveStatus('Error crítico.');
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveStatus(''), 3000);
            }
        };
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl font-bold shadow-lg shadow-yellow-500/20 flex items-center gap-2">
                            <Receipt className="w-4 h-4" /> Liquidación
                        </div>
                        <span className="text-slate-500 text-xs uppercase tracking-widest font-bold">Datos de Liquidación</span>
                        <div className="ml-3 px-3 py-1 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-black uppercase tracking-widest">
                            {previewFolio || 'COT-—'}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={billingSearchFolio}
                                onChange={e => setBillingSearchFolio(e.target.value.toUpperCase())}
                                placeholder="COT-YYYY-XXXX"
                                className="bg-slate-900/70 border border-slate-700/60 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500 font-mono"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={loadByFolio}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold"
                            title="Cargar cotización por folio"
                        >
                            Cargar
                        </button>
                        {billingLoadMsg && (
                            <span className={`text-xs font-bold ${billingLoadMsg.includes('correcta') ? 'text-emerald-400' : 'text-red-400'}`}>
                                {billingLoadMsg}
                            </span>
                        )}
                        <img src="/logo-destinos.png" alt="Destinos P&P" className="h-10 w-auto opacity-90" />
                    </div>
                </div>
                <div className="relative bg-slate-900/40 backdrop-blur-2xl p-8 rounded-3xl border border-white/10 shadow-2xl shadow-slate-900/30 max-w-5xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Segmento</label>
                            <select value={segment} onChange={e => setSegment(e.target.value)} disabled={(locked && userRole !== 'admin') || (corporateLock && userRole !== 'admin')} className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl p-3 text-white outline-none">
                                <option value="NACIONAL">NACIONAL</option>
                                <option value="CORPORATIVA">CORPORATIVA</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 text-right">
                            <div className="inline-block bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Valor Total Cobrado</div>
                                <div className="text-3xl font-black text-white">$ {grandTotal.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-slate-300 font-bold">Matriz de Operadores</h4>
                            <button onClick={addOp} disabled={locked && userRole !== 'admin'} className="px-3 py-1.5 rounded-lg bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white text-xs font-bold">+ Agregar Operador</button>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-slate-700/60">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-800/80 text-slate-300 uppercase text-[10px]">
                                    <tr>
                                        <th className="p-3 text-left">Nombre del Operador</th>
                                        <th className="p-3 text-right">Valor Pagado</th>
                                        <th className="p-3 text-center">Tipo de Tarifa</th>
                                        <th className="p-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/60">
                                    {operators.map(op => (
                                        <tr key={op.id} className="bg-slate-900/50">
                                            <td className="p-3">
                                                <input value={op.name} onChange={e => setOpField(op.id, 'name', e.target.value)} disabled={locked && userRole !== 'admin'} placeholder="Aerolínea / Hotel / Receptivo" className="w-full bg-transparent text-white outline-none placeholder-slate-500" />
                                            </td>
                                            <td className="p-3">
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2.5 text-cyan-400">$</span>
                                                    <input value={op.amount} onChange={e => setOpField(op.id, 'amount', e.target.value)} disabled={locked && userRole !== 'admin'} type="number" className="w-full bg-slate-900/70 border border-slate-700/60 rounded-lg pl-6 p-2 text-right text-white outline-none" placeholder="0" />
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="inline-flex bg-slate-900/70 border border-slate-700/60 rounded-lg p-1">
                                                    <button type="button" onClick={() => setOpField(op.id, 'rateType', 'neta')} disabled={locked && userRole !== 'admin'} className={`text-[10px] font-black px-2 py-1 rounded-md tracking-widest ${op.rateType === 'neta' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300'}`}>NETA</button>
                                                    <button type="button" onClick={() => setOpField(op.id, 'rateType', 'comisionable')} disabled={locked && userRole !== 'admin'} className={`text-[10px] font-black px-2 py-1 rounded-md tracking-widest ${op.rateType === 'comisionable' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300'}`}>COMIS.</button>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => removeOp(op.id)} disabled={locked && userRole !== 'admin'} className="text-slate-500 hover:text-red-400">×</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tarifa Administrativa</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-cyan-400">$</span>
                                <input type="number" value={adminFee} onChange={e => setAdminFee(e.target.value)} disabled={locked && userRole !== 'admin'} className="w-full bg-slate-900/70 border border-slate-700/60 pl-8 p-3 rounded-xl text-white outline-none focus:border-purple-500 transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">IVA Tarifa Administrativa</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-cyan-400">$</span>
                                <input type="number" value={adminFeeVAT} onChange={e => setAdminFeeVAT(e.target.value)} disabled={locked && userRole !== 'admin'} className="w-full bg-slate-900/70 border border-slate-700/60 pl-8 p-3 rounded-xl text-white outline-none focus:border-purple-500 transition-colors" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Fee de Servicio + IVA</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-cyan-400">$</span>
                                <input type="number" value={serviceFeeWithVAT} onChange={e => setServiceFeeWithVAT(e.target.value)} disabled={locked && userRole !== 'admin'} className="w-full bg-slate-900/70 border border-slate-700/60 pl-8 p-3 rounded-xl text-white outline-none focus:border-purple-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end pt-6 border-t border-slate-700/50">
                        {getBillingErrors().length > 0 && (
                            <div className="bg-red-50/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-[10px] w-full max-w-sm mb-4 shadow-sm animate-fade-in text-left">
                                <p className="font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Problemas de Validación (Paso 4):
                                </p>
                                <ul className="list-disc pl-5 space-y-1 font-medium">
                                    {getBillingErrors().map((err, idx) => <li key={idx}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={!canSave || isSaving}
                            className={`group inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${canSave ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                        >
                            {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle className="w-5 h-5" />}
                            {isSaving ? 'Guardando...' : 'Guardar Liquidación'}
                            {saveStatus && <span className="text-[10px] ml-1">{saveStatus}</span>}
                        </button>
                    </div>
                    {locked && userRole !== 'admin' && (
                        <p className="mt-3 text-[11px] text-yellow-300">Edición bloqueada para asesoras. Solo Gerencia puede ajustar esta liquidación.</p>
                    )}
                </div>
            </div>
        );
    };

    const VoucherView = () => {
        const [voucherFolio, setVoucherFolio] = useState('');
        const [voucherHotels, setVoucherHotels] = useState([]);
        const [voucherDestination, setVoucherDestination] = useState('');
        const [corporateBrandV, setCorporateBrandV] = useState(null);
        const [voucherData, setVoucherData] = useState(null);

        useEffect(() => {
            const init = async () => {
                setVoucherFolio(previewFolio || '');
                if (previewFolio) {
                    const data = await QuotesApi.getQuoteByFolio(previewFolio);
                    if (data) {
                        setVoucherData(data);
                        setVoucherHotels(data.hotels || data.hotelOptions || []);
                        setVoucherDestination(data.destination || '');
                        setCorporateBrandV(data.corporateBrand || null);
                    }
                }
            };
            init();
        }, [previewFolio]);

        const handleVoucherLoad = async () => {
            const folio = (voucherFolio || '').trim();
            if (!folio) return;
            const data = await QuotesApi.getQuoteByFolio(folio);
            if (data) {
                setVoucherData(data);
                setVoucherHotels(data.hotels || data.hotelOptions || []);
                setVoucherDestination(data.destination || '');
                setCorporateBrandV(data.corporateBrand || null);
            } else {
                setVoucherData(null);
            }
        };

        const getVoucherErrors = () => {
            const list = [];
            if (!voucherData) {
                list.push("Cargue un folio para verificar autorizaciones.");
                return list;
            }
            if (!voucherData.lockedBilling) {
                list.push("Paso 4 incompleto: Liquidación no ha sido cerrada (Facturación pendiente).");
            }
            const t = parseFloat(voucherData.totalPrice) || 0;
            const paid = (voucherData.supports || []).reduce((acc, s) => acc + (parseFloat(s.amount) || 0), 0);
            if (t > 0 && paid < t) {
                list.push(`Paso 3 incompleto: Saldo pendiente detectado (USD ${(t - paid).toLocaleString()}).`);
            }
            return list;
        };

        const canDownloadVoucher = voucherData && getVoucherErrors().length === 0;

        const handleDownloadVoucher = async () => {
            const folio = (voucherFolio || '').trim();
            if (!folio) return;
            const data = await QuotesApi.getQuoteByFolio(folio);
            if (data) {
                // Actualizar historial persistente y estado Paso 5
                const historyLog = data.history || [];
                historyLog.push({
                    type: 'step_5',
                    action: 'VOUCHER / CIERRE',
                    timestamp: new Date().toISOString(),
                    user: advisorName,
                    details: 'Se generaron documentos finales de viaje y voucher (Paso 5 - Proceso Finalizado)'
                });
                await QuotesApi.updateQuote(folio, { ...data, history: historyLog, voucherGenerated: true, status: 'completed' });

                await generateVoucherPdf({
                    folio: folio,
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone,
                    destination: data.destination,
                    adults: data.adults,
                    children: data.children,
                    dateStart: data.dateStart,
                    dateEnd: data.dateEnd,
                    hotels: data.hotels || data.hotelOptions || [],
                    includes: data.includes || [],
                    notes: data.notes,
                    flights: data.flights || [],
                    luggage: data.luggage,
                    corporateBrand: data.corporateBrand,
                    advisorName,
                    advisorRole,
                    currency: data.currency // Pass selected currency
                });
            }
        };

        return (
            <div className="animate-fade-in p-4 md:p-8 min-h-screen flex justify-center items-start pt-10">
                <div className="bg-white/95 backdrop-blur-2xl text-slate-900 shadow-2xl w-full max-w-5xl overflow-hidden text-xs md:text-sm font-sans border border-white/40 rounded-3xl relative z-10">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                        <Plane className="w-[500px] h-[500px] text-slate-900" />
                    </div>

                    {/* 1. Encabezado Premium */}
                    <div className="relative z-10 p-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100">
                        <div className="flex flex-col items-center md:items-start">
                            <img src={(corporateBrandV && corporateBrandV.logo) || "/logo-destinos.png"} alt={(corporateBrandV && corporateBrandV.name) || "Destinos P&P"} className="h-16 w-auto mb-2 object-contain hover:scale-105 transition-transform duration-500" />
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                {corporateBrandV ? `Voucher ${corporateBrandV.name}` : 'Documento de Viaje'}
                            </div>
                        </div>

                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter mb-1 font-serif">Voucher</h1>
                            <p className="text-slate-400 font-bold tracking-[0.3em] text-[10px] uppercase">Orden de Servicios</p>
                        </div>

                        <div className="bg-white/90 border border-yellow-300 rounded-2xl p-4 flex flex-col items-center shadow-sm w-full md:w-auto">
                            <span className="text-[10px] text-yellow-700 uppercase tracking-widest font-bold mb-1">COTIZACIÓN No.</span>
                            <span className="font-mono text-3xl font-black text-yellow-700 tracking-tighter">{voucherFolio || previewFolio || 'COT-0000'}</span>
                            <div className="mt-2 px-3 py-1 bg-emerald-100/70 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wide border border-emerald-200 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Totalmente Pago
                            </div>
                        </div>
                    </div>
                    <div className="px-8">
                        <div className="flex items-center justify-end gap-2">
                            <input value={voucherFolio} onChange={e => setVoucherFolio(e.target.value)} placeholder="COT-2026-0001" className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-mono outline-none w-full md:w-64" />
                            <button onClick={handleVoucherLoad} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs">Cargar</button>
                        </div>
                    </div>

                    {/* 2. Información Principal (Grid) */}
                    <div className="relative z-10 p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50/30">
                        {/* Fecha y Origen */}
                        <div className="md:col-span-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-500">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Emisión</span>
                            </div>
                            <input type="date" className="bg-transparent outline-none font-bold text-slate-700 text-lg w-full" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>

                        <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destino Principal</span>
                            </div>
                            <input type="text" className="w-full bg-transparent outline-none font-black text-xl text-slate-800 uppercase tracking-tight placeholder-slate-300" defaultValue={voucherDestination || "SAN ANDRÉS ISLAS, COLOMBIA"} />
                        </div>

                        <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10 rounded-bl-full"></div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors text-teal-500">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titular Reserva</span>
                            </div>
                            <input type="text" className="w-full bg-transparent outline-none font-bold text-slate-700 uppercase mb-1" placeholder="NOMBRE TITULAR" />
                            <div className="flex items-center gap-2">
                                <input type="tel" className="w-full bg-transparent outline-none text-xs text-slate-400 font-medium" placeholder="+57 300..." />
                                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 rounded font-bold">PAX: 2</span>
                            </div>
                        </div>
                    </div>

                    {/* Comparativa de Opciones de Alojamiento */}
                    {voucherHotels && voucherHotels.length > 0 && (
                        <div className="relative z-10 px-8 py-6">
                            <h3 className="text-slate-700 font-black uppercase tracking-widest text-sm mb-4">Opciones de Alojamiento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {voucherHotels.map((h, i) => (
                                    <div key={h.id || i} className="bg-white/70 backdrop-blur-md border border-yellow-200 rounded-2xl p-4 shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <div className="text-slate-800 font-black uppercase tracking-tight">{h.name || 'HOTEL'}</div>
                                                <div className="text-[11px] text-yellow-600 uppercase font-bold">{h.category || 'CATEGORÍA'}</div>
                                            </div>
                                            <div className="rounded-xl px-2 py-1 bg-yellow-500/20 border border-yellow-400/40 text-yellow-700 text-[10px] font-black uppercase tracking-widest">Opción</div>
                                        </div>
                                        <ul className="space-y-2">
                                            {(h.includes
                                                ? (Array.isArray(h.includes) ? h.includes : String(h.includes).split('\n').filter(Boolean))
                                                : ['Sin beneficios especificados']
                                            ).map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Detalles de Servicios (Grid) */}
                    <div className="relative z-10 px-8 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Columna Izquierda: Alojamiento (8 cols) */}
                            <div className="md:col-span-8 space-y-6">
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-red-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-start mb-6 pl-4">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg uppercase flex items-center gap-2">
                                                <Briefcase className="w-5 h-5 text-orange-500" /> Alojamiento
                                            </h3>
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Información del Hotel</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-orange-100">
                                                Confirmado
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pl-4 space-y-4">
                                        <div>
                                            <input type="text" className="w-full font-black text-2xl text-slate-700 outline-none uppercase placeholder-slate-300 border-b border-transparent focus:border-orange-200 transition-all" placeholder="NOMBRE DEL HOTEL" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Régimen / Plan</span>
                                                <input type="text" className="w-full bg-transparent font-bold text-slate-700 text-sm outline-none uppercase" placeholder="TODO INCLUIDO" />
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1">Acomodación</span>
                                                <input type="text" className="w-full bg-transparent font-bold text-slate-700 text-sm outline-none uppercase" placeholder="DOBLE ESTÁNDAR" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pasajeros List */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <Users2 className="w-4 h-4" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 uppercase text-sm">Pasajeros</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                    {i}
                                                </div>
                                                <input className="flex-1 bg-transparent font-bold text-slate-700 text-xs outline-none uppercase" placeholder="NOMBRE PASAJERO" />
                                                <input className="w-24 bg-transparent font-mono text-xs text-slate-500 outline-none text-right" placeholder="DOC ID" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha: Fechas & Extras (4 cols) */}
                            <div className="md:col-span-4 space-y-6">
                                {/* Fechas Card */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-10 -mt-10 z-0 group-hover:bg-blue-100 transition-colors"></div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-slate-800 text-sm uppercase mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-500" /> Fechas de Viaje
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Check-in</span>
                                                <input type="date" className="bg-transparent font-bold text-slate-700 text-sm text-right outline-none" />
                                            </div>
                                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">Check-out</span>
                                                <input type="date" className="bg-transparent font-bold text-slate-700 text-sm text-right outline-none" />
                                            </div>
                                            <div className="text-center bg-blue-50 rounded-xl p-2 mt-2">
                                                <span className="block text-2xl font-black text-blue-600">4</span>
                                                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Noches</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Servicios Incluidos */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                                    <h3 className="font-bold text-emerald-600 text-sm uppercase mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Incluye
                                    </h3>
                                    <ul className="space-y-2">
                                        {['Alojamiento', 'Alimentación Full', 'Traslados', 'Impuestos', 'Seguro Viaje'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 md:p-8 mt-6 relative z-10 flex flex-col items-end gap-6 border-t border-slate-800">
                        {getVoucherErrors().length > 0 && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-xs w-full max-w-lg mb-2 shadow-sm animate-fade-in text-left">
                                <p className="font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Bloqueo de Emisión (Paso 5):
                                </p>
                                <ul className="list-disc pl-5 space-y-1.5 font-medium">
                                    {getVoucherErrors().map((err, idx) => <li key={idx}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                            <div className="text-center md:text-left">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Destinos P&P S.A.S</p>
                                <p className="text-[10px] text-slate-500 mt-1">Línea de Emergencias 24/7: +57 319 675 3094</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-xs transition-all flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Configurar
                                </button>
                                <button
                                    onClick={handleDownloadVoucher}
                                    disabled={!canDownloadVoucher}
                                    className={`px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-md ${canDownloadVoucher ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                                >
                                    <FileSpreadsheet className="w-4 h-4" /> Descargar Voucher PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ReconfirmView = () => {
        const [reFolio, setReFolio] = useState(previewFolio || '');
        const [reData, setReData] = useState(null);
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');

        const [checks, setChecks] = useState({
            pagoVerificado: false,
            facturaCompletada: false,
            numFactura: '',
            voucherEnviado: false,
            checkInConfirmado: false,
            registroMigratorio: false,
            seguroVerificado: false,
            observaciones: ''
        });

        const loadFolio = async (fol) => {
            if (!fol) return;
            try {
                const data = await QuotesApi.getQuoteByFolio(fol);
                if (data) {
                    setReData(data);
                    setChecks({
                        pagoVerificado: data.reconfirmData?.pagoVerificado || false,
                        facturaCompletada: data.reconfirmData?.facturaCompletada || false,
                        numFactura: data.reconfirmData?.numFactura || '',
                        voucherEnviado: data.reconfirmData?.voucherEnviado || false,
                        checkInConfirmado: data.reconfirmData?.checkInConfirmado || false,
                        registroMigratorio: data.reconfirmData?.registroMigratorio || false,
                        seguroVerificado: data.reconfirmData?.seguroVerificado || false,
                        observaciones: data.reconfirmData?.observaciones || ''
                    });
                } else {
                    setReData(null);
                }
            } catch (err) {

            }
        };

        useEffect(() => {
            if (previewFolio) {
                setReFolio(previewFolio);
                loadFolio(previewFolio);
            }
        }, [previewFolio]);

        const handleSearch = () => {
            loadFolio(reFolio);
        };

        const updateCheck = (field, value) => {
            setChecks(prev => ({ ...prev, [field]: value }));
        };

        const handleSave = async () => {
            if (!reData || !reFolio) return;
            setIsSaving(true);
            setSaveStatus('Guardando...');
            try {
                const newHistory = reData.history ? [...reData.history] : [];
                const lastHistoryType = newHistory.length > 0 ? newHistory[newHistory.length - 1].type : null;

                let hasNewStep = false;
                if (checks.voucherEnviado && lastHistoryType !== 'step_5') {
                    hasNewStep = true;
                    newHistory.push({
                        type: 'step_5',
                        action: 'RE-CONFIRMACIÓN',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: 'Paso 5 Completado: Voucher Enviado al Cliente.'
                    });
                } else if (checks.facturaCompletada && !checks.voucherEnviado && lastHistoryType !== 'step_4') {
                    hasNewStep = true;
                    newHistory.push({
                        type: 'step_4',
                        action: 'RE-CONFIRMACIÓN',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: `Paso 4 Completado: Factura ${checks.numFactura}.`
                    });
                } else if (checks.pagoVerificado && !checks.facturaCompletada && !checks.voucherEnviado && lastHistoryType !== 'step_3') {
                    hasNewStep = true;
                    newHistory.push({
                        type: 'step_3',
                        action: 'RE-CONFIRMACIÓN',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: 'Paso 3 Completado: Pago 100% Verificado.'
                    });
                }

                // Si no hay un paso nuevo pero hubo cambios en el checklist, registrar actualización genérica
                if (!hasNewStep) {
                    newHistory.push({
                        type: 'update',
                        action: 'RE-CONFIRMACIÓN',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: 'Se actualizó el checklist operativo / observaciones.'
                    });
                }

                const updatePayload = {
                    ...reData,
                    reconfirmData: checks,
                    history: newHistory,
                    voucherGenerated: checks.voucherEnviado ? true : reData.voucherGenerated,
                    lockedBilling: checks.facturaCompletada ? true : reData.lockedBilling,
                    status: checks.voucherEnviado ? 'completed' : (checks.pagoVerificado ? 'confirmed' : reData.status)
                };

                const res = await QuotesApi.updateQuote(reFolio, updatePayload);
                if (res.ok) {
                    setSaveStatus('¡Guardado con éxito!');
                    setReData(updatePayload);
                } else {
                    setSaveStatus('Error al guardar.');
                }
            } catch (err) {
                setSaveStatus('Error de red.');
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveStatus(''), 3000);
            }
        };

        const totalSaldo = reData ? (() => {
            const t = parseFloat(reData.totalPrice) || 0;
            const p1 = parseFloat(reData.firstDeposit) || 0;
            const p2 = parseFloat(reData.secondDeposit) || 0;
            const rem = t - p1 - p2;
            return rem > 0 ? rem : 0;
        })() : 0;

        return (
            <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Centro de Control Final</h2>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Checklist Operativo - Reconfirmación</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-xl border border-slate-600/50">
                        <Search className="w-4 h-4 text-slate-400 ml-2" />
                        <input
                            type="text"
                            placeholder="Buscar folio (ej: COT-VAC-001)"
                            className="bg-transparent border-none outline-none text-white text-sm font-mono w-48"
                            value={reFolio}
                            onChange={(e) => setReFolio(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                            Cargar
                        </button>
                    </div>
                </div>

                {!reData ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-slate-800/30 rounded-2xl border border-slate-700 border-dashed">
                        <ClipboardList className="w-12 h-12 text-slate-600 mb-4" />
                        <p className="text-slate-400 text-sm font-medium">Ingrese un folio válido en el buscador superior para iniciar el checklist.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 3 Bloques Verticales */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* BLOQUE 1: PAGOS */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/40 transition-all flex flex-col items-start relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                <div className="flex items-center gap-3 mb-6 w-full border-b border-slate-700/50 pb-4 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                        <DollarSign className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-0.5">Paso 3/5</span>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Gestión de Pagos</h3>
                                    </div>
                                </div>
                                <div className="w-full space-y-4 flex-1 relative z-10">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                        <span className="text-xs text-slate-400 uppercase font-medium">Saldo Pendiente:</span>
                                        <span className={`text-lg font-black ${totalSaldo === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${totalSaldo.toFixed(2)} USD</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${checks.pagoVerificado ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-900/30 border-slate-700 hover:bg-slate-900/50'}`}>
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input type="checkbox" checked={checks.pagoVerificado} onChange={e => updateCheck('pagoVerificado', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-500 rounded bg-transparent checked:bg-emerald-500 checked:border-emerald-500 transition-all cursor-pointer" />
                                                <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-bold block ${checks.pagoVerificado ? 'text-emerald-400' : 'text-slate-300'}`}>Pago 100% Verificado</span>
                                                <span className="text-[10px] text-slate-500 leading-tight block mt-1">Conforma que el área contable avaló el recaudo total del paquete turístico.</span>
                                            </div>
                                        </label>
                                    </div>
                                    <button className="w-full mt-2 py-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-slate-600">
                                        <Receipt className="w-4 h-4" /> Ver Soporte de Caja
                                    </button>
                                </div>
                            </div>

                            {/* BLOQUE 2: FACTURACIÓN */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-blue-500/20 shadow-lg shadow-blue-500/5 hover:border-blue-500/40 transition-all flex flex-col items-start relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                <div className="flex items-center gap-3 mb-6 w-full border-b border-slate-700/50 pb-4 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <FileCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-0.5">Paso 4/5</span>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Facturación & Ops</h3>
                                    </div>
                                </div>
                                <div className="w-full space-y-4 flex-1 relative z-10">
                                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-2 block">Número de Factura Electrónica:</label>
                                        <input
                                            type="text"
                                            value={checks.numFactura}
                                            onChange={e => updateCheck('numFactura', e.target.value.toUpperCase())}
                                            placeholder="EJ: FE-100234"
                                            className="w-full bg-transparent outline-none text-white font-mono border-b border-slate-600 focus:border-blue-500 transition-colors pb-1 text-sm"
                                            disabled={!checks.pagoVerificado}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${!checks.pagoVerificado ? 'opacity-50 cursor-not-allowed bg-slate-900/30 border-slate-800' : checks.facturaCompletada ? 'bg-blue-900/20 border-blue-500/50' : 'bg-slate-900/30 border-slate-700 hover:bg-slate-900/50'}`}>
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input type="checkbox" disabled={!checks.pagoVerificado} checked={checks.facturaCompletada} onChange={e => updateCheck('facturaCompletada', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-500 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer disabled:cursor-not-allowed" />
                                                <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-bold block ${checks.facturaCompletada ? 'text-blue-400' : 'text-slate-300'}`}>Facturación Completada</span>
                                                <span className="text-[9px] text-slate-500 leading-tight block mt-1">Requiere que el Pago 100% esté verificado primero.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* BLOQUE 3: VOUCHER */}
                            <div className="bg-slate-800 p-6 rounded-2xl border border-purple-500/20 shadow-lg shadow-purple-500/5 hover:border-purple-500/40 transition-all flex flex-col items-start relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                <div className="flex items-center gap-3 mb-6 w-full border-b border-slate-700/50 pb-4 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Book className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block mb-0.5">Paso 5/5</span>
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Emisión de Vouchers</h3>
                                    </div>
                                </div>
                                <div className="w-full space-y-4 flex-1 relative z-10">
                                    <div className="flex flex-col gap-2">
                                        <button
                                            className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md ${checks.facturaCompletada ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/30 text-white border-0' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-600'}`}
                                            disabled={!checks.facturaCompletada}
                                            onClick={() => alert("Función para enviar documentación predeterminada al cliente vía correo.")}
                                        >
                                            <FileSpreadsheet className="w-4 h-4" /> Enviar Docs al Cliente
                                        </button>

                                        <label className={`mt-2 flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-colors border ${!checks.facturaCompletada ? 'opacity-50 cursor-not-allowed bg-slate-900/30 border-slate-800' : checks.voucherEnviado ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-900/30 border-slate-700 hover:bg-slate-900/50'}`}>
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input type="checkbox" disabled={!checks.facturaCompletada} checked={checks.voucherEnviado} onChange={e => updateCheck('voucherEnviado', e.target.checked)} className="peer appearance-none w-5 h-5 border-2 border-slate-500 rounded bg-transparent checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer disabled:cursor-not-allowed" />
                                                <Check className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-sm font-bold block ${checks.voucherEnviado ? 'text-purple-400' : 'text-slate-300'}`}>Voucher Final Enviado</span>
                                                <span className="text-[9px] text-slate-500 leading-tight block mt-1">El cliente ya tiene en su poder toda la documentación del viaje.</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Checklist Secundario Operativo y Observaciones */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-1 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-sm space-y-4">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-700/50 pb-3">
                                    <Settings className="w-3 h-3 text-orange-400" /> Tareas Operativas Complementarias
                                </h4>
                                <div className="space-y-3 pt-2">
                                    {[
                                        { key: 'checkInConfirmado', label: 'Check-in Confirmado', desc: 'Asignación de sillas realizada.' },
                                        { key: 'registroMigratorio', label: 'Registro Migratorio (Check-MIG)', desc: 'Formulario de aduanas listo.' },
                                        { key: 'seguroVerificado', label: 'Seguro Médico Verificado', desc: 'Pólizas activas confirmadas.' }
                                    ].map((item) => (
                                        <label key={item.key} className={`flex items-start gap-4 p-3 rounded-xl cursor-pointer transition-colors border ${checks[item.key] ? 'border-orange-500/30 bg-orange-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900'}`}>
                                            <div className="relative flex items-center justify-center mt-0.5">
                                                <input type="checkbox" checked={checks[item.key]} onChange={e => updateCheck(item.key, e.target.checked)} className="peer appearance-none w-4 h-4 border-2 border-slate-500 rounded bg-transparent checked:bg-orange-500 checked:border-orange-500 transition-all cursor-pointer" />
                                                <Check className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={3} />
                                            </div>
                                            <div className="flex-1">
                                                <span className={`text-xs font-bold block ${checks[item.key] ? 'text-orange-400' : 'text-slate-300'}`}>{item.label}</span>
                                                <span className="text-[9px] text-slate-500 leading-tight block mt-1">{item.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-2 bg-slate-800/80 p-6 rounded-2xl border border-slate-700 shadow-sm flex flex-col">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" /> Novedades y Observaciones
                                </h4>
                                <textarea
                                    className="w-full flex-1 min-h-[140px] bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm outline-none focus:border-blue-500 resize-none transition-colors shadow-inner"
                                    placeholder="Detalles operativos adicionales, cambios de último minuto, alertas de retrasos..."
                                    value={checks.observaciones}
                                    onChange={e => updateCheck('observaciones', e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        {/* Action Banner */}
                        <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl">
                            <div className="mb-4 sm:mb-0 text-center sm:text-left">
                                <p className="text-sm font-bold text-white mb-1">Guarda el progreso del Checklist</p>
                                <p className="text-xs text-slate-400">Las actualizaciones sincronizan el estado en el Historial Consolidado del Asesor y en la base de datos.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {saveStatus && <p className={`text-xs font-bold animate-pulse ${saveStatus.includes('Error') ? 'text-rose-400' : 'text-emerald-400'}`}>{saveStatus}</p>}
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`px-8 py-3.5 rounded-xl font-black text-sm text-white transition-all flex items-center gap-2 shadow-md ${isSaving ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5'}`}
                                >
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                                    {isSaving ? 'Guardando...' : 'Sincronizar Panel de Control'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const AdminView = () => (
        <div className="space-y-8 animate-fade-in">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="text-slate-400" /> Panel Administrativo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 mb-4 p-1">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Profile" className="w-full h-full rounded-full bg-slate-900" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Perfil Vendedor</h3>
                    <p className="text-slate-400 text-sm mb-4">Configuración Personal</p>
                </div>
                <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-6">Presupuesto Mensual</h3>
                    <div className="mb-8">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-400">Cumplimiento</span>
                            <span className="text-emerald-400 font-bold">75%</span>
                        </div>
                        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-3/4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const QuoteSelectionDashboard = () => {
        const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {quoteOptions
                    .filter(type => {
                        if (isCorporateModule) return true;
                        // Vacational: Exclude corporate-only functions
                        return !['eventos', 'alojamiento', 'vacaciones-medida'].includes(type.id);
                    })
                    .map((option) => (
                        <div
                            key={option.id}
                            onClick={() => setActiveSubTab(option.id)}
                            className="group relative h-64 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
                        >
                            <div className="absolute inset-0">
                                <img
                                    src={`/images/intranet/${option.id}.png`}
                                    alt={option.label}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale group-hover:grayscale-0"
                                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                                />
                            </div>

                            <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                                <img src="/logo-destinos.png" alt="Logo" className="h-8 w-auto grayscale group-hover:grayscale-0 transition-all" />
                            </div>

                            <div className="absolute bottom-0 left-0 p-6 w-full">
                                <div className="mb-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-700/30 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-blue-600 group-hover:border-blue-500 transition-colors mb-3 shadow-lg">
                                        <option.icon className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-1 tracking-tight">{option.label}</h3>
                                    <p className="text-xs text-slate-300 font-medium group-hover:text-blue-200 transition-colors">
                                        Iniciar nueva cotización
                                    </p>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-0 group-hover:w-full transition-all duration-700 ease-out"></div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        );
    };

    const luggageOptions = [
        { key: 'personal', label: 'Artículo Personal (Mochila)' },
        { key: 'hand', label: 'Equipaje de Mano (10kg)' },
        { key: 'checked', label: 'Equipaje de Bodega (23kg)' }
    ];

    const LuggageIncludedCard = ({ value, onChange }) => (
        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 space-y-4 hover:border-blue-500/30 transition-colors">
            <h4 className="text-white font-bold text-sm uppercase border-b border-slate-700 pb-2">Equipaje Incluido</h4>
            <div className="space-y-3">
                {luggageOptions.map((item) => (
                    <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-700">
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-blue-500 rounded"
                            checked={!!value[item.key]}
                            onChange={() => onChange({ ...value, [item.key]: !value[item.key] })}
                        />
                        <span className="text-slate-300 text-sm">{item.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    const FlightQuoteForm = () => {
        const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
        const quoteType = isCorporateModule ? 'corporativo' : 'vacacional';
        const [currency, setCurrency] = useState('COP');
        const [flightQuotes, setFlightQuotes] = useState([
            {
                id: 1,
                airline: 'AEROLÍNEA',
                luggage: { personal: true, hand: true, checked: false },
                flights: [
                    { id: Date.now(), airline: '', flight: '', departure: '', arrival: '', duration: '', aircraft: '' }
                ],
                rates: { adultAffiliate: '', adultNonAffiliate: '', child: '', infant: '' },
                totalToPay: '',
                isTotalManual: false,
                mainPhoto: DEFAULT_IMAGES.FLIGHT
            },
            {
                id: 2,
                airline: 'AEROLÍNEA',
                luggage: { personal: true, hand: true, checked: true },
                flights: [
                    { id: Date.now() + 1, airline: '', flight: '', departure: '', arrival: '', duration: '', aircraft: '' }
                ],
                rates: { adultAffiliate: '', adultNonAffiliate: '', child: '', infant: '' },
                totalToPay: '',
                isTotalManual: false,
                mainPhoto: DEFAULT_IMAGES.FLIGHT
            }
        ]);

        const [formData, setFormData] = useState({
            route: '',
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            adultsAffiliate: 1,
            adultsNonAffiliate: 0,
            children: 0,
            infants: 0,
            classType: 'Económica',
            notes: '',
            mainPhoto: DEFAULT_IMAGES.FLIGHT
        });

        // Helper to compute total for a quote
        const computeQuoteTotal = (rates, fd) => {
            const adultsAff = parseInt(fd.adultsAffiliate) || 0;
            const adultsNon = parseInt(fd.adultsNonAffiliate) || 0;
            const children = parseInt(fd.children) || 0;
            const infants = parseInt(fd.infants) || 0;
            const rA = parseFloat(String(rates.adultAffiliate).replace(/,/g, '')) || 0;
            const rN = parseFloat(String(rates.adultNonAffiliate).replace(/,/g, '')) || 0;
            const rC = parseFloat(String(rates.child).replace(/,/g, '')) || 0;
            const rI = parseFloat(String(rates.infant).replace(/,/g, '')) || 0;
            const computed = (adultsAff * rA) + (adultsNon * rN) + (children * rC) + (infants * rI);
            return computed > 0 ? computed.toFixed(2) : '';
        };

        // Recalculate all non-manual totals when passenger counts change
        useEffect(() => {
            setFlightQuotes(prev => {
                const updated = prev.map(q => {
                    if (q.isTotalManual) return q;
                    return { ...q, totalToPay: computeQuoteTotal(q.rates, formData) };
                });
                // Only update if something actually changed
                if (JSON.stringify(updated) === JSON.stringify(prev)) return prev;
                return updated;
            });
        }, [formData.adultsAffiliate, formData.adultsNonAffiliate, formData.children, formData.infants]);

        const updateQuoteRate = (quoteId, rateKey, value) => {
            setFlightQuotes(prev => prev.map(q => {
                if (q.id !== quoteId) return q;
                const newRates = { ...q.rates, [rateKey]: value };
                const newTotal = computeQuoteTotal(newRates, formData);
                return { ...q, rates: newRates, totalToPay: newTotal, isTotalManual: false };
            }));
        };

        const setQuoteTotalManual = (quoteId, manual) => {
            setFlightQuotes(prev => prev.map(q =>
                q.id === quoteId ? { ...q, isTotalManual: manual } : q
            ));
        };

        const setQuoteTotalToPay = (quoteId, value) => {
            setFlightQuotes(prev => prev.map(q =>
                q.id === quoteId ? { ...q, totalToPay: value } : q
            ));
        };

        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');
        const [generalConditions, setGeneralConditions] = useState(DEFAULT_CONDITIONS);
        const [isEditingConditions, setIsEditingConditions] = useState(false);
        const [closingNote, setClosingNote] = useState(DEFAULT_CLOSING_NOTE);
        const [isEditingClosingNote, setIsEditingClosingNote] = useState(false);

        // Handlers para actualizar el estado de una cotización específica
        const updateQuote = (quoteId, field, value) => {
            setFlightQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, [field]: value } : q));
        };

        const updateQuoteLuggage = (quoteId, luggageKey) => {
            setFlightQuotes(prev => prev.map(q =>
                q.id === quoteId
                    ? { ...q, luggage: { ...q.luggage, [luggageKey]: !q.luggage[luggageKey] } }
                    : q
            ));
        };

        // Handlers para los vuelos dentro de una cotización
        const handleFlightChange = (quoteId, flightId, field, value) => {
            setFlightQuotes(prev => prev.map(q => {
                if (q.id === quoteId) {
                    return {
                        ...q,
                        flights: q.flights.map(f => f.id === flightId ? { ...f, [field]: value } : f)
                    };
                }
                return q;
            }));
        };

        const addFlight = (quoteId) => {
            setFlightQuotes(prev => prev.map(q => {
                if (q.id === quoteId) {
                    return {
                        ...q,
                        flights: [...q.flights, { id: Date.now(), airline: '', flight: '', departure: '', arrival: '', duration: '', aircraft: '' }]
                    };
                }
                return q;
            }));
        };

        const removeFlight = (quoteId, flightId) => {
            setFlightQuotes(prev => prev.map(q => {
                if (q.id === quoteId) {
                    return {
                        ...q,
                        flights: q.flights.filter(f => f.id !== flightId)
                    };
                }
                return q;
            }));
        };

        // ===== EFECTO DE RE-COTIZACIÓN (Clonar datos desde Historial) =====
        useEffect(() => {
            if (!cloneDataRef.current) return;

            const d = cloneDataRef.current;

            // Solo actuar si es una cotización de tiquetes o tiene flightOptions
            if (d.quoteType === 'vuelos' || d.flightOptions) {
                // 1. Cargar Vuelos/Opciones
                const incomingOptions = d.flightOptions || [];
                if (Array.isArray(incomingOptions) && incomingOptions.length > 0) {
                    const mapped = incomingOptions.map((opt, idx) => ({
                        id: opt.id || idx + 1,
                        airline: opt.airline || opt.title?.replace(/OPCIÓN \d+: /, '') || 'AEROLÍNEA',
                        luggage: opt.luggage || { personal: true, hand: true, checked: false },
                        rates: opt.rates || {
                            adultAffiliate: '',
                            adultNonAffiliate: '',
                            child: '',
                            infant: ''
                        },
                        totalToPay: opt.totalToPay || '',
                        isTotalManual: opt.isTotalManual || false,
                        flights: (opt.flights || []).map((f, fIdx) => ({
                            id: f.id || Date.now() + fIdx,
                            airline: f.airline || '',
                            flight: f.flight || '',
                            departure: f.departure || '',
                            arrival: f.arrival || '',
                            duration: f.duration || '',
                            aircraft: f.aircraft || f.equipment || ''
                        }))
                    }));
                    setFlightQuotes(mapped);
                }

                // 2. Datos generales
                setFormData(prev => ({
                    ...prev,
                    route: d.destination || d.route || '',
                    adultsAffiliate: d.adultsAffiliate || 1,
                    adultsNonAffiliate: d.adultsNonAffiliate || 0,
                    children: d.children || 0,
                    infants: d.infants || 0,
                    notes: d.notes || ''
                }));

                // 3. Otros campos
                if (d.currency) setCurrency(d.currency);
                if (d.generalConditions) setGeneralConditions(d.generalConditions);
                if (d.closingNote) setClosingNote(d.closingNote);

                // 4. Limpiar canal
                cloneDataRef.current = null;
            }
        }, []);

        const handleSaveAndPdf = async () => {
            setIsSaving(true);
            setSaveStatus('Guardando...');
            try {
                let folio = previewFolio;
                // EMERGENCY RULE: Async fallback handled
                if (!folio || folio.startsWith('TEMP')) {

                    folio = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || quoteType || 'nacional'));
                    setPreviewFolio(folio);
                }

                const flightOptions = flightQuotes.map((quote, index) => ({
                    title: `OPCIÓN ${index + 1}: ${quote.airline || 'AEROLÍNEA'}`,
                    luggage: quote.luggage,
                    rates: quote.rates,
                    totalToPay: quote.totalToPay,
                    flights: quote.flights.map(f => ({
                        airline: f.flight || '',
                        flight: f.flight || '',
                        route: f.route || '',
                        flightDate: f.schedule || '',
                        depTime: '',
                        arrTime: '',
                        departure: f.departure,
                        arrival: f.arrival,
                        duration: f.duration,
                        equipment: f.aircraft || f.equipment
                    }))
                }));

                // Grand total across all options
                const grandTotal = flightQuotes.reduce((sum, q) => sum + (parseFloat(q.totalToPay) || 0), 0);

                const payload = {
                    folio,
                    clientName: formData.clientName || 'Cliente (Vuelos)',
                    clientEmail: formData.clientEmail || '',
                    clientPhone: formData.clientPhone || '',
                    destination: formData.route || 'Ruta Aérea',
                    adults: (parseInt(formData.adultsAffiliate) || 0) + (parseInt(formData.adultsNonAffiliate) || 0),
                    adultsAffiliate: formData.adultsAffiliate,
                    adultsNonAffiliate: formData.adultsNonAffiliate,
                    children: formData.children,
                    infants: formData.infants,
                    notes: formData.notes,
                    flightOptions,
                    adultAffiliateRate: flightQuotes[0]?.rates?.adultAffiliate || '',
                    adultNonAffiliateRate: flightQuotes[0]?.rates?.adultNonAffiliate || '',
                    adultRate: flightQuotes[0]?.rates?.adultAffiliate || '',
                    childRate: flightQuotes[0]?.rates?.child || '',
                    infantRate: flightQuotes[0]?.rates?.infant || '',
                    totalToPay: grandTotal > 0 ? grandTotal.toFixed(2) : '',
                    corporateBrand: activeCorporateBrand,
                    advisorName,
                    advisorRole,
                    generalConditions,
                    quoteType: 'vuelos',
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    currency,
                    closingNote,
                    mainPhoto: formData.mainPhoto
                };

                const result = await QuotesApi.confirmQuote(payload, user);
                if (result.ok) {
                    setAuditLogs(prev => [{
                        date: new Date().toISOString(),
                        user: advisorName,
                        action: 'CONFIRMACIÓN',
                        detail: `Paso 2 Completado: Asesor ${advisorName} confirmó la cotización ${folio}`
                    }, ...prev]);

                    // Actualizar historial persistente
                    const historyLog = payload.history || [];
                    historyLog.push({
                        type: 'step_2',
                        action: 'CONFIRMACIÓN',
                        timestamp: new Date().toISOString(),
                        user: advisorName,
                        details: 'Se completaron los datos de aceptación y pasajeros (Paso 2)'
                    });
                    await QuotesApi.updateQuote(folio, { ...payload, history: historyLog, status: 'confirmed' });

                    await generateConfirmationPdf({
                        ...payload,
                        advisorName: user?.name,
                        advisorRole: user?.role_label
                    });
                    setSaveStatus('¡Confirmado!');
                } else {
                    setSaveStatus('Error: ' + result.error);
                }
            } catch (error) {

                setSaveStatus('Error crítico.');
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveStatus(''), 2000);
            }
        };

        return (
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 max-w-5xl mx-auto space-y-8 animate-fade-in relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* ENCABEZADO ELITE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-700/50 pb-8">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <button
                                onClick={() => setActiveSubTab(null)}
                                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-2 group absolute top-8 left-8 z-20 bg-slate-900/50 px-3 py-1 rounded-lg backdrop-blur-md"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver
                            </button>
                            {/* Spacers for button */}
                            <div className="h-8 md:hidden"></div>

                            <div className="bg-blue-600/20 border border-blue-500/30 px-4 py-2 rounded-lg inline-block">
                                <span className="text-blue-400 text-xs font-bold uppercase tracking-wider block">Cotización No.</span>
                                <span className="text-xl font-bold text-white">{previewFolio || 'COT-AERO'}</span>
                            </div>

                            <button
                                type="button"
                                onClick={handleVCHQuote}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-black uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 shadow-lg shadow-cyan-500/20 border border-cyan-300 hover:from-yellow-400 hover:to-amber-500 hover:text-slate-900 transition-colors"
                                title="Cotizar en VCH con referencia de esta cotización"
                            >
                                COTIZAR EN VCH
                            </button>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3 relative">
                            {/* Logo in header form */}
                            <img src="/logo-destinos.png" alt="Destinos P&P" className="absolute top-4 right-4 h-8 w-auto opacity-50" />

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Nombre del Cliente / Empresa</label>
                                    <input
                                        readOnly={isReadOnly}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                                        placeholder="Ingrese el nombre completo"
                                        value={formData.clientName}
                                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Ruta Aérea</label>
                                    <input
                                        readOnly={isReadOnly}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-lg"
                                        placeholder="BOG - MAD - BOG"
                                        value={formData.route}
                                        onChange={e => setFormData({ ...formData, route: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Afil.</label>
                                            <input
                                                type="number"
                                                min="0"
                                                readOnly={isReadOnly}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                                                value={formData.adultsAffiliate}
                                                onChange={e => setFormData({ ...formData, adultsAffiliate: Math.max(0, parseInt(e.target.value) || 0) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">No Afil.</label>
                                            <input
                                                type="number"
                                                min="0"
                                                readOnly={isReadOnly}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                                                value={formData.adultsNonAffiliate}
                                                onChange={e => setFormData({ ...formData, adultsNonAffiliate: Math.max(0, parseInt(e.target.value) || 0) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Niños</label>
                                            <input
                                                type="number"
                                                min="0"
                                                readOnly={isReadOnly}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                                                value={formData.children}
                                                onChange={e => setFormData({ ...formData, children: Math.max(0, parseInt(e.target.value) || 0) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 font-bold uppercase block mb-1">Inf.</label>
                                            <input
                                                type="number"
                                                min="0"
                                                readOnly={isReadOnly}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs"
                                                value={formData.infants}
                                                onChange={e => setFormData({ ...formData, infants: Math.max(0, parseInt(e.target.value) || 0) })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Clase</label>
                                    <select
                                        disabled={isReadOnly}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                                        value={formData.classType}
                                        onChange={e => setFormData({ ...formData, classType: e.target.value })}
                                    >
                                        <option>Económica</option>
                                        <option>Ejecutiva</option>
                                        <option>Primera Clase</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative h-64 md:h-auto rounded-xl overflow-hidden group border border-slate-700/50 bg-slate-900">
                        <img
                            src={formData.mainPhoto}
                            alt="Avión"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            {!isReadOnly && (
                                <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest cursor-pointer shadow-xl shadow-blue-900/40">
                                    Cambiar Foto
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const compressed = await processImageUpload(e);
                                            if (compressed) setFormData(prev => ({ ...prev, mainPhoto: compressed }));
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-6 pointer-events-none">
                            <div>
                                <p className="text-white font-black text-2xl uppercase leading-none mb-1">Conexiones Globales</p>
                                <p className="text-blue-400 font-bold text-sm">Vuelos Nacionales e Internacionales</p>
                            </div>
                        </div>
                        {/* Logo Overlay */}
                        <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-md p-2 rounded-lg border border-white/10">
                            <img src="/logo-destinos.png" alt="Logo" className="h-6 w-auto" />
                        </div>
                    </div>
                </div>

                {/* ITERAMOS SOBRE LAS OPCIONES DE COTIZACIÓN (OPCIÓN 1, OPCIÓN 2...) */}
                {flightQuotes.map((quote, index) => (
                    <div key={quote.id} className="animate-fade-in mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Opción {index + 1}
                            </div>
                            {/* Currency Selection for Flights */}
                            <div className="flex bg-slate-900/80 p-1 rounded-lg border border-white/10 text-[9px] font-black uppercase">
                                <span className="px-2 py-0.5 text-slate-500 flex items-center">Moneda:</span>
                                <button className={`px-2 py-0.5 rounded ${currency === 'COP' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-white'}`} onClick={() => setCurrency('COP')}>COP</button>
                                <button className={`px-2 py-0.5 rounded ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`} onClick={() => setCurrency('USD')}>USD</button>
                            </div>
                            <div className="h-px bg-slate-700 flex-1"></div>
                        </div>

                        {/* LAYOUT TIPO "COMPARATIVO" */}
                        <div className="flex flex-col lg:flex-row gap-0 border border-slate-700/50 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-sm">

                            {/* COLUMNA IZQUIERDA: RESUMEN TARIFA (30%) */}
                            <div className="lg:w-[35%] bg-slate-800/30 p-8 border-b lg:border-b-0 lg:border-r border-slate-700/50 flex flex-col justify-center items-center text-center space-y-6">

                                {/* Aerolínea Principal */}
                                <div className="w-full">
                                    <input
                                        readOnly={isReadOnly}
                                        placeholder="AEROLÍNEA"
                                        className="w-full bg-transparent text-2xl font-black text-white text-center outline-none placeholder-slate-600 uppercase tracking-widest"
                                        value={quote.airline}
                                        onChange={e => updateQuote(quote.id, 'airline', e.target.value)}
                                    />
                                </div>

                                {/* Lista de Equipaje */}
                                <div className="w-full space-y-3 py-4 border-y border-slate-700/30">
                                    <label className={`flex items-center justify-center gap-3 cursor-pointer group ${quote.luggage.personal ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <input type="checkbox" className="hidden" checked={quote.luggage.personal} onChange={() => updateQuoteLuggage(quote.id, 'personal')} />
                                        <span className="text-sm font-bold uppercase tracking-wider group-hover:text-emerald-300 transition-colors">Artículo Personal</span>
                                        {quote.luggage.personal && <CheckCircle className="w-4 h-4" />}
                                    </label>
                                    <label className={`flex items-center justify-center gap-3 cursor-pointer group ${quote.luggage.hand ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <input type="checkbox" className="hidden" checked={quote.luggage.hand} onChange={() => updateQuoteLuggage(quote.id, 'hand')} />
                                        <span className="text-sm font-bold uppercase tracking-wider group-hover:text-emerald-300 transition-colors">Equipaje de Mano (10kg)</span>
                                        {quote.luggage.hand && <CheckCircle className="w-4 h-4" />}
                                    </label>
                                    <label className={`flex items-center justify-center gap-3 cursor-pointer group ${quote.luggage.checked ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <input type="checkbox" className="hidden" checked={quote.luggage.checked} onChange={() => updateQuoteLuggage(quote.id, 'checked')} />
                                        <span className="text-sm font-bold uppercase tracking-wider group-hover:text-emerald-300 transition-colors">Equipaje de Bodega (23kg)</span>
                                        {quote.luggage.checked && <CheckCircle className="w-4 h-4" />}
                                    </label>
                                </div>

                            </div>

                            {/* COLUMNA DERECHA: TABLA DE VUELOS (65%) */}
                            <div className="lg:w-[65%] bg-slate-900/20 flex flex-col">
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-200/5 text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-700/50">
                                                <th className="p-4 text-center w-[25%] font-black shadow-inner">Identificación</th>
                                                <th className="p-4 text-center w-[25%] font-black">Pasajero</th>
                                                <th className="p-4 text-center w-[40%] font-black">Itinerario</th>
                                                <th className="p-4 text-center w-[10%] font-black">Estado</th>
                                                <th className="p-4 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/30">
                                            {quote.flights.map((f, i) => (
                                                <tr key={f.id} className="group hover:bg-slate-800/40 transition-colors border-b border-slate-800/20">
                                                    {/* 1. VUELO (Aerolínea/PNR) */}
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                className="w-full bg-slate-900/40 border border-slate-700/30 rounded-lg px-2 py-1.5 text-white font-bold text-xs outline-none placeholder-slate-700 uppercase text-center focus:border-blue-500/50 transition-all"
                                                                placeholder="AEROLÍNEA"
                                                                value={f.flight || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'flight', e.target.value)}
                                                            />
                                                            <input
                                                                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-2 py-1 text-slate-400 font-mono text-[9px] outline-none placeholder-slate-800 text-center"
                                                                placeholder="PNR / CONF"
                                                                value={f.pnr || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'pnr', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* 2. PASAJERO (Nombre/ID) */}
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                className="w-full bg-slate-900/40 border border-slate-700/30 rounded-lg px-2 py-1.5 text-slate-200 font-bold text-xs outline-none placeholder-slate-700 uppercase text-center focus:border-blue-500/50 transition-all"
                                                                placeholder="NOMBRE COMPLETO"
                                                                value={f.passenger || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'passenger', e.target.value)}
                                                            />
                                                            <input
                                                                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-2 py-1 text-slate-500 font-mono text-[9px] outline-none placeholder-slate-800 text-center"
                                                                placeholder="ID / DOC"
                                                                value={f.pid || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'pid', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* 3. ITINERARIO (Ruta/Horas) */}
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                className="w-full bg-slate-900/40 border border-slate-700/30 rounded-lg px-2 py-1.5 text-slate-200 font-bold text-xs outline-none placeholder-slate-700 uppercase text-center focus:border-blue-500/50 transition-all"
                                                                placeholder="RUTA (BOG-MAD-BOG)"
                                                                value={f.route || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'route', e.target.value)}
                                                            />
                                                            <input
                                                                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-2 py-1 text-slate-400 text-[9px] outline-none placeholder-slate-800 text-center"
                                                                placeholder="FECHAS / HORAS"
                                                                value={f.schedule || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'schedule', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td className="p-4 text-center">
                                                        <select
                                                            className="bg-slate-800/50 border border-slate-700/30 rounded px-2 py-0.5 text-slate-500 text-[8px] uppercase font-black outline-none cursor-pointer hover:bg-slate-700 transition-colors text-center w-full"
                                                            value={f.status || 'CONFIRMADO'}
                                                            onChange={e => handleFlightChange(quote.id, f.id, 'status', e.target.value)}
                                                        >
                                                            <option value="CONFIRMADO">CONFIRMADO</option>
                                                            <option value="PENDIENTE">PENDIENTE</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => removeFlight(quote.id, f.id)} className="w-7 h-7 rounded-full bg-red-400/10 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold text-lg">×</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* FOOTER TABLA */}
                                <div className="p-4 border-t border-slate-700/30 bg-slate-800/20">
                                    <button
                                        onClick={() => addFlight(quote.id)}
                                        className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 hover:bg-slate-700/30 text-xs font-bold uppercase tracking-widest transition-all"
                                    >
                                        + Agregar Trayecto
                                    </button>
                                </div>
                            </div>

                        </div>

                        {/* ═══════════════════════════════════════════════════════════ */}
                        {/* RESUMEN DE TARIFAS — OPCIÓN {index + 1} (INLINE, VINCULADO) */}
                        {/* ═══════════════════════════════════════════════════════════ */}
                        <div className="mt-6 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60 border border-slate-600/30 rounded-2xl overflow-hidden backdrop-blur-sm">
                            {/* Header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-600/15 to-emerald-600/10 border-b border-slate-700/40 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                                    <Receipt className="w-4 h-4 text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider">Opción {index + 1} — Resumen de Tarifas</h4>
                                    <p className="text-[10px] text-slate-400 font-medium">{quote.airline || 'Aerolínea'} · {currency}</p>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Columna Tarifas */}
                                    <div className="lg:col-span-8 space-y-3">
                                        {/* Tarifa Adulto Afiliado */}
                                        <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/20 hover:border-blue-500/20 transition-colors group">
                                            <div className="flex-1">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Adulto Afiliado</label>
                                                <div className="relative mt-1">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg pl-7 pr-3 py-2 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                                                        value={quote.rates.adultAffiliate}
                                                        onChange={e => updateQuoteRate(quote.id, 'adultAffiliate', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-slate-600 font-bold text-xs px-2">×{formData.adultsAffiliate || 0}</div>
                                            <div className="w-32 text-right">
                                                <span className="text-[9px] text-slate-500 font-bold uppercase block">Subtotal</span>
                                                <span className="text-emerald-400 font-black text-sm">{currency} ${((parseFloat(quote.rates.adultAffiliate) || 0) * (parseInt(formData.adultsAffiliate) || 0)).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Tarifa Adulto No Afiliado (condicional) */}
                                        {(formData.adultsNonAffiliate > 0 || quote.rates.adultNonAffiliate) && (
                                            <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/20 hover:border-blue-500/20 transition-colors group">
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Adulto No Afiliado</label>
                                                    <div className="relative mt-1">
                                                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg pl-7 pr-3 py-2 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                                                            value={quote.rates.adultNonAffiliate}
                                                            onChange={e => updateQuoteRate(quote.id, 'adultNonAffiliate', e.target.value)}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="text-slate-600 font-bold text-xs px-2">×{formData.adultsNonAffiliate || 0}</div>
                                                <div className="w-32 text-right">
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase block">Subtotal</span>
                                                    <span className="text-emerald-400 font-black text-sm">{currency} ${((parseFloat(quote.rates.adultNonAffiliate) || 0) * (parseInt(formData.adultsNonAffiliate) || 0)).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Tarifa Niño */}
                                        <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/20 hover:border-purple-500/20 transition-colors group">
                                            <div className="flex-1">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Niño</label>
                                                <div className="relative mt-1">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg pl-7 pr-3 py-2 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                                                        value={quote.rates.child}
                                                        onChange={e => updateQuoteRate(quote.id, 'child', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-slate-600 font-bold text-xs px-2">×{formData.children || 0}</div>
                                            <div className="w-32 text-right">
                                                <span className="text-[9px] text-slate-500 font-bold uppercase block">Subtotal</span>
                                                <span className="text-emerald-400 font-black text-sm">{currency} ${((parseFloat(quote.rates.child) || 0) * (parseInt(formData.children) || 0)).toLocaleString()}</span>
                                            </div>
                                        </div>

                                        {/* Tarifa Infante */}
                                        <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-700/20 hover:border-amber-500/20 transition-colors group">
                                            <div className="flex-1">
                                                <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Infante</label>
                                                <div className="relative mt-1">
                                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                                                    <input
                                                        type="number"
                                                        className="w-full bg-slate-800/60 border border-slate-700/40 rounded-lg pl-7 pr-3 py-2 text-white text-sm font-bold outline-none focus:border-blue-500/50 transition-all"
                                                        value={quote.rates.infant}
                                                        onChange={e => updateQuoteRate(quote.id, 'infant', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-slate-600 font-bold text-xs px-2">×{formData.infants || 0}</div>
                                            <div className="w-32 text-right">
                                                <span className="text-[9px] text-slate-500 font-bold uppercase block">Subtotal</span>
                                                <span className="text-emerald-400 font-black text-sm">{currency} ${((parseFloat(quote.rates.infant) || 0) * (parseInt(formData.infants) || 0)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Columna Total */}
                                    <div className="lg:col-span-4 flex">
                                        <div className="w-full bg-gradient-to-br from-blue-600/15 via-blue-700/10 to-emerald-600/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                            <span className="text-blue-300 font-black text-[10px] uppercase tracking-[0.2em] mb-3 relative z-10">Total Opción {index + 1}</span>
                                            <div className="text-3xl font-black text-white mb-1 flex items-baseline gap-1 relative z-10">
                                                <span className="text-lg text-blue-400">{currency} $</span>
                                                {parseFloat(quote.totalToPay || 0).toLocaleString()}
                                            </div>
                                            <button
                                                onClick={() => setQuoteTotalManual(quote.id, !quote.isTotalManual)}
                                                className={`mt-3 px-3 py-1 rounded-full text-[8px] font-bold uppercase transition-all relative z-10 ${quote.isTotalManual ? 'bg-amber-500 text-slate-900' : 'bg-slate-700/60 text-slate-400 hover:text-white border border-slate-600/50'}`}
                                            >
                                                {quote.isTotalManual ? '✓ Manual' : 'Cambiar a Manual'}
                                            </button>
                                            {quote.isTotalManual && (
                                                <input
                                                    type="number"
                                                    className="mt-3 w-full bg-slate-900/80 border border-amber-500/40 rounded-xl p-2.5 text-white text-center font-bold text-lg outline-none focus:border-amber-500 relative z-10"
                                                    value={quote.totalToPay}
                                                    onChange={e => setQuoteTotalToPay(quote.id, e.target.value)}
                                                    placeholder="Monto total..."
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* SECCIÓN DE OBSERVACIONES Y CONDICIONES (Estilo Estándar del Sistema) */}
                <div className="space-y-6">

                    {/* OBSERVACIONES IMPORTANTES (Estilo Rojo/Alerta) */}
                    <section className="bg-red-900/10 border border-red-500/30 p-6 rounded-xl">
                        <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Observaciones Importantes
                        </h3>
                        <div className="text-red-200/80 text-sm mb-4 space-y-1">
                            <p className="font-bold">Aplica penalidad por cambios y cancelaciones.</p>
                            <p>Después de emitido el tiquete todo cambio genera penalidad.</p>
                            <p>Los reembolsos solo aplican si las condiciones de la tarifa lo permiten y estarán sujetos a gastos administrativos y penalidades.</p>
                        </div>
                        <textarea
                            className="w-full bg-red-900/20 border border-red-500/20 rounded-lg p-3 text-red-100 placeholder-red-300/50 outline-none text-sm resize-none h-20"
                            placeholder="Escribe aquí cualquier restricción adicional específica de la tarifa..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        ></textarea>
                    </section>

                    {/* CONDICIONES GENERALES (Rediseñado: Unificado y Editable) */}
                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                        <div className="flex justify-between items-center mb-4 pl-4">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-blue-400" /> Condiciones Generales
                            </h3>
                            <button
                                onClick={() => setIsEditingConditions(!isEditingConditions)}
                                className={`p-2 rounded-lg transition-all ${isEditingConditions ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                                title="Editar condiciones específicas para esta cotización"
                            >
                                <Settings className={`w-4 h-4 ${isEditingConditions ? 'animate-spin-slow' : ''}`} />
                            </button>
                        </div>

                        <div className="pl-4">
                            {isEditingConditions ? (
                                <textarea
                                    className="w-full bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-64 font-mono"
                                    value={generalConditions}
                                    onChange={(e) => setGeneralConditions(e.target.value)}
                                    placeholder="Ingrese las condiciones particulares..."
                                />
                            ) : (
                                <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                                    <pre className="whitespace-pre-wrap text-slate-400 text-xs leading-relaxed font-sans">
                                        {generalConditions}
                                    </pre>
                                </div>
                            )}
                            <p className="mt-3 text-[10px] text-slate-500 italic flex items-center gap-2">
                                <AlertCircle className="w-3 h-3" />
                                {isEditingConditions ? 'Los cambios aplicarán solo al tiquete actual.' : 'Texto legal estándar protegido. Use el botón de edición para cambios puntuales.'}
                            </p>
                        </div>
                    </section>

                </div>



                {/* NOTA ACLARATORIA (Cierre Obligatorio) */}
                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all mt-6">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                    <div className="flex justify-between items-center mb-4 pl-4">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-blue-400" /> Nota Aclaratoria
                        </h3>
                        {!isReadOnly && (
                            <button
                                onClick={() => setIsEditingClosingNote(!isEditingClosingNote)}
                                className="text-[10px] text-blue-400 font-bold uppercase hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                                <Settings className="w-3 h-3" /> {isEditingClosingNote ? 'Guardar' : 'Editar'}
                            </button>
                        )}
                    </div>

                    <div className="pl-4">
                        {isEditingClosingNote && !isReadOnly ? (
                            <textarea
                                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-40 resize-none custom-scrollbar italic"
                                value={closingNote}
                                onChange={(e) => setClosingNote(e.target.value)}
                            />
                        ) : (
                            <div className="text-slate-400 text-xs leading-relaxed italic whitespace-pre-line">
                                {closingNote.split('Destinos P&P').map((part, i, arr) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && <strong className="text-blue-400 not-italic">Destinos P&P</strong>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
                    {(isReadOnly || user?.modules?.corporativo === 'read') ? (
                        <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-500/30 px-6 py-3 rounded-2xl text-amber-400 font-bold text-sm shadow-xl">
                            <ShieldCheck className="w-5 h-5" />
                            MODO LECTURA {(isReadOnly && !user?.modules?.corporativo === 'read') ? '(COTIZACIÓN AJENA)' : '(GERENCIA)'}
                        </div>
                    ) : (
                        <>
                            {!isReadOnly && (
                                <button
                                    onClick={handleSaveAndPdf}
                                    className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-xs transition-all"
                                >
                                    Guardar Borrador
                                </button>
                            )}
                            <button
                                onClick={handleSaveAndPdf}
                                disabled={isSaving}
                                className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg ${isSaving ? 'bg-slate-700 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'}`}
                            >
                                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isReadOnly ? 'Generar PDF' : 'Guardar y Generar PDF'}
                                {saveStatus && <span className="text-[10px] ml-1">{saveStatus}</span>}
                            </button>
                        </>
                    )}
                </div>
                {/* Banner de Solo Lectura para Vuelos */}
                {isReadOnly && (
                    <div className="fixed bottom-8 right-8 z-[200] animate-bounce">
                        <div className="bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl font-black shadow-2xl flex items-center gap-3 border-2 border-slate-900">
                            <ShieldCheck className="w-6 h-6" />
                            VISTA DE SOLO LECTURA (COTIZACIÓN AJENA)
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const CruiseQuoteForm = () => {
        const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
        const quoteType = isCorporateModule ? 'corporativo' : 'vacacional';
        const [cruiseData, setCruiseData] = useState({
            destination: formData.destination || '',
            suggestedDates: formData.suggestedDates || '',
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            adultsAffiliate: formData.adultsAffiliate || 2,
            adultsNonAffiliate: formData.adultsNonAffiliate || 0,
            passengers_children: formData.children || 0,
            passengers_infants: formData.infants || 0,
            plan: '',
            accommodation: '',
            mainPhoto: DEFAULT_IMAGES.CRUISE
        });

        const [currency, setCurrency] = useState('COP');
        const [thirdCabinTitle, setThirdCabinTitle] = useState('CABINA CON BALCÓN');
        const [includeAirInCruise, setIncludeAirInCruise] = useState(false);
        const [cruiseFlights, setCruiseFlights] = useState([
            { id: 1, airline: '', flight: '', dep: '', depDate: '', arr: '', arrDate: '', duration: '', aircraft: '' }
        ]);
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');
        const [generalConditions, setGeneralConditions] = useState(DEFAULT_CONDITIONS);
        const [isEditingConditions, setIsEditingConditions] = useState(false);
        const [closingNote, setClosingNote] = useState(DEFAULT_CLOSING_NOTE);
        const [isEditingClosingNote, setIsEditingClosingNote] = useState(false);

        const [cruiseItinerary, setCruiseItinerary] = useState([
            { day: '', date: '', port: '', arr: '', dep: '' }
        ]);

        useEffect(() => {
            setCruiseCabins(prev => prev.map(cabin => {
                if (cabin.isTotalManual) return cabin;

                const adultsAff = parseInt(cruiseData.adultsAffiliate) || 0;
                const adultsNon = parseInt(cruiseData.adultsNonAffiliate) || 0;
                const children = parseInt(cruiseData.passengers_children) || 0;
                const infants = parseInt(cruiseData.passengers_infants) || 0;

                const rateAff = parseFloat(String(cabin.adultAffiliateRate || 0).replace(/,/g, '')) || 0;
                const rateNon = parseFloat(String(cabin.adultNonAffiliateRate || 0).replace(/,/g, '')) || 0;
                const rateC = parseFloat(String(cabin.childRate || 0).replace(/,/g, '')) || 0;
                const rateI = parseFloat(String(cabin.infantRate || 0).replace(/,/g, '')) || 0;

                const computed = (adultsAff * rateAff) + (adultsNon * rateNon) + (children * rateC) + (infants * rateI);
                return {
                    ...cabin,
                    totalToPay: computed > 0 ? computed.toFixed(2) : ''
                };
            }));
        }, [cruiseData.adultsAffiliate, cruiseData.adultsNonAffiliate, cruiseData.passengers_children, cruiseData.passengers_infants]);

        // ===== EFECTO DE RE-COTIZACIÓN (Clonar datos desde Historial) =====
        useEffect(() => {
            if (!cloneDataRef.current) return;
            const d = cloneDataRef.current;

            // Diferenciamos si es crucero por el tipo o por campos específicos como cabinas
            if (d.quoteType === 'crucero' || d.cabins || d.cruiseData) {
                // 1. Datos generales
                setCruiseData({
                    destination: d.destination || '',
                    suggestedDates: d.suggestedDates || d.dateStart || '',
                    adultsAffiliate: d.adultsAffiliate || d.cruiseData?.adultsAffiliate || 2,
                    adultsNonAffiliate: d.adultsNonAffiliate || d.cruiseData?.adultsNonAffiliate || 0,
                    passengers_children: d.children || d.cruiseData?.passengers_children || 0,
                    passengers_infants: d.infants || d.cruiseData?.passengers_infants || 0,
                    plan: d.plan || d.cruiseData?.plan || '',
                    accommodation: d.accommodation || d.cruiseData?.accommodation || ''
                });

                // 2. Cabinas
                const incomingCabins = d.cabins || d.cruiseCabins || [];
                if (Array.isArray(incomingCabins) && incomingCabins.length > 0) {
                    setCruiseCabins(incomingCabins.map((c, idx) => ({
                        id: c.id || idx + 1,
                        title: c.title || '',
                        observaciones: c.observaciones || '',
                        image: c.image || null,
                        adultAffiliateRate: c.adultAffiliateRate || '',
                        adultNonAffiliateRate: c.adultNonAffiliateRate || '',
                        childRate: c.childRate || '',
                        infantRate: c.infantRate || '',
                        totalToPay: c.totalToPay || '',
                        isTotalManual: c.isTotalManual || false
                    })));
                }

                // 3. Itinerario
                const incomingItinery = d.itinerary || d.cruiseItinerary || [];
                if (Array.isArray(incomingItinery) && incomingItinery.length > 0) {
                    setCruiseItinerary(incomingItinery);
                }

                // 4. Vuelos asociados
                const incomingFlights = d.flights || d.cruiseFlights || [];
                if (Array.isArray(incomingFlights) && incomingFlights.length > 0) {
                    setIncludeAirInCruise(true);
                    setCruiseFlights(incomingFlights);
                }

                // 5. Otros campos
                if (d.currency) setCurrency(d.currency);
                if (d.generalConditions) setGeneralConditions(d.generalConditions);
                if (d.closingNote) setClosingNote(d.closingNote);

                // 6. Limpiar canal
                cloneDataRef.current = null;
            }
        }, []);

        // Cabins state (Dynamic)
        const [cruiseCabins, setCruiseCabins] = useState([
            {
                id: 1,
                title: 'CABINA INTERIOR',
                observaciones: '',
                adultAffiliateRate: '',
                adultNonAffiliateRate: '',
                childRate: '',
                infantRate: '',
                totalToPay: '',
                isTotalManual: false,
                image: DEFAULT_IMAGES.CRUISE
            }
        ]);

        const handleCabinPricingChange = (id, field, value) => {
            setCruiseCabins(prev => prev.map(c => {
                if (c.id === id) {
                    const newCabin = { ...c, [field]: value };

                    // Si se cambia una tarifa, desactivar manual para recalcular
                    if (['adultAffiliateRate', 'adultNonAffiliateRate', 'childRate', 'infantRate'].includes(field)) {
                        newCabin.isTotalManual = false;

                        // Recalcular inmediatamente para este item
                        const adultsAff = parseInt(cruiseData.adultsAffiliate) || 0;
                        const adultsNon = parseInt(cruiseData.adultsNonAffiliate) || 0;
                        const children = parseInt(cruiseData.passengers_children) || 0;
                        const infants = parseInt(cruiseData.passengers_infants) || 0;

                        const rateAff = parseFloat(String(field === 'adultAffiliateRate' ? value : c.adultAffiliateRate || 0).replace(/,/g, '')) || 0;
                        const rateNon = parseFloat(String(field === 'adultNonAffiliateRate' ? value : c.adultNonAffiliateRate || 0).replace(/,/g, '')) || 0;
                        const rateC = parseFloat(String(field === 'childRate' ? value : c.childRate || 0).replace(/,/g, '')) || 0;
                        const rateI = parseFloat(String(field === 'infantRate' ? value : c.infantRate || 0).replace(/,/g, '')) || 0;

                        const computed = (adultsAff * rateAff) + (adultsNon * rateNon) + (children * rateC) + (infants * rateI);
                        newCabin.totalToPay = computed > 0 ? computed.toFixed(2) : '';
                    }

                    return newCabin;
                }
                return c;
            }));
        };

        const handleCabinImageChange = async (cabinId, e) => {
            const compressed = await processImageUpload(e);
            if (compressed) {
                setCruiseCabins(prev => prev.map(c => c.id === cabinId ? { ...c, image: compressed } : c));
            }
        };

        // Handlers for itinerary
        const addItineraryRow = () => {
            setCruiseItinerary(prev => [...prev, { day: '', date: '', port: '', arr: '', dep: '' }]);
        };

        const removeItineraryRow = (index) => {
            if (cruiseItinerary.length > 1) {
                setCruiseItinerary(prev => prev.filter((_, i) => i !== index));
            }
        };

        const handleItineraryChange = (index, field, value) => {
            setCruiseItinerary(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
        };

        const addCruiseFlight = () => setCruiseFlights(prev => [...prev, { id: Date.now(), airline: '', flight: '', dep: '', depDate: '', arr: '', arrDate: '', duration: '', aircraft: '' }]);
        const handleCruiseFlightChange = (id, field, value) => setCruiseFlights(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
        const removeCruiseFlight = (id) => setCruiseFlights(prev => prev.filter(f => f.id !== id));
        const cruiseValid = () => {
            if (includeAirInCruise) {
                return cruiseFlights.length > 0 && cruiseFlights.every(f =>
                    [f.airline, f.flight, f.dep, f.depDate, f.arr, f.arrDate, f.duration, f.aircraft].every(v => String(v || '').trim() !== '')
                );
            }
            return true;
        };

        const handleGenerateCruisePdf = async () => {
            setIsSaving(true);
            setSaveStatus('Guardando...');
            try {
                let folio = previewFolio;
                // Strict Folio rule: Always fetch the absolute latest if this is a brand new quote (no _v version suffix)
                if (!folio || !folio.includes('_v')) {
                    folio = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || quoteType || 'nacional'));
                    setPreviewFolio(folio);
                }

                // 1. Preparar Cabinas como "Hoteles" para el PDF
                const cabins = cruiseCabins.map(c => ({
                    name: cruiseData.plan,
                    room: c.title,
                    observaciones: c.observaciones || '',
                    images: c.image ? [c.image] : [],
                    showGallery: !!c.image,
                    pricing: {
                        adultAffiliateRate: c.adultAffiliateRate,
                        adultNonAffiliateRate: c.adultNonAffiliateRate,
                        childRate: c.childRate,
                        infantRate: c.infantRate,
                        totalToPay: c.totalToPay
                    }
                }));

                // 2. Preparar Vuelos si aplica
                let flightsForPdf = [];
                if (includeAirInCruise) {
                    flightsForPdf = cruiseFlights.map(f => ({
                        airline: f.airline,
                        flight: f.flight,
                        route: `${f.dep} > ${f.arr}`,
                        departure: `${f.dep} ${f.depDate}`,
                        arrival: `${f.arr} ${f.arrDate}`,
                        duration: f.duration,
                        equipment: f.aircraft
                    }));
                }

                const payload = {
                    folio,
                    clientName: cruiseData.clientName || 'Cliente (Crucero)',
                    clientEmail: cruiseData.clientEmail || '',
                    clientPhone: cruiseData.clientPhone || '',
                    destination: cruiseData.destination,
                    suggestedDates: cruiseData.suggestedDates,
                    adults: (parseInt(cruiseData.adultsAffiliate) || 0) + (parseInt(cruiseData.adultsNonAffiliate) || 0),
                    adultsAffiliate: cruiseData.adultsAffiliate,
                    adultsNonAffiliate: cruiseData.adultsNonAffiliate,
                    children: cruiseData.passengers_children,
                    infants: cruiseData.passengers_infants,
                    cruiseData,
                    cruiseItinerary,
                    notes: 'Tarifas por cabina doble. Sujeto a disponibilidad.',
                    hotels: cabins,
                    flights: flightsForPdf,
                    corporateBrand: activeCorporateBrand,
                    advisorName,
                    advisorRole,
                    generalConditions,
                    quoteType: 'cruceros',
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    currency,
                    closingNote,
                    mainPhoto: cruiseData.mainPhoto
                };

                const result = await QuotesApi.createQuote(payload, user);
                if (result.ok) {
                    generateQuotePdf({
                        ...payload
                    });
                    setSaveStatus('¡Listo!');
                } else {
                    setSaveStatus('Error: ' + result.error);
                }

            } catch (error) {
                setSaveStatus("Error crítico al procesar crucero.");

            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveStatus(''), 3000);
            }
        };
        return (
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 max-w-5xl mx-auto space-y-8 animate-fade-in relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* ENCABEZADO Y DATOS DE RUTA */}
                {/* ENCABEZADO PREMIUM */}
                <div className="flex flex-col md:flex-row gap-4 mb-2">
                    <div className="flex-1 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-[1px] rounded-2xl shadow-xl shadow-amber-900/20 group overflow-hidden">
                        <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-[15px] h-full flex items-center justify-between group-hover:bg-slate-900/80 transition-all">
                            <div>
                                <p className="text-[10px] text-amber-500/80 font-black uppercase tracking-[0.2em] mb-1">Documento Oficial</p>
                                <h2 className="text-xl font-black text-white flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-amber-500" />
                                    No {previewFolio || 'COT-2026-0456'}
                                </h2>
                            </div>
                            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                <FileText className="w-6 h-6 text-amber-500" />
                            </div>
                        </div>
                    </div>
                    <div className="md:w-64 bg-slate-800/40 backdrop-blur-md p-[1px] rounded-2xl border border-slate-700/50 shadow-lg group">
                        <div className="bg-slate-900/40 p-4 rounded-[15px] flex items-center justify-between h-full">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Fecha Emisión</p>
                                <p className="text-lg font-black text-slate-200 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    {new Date().toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative group/container">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-3xl blur opacity-25 group-hover/container:opacity-40 transition duration-1000"></div>

                    <div className="relative bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 space-y-8 shadow-2xl">
                        {/* DATOS DEL CLIENTE (NUEVO) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-700/30 pb-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="w-4 h-4 text-amber-500" />
                                    <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Nombre Completo del Cliente</label>
                                </div>
                                <input
                                    readOnly={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl p-4 text-white font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                    placeholder="Nombre del Cliente"
                                    value={cruiseData.clientName}
                                    onChange={e => setCruiseData({ ...cruiseData, clientName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Briefcase className="w-4 h-4 text-amber-500" />
                                    <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Empresa / Razón Social</label>
                                </div>
                                <input
                                    readOnly={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl p-4 text-white font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                    placeholder="Nombre de la Empresa (Opcional)"
                                    value={cruiseData.company}
                                    onChange={e => setCruiseData({ ...cruiseData, company: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* DATOS PRINCIPALES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-cyan-500" />
                                    <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Destino del Viaje</label>
                                </div>
                                <input
                                    readOnly={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl p-4 text-white font-bold text-lg focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                    placeholder="Ej: Crucero por el Caribe"
                                    value={cruiseData.destination}
                                    onChange={e => setCruiseData({ ...cruiseData, destination: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Calendar className="w-4 h-4 text-cyan-500" />
                                    <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Fecha Sugerida de Viaje</label>
                                </div>
                                <input
                                    readOnly={isReadOnly}
                                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-xl p-4 text-white transition-all focus:border-cyan-500 outline-none placeholder:text-slate-700 shadow-inner"
                                    placeholder="Ej: Mediados de Julio 2026"
                                    value={cruiseData.suggestedDates}
                                    onChange={e => setCruiseData({ ...cruiseData, suggestedDates: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Distribución de Pasajeros</label>
                                </div>
                                <div className="grid grid-cols-4 gap-3 bg-slate-950/40 border border-slate-800 p-3 rounded-2xl shadow-inner relative overflow-hidden group/paxbox">
                                    {[
                                        { key: 'adultsAffiliate', label: 'Afil.', icon: ShieldCheck, color: 'text-emerald-400' },
                                        { key: 'adultsNonAffiliate', label: 'No Afil.', icon: User, color: 'text-blue-400' },
                                        { key: 'passengers_children', label: 'Niños', icon: Users2, color: 'text-amber-400' },
                                        { key: 'passengers_infants', label: 'Inf.', icon: Baby, color: 'text-pink-400' }
                                    ].map((pax) => (
                                        <div key={pax.key} className="flex flex-col gap-2 items-center group/pax">
                                            <div className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover/pax:border-slate-700 transition-colors`}>
                                                <pax.icon className={`w-3.5 h-3.5 ${pax.color}`} />
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                readOnly={isReadOnly}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-1 text-white text-sm font-bold text-center focus:border-cyan-500 outline-none transition-all hover:bg-slate-800"
                                                value={cruiseData[pax.key]}
                                                onChange={e => setCruiseData({ ...cruiseData, [pax.key]: e.target.value })}
                                                onFocus={e => e.target.select()}
                                            />
                                            <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">{pax.label}</span>
                                        </div>
                                    ))}
                                    {/* Total People Indicator */}
                                    <div className="col-span-4 mt-2 pt-2 border-t border-slate-800 flex justify-between items-center px-1">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase">Total Personas:</span>
                                        <span className="text-sm font-black text-cyan-400">
                                            {(parseInt(cruiseData.adultsAffiliate) || 0) +
                                                (parseInt(cruiseData.adultsNonAffiliate) || 0) +
                                                (parseInt(cruiseData.passengers_children) || 0) +
                                                (parseInt(cruiseData.passengers_infants) || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DETALLES TECNICOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-700/30">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Ship className="w-4 h-4 text-indigo-400" />
                                    <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Plan o Naviera</label>
                                </div>
                                <input
                                    readOnly={isReadOnly}
                                    className="w-full bg-slate-950/30 border border-slate-700/60 rounded-xl p-3 text-slate-200 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                    placeholder="Ej: Costa Cruises (Fascinosa)"
                                    value={cruiseData.plan}
                                    onChange={e => setCruiseData({ ...cruiseData, plan: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Utensils className="w-4 h-4 text-purple-400" />
                                    <label className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Acomodación Sugerida</label>
                                </div>
                                <input
                                    readOnly={isReadOnly}
                                    className="w-full bg-slate-950/30 border border-slate-700/60 rounded-xl p-3 text-slate-200 focus:border-purple-500 outline-none transition-all shadow-sm"
                                    placeholder="Ej: 1 Cabina Doble"
                                    value={cruiseData.accommodation}
                                    onChange={e => setCruiseData({ ...cruiseData, accommodation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center mb-8 px-4">
                    <div className="relative aspect-video w-full max-w-2xl rounded-3xl overflow-hidden group shadow-2xl border border-slate-700/50 bg-slate-900">
                        <img
                            src={cruiseData.mainPhoto || DEFAULT_IMAGES.CRUISE}
                            alt="Crucero"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 pointer-events-none"></div>
                        <div className="absolute bottom-6 left-8">
                            <p className="text-white font-black text-2xl tracking-tighter uppercase mb-1 drop-shadow-lg">Experiencia en Alta Mar</p>
                            <p className="text-cyan-400 font-bold text-xs uppercase tracking-[0.2em] drop-shadow-lg">Explora nuevos horizontes</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 px-8 rounded-2xl shadow-2xl shadow-cyan-900/50 transform -translate-y-4 group-hover:translate-y-0 transition-all duration-500 uppercase tracking-widest text-xs flex flex-col items-center gap-2">
                                <Camera className="w-5 h-5" />
                                <span>Cambiar Foto del Crucero</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const compressed = await processImageUpload(e);
                                        if (compressed) setCruiseData(prev => ({ ...prev, mainPhoto: compressed }));
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* ITINERARIO DEL CRUCERO */}
                <section className="mt-6 flex flex-col items-center">
                    <div className="w-full max-w-2xl">
                        <h3 className="text-cyan-400 font-black text-[11px] uppercase tracking-[0.4em] mb-4 text-center border-b border-slate-800 pb-4">
                            Itinerario del Crucero
                        </h3>
                        <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-2xl bg-slate-950/20">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-slate-900/80 text-slate-500 uppercase font-black tracking-widest text-[9px]">
                                    <tr>
                                        <th className="p-4 text-center w-16">Día</th>
                                        <th className="p-4">Fecha</th>
                                        <th className="p-4">Puerto / Destino</th>
                                        <th className="p-4 text-center">Llegada</th>
                                        <th className="p-4 text-center">Salida</th>
                                        <th className="p-4 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {cruiseItinerary.map((row, i) => (
                                        <tr key={i} className="hover:bg-cyan-500/5 transition-colors group border-b border-slate-800/30">
                                            <td className="p-4 font-mono text-cyan-500/80 font-bold">
                                                <input
                                                    readOnly={isReadOnly}
                                                    className="bg-transparent w-full outline-none text-center"
                                                    value={row.day}
                                                    placeholder="#"
                                                    onChange={e => handleItineraryChange(i, 'day', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4 text-slate-300">
                                                <input
                                                    readOnly={isReadOnly}
                                                    className="bg-transparent w-full outline-none"
                                                    value={row.date}
                                                    placeholder="01-01 lun"
                                                    onChange={e => handleItineraryChange(i, 'date', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Map className="w-3 h-3 text-cyan-500/40" />
                                                    <input
                                                        readOnly={isReadOnly}
                                                        className="bg-transparent w-full outline-none font-bold uppercase text-white placeholder:text-slate-800"
                                                        value={row.port}
                                                        placeholder="PUERTO"
                                                        onChange={e => handleItineraryChange(i, 'port', e.target.value)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-4 text-center text-slate-400">
                                                <input
                                                    className="bg-transparent w-full outline-none text-center font-mono text-[10px]"
                                                    value={row.arr}
                                                    placeholder="00:00"
                                                    onChange={e => handleItineraryChange(i, 'arr', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4 text-center text-slate-400">
                                                <input
                                                    className="bg-transparent w-full outline-none text-center font-mono text-[10px]"
                                                    value={row.dep}
                                                    placeholder="00:00"
                                                    onChange={e => handleItineraryChange(i, 'dep', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                {cruiseItinerary.length > 1 && !isReadOnly && (
                                                    <button onClick={() => removeItineraryRow(i)} className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {!isReadOnly && (
                                <button
                                    onClick={addItineraryRow}
                                    className="w-full py-4 bg-slate-900/50 hover:bg-cyan-500/10 text-slate-500 hover:text-cyan-400 text-[10px] font-black transition-all border-t border-slate-800 uppercase tracking-[0.2em]"
                                >
                                    + Agregar Nuevo Puerto
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* OPCIONES DE CABINA */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col gap-1">
                            <h3 className="text-cyan-400 font-bold text-lg uppercase tracking-wider flex items-center gap-2">
                                <Ship className="w-5 h-5" /> Opciones de Alojamiento y Precios
                            </h3>
                            <p className="text-slate-500 text-xs">Configure las tarifas individuales para cada tipo de cabina.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Selector de Moneda */}
                            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-700/50 shadow-inner">
                                {['COP', 'USD'].map((curr) => (
                                    <button
                                        key={curr}
                                        onClick={() => setCurrency(curr)}
                                        className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${currency === curr
                                            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                                            : 'text-slate-500 hover:text-slate-300'
                                            }`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>

                            <label className="inline-flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded accent-cyan-500" checked={includeAirInCruise} disabled={isReadOnly} onChange={e => setIncludeAirInCruise(e.target.checked)} />
                                <span className="text-[11px] uppercase tracking-tight">Incluír Aéreos</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {cruiseCabins.map((cabin, idx) => (
                            <div key={cabin.id} className="bg-slate-900/60 rounded-3xl border border-slate-700/50 overflow-hidden relative group/cabin transition-all hover:border-cyan-500/30">
                                {/* Header: Opción X */}
                                <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-cyan-600/20 flex items-center justify-center text-cyan-400 font-black text-sm border border-cyan-500/20">
                                            {idx + 1}
                                        </div>
                                        <h4 className="text-white font-black text-sm uppercase tracking-widest">Opción {idx + 1}</h4>
                                    </div>
                                    {!isReadOnly && cruiseCabins.length > 1 && (
                                        <button
                                            onClick={() => setCruiseCabins(prev => prev.filter(c => c.id !== cabin.id))}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Columna de Datos de Cabina */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Tipo de Cabina</label>
                                                <input
                                                    readOnly={isReadOnly}
                                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm uppercase outline-none focus:border-cyan-500/50"
                                                    value={cabin.title}
                                                    onChange={e => setCruiseCabins(prev => prev.map(c => c.id === cabin.id ? { ...c, title: e.target.value.toUpperCase() } : c))}
                                                    placeholder="INTERIOR / EXTERIOR"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5 ml-1">Observaciones / Régimen</label>
                                                <textarea
                                                    readOnly={isReadOnly}
                                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 text-xs outline-none resize-none focus:border-cyan-500/50 h-[84px]"
                                                    value={cabin.observaciones}
                                                    onChange={e => setCruiseCabins(prev => prev.map(c => c.id === cabin.id ? { ...c, observaciones: e.target.value } : c))}
                                                    placeholder="Ej: Pensión completa, programas incluidos..."
                                                />
                                            </div>

                                            {/* Foto de Cabina */}
                                            <div className="pt-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-tight flex items-center gap-2 ml-1">
                                                        <Camera className="w-3 h-3 text-cyan-500" /> Galería de Fotos
                                                    </label>
                                                </div>
                                                <div className="relative group w-full h-32 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                                                    <img src={cabin.image || DEFAULT_IMAGES.CRUISE} alt="Cabin" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                                                    {!isReadOnly && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                            <label className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-cyan-900/40">
                                                                Cambiar Foto
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCabinImageChange(cabin.id, e)} />
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Columna de Precios */}
                                        <div className="bg-slate-950/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                                            <div className="flex items-center justify-between mb-4 border-b border-slate-800/50 pb-3">
                                                <h5 className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em]">Cálculo de Inversión</h5>
                                                <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 shadow-sm shadow-cyan-500/5 shrink-0">
                                                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                                                    <span className="text-[10px] font-black text-cyan-300 tracking-wider">
                                                        {(parseInt(cruiseData.adultsAffiliate) || 0) + (parseInt(cruiseData.adultsNonAffiliate) || 0) + (parseInt(cruiseData.passengers_children) || 0) + (parseInt(cruiseData.passengers_infants) || 0)} PAX
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Tarifas */}
                                                {[
                                                    { key: 'adultAffiliateRate', label: 'Adulto Afiliado', count: cruiseData.adultsAffiliate },
                                                    { key: 'adultNonAffiliateRate', label: 'Adulto No Afil.', count: cruiseData.adultsNonAffiliate },
                                                    { key: 'childRate', label: 'Niño', count: cruiseData.passengers_children },
                                                    { key: 'infantRate', label: 'Infante', count: cruiseData.passengers_infants }
                                                ].filter(pax => pax.count > 0 || cabin[pax.key] > 0).map(pax => (
                                                    <div key={pax.key} className="flex items-center justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1 px-1">
                                                                <span className="text-[8px] text-slate-500 font-bold uppercase">{pax.label}</span>
                                                                <span className="text-[8px] text-slate-600">× {pax.count}</span>
                                                            </div>
                                                            <div className="relative group">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] group-focus-within:text-cyan-400 pt-0.5">$</span>
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-6 py-1.5 text-white text-xs font-bold outline-none focus:border-cyan-500/50 focus:bg-slate-900 transition-all"
                                                                    value={cabin[pax.key]}
                                                                    onChange={e => handleCabinPricingChange(cabin.id, pax.key, e.target.value)}
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Total Tarifa Individual */}
                                            <div className="mt-4 pt-4 border-t border-slate-800">
                                                <div className="flex justify-between items-baseline mb-2 px-1">
                                                    <span className="text-[9px] text-slate-500 font-black uppercase">Total Opción</span>
                                                    <span className="text-[10px] text-cyan-400 font-bold">{currency}</span>
                                                </div>
                                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[90px] w-full overflow-hidden">
                                                    {cabin.isTotalManual ? (
                                                        <input
                                                            type="number"
                                                            className="w-full bg-transparent text-center text-2xl font-black text-white outline-none"
                                                            value={cabin.totalToPay}
                                                            onChange={e => handleCabinPricingChange(cabin.id, 'totalToPay', e.target.value)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <div className={`font-black text-white text-center break-all w-full transition-all duration-300 ${String(cabin.totalToPay).length > 15 ? 'text-lg' :
                                                            String(cabin.totalToPay).length > 12 ? 'text-xl' :
                                                                String(cabin.totalToPay).length > 9 ? 'text-2xl' : 'text-3xl'
                                                            }`}>
                                                            {parseFloat(cabin.totalToPay || 0).toLocaleString()}
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => handleCabinPricingChange(cabin.id, 'isTotalManual', !cabin.isTotalManual)}
                                                        className={`mt-2 text-[8px] font-black uppercase tracking-widest transition-all ${cabin.isTotalManual ? 'text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded' : 'text-slate-600 hover:text-slate-400'}`}
                                                    >
                                                        {cabin.isTotalManual ? 'Ajuste Manual Activo' : 'Ajuste Manual'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setCruiseCabins(prev => [...prev, {
                                id: Date.now(),
                                title: '',
                                observaciones: '',
                                image: null,
                                adultAffiliateRate: '',
                                adultNonAffiliateRate: '',
                                childRate: '',
                                infantRate: '',
                                totalToPay: '',
                                isTotalManual: false
                            }])}
                            disabled={isReadOnly}
                            className={`border-2 border-dashed border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-cyan-400 hover:border-cyan-500/30 transition-all min-h-[400px] bg-slate-900/20 group/add`}
                        >
                            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center group-hover/add:scale-110 transition-transform">
                                <Plus className="w-8 h-8 opacity-50" />
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-black uppercase block">Agregar Nueva Opción</span>
                                <span className="text-[10px] opacity-40">Añadir variante de alojamiento</span>
                            </div>
                        </button>
                    </div>
                </section>

                {/* ITINERARIO AÉREO DETALLADO (Opcional) */}
                {
                    includeAirInCruise && (
                        <section>
                            <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Plane className="w-4 h-4" /> Itinerario Aéreo Detallado
                            </h3>
                            <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-800/70 text-slate-300">
                                        <tr>
                                            <th className="p-3 tracking-widest uppercase text-[10px]">Aerolínea</th>
                                            <th className="p-3 tracking-widest uppercase text-[10px]">Vuelo</th>
                                            <th className="p-3 tracking-widest uppercase text-[10px]">Salida</th>
                                            <th className="p-3 tracking-widest uppercase text-[10px]">Llegada</th>
                                            <th className="p-3 tracking-widest uppercase text-[10px]">Duración</th>
                                            <th className="p-3 tracking-widest uppercase text-[10px]">Avión</th>
                                            <th className="p-3"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {cruiseFlights.map(f => (
                                            <tr key={f.id} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center overflow-hidden p-1 ring-1 ring-white/60">
                                                            <img src={f.airline?.toLowerCase().includes('avi') ? 'https://logo.clearbit.com/avianca.com' : 'https://logo.clearbit.com/iberia.com'} alt="Airline" className="w-full h-full object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                                        </div>
                                                        <input readOnly={isReadOnly} value={f.airline} onChange={e => handleCruiseFlightChange(f.id, 'airline', e.target.value)} placeholder="IBERIA" className="bg-transparent text-white outline-none w-24 font-bold uppercase" />
                                                    </div>
                                                </td>
                                                <td className="p-3"><input readOnly={isReadOnly} value={f.flight} onChange={e => handleCruiseFlightChange(f.id, 'flight', e.target.value)} placeholder="IB6588" className="bg-transparent text-slate-300 outline-none w-full font-mono" /></td>
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <input readOnly={isReadOnly} value={f.dep} onChange={e => handleCruiseFlightChange(f.id, 'dep', e.target.value)} placeholder="BOG - 18:00" className="bg-transparent text-white font-bold outline-none w-full" />
                                                        <input readOnly={isReadOnly} type="date" value={f.depDate} onChange={e => handleCruiseFlightChange(f.id, 'depDate', e.target.value)} className="bg-transparent text-xs text-slate-400 outline-none w-full" />
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-col">
                                                        <input readOnly={isReadOnly} value={f.arr} onChange={e => handleCruiseFlightChange(f.id, 'arr', e.target.value)} placeholder="MAD - 10:30" className="bg-transparent text-white font-bold outline-none w-full" />
                                                        <input readOnly={isReadOnly} type="date" value={f.arrDate} onChange={e => handleCruiseFlightChange(f.id, 'arrDate', e.target.value)} className="bg-transparent text-xs text-slate-400 outline-none w-full" />
                                                    </div>
                                                </td>
                                                <td className="p-3"><input readOnly={isReadOnly} value={f.duration} onChange={e => handleCruiseFlightChange(f.id, 'duration', e.target.value)} placeholder="9h 30m" className="bg-transparent text-slate-300 outline-none w-full" /></td>
                                                <td className="p-3"><input readOnly={isReadOnly} value={f.aircraft} onChange={e => handleCruiseFlightChange(f.id, 'aircraft', e.target.value)} placeholder="A350-900" className="bg-transparent text-slate-300 outline-none w-full" /></td>
                                                <td className="p-3 text-right"><button onClick={() => removeCruiseFlight(f.id)} disabled={isReadOnly} className={`text-slate-600 hover:text-red-400 ${isReadOnly ? 'cursor-not-allowed' : ''}`}><Trash2 className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button onClick={addCruiseFlight} disabled={isReadOnly} className={`w-full py-3 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors border-t border-slate-700/50 uppercase tracking-widest ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    + Agregar Trayecto
                                </button>
                            </div>
                        </section>
                    )
                }

                {/* INCLUSIONES Y EXCLUSIONES */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-sm border-b border-emerald-500/30 pb-2">Incluye</h3>
                        <ul className="space-y-2">
                            {['Alojamiento a bordo del barco', 'Desayuno, almuerzo, cena y refrigerios', 'Bebidas de dispensador en buffet', 'Espectáculos y actividades a bordo', 'Propinas', 'Seguro de asistencia médica y cancelación'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-red-400 uppercase tracking-wider text-sm border-b border-red-500/30 pb-2">No Incluye</h3>
                        <ul className="space-y-2">
                            {['Tiquetes aéreos', 'Traslados y Excursiones en puertos', 'Bebidas alcohólicas y no alcohólicas', 'Restaurantes de especialidad', 'Gastos personales (lavandería, teléfono)', 'Impuestos de puerto'].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                    <span className="w-4 h-4 flex items-center justify-center rounded-full bg-red-500/10 text-red-500 text-xs font-bold mt-0.5 shrink-0">✕</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* NOTAS Y LEGALES */}
                <div className="space-y-6 pt-6 border-t border-slate-700/50">
                    <p className="text-red-400 font-bold text-center uppercase text-sm animate-pulse">
                        Nota: Disponibilidad y tarifas sujetas a cambio sin previo aviso
                    </p>

                    {/* SECCIÓN DE OBSERVACIONES Y CONDICIONES (Estilo Estándar del Sistema) */}
                    <div className="space-y-6">

                        {/* OBSERVACIONES IMPORTANTES (Estilo Rojo/Alerta) */}
                        <section className="bg-red-900/10 border border-red-500/30 p-6 rounded-xl">
                            <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Observaciones Importantes
                            </h3>
                            <div className="text-red-200/80 text-sm mb-4 space-y-1">
                                <p className="font-bold">Aplica penalidad por cambios y cancelaciones.</p>
                                <p>Después de emitido el tiquete todo cambio genera penalidad.</p>
                                <p>Los reembolsos solo aplican si las condiciones de la tarifa lo permiten y estarán sujetos a gastos administrativos y penalidades.</p>
                            </div>
                        </section>

                        {/* CONDICIONES GENERALES (Rediseñado: Unificado y Editable) */}
                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                            <div className="flex justify-between items-center mb-4 pl-4">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" /> Condiciones Generales
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingConditions(!isEditingConditions)}
                                    className={`p-2 rounded-lg transition-all ${isEditingConditions ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                                    title="Editar condiciones específicas para esta cotización"
                                >
                                    <Settings className={`w-4 h-4 ${isEditingConditions ? 'animate-spin-slow' : ''}`} />
                                </button>
                            </div>

                            <div className="pl-4">
                                {isEditingConditions ? (
                                    <textarea
                                        className="w-full bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-64 font-mono"
                                        value={generalConditions}
                                        onChange={(e) => setGeneralConditions(e.target.value)}
                                        placeholder="Ingrese las condiciones particulares..."
                                    />
                                ) : (
                                    <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                                        <pre className="whitespace-pre-wrap text-slate-400 text-xs leading-relaxed font-sans">
                                            {generalConditions}
                                        </pre>
                                    </div>
                                )}
                                <p className="mt-3 text-[10px] text-slate-500 italic flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" />
                                    {isEditingConditions ? 'Los cambios aplicarán solo a este crucero.' : 'Texto legal estándar protegido. Use el botón de edición para cambios puntuales.'}
                                </p>
                            </div>
                        </section>

                        {/* RECOMMENDATIONS SECTION */}

                        {/* RECOMMENDATIONS SECTION */}
                        <section className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-8 mt-12 relative overflow-hidden group/recommendations">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none group-hover/recommendations:bg-cyan-500/10 transition-all duration-700"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                        <Plus className="w-5 h-5 text-cyan-400" /> Potencia tu experiencia
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1">Sugerencias recomendadas para complementar este crucero.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    { icon: Plane, label: 'Tiquetes Aéreos', desc: 'Conexión garantizada al puerto.', color: 'blue' },
                                    { icon: Briefcase, label: 'Seguro de Viaje', desc: 'Cobertura médica internacional.', color: 'emerald' },
                                    { icon: Utensils, label: 'Paquete Bebidas', desc: 'Bar abierto y experiencias premium.', color: 'amber' },
                                    { icon: MapPin, label: 'Excursiones', desc: 'Tours guiados en cada puerto.', color: 'purple' }
                                ].map((rec, i) => (
                                    <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 hover:border-cyan-500/30 transition-all cursor-pointer group/recitem">
                                        <div className={`w-10 h-10 rounded-xl bg-${rec.color}-500/10 flex items-center justify-center mb-3 group-hover/recitem:scale-110 transition-transform`}>
                                            <rec.icon className={`w-5 h-5 text-${rec.color}-400`} />
                                        </div>
                                        <h4 className="text-white font-bold text-sm mb-1">{rec.label}</h4>
                                        <p className="text-slate-500 text-[10px] leading-relaxed">{rec.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* NOTA ACLARATORIA (Cierre Obligatorio) */}
                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all mt-6">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                            <div className="flex justify-between items-center mb-4 pl-4">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" /> Nota Aclaratoria
                                </h3>
                                {!isReadOnly && (
                                    <button
                                        onClick={() => setIsEditingClosingNote(!isEditingClosingNote)}
                                        className="text-[10px] text-blue-400 font-bold uppercase hover:text-blue-300 transition-colors flex items-center gap-1"
                                    >
                                        <Settings className="w-3 h-3" /> {isEditingClosingNote ? 'Guardar' : 'Editar'}
                                    </button>
                                )}
                            </div>

                            <div className="pl-4">
                                {isEditingClosingNote && !isReadOnly ? (
                                    <textarea
                                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-40 resize-none custom-scrollbar italic"
                                        value={closingNote}
                                        onChange={(e) => setClosingNote(e.target.value)}
                                    />
                                ) : (
                                    <div className="text-slate-400 text-xs leading-relaxed italic whitespace-pre-line">
                                        {closingNote.split('Destinos P&P').map((part, i, arr) => (
                                            <React.Fragment key={i}>
                                                {part}
                                                {i < arr.length - 1 && <strong className="text-blue-400 not-italic">Destinos P&P</strong>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
                            {(isReadOnly || user?.modules?.vacacional === 'read') ? (
                                <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-500/30 px-6 py-3 rounded-2xl text-amber-400 font-bold text-sm shadow-xl">
                                    <ShieldCheck className="w-5 h-5" />
                                    MODO LECTURA {(isReadOnly && !user?.modules?.vacacional === 'read') ? '(COTIZACIÓN AJENA)' : '(GERENCIA)'}
                                </div>
                            ) : (
                                <React.Fragment>
                                    {!isReadOnly && (
                                        <button
                                            onClick={handleGenerateCruisePdf}
                                            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-xs transition-all"
                                        >
                                            Guardar Borrador
                                        </button>
                                    )}
                                    <button
                                        className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${cruiseValid() ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-900/20' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                        disabled={!cruiseValid()}
                                        title={!cruiseValid() ? 'Complete los campos obligatorios de cabina/itinerario aéreo' : ''}
                                        onClick={handleGenerateCruisePdf}
                                    >
                                        Generar PDF Crucero ({currency})
                                    </button>
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const AccommodationQuoteForm = () => {
        const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
        const quoteType = isCorporateModule ? 'corporativo' : 'vacacional';
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');
        const [currency, setCurrency] = useState('COP');

        const [clientData, setClientData] = useState({
            name: '',
            company: '', // Usamos company primariamente
            id: '',
            phone: '',
            email: ''
        });

        const [options, setOptions] = useState([
            {
                id: Date.now(),
                hotelName: '',
                location: '',
                images: [DEFAULT_IMAGES.HOTEL],
                nights: [
                    { id: 1, date: '', description: 'Alojamiento habitación sencilla', pax: 1, total: '' }
                ],
                fee: {
                    base: '14496',
                    taxAlojamiento: '0',
                    ivaPercent: 19
                },
                notes: ''
            }
        ]);

        useEffect(() => {
            if (cloneDataRef.current && cloneDataRef.current.quoteType === 'alojamiento') {
                const d = cloneDataRef.current;

                if (d.clientName || d.clientId) {
                    setClientData({
                        name: d.clientName || '',
                        company: d.clientName || '',
                        id: d.clientId || '',
                        phone: d.clientPhone || '',
                        email: d.clientEmail || ''
                    });
                }

                if (d.options) setOptions(d.options);
                if (d.currency) setCurrency(d.currency);
                // Clear clone data after loading
                cloneDataRef.current = null;
            }
        }, []);

        const addOption = () => {
            setOptions([...options, {
                id: Date.now(),
                hotelName: '',
                location: '',
                images: [DEFAULT_IMAGES.HOTEL],
                nights: [{ id: Date.now() + 1, date: '', description: 'Alojamiento habitación sencilla', pax: 1, total: '' }],
                fee: { base: '14496', taxAlojamiento: '0', ivaPercent: 19 },
                notes: ''
            }]);
        };

        const removeOption = (id) => {
            if (options.length > 1) {
                setOptions(options.filter(o => o.id !== id));
            }
        };

        const updateOption = (id, field, value) => {
            setOptions(options.map(o => o.id === id ? { ...o, [field]: value } : o));
        };

        const addNight = (optionId) => {
            setOptions(options.map(o => {
                if (o.id === optionId) {
                    const nextId = o.nights.length > 0 ? Math.max(...o.nights.map(n => n.id)) + 1 : 1;
                    return { ...o, nights: [...o.nights, { id: nextId, date: '', description: 'Alojamiento habitación sencilla', pax: 1, total: '' }] };
                }
                return o;
            }));
        };

        const removeNight = (optionId, nightId) => {
            setOptions(options.map(o => o.id === optionId ? { ...o, nights: o.nights.filter(n => n.id !== nightId) } : o));
        };

        const updateNight = (optionId, nightId, field, value) => {
            setOptions(options.map(o => {
                if (o.id === optionId) {
                    return {
                        ...o,
                        nights: o.nights.map(n => n.id === nightId ? { ...n, [field]: value } : n)
                    };
                }
                return o;
            }));
        };

        const calculateOptionTotals = (option) => {
            const subtotalAlojamiento = option.nights.reduce((acc, n) => acc + (parseFloat(String(n.total).replace(/,/g, '')) || 0), 0);
            const feeBase = parseFloat(String(option.fee.base).replace(/,/g, '')) || 0;
            const feeTaxAlo = parseFloat(String(option.fee.taxAlojamiento).replace(/,/g, '')) || 0;
            const feeIva = feeBase * (option.fee.ivaPercent / 100);
            const totalFee = feeBase + feeTaxAlo + feeIva;
            const totalAPagar = subtotalAlojamiento + totalFee;

            return {
                subtotalAlojamiento,
                feeBase,
                feeTaxAlo,
                feeIva,
                totalFee,
                totalAPagar
            };
        };

        const handleImageUpload = async (optionId, e, targetIndex = null) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;

            const compressed = await compressImage(files[0]);
            setOptions(prev => prev.map(o => {
                if (o.id === optionId) {
                    let newImages = [...o.images];
                    if (targetIndex !== null && targetIndex < newImages.length) {
                        newImages[targetIndex] = compressed;
                    } else if (newImages.length < 3) {
                        newImages.push(compressed);
                    }
                    return { ...o, images: newImages };
                }
                return o;
            }));
        };

        const handleGeneratePdf = async () => {
            setIsSaving(true);
            try {
                let folio = previewFolio;
                // EMERGENCY RULE: Async fallback handled
                if (!folio || folio.startsWith('TEMP')) {

                    folio = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || quoteType || 'nacional'));
                    setPreviewFolio(folio);
                }

                const clientName = clientData.company || clientData.name || 'Cliente_Alojamiento';

                const pdfOpts = {
                    folio,
                    clientName,
                    destination: clientData.destination,
                    options: options.map(o => ({
                        ...o,
                        totals: calculateOptionTotals(o)
                    })),
                    currency,
                    advisorName,
                    advisorRole,
                    quoteType: 'alojamiento',
                    status: 'draft',
                    createdAt: new Date().toISOString()
                };

                const quotePayload = {
                    ...pdfOpts,
                    clientName: clientName,
                    clientId: clientData.id,
                    clientEmail: clientData.email,
                    clientPhone: clientData.phone,
                    clientDestination: clientData.destination,
                };

                await QuotesApi.createQuote(quotePayload, user);
                await generateAccommodationPdf(pdfOpts);

                setSaveStatus('success');
                setTimeout(() => setSaveStatus(''), 3000);
            } catch (error) {

                setSaveStatus('error');
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="space-y-12 animate-fade-in p-2 pb-24">

                {/* CLIENT INFO */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-blue-500">
                        <User className="w-5 h-5" /> Información del Cliente (Alojamiento)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Nombre / Empresa</label>
                            <input
                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                value={clientData.company}
                                onChange={e => setClientData({ ...clientData, company: e.target.value.toUpperCase() })}
                                placeholder="Razón Social o Nombre"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Destino</label>
                            <input
                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                value={clientData.destination || ''}
                                onChange={e => setClientData({ ...clientData, destination: e.target.value.toUpperCase() })}
                                placeholder="Ciudad o País"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">NIT / Identificación</label>
                            <input
                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                value={clientData.id}
                                onChange={e => setClientData({ ...clientData, id: e.target.value })}
                                placeholder="Documento"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Teléfono</label>
                            <input
                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                value={clientData.phone}
                                onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                placeholder="Teléfono"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Email</label>
                            <input
                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                type="email"
                                value={clientData.email}
                                onChange={e => setClientData({ ...clientData, email: e.target.value })}
                                placeholder="Correo"
                            />
                        </div>
                    </div>
                </div>

                {options.map((option, idx) => {
                    const totals = calculateOptionTotals(option);
                    return (
                        <div key={option.id} className="bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl relative overflow-hidden group transition-all hover:border-blue-500/30">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>

                            {/* Header de Opción */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                                            Opción {idx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="NOMBRE DEL HOTEL (Ej: HOTEL BARI BUCARAMANGA)"
                                            className="bg-transparent border-none text-xl font-black text-white outline-none w-full uppercase placeholder:text-slate-600"
                                            value={option.hotelName}
                                            onChange={(e) => updateOption(option.id, 'hotelName', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 pl-1">
                                        <MapPin className="w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Ubicación (Ej: BUCARAMANGA)"
                                            className="bg-transparent border-none text-xs font-bold uppercase outline-none placeholder:text-slate-700"
                                            value={option.location}
                                            onChange={(e) => updateOption(option.id, 'location', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeOption(option.id)}
                                    className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Galería (3 Fotos) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group/img">
                                        {option.images[i] ? (
                                            <>
                                                <img src={option.images[i]} className="w-full h-full object-cover group-hover/img:opacity-50 transition-opacity" alt={`Hotel ${i}`} />
                                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all gap-2">
                                                    <label className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-cyan-900/40">
                                                        Cambiar Foto
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(option.id, e, i)} />
                                                    </label>
                                                    <button
                                                        onClick={() => updateOption(option.id, 'images', option.images.filter((_, imgIdx) => imgIdx !== i))}
                                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                                                <ImageIcon className="w-8 h-8 text-slate-700 mb-2" />
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Añadir Foto</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(option.id, e)} />
                                                <p className="text-[7px] text-slate-500 mt-1 px-4 text-center">{IMAGE_RECOMMENDATIONS.standard}</p>
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Tabla de Noches */}
                            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden mb-8">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800/50 text-[10px] uppercase font-black text-slate-400 border-b border-slate-700">
                                            <th className="px-6 py-4 w-24">Noche #</th>
                                            <th className="px-6 py-4 w-40">Fecha</th>
                                            <th className="px-6 py-4">Descripción</th>
                                            <th className="px-6 py-4 w-24 text-center">PAX</th>
                                            <th className="px-6 py-4 w-48 text-right">Precio Total</th>
                                            <th className="px-4 py-4 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {option.nights.map((night, nIdx) => (
                                            <tr key={night.id} className="hover:bg-blue-500/5 transition-colors group/row">
                                                <td className="px-6 py-3">
                                                    <span className="text-xs font-bold text-slate-500">Noche {nIdx + 1}</span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        placeholder="9-feb"
                                                        className="bg-transparent text-xs text-white outline-none w-full border-b border-transparent focus:border-blue-500/30 font-medium"
                                                        value={night.date}
                                                        onChange={(e) => updateNight(option.id, night.id, 'date', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        className="bg-transparent text-xs text-white outline-none w-full border-b border-transparent focus:border-blue-500/30"
                                                        value={night.description}
                                                        onChange={(e) => updateNight(option.id, night.id, 'description', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="number"
                                                        className="bg-transparent text-xs text-white text-center outline-none w-full border-b border-transparent focus:border-blue-500/30"
                                                        value={night.pax}
                                                        onChange={(e) => updateNight(option.id, night.id, 'pax', e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <span className="text-slate-600 text-xs font-bold">$</span>
                                                        <input
                                                            type="text"
                                                            className="bg-transparent text-xs text-right font-mono text-white outline-none w-full border-b border-transparent focus:border-blue-500/30"
                                                            value={night.total}
                                                            onChange={(e) => updateNight(option.id, night.id, 'total', e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => removeNight(option.id, night.id)} className="text-slate-700 hover:text-red-400 opacity-0 group-hover/row:opacity-100 transition-all">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Salida */}
                                        <tr className="bg-slate-800/20">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-blue-400 uppercase">Salida</span>
                                            </td>
                                            <td className="px-6 py-4" colSpan={3}>
                                                <input
                                                    type="text"
                                                    placeholder="Fecha de salida (Ej: 13-feb)"
                                                    className="bg-transparent text-xs text-slate-400 outline-none w-full font-bold uppercase"
                                                    value={option.checkoutDate || ''}
                                                    onChange={(e) => updateOption(option.id, 'checkoutDate', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">SALIDA</span>
                                            </td>
                                            <td className="px-4 py-4"></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <button
                                    onClick={() => addNight(option.id)}
                                    className="w-full py-4 text-xs font-black text-blue-400 hover:bg-blue-600/10 transition-all border-t border-slate-800 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> AGREGAR NOCHE
                                </button>
                            </div>

                            {/* Detalle de Fee */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Notas y Observaciones</h4>
                                    <textarea
                                        className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-40 resize-none"
                                        placeholder="Ej: Check-out máximo 12:00 PM, Alojamiento con desayuno incluido..."
                                        value={option.notes}
                                        onChange={(e) => updateOption(option.id, 'notes', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1 bg-slate-900/60 rounded-3xl p-8 border border-slate-700/50 shadow-inner">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Sub Total Alojamiento</span>
                                        <span className="text-lg font-black text-white font-mono">${Math.round(totals.subtotalAlojamiento).toLocaleString()}</span>
                                    </div>

                                    <div className="pt-6 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-blue-900 text-blue-400 w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black">FEE</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                                    <span>Honorarios de Gestión</span>
                                                    <span className="text-blue-500">Alojamiento</span>
                                                </div>
                                                <div className="relative group/field">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-8 pr-4 text-right text-white text-sm font-mono outline-none focus:border-blue-500/50 transition-all"
                                                        value={option.fee.base}
                                                        onChange={(e) => updateOption(option.id, 'fee', { ...option.fee, base: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Impuesto Aloj.</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-950/30 border border-slate-800 rounded-xl py-2 px-4 text-right text-slate-400 text-xs font-mono outline-none focus:border-slate-700"
                                                    value={option.fee.taxAlojamiento}
                                                    onChange={(e) => updateOption(option.id, 'fee', { ...option.fee, taxAlojamiento: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">IVA Servicios (19%)</label>
                                                <div className="w-full bg-slate-950/30 border border-slate-800 rounded-xl py-2 px-4 text-right text-slate-400 text-xs font-mono">
                                                    ${Math.round(totals.feeIva).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-between items-center border-t border-slate-800 group-hover:bg-blue-500/5 py-3 px-4 rounded-xl transition-all">
                                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Total Fee Agencia</span>
                                            <span className="text-sm font-black text-blue-400 font-mono">${Math.round(totals.totalFee).toLocaleString()}</span>
                                        </div>

                                        <div className="mt-8 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl p-6 flex justify-between items-center shadow-lg shadow-yellow-900/20">
                                            <span className="text-slate-900 font-black text-sm uppercase tracking-widest">TOTAL A PAGAR</span>
                                            <span className="text-slate-950 font-black text-2xl font-mono">${Math.round(totals.totalAPagar).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Acciones Finales */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-slate-700/50">
                    <button
                        onClick={addOption}
                        className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-700"
                    >
                        <Plus className="w-5 h-5" /> Nueva Opción de Hotel
                    </button>

                    <button
                        onClick={handleGeneratePdf}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-12 py-5 rounded-3xl font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl shadow-blue-900/40 transition-all hover:scale-[1.03] active:scale-[0.98] group"
                    >
                        <FileDown className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                        Generar Cotización Final
                    </button>
                </div>
            </div>
        );
    };

    const EventQuoteForm = () => {
        const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
        const quoteType = isCorporateModule ? 'corporativo' : 'vacacional';
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');
        const [currency, setCurrency] = useState('COP');

        const [clientData, setClientData] = useState({
            name: '',
            company: '', // Usamos company para Razón Social
            id: '',
            phone: '',
            email: ''
        });

        const [eventData, setEventData] = useState({
            location: '',
            date: '',
            optionTitle: '',
            images: [DEFAULT_IMAGES.EVENT],
            notes: ''
        });

        const [passengers, setPassengers] = useState({
            adultsAffiliate: 1,
            adultsNonAffiliate: 0,
            children: 0,
            infants: 0
        });

        const [services, setServices] = useState([
            { id: 1, description: '', quantity: 1, total: '' }
        ]);

        const [accommodation, setAccommodation] = useState([]);
        const [showAccommodation, setShowAccommodation] = useState(false);

        const [finance, setFinance] = useState({
            ivaPercent: 19,
            impoconsumoPercent: 8,
            agencyFeePercent: 8,
            feeIvaPercent: 19
        });

        const addService = () => {
            setServices([...services, { id: Date.now(), name: '', details: '', price: '', image: DEFAULT_IMAGES.EVENT }]);
        };

        const removeService = (id) => {
            setServices(services.filter(s => s.id !== id));
        };

        const updateService = (id, field, value) => {
            setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
        };

        const addRoom = () => {
            setAccommodation([...accommodation, { id: Date.now(), roomType: '', pax: 1, nights: 1, pricePerNight: '', total: '' }]);
        };

        const removeRoom = (id) => {
            setAccommodation(accommodation.filter(a => a.id !== id));
        };

        const updateRoom = (id, field, value) => {
            setAccommodation(accommodation.map(a => a.id === id ? { ...a, [field]: value } : a));
        };

        const calculateTotals = () => {
            const subtotalServices = services.reduce((acc, s) => acc + (parseFloat(String(s.total).replace(/,/g, '')) || 0), 0);
            const ivaAmount = subtotalServices * (finance.ivaPercent / 100);
            const impoconsumoAmount = subtotalServices * (finance.impoconsumoPercent / 100);
            const subtotalEvent = subtotalServices + ivaAmount + impoconsumoAmount;

            const feeAmount = subtotalEvent * (finance.agencyFeePercent / 100);
            const feeIvaAmount = feeAmount * (finance.feeIvaPercent / 100);
            const totalFee = feeAmount + feeIvaAmount;

            const totalEvent = subtotalEvent + totalFee;

            return {
                subtotalServices,
                ivaAmount,
                impoconsumoAmount,
                subtotalEvent,
                feeAmount,
                feeIvaAmount,
                totalFee,
                totalEvent
            };
        };

        const totals = calculateTotals();

        // ===== EFECTO DE RE-COTIZACIÓN (Clonar datos desde Historial) =====
        useEffect(() => {
            if (!cloneDataRef.current) return;
            const d = cloneDataRef.current;

            // Detectar si es tipo evento
            if (d.quoteType === 'eventos' || d.services || d.eventData) {
                // 1. Datos del cliente
                if (d.clientName || d.clientId) {
                    setClientData({
                        name: d.clientName || '',
                        company: d.clientName || '',
                        id: d.clientId || '',
                        phone: d.clientPhone || '',
                        email: d.clientEmail || ''
                    });
                }

                // 2. Datos del evento
                setEventData({
                    location: d.location || d.eventData?.location || '',
                    date: d.date || d.eventData?.date || '',
                    optionTitle: d.optionTitle || d.eventData?.optionTitle || '',
                    images: d.images || d.eventData?.images || [],
                    notes: d.notes || d.eventData?.notes || ''
                });

                if (d.passengers) {
                    setPassengers(d.passengers);
                } else {
                    setPassengers({
                        adultsAffiliate: d.adultsAffiliate ?? 1,
                        adultsNonAffiliate: d.adultsNonAffiliate ?? 0,
                        children: d.children ?? 0,
                        infants: d.infants ?? 0
                    });
                }

                // 2. Servicios
                const incomingServices = d.services || d.eventServices || [];
                if (Array.isArray(incomingServices) && incomingServices.length > 0) {
                    setServices(incomingServices);
                }

                // 3. Alojamiento
                const incomingAcc = d.accommodation || d.eventAccommodation || [];
                if (Array.isArray(incomingAcc) && incomingAcc.length > 0) {
                    setShowAccommodation(true);
                    setAccommodation(incomingAcc);
                }

                // 4. Finanzas
                if (d.finance) {
                    setFinance(prev => ({ ...prev, ...d.finance }));
                }

                // 5. Otros
                if (d.currency) setCurrency(d.currency);

                // 6. Limpiar canal
                cloneDataRef.current = null;
            }
        }, []);

        const handleGenerateEventPdf = async () => {
            setIsSaving(true);
            try {
                let folio = previewFolio;
                // EMERGENCY RULE: Async fallback handled
                if (!folio || folio.startsWith('TEMP')) {

                    folio = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || quoteType || 'nacional'));
                    setPreviewFolio(folio);
                }

                const clientName = clientData.company || clientData.name || 'Cliente_Evento';

                const pdfOpts = {
                    folio,
                    clientName,
                    location: eventData.location,
                    date: eventData.date,
                    optionTitle: eventData.optionTitle,
                    images: eventData.images,
                    services: services.filter(s => s.description.trim() !== ''),
                    accommodation: accommodation,
                    finance: finance,
                    totals: totals,
                    currency: currency,
                    advisorName: advisorName,
                    advisorRole: advisorRole,
                    adults: parseInt(passengers.adultsAffiliate) + parseInt(passengers.adultsNonAffiliate),
                    adultsAffiliate: passengers.adultsAffiliate,
                    adultsNonAffiliate: passengers.adultsNonAffiliate,
                    children: passengers.children,
                    infants: passengers.infants,
                    quoteType: 'eventos',
                    status: 'draft',
                    createdAt: new Date().toISOString()
                };

                const quotePayload = {
                    ...pdfOpts,
                    clientName: clientName,
                    clientId: clientData.id,
                    clientEmail: clientData.email,
                    clientPhone: clientData.phone,
                    destination: eventData.location,
                    // eventData wrapper to keep existing UI happy
                    eventData: {
                        location: eventData.location,
                        date: eventData.date,
                        optionTitle: eventData.optionTitle,
                        images: eventData.images,
                        notes: eventData.notes
                    }
                };

                // Guardar cotización en la base de datos local / historial
                await QuotesApi.createQuote(quotePayload, user);

                await generateEventPdf(pdfOpts);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus(''), 3000);
            } catch (error) {

                setSaveStatus('error');
            } finally {
                setIsSaving(false);
            }
        };



        const handleImageUpload = async (e) => {
            const files = Array.from(e.target.files);
            for (const file of files) {
                const compressed = await compressImage(file);
                setEventData(prev => ({
                    ...prev,
                    images: [...prev.images, compressed]
                }));
            }
        };

        return (
            <form onSubmit={(e) => { e.preventDefault(); handleGenerateEventPdf(); }} className="space-y-8 animate-fade-in p-2 pb-24">
                {/* CLIENT INFO */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-pink-500">
                        <User className="w-5 h-5" /> Información del Cliente (Evento)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Nombre / Empresa</label>
                            <input tabIndex={1} className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-pink-500 transition-all text-white" value={clientData.company} onChange={e => setClientData({ ...clientData, company: e.target.value.toUpperCase() })} placeholder="Razón Social o Nombre" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">NIT / Identificación</label>
                            <input tabIndex={2} className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-pink-500 transition-all text-white" value={clientData.id} onChange={e => setClientData({ ...clientData, id: e.target.value })} placeholder="Documento" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Teléfono</label>
                            <input tabIndex={3} className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-pink-500 transition-all text-white" value={clientData.phone} onChange={e => setClientData({ ...clientData, phone: e.target.value })} placeholder="Teléfono" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Email</label>
                            <input tabIndex={4} className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-pink-500 transition-all text-white" type="email" value={clientData.email} onChange={e => setClientData({ ...clientData, email: e.target.value })} placeholder="Correo" />
                        </div>
                    </div>
                </div>

                {/* HEADER & INFO CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                                <CalendarHeart className="w-6 h-6 text-pink-500 shadow-glow-pink" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Cotización de Evento</h2>
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Corporativo & Grupos</p>
                            </div>
                            <div className="md:col-span-2 space-y-2 mt-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Pasajeros del Evento</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-between min-h-[90px]">
                                        <div className="h-8 flex items-center justify-center mb-2">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase text-center leading-tight">Adultos Afil.</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setPassengers(p => ({ ...p, adultsAffiliate: Math.max(0, p.adultsAffiliate - 1) }))} className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                                            <span className="text-sm font-black text-white w-4 text-center">{passengers.adultsAffiliate}</span>
                                            <button onClick={() => setPassengers(p => ({ ...p, adultsAffiliate: p.adultsAffiliate + 1 }))} className="w-6 h-6 rounded-md bg-pink-600 text-white font-bold hover:bg-pink-500">+</button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-between min-h-[90px]">
                                        <div className="h-8 flex items-center justify-center mb-2">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase text-center leading-tight">Adultos No Afil.</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setPassengers(p => ({ ...p, adultsNonAffiliate: Math.max(0, p.adultsNonAffiliate - 1) }))} className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                                            <span className="text-sm font-black text-white w-4 text-center">{passengers.adultsNonAffiliate}</span>
                                            <button onClick={() => setPassengers(p => ({ ...p, adultsNonAffiliate: p.adultsNonAffiliate + 1 }))} className="w-6 h-6 rounded-md bg-pink-600 text-white font-bold hover:bg-pink-500">+</button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-between min-h-[90px]">
                                        <div className="h-8 flex items-center justify-center mb-2">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase text-center leading-tight">Niños</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))} className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                                            <span className="text-sm font-black text-white w-4 text-center">{passengers.children}</span>
                                            <button onClick={() => setPassengers(p => ({ ...p, children: p.children + 1 }))} className="w-6 h-6 rounded-md bg-pink-600 text-white font-bold hover:bg-pink-500">+</button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/50 flex flex-col items-center justify-between min-h-[90px]">
                                        <div className="h-8 flex items-center justify-center mb-2">
                                            <label className="text-[9px] text-slate-400 font-bold uppercase text-center leading-tight">Infantes</label>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))} className="w-6 h-6 rounded-md bg-slate-800 text-white font-bold hover:bg-slate-700">-</button>
                                            <span className="text-sm font-black text-white w-4 text-center">{passengers.infants}</span>
                                            <button onClick={() => setPassengers(p => ({ ...p, infants: p.infants + 1 }))} className="w-6 h-6 rounded-md bg-pink-600 text-white font-bold hover:bg-pink-500">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Ubicación del Evento</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                                    <input
                                        tabIndex={5}
                                        type="text"
                                        placeholder="Ej: Villavicencio"
                                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-pink-500/50 transition-all shadow-inner"
                                        value={eventData.location}
                                        onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Fecha del Evento</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                                    <input
                                        tabIndex={6}
                                        type="text"
                                        placeholder="Ej: 11 de Marzo 2026"
                                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-pink-500/50 transition-all shadow-inner"
                                        value={eventData.date}
                                        onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Nombre de la Opción / Hotel</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-pink-500 transition-colors" />
                                    <input
                                        tabIndex={7}
                                        type="text"
                                        placeholder="Ej: OPCION 1: HOTEL HARITACAMA COLONIAL"
                                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none focus:border-pink-500/50 transition-all shadow-inner"
                                        value={eventData.optionTitle}
                                        onChange={(e) => setEventData({ ...eventData, optionTitle: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GALERÍA (ESTANDARIZADA) */}
                    <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Imágenes del Lugar
                                <span className="text-yellow-500/60 lowercase tracking-normal">({eventData.images?.length || 0}/3)</span>
                            </h3>
                            <p className="text-[8px] text-slate-500 font-medium tracking-tight italic">
                                Ideal: Foto horizontal, HD, máx 2MB.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group/img">
                                    {eventData.images && eventData.images[i] ? (
                                        <>
                                            <img src={eventData.images[i]} className="w-full h-full object-cover group-hover/img:opacity-50 transition-opacity" alt={`Evento ${i}`} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all gap-2">
                                                <label className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-cyan-900/40">
                                                    Cambiar Foto
                                                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                        const compressed = await processImageUpload(e);
                                                        if (compressed) {
                                                            const newImages = [...eventData.images];
                                                            newImages[i] = compressed;
                                                            setEventData(prev => ({ ...prev, images: newImages }));
                                                        }
                                                    }} />
                                                </label>
                                                <button
                                                    onClick={() => {
                                                        const newImages = eventData.images.filter((_, imgIdx) => imgIdx !== i);
                                                        setEventData(prev => ({ ...prev, images: newImages }));
                                                    }}
                                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
                                            <ImageIcon className="w-8 h-8 text-slate-700 mb-2" />
                                            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Añadir Foto</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                const compressed = await processImageUpload(e);
                                                if (compressed) {
                                                    setEventData(prev => ({ ...prev, images: [...(prev.images || []), compressed] }));
                                                }
                                            }} />
                                        </label>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* TABLA DE SERVICIOS */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                    <div className="flex justify-between items-center mb-6 pl-2">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-pink-400" /> Servicios del Evento
                        </h3>
                        <button
                            onClick={addService}
                            className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-pink-900/20"
                        >
                            <Plus className="w-4 h-4" /> Agregar Ítem
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] uppercase font-black text-slate-500 border-b border-slate-700/50">
                                    <th className="py-4 text-left pl-4">Descripción del Servicio</th>
                                    <th className="py-4 text-center w-32">Cant.</th>
                                    <th className="py-4 text-right w-48 pr-4">Total Unitario</th>
                                    <th className="py-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {services.map((service, idx) => (
                                    <tr key={service.id} className="group hover:bg-slate-700/20 transition-all">
                                        <td className="py-3 pl-4">
                                            <textarea
                                                className="w-full bg-transparent border-none text-white text-sm outline-none resize-none min-h-[40px] py-1 placeholder:text-slate-600"
                                                placeholder="Ej: Alquiler salón MACAPAY con aire..."
                                                value={service.description}
                                                onChange={(e) => updateService(service.id, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-3 px-2">
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg py-1.5 text-center text-white text-sm outline-none focus:border-pink-500/30"
                                                value={service.quantity}
                                                onChange={(e) => updateService(service.id, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td className="py-3 pr-4">
                                            <div className="relative group/price">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">$</span>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg py-1.5 pl-8 pr-4 text-right text-white text-sm font-mono outline-none focus:border-pink-500/30"
                                                    value={service.total}
                                                    onChange={(e) => updateService(service.id, 'total', e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-3 text-center">
                                            <button
                                                onClick={() => removeService(service.id)}
                                                className="p-2 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RESUMEN FINANCIERO Y ALOJAMIENTO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ACCORDION ALOJAMIENTO */}
                    <div className="space-y-4">
                        <button
                            onClick={() => setShowAccommodation(!showAccommodation)}
                            className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all ${showAccommodation ? 'bg-indigo-600/20 border-indigo-500/40' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/40'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${showAccommodation ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-white font-bold text-sm uppercase">Detalles de Alojamiento</h4>
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-tight">Opcional: Detallar estadía de huéspedes</p>
                                </div>
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${showAccommodation ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showAccommodation && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6 shadow-xl overflow-hidden"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Plan de Alojamiento</h4>
                                        <button onClick={addRoom} className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 uppercase">
                                            <Plus className="w-3 h-3" /> Agregar Habitación
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {accommodation.length === 0 && (
                                            <div className="py-8 text-center border-2 border-dashed border-slate-700 rounded-xl">
                                                <p className="text-slate-500 text-xs font-bold uppercase italic">Sin habitaciones configuradas</p>
                                            </div>
                                        )}
                                        {accommodation.map((room) => (
                                            <div key={room.id} className="grid grid-cols-5 gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700/30 group">
                                                <div className="col-span-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Tipo Habitación"
                                                        className="w-full bg-transparent border-none text-white text-[11px] outline-none"
                                                        value={room.roomType}
                                                        onChange={(e) => updateRoom(room.id, 'roomType', e.target.value)}
                                                    />
                                                </div>
                                                <input
                                                    type="number"
                                                    placeholder="PAX"
                                                    className="w-full bg-slate-800/30 rounded px-2 py-1 text-white text-[11px] text-center"
                                                    value={room.pax}
                                                    onChange={(e) => updateRoom(room.id, 'pax', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Total"
                                                    className="w-full bg-slate-800/30 rounded px-2 py-1 text-white text-[11px] text-right font-mono"
                                                    value={room.total}
                                                    onChange={(e) => updateRoom(room.id, 'total', e.target.value)}
                                                />
                                                <div className="flex justify-center items-center">
                                                    <button onClick={() => removeRoom(room.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* TOTALES */}
                    <div className="bg-slate-900/40 rounded-3xl p-8 border border-slate-700/50 shadow-2xl space-y-4">
                        <div className="grid grid-cols-2 gap-y-3">
                            <span className="text-slate-400 text-xs font-bold uppercase">Subtotal Servicios:</span>
                            <span className="text-white text-right font-mono text-sm">${totals.subtotalServices.toLocaleString()}</span>

                            <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-2">IVA {finance.ivaPercent}%:</span>
                            <span className="text-slate-300 text-right font-mono text-xs">${Math.round(totals.ivaAmount).toLocaleString()}</span>

                            <span className="text-slate-500 text-[10px] font-bold uppercase flex items-center gap-2">Impoconsumo {finance.impoconsumoPercent}%:</span>
                            <span className="text-slate-300 text-right font-mono text-xs">${Math.round(totals.impoconsumoAmount).toLocaleString()}</span>

                            <div className="col-span-2 border-t border-slate-700/30 my-1"></div>

                            <span className="text-slate-400 text-xs font-bold uppercase py-1">Sub Total Evento:</span>
                            <span className="text-white text-right font-mono font-bold">${Math.round(totals.subtotalEvent).toLocaleString()}</span>

                            <div className="flex items-center gap-2">
                                <span className="text-cyan-400 text-[10px] font-black uppercase">Fee Servicios:</span>
                                <input
                                    type="number"
                                    className="w-12 bg-cyan-900/20 border border-cyan-500/30 rounded px-1.5 py-0.5 text-cyan-300 text-[10px] font-bold text-center outline-none"
                                    value={finance.agencyFeePercent}
                                    onChange={(e) => setFinance({ ...finance, agencyFeePercent: e.target.value })}
                                />
                                <span className="text-cyan-500 text-[10px]">%</span>
                            </div>
                            <span className="text-cyan-300 text-right font-mono text-xs">${Math.round(totals.feeAmount).toLocaleString()}</span>

                            <span className="text-slate-500 text-[10px] font-bold uppercase">IVA sobre Fee ({finance.feeIvaPercent}%):</span>
                            <span className="text-slate-400 text-right font-mono text-[10px]">${Math.round(totals.feeIvaAmount).toLocaleString()}</span>

                            <div className="col-span-2 mt-4 bg-slate-900 border border-slate-700 rounded-2xl p-4 flex justify-between items-center shadow-inner">
                                <span className="text-pink-500 font-black text-sm uppercase tracking-wider">Total a Pagar</span>
                                <span className="text-white font-black text-2xl font-mono">${Math.round(totals.totalEvent).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COTIZACIÓN ACCIÓN */}
                <div className="flex justify-end pt-8 border-t border-slate-700/50">
                    <button
                        type="submit"
                        tabIndex={8}
                        disabled={isSaving}
                        className={`bg-gradient-to-r ${isSaving ? 'from-slate-600 to-slate-500' : 'from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500'} text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-pink-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]`}
                    >
                        <FileDown className={`w-5 h-5 ${isSaving ? 'animate-spin' : 'animate-bounce-slow'}`} />
                        {isSaving ? 'Guardando...' : 'Generar PDF del Evento'}
                    </button>
                </div>
            </form>
        );
    };

    const VacacionesMedidaForm = () => {
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');
        const [currency, setCurrency] = useState('COP');

        const [beneficiary, setBeneficiary] = useState({
            employeeName: '',
            company: '',
            agreement: ''
        });

        const [tripInfo, setTripInfo] = useState({
            destination: '',
            passengers: '',
            accommodationOptions: [{ id: 1, city: '', hotel: '', meals: '' }],
            mainPhoto: DEFAULT_IMAGES.DESTINATION
        });

        const [itinerary, setItinerary] = useState({
            air: [{ id: 1, date: '', airline: '', route: '', departure: '', arrival: '' }],
            land: [{ id: 1, activity: '', details: '' }]
        });

        const [settlements, setSettlements] = useState([
            {
                id: 1,
                title: 'LIQUIDACIÓN PLAN FUNCIONARIO',
                avatar: DEFAULT_IMAGES.AVATAR,
                totalValue: '',
                beforeIvaValue: '',
                ivaValue: '',
                agencyDiscountPercent: '',
                companySubsidyPercent: ''
            }
        ]);

        const addSettlement = () => {
            setSettlements([...settlements, {
                id: Date.now(),
                title: `LIQUIDACIÓN PLAN ${beneficiary.employeeName || 'FUNCIONARIO'}`,
                totalValue: '',
                beforeIvaValue: '',
                ivaValue: '',
                agencyDiscountPercent: '',
                companySubsidyPercent: ''
            }]);
        };

        const removeSettlement = (id) => {
            setSettlements(settlements.filter(s => s.id !== id));
        };

        const updateSettlement = (id, field, value) => {
            setSettlements(settlements.map(s => {
                if (s.id !== id) return s;
                let newS = { ...s, [field]: value };

                // Lógica contable 100% operativa (IVA 19%)
                if (field === 'totalValue') {
                    const total = parseFloat(String(value).replace(/,/g, '')) || 0;
                    const before = total / 1.19;
                    const iva = total - before;
                    newS.beforeIvaValue = total > 0 ? Math.round(before).toString() : '';
                    newS.ivaValue = total > 0 ? Math.round(iva).toString() : '';
                } else if (field === 'beforeIvaValue') {
                    const before = parseFloat(String(value).replace(/,/g, '')) || 0;
                    const iva = before * 0.19;
                    const total = before + iva;
                    newS.ivaValue = before > 0 ? Math.round(iva).toString() : '';
                    newS.totalValue = before > 0 ? Math.round(total).toString() : '';
                } else if (field === 'ivaValue') {
                    const iva = parseFloat(String(value).replace(/,/g, '')) || 0;
                    const before = iva / 0.19;
                    const total = before + iva;
                    newS.beforeIvaValue = iva > 0 ? Math.round(before).toString() : '';
                    newS.totalValue = iva > 0 ? Math.round(total).toString() : '';
                }
                return newS;
            }));
        };

        const calculateSettlement = (s) => {
            const total = parseFloat(String(s.totalValue).replace(/,/g, '')) || 0;
            const discPct = parseFloat(s.agencyDiscountPercent) || 0;
            const subsPct = parseFloat(s.companySubsidyPercent) || 0;

            const agencyDiscountValue = total * (discPct / 100);
            const companySubsidyValue = total * (subsPct / 100);
            const employeeDeduction = total - (agencyDiscountValue + companySubsidyValue);
            const companyPayToAgency = total - agencyDiscountValue;

            return {
                agencyDiscountValue,
                companySubsidyValue,
                employeeDeduction,
                companyPayToAgency
            };
        };

        const handleImageUpload = async (e) => {
            const compressed = await processImageUpload(e);
            if (compressed) {
                setTripInfo(prev => ({ ...prev, mainPhoto: compressed }));
            }
        };

        const handleSaveAndPdf = async () => {
            setIsSaving(true);
            setSaveStatus('Guardando...');
            try {
                let folio = previewFolio;
                // EMERGENCY RULE: Async fallback handled
                if (!folio || folio.startsWith('TEMP')) {

                    folio = await Folios.getNext('COT-COR', getSubKeyFromTab('vacaciones-medida'));
                    setPreviewFolio(folio);
                }

                const data = {
                    folio,
                    beneficiary,
                    tripInfo,
                    itinerary,
                    settlements: settlements.map(s => ({
                        ...s,
                        calculations: calculateSettlement(s)
                    })),
                    currency,
                    advisorName,
                    advisorRole,
                    quoteType: 'vacaciones-medida',
                    createdAt: new Date().toISOString()
                };

                await QuotesApi.createQuote(data, user);
                await generateVacacionesMedidaPdf(data);
                setSaveStatus('success');
            } catch (error) {

                setSaveStatus('error');
            } finally {
                setIsSaving(false);
            }
        };

        return (
            <div className="space-y-8 animate-fade-in p-2 pb-24 text-slate-200">
                {/* IDENTIFICACIÓN */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                        <User className="w-5 h-5" /> Identificación del Beneficiario
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Nombre del Funcionario</label>
                            <input
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-all"
                                value={beneficiary.employeeName}
                                onChange={e => setBeneficiary({ ...beneficiary, employeeName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Empresa</label>
                            <input
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-all"
                                value={beneficiary.company}
                                onChange={e => setBeneficiary({ ...beneficiary, company: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Convenio</label>
                            <input
                                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-all"
                                value={beneficiary.agreement}
                                onChange={e => setBeneficiary({ ...beneficiary, agreement: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* INFORMACIÓN DEL VIAJE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                            <MapPin className="w-5 h-5" /> Información General
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Destino</label>
                                <input
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-all"
                                    value={tripInfo.destination}
                                    onChange={e => setTripInfo({ ...tripInfo, destination: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Pasajeros</label>
                                <input
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-all"
                                    value={tripInfo.passengers}
                                    onChange={e => setTripInfo({ ...tripInfo, passengers: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] uppercase font-bold text-slate-500">Alojamiento</label>
                                <textarea
                                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 outline-none focus:border-blue-500 transition-all min-h-[80px]"
                                    value={tripInfo.accommodation}
                                    onChange={e => setTripInfo({ ...tripInfo, accommodation: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl flex flex-col items-center justify-center space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase">Foto Principal</h3>
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                            <img src={tripInfo.mainPhoto || DEFAULT_IMAGES.DESTINATION} alt="Main" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                <label className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-emerald-900/40">
                                    Cambiar Foto
                                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                        const file = await processImageUpload(e);
                                        if (file) setTripInfo(prev => ({ ...prev, mainPhoto: file }));
                                    }} />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ITINERARIO AÉREO */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                            <Plane className="w-5 h-5" /> Itinerario Aéreo
                        </h3>
                        <button
                            onClick={() => setItinerary({ ...itinerary, air: [...itinerary.air, { id: Date.now(), date: '', airline: '', route: '', departure: '', arrival: '' }] })}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg border border-blue-600/30 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                        >
                            <Plus className="w-3 h-3" /> Añadir Tramo
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700/50">
                                    <th className="py-2 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                    <th className="py-2 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aerolínea</th>
                                    <th className="py-2 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ruta</th>
                                    <th className="py-2 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Salida</th>
                                    <th className="py-2 px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Llegada</th>
                                    <th className="py-2 px-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {itinerary.air.map((item, idx) => (
                                    <tr key={item.id} className="border-b border-slate-700/30 group">
                                        <td className="py-2 px-1">
                                            <input
                                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                                value={item.date}
                                                placeholder="Ej: 1 Jun"
                                                onChange={e => {
                                                    const newAir = [...itinerary.air];
                                                    newAir[idx].date = e.target.value;
                                                    setItinerary({ ...itinerary, air: newAir });
                                                }}
                                            />
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                                value={item.airline}
                                                placeholder="Avianca"
                                                onChange={e => {
                                                    const newAir = [...itinerary.air];
                                                    newAir[idx].airline = e.target.value;
                                                    setItinerary({ ...itinerary, air: newAir });
                                                }}
                                            />
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                                value={item.route}
                                                placeholder="BOG - ADZ"
                                                onChange={e => {
                                                    const newAir = [...itinerary.air];
                                                    newAir[idx].route = e.target.value;
                                                    setItinerary({ ...itinerary, air: newAir });
                                                }}
                                            />
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                                value={item.departure}
                                                placeholder="04:00 PM"
                                                onChange={e => {
                                                    const newAir = [...itinerary.air];
                                                    newAir[idx].departure = e.target.value;
                                                    setItinerary({ ...itinerary, air: newAir });
                                                }}
                                            />
                                        </td>
                                        <td className="py-2 px-1">
                                            <input
                                                className="w-full bg-slate-900/40 border border-slate-700/50 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                                value={item.arrival}
                                                placeholder="06:30 PM"
                                                onChange={e => {
                                                    const newAir = [...itinerary.air];
                                                    newAir[idx].arrival = e.target.value;
                                                    setItinerary({ ...itinerary, air: newAir });
                                                }}
                                            />
                                        </td>
                                        <td className="py-2 px-1 text-right">
                                            {itinerary.air.length > 1 && (
                                                <button
                                                    onClick={() => setItinerary({ ...itinerary, air: itinerary.air.filter(a => a.id !== item.id) })}
                                                    className="p-1.5 bg-red-900/20 text-red-400 hover:bg-red-600 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* OPCIONES DE ALOJAMIENTO */}
                <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-blue-400">
                            <Hotel className="w-5 h-5" /> Opciones de Alojamiento
                        </h3>
                        <button
                            onClick={() => setTripInfo({ ...tripInfo, accommodationOptions: [...tripInfo.accommodationOptions, { id: Date.now(), city: '', hotel: '', meals: '' }] })}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg border border-blue-600/30 transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                        >
                            <Plus className="w-3 h-3" /> Añadir Opción
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {tripInfo.accommodationOptions.map((opt, idx) => (
                            <div key={opt.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-900/40 rounded-xl border border-slate-700/30 relative group">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Ciudad</label>
                                    <input
                                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                        value={opt.city}
                                        onChange={e => {
                                            const newOpts = [...tripInfo.accommodationOptions];
                                            newOpts[idx].city = e.target.value;
                                            setTripInfo({ ...tripInfo, accommodationOptions: newOpts });
                                        }}
                                    />
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Hotel</label>
                                    <input
                                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                        value={opt.hotel}
                                        onChange={e => {
                                            const newOpts = [...tripInfo.accommodationOptions];
                                            newOpts[idx].hotel = e.target.value;
                                            setTripInfo({ ...tripInfo, accommodationOptions: newOpts });
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-500">Alimentación</label>
                                    <input
                                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                                        value={opt.meals}
                                        placeholder="Ej: Desayunos"
                                        onChange={e => {
                                            const newOpts = [...tripInfo.accommodationOptions];
                                            newOpts[idx].meals = e.target.value;
                                            setTripInfo({ ...tripInfo, accommodationOptions: newOpts });
                                        }}
                                    />
                                </div>
                                {tripInfo.accommodationOptions.length > 1 && (
                                    <button
                                        onClick={() => setTripInfo({ ...tripInfo, accommodationOptions: tripInfo.accommodationOptions.filter(o => o.id !== opt.id) })}
                                        className="absolute -top-2 -right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* LIQUIDACIONES */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Tablas de Liquidación por Funcionario</h3>
                        <button onClick={addSettlement} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-lg shadow-blue-900/20">
                            <Plus className="w-4 h-4" /> Agregar Liquidación
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {settlements.map((s, idx) => {
                            const calcs = calculateSettlement(s);
                            return (
                                <div key={s.id} className="bg-slate-800/60 rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl animate-fade-in-up">
                                    <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex justify-between items-center">
                                        <div className="flex-1 mr-4">
                                            <label className="text-[9px] text-blue-200 font-bold uppercase tracking-widest pl-1 block mb-1">Nombre del Funcionario / Título de Tabla</label>
                                            <input
                                                className="bg-slate-900/40 text-white font-black text-base uppercase outline-none border border-white/10 rounded-lg px-3 py-1.5 w-full focus:bg-slate-900/60 transition-all"
                                                value={s.title}
                                                onChange={e => updateSettlement(s.id, 'title', e.target.value)}
                                            />
                                        </div>
                                        {settlements.length > 1 && (
                                            <button onClick={() => removeSettlement(s.id)} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-xl transition-all">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {/* Inputs */}
                                        <div className="space-y-6">
                                            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/30">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Valor Total del Plan</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                    <input
                                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-lg outline-none focus:border-blue-500 transition-all shadow-inner"
                                                        value={s.totalValue}
                                                        placeholder="0"
                                                        onChange={e => updateSettlement(s.id, 'totalValue', e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/30">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Valor antes de IVA</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                        <input
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-sm outline-none focus:border-blue-500 transition-all shadow-inner"
                                                            value={s.beforeIvaValue}
                                                            placeholder="0"
                                                            onChange={e => updateSettlement(s.id, 'beforeIvaValue', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/30">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Valor IVA (19%)</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                        <input
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white font-mono text-sm outline-none focus:border-blue-500 transition-all shadow-inner"
                                                            value={s.ivaValue}
                                                            placeholder="0"
                                                            onChange={e => updateSettlement(s.id, 'ivaValue', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/30">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">% Descuento Agencia</label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="number"
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-center outline-none focus:border-blue-500 transition-all font-bold text-lg"
                                                                value={s.agencyDiscountPercent}
                                                                onChange={e => updateSettlement(s.id, 'agencyDiscountPercent', e.target.value)}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex justify-between items-center px-1">
                                                        <span className="text-[9px] text-slate-500 uppercase font-bold">Valor descuento:</span>
                                                        <span className="text-xs text-emerald-400 font-mono font-bold">-$ {calcs.agencyDiscountValue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-700/30">
                                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">% Subsidio Empresa</label>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="number"
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-center outline-none focus:border-blue-500 transition-all font-bold text-lg"
                                                                value={s.companySubsidyPercent}
                                                                onChange={e => updateSettlement(s.id, 'companySubsidyPercent', e.target.value)}
                                                            />
                                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex justify-between items-center px-1">
                                                        <span className="text-[9px] text-slate-500 uppercase font-bold">Valor subsidio:</span>
                                                        <span className="text-xs text-blue-400 font-mono font-bold">-$ {calcs.companySubsidyValue.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Resultados - Resaltados como la referencia */}
                                        <div className="flex flex-col justify-center gap-6">
                                            <div className="bg-[#ffeb3b]/5 border-2 border-[#ffeb3b]/20 rounded-3xl p-8 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffeb3b]/10 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-[#ffeb3b]/20"></div>
                                                <div className="relative z-10">
                                                    <p className="text-[#ffeb3b] font-black text-sm uppercase tracking-tight mb-1">VALOR A DESCONTAR AL FUNCIONARIO</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-medium mb-4">Financiado por la empresa / Descuento de nómina</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-[#ffeb3b] text-xl font-bold font-mono">$</span>
                                                        <p className="text-white font-black text-4xl font-mono tracking-tighter shadow-sm">{calcs.employeeDeduction.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6 flex justify-between items-center">
                                                <div>
                                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">PAGO EMPRESA A AGENCIA</p>
                                                    <p className="text-[9px] text-slate-500 uppercase">Facturación directa (Total - Descuento)</p>
                                                </div>
                                                <p className="text-slate-200 font-bold text-xl font-mono">$ {calcs.companyPayToAgency.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ACCIONES FINALES */}
                <div className="flex justify-between items-center pt-8 border-t border-slate-700/50">
                    <div className="flex items-center gap-4">
                        <select className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white" value={currency} onChange={e => setCurrency(e.target.value)}>
                            <option value="COP">Peso Colombiano (COP)</option>
                            <option value="USD">Dólar (USD)</option>
                        </select>
                    </div>
                    <button
                        onClick={handleSaveAndPdf}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-900/40 transition-all hover:scale-[1.02]"
                    >
                        <FileDown className="w-5 h-5" />
                        Generar PDF Corporativo
                    </button>
                </div>
            </div>
        );
    };

    const SmartQuoteForm = ({ config, isReadOnly: inheritedReadOnly }) => {
        const [currentStep, setCurrentStep] = useState(1);
        const firstFieldStep1Ref = useRef(null);
        const firstFieldStep2Ref = useRef(null);
        const firstFieldStep3Ref = useRef(null);
        const firstFieldStep4Ref = useRef(null);
        const btnNextStepRef = useRef(null);
        const btnPrevStepRef = useRef(null);

        const handleFocusTrap = (e, firstRef, lastRef) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstRef.current) {
                        lastRef.current?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastRef.current) {
                        firstRef.current?.focus();
                        e.preventDefault();
                    }
                }
            }
            if (e.key === 'Enter') {
                if (e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }
        }; const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
        const [quoteType, setQuoteType] = useState(isCorporateModule ? 'corporativo' : 'vacacional');

        // Sincronizar reglas administrativas
        useEffect(() => {
            if (config?.commissions) {
                // Aquí se podría forzar la comisión mínima, etc.
            }
        }, [config]);

        useEffect(() => {
            setQuoteType(isCorporateModule ? 'corporativo' : 'vacacional');
        }, [activeSubTab, isCorporateModule]);

        // Auto-focus logic when step changes
        useEffect(() => {

            const focusRefs = {
                1: firstFieldStep1Ref,
                2: firstFieldStep2Ref,
                3: firstFieldStep3Ref,
                4: firstFieldStep4Ref
            };

            const targetRef = focusRefs[currentStep];
            if (targetRef && targetRef.current) {
                setTimeout(() => {
                    targetRef.current.focus();

                }, 100);
            }
        }, [currentStep]);

        // Datos del Formulario
        const [clientData, setClientData] = useState({
            // Vacacional
            name: '', id: '', phone: '', email: '',
            // Corporativo
            company: '', nit: '', costCenter: '', employeeCode: '',
            // General
            destination: '', suggestedDates: '', dateStart: '', dateEnd: '', duration: '',
            adultsAffiliate: 1, adultsNonAffiliate: 0, children: 0, infants: 0,
            mainPhoto: DEFAULT_IMAGES.DESTINATION,
            planType: ''
        });

        const [flights, setFlights] = useState([
            { id: 1, airline: '', flight: '', route: '', depTime: '', arrTime: '', flightDate: '', class: '', bag: '' }
        ]);
        const [includeAir, setIncludeAir] = useState(activeSubTab !== 'terrestre');
        const [showLuggage, setShowLuggage] = useState(false);
        const [luggage, setLuggage] = useState({
            personal: true,
            hand: true,
            checked: false
        });
        const [groundLogistics, setGroundLogistics] = useState({
            meetPoint: '', meetDate: '', meetTime: '', operator: ''
        });

        const [hotels, setHotels] = useState([
            {
                id: 1,
                name: '',
                category: '',
                room: '',
                observaciones: '',
                includes: '',
                images: [DEFAULT_IMAGES.HOTEL],
                showGallery: false,
                showItinerary: false,
                showExpectedHotels: false,
                expectedHotelsImage: '/images/hoteles_previstos_default.png',
                itineraryText: '',
                pricing: {
                    adultAffiliateRate: '',
                    adultNonAffiliateRate: '',
                    childRate: '',
                    infantRate: '',
                    totalToPay: '',
                    isTotalManual: false
                }
            }
        ]);


        const [extras, setExtras] = useState({
            includes: '',
            excludes: '',
            notes: ''
        });

        const [corporateOptions, setCorporateOptions] = useState({
            flexibleFare: false,
            corporateAgreement: false,
            agreementCode: ''
        });
        const [selectedCorporateBrand, setSelectedCorporateBrand] = useState(null);
        const [totalInvestment, setTotalInvestment] = useState('');
        const [generalConditions, setGeneralConditions] = useState(DEFAULT_CONDITIONS);
        const [isEditingConditions, setIsEditingConditions] = useState(false);
        const DEFAULT_DOCUMENTS = 'Cédula de ciudadanía original\nPasaporte vigente (Solo vuelos internacionales)\nVisas o permisos de ingreso (si aplica)\nVacuna de Fiebre Amarilla (si aplica)';
        const [documentsInfo, setDocumentsInfo] = useState(DEFAULT_DOCUMENTS);
        const [isEditingDocuments, setIsEditingDocuments] = useState(false);
        const [closingNote, setClosingNote] = useState(DEFAULT_CLOSING_NOTE);
        const [isEditingClosingNote, setIsEditingClosingNote] = useState(false);
        const DEFAULT_OBSERVATIONS_TEXT = `Aplica penalidad por cambios y cancelaciones.\nDespués de emitido el tiquete todo cambio genera penalidad.\nLos reembolsos solo aplican si las condiciones de la tarifa lo permiten.`;
        const [itineraryTable, setItineraryTable] = useState([
            { id: 1, city: '', description: '' }
        ]);
        const [mainPhoto, setMainPhoto] = useState(DEFAULT_IMAGES.DESTINATION);

        const [observacionesImportantes, setObservacionesImportantes] = useState(DEFAULT_OBSERVATIONS_TEXT);
        const [isEditingObservaciones, setIsEditingObservaciones] = useState(false);

        // ===== EFECTO DE RE-COTIZACIÓN (Clonar datos desde Historial) =====
        useEffect(() => {
            if (!cloneDataRef.current) return;

            const d = cloneDataRef.current;

            // 1. Datos del cliente — mapeo correcto a los campos internos del form
            setClientData(prev => ({
                ...prev,
                name: d.clientName || '',
                company: d.clientName || '', // Support corporativo fields
                employeeCode: d.employeeCode || '',
                id: d.clientId || '',
                nit: d.clientNit || '',
                costCenter: d.clientCostCenter || '',
                phone: d.clientPhone || '',
                email: d.clientEmail || '',
                destination: d.destination || '',
                suggestedDates: d.suggestedDates || '',
                dateStart: d.dateStart || '',
                dateEnd: d.dateEnd || '',
                duration: d.duration || '',
                adultsAffiliate: d.adultsAffiliate || 1,
                adultsNonAffiliate: d.adultsNonAffiliate || 0,
                children: d.children || 0,
                infants: d.infants || 0,
                planType: d.planType || '',
                mainPhoto: d.mainPhoto || DEFAULT_IMAGES.DESTINATION
            }));

            // Quinceañeras Data
            if (activeSubTab === 'quince' && d.itineraryTable) {
                setItineraryTable(d.itineraryTable);
            }

            // 2. Hoteles/Alojamientos con fotos e itinerario incluidos
            if (Array.isArray(d.hotels) && d.hotels.length > 0) {
                setHotels(d.hotels);
            }

            // 3. Vuelos
            if (Array.isArray(d.flights) && d.flights.length > 0) {
                setFlights(d.flights);
            }

            // 4. Extras (includes/excludes/notes)
            if (d.extras || d.excludes || d.notes) {
                setExtras(prev => ({
                    ...prev,
                    ...(d.extras || {}),
                    excludes: d.excludes || d.extras?.excludes || prev.excludes,
                    notes: d.notes || d.extras?.notes || prev.notes,
                }));
            }

            // 5. Equipaje
            if (d.luggage) setLuggage(d.luggage);

            // 5.5 Servicios Adicionales (Crucero, Auto, Asistencia)
            if (d.additionalServices) {
                const { cruise, car, medical } = d.additionalServices;
                setShowAdditionalServices({
                    cruise: !!cruise,
                    car: !!car,
                    medical: !!medical
                });
                if (cruise) setCruiseService(cruise);
                if (car) setCarRentalService(car);
                if (medical) setMedicalAssistanceService(medical);
            }

            // 6. Moneda
            if (d.currency) setCurrency(d.currency);

            // 7. Logística terrestre
            if (d.groundLogistics) setGroundLogistics(d.groundLogistics);

            // 8. Brand corporativo
            if (d.corporateBrand) setSelectedCorporateBrand(d.corporateBrand);

            // 9. Campos legales (con fallback a defaults si no existen en el historial)
            if (d.generalConditions) setGeneralConditions(d.generalConditions);
            if (d.documentsInfo) setDocumentsInfo(d.documentsInfo);
            if (d.closingNote) setClosingNote(d.closingNote);
            if (d.observacionesImportantes) setObservacionesImportantes(d.observacionesImportantes);

            // 10. Folio: ya viene asignado por handleReCotizar en QuotesPage

            // 11. Ir al Paso 3 para revisión rápida antes de guardar
            setCurrentStep(3);

            // 12. Limpiar canal para evitar re-ejecución en renders siguientes
            cloneDataRef.current = null;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // --- Módulos Opcionales ahora están dentro de 'hotels' ---

        // --- Resumen de Inversión (Ahora vinculado a cada hotel) ---
        // Auto-calcular el total para cada hotel cuando cambian tarifas o pasajeros
        useEffect(() => {
            setHotels(prev => prev.map(h => {
                const adultsAff = parseInt(clientData.adultsAffiliate) || 0;
                const adultsNon = parseInt(clientData.adultsNonAffiliate) || 0;
                const children = parseInt(clientData.children) || 0;
                const infants = parseInt(clientData.infants) || 0;

                const rateAff = parseFloat(String(h.pricing.adultAffiliateRate).replace(/,/g, '')) || 0;
                const rateNon = parseFloat(String(h.pricing.adultNonAffiliateRate).replace(/,/g, '')) || 0;
                const rateC = parseFloat(String(h.pricing.childRate).replace(/,/g, '')) || 0;
                const rateI = parseFloat(String(h.pricing.infantRate).replace(/,/g, '')) || 0;

                const computed = quoteType === 'vacacional'
                    ? (adultsAff * rateAff) + (children * rateC) + (infants * rateI)
                    : (adultsAff * rateAff) + (adultsNon * rateNon) + (children * rateC) + (infants * rateI);

                return {
                    ...h,
                    pricing: {
                        ...h.pricing,
                        totalToPay: computed > 0 ? computed.toFixed(2) : ''
                    }
                };
            }));
        }, [
            clientData.adultsAffiliate,
            clientData.adultsNonAffiliate,
            clientData.children,
            clientData.infants,
            // Dependencias de tarifas por hotel deben ser manejadas con cuidado para no causar loops infinitos si no hay cambios reales
            // Aquí usamos un truco: stringify de las tarifas actuales para detectar cambios profundos
            JSON.stringify(hotels.map(h => ({
                aA: h.pricing.adultAffiliateRate,
                aN: h.pricing.adultNonAffiliateRate,
                c: h.pricing.childRate,
                i: h.pricing.infantRate,
                m: h.pricing.isTotalManual
            })))
        ]);
        const [currency, setCurrency] = useState('COP');
        const [showErrors, setShowErrors] = useState(false);
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');
        const [ownerId, setOwnerId] = useState(null);
        const [pendingDraft, setPendingDraft] = useState(null);

        // --- SERVICIOS ADICIONALES (Crucero, Auto, Asistencia) ---
        const [showAdditionalServices, setShowAdditionalServices] = useState({
            cruise: false,
            car: false,
            medical: false
        });

        const [cruiseService, setCruiseService] = useState({
            shippingLine: '',
            cabinType: '',
            itinerary: '',
            ports: ''
        });

        const [carRentalService, setCarRentalService] = useState({
            category: '',
            pickupCity: '',
            dropoffCity: '',
            days: ''
        });

        const [medicalAssistanceService, setMedicalAssistanceService] = useState({
            coverage: '',
            ages: '',
            travelDays: ''
        });

        useEffect(() => {
            setIncludeAir(activeSubTab !== 'terrestre');
        }, [activeSubTab]);

        // Lógica de Cálculo Automático de Duración
        useEffect(() => {
            const { dateStart, dateEnd } = clientData;
            if (dateStart && dateEnd) {
                const start = new Date(dateStart);
                const end = new Date(dateEnd);

                if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                    const diffTime = end.getTime() - start.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays >= 0) {
                        const nights = diffDays;
                        const days = diffDays + 1;
                        const calculatedDuration = `${days} Días / ${nights} Noches`;

                        setClientData(prev => ({
                            ...prev,
                            duration: calculatedDuration
                        }));
                    }
                }
            }
        }, [clientData.dateStart, clientData.dateEnd]);

        // Mostrar equipaje automáticamente si hay vuelos cargados
        useEffect(() => {
            if (flights && flights.length > 0) {
                setShowLuggage(true);
            }
        }, [flights.length]);

        // Cargar borrador al montar si el usuario tiene uno
        useEffect(() => {
            if (user?.id && !previewFolio) {
                QuotesApi.getDraftByUserId(user.id).then(draft => {
                    if (draft && draft.folio) {
                        setPendingDraft(draft);
                    }
                });
            }
        }, [user?.id]);

        // Generar Folio Automático al iniciar el Paso 1 (sin auto-guardar vacío)
        useEffect(() => {
            const initFolio = async () => {
                if (currentStep === 1 && !previewFolio && !pendingDraft) {

                    const temp = `TEMP-${Date.now()}`;
                    setPreviewFolio(temp);

                    try {

                        const official = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || quoteType || 'nacional'));

                        setPreviewFolio(official);
                    } catch (e) {

                    }
                }
            };
            initFolio();
        }, [currentStep]);

        // Verificación de propiedad (Ahora delegada a QuotesPage)

        // Auto-guardado en debouncing cada 3 segundos tras cambios (solo si ya hay cliente)
        useEffect(() => {
            if (isReadOnly) return;
            const clientName = quoteType === 'vacacional' ? clientData.name : clientData.company;
            const hasClientData = clientName && String(clientName).trim() !== '';

            if (previewFolio && hasClientData) {
                const timer = setTimeout(() => {
                    handleFinalSave(false, true); // Supabase guardado silencioso
                }, 3000);

                return () => clearTimeout(timer);
            }
        }, [
            clientData, flights, hotels, extras, luggage, groundLogistics,
            corporateOptions, selectedCorporateBrand, generalConditions,
            documentsInfo, closingNote, observacionesImportantes,
            cruiseService, carRentalService, medicalAssistanceService,
            currency, currentStep, quoteType, activeSubTab, itineraryTable
        ]);

        // Handlers
        const addFlight = () => setFlights([...flights, { id: Date.now(), airline: '', flight: '', route: '', depTime: '', arrTime: '', flightDate: '', class: '', bag: '' }]);
        const removeFlight = (id) => setFlights(flights.filter(f => f.id !== id));
        const handleFlightChange = (id, field, value) => setFlights(flights.map(f => f.id === id ? { ...f, [field]: value } : f));
        const addHotel = () => {
            const newId = hotels.length > 0 ? Math.max(...hotels.map(h => h.id)) + 1 : 1;
            setHotels([...hotels, {
                id: newId,
                name: '',
                category: '',
                room: '',
                observaciones: '',
                includes: '',
                images: [DEFAULT_IMAGES.HOTEL],
                showGallery: false,
                showItinerary: false,
                showExpectedHotels: false,
                expectedHotelsImage: '/images/hoteles_previstos_default.png',
                itineraryText: '',
                pricing: {
                    adultAffiliateRate: '',
                    adultNonAffiliateRate: '',
                    childRate: '',
                    infantRate: '',
                    totalToPay: '',
                    isTotalManual: false
                }
            }]);
        };
        const removeHotel = (id) => setHotels(hotels.filter(h => h.id !== id));
        const handleHotelChange = (id, field, value) => setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
        const handleHotelPricingChange = (id, field, value) => {
            setHotels(prev => prev.map(h => h.id === id ? {
                ...h,
                pricing: {
                    ...h.pricing,
                    [field]: value,
                    isTotalManual: false // Siempre automático
                }
            } : h));
        };


        const handleConvertToConfirmation = () => {
            setFormData(prev => ({
                ...prev,
                clientName: quoteType === 'vacacional' ? clientData.name : clientData.company,
                destination: clientData.destination,
            }));
            setActiveMainTab('confirmation');
        };

        const handleFinalSave = async (generatePdf = false, isSilentDraft = false) => {
            if (isReadOnly) return;
            if (!isSilentDraft) {

                setIsSaving(true);
                setSaveStatus('Certificando Folio...');
            }
            try {
                let folio = previewFolio;
                // EMERGENCY RULE: Async fallback handled
                if (!folio || folio.startsWith('TEMP')) {

                    folio = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab || quoteType || 'nacional'));
                    setPreviewFolio(folio);
                }

                const flightsForPayload = Array.isArray(flights)
                    ? flights.map(f => ({
                        airline: f.airline || '',
                        flight: f.flight || '',
                        route: f.route || '',
                        depTime: f.depTime || '',
                        arrTime: f.arrTime || '',
                        class: f.class || '',
                        observaciones: f.observaciones || '',
                        flightDate: f.flightDate || ''
                    }))
                    : [];

                const allIncludes = extras.includes || '';

                const payload = {
                    folio,
                    clientName: quoteType === 'vacacional' ? clientData.name : clientData.company,
                    clientId: clientData.id || '',
                    clientNit: clientData.nit || '',
                    clientCostCenter: clientData.costCenter || '',
                    clientEmail: clientData.email,
                    clientPhone: clientData.phone,
                    destination: clientData.destination,
                    suggestedDates: clientData.suggestedDates,
                    duration: clientData.duration,
                    adults: (parseInt(clientData.adultsAffiliate) || 0) + (parseInt(clientData.adultsNonAffiliate) || 0),
                    adultsAffiliate: clientData.adultsAffiliate,
                    adultsNonAffiliate: clientData.adultsNonAffiliate,
                    children: clientData.children,
                    infants: clientData.infants,
                    dateStart: clientData.dateStart,
                    dateEnd: clientData.dateEnd,
                    hotels, // Contiene imágenes y pricing por hotel
                    includes: allIncludes,
                    excludes: extras.excludes || '',
                    notes: extras.notes,
                    flights: flightsForPayload,
                    luggage,
                    corporateBrand: quoteType === 'corporativo' ? (selectedCorporateBrand || activeCorporateBrand) : null,
                    groundLogistics: activeSubTab === 'terrestre' ? groundLogistics : null,
                    additionalServices: {
                        cruise: showAdditionalServices.cruise ? cruiseService : null,
                        car: showAdditionalServices.car ? carRentalService : null,
                        medical: showAdditionalServices.medical ? medicalAssistanceService : null
                    },
                    createdAt: new Date().toISOString(),
                    advisorName,
                    advisorRole,
                    generalConditions,
                    documentsInfo,
                    currency,
                    closingNote,
                    observacionesImportantes,
                    mainPhoto: activeSubTab === 'quince' ? clientData.mainPhoto : (hotels[0]?.images?.[0] || DEFAULT_IMAGES.DESTINATION),
                    itineraryTable: activeSubTab === 'quince' ? itineraryTable : null,
                    planType: activeSubTab === 'quince' ? clientData.planType : null,
                    quoteType: activeSubTab === 'quince' ? 'quince' : quoteType,
                    currentStep,
                    status: generatePdf ? 'completado' : 'draft'
                };
                const result = await QuotesApi.createQuote(payload, user);
                if (result.ok) {
                    if (!isSilentDraft) setSaveStatus('¡Guardado con éxito!');
                    if (generatePdf) {
                        // Validar que al menos la primera opción tenga un total calculado
                        const firstTotal = parseFloat(String(hotels[0]?.pricing?.totalToPay || 0).replace(/,/g, '')) || 0;
                        if (firstTotal <= 0) {
                            alert('Por favor ingrese tarifas en la Propuesta Económica antes de generar el PDF.');
                            if (!isSilentDraft) setIsSaving(false);
                            return;
                        }
                        generateQuotePdf({
                            ...payload,
                            duration: clientData.duration,
                            children: clientData.children,
                            infants: clientData.infants,
                            currency,
                            quoteType: activeSubTab === 'quince' ? 'quince' : quoteType
                        });
                    }
                } else {
                    if (!isSilentDraft) setSaveStatus('Error al guardar: ' + result.error);
                }
            } catch (error) {
                if (!isSilentDraft) setSaveStatus('Error crítico al guardar.');
            } finally {
                if (!isSilentDraft) setIsSaving(false);
                if (!isSilentDraft) setTimeout(() => setSaveStatus(''), 3000);
            }
        };

        // Stepper Colors & Glow
        const getStepColor = (step) => {
            switch (step) {
                case 1: return 'blue';
                case 2: return 'yellow'; // Gold
                case 3: return 'emerald'; // Green
                case 4: return 'cyan';
                default: return 'slate';
            }
        };

        const isFilled = (v) => {
            if (v === 0) return true;
            if (typeof v === 'number') return !Number.isNaN(v);
            return v !== null && v !== undefined && String(v).trim() !== '';
        };

        const validateStep = () => {
            console.group(`[QuotesPage > SmartQuoteForm] Validating Step ${currentStep}`);

            console.groupEnd();
            return true; // Tolerancia Cero - Bypass per user request
        };

        const renderStepIndicator = () => (
            <div className="flex justify-between items-center mb-8 px-4 relative">
                <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-700/50 -z-0"></div>
                {[
                    { num: 1, label: 'Información Base', color: 'blue' },
                    { num: 2, label: 'Itinerario', color: 'yellow' },
                    { num: 3, label: 'Revisión', color: 'emerald' },
                    { num: 4, label: 'Finalización', color: 'cyan' }
                ].map((s) => {
                    const isActive = currentStep === s.num;
                    const isCompleted = currentStep > s.num;
                    let activeClass = "";
                    if (s.color === 'blue') activeClass = isActive || isCompleted ? "border-blue-500 text-blue-400 bg-blue-900/50 shadow-blue-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                    if (s.color === 'yellow') activeClass = isActive || isCompleted ? "border-yellow-500 text-yellow-400 bg-yellow-900/50 shadow-yellow-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                    if (s.color === 'emerald') activeClass = isActive || isCompleted ? "border-emerald-500 text-emerald-400 bg-emerald-900/50 shadow-emerald-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                    if (s.color === 'cyan') activeClass = isActive || isCompleted ? "border-cyan-500 text-cyan-400 bg-cyan-900/50 shadow-cyan-500/50" : "border-slate-700 text-slate-600 bg-slate-900";

                    return (
                        <button
                            key={s.num}
                            className="relative z-10 flex flex-col items-center cursor-pointer"
                            onClick={() => setCurrentStep(s.num)}
                        >
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 ${activeClass} ${isActive ? 'shadow-lg scale-110' : ''}`}>
                                {isCompleted ? <Check className="w-5 h-5" /> : s.num}
                            </div>
                            <span className={`text-[10px] uppercase font-bold mt-2 tracking-wider ${isActive || isCompleted ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
                        </button>
                    );
                })}
            </div>
        );

        const RecoveryModal = () => {
            if (!pendingDraft) return null;
            return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                            <span className="w-8 h-8 text-blue-400 animate-spin-slow">🔄</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Borrador Detectado</h2>
                            <p className="text-slate-400 text-xs">Tienes una cotización en curso con el Folio <span className="text-blue-400 font-mono font-bold">{pendingDraft.folio}</span>. ¿Deseas continuar donde lo dejaste?</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setPendingDraft(null)}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
                            >
                                Empezar Nueva
                            </button>
                            <button
                                onClick={() => {
                                    setPreviewFolio(pendingDraft.folio);
                                    // Restaurar datos
                                    if (pendingDraft.clientName) {
                                        setClientData(prev => ({
                                            ...prev,
                                            name: pendingDraft.clientName,
                                            company: pendingDraft.clientName,
                                            email: pendingDraft.clientEmail,
                                            phone: pendingDraft.clientPhone,
                                            destination: pendingDraft.destination,
                                            duration: pendingDraft.duration,
                                            adultsAffiliate: pendingDraft.adultsAffiliate || pendingDraft.adults || 1,
                                            adultsNonAffiliate: pendingDraft.adultsNonAffiliate || 0,
                                            children: pendingDraft.children,
                                            infants: pendingDraft.infants,
                                            dateStart: pendingDraft.dateStart,
                                            dateEnd: pendingDraft.dateEnd
                                        }));
                                    }
                                    if (pendingDraft.flights) setFlights(pendingDraft.flights);
                                    if (pendingDraft.hotels) setHotels(pendingDraft.hotels);
                                    if (pendingDraft.currency) setCurrency(pendingDraft.currency);
                                    if (pendingDraft.luggage) setLuggage(pendingDraft.luggage);

                                    setClosingNote(pendingDraft.closingNote || DEFAULT_CLOSING_NOTE);

                                    setPendingDraft(null);
                                }}
                                className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        const ReadOnlyBanner = () => {
            if (!isReadOnly) return null;
            return (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-3">
                        <span className="w-5 h-5 text-amber-500">🔒</span>
                        <div>
                            <p className="text-amber-500 text-[11px] font-black uppercase tracking-widest">Modo Solo Lectura</p>
                            <p className="text-slate-400 text-[10px]">Esta cotización pertenece a otro asesor. No tienes permisos para editarla.</p>
                        </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase bg-slate-800 px-3 py-1 rounded-full border border-white/5">
                        Propiedad de: {ownerId || 'Otro Asesor'}
                    </div>
                </div>
            );
        };

        const renderClientCard = () => (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                    Información del Cliente
                </h3>
                {quoteType === 'vacacional' ? (
                    <>
                        <div className="group">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nombre Completo</label>
                            <input
                                ref={firstFieldStep1Ref}
                                tabIndex={1}
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none uppercase ${showErrors && !isFilled(clientData.name) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                                placeholder="Ej: JUAN PEREZ"
                                value={clientData.name}
                                onChange={e => setClientData({ ...clientData, name: e.target.value.toUpperCase() })}
                                readOnly={isReadOnly}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Identificación / NIT</label>
                                <input
                                    tabIndex={2}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500"
                                    placeholder="Ej: 1.020.334.556"
                                    value={clientData.id}
                                    onChange={e => setClientData({ ...clientData, id: e.target.value })}
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Teléfono / WhatsApp</label>
                                <input
                                    tabIndex={3}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500"
                                    placeholder="Ej: 300 123 4567"
                                    value={clientData.phone}
                                    onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Correo Electrónico</label>
                            <input
                                tabIndex={4}
                                type="email"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500"
                                placeholder="usuario@ejemplo.com"
                                value={clientData.email}
                                onChange={e => setClientData({ ...clientData, email: e.target.value })}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="group">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Razón Social / Empresa</label>
                            <input
                                ref={firstFieldStep1Ref}
                                tabIndex={1}
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.company) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${(selectedCorporateBrand || isReadOnly) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                value={clientData.company}
                                onChange={e => setClientData({ ...clientData, company: e.target.value })}
                                readOnly={!!selectedCorporateBrand || isReadOnly}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">NIT</label>
                                <input
                                    tabIndex={2}
                                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.nit) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${(selectedCorporateBrand || isReadOnly) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    value={clientData.nit}
                                    onChange={e => setClientData({ ...clientData, nit: e.target.value })}
                                    readOnly={!!selectedCorporateBrand || isReadOnly}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Centro de Costos</label>
                                <input
                                    tabIndex={5}
                                    className="w-full bg-slate-900 border border-blue-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500"
                                    placeholder="Ej: VENTAS-01"
                                    value={clientData.costCenter}
                                    onChange={e => setClientData({ ...clientData, costCenter: e.target.value })}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">SOLICITANTE</label>
                            <input
                                tabIndex={6}
                                className="w-full bg-slate-900 border border-blue-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500"
                                placeholder="Ej: EMP-8520"
                                value={clientData.employeeCode}
                                onChange={e => setClientData({ ...clientData, employeeCode: e.target.value })}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </>
                )}

                {/* BOTONES DE SERVICIOS ADICIONALES */}
                <div className="pt-4 mt-6 border-t border-slate-700/50">
                    <h4 className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Servicios Adicionales (Venta Cruzada)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setShowAdditionalServices(prev => ({ ...prev, cruise: !prev.cruise }))}
                            className={`flex items-center gap-2 justify-center py-2.5 rounded-xl border transition-all text-xs font-bold ${showAdditionalServices.cruise
                                ? 'bg-blue-600/30 border-blue-500/50 text-blue-300 shadow-inner'
                                : 'bg-slate-900 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Ship className="w-4 h-4" /> {showAdditionalServices.cruise ? 'Crucero (Agregado)' : 'Agregar Crucero'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAdditionalServices(prev => ({ ...prev, car: !prev.car }))}
                            className={`flex items-center gap-2 justify-center py-2.5 rounded-xl border transition-all text-xs font-bold ${showAdditionalServices.car
                                ? 'bg-amber-600/30 border-amber-500/50 text-amber-300 shadow-inner'
                                : 'bg-slate-900 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Car className="w-4 h-4" /> {showAdditionalServices.car ? 'Auto (Agregado)' : 'Alquiler de Auto'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAdditionalServices(prev => ({ ...prev, medical: !prev.medical }))}
                            className={`flex items-center gap-2 justify-center py-2.5 rounded-xl border transition-all text-xs font-bold ${showAdditionalServices.medical
                                ? 'bg-rose-600/30 border-rose-500/50 text-rose-300 shadow-inner'
                                : 'bg-slate-900 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <HeartPulse className="w-4 h-4" /> {showAdditionalServices.medical ? 'Seguro (Agregado)' : 'Asistencia Médica'}
                        </button>
                    </div>
                </div>
            </div>
        );

        const renderAdditionalServicesForms = () => {
            if (!showAdditionalServices.cruise && !showAdditionalServices.car && !showAdditionalServices.medical) return null;
            return (
                <div className="space-y-4 animate-fade-in-up">
                    {/* Formulario Crucero */}
                    <AnimatePresence>
                        {showAdditionalServices.cruise && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-900/10 border border-blue-500/30 p-6 rounded-2xl overflow-hidden">
                                <h4 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-blue-500/30 pb-2 mb-4 flex items-center gap-2">
                                    <Ship className="w-4 h-4" /> Detalles del Crucero
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-blue-300/70 uppercase font-bold mb-1">Naviera</label>
                                        <input className="w-full bg-slate-900 border border-blue-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500" placeholder="Ej: Royal Caribbean" value={cruiseService.shippingLine} onChange={e => setCruiseService({ ...cruiseService, shippingLine: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-blue-300/70 uppercase font-bold mb-1">Tipo de Cabina</label>
                                        <input className="w-full bg-slate-900 border border-blue-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500" placeholder="Ej: Balcón Vistamar" value={cruiseService.cabinType} onChange={e => setCruiseService({ ...cruiseService, cabinType: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] text-blue-300/70 uppercase font-bold mb-1">Itinerario y Puertos</label>
                                        <textarea className="w-full bg-slate-900 border border-blue-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500 min-h-[60px]" placeholder="Ej: Miami, Bahamas, Cozumel" value={cruiseService.ports} onChange={e => setCruiseService({ ...cruiseService, ports: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Formulario Alquiler Auto */}
                    <AnimatePresence>
                        {showAdditionalServices.car && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-amber-900/10 border border-amber-500/30 p-6 rounded-2xl overflow-hidden">
                                <h4 className="text-amber-400 font-bold uppercase text-xs tracking-wider border-b border-amber-500/30 pb-2 mb-4 flex items-center gap-2">
                                    <Car className="w-4 h-4" /> Alquiler de Vehículo
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-amber-300/70 uppercase font-bold mb-1">Categoría</label>
                                        <input className="w-full bg-slate-900 border border-amber-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-amber-500" placeholder="Ej: SUV Económica" value={carRentalService.category} onChange={e => setCarRentalService({ ...carRentalService, category: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-amber-300/70 uppercase font-bold mb-1">Entrega / Devolución</label>
                                        <input className="w-full bg-slate-900 border border-amber-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-amber-500" placeholder="Ej: Aeropuerto MIA" value={carRentalService.pickupCity} onChange={e => setCarRentalService({ ...carRentalService, pickupCity: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-amber-300/70 uppercase font-bold mb-1">Días de Rentado</label>
                                        <input className="w-full bg-slate-900 border border-amber-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-amber-500" placeholder="Ej: 5 Días" value={carRentalService.days} onChange={e => setCarRentalService({ ...carRentalService, days: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Formulario Seguro Médico */}
                    <AnimatePresence>
                        {showAdditionalServices.medical && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-rose-900/10 border border-rose-500/30 p-6 rounded-2xl overflow-hidden">
                                <h4 className="text-rose-400 font-bold uppercase text-xs tracking-wider border-b border-rose-500/30 pb-2 mb-4 flex items-center gap-2">
                                    <HeartPulse className="w-4 h-4" /> Asistencia Médica Internacional
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-rose-300/70 uppercase font-bold mb-1">Cobertura</label>
                                        <input className="w-full bg-slate-900 border border-rose-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-rose-500" placeholder="Ej: USD 60,000" value={medicalAssistanceService.coverage} onChange={e => setMedicalAssistanceService({ ...medicalAssistanceService, coverage: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-rose-300/70 uppercase font-bold mb-1">Edades</label>
                                        <input className="w-full bg-slate-900 border border-rose-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-rose-500" placeholder="Ej: 2 Adultos (35 y 40)" value={medicalAssistanceService.ages} onChange={e => setMedicalAssistanceService({ ...medicalAssistanceService, ages: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-rose-300/70 uppercase font-bold mb-1">Días de Viaje</label>
                                        <input className="w-full bg-slate-900 border border-rose-500/20 rounded-xl p-3 text-white transition-colors outline-none focus:border-rose-500" placeholder="Ej: 7 Días" value={medicalAssistanceService.travelDays} onChange={e => setMedicalAssistanceService({ ...medicalAssistanceService, travelDays: e.target.value })} readOnly={isReadOnly} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            );
        };

        const renderDestinationCard = () => (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                    Detalles del Destino
                </h3>
                <div className="relative aspect-video rounded-xl overflow-hidden group border border-slate-700/50 bg-slate-900">
                    <img src={clientData.mainPhoto || DEFAULT_IMAGES.DESTINATION} className="w-full h-full object-cover transition-all group-hover:scale-105" alt="Destino" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        {!isReadOnly && (
                            <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest cursor-pointer shadow-xl shadow-blue-900/40">
                                Cambiar Foto
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = await processImageUpload(e);
                                        if (file) setClientData(prev => ({ ...prev, mainPhoto: file }));
                                    }}
                                />
                            </label>
                        )}
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Destino Principal</label>
                    <input
                        tabIndex={7}
                        className={`w-full bg-slate-900 border rounded-xl p-3 text-white font-bold text-lg transition-colors outline-none uppercase ${showErrors && !isFilled(clientData.destination) ? 'border-red-500/50' : 'border-slate-700'} focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                        placeholder="EJ. MIAMI, FL"
                        value={clientData.destination}
                        onChange={e => setClientData({ ...clientData, destination: e.target.value })}
                        readOnly={isReadOnly}
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Sugerida de Viaje</label>
                    <input
                        tabIndex={8}
                        className={`w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                        placeholder="Ej: Mediados de Julio 2026"
                        value={clientData.suggestedDates}
                        onChange={e => setClientData({ ...clientData, suggestedDates: e.target.value })}
                        readOnly={isReadOnly}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Salida</label>
                        <input
                            tabIndex={9}
                            type="date"
                            className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.dateStart) ? 'border-red-500/50' : 'border-slate-700'} focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                            value={clientData.dateStart}
                            onChange={e => setClientData({ ...clientData, dateStart: e.target.value })}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Regreso</label>
                        <input
                            tabIndex={10}
                            type="date"
                            className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.dateEnd) ? 'border-red-500/50' : 'border-slate-700'} focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                            value={clientData.dateEnd}
                            onChange={e => setClientData({ ...clientData, dateEnd: e.target.value })}
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Duración del Viaje</label>
                    <input
                        tabIndex={11}
                        className={`w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                        placeholder="Ej: 4 Días / 3 Noches"
                        value={clientData.duration}
                        onChange={e => setClientData({ ...clientData, duration: e.target.value })}
                        readOnly={isReadOnly}
                    />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">
                            {quoteType === 'vacacional' ? 'Adultos' : 'Adultos Afil.'}
                        </label>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                tabIndex={12}
                                type="number"
                                min="0"
                                className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && clientData.adultsAffiliate === 0 && (quoteType === 'vacacional' || clientData.adultsNonAffiliate === 0) ? 'border-red-500/50' : 'border-slate-700'} focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                                placeholder="0"
                                value={clientData.adultsAffiliate}
                                onChange={e => setClientData({ ...clientData, adultsAffiliate: Math.max(0, parseInt(e.target.value) || 0) })}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>
                    {quoteType !== 'vacacional' && (
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">Adultos No Afil.</label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input
                                    tabIndex={13}
                                    type="number"
                                    min="0"
                                    className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && clientData.adultsAffiliate === 0 && clientData.adultsNonAffiliate === 0 ? 'border-red-500/50' : 'border-slate-700'} focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                                    placeholder="0"
                                    value={clientData.adultsNonAffiliate}
                                    onChange={e => setClientData({ ...clientData, adultsNonAffiliate: Math.max(0, parseInt(e.target.value) || 0) })}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">Niños</label>
                        <div className="relative">
                            <Users2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                tabIndex={14}
                                type="number"
                                min="0"
                                className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && (clientData.children === '' || isNaN(clientData.children)) ? 'border-red-500/50' : 'border-slate-700'} focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                                placeholder="0"
                                value={clientData.children}
                                onChange={e => setClientData({ ...clientData, children: Math.max(0, parseInt(e.target.value) || 0) })}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">Infantes</label>
                        <div className="relative">
                            <Baby className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                tabIndex={15}
                                type="number"
                                min="0"
                                className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && (clientData.infants === '' || isNaN(clientData.infants)) ? 'border-red-500/50' : 'border-slate-700'} focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                                placeholder="0"
                                value={clientData.infants}
                                onChange={e => setClientData({ ...clientData, infants: Math.max(0, parseInt(e.target.value) || 0) })}
                                readOnly={isReadOnly}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        document.getElementById('btn-next-step')?.click();
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-6xl mx-auto min-h-[600px] flex flex-col animate-fade-in relative overflow-hidden shadow-2xl">
                {/* Decorative Background based on step */}
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-colors duration-700 ${currentStep === 1 ? 'bg-blue-500/10' :
                    currentStep === 2 ? 'bg-yellow-500/10' :
                        currentStep === 3 ? 'bg-emerald-500/10' : 'bg-cyan-500/10'
                    }`}></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                    <button
                        onClick={() => setActiveSubTab(null)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Volver
                    </button>

                    {/* Static Indicator */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 flex items-center gap-2">
                        {quoteType === 'vacacional' ? (
                            <>
                                <Plane className="w-3.5 h-3.5 text-blue-400" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Vacacional</span>
                            </>
                        ) : (
                            <>
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Corporativo</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Stepper */}
                {renderStepIndicator()}

                {/* Content Area */}
                <div className="flex-1 relative z-10">
                    {/* PASO 1: INFORMACIÓN BASE */}
                    {currentStep === 1 && (
                        <div
                            className="space-y-8 animate-fade-in"
                            onKeyDown={(e) => handleFocusTrap(e, firstFieldStep1Ref, btnNextStepRef)}
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
                                <div className="text-left">
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {quoteType === 'vacacional' ? 'Información del Viaje' : 'Corporativo'}
                                    </h2>
                                    <p className="text-slate-400 text-sm">
                                        Ingrese los datos principales para iniciar la cotización.
                                    </p>
                                </div>
                                {quoteType === 'vacacional' && (
                                    <div className="flex flex-wrap gap-3 justify-start md:justify-end">
                                        <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl font-bold shadow-lg shadow-yellow-500/20 text-xs sm:text-sm">
                                            Cotización No {previewFolio || 'COT-0001'}
                                        </div>
                                        {/* Selector de Moneda */}
                                        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-lg">
                                            {user?.modules?.[quoteType] === 'read' ? (
                                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black px-3 py-1">
                                                    {currency}
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setCurrency('USD')}
                                                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        USD
                                                    </button>
                                                    <button
                                                        onClick={() => setCurrency('COP')}
                                                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${currency === 'COP' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >
                                                        COP
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {activeSubTab === 'quince' && (
                                            <div className="bg-blue-600/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-xl flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Plan:</span>
                                                <input
                                                    value={clientData.planType}
                                                    onChange={e => setClientData({ ...clientData, planType: e.target.value.toUpperCase() })}
                                                    placeholder="PUNTA CANA LUXURY"
                                                    className="bg-transparent border-none outline-none text-white font-black uppercase text-xs w-full"
                                                />
                                            </div>
                                        )}
                                        <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl font-bold shadow-lg shadow-yellow-500/20 text-xs sm:text-sm">
                                            Fecha: {new Date().toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {quoteType === 'vacacional' ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 shadow-xl shadow-slate-900/40">
                                    <div className="lg:col-span-2 space-y-6">
                                        {renderClientCard()}
                                        {renderAdditionalServicesForms()}
                                        {renderDestinationCard()}
                                    </div>
                                    <div className="relative rounded-2xl overflow-hidden min-h-[220px] bg-slate-900">
                                        <img
                                            src={activeSubTab === 'terrestre'
                                                ? 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1600&q=80'
                                                : 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80'}
                                            alt={activeSubTab === 'terrestre' ? 'Rutas Inolvidables' : 'Inspiración de viaje'}
                                            className="w-full h-full object-cover transition-transform duration-700 opacity-90"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                                            <p className="text-white font-bold text-lg">
                                                {activeSubTab === 'terrestre' ? 'Rutas Inolvidables' : 'Experiencias Vacacionales Destinos P&P'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-4">
                                        <label className="block text-[10px] text-slate-400 uppercase font-black mb-2">Cliente Corporativo</label>
                                        <div className="flex items-center gap-3">
                                            <select
                                                className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-3 text-white outline-none"
                                                value={selectedCorporateBrand?.id || selectedCorporateBrand?.key || ''}
                                                onChange={e => {
                                                    const companyId = e.target.value;
                                                    const company = corporateCompanies.find(c => c.id === companyId);
                                                    const brand = company ? {
                                                        id: company.id,
                                                        key: company.id,
                                                        name: company.name,
                                                        logo: company.logo_url
                                                    } : null;
                                                    setSelectedCorporateBrand(brand);

                                                    // Autocompletado de datos del cliente
                                                    if (company) {
                                                        setClientData(prev => ({
                                                            ...prev,
                                                            company: company.name,
                                                            nit: company.nit || ''
                                                        }));
                                                    }

                                                    const fol = (previewFolio || '').trim();
                                                    if (fol) {
                                                        const ex = ERP.getQuoteByFolio(fol) || {};
                                                        ERP.saveQuote(fol, { ...ex, corporateBrand: brand });
                                                    }
                                                }}
                                            >
                                                <option value="">Seleccione Empresa</option>
                                                {corporateCompanies.map(company => (
                                                    <option key={company.id} value={company.id}>
                                                        {company.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {selectedCorporateBrand?.logo && (
                                                <div className="bg-white p-1 rounded-lg h-10 w-auto flex items-center justify-center">
                                                    <img src={selectedCorporateBrand.logo} alt={selectedCorporateBrand.name} className="h-full w-auto object-contain" />
                                                </div>
                                            )}
                                            {activeSubTab === 'quince' && (
                                                <div className="bg-blue-600/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-lg flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Plan:</span>
                                                    <input
                                                        value={clientData.planType}
                                                        onChange={e => setClientData({ ...clientData, planType: e.target.value.toUpperCase() })}
                                                        placeholder="TIPO DE PLAN"
                                                        className="bg-transparent border-none outline-none text-white font-black uppercase text-[10px] w-32"
                                                    />
                                                </div>
                                            )}
                                            <div className="bg-yellow-500 text-slate-900 px-3 py-1 rounded-lg font-bold text-xs">
                                                {previewFolio || 'COT-0001'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            {renderClientCard()}
                                            {renderAdditionalServicesForms()}
                                        </div>
                                        {renderDestinationCard()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PASO 2: ITINERARIO Y ALOJAMIENTO */}
                    {currentStep === 2 && (
                        <div
                            className="space-y-8 animate-fade-in"
                            onKeyDown={(e) => handleFocusTrap(e, firstFieldStep2Ref, btnNextStepRef)}
                        >
                            {activeSubTab === 'quince' ? (
                                <div className="space-y-8">
                                    {/* Cabecera de Itinerario Quince */}
                                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 pl-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    <Camera className="w-5 h-5 text-blue-400" /> Portada del Plan
                                                </h3>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="relative group/photo">
                                                    <img src={clientData.mainPhoto || DEFAULT_IMAGES.DESTINATION} className="w-32 h-20 object-cover rounded-xl border border-slate-700 shadow-xl" />
                                                    <button
                                                        onClick={() => {
                                                            const url = prompt('Ingrese URL de la imagen de portada:');
                                                            if (url) setClientData({ ...clientData, mainPhoto: url });
                                                        }}
                                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center rounded-xl transition-opacity"
                                                    >
                                                        <Camera className="w-5 h-5 text-white" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                                        <div className="flex justify-between items-center mb-6 pl-4">
                                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <ClipboardList className="w-5 h-5 text-blue-400" /> Itinerario Detallado
                                            </h3>
                                            <button
                                                onClick={() => setItineraryTable([...itineraryTable, { id: Date.now(), city: '', description: '' }])}
                                                className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                <Plus className="w-3 h-3" /> Agregar Día
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            <table className="w-full text-slate-300">
                                                <thead>
                                                    <tr className="text-[10px] text-slate-500 uppercase font-black tracking-widest border-b border-slate-700">
                                                        <th className="pb-3 text-left w-16 px-2">Día</th>
                                                        <th className="pb-3 text-left px-2">Ciudad / Actividad</th>
                                                        <th className="pb-3 text-left px-2">Descripción</th>
                                                        <th className="pb-3 text-right">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itineraryTable.map((row, idx) => (
                                                        <tr key={row.id} className="border-b border-slate-800/30 hover:bg-white/5 transition-colors">
                                                            <td className="py-4 px-2 font-mono text-blue-400 font-bold">{idx + 1}</td>
                                                            <td className="py-2 px-2">
                                                                <input
                                                                    ref={idx === 0 ? firstFieldStep2Ref : null}
                                                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500/50"
                                                                    value={row.city}
                                                                    onChange={e => setItineraryTable(itineraryTable.map(r => r.id === row.id ? { ...r, city: e.target.value } : r))}
                                                                    placeholder="Ej: Punta Cana"
                                                                />
                                                            </td>
                                                            <td className="py-2 px-2">
                                                                <textarea
                                                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none focus:border-blue-500/50 min-h-[40px] resize-y"
                                                                    value={row.description}
                                                                    onChange={e => setItineraryTable(itineraryTable.map(r => r.id === row.id ? { ...r, description: e.target.value } : r))}
                                                                    placeholder="Vuelo a Punta Cana y traslado al hotel..."
                                                                />
                                                            </td>
                                                            <td className="py-2 pr-2 text-right">
                                                                <button
                                                                    onClick={() => setItineraryTable(itineraryTable.filter(r => r.id !== row.id))}
                                                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </div>
                            ) : activeSubTab !== 'terrestre' && (
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-center mb-6 pl-4">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <Plane className="w-5 h-5 text-yellow-400" /> Itinerario Aéreo
                                        </h3>
                                        <button onClick={addFlight} className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                            <Plus className="w-3 h-3" /> Agregar
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {flights.map((flight, idx) => (
                                            <div key={flight.id} className="relative bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 transition-all hover:border-yellow-500/30 group/card">
                                                {/* Indicador de Trayecto */}
                                                <div className="absolute -top-3 left-6 px-3 py-1 bg-yellow-600 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-yellow-400 z-10">
                                                    Trayecto {idx + 1}
                                                </div>
                                                {/* Ref para el primer campo del Paso 2 si es el primer vuelo */}
                                                {/* El ref se asigna directamente al input de Origen/Destino más abajo */}
                                                {/* Botón Eliminar (Top Right) - Posicionamiento Profesional */}
                                                <button
                                                    onClick={() => !isReadOnly && removeFlight(flight.id)}
                                                    disabled={isReadOnly}
                                                    className={`absolute -top-2 -right-2 z-20 transition-all p-2.5 rounded-xl shadow-2xl opacity-0 group-hover/card:opacity-100 ${isReadOnly ? 'hidden' : 'bg-slate-900 border border-slate-700 hover:border-red-500/50 text-slate-500 hover:text-red-400 active:scale-90 tooltip-delete'}`}
                                                    title="Eliminar este trayecto"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="flex flex-col lg:flex-row gap-[20px]">
                                                    {/* Columna Izquierda: Datos del Vuelo */}
                                                    <div className="flex-1 space-y-4">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">Origen / Destino</label>
                                                                <input
                                                                    ref={idx === 0 ? firstFieldStep2Ref : null}
                                                                    tabIndex={20 + (idx * 10)}
                                                                    className={`w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-200 font-bold outline-none transition-all focus:border-yellow-500/50 placeholder:text-slate-700`}
                                                                    placeholder="BOG - MDE"
                                                                    value={flight.route}
                                                                    onChange={e => handleFlightChange(flight.id, 'route', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">Aerolínea</label>
                                                                <input
                                                                    tabIndex={21 + (idx * 10)}
                                                                    className={`w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white font-bold outline-none uppercase transition-all focus:border-yellow-500/50 placeholder:text-slate-700 ${showErrors && (!flight.airline || String(flight.airline).trim() === '') ? 'border-red-500/50' : ''}`}
                                                                    placeholder="AVIANCA"
                                                                    value={flight.airline}
                                                                    onChange={e => handleFlightChange(flight.id, 'airline', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">No. de Vuelo</label>
                                                                <input
                                                                    tabIndex={22 + (idx * 10)}
                                                                    className={`w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-300 font-mono outline-none transition-all focus:border-yellow-500/50 placeholder:text-slate-700 ${showErrors && (!flight.flight || String(flight.flight).trim() === '') ? 'border-red-500/50' : ''}`}
                                                                    placeholder="AV8532"
                                                                    value={flight.flight}
                                                                    onChange={e => handleFlightChange(flight.id, 'flight', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">Clase de Servicio</label>
                                                            <select
                                                                tabIndex={23 + (idx * 10)}
                                                                className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-400 font-bold outline-none transition-all focus:border-yellow-500/50 appearance-none cursor-pointer"
                                                                value={flight.class}
                                                                onChange={e => handleFlightChange(flight.id, 'class', e.target.value)}
                                                            >
                                                                <option value="Económica">ECONÓMICA</option>
                                                                <option value="Ejecutiva">EJECUTIVA / BUSINESS</option>
                                                                <option value="Primera">PRIMERA CLASE</option>
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Columna Derecha: Logística y Notas */}
                                                    <div className="flex-1 space-y-4">
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">Fecha</label>
                                                                <div className="relative">
                                                                    <input
                                                                        tabIndex={24 + (idx * 10)}
                                                                        type="date"
                                                                        className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-300 outline-none transition-all focus:border-yellow-500/50"
                                                                        value={flight.flightDate}
                                                                        onChange={e => handleFlightChange(flight.id, 'flightDate', e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">Salida</label>
                                                                <input
                                                                    tabIndex={25 + (idx * 10)}
                                                                    type="time"
                                                                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-300 outline-none transition-all focus:border-yellow-500/50"
                                                                    value={flight.depTime}
                                                                    onChange={e => handleFlightChange(flight.id, 'depTime', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">Llegada</label>
                                                                <input
                                                                    tabIndex={26 + (idx * 10)}
                                                                    type="time"
                                                                    className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-2.5 text-slate-300 outline-none transition-all focus:border-yellow-500/50"
                                                                    value={flight.arrTime}
                                                                    onChange={e => handleFlightChange(flight.id, 'arrTime', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col h-full">
                                                            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5 ml-1">Observaciones del Trayecto</label>
                                                            <textarea
                                                                tabIndex={27 + (idx * 10)}
                                                                className={`w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-300 text-sm outline-none transition-all focus:border-yellow-500/50 resize-none placeholder:text-slate-700 overflow-y-auto custom-scrollbar ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                                placeholder="Detalles adicionales del vuelo, escalas, equipaje incluido..."
                                                                style={{ height: '115px' }}
                                                                value={flight.observaciones || ''}
                                                                onChange={e => handleFlightChange(flight.id, 'observaciones', e.target.value)}
                                                                readOnly={isReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {
                                (flights && flights.length > 0) && activeSubTab !== 'terrestre' && (
                                    <LuggageIncludedCard value={luggage} onChange={setLuggage} />
                                )
                            }

                            {/* Logística de Encuentro (solo Porción Terrestre) */}
                            {
                                activeSubTab === 'terrestre' && (
                                    <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-2 transition-all"></div>
                                        <div className="flex justify-between items-center mb-6 pl-4">
                                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <Car className="w-5 h-5 text-emerald-400" /> Detalles del Transporte Terrestre
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Punto de Partida</label>
                                                <input
                                                    ref={firstFieldStep2Ref}
                                                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white outline-none ${showErrors && !isFilled(groundLogistics.meetPoint) ? 'border-red-500/50' : 'border-slate-700'} ${isReadOnly ? 'opacity-70' : ''}`} placeholder="Terminal Salitre - Bogotá" value={groundLogistics.meetPoint} onChange={e => setGroundLogistics({ ...groundLogistics, meetPoint: e.target.value })} readOnly={isReadOnly}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Fecha de Encuentro</label>
                                                <input type="date" className={`w-full bg-slate-900 border rounded-xl p-3 text-white outline-none ${showErrors && !isFilled(groundLogistics.meetDate) ? 'border-red-500/50' : 'border-slate-700'} ${isReadOnly ? 'opacity-70' : ''}`} value={groundLogistics.meetDate} onChange={e => setGroundLogistics({ ...groundLogistics, meetDate: e.target.value })} readOnly={isReadOnly} />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Hora de Encuentro</label>
                                                <input type="time" className={`w-full bg-slate-900 border rounded-xl p-3 text-white outline-none ${showErrors && !isFilled(groundLogistics.meetTime) ? 'border-red-500/50' : 'border-slate-700'} ${isReadOnly ? 'opacity-70' : ''}`} value={groundLogistics.meetTime} onChange={e => setGroundLogistics({ ...groundLogistics, meetTime: e.target.value })} readOnly={isReadOnly} />
                                            </div>

                                        </div>
                                    </section>
                                )
                            }

                            {/* Hoteles */}
                            <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 group-hover:w-2 transition-all"></div>
                                <div className="flex justify-between items-center mb-6 pl-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Ship className="w-5 h-5 text-yellow-400" /> Alojamiento
                                    </h3>
                                    <button
                                        onClick={!isReadOnly ? addHotel : undefined}
                                        disabled={isReadOnly}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${isReadOnly ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white'}`}
                                    >
                                        <Plus className="w-3 h-3" /> Agregar
                                    </button>
                                </div>
                                <div className="grid gap-4">
                                    {hotels.map((hotel, idx) => (
                                        <div key={hotel.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 space-y-4">
                                            <div className="flex flex-col gap-4">
                                                {/* Encabezado y Campos de Datos */}
                                                <div className="flex flex-wrap lg:flex-nowrap gap-4 items-end">
                                                    {/* Indicador de Opción */}
                                                    <div className="flex-none pb-2.5">
                                                        <div className="bg-yellow-600/10 border border-yellow-500/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]"></div>
                                                            <span className="text-[10px] text-yellow-500 font-black uppercase tracking-tighter">Opción {idx + 1}</span>
                                                        </div>
                                                    </div>

                                                    {/* Nombre del Alojamiento */}
                                                    <div className="flex-[2] min-w-[200px]">
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 ml-1 block tracking-wider">Nombre del Alojamiento</label>
                                                        <input
                                                            tabIndex={100 + (idx * 10)}
                                                            className={`w-full bg-slate-900/60 border ${showErrors && (!hotel.name || String(hotel.name).trim() === '') ? 'border-red-500/50' : 'border-slate-700/50'} rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-yellow-500/50 transition-all placeholder:text-slate-700`}
                                                            placeholder="Ej: Hard Rock Hotel & Casino"
                                                            value={hotel.name}
                                                            onChange={e => handleHotelChange(hotel.id, 'name', e.target.value)}
                                                            readOnly={isReadOnly}
                                                        />
                                                    </div>

                                                    {/* Categoría */}
                                                    <div className="flex-1 min-w-[120px]">
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 ml-1 block tracking-wider">Categoría</label>
                                                        <input
                                                            tabIndex={101 + (idx * 10)}
                                                            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-300 text-xs font-bold outline-none focus:border-yellow-500/50 transition-all placeholder:text-slate-700 uppercase"
                                                            placeholder="5 ESTRELLAS"
                                                            value={hotel.category}
                                                            onChange={e => handleHotelChange(hotel.id, 'category', e.target.value)}
                                                            readOnly={isReadOnly}
                                                        />
                                                    </div>

                                                    {/* Habitación */}
                                                    <div className="flex-1 min-w-[120px]">
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 ml-1 block tracking-wider">Habitación</label>
                                                        <input
                                                            tabIndex={102 + (idx * 10)}
                                                            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-300 text-xs font-bold outline-none focus:border-yellow-500/50 transition-all placeholder:text-slate-700 uppercase"
                                                            placeholder="DELUXE GOLD"
                                                            value={hotel.room}
                                                            onChange={e => handleHotelChange(hotel.id, 'room', e.target.value)}
                                                            readOnly={isReadOnly}
                                                        />
                                                    </div>

                                                    {/* Plan de Alimentación */}
                                                    <div className="flex-[1.5] min-w-[180px]">
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase mb-1.5 ml-1 block tracking-wider">Plan de Alimentación</label>
                                                        <input
                                                            tabIndex={103 + (idx * 10)}
                                                            className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-slate-300 text-xs font-bold outline-none focus:border-yellow-500/50 transition-all placeholder:text-slate-700 uppercase"
                                                            placeholder="TODO INCLUIDO"
                                                            value={hotel.observaciones || ''}
                                                            onChange={e => handleHotelChange(hotel.id, 'observaciones', e.target.value)}
                                                            readOnly={isReadOnly}
                                                        />
                                                    </div>

                                                    {/* Acciones y Toggles */}
                                                    <div className="flex items-center gap-2 pb-0.5">
                                                        <div className="flex items-center gap-3 bg-slate-950/80 p-2 rounded-xl border border-slate-800 shadow-inner">
                                                            <div className="flex flex-col items-center gap-1 px-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleHotelChange(hotel.id, 'showGallery', !hotel.showGallery)}
                                                                    className={`w-7 h-3.5 rounded-full transition-all relative ${hotel.showGallery ? 'bg-emerald-600' : 'bg-slate-700'}`}
                                                                    disabled={isReadOnly}
                                                                >
                                                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${hotel.showGallery ? 'right-0.5' : 'left-0.5'}`}></div>
                                                                </button>
                                                                <span className="text-[7px] text-slate-500 font-black uppercase">GAL</span>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1 px-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleHotelChange(hotel.id, 'showItinerary', !hotel.showItinerary)}
                                                                    className={`w-7 h-3.5 rounded-full transition-all relative ${hotel.showItinerary ? 'bg-blue-600' : 'bg-slate-700'}`}
                                                                    disabled={isReadOnly}
                                                                >
                                                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${hotel.showItinerary ? 'right-0.5' : 'left-0.5'}`}></div>
                                                                </button>
                                                                <span className="text-[7px] text-slate-500 font-black uppercase">ITI</span>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-1 px-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleHotelChange(hotel.id, 'showExpectedHotels', !hotel.showExpectedHotels)}
                                                                    className={`w-7 h-3.5 rounded-full transition-all relative ${hotel.showExpectedHotels ? 'bg-purple-600' : 'bg-slate-700'}`}
                                                                    disabled={isReadOnly}
                                                                >
                                                                    <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${hotel.showExpectedHotels ? 'right-0.5' : 'left-0.5'}`}></div>
                                                                </button>
                                                                <span className="text-[7px] text-slate-500 font-black uppercase">PRE</span>
                                                            </div>
                                                        </div>

                                                        {!isReadOnly && (
                                                            <button
                                                                onClick={() => removeHotel(hotel.id)}
                                                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-xl transition-all shadow-xl active:scale-90 flex-shrink-0"
                                                                title="Eliminar Opción"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* MÓDULO: Itinerario (Opción Específica) */}
                                            {hotel.showItinerary && (() => {
                                                const DEFAULT_ITINERARY = `Día 1º (L): América\nSalida en vuelo intercontinental con destino a Madrid.\n\nDía 2º (M): Madrid\nLlegada y traslado al hotel.\nTiempo libre para hacer nuestro primer contacto con la ciudad.\nRegreso al hotel.\nA última hora de la tarde haremos un recorrido por el Madrid iluminado y además podremos, en uno de los múltiples mesones, degustar las sabrosas tapas. (Cena de tapas y Madrid iluminado incluidas)\nAlojamiento.\n\nDía 3º (X): Madrid\nDesayuno buffet.\nSalida para efectuar la visita de la ciudad y sus principales monumentos y el Madrid moderno. (Almuerzo incluido).\nPor la tarde sugerimos hacer una excursión a la vecina ciudad imperial de Toledo, pasear por sus calles y respirar su ambiente medieval. (Visita a Toledo incluida).\nAlojamiento.\n\nDía 4º (J): Madrid / San Sebastián / Burdeos (690 Km)\nDesayuno buffet y salida hacia San Sebastián, "la bella Easo".\nBreve panorámica en bus de la ciudad.\nContinuación hacia Francia.\nLlegada a Burdeos.\nAlojamiento.\n\nDía 5º (V): Burdeos / Región del Loire / París (610 Km)\nDesayuno buffet y salida hacia la región de los castillos del Loire donde tendremos la oportunidad de hacer una parada y admirar exteriormente uno de sus famosos Castillos.\nBreve parada y continuación a París.\nAlojamiento.\n\nDía 6º (S): París\nDesayuno buffet.\nSalida para efectuar el recorrido de la ciudad, sus principales avenidas y monumentos acabando en la Torre Eiffel, teniendo la oportunidad de subir a la misma para admirar desde allí una bella panorámica de todo París. (Subida a la Torre Eiffel 2º piso incluida).\nNuestra visita terminará en el centro de la ciudad.\nTarde libre. Tendremos la oportunidad de hacer un paseo en el famoso Bateaux Mouche por el Sena (Paseo incluido).\nAlojamiento.\n\nDía 7º (D): París\nDesayuno buffet en el hotel.\nDestinaremos este día a pasear libremente por la ciudad, sus paseos y bulevares.\nSugerimos hacer una visita opcional a Versalles para visitar su bello palacio y famosos jardines.\nPor la noche podremos asistir a un espectáculo en un cabaret Parisino y degustar una copa de champagne. (Cabaret Paradis Latin con bebidas incluido)\nAlojamiento.\n\nDía 8º (L): París / Bruselas (252 Km)\nDesayuno buffet y salida hacia Bruselas.\nLlegada y visita panorámica de la ciudad con la espléndida catedral de Saint-Michel, la Colonne du Congrès, el Atomium, la Place Royale, Palacio Real y la Grand Place.\nTiempo libre.\nPor la noche podremos disfrutar de una cena típica en el entorno de la Grand Place. (Cena típica incluida).\nAlojamiento.\n\nDía 9º (M): Bruselas / Gante / Brujas (168 Km)\nDesayuno buffet y salida hacia Gante, con su magnífica catedral de San Bavon y el casco antiguo medieval.\nContinuación a Brujas, preciosa ciudad con sus innumerables canales. (Almuerzo incluido).\nVisita de la ciudad: el Lago de Amor, el Beaterio, la Plaza Mayor y Atalaya.\nAlojamiento.\n\nDía 10º (X): Brujas / Amberes / La Haya / Ámsterdam (280 Km)\nDesayuno buffet y salida para Amberes, la ciudad de Rubens y el segundo puerto en importancia de Europa.\nNos detendremos en su Plaza Mayor. Tiempo libre y continuación a La Haya.\nLlegada a Ámsterdam al mediodía.\nPor la tarde visita de la ciudad a bordo de un barco por sus canales. Al final, visita a una fábrica de talla de diamantes.\nAlojamiento.\n\nDía 11º (J): Ámsterdam\nDesayuno buffet en el hotel. Breve visita panorámica en bus.\nDía libre. Sugerimos visitar Volendam y Marken; también una fábrica de queso holandés. (Visita y almuerzo incluido).\nAlojamiento.\n\nDía 12º (V): Ámsterdam / Colonia / El Rin / Frankfurt (510 Km)\nDesayuno buffet y salida hacia Colonia. Tiempo libre para visitar su bella catedral.\nCrucero por el río Rin hasta St Goar (Almuerzo snack en el barco incluido).\nContinuación a Frankfurt. Tiempo libre para recorrer su centro histórico y la plaza de Romer.\nAlojamiento.\n\nDía 13º (S): Frankfurt / Heidelberg / Lucerna / Zúrich (514 Km)\nDesayuno buffet y salida hacia Heidelberg, ciudad universitaria con casco antiguo y castillo.\nContinuación bordeando la Selva Negra hacia Basilea para entrar en Suiza. Parada en Lucerna a orillas del lago de los Cuatro Cantones.\nContinuación a Zúrich, la capital financiera del país.\nAlojamiento.\n\nDía 14º (D): Zúrich / Milán / Venecia (557 Km)\nDesayuno y salida atravesando los lagos de Lugano y Como llegando a Milán.\nTiempo libre para visitar el Duomo, la Galleria y el teatro Alla Scala. Continuación a Venecia.\nAlojamiento.\n\nDía 15º (L): Venecia / Padua / Florencia (475 Km)\nDesayuno buffet. Visita de la ciudad a pie finalizando en la Plaza de San Marcos, incluyendo visita a un taller de cristal veneciano.\nPaseo en Góndola por los canales venecianos. (Paseo en góndola incluido).\nSalida a Padua — Basílica de San Antonio. Continuación a Florencia.\nAlojamiento.\n\nDía 16º (M): Florencia / Roma (290 Km)\nDesayuno buffet. Recorrido por el Duomo, el Campanile de Giotto, el Baptisterio, la Plaza de la Signoria y el Ponte Vecchio. (Almuerzo incluido).\nPor la tarde salida hacia Roma.\nAlojamiento.\n\nDía 17º (X): Roma\nDesayuno buffet.\nVisita al Vaticano incluyendo museos y Capilla Sixtina. (Visita al museo vaticano incluida).\nRecorrido panorámico de la ciudad eterna. (Almuerzo incluido).\nPor la tarde, opcionalmente, Roma barroca.\nAlojamiento.\n\nDía 18º (J): Roma\nDesayuno y día libre en Roma.\nSugerimos excursión a Nápoles y la bella isla de Capri.\nAlojamiento.\n\nDía 19º (V): Roma / Pisa / Cannes o Costa Azul (653 Km)\nDesayuno buffet y salida hacia Pisa. Tiempo libre para visitar la Torre Inclinada. (Almuerzo incluido).\nContinuación por la Riviera de las Flores llegando a Costa Azul o Cannes.\nAlojamiento.\n\nDía 20º (S): Cannes o Costa Azul / Barcelona (682 Km)\nDesayuno. Salida a Arles, Nimes, Montpellier.\nLlegada a Barcelona con breve recorrido panorámico.\nAlojamiento.\n\nDía 21º (D): Barcelona / Zaragoza / Madrid (630 Km)\nDesayuno buffet. Salida hacia Zaragoza con parada en la Basílica del Pilar.\nContinuación a Madrid.\nAlojamiento.\n\nDía 22º (L): Madrid\nDesayuno buffet. A la hora prevista traslado al aeropuerto para tomar el vuelo de regreso a América.`;

                                                // Auto-poblar texto cuando se activa por primera vez
                                                if (!hotel.itineraryText) {
                                                    setTimeout(() => handleHotelChange(hotel.id, 'itineraryText', DEFAULT_ITINERARY), 0);
                                                }

                                                return (
                                                    <div className="border-t border-slate-800 pt-4 mb-4 animate-fade-in">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <label className="text-[10px] text-blue-400 uppercase font-black tracking-tight flex items-center gap-2">
                                                                <ClipboardList className="w-3 h-3" /> Itinerario Específico — Opción {idx + 1}
                                                            </label>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleHotelChange(hotel.id, 'itineraryEditing', !hotel.itineraryEditing)}
                                                                className={`p-1.5 rounded-lg transition-all ${hotel.itineraryEditing ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                                                                title="Editar itinerario para esta opción"
                                                                disabled={isReadOnly}
                                                            >
                                                                <Settings className={`w-3.5 h-3.5 ${hotel.itineraryEditing ? 'animate-spin-slow' : ''}`} />
                                                            </button>
                                                        </div>

                                                        {hotel.itineraryEditing && !isReadOnly ? (
                                                            <textarea
                                                                className="w-full bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-slate-200 text-[11px] leading-relaxed outline-none focus:border-blue-500 transition-all h-64 font-mono"
                                                                value={hotel.itineraryText || ''}
                                                                onChange={(e) => handleHotelChange(hotel.id, 'itineraryText', e.target.value)}
                                                                placeholder="Un día por línea..."
                                                            />
                                                        ) : (
                                                            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/30 max-h-48 overflow-y-auto custom-scrollbar">
                                                                <pre className="whitespace-pre-wrap text-slate-400 text-[11px] leading-relaxed font-sans">
                                                                    {hotel.itineraryText || DEFAULT_ITINERARY}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        <p className="mt-2 text-[9px] text-slate-600 italic flex items-center gap-1">
                                                            <AlertCircle className="w-2.5 h-2.5" />
                                                            {hotel.itineraryEditing ? 'Cada día en su línea. Los cambios aplican solo a esta opción.' : 'Texto predeterminado del itinerario. Use ⚙️ para personalizar.'}
                                                        </p>
                                                    </div>
                                                );
                                            })()}

                                            {/* Galería (3 Fotos estandarizadas) vinculada a este hotel */}
                                            {hotel.showGallery && (
                                                <div className="border-t border-slate-800 pt-4 mb-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex flex-col">
                                                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-tight flex items-center gap-2">
                                                                <Camera className="w-3 h-3" /> Galería de Fotos - Opción {idx + 1}
                                                                <span className="text-yellow-500/60">({hotel.images?.length || 0}/3)</span>
                                                            </label>
                                                            <p className="text-[8px] text-slate-600 font-medium tracking-tight mt-0.5 italic">
                                                                Ideal: Foto horizontal, resolución HD, máx 2MB (JPG/PNG).
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        {[0, 1, 2].map((i) => (
                                                            <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group/img">
                                                                {hotel.images && hotel.images[i] ? (
                                                                    <>
                                                                        <img src={hotel.images[i]} className="w-full h-full object-cover group-hover/img:opacity-50 transition-opacity" alt={`Hotel ${i}`} />
                                                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all gap-2">
                                                                            {!isReadOnly && (
                                                                                <>
                                                                                    <label className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-cyan-900/40">
                                                                                        Cambiar Foto
                                                                                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                                                            const compressed = await processImageUpload(e);
                                                                                            if (compressed) {
                                                                                                const newImages = [...hotel.images];
                                                                                                newImages[i] = compressed;
                                                                                                handleHotelChange(hotel.id, 'images', newImages);
                                                                                            }
                                                                                        }} />
                                                                                    </label>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            const newImages = hotel.images.filter((_, imgIdx) => imgIdx !== i);
                                                                                            handleHotelChange(hotel.id, 'images', newImages);
                                                                                        }}
                                                                                        className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/40"
                                                                                    >
                                                                                        Eliminar
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <label className={`w-full h-full flex flex-col items-center justify-center ${isReadOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-slate-800'} transition-colors`}>
                                                                        <ImageIcon className="w-8 h-8 text-slate-700 mb-2" />
                                                                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Añadir Foto</span>
                                                                        {!isReadOnly && (
                                                                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                                                                                const compressed = await processImageUpload(e);
                                                                                if (compressed) {
                                                                                    handleHotelChange(hotel.id, 'images', [...(hotel.images || []), compressed]);
                                                                                }
                                                                            }} />
                                                                        )}
                                                                    </label>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* MÓDULO: Hoteles Previstos o Similares */}
                                            {hotel.showExpectedHotels && (
                                                <div className="border-t border-slate-800 pt-4 animate-fade-in">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex flex-col">
                                                            <label className="text-[10px] text-purple-400 uppercase font-black tracking-tight flex items-center gap-2">
                                                                <FileText className="w-3 h-3" /> Hoteles Previstos o Similares - Opción {idx + 1}
                                                            </label>
                                                            <p className="text-[8px] text-slate-600 font-medium tracking-tight mt-0.5 italic">
                                                                Muestra la tabla de hoteles sugeridos para este itinerario.
                                                            </p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 items-center justify-end">
                                                            {!isReadOnly && (
                                                                <label className="cursor-pointer bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-white text-[9px] font-bold py-2 px-4 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all flex items-center gap-2 shadow-xl">
                                                                    <RefreshCcw className="w-3 h-3" /> Cambiar Imagen
                                                                    <input
                                                                        type="file"
                                                                        className="hidden"
                                                                        accept="image/*"
                                                                        onChange={async (e) => {
                                                                            const compressed = await processImageUpload(e);
                                                                            if (compressed) {
                                                                                handleHotelChange(hotel.id, 'expectedHotelsImage', compressed);
                                                                            }
                                                                        }}
                                                                    />
                                                                </label>
                                                            )}
                                                            {!isReadOnly && hotel.expectedHotelsImage !== '/images/hoteles_previstos_default.png' && (
                                                                <button
                                                                    onClick={() => handleHotelChange(hotel.id, 'expectedHotelsImage', '/images/hoteles_previstos_default.png')}
                                                                    className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[9px] font-bold py-2 px-4 rounded-xl border border-red-500/20 transition-all flex items-center gap-2 shadow-xl"
                                                                >
                                                                    <Trash2 className="w-3 h-3" /> Restablecer
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="relative group rounded-xl overflow-hidden border border-slate-700/50 bg-slate-950 p-2">
                                                        <img
                                                            src={hotel.expectedHotelsImage}
                                                            alt="Hoteles Previstos"
                                                            className="w-full max-h-[400px] object-contain mx-auto"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/800x600?text=Cargue+la+tabla+de+hoteles+previstos';
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>



                            {/* RESUMEN DE INVERSIÓN - OPCIONES COMPARATIVAS */}
                            <div className="space-y-6">
                                {hotels.map((hotel, hIdx) => (
                                    <section key={hotel.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-2 transition-all"></div>
                                        <div className="pl-4 mb-5 flex justify-between items-start">
                                            <div>
                                                <div className="text-[10px] text-emerald-400 font-black uppercase mb-1 tracking-widest flex items-center gap-2">
                                                    <CheckCircle className="w-3 h-3" /> Opción {hIdx + 1} vinculada
                                                </div>
                                                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                    <DollarSign className="w-5 h-5 text-emerald-400" /> Propuesta Económica: {hotel.name || 'Sin Nombre'}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Desglose de inversión exclusivo para este alojamiento.
                                                </p>
                                            </div>

                                            {hIdx === 0 && (
                                                <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700/50">
                                                    <button type="button" onClick={() => setCurrency('COP')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${currency === 'COP' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>COP</button>
                                                    <div className="w-px bg-slate-700/50 my-1 mx-1"></div>
                                                    <button type="button" onClick={() => setCurrency('USD')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>USD</button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pl-4 space-y-3">
                                            {/* Fila: Adultos (Afiliados / General) */}
                                            <div className="grid grid-cols-12 items-center gap-3">
                                                <div className="col-span-12 sm:col-span-5">
                                                    <label className="text-xs text-slate-400 mb-1 block">
                                                        {quoteType === 'vacacional' ? `Tarifa Adulto (${currency})` : `Tarifa Adulto Afiliado (${currency})`}
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                        <input
                                                            tabIndex={120 + (hIdx * 10)}
                                                            type="number" className="w-full pl-7 pr-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white text-sm outline-none focus:border-emerald-500 transition-all"
                                                            placeholder="0.00" value={hotel.pricing.adultAffiliateRate}
                                                            onChange={(e) => handleHotelPricingChange(hotel.id, 'adultAffiliateRate', e.target.value)}
                                                            readOnly={isReadOnly}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="hidden sm:block col-span-2 text-center text-slate-500 text-sm pt-5">× {clientData.adultsAffiliate || 0}</div>
                                                <div className="col-span-12 sm:col-span-5">
                                                    <label className="text-xs text-slate-400 mb-1 block">
                                                        {quoteType === 'vacacional' ? 'Subtotal Adultos' : 'Subtotal (Afiliados)'}
                                                    </label>
                                                    <div className="px-3 py-2.5 bg-slate-900/30 border border-slate-700/30 rounded-xl text-emerald-300 text-sm font-semibold">
                                                        {currency} {((parseFloat(hotel.pricing.adultAffiliateRate) || 0) * (parseInt(clientData.adultsAffiliate) || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Fila: Adultos (No Afiliados) */}
                                            {quoteType !== 'vacacional' && (clientData.adultsNonAffiliate > 0 || hotel.pricing.adultNonAffiliateRate > 0) && (
                                                <div className="grid grid-cols-12 items-center gap-3">
                                                    <div className="col-span-12 sm:col-span-5">
                                                        <label className="text-xs text-slate-400 mb-1 block">Tarifa Adulto No Afiliado ({currency})</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                            <input
                                                                tabIndex={121 + (hIdx * 10)}
                                                                type="number" className="w-full pl-7 pr-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white text-sm outline-none focus:border-emerald-500 transition-all"
                                                                placeholder="0.00" value={hotel.pricing.adultNonAffiliateRate}
                                                                onChange={(e) => handleHotelPricingChange(hotel.id, 'adultNonAffiliateRate', e.target.value)}
                                                                readOnly={isReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:block col-span-2 text-center text-slate-500 text-sm pt-5">× {clientData.adultsNonAffiliate || 0}</div>
                                                    <div className="col-span-12 sm:col-span-5">
                                                        <label className="text-xs text-slate-400 mb-1 block">Subtotal (No Afiliados)</label>
                                                        <div className="px-3 py-2.5 bg-slate-900/30 border border-slate-700/30 rounded-xl text-emerald-300 text-sm font-semibold">
                                                            {currency} {((parseFloat(hotel.pricing.adultNonAffiliateRate) || 0) * (parseInt(clientData.adultsNonAffiliate) || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fila: Niños */}
                                            {(parseInt(clientData.children) > 0 || parseFloat(hotel.pricing.childRate) > 0) && (
                                                <div className="grid grid-cols-12 items-center gap-3">
                                                    <div className="col-span-12 sm:col-span-5">
                                                        <label className="text-xs text-slate-400 mb-1 block">Tarifa Niño ({currency})</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                            <input
                                                                tabIndex={122 + (hIdx * 10)}
                                                                type="number" className="w-full pl-7 pr-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white text-sm outline-none focus:border-emerald-500 transition-all"
                                                                placeholder="0.00" value={hotel.pricing.childRate}
                                                                onChange={(e) => handleHotelPricingChange(hotel.id, 'childRate', e.target.value)}
                                                                readOnly={isReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:block col-span-2 text-center text-slate-500 text-sm pt-5">× {clientData.children || 0}</div>
                                                    <div className="col-span-12 sm:col-span-5">
                                                        <label className="text-xs text-slate-400 mb-1 block">Subtotal (Niños)</label>
                                                        <div className="px-3 py-2.5 bg-slate-900/30 border border-slate-700/30 rounded-xl text-emerald-300 text-sm font-semibold">
                                                            {currency} {((parseFloat(hotel.pricing.childRate) || 0) * (parseInt(clientData.children) || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Fila: Infantes */}
                                            {(parseInt(clientData.infants) > 0 || parseFloat(hotel.pricing.infantRate) > 0) && (
                                                <div className="grid grid-cols-12 items-center gap-3">
                                                    <div className="col-span-12 sm:col-span-5">
                                                        <label className="text-xs text-slate-400 mb-1 block">Tarifa Infante ({currency})</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                            <input
                                                                tabIndex={123 + (hIdx * 10)}
                                                                type="number" className="w-full pl-7 pr-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-white text-sm outline-none focus:border-emerald-500 transition-all"
                                                                placeholder="0.00" value={hotel.pricing.infantRate}
                                                                onChange={(e) => handleHotelPricingChange(hotel.id, 'infantRate', e.target.value)}
                                                                readOnly={isReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="hidden sm:block col-span-2 text-center text-slate-500 text-sm pt-5">× {clientData.infants || 0}</div>
                                                    <div className="col-span-12 sm:col-span-5">
                                                        <label className="text-xs text-slate-400 mb-1 block">Subtotal (Infantes)</label>
                                                        <div className="px-3 py-2.5 bg-slate-900/30 border border-slate-700/30 rounded-xl text-emerald-300 text-sm font-semibold">
                                                            {currency} {((parseFloat(hotel.pricing.infantRate) || 0) * (parseInt(clientData.infants) || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t border-slate-700/50 my-2"></div>

                                            <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20">
                                                <div>
                                                    <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mb-1">Valor Total de la Opción</div>
                                                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                                                        <span className="text-lg text-emerald-500">{currency} $</span>
                                                        {parseFloat(hotel.pricing.totalToPay || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                                <div className="bg-slate-800/80 px-4 py-2 rounded-full border border-emerald-500/20">
                                                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Cálculo Automático</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </div >

                    )
                    }

                    {/* PASO 3: REVISIÓN Y EXTRAS */}
                    {
                        currentStep === 3 && (
                            <div
                                className="space-y-8 animate-fade-in"
                                onKeyDown={(e) => handleFocusTrap(e, firstFieldStep3Ref, btnNextStepRef)}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl">
                                        <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" /> Incluye a cotización general
                                        </h3>
                                        <textarea
                                            ref={firstFieldStep3Ref}
                                            tabIndex={200}
                                            className={`w-full bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3 text-emerald-100/90 text-sm leading-relaxed outline-none focus:border-emerald-500 transition-all h-40 resize-none custom-scrollbar ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
                                            placeholder="Describa los servicios incluidos (ej. Traslados, Desayunos, City Tour)..."
                                            value={extras.includes || ''}
                                            onChange={(e) => setExtras({ ...extras, includes: e.target.value })}
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl">
                                        <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5" /> No Incluye
                                        </h3>
                                        <textarea
                                            tabIndex={201}
                                            className={`w-full bg-transparent text-red-100/80 text-sm leading-relaxed outline-none resize-none h-40 placeholder-red-500/30 border ${showErrors && (!extras.excludes || String(extras.excludes).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`}
                                            placeholder="Ingrese los servicios no incluidos..." value={extras.excludes} onChange={e => setExtras({ ...extras, excludes: e.target.value })}></textarea>
                                    </div>
                                </div>



                                {/* OBSERVACIONES IMPORTANTES (Editable) */}
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-red-500/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-center mb-4 pl-4">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-400" /> Observaciones Importantes
                                        </h3>
                                        <button
                                            tabIndex={202}
                                            type="button"
                                            onClick={() => setIsEditingObservaciones(!isEditingObservaciones)}
                                            className={`p-2 rounded-lg transition-all ${isEditingObservaciones ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                                            title="Editar observaciones para esta cotización"
                                            disabled={isReadOnly}
                                        >
                                            <Settings className={`w-4 h-4 ${isEditingObservaciones ? 'animate-spin-slow' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="pl-4">
                                        {isEditingObservaciones && !isReadOnly ? (
                                            <textarea
                                                tabIndex={203}
                                                className="w-full bg-slate-900/80 border border-red-500/30 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-red-500 transition-all h-32 font-mono"
                                                value={observacionesImportantes}
                                                onChange={(e) => setObservacionesImportantes(e.target.value)}
                                                placeholder="Un ítem por línea..."
                                            />
                                        ) : (
                                            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                                                <pre className="whitespace-pre-wrap text-slate-400 text-xs leading-relaxed font-sans">
                                                    {observacionesImportantes}
                                                </pre>
                                            </div>
                                        )}
                                        <p className="mt-3 text-[10px] text-slate-500 italic flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" />
                                            {isEditingObservaciones ? 'Un ítem por línea. Los cambios aplican solo a esta cotización.' : 'Texto estándar protegido. Use el botón de edición para cambios puntuales.'}
                                        </p>
                                    </div>
                                </section>



                                {/* DOCUMENTOS REQUERIDOS (Editable) */}
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-center mb-4 pl-4">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-400" /> Documentos Requeridos
                                        </h3>
                                        <button
                                            tabIndex={204}
                                            type="button"
                                            onClick={() => setIsEditingDocuments(!isEditingDocuments)}
                                            className={`p-2 rounded-lg transition-all ${isEditingDocuments ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                                            title="Editar documentos requeridos para esta cotización"
                                        >
                                            <Settings className={`w-4 h-4 ${isEditingDocuments ? 'animate-spin-slow' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="pl-4">
                                        {isEditingDocuments ? (
                                            <textarea
                                                tabIndex={205}
                                                className="w-full bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-36 font-mono"
                                                value={documentsInfo}
                                                onChange={(e) => setDocumentsInfo(e.target.value)}
                                                placeholder="Un documento por línea..."
                                            />
                                        ) : (
                                            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                                                <pre className="whitespace-pre-wrap text-slate-400 text-xs leading-relaxed font-sans">
                                                    {documentsInfo}
                                                </pre>
                                            </div>
                                        )}
                                        <p className="mt-3 text-[10px] text-slate-500 italic flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" />
                                            {isEditingDocuments ? 'Un ítem por línea. Los cambios aplican solo a esta cotización.' : 'Texto pre-configurado. Use el botón de edición para agregar o quitar documentos.'}
                                        </p>
                                    </div>
                                </section>



                                {/* CONDICIONES GENERALES (Rediseñado: Unificado y Editable) */}
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-center mb-4 pl-4">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-blue-400" /> Condiciones Generales
                                        </h3>
                                        <button
                                            tabIndex={206}
                                            type="button"
                                            onClick={() => setIsEditingConditions(!isEditingConditions)}
                                            className={`p-2 rounded-lg transition-all ${isEditingConditions ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                                            title="Editar condiciones específicas para esta cotización"
                                        >
                                            <Settings className={`w-4 h-4 ${isEditingConditions ? 'animate-spin-slow' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="pl-4">
                                        {isEditingConditions ? (
                                            <textarea
                                                tabIndex={207}
                                                className="w-full bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-64 font-mono"
                                                value={generalConditions}
                                                onChange={(e) => setGeneralConditions(e.target.value)}
                                                placeholder="Ingrese las condiciones particulares..."
                                            />
                                        ) : (
                                            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                                                <pre className="whitespace-pre-wrap text-slate-400 text-xs leading-relaxed font-sans">
                                                    {generalConditions}
                                                </pre>
                                            </div>
                                        )}
                                        <p className="mt-3 text-[10px] text-slate-500 italic flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" />
                                            {isEditingConditions ? 'Los cambios aplicarán solo a esta cotización.' : 'Texto legal estándar protegido. Use el botón de edición para cambios puntuales.'}
                                        </p>
                                    </div>
                                </section>


                                {/* NOTA ACLARATORIA Y RESPALDO (Cierre Obligatorio) */}
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex justify-between items-center mb-4 pl-4">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <ShieldCheck className="w-5 h-5 text-blue-400" /> Nota Aclaratoria y Respaldo
                                        </h3>
                                        <button
                                            tabIndex={208}
                                            type="button"
                                            onClick={() => setIsEditingClosingNote(!isEditingClosingNote)}
                                            className={`p-2 rounded-lg transition-all ${isEditingClosingNote ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
                                            title="Editar nota aclaratoria para esta cotización"
                                            disabled={isReadOnly}
                                        >
                                            <Settings className={`w-4 h-4 ${isEditingClosingNote ? 'animate-spin-slow' : ''}`} />
                                        </button>
                                    </div>

                                    <div className="pl-4">
                                        {isEditingClosingNote && !isReadOnly ? (
                                            <textarea
                                                tabIndex={209}
                                                className="w-full bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-slate-200 text-xs leading-relaxed outline-none focus:border-blue-500 transition-all h-40 font-mono"
                                                value={closingNote}
                                                onChange={(e) => setClosingNote(e.target.value)}
                                                placeholder="Ingrese la nota aclaratoria..."
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        document.getElementById('btn-next-step')?.click();
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="bg-slate-900/40 rounded-xl p-5 border border-slate-700/30">
                                                <pre className="whitespace-pre-wrap text-slate-400 text-xs leading-relaxed font-sans italic">
                                                    {closingNote}
                                                </pre>
                                            </div>
                                        )}
                                        <p className="mt-3 text-[10px] text-slate-500 italic flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" />
                                            {isEditingClosingNote ? 'Los cambios aplicarán solo a esta cotización.' : 'Texto legal estándar protegido. Use el botón de edición para cambios puntuales.'}
                                        </p>
                                    </div>
                                </section>
                            </div>
                        )
                    }

                    {/* PASO 4: FINALIZACIÓN */}
                    {
                        currentStep === 4 && (
                            <div
                                className="flex flex-col items-center justify-center py-12 animate-fade-in space-y-8 text-center"
                                onKeyDown={(e) => handleFocusTrap(e, firstFieldStep4Ref, firstFieldStep4Ref)}
                            >
                                <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 relative">
                                    <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                                    <CheckCircle className="w-12 h-12 text-cyan-400" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-white mb-2">¡Cotización Lista!</h2>
                                    <p className="text-slate-400">La cotización ha sido completada con éxito. ¿Qué desea hacer?</p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
                                    <button
                                        ref={firstFieldStep4Ref}
                                        tabIndex={300}
                                        onClick={() => handleFinalSave(true)}
                                        className="group relative overflow-hidden rounded-2xl bg-slate-800 p-6 border border-slate-700 hover:border-cyan-500 transition-all w-full text-left">
                                        <div className="relative z-10 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                                {isSaving ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileDown className="w-6 h-6 text-slate-400 group-hover:text-white" />}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-lg">{isSaving ? 'Procesando...' : 'Descargar PDF'}</h4>
                                                <p className="text-slate-500 text-xs">{saveStatus || 'Guardar y generar documento'}</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </div >



                {/* Footer Navigation */}
                < div className="border-t border-slate-700/50 pt-6 mt-8 flex justify-between items-center relative z-10" >
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Anterior
                    </button>

                    {
                        currentStep < 4 ? (
                            <div className="flex flex-col items-end">
                                <button
                                    id="btn-next-step"
                                    ref={btnNextStepRef}
                                    tabIndex={currentStep === 1 ? 16 : (currentStep === 2 ? 150 : 210)}
                                    onClick={(e) => {
                                        e.preventDefault();


                                        try {
                                            if (!validateStep()) {

                                                setShowErrors(true);
                                                return;
                                            }
                                            setShowErrors(false);

                                            setCurrentStep(prev => {
                                                const n = Math.min(4, prev + 1);

                                                return n;
                                            });
                                        } catch (err) {

                                            alert("Error en navegación: " + err.message);
                                        }
                                    }}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                                >
                                    Siguiente Paso <ChevronRight className="w-4 h-4" />
                                </button>
                                {!validateStep() && showErrors && (
                                    <span className="mt-2 text-[11px] text-red-400 font-bold">Atención: Debes completar todos los campos para continuar</span>
                                )}
                            </div>
                        ) : (
                            <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                Proceso Finalizado
                            </div>
                        )
                    }
                </div >
            </div >
        );
    };



    const PipelineCard = ({ status, count, color }) => (
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 min-h-[400px]">
            <div className={`pb-3 border-b border-slate-700 mb-4 flex justify-between items-center`}>
                <span className={`font-bold text-${color}-400 uppercase tracking-wider text-xs`}>{status}</span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{count}</span>
            </div>
            <div className="space-y-3">
                {[1, 2].map(i => (
                    <div key={i} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 hover:border-blue-500/30 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-mono text-slate-500">COT-2026-00{i * 3}</span>
                            <div className={`w-2 h-2 rounded-full bg-${color}-500`}></div>
                        </div>
                        <p className="text-white font-bold text-sm mb-1">Familia {i === 1 ? 'González' : 'Smith'}</p>
                        <p className="text-xs text-slate-400">Cancún - 5 Pax</p>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">

            {/* MODAL DE RECUPERACIÓN DE BORRADOR */}
            {showDraftModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Save className="w-8 h-8 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Borrador Recuperado</h2>
                            <p className="text-slate-400 text-sm">
                                Encontramos un borrador guardado el{' '}
                                <span className="text-amber-300 font-bold">
                                    {savedDraftTime ? new Date(savedDraftTime).toLocaleString('es-CO') : 'sesión anterior'}
                                </span>.
                                ¿Deseas continuar desde donde lo dejaste?
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={discardDraft}
                                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
                            >
                                Descartar
                            </button>
                            <button
                                onClick={recoverDraft}
                                className="flex-1 px-4 py-3 rounded-xl bg-amber-600 text-white text-xs font-bold uppercase hover:bg-amber-500 transition-all shadow-lg shadow-amber-900/30 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" /> Recuperar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODO ADMINISTRADOR - PANTALLA COMPLETA */}
            {activeMainTab === 'admin' ? (
                <div className="w-full h-screen relative z-30">
                    <AdminPanel
                        config={adminConfig}
                        onUpdateConfig={handleAdminUpdate}
                        logs={auditLogs}
                        quotes={realQuotes}
                        isLoading={isLoadingAdminData}
                        onEditQuote={handleCorrectiveEdit}
                        onExit={() => {
                            setActiveMainTab('cotizaciones');
                        }}
                    />
                </div>
            ) : (
                <>
                    {/* Mobile Overlay */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* SIDEBAR (260px fixed width) */}
                    <aside className={`fixed md:relative top-0 left-0 z-40 w-[260px] h-screen bg-[#1e293b]/95 backdrop-blur-3xl border-r border-slate-700/50 flex flex-col shrink-0 overflow-hidden transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                        <div className="absolute top-4 right-4 md:hidden">
                            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 border-b border-slate-700/50">
                            <div className="flex items-center gap-3 mb-1">
                                <img src="/logo-destinos.png" alt="Destinos P&P" className="h-10 w-auto" />
                            </div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2 pl-1">
                                {(() => {
                                    if (location.pathname.includes('corporativo')) return 'CORPORATIVO';
                                    if (location.pathname.includes('contabilidad') || location.pathname.includes('finance')) return 'CONTABILIDAD';
                                    return 'VACACIONAL';
                                })()}
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">Gestión Integral de Viajes</p>
                        </div>

                        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                            {/* MENÚ COTIZACIONES */}
                            <div className="space-y-1">
                                <button
                                    onClick={() => {
                                        setIsQuotesOpen(!isQuotesOpen);
                                        setActiveMainTab('cotizaciones');
                                        setActiveSubTab(null);
                                        setIsEditing(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeMainTab === 'cotizaciones' ? 'bg-blue-600/20 text-blue-400 font-bold shadow-sm shadow-blue-900/10' : 'hover:bg-slate-800 text-slate-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5" />
                                        <span className="font-medium">Cotizaciones</span>
                                    </div>
                                    {isQuotesOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>

                                <AnimatePresence>
                                    {isQuotesOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4 space-y-1"
                                        >
                                            {quoteOptions
                                                .filter(type => {
                                                    const isCorp = location.pathname.includes('corporativo');
                                                    if (!isCorp && ['eventos', 'alojamiento', 'vacaciones-medida'].includes(type.id)) return false;
                                                    const modules = user?.modules || {};
                                                    if (modules.admin === 'full') return true;
                                                    if (['nacional', 'internacional', 'crucero', 'quince', 'grupos', 'hotel', 'terrestre'].includes(type.id)) return modules.vacacional === 'full';
                                                    return modules.corporativo === 'full' || user?.role === 'manager' || user?.role === 'admin';
                                                })
                                                .map(type => (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => {
                                                            setActiveMainTab('cotizaciones');
                                                            setActiveSubTab(type.id);
                                                            setIsEditing(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all ${activeMainTab === 'cotizaciones' && activeSubTab === type.id
                                                            ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-900/20'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                                            }`}
                                                    >
                                                        <type.icon className="w-4 h-4" />
                                                        {type.label}
                                                    </button>
                                                ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* PESTAÑA AYUDA - ACCESO DIRECTO */}
                            <button
                                onClick={() => {
                                    setActiveMainTab('ayuda');
                                    setActiveSubTab(null);
                                }}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeMainTab === 'ayuda'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Book className={`w-5 h-5 ${activeMainTab === 'ayuda' ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} />
                                <div className="text-left">
                                    <span className="block font-medium">Manual & Ayuda</span>
                                    <span className={`text-[10px] ${activeMainTab === 'ayuda' ? 'text-blue-200' : 'text-slate-600'}`}>Recursos y soporte</span>
                                </div>
                            </button>

                            {/* RESTO DE PESTAÑAS (Filtradas por Rol) */}
                            {mainTabs
                                .filter(item => {
                                    const modules = user?.modules || {};
                                    if (item.id === 'payments' || item.id === 'billing') return modules.contabilidad === 'full' || modules.admin === 'full';
                                    if (item.id === 'settings' || item.id === 'history') return true;
                                    if (item.id === 'confirmation' || item.id === 'reconfirm' || item.id === 'voucher') {
                                        return modules.vacacional === 'full' || modules.corporativo === 'full' || modules.admin === 'full';
                                    }
                                    return true;
                                })
                                .map(item => {
                                    // Lógica de acceso al Voucher
                                    const currentRole = user?.role || userRole;
                                    const isPrivileged = ['manager', 'accounting', 'admin'].includes(currentRole);
                                    const isVoucher = item.id === 'voucher';

                                    // El voucher se bloquea solo si es asesor (no privilegiado) y no ha completado facturación
                                    const blocked = isVoucher && !isPrivileged && !validateBilling();

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                if (blocked) {
                                                    setShowBillingErrors(true);
                                                    return;
                                                }
                                                setActiveMainTab(item.id);
                                                setActiveSubTab(null);
                                            }}
                                            title={blocked ? 'Atención: Completa “Tarifa Neta / Comisionable” antes de continuar' : ''}
                                            disabled={blocked}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeMainTab === item.id
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold'
                                                : blocked
                                                    ? 'text-slate-600 cursor-not-allowed bg-slate-800/40'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                }`}
                                        >
                                            <item.icon className={`w-5 h-5 ${activeMainTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                                            <div className="text-left">
                                                <span className="block font-medium">{item.label}</span>
                                                <span className={`text-[10px] ${activeMainTab === item.id ? 'text-blue-200' : 'text-slate-600'}`}>{item.desc}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                        </nav>

                        <div className="mt-auto px-4 py-4 space-y-4 border-t border-slate-700/60 bg-[#1e293b]/50 backdrop-blur-sm">
                            <TeamMonitor embedded={true} fullWidth={true} />
                            <button
                                onClick={() => { window.location.href = '/intranet'; }}
                                className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all text-[10px] font-bold uppercase tracking-[0.15em] group border border-slate-800 hover:border-slate-600 shadow-lg"
                            >
                                <X className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-red-400" />
                                Salir a Módulos
                            </button>
                        </div>


                    </aside>

                    {/* MAIN CONTENT (Flex-1 fluid width) */}
                    <main className="flex-1 overflow-y-auto bg-[#0f172a] relative">
                        <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/10 blur-[100px] pointer-events-none" />

                        <div className="relative z-10 p-4 md:p-8 min-h-full">
                            {/* Mobile Header */}
                            <div className="md:hidden flex items-center justify-between mb-6">
                                <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-800 rounded-lg text-white">
                                    <Menu className="w-6 h-6" />
                                </button>
                                <img src="/logo-destinos.png" alt="Destinos P&P" className="h-8 w-auto" />
                            </div>
                            {/* VISTA COTIZACIONES */}
                            {activeMainTab === 'ayuda' && (
                                <HelpSection
                                    userRole={userRole}
                                    advisorName={advisorName}
                                />
                            )}

                            {activeMainTab === 'cotizaciones' && (
                                <>
                                    <header className="flex justify-between items-center mb-8">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                                {activeSubTab ? `Cotizador de ${quoteOptions.find(q => q.id === activeSubTab)?.label}` : 'Módulo de Cotizaciones'}
                                            </h1>
                                            <p className="text-slate-400">Gestión de oportunidades y presupuestos.</p>
                                        </div>
                                        {!activeSubTab && (
                                            <div className="flex items-center gap-6 animate-fade-in">
                                                <div className="text-right hidden md:block">
                                                    <p className="text-white font-bold">Panel de Supervisión</p>
                                                    <p className="text-xs text-slate-400">Rol: {userRole === 'admin' ? 'Gerencia' : 'Asesoría'}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center border border-purple-400 shadow-lg shadow-purple-500/20">
                                                    <ShieldCheck className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="h-10 w-px bg-slate-700 mx-2"></div>
                                                <img src="/logo-destinos.png" alt="Destinos P&P" className="h-12 w-auto" />
                                            </div>
                                        )}
                                    </header>

                                    {/* Muestra el formulario de Cotización Inteligente (Vacacional/Corporativo) */}
                                    {activeSubTab ? (
                                        <div className="lg:col-span-12">
                                            {user?.role === 'accounting' ? (
                                                <SupervisionLockScreen
                                                    title="Acceso Denegado"
                                                    message="Su perfil de Contabilidad no tiene permisos para crear cotizaciones. Esta función está reservada para asesores y gerencia."
                                                />
                                            ) : (
                                                !['crucero', 'tiquetes', 'eventos', 'alojamiento', 'vacaciones-medida'].includes(activeSubTab) ? (
                                                    <SmartQuoteForm config={adminConfig} />
                                                ) : activeSubTab === 'tiquetes' ? (
                                                    <FlightQuoteForm />
                                                ) : activeSubTab === 'vacaciones-medida' ? (
                                                    <VacacionesMedidaForm />
                                                ) : activeSubTab === 'crucero' ? (
                                                    <CruiseQuoteForm />
                                                ) : activeSubTab === 'alojamiento' ? (
                                                    <AccommodationQuoteForm />
                                                ) : (
                                                    <EventQuoteForm />
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        // DASHBOARD DE SELECCIÓN (NUEVO)
                                        <div className="lg:col-span-12">
                                            {user?.role === 'accounting' ? (
                                                <SupervisionLockScreen
                                                    title="Acceso Denegado"
                                                    message="Su perfil de Contabilidad no tiene permisos para crear cotizaciones. Esta función está reservada para asesores y gerencia."
                                                />
                                            ) : (
                                                <QuoteSelectionDashboard />
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* OTRAS VISTAS */}
                            {activeMainTab === 'confirmation' && <ConfirmationView />}
                            {activeMainTab === 'payments' && <PaymentsView />}
                            {activeMainTab === 'billing' && <BillingView />}
                            {activeMainTab === 'voucher' && <VoucherView />}
                            {activeMainTab === 'reconfirm' && <ReconfirmView />}
                            {activeMainTab === 'history' && <HistoryView />}
                            {activeMainTab === 'settings' && <ConfigurationView
                                setActiveMainTab={setActiveMainTab}
                                setPreviewFolio={setPreviewFolio}
                                setActiveSubTab={setActiveSubTab}
                                cloneDataRef={cloneDataRef}
                                setIsReadOnly={setIsReadOnly}
                                StatusProgressBar={StatusProgressBar}
                                getProcessStep={getProcessStep}
                            />}
                        </div>
                    </main>
                </>
            )}
        </div>
    );
};

const ConfigurationView = ({ setActiveMainTab, setPreviewFolio, setActiveSubTab, cloneDataRef, setIsReadOnly, StatusProgressBar, getProcessStep }) => {
    const { user, updateProfile, changePassword } = useAuth();
    const [profileData, setProfileData] = useState({
        photo_url: user?.photo_url || '',
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        city: user?.city || '',
        address: user?.address || '',
        birth_date: user?.birth_date || '',
        language: user?.language || 'Español',
        professional_role: user?.professional_role || 'Asesora Comercial'
    });
    const [passwords, setPasswords] = useState({ next: '', confirm: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // El contador de documentos se movió a HistoryView por requerimiento de productividad individual.


    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateProfile(profileData);
            setMsg({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (err) {
            setMsg({ type: 'error', text: 'Error al actualizar: ' + err.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMsg({ type: '', text: '' }), 4000);
        }
    };

    const handleViewDetail = (row) => {
        const d = row.data || {};
        const isConf = !!d.serviceConfirmed;

        setPreviewFolio(row.folio);

        // Cargar los datos EXACTOS sin versionar
        cloneDataRef.current = {
            ...d,
            _sourceFolio: row.folio,
            _baseFolio: row.folio,
            _newFolio: row.folio
        };

        // Forzar modo solo lectura para ver el detalle
        if (setIsReadOnly) setIsReadOnly(true);

        if (isConf) {
            setActiveMainTab('confirmation');
        } else {
            setActiveMainTab('cotizaciones');
            // Mapeo exhaustivo para navegar al formulario correcto
            let serviceType = d.serviceType || d.quoteType || 'nacional';
            if (serviceType === 'vuelos') serviceType = 'tiquetes';
            if (serviceType === 'cruceros') serviceType = 'crucero';
            if (serviceType === 'alojamiento') serviceType = 'alojamiento';
            if (serviceType === 'eventos') serviceType = 'eventos';
            if (serviceType === 'vacaciones-medida') serviceType = 'vacaciones-medida';

            setActiveSubTab(serviceType);
        }
    };

    const handleReCotizar = async (row) => {
        const data = row.data || {};
        const originalFolio = row.folio;

        let baseFolio = originalFolio;
        let currentVersion = 0;

        const vMatch = originalFolio.match(/_v(\d+)$/);
        if (vMatch) {
            baseFolio = originalFolio.replace(/_v\d+$/, '');
            currentVersion = parseInt(vMatch[1]);
        }

        const nextVersion = currentVersion + 1;
        const newFolio = `${baseFolio}_v${nextVersion}`;

        cloneDataRef.current = {
            ...data,
            _sourceFolio: originalFolio,
            _baseFolio: baseFolio,
            _newFolio: newFolio
        };

        if (setIsReadOnly) setIsReadOnly(false);
        setPreviewFolio(newFolio);

        let serviceType = data.serviceType || data.quoteType || 'nacional';
        if (serviceType === 'vuelos') serviceType = 'tiquetes';
        if (serviceType === 'cruceros') serviceType = 'crucero';
        if (serviceType === 'alojamiento') serviceType = 'alojamiento';
        if (serviceType === 'eventos') serviceType = 'eventos';
        if (serviceType === 'vacaciones-medida') serviceType = 'vacaciones-medida';

        setActiveSubTab(serviceType);
        setActiveMainTab('cotizaciones');
    };

    const handleDownload = (row) => {
        const data = row.data || {};
        const isConfirmation = !!data.serviceConfirmed;

        const hotels = data.hotels || [];
        const extras = data.extras || {};

        let mergedIncludes = data.includes || '';
        if ((Array.isArray(mergedIncludes) && mergedIncludes.length === 0) || String(mergedIncludes).trim() === '') {
            mergedIncludes = Array.isArray(hotels) && hotels.length > 0
                ? hotels.map(h => h.includes || '').filter(Boolean).join('\n')
                : extras.includes || '';
        }


        const pdfOpts = {
            folio: row.folio,
            ...data,
            includes: mergedIncludes,
            excludes: data.excludes || extras.excludes || '',
            notes: data.notes || extras.notes || '',
            luggage: data.luggage || data.equipaje || { personal: true, hand: true, checked: false },
            advisorName: data.advisorName || user?.full_name,
            advisorRole: data.advisorRole || user?.professional_role
        };

        if (data.quoteType === 'eventos') {
            generateEventPdf(pdfOpts);
            return;
        }

        if (data.quoteType === 'alojamiento') {
            generateAccommodationPdf(pdfOpts);
            return;
        }

        if (data.quoteType === 'vacaciones-medida') {
            generateVacacionesMedidaPdf(pdfOpts);
            return;
        }

        if (isConfirmation) {
            generateConfirmationPdf(pdfOpts);
        } else {
            generateQuotePdf(pdfOpts);
        }
    };



    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header Simplificado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-400" />
                        Configuración de Cuenta
                    </h1>
                    <p className="text-slate-400 mt-2">Gestiona tu perfil profesional y parámetros de seguridad.</p>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario de Perfil */}
                <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700 overflow-hidden">
                                {profileData.photo_url ? (
                                    <img src={profileData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-8 h-8 text-slate-600" />
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 rounded-xl text-white shadow-lg hover:bg-blue-500 transition-all">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Datos del Asesor</h3>
                            <p className="text-slate-500 text-xs">Información que aparecerá en tus firmas</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Nombre Completo</label>
                                <input
                                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all"
                                    value={profileData.full_name}
                                    onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Cargo / Rol</label>
                                <input
                                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all"
                                    value={profileData.professional_role}
                                    onChange={e => setProfileData({ ...profileData, professional_role: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Celular Corporativo</label>
                                <input
                                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all"
                                    value={profileData.phone}
                                    onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Ciudad de Operación</label>
                                <input
                                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all"
                                    value={profileData.city}
                                    onChange={e => setProfileData({ ...profileData, city: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Dirección de Oficina</label>
                                <input
                                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all"
                                    value={profileData.address}
                                    onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Fecha de Cumpleaños</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all"
                                    value={profileData.birth_date}
                                    onChange={e => setProfileData({ ...profileData, birth_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest px-1">Idioma de Interfaz</label>
                                <select
                                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500 transition-all appearance-none"
                                    value={profileData.language}
                                    onChange={e => setProfileData({ ...profileData, language: e.target.value })}
                                >
                                    <option value="Español">Español</option>
                                    <option value="Inglés">Inglés</option>
                                    <option value="Portugués">Portugués</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            {msg.text && (
                                <div className={`text-xs font-bold ${msg.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {msg.text}
                                </div>
                            )}
                            <button
                                disabled={isSaving}
                                className="ml-auto px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                            >
                                {isSaving ? 'Guardando...' : <Save className="w-4 h-4" />}
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>

                {/* Seguridad y Contraseña */}
                <div className="space-y-8">
                    {/* Cambio de Contraseña */}
                    <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-400/10 rounded-2xl">
                                <Lock className="w-6 h-6 text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Seguridad</h3>
                        </div>
                        <form onSubmit={e => {
                            e.preventDefault();
                            if (passwords.next !== passwords.confirm) {
                                alert("Las contraseñas no coinciden");
                                return;
                            }
                            changePassword(passwords.next).then(() => {
                                alert("Contraseña actualizada");
                                setPasswords({ next: '', confirm: '' });
                            });
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-black uppercase px-1">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 transition-all font-mono"
                                        value={passwords.next}
                                        onChange={e => setPasswords({ ...passwords, next: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-400 font-black uppercase px-1">Confirmar</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 transition-all font-mono"
                                        value={passwords.confirm}
                                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button className="w-full px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                <Key className="w-4 h-4" />
                                Actualizar Contraseña
                            </button>
                        </form>
                    </div>

                    {/* Espacio para Ayuda o Tips */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/40 rounded-3xl p-8 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            Período de Productividad
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Tu desempeño individual y métricas de cierre ahora se encuentran en la pestaña de <b>Historial</b>.
                            Allí podrás ver cuántas cotizaciones has generado y competir contra tus propios récords.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotesPage;
