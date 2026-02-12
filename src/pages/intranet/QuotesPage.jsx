import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from './AdminPanel';
import TeamMonitor from './TeamMonitor';
import { 
    Plane, Settings, ArrowLeft, Plus, CheckCircle, CreditCard, 
    ClipboardList, Briefcase, Search, Upload, AlertCircle, ChevronDown, ChevronRight,
    Globe, Map, Ship, Car, HeartPulse, UserPlus, Users2, FileSpreadsheet, Receipt,
    ShieldCheck, Users, DollarSign, FileCheck, FileText, LayoutDashboard,
    Calendar, Anchor, MapPin, Utensils, Wine, Music, AlertTriangle, Check,
    Trash2, Save, FileDown, Lock, Menu, X
} from 'lucide-react';
import { ERP } from '../../services/mockERP';

const QuotesPage = () => {
    // --- ESTADO PRINCIPAL DE NAVEGACIÓN ---
    const [activeMainTab, setActiveMainTab] = useState('cotizaciones'); 
    const [activeSubTab, setActiveSubTab] = useState(null);
    const [userRole, setUserRole] = useState('admin'); // 'advisor' | 'admin'
    const [isEditing, setIsEditing] = useState(false); // Para permitir edición correctiva a admins
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // --- ESTADO ADMINISTRATIVO GLOBAL (MAESTRO) ---
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

    // Mock Quotes Data para Supervisión
    const [mockQuotes, setMockQuotes] = useState([
        { 
            id: 'COT-2026-001', date: '2026-02-11', advisor: 'Paola P.', client: 'Familia González', status: 'En Proceso', step: 2,
            missing: ['Vuelos', 'Hotel'],
            history: [
                { type: 'creation', action: 'CREACIÓN', timestamp: '2026-02-11 09:00 AM', user: 'Paola P.', details: 'Inicio de cotización vacacional' },
                { type: 'update', action: 'PASO 1 COMPLETO', timestamp: '2026-02-11 09:15 AM', user: 'Paola P.', details: 'Datos del cliente registrados', changes: [{ field: 'Destino', old: '-', new: 'Cancún' }] }
            ]
        },
        { 
            id: 'COT-2026-002', date: '2026-02-10', advisor: 'Carlos R.', client: 'Tech Solutions SAS', status: 'Completado', step: 4,
            missing: [],
            history: [
                { type: 'creation', action: 'CREACIÓN', timestamp: '2026-02-10 14:00 PM', user: 'Carlos R.', details: 'Cotización corporativa' },
                { type: 'update', action: 'FINALIZADO', timestamp: '2026-02-10 16:30 PM', user: 'Carlos R.', details: 'Cotización lista para envío' }
            ]
        },
        { 
            id: 'COT-2026-003', date: '2026-02-11', advisor: 'Ana M.', client: 'Juan Pérez', status: 'Incompleto', step: 1,
            missing: ['Fecha Regreso', 'Presupuesto'],
            history: [
                { type: 'creation', action: 'CREACIÓN', timestamp: '2026-02-11 11:00 AM', user: 'Ana M.', details: 'Cotización rápida' }
            ]
        }
    ]);

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
    
    const handleCorrectiveEdit = (quote) => {
        // Simular carga de cotización para edición
        alert(`Iniciando Edición Correctiva para ${quote.id}. (Simulación: Carga de datos en formulario)`);
        setIsEditing(true); // Habilitar modo edición
        setActiveMainTab('cotizaciones');
        setActiveSubTab('vacacional'); // O el tipo que corresponda
        // Aquí se cargarían los datos reales en el form
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
        { id: 'grupos', label: 'Grupos', icon: Users2 },
        // Nueva opción Corporativa
        { id: 'corporativo', label: 'Corporativo', icon: Briefcase },
    ];

    const mainTabs = [
        { id: 'confirmation', label: 'Confirmación', icon: CheckCircle, desc: 'Aceptación y Pasajeros' },
        { id: 'payments', label: 'Pagos', icon: CreditCard, desc: 'Recibos y Soportes' },
        { id: 'billing', label: 'Facturación', icon: Receipt, desc: 'Liquidación Operadores' },
        { id: 'voucher', label: 'Voucher', icon: FileSpreadsheet, desc: 'Generación Excel' },
        { id: 'reconfirm', label: 'Re-confirmación', icon: ClipboardList, desc: 'Checklist y Novedades' },
        // { id: 'admin', label: 'Administración', icon: Settings, desc: 'Metas y Perfil' }, // Movido a control especial
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
        currency: 'COP', 
        exchangeRate: ERP.getTRM(),
        usdPrice: 0,
        taxes: 0,
        netCost: 0,
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
        if (formData.currency === 'USD') {
            const trm = parseFloat(formData.exchangeRate) || 1;
            const usd = parseFloat(formData.usdPrice) || 0;
            const taxes = parseFloat(formData.taxes) || 0;
            net = (usd + taxes) * trm;
        }
        const margin = parseFloat(formData.marginPercent) || 0;
        const sale = net / (1 - (margin / 100));
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
    }, [formData.netCost, formData.marginPercent, formData.payments.downPayment, formData.currency, formData.usdPrice, formData.taxes, formData.exchangeRate]);

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
    
    const SupervisionLockScreen = () => (
        <div className="bg-[#1e293b] border border-red-500/30 rounded-3xl p-12 text-center animate-fade-in relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                <div className="w-20 h-20 rounded-full bg-red-900/30 flex items-center justify-center mb-6 border border-red-500/50">
                    <Lock className="w-10 h-10 text-red-400" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase mb-3">Modo Supervisión Activo</h2>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Su perfil de <strong>Administrador/Gerencia</strong> tiene restringida la creación de nuevas cotizaciones operativas. 
                    Esta medida garantiza la separación de funciones y el control de calidad.
                </p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveMainTab('admin')}
                        className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-purple-900/20"
                    >
                        <ShieldCheck className="w-4 h-4" /> Ir al Panel Maestro
                    </button>
                </div>
                <p className="mt-8 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    Si necesita cotizar, cambie a perfil Asesor
                </p>
            </div>
        </div>
    );

    const ConfirmationView = () => (
        <div className="animate-fade-in p-4 md:p-8 min-h-screen flex justify-center items-start pt-10">
            <div className="bg-white/95 backdrop-blur-2xl text-slate-900 shadow-2xl w-full max-w-5xl overflow-hidden text-xs md:text-sm font-sans border border-white/40 rounded-3xl relative z-10">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none">
                    <CheckCircle className="w-[500px] h-[500px] text-slate-900" />
                </div>

                {/* 1. Encabezado Premium */}
                <div className="relative z-10 p-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100">
                    <div className="flex flex-col items-center md:items-start">
                        <img src="/logo-destinos.png" alt="Destinos P&P" className="h-16 w-auto mb-2 object-contain hover:scale-105 transition-transform duration-500" />
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Agencia de Viajes Certificada
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter mb-1 font-serif">Confirmación</h1>
                        <p className="text-slate-400 font-bold tracking-[0.3em] text-[10px] uppercase">De Servicios Turísticos</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center shadow-sm w-full md:w-auto">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Folio de Servicio</span>
                        <span className="font-mono text-3xl font-black text-blue-600 tracking-tighter">{previewFolio || 'COT-001'}</span>
                        <div className="mt-2 px-3 py-1 bg-emerald-100/50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wide border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Confirmado
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
                        <input type="text" className="w-full bg-transparent outline-none font-black text-xl text-slate-800 uppercase tracking-tight placeholder-slate-300" defaultValue="SAN ANDRÉS ISLAS, COLOMBIA" />
                    </div>

                    <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-bl-full"></div>
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors text-purple-500">
                                <Users className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solicitante</span>
                        </div>
                        <input type="text" className="w-full bg-transparent outline-none font-bold text-slate-700 uppercase mb-1" placeholder="NOMBRE CLIENTE" />
                        <input type="email" className="w-full bg-transparent outline-none text-xs text-slate-400 lowercase font-medium" placeholder="cliente@email.com" />
                    </div>
                </div>

                {/* 3. Detalles del Viaje & Alojamiento */}
                <div className="relative z-10 px-8 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Alojamiento Card */}
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

                        {/* Vuelos Card */}
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

                            <div className="pl-4 space-y-4">
                                {/* Vuelo Ida */}
                                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                        <Plane className="w-4 h-4 text-blue-400 rotate-45" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Ida</span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-3 gap-2 items-center text-center">
                                        <input type="time" className="bg-transparent font-bold text-slate-700 text-lg outline-none w-full text-center" defaultValue="08:00" />
                                        <div className="h-px bg-slate-300 w-full relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-400 rounded-full"></div>
                                        </div>
                                        <input type="time" className="bg-transparent font-bold text-slate-700 text-lg outline-none w-full text-center" defaultValue="10:30" />
                                    </div>
                                </div>
                                {/* Vuelo Regreso */}
                                <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                        <Plane className="w-4 h-4 text-indigo-400 -rotate-135" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Regreso</span>
                                    </div>
                                    <div className="flex-1 grid grid-cols-3 gap-2 items-center text-center">
                                        <input type="time" className="bg-transparent font-bold text-slate-700 text-lg outline-none w-full text-center" defaultValue="15:00" />
                                        <div className="h-px bg-slate-300 w-full relative">
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-400 rounded-full"></div>
                                        </div>
                                        <input type="time" className="bg-transparent font-bold text-slate-700 text-lg outline-none w-full text-center" defaultValue="17:30" />
                                    </div>
                                </div>
                                <input type="text" className="w-full bg-slate-50 rounded-lg p-2 text-center text-xs font-bold text-slate-600 outline-none uppercase tracking-wide" placeholder="AEROLÍNEA: LATAM AIRLINES" />
                            </div>
                        </div>
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
                            <button className="px-6 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                                <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Descargar PDF
                            </button>
                            <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-xs hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 shadow-md">
                                <CheckCircle className="w-4 h-4" /> Aceptar Confirmación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const PaymentsView = () => {
        const [paymentType, setPaymentType] = useState('transfer');
        return (
            <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CreditCard className="text-blue-500" /> Gestión de Pagos y Soportes
                </h2>
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {['Transferencia', 'Tarjeta Crédito', 'PSE'].map(type => (
                            <button 
                                key={type}
                                onClick={() => setPaymentType(type)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                                    paymentType === type ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-300 mb-2">Soportes de Pago</h4>
                            <div className="p-8 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors cursor-pointer bg-slate-900/50">
                                <Upload className="w-10 h-10 mb-2" />
                                <span className="text-sm font-medium">Cargar Soporte (PDF/IMG)</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-yellow-400 text-sm">Alerta Contable</h4>
                                    <p className="text-xs text-yellow-200/80 mt-1">
                                        El soporte cargado será enviado automáticamente a contabilidad para la generación del Recibo de Caja.
                                    </p>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20">
                                Registrar Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const BillingView = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center border-b border-slate-700/50 pb-4 mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Receipt className="text-purple-500" /> Datos de Liquidación
                </h2>
                <img src="/logos/logo-destinos.png" alt="Destinos P&P" className="h-12 w-auto" />
            </div>
            <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 max-w-4xl">
                <p className="text-sm text-slate-400 mb-6 bg-slate-900 p-3 rounded-lg border border-slate-700/50">
                    <span className="font-bold text-purple-400">Nota:</span> Ingrese los valores base. La liquidación final es calculada por el sistema.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {['Valor Pagado al Operador', 'Tarifa Neta / Condicionable', 'Tarifa Administrativa', 'FEE de Servicio + IVA'].map((label, i) => (
                        <div key={i}>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{label}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-slate-500">$</span>
                                <input type="number" className="w-full bg-slate-900 border border-slate-700 pl-8 p-3 rounded-xl text-white outline-none focus:border-purple-500" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const VoucherView = () => (
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
                        <img src="/logo-destinos.png" alt="Destinos P&P" className="h-16 w-auto mb-2 object-contain hover:scale-105 transition-transform duration-500" />
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase tracking-widest font-bold">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Documento de Viaje
                        </div>
                    </div>
                    
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-slate-800 uppercase tracking-tighter mb-1 font-serif">Voucher</h1>
                        <p className="text-slate-400 font-bold tracking-[0.3em] text-[10px] uppercase">Orden de Servicios</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center shadow-sm w-full md:w-auto">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Folio No.</span>
                        <span className="font-mono text-3xl font-black text-blue-600 tracking-tighter">{previewFolio || '15289'}</span>
                        <div className="mt-2 px-3 py-1 bg-emerald-100/50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wide border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Totalmente Pago
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
                        <input type="date" className="bg-transparent outline-none font-bold text-slate-700 text-lg w-full" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-500">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destino Principal</span>
                        </div>
                        <input type="text" className="w-full bg-transparent outline-none font-black text-xl text-slate-800 uppercase tracking-tight placeholder-slate-300" defaultValue="SAN ANDRÉS ISLAS, COLOMBIA" />
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
                        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-2 shadow-md">
                            <FileSpreadsheet className="w-4 h-4" /> Descargar Voucher PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

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
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0">
                         <img 
                            src={`https://source.unsplash.com/random/600x400?travel,${option.label === 'Nacional' ? 'colombia' : option.id}&sig=${option.id}`} 
                            alt={option.label}
                            className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                    </div>

                    {/* Logo Watermark */}
                    <div className="absolute top-4 right-4 opacity-50 group-hover:opacity-100 transition-opacity transform group-hover:scale-110 duration-500">
                         <img src="/logo-destinos.png" alt="Logo" className="h-8 w-auto grayscale group-hover:grayscale-0 transition-all" />
                    </div>

                    {/* Content */}
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

    const FlightQuoteForm = () => {
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
                            <div className="bg-emerald-600/20 border border-emerald-500/30 px-4 py-2 rounded-lg inline-block animate-pulse">
                                <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider block">TRM Hoy</span>
                                <span className="text-xl font-bold text-white">$ {ERP.getTRM().toLocaleString()} COP</span>
                            </div>
                        </div>

                         <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3 relative">
                            {/* Logo in header form */}
                            <img src="/logo-destinos.png" alt="Destinos P&P" className="absolute top-4 right-4 h-8 w-auto opacity-50" />
                            
                             <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Ruta Aérea</label>
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold text-lg" placeholder="BOG - MAD - BOG" />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Pasajeros</label>
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" placeholder="1 Adulto" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Clase</label>
                                    <select className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
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

                 {/* ITINERARIO AÉREO DETALLADO */}
                <section>
                    <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Plane className="w-4 h-4" /> Itinerario Aéreo Detallado
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-slate-700/50">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-800 text-slate-300">
                                <tr>
                                    <th className="p-3">Aerolínea</th>
                                    <th className="p-3">Vuelo</th>
                                    <th className="p-3">Salida</th>
                                    <th className="p-3">Llegada</th>
                                    <th className="p-3">Duración</th>
                                    <th className="p-3">Avión</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50 bg-slate-900/30">
                                {[1, 2].map(i => (
                                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden p-1">
                                                    <img src={i === 1 ? "https://logo.clearbit.com/iberia.com" : "https://logo.clearbit.com/avianca.com"} alt="Airline" className="w-full h-full object-contain" onError={(e) => e.target.style.display='none'} />
                                                </div>
                                                <input placeholder="IBERIA" className="bg-transparent text-white outline-none w-24 font-bold uppercase" />
                                            </div>
                                        </td>
                                        <td className="p-3"><input placeholder="IB6588" className="bg-transparent text-slate-300 outline-none w-full font-mono" /></td>
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <input placeholder="BOG - 18:00" className="bg-transparent text-white font-bold outline-none w-full" />
                                                <input type="date" className="bg-transparent text-xs text-slate-400 outline-none w-full" />
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <input placeholder="MAD - 10:30" className="bg-transparent text-white font-bold outline-none w-full" />
                                                <input type="date" className="bg-transparent text-xs text-slate-400 outline-none w-full" />
                                            </div>
                                        </td>
                                        <td className="p-3"><input placeholder="9h 30m" className="bg-transparent text-slate-300 outline-none w-full" /></td>
                                        <td className="p-3"><input placeholder="A350-900" className="bg-transparent text-slate-300 outline-none w-full" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-colors border-t border-slate-700/50 uppercase tracking-widest">
                            + Agregar Trayecto
                        </button>
                    </div>
                </section>

                {/* TARIFAS Y EQUIPAJE (Cards Style) */}
                <section>
                    <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Gestión de Tarifas y Equipaje
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 space-y-4 hover:border-blue-500/30 transition-colors">
                            <h4 className="text-white font-bold text-sm uppercase border-b border-slate-700 pb-2">Equipaje Incluido</h4>
                            <div className="space-y-3">
                                {['Artículo Personal (Mochila)', 'Equipaje de Mano (10kg)', 'Equipaje de Bodega (23kg)'].map((item, i) => (
                                    <label key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-700">
                                        <input type="checkbox" className="w-4 h-4 accent-blue-500 rounded" defaultChecked={i < 2} />
                                        <span className="text-slate-300 text-sm">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 space-y-4 hover:border-emerald-500/30 transition-colors">
                            <h4 className="text-white font-bold text-sm uppercase border-b border-slate-700 pb-2">Valor por Persona</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1 uppercase font-bold">Tarifa en Dólares (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-emerald-500 font-bold">USD</span>
                                        <input className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-12 pr-3 py-3 text-white font-bold outline-none focus:border-emerald-500 text-lg" placeholder="860.00" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1 uppercase font-bold">Equivalente en Pesos (COP)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-500">$</span>
                                        <input className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-3 text-slate-300 outline-none" value="3.569.000" readOnly />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* OBSERVACIONES Y PENALIDADES */}
                <section className="bg-red-900/10 border border-red-500/30 p-6 rounded-xl">
                    <h3 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Observaciones Importantes
                    </h3>
                    <p className="text-red-200/80 text-sm mb-4">
                        Aplica penalidad por cambios y cancelaciones. Los reembolsos solo aplican si las condiciones de la tarifa lo permiten y estarán sujetos a gastos administrativos.
                    </p>
                    <textarea 
                        className="w-full bg-red-900/20 border border-red-500/20 rounded-lg p-3 text-red-100 placeholder-red-300/50 outline-none text-sm resize-none h-20"
                        placeholder="Escribe aquí cualquier restricción adicional específica de la tarifa..."
                    ></textarea>
                </section>

                {/* CONDICIONES GENERALES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <section className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                        <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4">Condiciones Generales</h3>
                        <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4">
                            <li className="text-emerald-400 font-bold">Pago en pesos colombianos a la TRM del día</li>
                            <li>Tarifas sujetas a cambio sin previo aviso</li>
                            <li>Impuestos de salida no incluidos si aplica</li>
                        </ul>
                    </section>
                    <section className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30">
                         <h3 className="text-blue-400 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Documentos Requeridos
                        </h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Cédula de ciudadanía en original
                            </li>
                             <li className="flex items-center gap-2 text-sm text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                Pasaporte (Solo vuelos internacionales)
                            </li>
                        </ul>
                    </section>
                </div>

                 {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
                    <button className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold transition-all">
                        Guardar Borrador
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 font-bold shadow-lg shadow-blue-900/20 transition-all">
                        Generar PDF
                    </button>
                </div>
            </div>
        );
    };

    const CruiseQuoteForm = () => {
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
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-bold" placeholder="Crucero por el Caribe" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Pasajeros</label>
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" placeholder="2 adultos" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Plan (Naviera)</label>
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" placeholder="Costa Cruises (Fascinosa)" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 font-bold uppercase block mb-1">Acomodación</label>
                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" placeholder="1 Cabina Doble" />
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
                                {[
                                    { day: 1, date: '02-07 dom', port: 'CASA DE CAMPO/LA ROMANA', arr: '-', dep: '11:59 p.m.' },
                                    { day: 2, date: '02-08 lun', port: 'ISLA CATALINA', arr: '08:00 a.m.', dep: '06:00 p.m.' },
                                    { day: 3, date: '02-09 mar', port: 'CABO ROJO', arr: '09:00 a.m.', dep: '06:00 p.m.' },
                                    { day: 4, date: '02-10 mié', port: 'NAVEGANDO ENTRE EL CIELO Y EL MAR', arr: '-', dep: '-' },
                                    { day: 5, date: '02-11 jue', port: 'GRAND TURKS', arr: '08:00 a.m.', dep: '05:30 p.m.' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="p-3 font-mono text-slate-400">{row.day}</td>
                                        <td className="p-3 text-slate-300">{row.date}</td>
                                        <td className="p-3 font-bold text-cyan-300 flex items-center gap-2">
                                            <Map className="w-3 h-3" /> {row.port}
                                        </td>
                                        <td className="p-3 text-right text-slate-400">{row.arr}</td>
                                        <td className="p-3 text-right text-slate-400">{row.dep}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* COMPARATIVA DE CABINAS */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: 'CABINA INTERIOR', price: '1.942 USD', img: 'https://images.unsplash.com/photo-1555243896-c709bfa0b564?auto=format&fit=crop&w=800&q=80' },
                        { title: 'CABINA EXTERIOR', price: '2.189 USD', img: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80' }
                    ].map((cabin, idx) => (
                        <div key={idx} className="bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-700/50 group hover:border-cyan-500/50 transition-all">
                            <div className="h-48 overflow-hidden relative">
                                <img src={cabin.img} alt={cabin.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 right-4 bg-slate-900/90 text-white px-3 py-1 rounded-full text-xs font-bold border border-slate-700">
                                    Acomodación Doble
                                </div>
                            </div>
                            <div className="p-6 text-center space-y-4">
                                <h3 className="text-cyan-400 font-bold text-lg uppercase tracking-widest">{cabin.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Las imágenes y características de los camarotes son solo muestras. Muebles y colores pueden variar.
                                </p>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                                    <p className="text-xs text-slate-500 uppercase mb-1">Tarifa Total por 2 Personas</p>
                                    <p className="text-2xl font-bold text-white border-b-2 border-cyan-500 inline-block pb-1">{cabin.price}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

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
                <section className="space-y-6 pt-6 border-t border-slate-700/50">
                    <p className="text-red-400 font-bold text-center uppercase text-sm animate-pulse">
                        Nota: Disponibilidad y tarifas sujetas a cambio sin previo aviso
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-300 uppercase text-xs">Condiciones Generales</h4>
                            <ul className="space-y-2 text-slate-400 list-disc pl-4">
                                <li>Pago en pesos colombianos a la TRM del día</li>
                                <li>Formas de pago: Transferencia, PSE, Tarjeta Crédito (+3%)</li>
                                <li>En caso de anulación, se generan gastos del 100%</li>
                                <li>Servicios no tomados no son reembolsables</li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-300 uppercase text-xs">Documentos de Viaje</h4>
                             <ul className="space-y-2 text-slate-400">
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Pasaporte vigente
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Vacuna contra la Fiebre Amarilla
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span> Cédula de ciudadanía
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                 {/* ACTIONS */}
                 <div className="flex justify-end gap-4 pt-4 border-t border-slate-700/50">
                    <button className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 font-bold transition-all">
                        Guardar Borrador
                    </button>
                    <button className="px-6 py-3 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 font-bold shadow-lg shadow-cyan-900/20 transition-all">
                        Generar PDF Crucero
                    </button>
                </div>
            </div>
        );
    };

    const SmartQuoteForm = ({ config }) => {
        const [currentStep, setCurrentStep] = useState(1);
        const [quoteType, setQuoteType] = useState(activeSubTab === 'corporativo' ? 'corporativo' : 'vacacional');
        
        // Sincronizar reglas administrativas
        useEffect(() => {
            if (config?.commissions) {
                // Aquí se podría forzar la comisión mínima, etc.
            }
        }, [config]);

        useEffect(() => {
             setQuoteType(activeSubTab === 'corporativo' ? 'corporativo' : 'vacacional');
        }, [activeSubTab]);
        
        // Datos del Formulario
        const [clientData, setClientData] = useState({
            // Vacacional
            name: '', id: '', phone: '', email: '',
            // Corporativo
            company: '', nit: '', costCenter: '', employeeCode: '',
            // General
            destination: '', dateStart: '', dateEnd: '',
            adults: 1, children: 0
        });

        const [flights, setFlights] = useState([
            { id: 1, airline: '', flight: '', route: '', time: '', class: '', bag: '' }
        ]);

        const [hotels, setHotels] = useState([
            { id: 1, name: '', room: '', mealPlan: '', pricePerPax: 0, total: 0 }
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

        // Auto-calc totals for hotels
        useEffect(() => {
            const totalPax = parseInt(clientData.adults || 0) + parseInt(clientData.children || 0);
            const newHotels = hotels.map(h => ({
                ...h,
                total: h.pricePerPax * totalPax
            }));
            if (JSON.stringify(newHotels) !== JSON.stringify(hotels)) {
                setHotels(newHotels);
            }
        }, [clientData.adults, clientData.children, hotels]);

        // Handlers
        const addFlight = () => setFlights([...flights, { id: Date.now(), airline: '', flight: '', route: '', time: '', class: '', bag: '' }]);
        const removeFlight = (id) => setFlights(flights.filter(f => f.id !== id));
        const handleFlightChange = (id, field, value) => setFlights(flights.map(f => f.id === id ? { ...f, [field]: value } : f));

        const addHotel = () => setHotels([...hotels, { id: Date.now(), name: '', room: '', mealPlan: '', pricePerPax: 0, total: 0 }]);
        const removeHotel = (id) => setHotels(hotels.filter(h => h.id !== id));
        const handleHotelChange = (id, field, value) => setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));

        const handleConvertToConfirmation = () => {
            // Logica para pasar datos a confirmación
            // En un caso real, esto actualizaría el estado global o el contexto
            setFormData(prev => ({
                ...prev,
                clientName: quoteType === 'vacacional' ? clientData.name : clientData.company,
                destination: clientData.destination,
                // ... map other fields
            }));
            setActiveMainTab('confirmation');
        };

        // Stepper Colors & Glow
        const getStepColor = (step) => {
            switch(step) {
                case 1: return 'blue';
                case 2: return 'yellow'; // Gold
                case 3: return 'emerald'; // Green
                case 4: return 'cyan';
                default: return 'slate';
            }
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
                        <div key={s.num} className="relative z-10 flex flex-col items-center cursor-pointer" onClick={() => setCurrentStep(s.num)}>
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 ${activeClass} ${isActive ? 'shadow-lg scale-110' : ''}`}>
                                {isCompleted ? <Check className="w-5 h-5" /> : s.num}
                            </div>
                            <span className={`text-[10px] uppercase font-bold mt-2 tracking-wider ${isActive || isCompleted ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
                        </div>
                    );
                })}
            </div>
        );

        return (
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 max-w-6xl mx-auto min-h-[600px] flex flex-col animate-fade-in relative overflow-hidden shadow-2xl">
                {/* Decorative Background based on step */}
                <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] pointer-events-none transition-colors duration-700 ${
                    currentStep === 1 ? 'bg-blue-500/10' : 
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
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">{quoteType === 'vacacional' ? 'Información del Viaje' : 'Corporativo'}</h2>
                                <p className="text-slate-400 text-sm">Ingrese los datos principales para iniciar la cotización.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Columna Izquierda: Datos Cliente/Empresa */}
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                                    <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                                        Datos del {quoteType === 'vacacional' ? 'Titular' : 'Solicitante'}
                                    </h3>
                                    
                                    {quoteType === 'vacacional' ? (
                                        <>
                                            <div className="group">
                                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nombre Completo</label>
                                                <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                    value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Identificación</label>
                                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                        value={clientData.id} onChange={e => setClientData({...clientData, id: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Celular / Email</label>
                                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                        value={clientData.phone} onChange={e => setClientData({...clientData, phone: e.target.value})} />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                             <div className="group">
                                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Razón Social / Empresa</label>
                                                <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                    value={clientData.company} onChange={e => setClientData({...clientData, company: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">NIT</label>
                                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                        value={clientData.nit} onChange={e => setClientData({...clientData, nit: e.target.value})} />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Centro de Costos</label>
                                                    <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                        value={clientData.costCenter} onChange={e => setClientData({...clientData, costCenter: e.target.value})} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Código Empleado / Solicitante</label>
                                                <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                    value={clientData.employeeCode} onChange={e => setClientData({...clientData, employeeCode: e.target.value})} />
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Columna Derecha: Datos Ruta */}
                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                                    <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                                        Detalles del Destino
                                    </h3>
                                    <div>
                                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Destino Principal</label>
                                        <input className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white font-bold text-lg focus:border-blue-500 transition-colors outline-none uppercase" 
                                            placeholder="EJ. MIAMI, FL"
                                            value={clientData.destination} onChange={e => setClientData({...clientData, destination: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Salida</label>
                                            <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                value={clientData.dateStart} onChange={e => setClientData({...clientData, dateStart: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Regreso</label>
                                            <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                value={clientData.dateEnd} onChange={e => setClientData({...clientData, dateEnd: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Adultos</label>
                                            <div className="relative">
                                                <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                                <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                    value={clientData.adults} onChange={e => setClientData({...clientData, adults: e.target.value})} />
                                            </div>
                                        </div>
                                        {quoteType === 'vacacional' && (
                                            <div>
                                                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Niños</label>
                                                <div className="relative">
                                                    <Users2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                                    <input type="number" className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 p-3 text-white focus:border-blue-500 transition-colors outline-none" 
                                                        value={clientData.children} onChange={e => setClientData({...clientData, children: e.target.value})} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PASO 2: ITINERARIO Y ALOJAMIENTO */}
                    {currentStep === 2 && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Vuelos */}
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
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="text-xs text-slate-400 uppercase border-b border-slate-700/50">
                                                <th className="pb-3 pl-4">Aerolínea</th>
                                                <th className="pb-3">Vuelo</th>
                                                <th className="pb-3">Ruta</th>
                                                <th className="pb-3">Hora</th>
                                                <th className="pb-3">Clase</th>
                                                <th className="pb-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/30">
                                            {flights.map((flight) => (
                                                <tr key={flight.id} className="group/row hover:bg-slate-700/20 transition-colors">
                                                    <td className="py-2 pl-4"><input className="bg-transparent text-white font-bold w-full outline-none uppercase text-sm" placeholder="AVIANCA" value={flight.airline} onChange={e => handleFlightChange(flight.id, 'airline', e.target.value)} /></td>
                                                    <td className="py-2"><input className="bg-transparent text-slate-300 w-full outline-none font-mono text-xs" placeholder="AV8532" value={flight.flight} onChange={e => handleFlightChange(flight.id, 'flight', e.target.value)} /></td>
                                                    <td className="py-2"><input className="bg-transparent text-white font-bold w-full outline-none uppercase text-sm" placeholder="BOG-MDE" value={flight.route} onChange={e => handleFlightChange(flight.id, 'route', e.target.value)} /></td>
                                                    <td className="py-2"><input type="time" className="bg-transparent text-slate-300 w-full outline-none text-xs" value={flight.time} onChange={e => handleFlightChange(flight.id, 'time', e.target.value)} /></td>
                                                    <td className="py-2">
                                                        <select className="bg-slate-900 border border-slate-700 rounded text-xs text-slate-300 p-1" value={flight.class} onChange={e => handleFlightChange(flight.id, 'class', e.target.value)}>
                                                            <option value="">Sel</option>
                                                            <option value="eco">Econ</option>
                                                            <option value="exe">Exec</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-2 text-right"><button onClick={() => removeFlight(flight.id)} className="text-slate-600 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>

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
                                        <div key={hotel.id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-wrap gap-4 items-center">
                                            <div className="flex-1 min-w-[200px]">
                                                <input className="w-full bg-transparent text-white font-bold text-lg outline-none uppercase placeholder-slate-600" placeholder="NOMBRE HOTEL" value={hotel.name} onChange={e => handleHotelChange(hotel.id, 'name', e.target.value)} />
                                            </div>
                                            <div className="w-32">
                                                 <input className="w-full bg-transparent text-slate-300 text-sm outline-none uppercase placeholder-slate-600" placeholder="Habitación" value={hotel.room} onChange={e => handleHotelChange(hotel.id, 'room', e.target.value)} />
                                            </div>
                                            <div className="w-32">
                                                <input type="number" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-right text-yellow-400 font-mono font-bold outline-none" placeholder="$ Pax" value={hotel.pricePerPax} onChange={e => handleHotelChange(hotel.id, 'pricePerPax', e.target.value)} />
                                            </div>
                                            <div className="w-32 text-right font-mono font-bold text-white">
                                                $ {parseInt(hotel.total).toLocaleString()}
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
                                                checked={corporateOptions.flexibleFare} onChange={e => setCorporateOptions({...corporateOptions, flexibleFare: e.target.checked})} />
                                            <span className="text-slate-300 text-sm">Tarifa Flexible (Cambios permitidos)</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" className="w-5 h-5 accent-yellow-500 rounded bg-slate-900 border-slate-700" 
                                                checked={corporateOptions.corporateAgreement} onChange={e => setCorporateOptions({...corporateOptions, corporateAgreement: e.target.checked})} />
                                            <span className="text-slate-300 text-sm">Aplicar Convenio Corporativo</span>
                                        </label>
                                    </div>
                                    {corporateOptions.corporateAgreement && (
                                        <div className="mt-4 animate-fade-in">
                                            <input className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-white w-full md:w-64 outline-none" placeholder="Código de Convenio" 
                                                value={corporateOptions.agreementCode} onChange={e => setCorporateOptions({...corporateOptions, agreementCode: e.target.value})} />
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
                                        <CheckCircle className="w-5 h-5" /> Incluye
                                    </h3>
                                    <textarea className="w-full bg-transparent text-emerald-100/80 text-sm leading-relaxed outline-none resize-none h-40 placeholder-emerald-500/30"
                                        placeholder="Ingrese los servicios incluidos..." value={extras.includes} onChange={e => setExtras({...extras, includes: e.target.value})}></textarea>
                                </div>
                                <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl">
                                    <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5" /> No Incluye
                                    </h3>
                                    <textarea className="w-full bg-transparent text-red-100/80 text-sm leading-relaxed outline-none resize-none h-40 placeholder-red-500/30"
                                        placeholder="Ingrese los servicios no incluidos..." value={extras.excludes} onChange={e => setExtras({...extras, excludes: e.target.value})}></textarea>
                                </div>
                            </div>
                            
                            <div className="bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
                                <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-4">Notas Legales y Condiciones</h3>
                                <textarea className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-300 text-sm h-32 outline-none"
                                    placeholder="Cláusulas específicas..." value={extras.notes} onChange={e => setExtras({...extras, notes: e.target.value})}></textarea>
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
                                <button className="group relative overflow-hidden rounded-2xl bg-slate-800 p-6 border border-slate-700 hover:border-cyan-500 transition-all w-full text-left">
                                    <div className="relative z-10 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                                            <FileDown className="w-6 h-6 text-slate-400 group-hover:text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-bold text-lg">Descargar PDF</h4>
                                            <p className="text-slate-500 text-xs">Generar documento oficial</p>
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
                         <button 
                            onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                        >
                            Siguiente Paso <ChevronRight className="w-4 h-4" />
                        </button>
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
                            <span className="text-xs font-mono text-slate-500">COT-2026-00{i*3}</span>
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
                        quotes={mockQuotes}
                        onEditQuote={handleCorrectiveEdit}
                        onExit={() => {
                            setActiveMainTab('cotizaciones');
                            // Opcional: Si 'Salir' implica volver a ver como Asesor, 
                            // tal vez no cambiamos el rol pero sí la vista.
                        }}
                    />
                </div>
            ) : (
                <>
                    {/* Mobile Overlay */}
                    {userRole !== 'admin' && isSidebarOpen && (
                        <div 
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* SIDEBAR (260px fixed width) */}
                    {userRole !== 'admin' && (
                    <aside className={`fixed md:relative top-0 left-0 z-40 w-[260px] h-screen bg-[#1e293b]/95 backdrop-blur-3xl border-r border-slate-700/50 flex flex-col shrink-0 overflow-hidden transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
        
                        <nav className="flex-1 p-4 space-y-2">
                            {/* MENÚ COTIZACIONES */}
                            {userRole !== 'admin' && (
                                <div className="space-y-1">
                                    <button 
                                        onClick={() => {
                                            setIsQuotesOpen(!isQuotesOpen);
                                            setActiveMainTab('cotizaciones');
                                            setActiveSubTab(null);
                                            setIsEditing(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                            activeMainTab === 'cotizaciones' ? 'bg-blue-600/20 text-blue-400 font-bold shadow-sm shadow-blue-900/10' : 'hover:bg-slate-800 text-slate-400'
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
                                                {quoteOptions.map(type => (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => {
                                                            setActiveMainTab('cotizaciones');
                                                            setActiveSubTab(type.id);
                                                            setIsEditing(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm transition-all ${
                                                            activeMainTab === 'cotizaciones' && activeSubTab === type.id 
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
                            )}
        
                            {/* RESTO DE PESTAÑAS (Filtradas por Rol) */}
                            {userRole !== 'admin' && mainTabs.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                setActiveMainTab(item.id);
                                setActiveSubTab(null);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
                                activeMainTab === item.id 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold' 
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeMainTab === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                            <div className="text-left">
                                <span className="block font-medium">{item.label}</span>
                                <span className={`text-[10px] ${activeMainTab === item.id ? 'text-blue-200' : 'text-slate-600'}`}>{item.desc}</span>
                            </div>
                        </button>
                    ))}


                </nav>


            </aside>
            )}

            {/* MAIN CONTENT (Flex-1 fluid width) */}
            <main className="flex-1 overflow-y-auto bg-[#0f172a] relative">
                <div className="absolute top-0 left-0 w-full h-96 bg-blue-900/10 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10 p-4 md:p-8 min-h-full">
                    {/* Mobile Header */}
                    {userRole !== 'admin' && (
                        <div className="md:hidden flex items-center justify-between mb-6">
                            <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-slate-800 rounded-lg text-white">
                                <Menu className="w-6 h-6" />
                            </button>
                            <img src="/logo-destinos.png" alt="Destinos P&P" className="h-8 w-auto" />
                        </div>
                    )}
                    {/* VISTA COTIZACIONES */}
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
                                            <p className="text-white font-bold">Paola Palacios</p>
                                            <p className="text-xs text-slate-400">Gerencia General</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center border border-purple-400 shadow-lg shadow-purple-500/20">
                                            <ShieldCheck className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="h-10 w-px bg-slate-700 mx-2"></div>
                                        <button 
                                            onClick={() => setUserRole(prev => prev === 'admin' ? 'advisor' : 'admin')}
                                            className="text-[10px] bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:bg-slate-700"
                                        >
                                            Rol: {userRole === 'admin' ? 'ADMIN' : 'ASESOR'}
                                        </button>
                                        <img src="/logo-destinos.png" alt="Destinos P&P" className="h-12 w-auto" />
                                    </div>
                                )}
                            </header>

                            {/* Muestra el formulario de Cotización Inteligente (Vacacional/Corporativo) */}
                            {activeSubTab ? (
                                <div className="lg:col-span-12">
                                    {userRole === 'admin' && !isEditing ? (
                                        <SupervisionLockScreen />
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
                                    {userRole === 'admin' ? (
                                        <SupervisionLockScreen />
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
                </div>
            </main>
        </>
    )}
</div>
    );
};

export default QuotesPage;