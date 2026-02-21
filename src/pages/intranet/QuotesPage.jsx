import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from './AdminPanel';
import HelpSection from '../../components/intranet/HelpSection';
import TeamMonitor from './TeamMonitor';
import { useAuth } from '../../context/AuthContext';
import {
    Plane, Settings, ArrowLeft, Plus, CheckCircle, CreditCard,
    ClipboardList, Briefcase, Book, Search, Upload, AlertCircle, ChevronDown, ChevronRight,
    Globe, Map, Ship, Car, HeartPulse, UserPlus, Users2, FileSpreadsheet, Receipt,
    ShieldCheck, Users, DollarSign, FileCheck, FileText, LayoutDashboard,
    Calendar, Anchor, MapPin, Utensils, Wine, Music, AlertTriangle, Check,
    Trash2, Save, FileDown, Lock, Menu, X, Camera, Key, PieChart
} from 'lucide-react';
import { ERP } from '../../services/mockERP';
import { Folios } from '../../services/foliosApi';
import { QuotesApi } from '../../services/quotesApi';
import { generateConfirmationPdf, generateQuotePdf, generateVoucherPdf, generateMonthlyReportPdf } from '../../utils/pdf';

// Expose monthly report generator for AdminPanel
if (typeof window !== 'undefined') {
    window.generateMonthlyReportPdf = generateMonthlyReportPdf;
}

