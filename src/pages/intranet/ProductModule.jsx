import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Globe, Map, Plane, RefreshCcw, Download, Save,
    TrendingUp, Info, ChevronRight, Database, FileText, ArrowLeft
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { generateProductPdf } from '../../utils/pdf';
import { useAuth } from '../../context/AuthContext';

// --- CONFIGURACIÓN Y CONSTANTES ---
const ACCOMMODATIONS = [
    { id: 'SENCILLA', label: 'SENCILLA', sub: '', isNight: false, bgHeader: 'bg-blue-600/40 text-blue-200' },
    { id: 'SENCILLA_NA', label: 'Noche', sub: 'Adicional', isNight: true, bgHeader: 'bg-blue-600/20 text-blue-200/70' },
    { id: 'DOBLE', label: 'DOBLE', sub: '', isNight: false, bgHeader: 'bg-blue-600/40 text-blue-200' },
    { id: 'DOBLE_NA', label: 'Noche', sub: 'Adicional', isNight: true, bgHeader: 'bg-blue-600/20 text-blue-200/70' },
    { id: 'TRIPLE', label: 'TRIPLE O', sub: 'MULTIPLE', isNight: false, bgHeader: 'bg-blue-600/40 text-blue-200' },
    { id: 'TRIPLE_NA', label: 'Noche', sub: 'Adicional', isNight: true, bgHeader: 'bg-blue-600/20 text-blue-200/70' },
    { id: 'CHD_2_11', label: 'Niños', sub: '2 a 11 años', isNight: false, bgHeader: 'bg-blue-600/40 text-blue-200' },
    { id: 'CHD_2_11_NA', label: 'Noche', sub: 'Adicional', isNight: true, bgHeader: 'bg-blue-600/20 text-blue-200/70' },
    { id: 'INF_0_23', label: 'Niños', sub: '0 a 23meses', isNight: false, bgHeader: 'bg-blue-600/40 text-blue-200' },
    { id: 'INF_0_23_NA', label: 'Noche', sub: 'Adicional', isNight: true, bgHeader: 'bg-blue-600/20 text-blue-200/70' }
];

const TABS = [
    { id: 'NACIONAL', label: 'NACIONAL', icon: Map },
    { id: 'INTERNACIONAL', label: 'INTERNACIONAL', icon: Globe },
    { id: 'NACIONAL SOLO PT', label: 'NACIONAL SOLO PT', icon: Map },
    { id: 'INTERNACIONAL SOLO PT', label: 'INTERNACIONAL SOLO PT', icon: Globe }
];

const INITIAL_ROW = {
    tarifaCobrar: 0,
    tiqueteTop: 0,
    taFeeTop: 0,
    tiqueteNeto: 0,
    tarifaAdminIva: 0,
    feeEmision: 0,
    asistencia: 0,
    alojamiento: 0,
    ivaAlojamiento: 0,
    seguroHotelero: 0,
    traslados: 0,
    receptivos: 0,
    utilidad: 0.8
};

const INITIAL_TAB_DATA = {
    destination: '',
    trm: 4000,
    nights: 1,
    planIncluye: "• Alojamiento\n• Desayuno tipo buffet\n• Impuestos hoteleros\n• Tarjeta de asistencia medica\n\nInformacion Importante: Menores de 0 a 1.99 años gratis (INF).\nMenores entre 2 y 11.99 años (CHD) gratis en alojamiento (máximo 2) compartiendo habitación sus padres, cancelan desayunos y consumos directamente en el hotel.\nA partir de 12 años cumplidos pagan tarifa de adulto.",
    planNoIncluye: "* Gastos y/o servicios no especificados en el plan",
    politicas: "Toda habitación cancelada 24 horas antes de la fecha de llegada, estará sujeta al cargo de una noche. En caso de NO SHOW se cobrará el 100% de la primera noche de alojamiento.",
    vigenciaVenta: "XXXXXXXXXXXXXXXXXXXX",
    vigenciaViaje: "XXXXXXXXXXXXXXXXXXXX",
    rows: ACCOMMODATIONS.reduce((acc, col) => ({
        ...acc,
        [col.id]: { ...INITIAL_ROW }
    }), {})
};