const QuotesPage = () => {
    const { user } = useAuth();
    const [activeMainTab, setActiveMainTab] = useState('cotizaciones');
    const [activeSubTab, setActiveSubTab] = useState(null);
    const [userRole, setUserRole] = useState('advisor');
    const [isEditing, setIsEditing] = useState(false); // Para permitir edición correctiva a admins
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        if (user.role === 'manager') {
            setUserRole('admin');
            return;
        }
        setUserRole('advisor');
    }, [user]);

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
                    const quotes = await QuotesApi.listQuotes();
                    // Normalizar para que el Admin Panel entienda el formato
                    const normalized = quotes.map(q => ({
                        id: q.folio,
                        date: new Date(q.created_at).toISOString().split('T')[0],
                        advisor: q.data?.advisorName || 'N/A',
                        client: q.data?.clientName || 'Sin Cliente',
                        status: q.data?.status === 'confirmed' ? 'Completado' : 'En Proceso',
                        step: q.data?.currentStep || 1,
                        missing: q.data?.missingItems || [],
                        history: q.data?.history || [
                            { type: 'creation', action: 'CREACIÓN', timestamp: new Date(q.created_at).toLocaleString(), user: 'Sistema', details: 'Documento registrado en base de datos' }
                        ],
                        data: q.data
                    }));
                    setRealQuotes(normalized);
                } catch (err) {
                    console.error("Error loading admin quotes:", err);
                } finally {
                    setIsLoadingAdminData(false);
                }
            }
        };
        loadAdminData();
    }, [activeMainTab, userRole]);

    const handleCorrectiveEdit = (quote) => {
        // Permitir a admins editar una cotización específica
        console.log("Editando cotización:", quote.id);
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
            ref = await Folios.getNext('COT');
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


    const HistoryView = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const [items, setItems] = useState([]);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');

        const load = async (term = '') => {
            setLoading(true);
            setError('');
            try {
                const data = await QuotesApi.listQuotes(term);
                setItems(Array.isArray(data) ? data : []);
            } catch {
                setError('No se pudieron cargar las cotizaciones.');
            } finally {
                setLoading(false);
            }
        };

        useEffect(() => {
            load();
        }, []);

        const handleDownload = (row) => {
            const data = row.data || {};
            const flights = data.flights || data.flightRows || [];
            const hotels = data.hotels || [];
            const luggage = data.luggage || data.equipaje || { personal: true, hand: true, checked: false };
            const extras = data.extras || {};
            const clientPhone = data.clientPhone || data.phone || '';
            const adults = data.adults || data.paxAdults || 0;
            const children = data.children || data.paxChildren || 0;
            const serviceType = data.serviceType || '';
            const isVacation =
                !serviceType ||
                ['nacional', 'internacional', 'terrestre', 'hotel'].includes(serviceType.toLowerCase());

            if (isVacation) {
                const includes =
                    Array.isArray(hotels) && hotels.length
                        ? hotels.flatMap(h => h.includes || [])
                        : extras.includes || [];
                const flightsForPdf = Array.isArray(flights)
                    ? flights.map(f => ({
                        airline: f.airline || '',
                        flight: f.flight || '',
                        route: f.route || '',
                        duration: f.duration || '',
                        equipment: f.equipment || f.class || ''
                    }))
                    : [];
                generateQuotePdf({
                    folio: row.folio,
                    clientName: data.clientName,
                    clientEmail: data.clientEmail || data.email,
                    clientPhone: data.clientPhone || data.phone,
                    destination: data.destination,
                    adults,
                    children,
                    dateStart: data.dateStart,
                    dateEnd: data.dateEnd,
                    duration: data.duration,
                    hotels,
                    includes,
                    notes: extras.notes,
                    flights: flightsForPdf,
                    luggage,
                    corporateBrand: data.corporateBrand,
                    groundLogistics: data.groundLogistics,
                    advisorName,
                    advisorRole
                });
            } else {
                const flightRows = Array.isArray(flights)
                    ? flights.map(f => ({
                        airline: f.airline || '',
                        flight: f.flight || '',
                        departure: f.departure || '',
                        arrival: f.arrival || '',
                        duration: f.duration || '',
                        equipment: f.equipment || f.class || ''
                    }))
                    : [];
                generateConfirmationPdf({
                    folio: row.folio,
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    destination: data.destination,
                    corporateBrand: data.corporateBrand,
                    flightRows,
                    luggage,
                    advisorName,
                    advisorRole
                });
            }
        };

        return (
            <div className="space-y-6 animate-fade-in">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-6 h-6 text-blue-400" />
                            Historial de Cotizaciones
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Consulta y vuelve a descargar las cotizaciones generadas.
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                className="bg-slate-900/70 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none w-56"
                                placeholder="Buscar por folio o cliente"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') load(searchTerm);
                                }}
                            />
                        </div>
                        <button
                            onClick={() => load(searchTerm)}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-500"
                        >
                            Buscar
                        </button>
                    </div>
                </header>

                <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 md:p-6">
                    {loading && (
                        <p className="text-slate-400 text-sm">Cargando cotizaciones...</p>
                    )}
                    {!loading && error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}
                    {!loading && !error && items.length === 0 && (
                        <p className="text-slate-400 text-sm">
                            No hay cotizaciones registradas para los filtros actuales.
                        </p>
                    )}
                    {!loading && !error && items.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs md:text-sm">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-700">
                                        <th className="py-2 pr-4 text-left">Folio</th>
                                        <th className="py-2 pr-4 text-left">Cliente</th>
                                        <th className="py-2 pr-4 text-left">Destino</th>
                                        <th className="py-2 pr-4 text-left hidden md:table-cell">Fecha</th>
                                        <th className="py-2 pr-4 text-left hidden md:table-cell">Tipo</th>
                                        <th className="py-2 pr-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map(row => {
                                        const data = row.data || {};
                                        const createdAt = row.created_at || data.createdAt || '';
                                        const typeLabel = data.serviceType || 'General';
                                        return (
                                            <tr
                                                key={row.folio}
                                                className="border-b border-slate-800/80 hover:bg-slate-800/40"
                                            >
                                                <td className="py-2 pr-4 font-mono text-slate-100">
                                                    {row.folio}
                                                </td>
                                                <td className="py-2 pr-4 text-slate-100">
                                                    {data.clientName || '—'}
                                                </td>
                                                <td className="py-2 pr-4 text-slate-300">
                                                    {data.destination || '—'}
                                                </td>
                                                <td className="py-2 pr-4 text-slate-400 hidden md:table-cell">
                                                    {createdAt
                                                        ? new Date(createdAt).toLocaleString()
                                                        : '—'}
                                                </td>
                                                <td className="py-2 pr-4 text-slate-400 hidden md:table-cell">
                                                    {typeLabel}
                                                </td>
                                                <td className="py-2 pl-4 text-right">
                                                    <button
                                                        onClick={() => handleDownload(row)}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-blue-300 text-[11px] font-bold uppercase tracking-widest border border-slate-600 hover:border-blue-500 hover:text-white"
                                                    >
                                                        <FileDown className="w-3 h-3" />
                                                        Re-descargar PDF
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Estado para el acordeón del sidebar
    const [isQuotesOpen, setIsQuotesOpen] = useState(true);

    // --- ESTADO INTERNO DEL MÓDULO COTIZACIONES ---
    const [formTab, setFormTab] = useState('client'); // client, itinerary, finance, summary
    const [folio, setFolio] = useState('');

    const [previewFolio, setPreviewFolio] = useState('');

    // --- ESTRUCTURA DE NAVEGACIÓN (DIAGRAMA) ---
    const quoteOptions = [
        { id: 'nacional', label: 'Nacional', icon: Map },
        { id: 'internacional', label: 'Internacional', icon: Globe },
        { id: 'tiquetes', label: 'Tiquetes', icon: Plane },
        { id: 'terrestre', label: 'Porción Terrestre', icon: Briefcase },
        { id: 'crucero', label: 'Crucero', icon: Ship },
        { id: 'auto', label: 'Alquiler de Auto', icon: Car },
        { id: 'medica', label: 'Asistencia Médica', icon: HeartPulse },
        { id: 'quince', label: 'Quinceañeras', icon: UserPlus },
        { id: 'grupos', label: 'Grupos', icon: Users2 }
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

    // --- EFECTOS ---
    useEffect(() => {
        if (!folio) {
            setPreviewFolio(ERP.getNextFolio('COT'));
        }
    }, [folio]);

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
        const [dueDate, setDueDate] = useState('');
        const [hotelCategory, setHotelCategory] = useState('');
        const [clientNameC, setClientNameC] = useState('');
        const [clientEmailC, setClientEmailC] = useState('');
        const [destinationC, setDestinationC] = useState('');

        const [showConfirmErrors, setShowConfirmErrors] = useState(false);
        const [flightRows, setFlightRows] = useState([{ id: 1, airline: '', eticket: '', pnr: '', passengerName: '', passengerId: '', route: '', flightDate: '', depTime: '', arrTime: '', valueUsd: '' }]);
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
        const addFlightRow = () => setFlightRows(prev => [...prev, { id: Date.now(), airline: '', eticket: '', pnr: '', passengerName: '', passengerId: '', route: '', flightDate: '', depTime: '', arrTime: '', valueUsd: '' }]);
        const removeFlightRow = (id) => setFlightRows(prev => prev.filter(r => r.id !== id));
        const setFlightField = (id, field, value) => setFlightRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
        const validateConfirm = () => {
            if (!serviceConfirmed) return false;
            if (!serviceType) return false;
            if (!planType || !totalPrice || !depositDate || !dueDate) return false;
            if (includes.hotel && String(hotelCategory || '').trim() === '') return false;
            if (includes.air) {
                if (!(flightRows.length > 0 && flightRows.every(r =>
                    [r.airline, r.eticket, r.pnr, r.passengerName, r.passengerId, r.route, r.flightDate, r.depTime, r.arrTime, r.valueUsd].every(v => String(v || '').trim() !== '')
                ))) return false;
            }
            return true;
        };
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
                        if (loaded.dueDate) setDueDate(loaded.dueDate);
                        if (loaded.hotelCategory) setHotelCategory(loaded.hotelCategory);
                        if (loaded.clientName) setClientNameC(loaded.clientName);
                        if (loaded.clientEmail) setClientEmailC(loaded.clientEmail);
                        if (loaded.destination) setDestinationC(loaded.destination);
                        if (Array.isArray(loaded.flightRows) && loaded.flightRows.length) setFlightRows(loaded.flightRows.map((r, i) => ({ id: r.id || i + 1, ...r })));
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
                if (data.dueDate) setDueDate(data.dueDate);
                if (data.hotelCategory) setHotelCategory(data.hotelCategory);
                if (data.clientName) setClientNameC(data.clientName);
                if (data.clientEmail) setClientEmailC(data.clientEmail);
                if (data.destination) setDestinationC(data.destination);

                if (Array.isArray(data.flightRows) && data.flightRows.length) setFlightRows(data.flightRows.map((r, i) => ({ id: r.id || i + 1, ...r })));
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
                if (!folio) {
                    folio = await Folios.getNext('COT');
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
                    dueDate,
                    hotelCategory,
                    clientName: clientNameC,
                    clientEmail: clientEmailC,
                    destination: destinationC,
                    corporateBrand: activeCorporateBrand,
                    flightRows,
                    advisorName,
                    advisorRole,
                    updatedAt: new Date().toISOString()
                };
                const result = await QuotesApi.confirmQuote(payload, user);
                if (result?.ok) {
                    setConfirmSaved(true);
                    setSaveStatus('¡Certificado!');
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
                                        <span className="font-mono text-3xl md:text-4xl font-black text-blue-600 tracking-tighter whitespace-nowrap">
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
                                    <input value={totalPrice} onChange={e => setTotalPrice(e.target.value)} placeholder="USD" className="w-full bg-transparent font-black text-xl text-slate-800 outline-none" />
                                </div>
                                <div className={`${dueDate && new Date(dueDate) < new Date() ? 'ring-2 ring-red-400 rounded-xl' : ''}`}>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Fecha Depósito</div>
                                        <input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} className={`w-full bg-transparent font-bold text-slate-700 outline-none ${showConfirmErrors && !depositDate ? 'text-red-500' : ''}`} />
                                    </div>
                                </div>
                                <div className={`${dueDate && new Date(dueDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) ? 'animate-pulse' : ''}`}>
                                    <div className={`bg-slate-50 border rounded-xl p-3 ${showConfirmErrors && !dueDate ? 'border-red-400' : 'border-slate-200'}`}>
                                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Fecha Límite Pago Total</div>
                                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-transparent font-bold text-slate-700 outline-none" />
                                    </div>
                                </div>
                            </div>
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
                            <p className="font-bold text-slate-700 text-lg">{new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destino Principal</span>
                            </div>
                            <input type="text" className="w-full bg-transparent outline-none font-black text-xl text-slate-800 uppercase tracking-tight placeholder-slate-300" value={destinationC} onChange={e => setDestinationC(e.target.value.toUpperCase())} placeholder="DESTINO PRINCIPAL" />
                        </div>

                        <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-bl-full"></div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-500">
                                    <Users className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solicitante</span>
                            </div>
                            <input type="text" className="w-full bg-transparent outline-none font-bold text-slate-700 uppercase mb-1" value={clientNameC} onChange={e => setClientNameC(e.target.value.toUpperCase())} placeholder="NOMBRE CLIENTE" />
                            <input type="email" className="w-full bg-transparent outline-none text-xs text-slate-400 lowercase font-medium" value={clientEmailC} onChange={e => setClientEmailC(e.target.value)} placeholder="cliente@email.com" />
                        </div>
                        <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asesor Responsable</span>
                            </div>
                            <input type="text" readOnly className="w-full bg-transparent outline-none font-black text-slate-800 uppercase" value={advisorName} />
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
                                            <input type="text" className="w-full font-black text-2xl text-slate-700 outline-none uppercase placeholder-slate-300 border-b border-transparent focus:border-orange-200 transition-all" placeholder="HOTEL SOL CARIBE" />
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
                                                <thead className="bg-slate-50 text-slate-500 uppercase">
                                                    <tr>
                                                        <th className="p-3">Identificación (Aerolínea/Ticket/PNR)</th>
                                                        <th className="p-3">Pasajero (Nombre/Documento)</th>
                                                        <th className="p-3">Itinerario (Ruta/Fecha/Horas)</th>
                                                        <th className="p-3">Valor (USD)</th>
                                                        <th className="p-3"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200">
                                                    {flightRows.map(fr => (
                                                        <tr key={fr.id} className="bg-white hover:bg-slate-50 transition-colors">
                                                            <td className="p-3 space-y-2">
                                                                <input value={fr.airline} onChange={e => setFlightField(fr.id, 'airline', e.target.value)} className="w-full bg-slate-50 rounded-lg px-2 py-1 outline-none font-bold uppercase" placeholder="AEROLÍNEA" />
                                                                <div className="flex gap-2">
                                                                    <input value={fr.eticket} onChange={e => setFlightField(fr.id, 'eticket', e.target.value)} className="w-full bg-slate-50 rounded-lg px-2 py-1 outline-none font-mono text-[10px]" placeholder="E-TICKET" />
                                                                    <input value={fr.pnr} onChange={e => setFlightField(fr.id, 'pnr', e.target.value)} className="w-full bg-slate-50 rounded-lg px-2 py-1 outline-none font-mono text-[10px] uppercase" placeholder="PNR" />
                                                                </div>
                                                            </td>
                                                            <td className="p-3 space-y-2">
                                                                <input value={fr.passengerName} onChange={e => setFlightField(fr.id, 'passengerName', e.target.value)} className="w-full bg-slate-50 rounded-lg px-2 py-1 outline-none font-bold uppercase" placeholder="NOMBRE PASAJERO" />
                                                                <input value={fr.passengerId} onChange={e => setFlightField(fr.id, 'passengerId', e.target.value)} className="w-full bg-slate-50 rounded-lg px-2 py-1 outline-none font-mono text-[10px]" placeholder="DOCUMENTO ID" />
                                                            </td>
                                                            <td className="p-3 space-y-2">
                                                                <input value={fr.route} onChange={e => setFlightField(fr.id, 'route', e.target.value)} className="w-full bg-slate-50 rounded-lg px-2 py-1 outline-none font-bold uppercase" placeholder="BOG-ADZ" />
                                                                <div className="grid grid-cols-3 gap-1">
                                                                    <input value={fr.flightDate} onChange={e => setFlightField(fr.id, 'flightDate', e.target.value)} className="w-full bg-slate-50 rounded-lg px-1 py-1 outline-none text-[9px]" placeholder="FECHA" />
                                                                    <input value={fr.depTime} onChange={e => setFlightField(fr.id, 'depTime', e.target.value)} className="w-full bg-slate-50 rounded-lg px-1 py-1 outline-none text-[9px]" placeholder="DEP" />
                                                                    <input value={fr.arrTime} onChange={e => setFlightField(fr.id, 'arrTime', e.target.value)} className="w-full bg-slate-50 rounded-lg px-1 py-1 outline-none text-[9px]" placeholder="ARR" />
                                                                </div>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="relative">
                                                                    <span className="absolute left-2 top-1.5 text-emerald-600 font-bold text-[10px]">USD</span>
                                                                    <input type="number" value={fr.valueUsd} onChange={e => setFlightField(fr.id, 'valueUsd', e.target.value)} className="w-24 bg-slate-50 rounded-lg pl-8 pr-2 py-1 outline-none font-bold text-emerald-700" placeholder="0.00" />
                                                                </div>
                                                            </td>
                                                            <td className="p-3 text-right">
                                                                <button onClick={() => removeFlightRow(fr.id)} className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-bold">×</button>
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

                    {/* 4. Lista de Pasajeros (Modern List) */}
                    <div className="relative z-10 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                                <Users2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase text-sm">Lista de Pasajeros</h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Personas que viajan</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        {i}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <input className="w-full bg-transparent font-bold text-slate-700 text-sm outline-none uppercase placeholder-slate-300" placeholder="NOMBRE COMPLETO" />
                                        <div className="flex gap-2">
                                            <input className="bg-transparent font-mono text-xs text-slate-400 outline-none w-24" placeholder="DOC ID" />
                                            <span className="text-slate-300">|</span>
                                            <input className="bg-transparent text-xs text-slate-400 outline-none w-full uppercase" placeholder="TIPO PASAJERO" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase border border-emerald-100">
                                            <ShieldCheck className="w-3 h-3" /> Asistencia
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 5. Legales & Footer (Blocks) */}
                    <div className="relative z-10 bg-slate-50/50 border-t border-slate-200/60 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3 text-orange-500" /> Condiciones
                                </h4>
                                <p className="text-[9px] text-slate-400 text-justify leading-relaxed">
                                    Tarifas sujetas a cambios y disponibilidad. Servicios no tomados no son reembolsables. Penalidades por cambios aplican al 100%.
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-blue-500" /> Menores de Edad
                                </h4>
                                <p className="text-[9px] text-slate-400 text-justify leading-relaxed">
                                    En desarrollo de lo dispuesto en la Ley 679 de 2001, advertimos que la explotación y el abuso sexual de menores de edad son sancionados penal y administrativamente.
                                </p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                                <h4 className="font-bold text-slate-700 text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileCheck className="w-3 h-3 text-emerald-500" /> Habeas Data
                                </h4>
                                <p className="text-[9px] text-slate-400 text-justify leading-relaxed">
                                    Autorizo el tratamiento de mis datos personales para fines comerciales y de servicio, garantizando su confidencialidad bajo la ley 1581 de 2012.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-200">
                            <div className="text-center md:text-left">
                                <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Destinos P&P S.A.S</p>
                                <p className="text-[10px] text-slate-400 mt-1">RNT 175017 | NIT 901.721.152-3</p>
                            </div>
                            <div className="flex gap-4">
                                <button className={`px-6 py-2.5 rounded-xl ${validateConfirm() && confirmSaved ? 'bg-white' : 'bg-slate-100 cursor-not-allowed'} border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm`} disabled={!validateConfirm() || !confirmSaved || isSaving} onClick={() => { if (!validateConfirm()) { setShowConfirmErrors(true); return; } if (!confirmSaved) return; generateConfirmationPdf({ folio: previewFolio || folioInput, clientName: clientNameC, clientEmail: clientEmailC, destination: destinationC, corporateBrand: activeCorporateBrand, flightRows, advisorName, advisorRole, currency: formData.currency }); }}>
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Descargar PDF
                                </button>
                                <button className={`px-6 py-2.5 rounded-xl ${validateConfirm() ? 'bg-gradient-to-r from-blue-600 to-blue-500' : 'bg-slate-300 cursor-not-allowed'} text-white font-bold text-xs hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 shadow-md`} disabled={!validateConfirm() || isSaving} onClick={() => { if (!validateConfirm()) { setShowConfirmErrors(true); return; } handleSaveConfirm(); }}>
                                    {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle className="w-4 h-4" />}
                                    {isSaving ? 'Certificando...' : 'Aceptar Confirmación'}
                                    {saveStatus && <span className="text-[10px] ml-1">{saveStatus}</span>}
                                </button>
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
        const canRegister = !!payFolio && clientOk && (parseFloat(supportAmount) > 0) && !!selectedFile && !isSaving;
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
                            <button
                                onClick={handleRegister}
                                disabled={!canRegister}
                                title={!payFolio ? 'No hay Folio activo' : (!clientOk ? 'Falta Solicitante/Pasajero guardado' : (!selectedFile ? 'Adjunta el soporte' : (!supportAmount ? 'Ingresa el monto' : '')))}
                                className={`w-full py-3 font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 ${canRegister ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                            >
                                Registrar Pago
                            </button>
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
        const canSave = !locked && operators.some(o => o.name.trim() && parseNum(o.amount) > 0 && o.rateType);

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
                        detail: `Asesor ${advisorName} liquidó la cotización ${folio} con total de USD ${grandTotal.toLocaleString()}`
                    }, ...prev]);
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
                    <div className="flex justify-end pt-6 border-t border-slate-700/50">
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
        useEffect(() => {
            const init = async () => {
                setVoucherFolio(previewFolio || '');
                if (previewFolio) {
                    const data = await QuotesApi.getQuoteByFolio(previewFolio);
                    if (data) {
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
                setVoucherHotels(data.hotels || data.hotelOptions || []);
                setVoucherDestination(data.destination || '');
                setCorporateBrandV(data.corporateBrand || null);
            }
        };

        const handleDownloadVoucher = async () => {
            const folio = (voucherFolio || '').trim();
            if (!folio) return;
            const data = await QuotesApi.getQuoteByFolio(folio);
            if (data) {
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
                                            {(h.includes && h.includes.length > 0 ? h.includes : ['Sin beneficios especificados']).map((item, idx) => (
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

                    {/* 4. Footer & Actions */}
                    <div className="bg-slate-900 p-6 md:p-8 mt-6 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-xs font-black text-white uppercase tracking-widest">Destinos P&P S.A.S</p>
                            <p className="text-[10px] text-slate-500 mt-1">Línea de Emergencias 24/7: +57 319 675 3094</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold text-xs transition-all flex items-center gap-2">
                                <Settings className="w-4 h-4" /> Configurar
                            </button>
                            <button onClick={handleDownloadVoucher} className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 shadow-md">
                                <FileSpreadsheet className="w-4 h-4" /> Descargar Voucher PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ReconfirmView = () => (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="text-orange-500" /> Checklist Operativo
            </h2>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <div className="space-y-4 mb-8">
                    {['Voucher Enviado', 'Check-in Confirmado', 'Registro Migratorio', 'Seguro Médico Verificado'].map((item, idx) => (
                        <label key={idx} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-xl cursor-pointer hover:bg-slate-900 transition-colors border border-slate-700/50">
                            <input type="checkbox" className="w-6 h-6 accent-orange-500 rounded-lg" />
                            <span className="text-slate-200 font-medium">{item}</span>
                        </label>
                    ))}
                </div>
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Novedades y Observaciones</h3>
                <textarea
                    className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-orange-500 resize-none"
                    placeholder="Detalles operativos adicionales..."
                ></textarea>
            </div>
        </div>
    );

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

    const QuoteSelectionDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {quoteOptions.map((option) => (
                <div
                    key={option.id}
                    onClick={() => setActiveSubTab(option.id)}
                    className="group relative h-64 bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden cursor-pointer hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500"
                >
                    <div className="absolute inset-0">
                        <img
                            src={`https://source.unsplash.com/random/600x400?travel,${option.label === 'Nacional' ? 'colombia' : option.id}&sig=${option.id}`}
                            alt={option.label}
                            className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
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
        const [currency, setCurrency] = useState('USD');
        // Estado principal que contiene las múltiples opciones de cotización
        const [flightQuotes, setFlightQuotes] = useState([
            {
                id: 1,
                airline: 'AEROLÍNEA',
                luggage: { personal: true, hand: true, checked: false },
                priceUsd: '',
                flights: [
                    { id: Date.now(), airline: '', flight: '', departure: '', arrival: '', duration: '', aircraft: '' }
                ]
            },
            {
                id: 2,
                airline: 'AEROLÍNEA',
                luggage: { personal: true, hand: true, checked: true },
                priceUsd: '',
                flights: [
                    { id: Date.now() + 1, airline: '', flight: '', departure: '', arrival: '', duration: '', aircraft: '' }
                ]
            }
        ]);

        const [formData, setFormData] = useState({
            route: '',
            passengers: '',
            classType: 'Económica',
            notes: ''
        });

        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');

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

        const handleSaveAndPdf = async () => {
            setIsSaving(true);
            setSaveStatus('Guardando...');
            try {
                let folio = previewFolio;
                if (!folio) {
                    folio = await Folios.getNext('COT');
                    setPreviewFolio(folio);
                }

                const flightOptions = flightQuotes.map((quote, index) => ({
                    title: `OPCIÓN ${index + 1}: ${quote.airline || 'AEROLÍNEA'}`,
                    priceUsd: quote.priceUsd,
                    luggage: quote.luggage,
                    flights: quote.flights.map(f => ({
                        flight: f.flight,
                        route: f.departure && f.arrival ? `${f.departure.split('-')[0]} > ${f.arrival.split('-')[0]}` : f.route,
                        departure: f.departure,
                        arrival: f.arrival,
                        duration: f.duration,
                        equipment: f.aircraft || f.equipment
                    }))
                }));

                const payload = {
                    folio,
                    clientName: 'Cliente (Vuelos)',
                    destination: formData.route || 'Ruta Aérea',
                    adults: 0,
                    children: 0,
                    notes: formData.notes,
                    flightOptions,
                    corporateBrand: activeCorporateBrand,
                    advisorName,
                    advisorRole,
                    quoteType: 'vuelos',
                    status: 'draft',
                    createdAt: new Date().toISOString()
                };

                const result = await QuotesApi.createQuote(payload, user);
                if (result.ok) {
                    generateQuotePdf({
                        ...payload,
                        currency, // Pass selected currency
                        advisorName: user?.name, // Automate signature name
                        advisorRole: user?.role_label // Automate signature role
                    });
                    setSaveStatus('¡Listo!');
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
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Ruta Aérea</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-lg"
                                        placeholder="BOG - MAD - BOG"
                                        value={formData.route}
                                        onChange={e => setFormData({ ...formData, route: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Pasajeros</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                                        placeholder="1 Adulto"
                                        value={formData.passengers}
                                        onChange={e => setFormData({ ...formData, passengers: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Clase</label>
                                    <select
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

                    <div className="relative h-64 md:h-auto rounded-xl overflow-hidden group border border-slate-700/50">
                        <img
                            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"
                            alt="Avión"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-6">
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
                                <button className={`px-2 py-0.5 rounded ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-slate-600'}`} onClick={() => setCurrency('USD')}>USD</button>
                                <button className={`px-2 py-0.5 rounded ${currency === 'COP' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`} onClick={() => setCurrency('COP')}>COP</button>
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

                                {/* Precios */}
                                <div className="w-full space-y-1">
                                    <div className="relative group">
                                        <input
                                            className="w-full bg-transparent text-center text-xl font-bold text-white underline decoration-slate-500 underline-offset-4 outline-none placeholder-slate-600 group-hover:decoration-emerald-500 transition-all"
                                            placeholder={`0 ${currency}`}
                                            value={quote.priceUsd ? `${quote.priceUsd} ${currency}` : ''}
                                            onChange={e => {
                                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                                updateQuote(quote.id, 'priceUsd', val);
                                            }}
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Por Persona</span>
                                    </div>

                                    <div className="relative pt-2">
                                        {/* COP section removed as per user request */}
                                    </div>
                                </div>

                            </div>

                            {/* COLUMNA DERECHA: TABLA DE VUELOS (65%) */}
                            <div className="lg:w-[65%] bg-slate-900/20 flex flex-col">
                                <div className="flex-1 overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-200/5 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700/50">
                                                <th className="p-4 font-bold w-32">Vuelo (Aerolínea/PNR)</th>
                                                <th className="p-4 font-bold">Pasajero (Nombre/ID)</th>
                                                <th className="p-4 font-bold">Itinerario (Ruta/Horas)</th>
                                                <th className="p-4 font-bold text-center">Costo (USD/Estado)</th>
                                                <th className="p-4 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/30">
                                            {quote.flights.map((f, i) => (
                                                <tr key={f.id} className="group hover:bg-slate-800/40 transition-colors">
                                                    {/* 1. VUELO (Aerolínea/PNR) */}
                                                    <td className="p-4 align-top">
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                className="w-full bg-transparent text-slate-200 font-bold text-xs outline-none placeholder-slate-600 uppercase"
                                                                placeholder="AEROLÍNEA"
                                                                value={f.flight || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'flight', e.target.value)}
                                                            />
                                                            <input
                                                                className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-slate-400 font-mono text-[10px] outline-none placeholder-slate-800"
                                                                placeholder="PNR / CONF"
                                                                value={f.pnr || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'pnr', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* 2. PASAJERO (Nombre/ID) */}
                                                    <td className="p-4 align-top">
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                className="w-full bg-transparent text-slate-200 font-bold text-xs outline-none placeholder-slate-600 uppercase"
                                                                placeholder="NOMBRE COMPLETO"
                                                                value={f.passenger || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'passenger', e.target.value)}
                                                            />
                                                            <input
                                                                className="w-full bg-slate-900/50 border border-slate-700 rounded px-2 py-1 text-slate-400 font-mono text-[10px] outline-none placeholder-slate-800"
                                                                placeholder="ID / DOC"
                                                                value={f.pid || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'pid', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* 3. ITINERARIO (Ruta/Horas) */}
                                                    <td className="p-4 align-top">
                                                        <div className="flex flex-col gap-2">
                                                            <input
                                                                className="w-full bg-transparent text-slate-200 font-bold text-xs outline-none placeholder-slate-600 uppercase"
                                                                placeholder="RUTA (BOG-MAD-BOG)"
                                                                value={f.route || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'route', e.target.value)}
                                                            />
                                                            <input
                                                                className="w-full bg-transparent text-slate-400 text-[10px] outline-none placeholder-slate-700"
                                                                placeholder="FECHAS / HORAS"
                                                                value={f.schedule || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'schedule', e.target.value)}
                                                            />
                                                        </div>
                                                    </td>

                                                    {/* 4. COSTO (USD/ESTADO) */}
                                                    <td className="p-4 align-middle text-center">
                                                        <div className="flex flex-col gap-1 items-center">
                                                            <input
                                                                className="w-24 bg-slate-900 border border-emerald-500/30 rounded px-2 py-1 text-emerald-400 font-bold text-center outline-none placeholder-emerald-900"
                                                                placeholder="VALOR USD"
                                                                value={f.cost_usd || ''}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'cost_usd', e.target.value)}
                                                            />
                                                            <select
                                                                className="bg-transparent text-slate-500 text-[9px] uppercase font-black outline-none cursor-pointer"
                                                                value={f.status || 'CONFIRMADO'}
                                                                onChange={e => handleFlightChange(quote.id, f.id, 'status', e.target.value)}
                                                            >
                                                                <option value="CONFIRMADO">CONFIRMADO</option>
                                                                <option value="PENDIENTE">PENDIENTE</option>
                                                            </select>
                                                        </div>
                                                    </td>

                                                    {/* ACCIONES */}
                                                    <td className="p-4 align-middle text-right">
                                                        <button onClick={() => removeFlight(quote.id, f.id)} className="text-slate-600 hover:text-red-400 transition-colors p-2">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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

                    {/* CONDICIONES GENERALES (Estilo Grid Azul/Slate) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Columna Izquierda: Condiciones Generales */}
                        <section className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 h-full">
                            <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">
                                Condiciones Generales
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-emerald-400 font-bold text-xs uppercase mb-2">Forma de Pago</h4>
                                    <ul className="text-sm text-slate-400 space-y-1 list-disc pl-4 marker:text-emerald-500">
                                        <li>Pago en pesos colombianos a la TRM del día</li>
                                        <li>Transferencia Bancaria / QR / PSE</li>
                                        <li>Tarjeta de crédito (+3% fee administrativo)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-emerald-400 font-bold text-xs uppercase mb-2">Restricciones</h4>
                                    <ul className="text-sm text-slate-400 space-y-1 list-disc pl-4 marker:text-emerald-500">
                                        <li>Anulación genera gastos del 100% una vez pagado</li>
                                        <li>Servicios no tomados no son reembolsables</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        {/* Columna Derecha: Documentos Requeridos */}
                        <section className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20 h-full">
                            <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-blue-500/20 pb-2">
                                <ShieldCheck className="w-4 h-4" /> Documentos Requeridos
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3 text-sm text-slate-300">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                    <span>Cédula de ciudadanía original</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-300">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                    <span>Pasaporte vigente (Solo vuelos internacionales)</span>
                                </li>
                                <li className="flex items-start gap-3 text-sm text-slate-300">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                    <span>Visas o permisos de ingreso (si aplica según destino)</span>
                                </li>
                            </ul>
                        </section>
                    </div>

                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
                    {user?.modules?.corporativo === 'read' ? (
                        <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-500/30 px-6 py-3 rounded-2xl text-amber-400 font-bold text-sm shadow-xl">
                            <ShieldCheck className="w-5 h-5" />
                            MODO LECTURA (GERENCIA)
                        </div>
                    ) : (
                        <>
                            <button className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold transition-all">
                                Guardar Borrador
                            </button>
                            <button
                                onClick={handleSaveAndPdf}
                                className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2"
                                disabled={isSaving}
                            >
                                {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileDown className="w-4 h-4" />}
                                {isSaving ? 'Guardando...' : `Generar PDF (${currency})`}
                                {saveStatus && <span className="text-[10px] ml-1">{saveStatus}</span>}
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const CruiseQuoteForm = () => {
        const [currency, setCurrency] = useState('USD');
        const [enableThirdCabin, setEnableThirdCabin] = useState(false);
        const [thirdCabinTitle, setThirdCabinTitle] = useState('CABINA CON BALCÓN');
        const [thirdCabinPrice, setThirdCabinPrice] = useState('');
        const [includeAirInCruise, setIncludeAirInCruise] = useState(false);
        const [cruiseFlights, setCruiseFlights] = useState([
            { id: 1, airline: '', flight: '', dep: '', depDate: '', arr: '', arrDate: '', duration: '', aircraft: '' }
        ]);
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');

        // Initial empty itinerary row for user to fill
        const [cruiseItinerary, setCruiseItinerary] = useState([
            { day: '', date: '', port: '', arr: '', dep: '' }
        ]);

        // Cabins state (Dynamic)
        const [cruiseCabins, setCruiseCabins] = useState([
            { id: 1, title: 'CABINA INTERIOR', price: '' }
        ]);

        const [cruiseData, setCruiseData] = useState({
            destination: 'Crucero por el Caribe',
            passengers: '2 adultos',
            plan: 'Costa Cruises (Fascinosa)',
            accommodation: '1 Cabina Doble'
        });

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
            if (enableThirdCabin && String(thirdCabinPrice).trim() === '') return false;
            if (includeAirInCruise) {
                return cruiseFlights.length > 0 && cruiseFlights.every(f =>
                    [f.airline, f.flight, f.dep, f.depDate, f.arr, f.arrDate, f.duration, f.aircraft].every(v => String(v || '').trim() !== '')
                );
            }
            return true;
        };

        const handleGenerateCruisePdf = () => {
            try {
                // 1. Preparar Cabinas como "Hoteles" para el PDF
                const cabins = cruiseCabins.map(c => ({
                    name: cruiseData.plan,
                    room: c.title,
                    notes: `${c.price} USD (2 pax)`
                }));

                // 3. Preparar Vuelos si aplica
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

                generateQuotePdf({
                    folio: previewFolio || 'COT-CRUCERO',
                    clientName: 'Cliente (Crucero)',
                    destination: cruiseData.destination,
                    adults: 2,
                    children: 0,
                    cruiseData: cruiseData,
                    cruiseItinerary: cruiseItinerary,
                    notes: 'Tarifas por cabina doble. Sujeto a disponibilidad.',
                    hotels: cabins,
                    flights: flightsForPdf,
                    corporateBrand: activeCorporateBrand,
                    advisorName,
                    advisorRole,
                    currency // Pass selected currency
                });

            } catch (error) {
                alert("Error al generar PDF de Crucero: " + error.message);
            }
        };
        return (
            <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 max-w-5xl mx-auto space-y-8 animate-fade-in relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* ENCABEZADO Y DATOS DE RUTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-700/50 pb-8">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-bold shadow-lg shadow-yellow-500/20">
                                Cotización No {previewFolio || '1840'}
                            </div>
                            <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg font-bold shadow-lg shadow-yellow-500/20">
                                Fecha: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Destino</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold"
                                        placeholder="Crucero por el Caribe"
                                        value={cruiseData.destination}
                                        onChange={e => setCruiseData({ ...cruiseData, destination: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Pasajeros</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                                        placeholder="2 adultos"
                                        value={cruiseData.passengers}
                                        onChange={e => setCruiseData({ ...cruiseData, passengers: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Plan (Naviera)</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                                        placeholder="Costa Cruises (Fascinosa)"
                                        value={cruiseData.plan}
                                        onChange={e => setCruiseData({ ...cruiseData, plan: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Acomodación</label>
                                    <input
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                                        placeholder="1 Cabina Doble"
                                        value={cruiseData.accommodation}
                                        onChange={e => setCruiseData({ ...cruiseData, accommodation: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-48 md:h-auto rounded-xl overflow-hidden group">
                        <img
                            src="https://images.unsplash.com/photo-1548574505-5e239809ee19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
                            alt="Crucero"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                            <p className="text-white font-bold text-lg">Experiencia en Alta Mar</p>
                        </div>
                    </div>
                </div>

                {/* ITINERARIO DEL CRUCERO */}
                <section>
                    <h3 className="text-cyan-400 font-bold text-lg uppercase tracking-wider mb-4 text-center border-b border-slate-700 pb-2">
                        Itinerario del Crucero
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-slate-700/50">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800 text-slate-300 uppercase text-xs">
                                <tr>
                                    <th className="p-3">Día</th>
                                    <th className="p-3">Fecha</th>
                                    <th className="p-3">Puerto</th>
                                    <th className="p-3 text-right">Llegada</th>
                                    <th className="p-3 text-right">Salida</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 bg-slate-900/30">
                                {cruiseItinerary.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors group">
                                        <td className="p-3 font-mono text-slate-400">
                                            <input
                                                className="bg-transparent w-full outline-none text-center"
                                                value={row.day}
                                                placeholder="#"
                                                onChange={e => handleItineraryChange(i, 'day', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-3 text-slate-300">
                                            <input
                                                className="bg-transparent w-full outline-none"
                                                value={row.date}
                                                placeholder="01-01 lun"
                                                onChange={e => handleItineraryChange(i, 'date', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-3 font-bold text-cyan-300 flex items-center gap-2">
                                            <Map className="w-3 h-3" />
                                            <input
                                                className="bg-transparent w-full outline-none font-bold uppercase"
                                                value={row.port}
                                                placeholder="PUERTO"
                                                onChange={e => handleItineraryChange(i, 'port', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-3 text-right text-slate-400">
                                            <input
                                                className="bg-transparent w-full outline-none text-right"
                                                value={row.arr}
                                                placeholder="00:00"
                                                onChange={e => handleItineraryChange(i, 'arr', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-3 text-right text-slate-400">
                                            <input
                                                className="bg-transparent w-full outline-none text-right"
                                                value={row.dep}
                                                placeholder="00:00"
                                                onChange={e => handleItineraryChange(i, 'dep', e.target.value)}
                                            />
                                        </td>
                                        <td className="p-3 text-center w-10">
                                            {cruiseItinerary.length > 1 && (
                                                <button onClick={() => removeItineraryRow(i)} className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button
                            onClick={addItineraryRow}
                            className="w-full py-2 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors border-t border-slate-700/50 uppercase tracking-widest"
                        >
                            + Agregar Día
                        </button>
                    </div>
                </section>

                {/* OPCIONES DE CABINA */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-cyan-400 font-bold text-lg uppercase tracking-wider">Opciones de Alojamiento</h3>
                        <label className="inline-flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700">
                            <input type="checkbox" className="w-4 h-4 rounded accent-cyan-500" checked={includeAirInCruise} onChange={e => setIncludeAirInCruise(e.target.checked)} />
                            Incluir Tiquetes Aéreos
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cruiseCabins.map((cabin, idx) => (
                            <div key={cabin.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 relative group">
                                <button
                                    onClick={() => setCruiseCabins(prev => prev.filter(c => c.id !== cabin.id))}
                                    className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="space-y-3 mt-2">
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Tipo de Cabina</label>
                                        <input
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm uppercase"
                                            value={cabin.title}
                                            onChange={e => setCruiseCabins(prev => prev.map(c => c.id === cabin.id ? { ...c, title: e.target.value.toUpperCase() } : c))}
                                            placeholder="INTERIOR / EXTERIOR"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Precio Total (USD)</label>
                                        <input
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-yellow-400 font-mono font-bold"
                                            value={cabin.price}
                                            onChange={e => setCruiseCabins(prev => prev.map(c => c.id === cabin.id ? { ...c, price: e.target.value } : c))}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => setCruiseCabins(prev => [...prev, { id: Date.now(), title: '', price: '' }])}
                            className="border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all min-h-[160px]"
                        >
                            <Plus className="w-8 h-8 opacity-50" />
                            <span className="text-xs font-bold uppercase">Agregar Opción</span>
                        </button>
                    </div>
                </section>

                {/* ITINERARIO AÉREO DETALLADO (Opcional) */}
                {includeAirInCruise && (
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
                                                    <input value={f.airline} onChange={e => handleCruiseFlightChange(f.id, 'airline', e.target.value)} placeholder="IBERIA" className="bg-transparent text-white outline-none w-24 font-bold uppercase" />
                                                </div>
                                            </td>
                                            <td className="p-3"><input value={f.flight} onChange={e => handleCruiseFlightChange(f.id, 'flight', e.target.value)} placeholder="IB6588" className="bg-transparent text-slate-300 outline-none w-full font-mono" /></td>
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <input value={f.dep} onChange={e => handleCruiseFlightChange(f.id, 'dep', e.target.value)} placeholder="BOG - 18:00" className="bg-transparent text-white font-bold outline-none w-full" />
                                                    <input type="date" value={f.depDate} onChange={e => handleCruiseFlightChange(f.id, 'depDate', e.target.value)} className="bg-transparent text-xs text-slate-400 outline-none w-full" />
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <input value={f.arr} onChange={e => handleCruiseFlightChange(f.id, 'arr', e.target.value)} placeholder="MAD - 10:30" className="bg-transparent text-white font-bold outline-none w-full" />
                                                    <input type="date" value={f.arrDate} onChange={e => handleCruiseFlightChange(f.id, 'arrDate', e.target.value)} className="bg-transparent text-xs text-slate-400 outline-none w-full" />
                                                </div>
                                            </td>
                                            <td className="p-3"><input value={f.duration} onChange={e => handleCruiseFlightChange(f.id, 'duration', e.target.value)} placeholder="9h 30m" className="bg-transparent text-slate-300 outline-none w-full" /></td>
                                            <td className="p-3"><input value={f.aircraft} onChange={e => handleCruiseFlightChange(f.id, 'aircraft', e.target.value)} placeholder="A350-900" className="bg-transparent text-slate-300 outline-none w-full" /></td>
                                            <td className="p-3 text-right"><button onClick={() => removeCruiseFlight(f.id)} className="text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <button onClick={addCruiseFlight} className="w-full py-3 bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors border-t border-slate-700/50 uppercase tracking-widest">
                                + Agregar Trayecto
                            </button>
                        </div>
                    </section>
                )}

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

                        {/* CONDICIONES GENERALES (Estilo Grid Azul/Slate) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Columna Izquierda: Condiciones Generales */}
                            <section className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 h-full">
                                <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4 border-b border-slate-700/50 pb-2">
                                    Condiciones Generales
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-emerald-400 font-bold text-xs uppercase mb-2">Forma de Pago</h4>
                                        <ul className="text-sm text-slate-400 space-y-1 list-disc pl-4 marker:text-emerald-500">
                                            <li>Pago en pesos colombianos a la TRM del día</li>
                                            <li>Transferencia Bancaria / QR / PSE</li>
                                            <li>Tarjeta de crédito (+3% fee administrativo)</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-emerald-400 font-bold text-xs uppercase mb-2">Restricciones</h4>
                                        <ul className="text-sm text-slate-400 space-y-1 list-disc pl-4 marker:text-emerald-500">
                                            <li>Anulación genera gastos del 100% una vez pagado</li>
                                            <li>Servicios no tomados no son reembolsables</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Columna Derecha: Documentos Requeridos */}
                            <section className="bg-blue-900/10 p-6 rounded-xl border border-blue-500/20 h-full">
                                <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-blue-500/20 pb-2">
                                    <ShieldCheck className="w-4 h-4" /> Documentos Requeridos
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm text-slate-300">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        <span>Cédula de ciudadanía original</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-300">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        <span>Pasaporte vigente (Solo vuelos internacionales)</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm text-slate-300">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0"></span>
                                        <span>Vacuna contra la Fiebre Amarilla</span>
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
                    {user?.modules?.vacacional === 'read' ? (
                        <div className="flex items-center gap-3 bg-amber-900/20 border border-amber-500/30 px-6 py-3 rounded-2xl text-amber-400 font-bold text-sm shadow-xl">
                            <ShieldCheck className="w-5 h-5" />
                            MODO LECTURA (GERENCIA)
                        </div>
                    ) : (
                        <>
                            <button className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold transition-all">
                                Guardar Borrador
                            </button>
                            <button
                                className={`px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${cruiseValid() ? 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-cyan-900/20' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                                disabled={!cruiseValid()}
                                title={!cruiseValid() ? 'Complete los campos obligatorios de cabina/itinerario aéreo' : ''}
                                onClick={handleGenerateCruisePdf}
                            >
                                Generar PDF Crucero ({currency})
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const SmartQuoteForm = ({ config }) => {
        const [currentStep, setCurrentStep] = useState(1);
        const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
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

        // Datos del Formulario
        const [clientData, setClientData] = useState({
            // Vacacional
            name: '', id: '', phone: '', email: '',
            // Corporativo
            company: '', nit: '', costCenter: '', employeeCode: '',
            // General
            destination: '', dateStart: '', dateEnd: '', duration: '',
            adults: 1, children: 0
        });

        const [flights, setFlights] = useState([
            { id: 1, airline: '', flight: '', route: '', time: '', class: '', bag: '', price: '' }
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
            { id: 1, name: '', category: '', room: '', mealPlan: '', pricePerPax: '', total: 0, includes: [] }
        ]);
        const [includesDraft, setIncludesDraft] = useState({});

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
        const [currency, setCurrency] = useState('USD');
        const [showErrors, setShowErrors] = useState(false);
        const [isSaving, setIsSaving] = useState(false);
        const [saveStatus, setSaveStatus] = useState('');

        useEffect(() => {
            setIncludeAir(activeSubTab !== 'terrestre');
        }, [activeSubTab]);

        // Mostrar equipaje automáticamente si hay vuelos cargados
        useEffect(() => {
            if (flights && flights.length > 0) {
                setShowLuggage(true);
            }
        }, [flights.length]);

        // Handlers
        const addFlight = () => setFlights([...flights, { id: Date.now(), airline: '', flight: '', route: '', time: '', class: '', bag: '', price: '' }]);
        const removeFlight = (id) => setFlights(flights.filter(f => f.id !== id));
        const handleFlightChange = (id, field, value) => setFlights(flights.map(f => f.id === id ? { ...f, [field]: value } : f));

        const addHotel = () => setHotels([...hotels, { id: Date.now(), name: '', category: '', room: '', mealPlan: '', pricePerPax: '', total: 0, includes: [] }]);
        const removeHotel = (id) => setHotels(hotels.filter(h => h.id !== id));
        const handleHotelChange = (id, field, value) => setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
        const handleHotelIncludeAdd = (id, value) => {
            const v = (value || '').trim();
            if (!v) return;
            setHotels(hotels.map(h => h.id === id ? { ...h, includes: [...(h.includes || []), v] } : h));
            setIncludesDraft(prev => ({ ...prev, [id]: '' }));
        };
        const handleHotelIncludeRemove = (id, idx) => {
            setHotels(hotels.map(h => {
                if (h.id !== id) return h;
                const arr = (h.includes || []).slice();
                arr.splice(idx, 1);
                return { ...h, includes: arr };
            }));
        };

        const handleConvertToConfirmation = () => {
            setFormData(prev => ({
                ...prev,
                clientName: quoteType === 'vacacional' ? clientData.name : clientData.company,
                destination: clientData.destination,
            }));
            setActiveMainTab('confirmation');
        };

        const handleFinalSave = async (generatePdf = false) => {
            setIsSaving(true);
            setSaveStatus('Guardando en Supabase...');
            try {
                let folio = previewFolio;
                if (!folio) {
                    folio = await Folios.getNext('COT');
                    setPreviewFolio(folio);
                }

                const flightsForPayload = Array.isArray(flights)
                    ? flights.map(f => ({
                        airline: f.airline || '',
                        flight: f.flight || '',
                        route: f.route || '',
                        time: f.time || '',
                        class: f.class || '',
                        price: f.price || ''
                    }))
                    : [];

                const allIncludes = Array.isArray(hotels)
                    ? hotels.flatMap(h => h.includes || [])
                    : [];

                const payload = {
                    folio,
                    clientName: quoteType === 'vacacional' ? clientData.name : clientData.company,
                    clientEmail: clientData.email,
                    clientPhone: clientData.phone,
                    destination: clientData.destination,
                    adults: clientData.adults,
                    children: clientData.children,
                    dateStart: clientData.dateStart,
                    dateEnd: clientData.dateEnd,
                    hotels,
                    includes: allIncludes,
                    notes: extras.notes,
                    flights: flightsForPayload,
                    luggage,
                    corporateBrand: quoteType === 'corporativo' ? (selectedCorporateBrand || activeCorporateBrand) : null,
                    groundLogistics: activeSubTab === 'terrestre' ? groundLogistics : null,
                    quoteType,
                    status: 'draft',
                    createdAt: new Date().toISOString(),
                    advisorName,
                    advisorRole,
                    currency // Pass selected currency
                };

                const result = await QuotesApi.createQuote(payload, user);
                if (result.ok) {
                    setSaveStatus('¡Guardado con éxito!');
                    if (generatePdf) {
                        generateQuotePdf({
                            ...payload,
                            currency, // Pass selected currency
                            advisorName: user?.name, // Automate signature name
                            advisorRole: user?.role_label // Automate signature role
                        });
                    }
                } else {
                    setSaveStatus('Error al guardar: ' + result.error);
                }
            } catch (error) {
                setSaveStatus('Error crítico al guardar.');
            } finally {
                setIsSaving(false);
                setTimeout(() => setSaveStatus(''), 3000);
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
            if (currentStep === 1) {
                if (quoteType === 'vacacional') {
                    return (
                        isFilled(clientData.name) &&
                        isFilled(clientData.id) &&
                        isFilled(clientData.phone) &&
                        isFilled(clientData.email) &&
                        isFilled(clientData.destination) &&
                        isFilled(clientData.dateStart) &&
                        isFilled(clientData.dateEnd) &&
                        isFilled(clientData.adults) &&
                        (clientData.children === 0 || isFilled(clientData.children))
                    );
                }
                return (
                    isFilled(clientData.company) &&
                    isFilled(clientData.nit) &&
                    isFilled(clientData.costCenter) &&
                    isFilled(clientData.employeeCode) &&
                    isFilled(clientData.destination) &&
                    isFilled(clientData.dateStart) &&
                    isFilled(clientData.dateEnd) &&
                    isFilled(clientData.adults)
                );
            }
            if (currentStep === 2) {
                // Validación más flexible: si hay vuelos, exigir datos mínimos (aerolínea, vuelo, ruta)
                const flightsOk = (activeSubTab === 'terrestre')
                    ? true
                    : (flights.length === 0
                        ? true
                        : flights.every(f =>
                            isFilled(f.airline) && isFilled(f.flight) && isFilled(f.route)
                        ));
                const hotelsOk = hotels.length === 0 ? true : hotels.every(h =>
                    isFilled(h.name) && isFilled(h.category) && isFilled(h.room) && (h.total === 0 || isFilled(h.total))
                );
                if (activeSubTab === 'terrestre') {
                    const groundOk = isFilled(groundLogistics.meetPoint) && isFilled(groundLogistics.meetDate) && isFilled(groundLogistics.meetTime) && isFilled(groundLogistics.operator);
                    return groundOk && hotelsOk;
                }
                return flightsOk && hotelsOk;
            }
            if (currentStep === 3) {
                const hotelIncludesOk = hotels.length > 0 && hotels.every(h => Array.isArray(h.includes) && h.includes.length > 0);
                return hotelIncludesOk && isFilled(extras.excludes) && isFilled(extras.notes);
            }
            if (currentStep === 4) return true;
            return false;
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
                    const colorClass = isActive || isCompleted ? `text-${s.color}-400 border-${s.color}-500 bg-${s.color}-500/20` : 'text-slate-500 border-slate-700 bg-slate-800';

                    // Mapeo manual de clases para asegurar tailwind las detecte
                    let activeClass = "";
                    if (s.color === 'blue') activeClass = isActive || isCompleted ? "border-blue-500 text-blue-400 bg-blue-900/50 shadow-blue-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                    if (s.color === 'yellow') activeClass = isActive || isCompleted ? "border-yellow-500 text-yellow-400 bg-yellow-900/50 shadow-yellow-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                    if (s.color === 'emerald') activeClass = isActive || isCompleted ? "border-emerald-500 text-emerald-400 bg-emerald-900/50 shadow-emerald-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                    if (s.color === 'cyan') activeClass = isActive || isCompleted ? "border-cyan-500 text-cyan-400 bg-cyan-900/50 shadow-cyan-500/50" : "border-slate-700 text-slate-600 bg-slate-900";

                    return (
                        <div
                            key={s.num}
                            className="relative z-10 flex flex-col items-center cursor-pointer"
                            onClick={() => setCurrentStep(s.num)}
                        >
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 ${activeClass} ${isActive ? 'shadow-lg scale-110' : ''}`}>
                                {isCompleted ? <Check className="w-5 h-5" /> : s.num}
                            </div>
                            <span className={`text-[10px] uppercase font-bold mt-2 tracking-wider ${isActive || isCompleted ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
                        </div>
                    );
                })}
            </div>
        );

        const renderClientCard = () => (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                    Datos del {quoteType === 'vacacional' ? 'Titular' : 'Solicitante'}
                </h3>

                {quoteType === 'vacacional' ? (
                    <>
                        <div className="group">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nombre Completo</label>
                            <input
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.name) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                value={clientData.name}
                                onChange={e => setClientData({ ...clientData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Identificación</label>
                                <input
                                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.id) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                    value={clientData.id}
                                    onChange={e => setClientData({ ...clientData, id: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Celular</label>
                                <input
                                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.phone) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                    value={clientData.phone}
                                    onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Email</label>
                                <input
                                    type="email"
                                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.email) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                    value={clientData.email}
                                    onChange={e => setClientData({ ...clientData, email: e.target.value })}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="group">
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Razón Social / Empresa</label>
                            <input
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.company) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                value={clientData.company}
                                onChange={e => setClientData({ ...clientData, company: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">NIT</label>
                                <input
                                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.nit) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                    value={clientData.nit}
                                    onChange={e => setClientData({ ...clientData, nit: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Centro de Costos</label>
                                <input
                                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.costCenter) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                    value={clientData.costCenter}
                                    onChange={e => setClientData({ ...clientData, costCenter: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Código Empleado / Solicitante</label>
                            <input
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.employeeCode) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                value={clientData.employeeCode}
                                onChange={e => setClientData({ ...clientData, employeeCode: e.target.value })}
                            />
                        </div>
                    </>
                )}
            </div>
        );

        const renderDestinationCard = () => (
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                    Detalles del Destino
                </h3>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Destino Principal</label>
                    <input
                        className={`w-full bg-slate-900 border rounded-xl p-3 text-white font-bold text-lg transition-colors outline-none uppercase ${showErrors && !isFilled(clientData.destination) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                        placeholder="EJ. MIAMI, FL"
                        value={clientData.destination}
                        onChange={e => setClientData({ ...clientData, destination: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Salida</label>
                        <input
                            type="date"
                            className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.dateStart) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                            value={clientData.dateStart}
                            onChange={e => setClientData({ ...clientData, dateStart: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Regreso</label>
                        <input
                            type="date"
                            className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.dateEnd) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                            value={clientData.dateEnd}
                            onChange={e => setClientData({ ...clientData, dateEnd: e.target.value })}
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Duración del Viaje</label>
                    <input
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500"
                        placeholder="Ej: 4 Días / 3 Noches"
                        value={clientData.duration}
                        onChange={e => setClientData({ ...clientData, duration: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Adultos</label>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="number"
                                className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.adults) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                placeholder="Número de adultos"
                                value={clientData.adults}
                                onChange={e => setClientData({ ...clientData, adults: e.target.value })}
                            />
                        </div>
                    </div>
                    {quoteType === 'vacacional' && (
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Niños</label>
                            <div className="relative">
                                <Users2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                <input
                                    type="number"
                                    className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && clientData.children === '' ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'}`}
                                    placeholder="Número de niños"
                                    value={clientData.children}
                                    onChange={e => setClientData({ ...clientData, children: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
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
                        <div className="space-y-8 animate-fade-in">
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
                                                value={selectedCorporateBrand?.key || ''}
                                                onChange={e => {
                                                    const key = e.target.value;
                                                    const brand = key ? {
                                                        key,
                                                        name: key === 'sonreir' ? 'Fundación Sonreír' : 'Syscom Colombia',
                                                        logo: key === 'sonreir' ? '/logos/corporate/sonreir.png' : '/logos/corporate/syscom-colombia.png'
                                                    } : null;
                                                    setSelectedCorporateBrand(brand);
                                                    const fol = (previewFolio || '').trim();
                                                    if (fol) {
                                                        const ex = ERP.getQuoteByFolio(fol) || {};
                                                        ERP.saveQuote(fol, { ...ex, corporateBrand: brand });
                                                    }
                                                }}
                                            >
                                                <option value="">Seleccione</option>
                                                <option value="sonreir">Fundación Sonreír</option>
                                                <option value="syscom">Syscom Colombia</option>
                                            </select>
                                            {selectedCorporateBrand?.logo && (
                                                <img src={selectedCorporateBrand.logo} alt={selectedCorporateBrand.name} className="h-8 w-auto object-contain opacity-90" />
                                            )}
                                            <div className="bg-yellow-500 text-slate-900 px-3 py-1 rounded-lg font-bold text-xs">
                                                {previewFolio || 'COT-0001'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {renderClientCard()}
                                        {renderDestinationCard()}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PASO 2: ITINERARIO Y ALOJAMIENTO */}
                    {currentStep === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Vuelos */}
                            {activeSubTab !== 'terrestre' && (
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 group-hover:w-2 transition-all"></div>
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 pl-4">
                                        <div className="flex flex-col gap-2">
                                            <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                                <Plane className="w-5 h-5 text-yellow-400" /> Itinerario Aéreo
                                            </h3>
                                            <label className="inline-flex items-center gap-2 text-slate-300 text-[11px] font-bold">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-yellow-400 rounded bg-slate-900 border-slate-700"
                                                    checked={showLuggage}
                                                    onChange={e => setShowLuggage(e.target.checked)}
                                                />
                                                <span className="uppercase tracking-widest">Equipaje Incluido</span>
                                            </label>
                                        </div>
                                        <button onClick={addFlight} className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                            <Plus className="w-3 h-3" /> Agregar
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-xs text-slate-400 uppercase border-b border-slate-700/50">
                                                    <th className="pb-3 pl-4">Aerolínea</th>
                                                    <th className="pb-3">Vuelo</th>
                                                    <th className="pb-3">Ruta</th>
                                                    <th className="pb-3">Hora</th>
                                                    <th className="pb-3">Clase</th>
                                                    <th className="pb-3 text-right">Valor Unitario</th>
                                                    <th className="pb-3"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/30">
                                                {flights.map((flight) => (
                                                    <tr key={flight.id} className="group/row hover:bg-slate-700/20 transition-colors">
                                                        <td className="py-2 pl-4"><input className={`bg-transparent text-white font-bold w-full outline-none uppercase text-sm border ${showErrors && (!flight.airline || String(flight.airline).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`} placeholder="AVIANCA" value={flight.airline} onChange={e => handleFlightChange(flight.id, 'airline', e.target.value)} /></td>
                                                        <td className="py-2"><input className={`bg-transparent text-slate-300 w-full outline-none font-mono text-xs border ${showErrors && (!flight.flight || String(flight.flight).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`} placeholder="AV8532" value={flight.flight} onChange={e => handleFlightChange(flight.id, 'flight', e.target.value)} /></td>
                                                        <td className="py-2"><input className={`bg-transparent text-white font-bold w-full outline-none uppercase text-sm border ${showErrors && (!flight.route || String(flight.route).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`} placeholder="BOG-MDE" value={flight.route} onChange={e => handleFlightChange(flight.id, 'route', e.target.value)} /></td>
                                                        <td className="py-2"><input type="time" className={`bg-transparent text-slate-300 w-full outline-none text-xs border ${showErrors && (!flight.time || String(flight.time).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`} value={flight.time} onChange={e => handleFlightChange(flight.id, 'time', e.target.value)} /></td>
                                                        <td className="py-2">
                                                            <select className={`bg-slate-900 border rounded text-xs text-slate-300 p-1 ${showErrors && (!flight.class || String(flight.class).trim() === '') ? 'border-red-500/50' : 'border-slate-700'}`} value={flight.class} onChange={e => handleFlightChange(flight.id, 'class', e.target.value)}>
                                                                <option value="">Sel</option>
                                                                <option value="eco">Econ</option>
                                                                <option value="exe">Exec</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-2">
                                                            <input
                                                                className="bg-transparent text-yellow-300 w-full outline-none text-xs text-right placeholder-slate-500"
                                                                placeholder="$ 2.300.000 / Incluido"
                                                                value={flight.price || ''}
                                                                onChange={e => handleFlightChange(flight.id, 'price', e.target.value)}
                                                            />
                                                        </td>
                                                        <td className="py-2 text-right"><button onClick={() => removeFlight(flight.id)} className="text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {(showLuggage || (flights && flights.length > 0)) && activeSubTab !== 'terrestre' && (
                                <LuggageIncludedCard value={luggage} onChange={setLuggage} />
                            )}

                            {/* Logística de Encuentro (solo Porción Terrestre) */}
                            {activeSubTab === 'terrestre' && (
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
                                            <input className={`w-full bg-slate-900 border rounded-xl p-3 text-white outline-none ${showErrors && !isFilled(groundLogistics.meetPoint) ? 'border-red-500/50' : 'border-slate-700'}`} placeholder="Terminal Salitre - Bogotá" value={groundLogistics.meetPoint} onChange={e => setGroundLogistics({ ...groundLogistics, meetPoint: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Fecha de Encuentro</label>
                                            <input type="date" className={`w-full bg-slate-900 border rounded-xl p-3 text-white outline-none ${showErrors && !isFilled(groundLogistics.meetDate) ? 'border-red-500/50' : 'border-slate-700'}`} value={groundLogistics.meetDate} onChange={e => setGroundLogistics({ ...groundLogistics, meetDate: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Hora de Encuentro</label>
                                            <input type="time" className={`w-full bg-slate-900 border rounded-xl p-3 text-white outline-none ${showErrors && !isFilled(groundLogistics.meetTime) ? 'border-red-500/50' : 'border-slate-700'}`} value={groundLogistics.meetTime} onChange={e => setGroundLogistics({ ...groundLogistics, meetTime: e.target.value })} />
                                        </div>
                                        <div className="col-span-2 md:col-span-4">
                                            <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Operador / Bus</label>
                                            <input className={`w-full bg-slate-900 border rounded-xl p-3 text-white outline-none ${showErrors && !isFilled(groundLogistics.operator) ? 'border-red-500/50' : 'border-slate-700'}`} placeholder="Operador XYZ / Bus Mercedes Sprinter" value={groundLogistics.operator} onChange={e => setGroundLogistics({ ...groundLogistics, operator: e.target.value })} />
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Hoteles */}
                            <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 group-hover:w-2 transition-all"></div>
                                <div className="flex justify-between items-center mb-6 pl-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <Ship className="w-5 h-5 text-yellow-400" /> Alojamiento
                                    </h3>
                                    <button onClick={addHotel} className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                        <Plus className="w-3 h-3" /> Agregar
                                    </button>
                                </div>
                                <div className="grid gap-4">
                                    {hotels.map((hotel) => (
                                        <div key={hotel.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-wrap md:flex-nowrap gap-4 items-center">
                                            <div className="flex-1 min-w-[160px]">
                                                <input
                                                    className={`w-full bg-transparent text-white font-bold text-lg outline-none uppercase placeholder-slate-600 border ${showErrors && (!hotel.name || String(hotel.name).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`}
                                                    placeholder="Nombre del alojamiento (hotel, finca, etc.)"
                                                    value={hotel.name}
                                                    onChange={e => handleHotelChange(hotel.id, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="w-40 min-w-[140px]">
                                                <input className={`w-full bg-transparent text-slate-300 text-sm outline-none uppercase placeholder-slate-600 border ${showErrors && (!hotel.category || String(hotel.category).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`} placeholder="CATEGORÍA" value={hotel.category} onChange={e => handleHotelChange(hotel.id, 'category', e.target.value)} />
                                            </div>
                                            <div className="w-32 min-w-[120px]">
                                                <input className={`w-full bg-transparent text-slate-300 text-sm outline-none uppercase placeholder-slate-600 border ${showErrors && (!hotel.room || String(hotel.room).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`} placeholder="HABITACIÓN" value={hotel.room} onChange={e => handleHotelChange(hotel.id, 'room', e.target.value)} />
                                            </div>
                                            <div className="w-32 min-w-[120px]">
                                                <input
                                                    className={`w-full bg-slate-800 border rounded-lg p-2 text-right text-yellow-400 font-mono font-bold outline-none ${showErrors && hotel.pricePerPax === '' ? 'border-red-500/50' : 'border-slate-700'}`}
                                                    placeholder="Valor USD"
                                                    value={hotel.pricePerPax}
                                                    onChange={e => {
                                                        const val = e.target.value;
                                                        handleHotelChange(hotel.id, 'pricePerPax', val);
                                                        const num = parseFloat(val) || 0;
                                                        handleHotelChange(hotel.id, 'total', num * (parseInt(clientData.adults) || 1));
                                                    }}
                                                />
                                            </div>
                                            <div className="w-32 text-right font-mono font-bold text-white whitespace-nowrap">
                                                USD {parseFloat(hotel.total || 0).toLocaleString()}
                                            </div>
                                            <button onClick={() => removeHotel(hotel.id)} className="text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Opciones Corporativas */}
                            {quoteType === 'corporativo' && (
                                <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6">
                                    <h3 className="text-white font-bold uppercase text-sm mb-4">Opciones Corporativas</h3>
                                    <div className="flex flex-wrap gap-6">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 accent-yellow-500 rounded bg-slate-900 border-slate-700"
                                                checked={corporateOptions.flexibleFare} onChange={e => setCorporateOptions({ ...corporateOptions, flexibleFare: e.target.checked })} />
                                            <span className="text-slate-300 text-sm">Tarifa Flexible (Cambios permitidos)</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 accent-yellow-500 rounded bg-slate-900 border-slate-700"
                                                checked={corporateOptions.corporateAgreement} onChange={e => setCorporateOptions({ ...corporateOptions, corporateAgreement: e.target.checked })} />
                                            <span className="text-slate-300 text-sm">Aplicar Convenio Corporativo</span>
                                        </label>
                                    </div>
                                    {corporateOptions.corporateAgreement && (
                                        <div className="mt-4 animate-fade-in">
                                            <input className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white w-full md:w-64 outline-none" placeholder="Código de Convenio"
                                                value={corporateOptions.agreementCode} onChange={e => setCorporateOptions({ ...corporateOptions, agreementCode: e.target.value })} />
                                        </div>
                                    )}
                                </section>
                            )}
                        </div>
                    )}

                    {/* PASO 3: REVISIÓN Y EXTRAS */}
                    {currentStep === 3 && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl">
                                    <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Incluye por opción de hotel
                                    </h3>
                                    <div className="space-y-4">
                                        {hotels.map(h => (
                                            <div key={h.id} className={`bg-slate-900/40 border rounded-2xl p-4 space-y-3 ${showErrors && (!h.includes || h.includes.length === 0) ? 'border-red-500/40' : 'border-slate-700/60'}`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-white font-bold uppercase tracking-tight">{h.name || 'HOTEL'}</div>
                                                        <div className="text-[11px] text-yellow-400 uppercase font-bold">{h.category || 'CATEGORÍA'}</div>
                                                    </div>
                                                    <div className="rounded-xl px-2 py-1 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 text-[10px] font-black uppercase tracking-widest">
                                                        Opción
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(h.includes || []).map((item, idx) => (
                                                        <span key={idx} className="inline-flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-[11px] font-bold px-2 py-1 rounded-full">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                                                            {item}
                                                            <button type="button" className="ml-1 text-yellow-300/60 hover:text-yellow-200" onClick={() => handleHotelIncludeRemove(h.id, idx)}>×</button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-sm outline-none focus:border-yellow-500"
                                                        placeholder="Añadir beneficio (Enter)…"
                                                        value={includesDraft[h.id] || ''}
                                                        onChange={e => setIncludesDraft(prev => ({ ...prev, [h.id]: e.target.value }))}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleHotelIncludeAdd(h.id, includesDraft[h.id] || '');
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleHotelIncludeAdd(h.id, includesDraft[h.id] || '')}
                                                        className="px-3 py-2 rounded-xl bg-yellow-500/20 border border-yellow-400/40 text-yellow-300 font-bold text-sm hover:bg-yellow-500/30"
                                                    >
                                                        Añadir
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl">
                                    <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" /> No Incluye
                                    </h3>
                                    <textarea className={`w-full bg-transparent text-red-100/80 text-sm leading-relaxed outline-none resize-none h-40 placeholder-red-500/30 border ${showErrors && (!extras.excludes || String(extras.excludes).trim() === '') ? 'border-red-500/50' : 'border-transparent'}`}
                                        placeholder="Ingrese los servicios no incluidos..." value={extras.excludes} onChange={e => setExtras({ ...extras, excludes: e.target.value })}></textarea>
                                </div>
                            </div>

                            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                                <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Notas Legales y Condiciones</h3>
                                <textarea className={`w-full bg-slate-900/50 border rounded-xl p-4 text-slate-300 text-sm h-32 outline-none ${showErrors && (!extras.notes || String(extras.notes).trim() === '') ? 'border-red-500/50' : 'border-slate-700'}`}
                                    placeholder="Cláusulas específicas..." value={extras.notes} onChange={e => setExtras({ ...extras, notes: e.target.value })}></textarea>
                            </div>
                        </div>
                    )}

                    {/* PASO 4: FINALIZACIÓN */}
                    {currentStep === 4 && (
                        <div className="flex flex-col items-center justify-center py-12 animate-fade-in space-y-8 text-center">
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
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="border-t border-slate-700/50 pt-6 mt-8 flex justify-between items-center relative z-10">
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        <ArrowLeft className="w-4 h-4" /> Anterior
                    </button>

                    {currentStep < 4 ? (
                        <div className="flex flex-col items-end">
                            <button
                                onClick={() => {
                                    if (!validateStep()) {
                                        setShowErrors(true);
                                        return;
                                    }
                                    setShowErrors(false);
                                    setCurrentStep(prev => Math.min(4, prev + 1));
                                }}
                                disabled={!validateStep()}
                                title={!validateStep() ? 'Atención: Debes completar todos los campos para continuar' : ''}
                                className={`px-8 py-3 font-bold rounded-xl transition-all flex items-center gap-2 ${!validateStep() ? 'bg-slate-700 text-slate-400 opacity-60 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30'}`}
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
                    )}
                </div>
            </div>
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
                                {activeSubTab === 'corporativo' ? 'Corporativo' : (activeSubTab ? 'Vacacional' : 'Cotizaciones')}
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
                                                    const modules = user?.modules || {};
                                                    if (['nacional', 'internacional', 'crucero', 'quince', 'grupos', 'hotel', 'terrestre'].includes(type.id)) {
                                                        return modules.vacacional === 'full' || modules.admin === 'full';
                                                    }
                                                    if (type.id === 'tiquetes') {
                                                        return modules.corporativo === 'full' || modules.admin === 'full';
                                                    }
                                                    return true;
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

                        <div className="p-4 border-t border-slate-700/60 bg-[#1e293b]/50 backdrop-blur-sm mt-auto">
                            <button
                                onClick={() => { window.location.href = '/intranet'; }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-100 text-[10px] font-bold uppercase tracking-[0.18em] border border-slate-700 hover:border-slate-500 shadow-lg shadow-slate-900/40"
                            >
                                <X className="w-4 h-4 text-red-400" />
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
                                                !['crucero', 'tiquetes'].includes(activeSubTab) ? (
                                                    <SmartQuoteForm config={adminConfig} />
                                                ) : activeSubTab === 'tiquetes' ? (
                                                    <FlightQuoteForm />
                                                ) : (
                                                    <CruiseQuoteForm />
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
                            />}
                        </div>
                    </main>
                </>
            )}
        </div>
    );
};

const ConfigurationView = ({ setActiveMainTab, setPreviewFolio, setActiveSubTab }) => {
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
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await QuotesApi.listQuotes();
                const myDocs = res.filter(q =>
                    q.created_by_email === user?.email ||
                    q.data?.advisorEmail === user?.email ||
                    q.data?.advisorName?.toUpperCase() === user?.full_name?.toUpperCase()
                );
                setHistory(myDocs);
            } finally {
                setLoadingHistory(false);
            }
        };
        loadHistory();
    }, [user]);

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
        if (isConf) {
            setActiveMainTab('confirmation');
        } else {
            setActiveMainTab('cotizaciones');
            // Default to first subtab if none active
            setActiveSubTab(d.serviceType || 'nacional');
        }
    };

    const handleDownload = (row) => {
        const data = row.data || {};
        const flights = data.flights || data.flightRows || [];
        const hotels = data.hotels || [];
        const luggage = data.luggage || { personal: true, hand: true, checked: false };
        const extras = data.extras || {};

        const isConfirmation = !!data.serviceConfirmed;

        const pdfOpts = {
            folio: row.folio,
            clientName: data.clientName,
            clientEmail: data.clientEmail || data.email,
            clientPhone: data.clientPhone || data.phone,
            destination: data.destination,
            adults: data.adults || 0,
            children: data.children || 0,
            dateStart: data.dateStart,
            dateEnd: data.dateEnd,
            duration: data.duration,
            hotels,
            includes: Array.isArray(hotels) && hotels.length ? hotels.flatMap(h => h.includes || []) : (extras.includes || []),
            notes: extras.notes || data.notes,
            flights: flights.map(f => ({
                airline: f.airline || '',
                flight: f.flight || '',
                route: f.route || '',
                duration: f.duration || '',
                equipment: f.equipment || f.class || '',
                eticket: f.eticket,
                pnr: f.pnr,
                passengerName: f.passengerName,
                passengerId: f.passengerId,
                flightDate: f.flightDate,
                depTime: f.depTime,
                arrTime: f.arrTime,
                valueUsd: f.valueUsd
            })),
            flightRows: data.flightRows,
            luggage,
            corporateBrand: data.corporateBrand,
            groundLogistics: data.groundLogistics,
            advisorName: user?.full_name,
            advisorRole: user?.professional_role
        };

        if (isConfirmation) {
            generateConfirmationPdf(pdfOpts);
        } else {
            generateQuotePdf(pdfOpts);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header y Estadísticas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col justify-center">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-400" />
                        Configuración de Cuenta
                    </h1>
                    <p className="text-slate-400 mt-2">Gestiona tu perfil profesional y revisa tu actividad.</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 shadow-xl shadow-blue-900/40 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <PieChart className="w-6 h-6 text-blue-200" />
                            <span className="bg-blue-400/30 text-blue-100 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Global</span>
                        </div>
                        <p className="text-blue-100 text-sm font-bold opacity-80 uppercase tracking-widest">Documentos Generados</p>
                        <h2 className="text-5xl font-black text-white mt-1 group-hover:scale-110 transition-transform origin-left">{history.length}</h2>
                    </div>
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
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

                {/* Historial y Contraseña */}
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

                    <div className="bg-slate-900/60 border border-slate-700/60 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                <FileText className="w-6 h-6 text-emerald-400" />
                                Historial Consolidado
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-slate-500 uppercase tracking-widest text-[9px] border-b border-slate-800">
                                        <th className="pb-3 text-left">Documento / Fecha</th>
                                        <th className="pb-3 text-left">Tipo / Cliente</th>
                                        <th className="pb-3 text-right">Valor (USD)</th>
                                        <th className="pb-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingHistory ? (
                                        <tr><td colSpan="4" className="py-4 text-center text-slate-500">Cargando actividad...</td></tr>
                                    ) : history.length === 0 ? (
                                        <tr><td colSpan="4" className="py-4 text-center text-slate-500">Aún no has generado documentos</td></tr>
                                    ) : history.slice(0, 10).map(row => {
                                        const d = row.data || {};
                                        const isConf = !!d.serviceConfirmed;
                                        const val = d.salePrice || d.totalCharged || d.totalPrice || 0;
                                        return (
                                            <tr key={row.folio} className="border-b border-slate-800/50 hover:bg-slate-800/30 group transition-colors">
                                                <td className="py-3">
                                                    <p className="font-mono text-blue-400 font-bold">{row.folio}</p>
                                                    <p className="text-[10px] text-slate-500 mt-1">
                                                        {new Date(row.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </p>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase mb-1 ${isConf ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        {isConf ? 'Confirmación' : 'Cotización'}
                                                    </span>
                                                    <p className="text-slate-300 font-medium truncate max-w-[150px]">{d.clientName || 'Sin Cliente'}</p>
                                                    <p className="text-[10px] text-slate-600 truncate">{d.destination || 'Sin Destino'}</p>
                                                </td>
                                                <td className="py-3 text-right font-bold text-slate-200">
                                                    ${parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button
                                                            onClick={() => handleViewDetail(row)}
                                                            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all"
                                                            title="Ver Detalle"
                                                        >
                                                            <Search className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(row)}
                                                            className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                                                            title="Re-descargar PDF"
                                                        >
                                                            <FileDown className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuotesPage;