const EditableInput = ({ value, onChange, prefix = '', suffix = '', className = '' }) => (
    <div className={`relative group w-full ${className}`}>
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/30 text-[9px] font-bold">{prefix}</span>}
        <input
            type="number"
            value={value === 0 || value === '0' ? '' : value}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-black/20 focus:bg-white/10 border border-white/5 rounded px-5 py-1.5 text-[11px] text-center font-mono font-bold text-white outline-none transition-all hover:border-white/20`}
            placeholder="0"
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 text-[9px] font-bold">{suffix}</span>}
    </div>
);

const ProductModule = () => {
    const { user } = useAuth();
    const advisorName = user?.full_name || user?.name || 'Asesora';
    const advisorRole = user?.professional_role || 'Asesora Comercial';

    const [activeTab, setActiveTab] = useState('NACIONAL');
    const [data, setData] = useState({
        'NACIONAL': JSON.parse(JSON.stringify(INITIAL_TAB_DATA)),
        'INTERNACIONAL': JSON.parse(JSON.stringify(INITIAL_TAB_DATA)),
        'NACIONAL SOLO PT': JSON.parse(JSON.stringify(INITIAL_TAB_DATA)),
        'INTERNACIONAL SOLO PT': JSON.parse(JSON.stringify(INITIAL_TAB_DATA))
    });
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // --- LÓGICA DE CÁLCULO EXACTA DE EXCEL ---
    const calculateTotals = (tabId, colId) => {
        const col = data[tabId]?.rows[colId] || { ...INITIAL_ROW };

        // Inputs
        const tarifaCobrar = parseFloat(col.tarifaCobrar) || 0;
        const tiqueteNeto = parseFloat(col.tiqueteNeto) || 0;
        const tarifaAdminIva = parseFloat(col.tarifaAdminIva) || 0;
        const feeEmision = parseFloat(col.feeEmision) || 0;

        const asistencia = parseFloat(col.asistencia) || 0;
        const alojamiento = parseFloat(col.alojamiento) || 0;
        const ivaAlojamiento = parseFloat(col.ivaAlojamiento) || 0;
        const seguroHotelero = parseFloat(col.seguroHotelero) || 0;
        const traslados = parseFloat(col.traslados) || 0;
        const receptivos = parseFloat(col.receptivos) || 0;

        const utilidad = parseFloat(col.utilidad) || 0.8;

        // Math Bottom-Up (Excel)
        const sumCostoPT = asistencia + alojamiento + ivaAlojamiento + seguroHotelero + traslados + receptivos;

        let valorPT = sumCostoPT;
        if (utilidad > 0 && utilidad <= 2) {
            valorPT = sumCostoPT / utilidad;
        }

        const incrementoTC = valorPT * 0.05;
        const precioTotal = valorPT + incrementoTC + tiqueteNeto + tarifaAdminIva + feeEmision;

        const utilidadPT = valorPT - sumCostoPT;
        const utilidadAdicional = tarifaCobrar - precioTotal;

        return {
            sumCostoPT,
            valorPT,
            incrementoTC,
            precioTotal,
            utilidadPT,
            utilidadAdicional
        };
    };

    const handleInputChange = (tabId, colId, field, value) => {
        setData(prev => ({
            ...prev,
            [tabId]: {
                ...prev[tabId],
                rows: {
                    ...prev[tabId].rows,
                    [colId]: {
                        ...prev[tabId].rows[colId],
                        [field]: value
                    }
                }
            }
        }));
    };

    const handleTabFieldChange = (tabId, field, value) => {
        setData(prev => ({
            ...prev,
            [tabId]: { ...prev[tabId], [field]: value }
        }));
    };

    const handleDestinationChange = (tabId, value) => {
        setData(prev => ({
            ...prev,
            [tabId]: { ...prev[tabId], destination: value }
        }));
    };

    const handleTRMChange = (tabId, value) => {
        setData(prev => ({
            ...prev,
            [tabId]: { ...prev[tabId], trm: value }
        }));
    };

    // --- HELPER RENDERS PARA CADA FILA (Row) ---
    const renderInputRow = (label, fieldKey, rowClass, inputClass, labelClass = "") => (
        <tr className={`group transition-colors ${rowClass}`}>
            <td className={`p-2 border-r border-b border-white/5 font-bold text-[10px] uppercase tracking-wider pl-4 whitespace-nowrap ${labelClass}`}>
                {label}
            </td>
            {ACCOMMODATIONS.map(col => (
                <td key={`${col.id}-${fieldKey}`} className="p-1 text-center border-r border-b border-white/5">
                    <EditableInput
                        value={data[activeTab].rows[col.id][fieldKey]}
                        onChange={val => handleInputChange(activeTab, col.id, fieldKey, val)}
                        prefix={fieldKey === 'utilidad' ? '' : '$'}
                        className={inputClass}
                    />
                </td>
            ))}
        </tr>
    );

    const renderCalcRow = (label, resultKey, rowClass, textClass, labelClass = "") => (
        <tr className={`group transition-colors ${rowClass}`}>
            <td className={`p-2 border-r border-b border-white/5 font-bold text-[10px] uppercase tracking-wider pl-4 whitespace-nowrap ${labelClass}`}>
                {label}
            </td>
            {ACCOMMODATIONS.map(col => {
                const totals = calculateTotals(activeTab, col.id);
                const val = totals[resultKey];
                const isNegative = Math.round(val) < 0;
                return (
                    <td key={`${col.id}-${resultKey}`} className="p-2 text-center border-r border-b border-white/5">
                        <span className={`text-xs font-mono font-bold ${isNegative ? 'text-red-500' : textClass}`}>
                            $ {Math.round(val).toLocaleString()}
                        </span>
                    </td>
                );
            })}
        </tr>
    );

    // --- PERSISTENCIA ---
    const saveToSupabase = async () => {
        setLoading(true);
        setSaveStatus('Guardando...');
        try {
            const destination = data[activeTab].destination;
            if (!destination) throw new Error('El nombre del destino es obligatorio');

            const payload = {
                destination_name: destination,
                tab_id: activeTab,
                config_data: data[activeTab],
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('product_costings')
                .upsert(payload, { onConflict: 'destination_name, tab_id' });

            if (error) throw error;
            setSaveStatus('¡Guardado con éxito!');
        } catch (err) {
            console.error(err);
            setSaveStatus(`Error`);
        } finally {
            setLoading(false);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    const loadFromSupabase = async (destination) => {
        if (!destination) return;
        setLoading(true);
        try {
            const { data: result, error } = await supabase
                .from('product_costings')
                .select('*')
                .eq('destination_name', destination)
                .eq('tab_id', activeTab)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            if (result) {
                // Merge to ensure missing fields are populated in old quotes
                const mergedRows = Object.keys(INITIAL_TAB_DATA.rows).reduce((acc, colId) => {
                    acc[colId] = { ...INITIAL_TAB_DATA.rows[colId], ...(result.config_data.rows[colId] || {}) };
                    return acc;
                }, {});

                setData(prev => ({
                    ...prev,
                    [activeTab]: { ...result.config_data, rows: mergedRows }
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPdf = () => {
        // PDF generation might need adjustment for the new state shape later
        generateProductPdf({
            activeTab,
            data,
            advisorName,
            advisorRole
        });
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in text-slate-300">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#0d0d0f]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/5 border-t-white/10 shadow-2xl">
                <div className="flex gap-2 bg-black/40 p-1 rounded-2xl border border-white/5">
                    <Link
                        to="/intranet/dashboard"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden md:block">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-400">
                            <RefreshCcw className="w-4 h-4" />
                        </span>
                        <input
                            value={data[activeTab].trm}
                            onChange={e => handleTRMChange(activeTab, e.target.value)}
                            className="bg-black/60 border border-white/10 pl-10 pr-4 py-2 rounded-xl text-lime-400 font-black text-sm outline-none focus:border-lime-500/40 w-32"
                            placeholder="TRM Global"
                        />
                    </div>
                    <button
                        onClick={saveToSupabase}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-lime-500 text-black rounded-xl font-black text-xs uppercase tracking-widest hover:bg-lime-400 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saveStatus || 'Guardar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-12 xl:col-span-3 flex flex-col gap-6">
                    <div className="bg-[#0d0d0f]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group flex-1">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 blur-3xl rounded-full"></div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                            <Database className="w-5 h-5 text-lime-400" />
                            Operación
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nombre del Paquete</label>
                                <div className="relative">
                                    <input
                                        value={data[activeTab].destination}
                                        onChange={e => handleDestinationChange(activeTab, e.target.value)}
                                        onBlur={() => loadFromSupabase(data[activeTab].destination)}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-lime-500/40 transition-all text-sm"
                                        placeholder="Ej: SAN ANDRÉS"
                                    />
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-[#0d0d0f] to-[#151518] p-5 rounded-3xl border border-white/5">
                                <h3 className="text-xs font-black text-white mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-lime-400" />
                                    Ganancia Consolidada
                                </h3>
                                <div className="space-y-3">
                                    {ACCOMMODATIONS.filter(a => !a.isNight).map(col => {
                                        const { utilidadPT, utilidadAdicional } = calculateTotals(activeTab, col.id);
                                        const ganancia = utilidadPT + utilidadAdicional;
                                        return (
                                            <div key={col.id} className="flex justify-between items-center px-1 border-b border-white/5 pb-2">
                                                <span className="text-[10px] font-bold text-slate-500">{col.label}</span>
                                                <span className="text-xs font-black text-lime-400 font-mono flex items-center gap-2">
                                                    $ {Math.round(ganancia).toLocaleString()}
                                                    {activeTab.includes('INTERNACIONAL') && (
                                                        <span className="text-[8px] text-slate-600 font-bold tracking-tighter bg-white/5 px-2 py-0.5 rounded-full">COP: $ {Math.round(ganancia * (parseFloat(data[activeTab].trm) || 1)).toLocaleString()}</span>
                                                    )}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area (Text Blocks & Calculator Matrix) */}
                <div className="lg:col-span-12 xl:col-span-9 flex flex-col gap-6">

                    {/* Info Blocks (Plan Incluye, No Incluye, etc.) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Info Column */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#0d0d0f]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-lg">
                                <div className="bg-blue-500/10 p-3 border-b border-blue-500/20 text-center">
                                    <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Plan Incluye</h4>
                                </div>
                                <textarea
                                    value={data[activeTab].planIncluye}
                                    onChange={e => handleTabFieldChange(activeTab, 'planIncluye', e.target.value)}
                                    className="w-full h-44 bg-transparent text-xs text-slate-300 p-4 outline-none resize-none focus:bg-white/5 transition-colors font-medium leading-relaxed"
                                    placeholder="Detalles de lo que incluye el plan..."
                                />
                            </div>
                            <div className="bg-[#0d0d0f]/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl overflow-hidden shadow-lg">
                                <div className="bg-blue-500/10 p-3 border-b border-blue-500/20 text-center">
                                    <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Vigencia de Venta</h4>
                                </div>
                                <input
                                    value={data[activeTab].vigenciaVenta}
                                    onChange={e => handleTabFieldChange(activeTab, 'vigenciaVenta', e.target.value)}
                                    className="w-full bg-transparent text-xs text-center text-slate-300 p-3 outline-none focus:bg-white/5 transition-colors font-bold tracking-widest"
                                    placeholder="Ej: HASTA OCTUBRE 2026"
                                />
                            </div>
                        </div>

                        {/* Right Info Column */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-[#0d0d0f]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-lg">
                                <div className="bg-cyan-500/10 p-3 border-b border-cyan-500/20 text-center">
                                    <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">Plan No Incluye</h4>
                                </div>
                                <textarea
                                    value={data[activeTab].planNoIncluye}
                                    onChange={e => handleTabFieldChange(activeTab, 'planNoIncluye', e.target.value)}
                                    className="w-full h-[5.5rem] bg-transparent text-xs text-slate-300 p-4 outline-none resize-none focus:bg-white/5 transition-colors font-medium leading-relaxed"
                                    placeholder="Detalles de lo que NO incluye el plan..."
                                />
                            </div>
                            <div className="bg-[#0d0d0f]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-lg">
                                <div className="bg-cyan-500/10 p-3 border-b border-cyan-500/20 text-center">
                                    <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">Políticas de Cancelación Y/O No Show</h4>
                                </div>
                                <textarea
                                    value={data[activeTab].politicas}
                                    onChange={e => handleTabFieldChange(activeTab, 'politicas', e.target.value)}
                                    className="w-full h-[5.5rem] bg-transparent text-xs text-slate-300 p-4 outline-none resize-none focus:bg-white/5 transition-colors font-medium leading-relaxed"
                                    placeholder="Políticas de cancelación..."
                                />
                            </div>
                            <div className="bg-[#0d0d0f]/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-lg">
                                <div className="bg-cyan-500/10 p-3 border-b border-cyan-500/20 text-center">
                                    <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-widest">Vigencia de Viaje</h4>
                                </div>
                                <input
                                    value={data[activeTab].vigenciaViaje}
                                    onChange={e => handleTabFieldChange(activeTab, 'vigenciaViaje', e.target.value)}
                                    className="w-full bg-transparent text-xs text-center text-slate-300 p-3 outline-none focus:bg-white/5 transition-colors font-bold tracking-widest"
                                    placeholder="Ej: HASTA DICIEMBRE 2026"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Matrix (10x18 exactly like Excel) */}
                    <div className="overflow-x-auto custom-scrollbar pb-4">
                        <div className="min-w-[1100px] bg-[#0d0d0f]/90 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                            <table className="w-full border-collapse text-left">
                                <thead className="bg-[#0a0a0c]">
                                    <tr>
                                        <th className="p-3 border-r border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-slate-500 w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="text-blue-500">Matriz de Costeo</span>
                                                <span className="text-[8px] text-slate-600 tracking-tighter">Excel Replica 1:1</span>
                                            </div>
                                        </th>
                                        {ACCOMMODATIONS.map(col => (
                                            <th key={col.id} className={`p-2 border-r border-b border-white/5 text-center align-middle w-[90px] ${col.bgHeader}`}>
                                                <div className="flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-black uppercase tracking-tight leading-tight">{col.label}</span>
                                                    {col.sub && <span className="text-[9px] font-bold uppercase tracking-widest leading-none mt-0.5">{col.sub}</span>}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-[#0f0f13]">
                                    {/* 1. Tarifa a Cobrar */}
                                    <tr className="bg-blue-600/10 hover:bg-blue-600/20 transition-colors">
                                        <td className="p-3 border-r border-b border-white/5 font-black text-[10px] text-blue-400 uppercase tracking-widest pl-4 whitespace-nowrap">
                                            Tarifa a Cobrar por Persona
                                        </td>
                                        {ACCOMMODATIONS.map(col => (
                                            <td key={`${col.id}-tarifa`} className="p-1 text-center border-r border-b border-white/5 relative">
                                                <EditableInput
                                                    value={data[activeTab].rows[col.id].tarifaCobrar}
                                                    onChange={val => handleInputChange(activeTab, col.id, 'tarifaCobrar', val)}
                                                    prefix="$"
                                                    className="!bg-blue-900/30 !text-blue-300 !border-blue-500/30"
                                                />
                                            </td>
                                        ))}
                                    </tr>

                                    {/* 2 & 3. Tiquete y TA (Top section, editable) */}
                                    {renderInputRow("Valor del Tiquete", "tiqueteTop", "hover:bg-white/[0.02]", "")}
                                    {renderInputRow("TA + FEE con Iva incluido", "taFeeTop", "hover:bg-white/[0.02]", "")}

                                    {/* 4 & 5. Costos Calculados */}
                                    {renderCalcRow("Valor Porcion terrestre", "valorPT", "bg-white/[0.03]", "text-slate-300", "text-slate-400")}
                                    {renderCalcRow("valor incremento TC 5%", "incrementoTC", "bg-white/[0.03]", "text-slate-400", "text-slate-500")}

                                    {/* 6. Precio Total (Naranja) */}
                                    {renderCalcRow("precio total del Paquete", "precioTotal", "bg-orange-500/10", "text-orange-400 !text-sm", "text-orange-500")}

                                    {/* 7, 8 & 9. Desglose Tiquetes y Admin */}
                                    {renderInputRow("tiquete (NETA)", "tiqueteNeto", "hover:bg-white/[0.02] bg-yellow-900/5", "")}
                                    {renderInputRow("Tarifa Administrativa con iva", "tarifaAdminIva", "hover:bg-white/[0.02] bg-yellow-900/5", "")}
                                    {renderInputRow("Fee de Emision", "feeEmision", "hover:bg-white/[0.02] bg-yellow-900/5", "")}

                                    {/* 10 - 15. Costeos Directos (Amarillo/Verde) */}
                                    {renderInputRow("Asistencia medica", "asistencia", "bg-blue-900/10 hover:bg-blue-900/20", "!bg-blue-900/20 !text-blue-300 !border-blue-500/20", "text-blue-400")}
                                    {renderInputRow("Tarifa de alojamiento", "alojamiento", "bg-yellow-500/10 hover:bg-yellow-500/20", "!bg-yellow-500/20 !text-yellow-400 !border-yellow-500/30", "text-yellow-500")}
                                    {renderInputRow("Iva de Alojamiento", "ivaAlojamiento", "bg-yellow-500/10 hover:bg-yellow-500/20", "!bg-yellow-500/20 !text-yellow-400 !border-yellow-500/30", "text-yellow-500")}
                                    {renderInputRow("Seguro Hotelero", "seguroHotelero", "bg-yellow-500/10 hover:bg-yellow-500/20", "!bg-yellow-500/20 !text-yellow-400 !border-yellow-500/30", "text-yellow-500")}
                                    {renderInputRow("Traslados", "traslados", "bg-green-500/10 hover:bg-green-500/20", "!bg-green-500/20 !text-green-400 !border-green-500/30", "text-green-500")}
                                    {renderInputRow("Receptivos", "receptivos", "bg-green-500/10 hover:bg-green-500/20", "!bg-green-500/20 !text-green-400 !border-green-500/30", "text-green-500")}

                                    {/* 16. Factor de Utilidad */}
                                    <tr className="bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                        <td className="p-3 border-r border-b border-white/5 font-black text-[10px] uppercase tracking-wider pl-4 whitespace-nowrap text-red-500 flex justify-between items-center">
                                            Utilidad Porcion
                                            <span className="text-[8px] text-red-500/50 block ml-2">(Ej. 0.8)</span>
                                        </td>
                                        {ACCOMMODATIONS.map(col => (
                                            <td key={`${col.id}-utilidad`} className="p-1 text-center border-r border-b border-white/5 relative">
                                                <EditableInput
                                                    value={data[activeTab].rows[col.id].utilidad}
                                                    onChange={val => handleInputChange(activeTab, col.id, 'utilidad', val)}
                                                    prefix=""
                                                    className="!bg-red-900/30 !text-red-400 !border-red-500/30"
                                                />
                                            </td>
                                        ))}
                                    </tr>

                                    {/* 17. Utilidad PT (Naranja) */}
                                    {renderCalcRow("Utilidad Porcion Terrestre", "utilidadPT", "bg-orange-500/10", "text-orange-400", "text-orange-500")}

                                    {/* 18. UTILIDAD ADICIONAL (Verde exito / Rojo perdida) */}
                                    {renderCalcRow("UTILIDAD ADICIONAL", "utilidadAdicional", "bg-black", "text-emerald-400 !text-[13px]", "text-white")}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModule;
