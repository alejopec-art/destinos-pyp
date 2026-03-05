import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Calculator, Globe, Map, Plane, RefreshCcw, Download, Save,
    AlertCircle, TrendingUp, Info, ChevronRight, Database, FileText, ArrowLeft
} from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { generateProductPdf } from '../../utils/pdf';
import { useAuth } from '../../context/AuthContext';

// --- CONFIGURACIÓN Y CONSTANTES ---
const ACCOMMODATIONS = ['SENCILLA', 'DOBLE', 'TRIPLE', 'CHD', 'INF'];
const TABS = [
    { id: 'NACIONAL', label: 'NACIONAL', icon: Map },
    { id: 'INTERNACIONAL', label: 'INTERNACIONAL', icon: Globe },
    { id: 'NACIONAL SOLO PT', label: 'NACIONAL SOLO PT', icon: Map },
    { id: 'INTERNACIONAL SOLO PT', label: 'INTERNACIONAL SOLO PT', icon: Globe }
];

const INITIAL_ROW = {
    hotel: 0,
    asistencia: 0,
    receptivos: 0,
    tiquete: 0,
    markup: 15,
    ivaPT: 0,
    ivaTiquete: 0,
    adminFeeNet: 21008,
    adminFeeIVA: 3992
};

const INITIAL_TAB_DATA = {
    destination: '',
    trm: 4000,
    nights: 1,
    rows: ACCOMMODATIONS.reduce((acc, type) => ({
        ...acc,
        [type]: { ...INITIAL_ROW }
    }), {})
};

const EditableInput = ({ value, onChange, prefix = '', suffix = '', className = '' }) => (
    <div className={`relative group ${className}`}>
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lime-500/50 text-[10px] font-bold">{prefix}</span>}
        <input
            type="number"
            value={value}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-[#0d0d0f] border border-white/5 rounded-lg px-3 py-2 text-sm text-lime-400 font-mono focus:border-lime-500/50 outline-none transition-all ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lime-500/50 text-[10px] font-bold">{suffix}</span>}
    </div>
);

const ProductModule = () => {
    const { user } = useAuth();
    const advisorName = user?.full_name || user?.name || 'Asesora';
    const advisorRole = user?.professional_role || 'Asesora Comercial';

    const [activeTab, setActiveTab] = useState('NACIONAL');
    const [data, setData] = useState({
        'NACIONAL': { ...INITIAL_TAB_DATA },
        'INTERNACIONAL': { ...INITIAL_TAB_DATA, trm: 4000 },
        'NACIONAL SOLO PT': { ...INITIAL_TAB_DATA },
        'INTERNACIONAL SOLO PT': { ...INITIAL_TAB_DATA, trm: 4000 }
    });
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    // --- LÓGICA DE CÁLCULO ---
    const calculateTotals = (tabId, rowType) => {
        const row = data[tabId].rows[rowType];
        const isInternational = tabId.includes('INTERNACIONAL');
        const trm = parseFloat(data[tabId].trm) || 1;
        const nights = parseInt(data[tabId].nights) || 1;

        // 1. Costo PT (Terrestre)
        const hotelTotal = (parseFloat(row.hotel) || 0) * nights;
        const costoPT = hotelTotal +
            (parseFloat(row.asistencia) || 0) +
            (parseFloat(row.receptivos) || 0);

        // 2. Utilidad (Se calcula solo sobre el Costo PT)
        const markup = parseFloat(row.markup) || 0;
        const utilidad = costoPT * (markup / 100);

        // 3. Tiquete (Neto)
        const tiquete = parseFloat(row.tiquete) || 0;

        // 4. IVA
        const ivaPT = (parseFloat(row.ivaPT) || 0);
        const ivaTiquete = (parseFloat(row.ivaTiquete) || 0);

        // 5. Tarifa Administrativa (Neta + IVA)
        const adminFee = (parseFloat(row.adminFeeNet) || 0) + (parseFloat(row.adminFeeIVA) || 0);

        // 6. Totales
        const netoSinTiquete = costoPT + utilidad + ivaPT;
        const totalVenta = netoSinTiquete + tiquete + ivaTiquete + adminFee;

        return {
            costoPT,
            utilidad,
            netoSinTiquete,
            totalVenta,
            totalVentaCOP: totalVenta * trm
        };
    };

    const handleNightsChange = (tabId, value) => {
        setData(prev => ({
            ...prev,
            [tabId]: { ...prev[tabId], nights: value }
        }));
    };

    const handleInputChange = (tabId, rowType, field, value) => {
        setData(prev => ({
            ...prev,
            [tabId]: {
                ...prev[tabId],
                rows: {
                    ...prev[tabId].rows,
                    [rowType]: {
                        ...prev[tabId].rows[rowType],
                        [field]: value
                    }
                }
            }
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
            setSaveStatus(`Error: ${err.message}`);
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
                setData(prev => ({
                    ...prev,
                    [activeTab]: result.config_data
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPdf = () => {
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
                            <Plane className="w-4 h-4" />
                        </span>
                        <input
                            value={data[activeTab].nights}
                            onChange={e => handleNightsChange(activeTab, e.target.value)}
                            className="bg-black/60 border border-white/10 pl-10 pr-4 py-2 rounded-xl text-lime-400 font-black text-sm outline-none focus:border-lime-500/40 w-24"
                            placeholder="Noches"
                        />
                    </div>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lime-400">
                            <RefreshCcw className="w-4 h-4" />
                        </span>
                        <input
                            value={data[activeTab].trm}
                            onChange={e => handleTRMChange(activeTab, e.target.value)}
                            className="bg-black/60 border border-white/10 pl-10 pr-4 py-2 rounded-xl text-lime-400 font-black text-sm outline-none focus:border-lime-500/40 w-32"
                            placeholder="TRM"
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
                <div className="lg:col-span-12 xl:col-span-4 flex flex-col gap-6">
                    <div className="bg-[#0d0d0f]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/5 blur-3xl rounded-full"></div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                            <Database className="w-5 h-5 text-lime-400" />
                            Configuración de Producto
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Nombre del Destino / Producto</label>
                                <div className="relative">
                                    <input
                                        value={data[activeTab].destination}
                                        onChange={e => handleDestinationChange(activeTab, e.target.value)}
                                        onBlur={() => loadFromSupabase(data[activeTab].destination)}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-lime-500/40 transition-all"
                                        placeholder="Ej: CANCÚN TODO INCLUIDO"
                                    />
                                    <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                                </div>
                            </div>

                            <div className="bg-lime-500/5 rounded-2xl p-5 border border-lime-500/10 space-y-4">
                                <div className="flex items-center gap-3 text-lime-400 mb-2">
                                    <Info className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Información de Costeo</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                    Las celdas resaltadas en <span className="text-lime-500 font-bold">LIME</span> son editables y corresponden a los campos amarillos del Excel.
                                </p>
                                <button
                                    onClick={handleExportPdf}
                                    className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Exportar Ficha Técnica
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#0d0d0f] to-[#151518] p-8 rounded-3xl border border-white/5 shadow-2xl">
                        <h3 className="text-sm font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-lime-400" />
                            Resumen de Utilidades
                        </h3>
                        <div className="space-y-4">
                            {ACCOMMODATIONS.map(type => {
                                const { utilidad } = calculateTotals(activeTab, type);
                                return (
                                    <div key={type} className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-slate-500">{type}</span>
                                            {activeTab.includes('INTERNACIONAL') && (
                                                <span className="text-[9px] text-lime-600 font-bold uppercase tracking-tighter">Util/COP: $ {Math.round(utilidad * (parseFloat(data[activeTab].trm) || 1)).toLocaleString()}</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-black text-lime-400">$ {Math.round(utilidad).toLocaleString()}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Grid: Calculator */}
                <div className="lg:col-span-12 xl:col-span-8 overflow-x-auto">
                    <div className="min-w-[1000px] bg-[#0d0d0f]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-black/60 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-left">
                                    <th className="p-6 border-b border-white/5">Alojamiento</th>
                                    <th className="p-6 border-b border-white/5">Hotel</th>
                                    <th className="p-6 border-b border-white/5">Asistencia</th>
                                    <th className="p-6 border-b border-white/5">Receptivos</th>
                                    <th className="p-6 border-b border-white/5">Costo PT</th>
                                    <th className="p-6 border-b border-white/5">Markup %</th>
                                    <th className="p-6 border-b border-white/5">Tiquete</th>
                                    <th className="p-6 border-b border-white/5">Fee (Neto+IVA)</th>
                                    <th className="p-6 border-b border-white/5 text-right bg-lime-500/5 text-lime-500">Total Venta</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ACCOMMODATIONS.map(type => {
                                    const { costoPT, totalVenta, totalVentaCOP } = calculateTotals(activeTab, type);
                                    const row = data[activeTab].rows[type];
                                    return (
                                        <tr key={type} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="p-6">
                                                <span className="text-xs font-black text-white uppercase tracking-wider">{type}</span>
                                            </td>
                                            <td className="p-4">
                                                <EditableInput
                                                    value={row.hotel}
                                                    onChange={val => handleInputChange(activeTab, type, 'hotel', val)}
                                                    prefix="$"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <EditableInput
                                                    value={row.asistencia}
                                                    onChange={val => handleInputChange(activeTab, type, 'asistencia', val)}
                                                    prefix="$"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <EditableInput
                                                    value={row.receptivos}
                                                    onChange={val => handleInputChange(activeTab, type, 'receptivos', val)}
                                                    prefix="$"
                                                />
                                            </td>
                                            <td className="p-6">
                                                <span className="text-xs font-mono text-slate-300 font-bold">$ {Math.round(costoPT).toLocaleString()}</span>
                                            </td>
                                            <td className="p-4 w-28">
                                                <EditableInput
                                                    value={row.markup}
                                                    onChange={val => handleInputChange(activeTab, type, 'markup', val)}
                                                    suffix="%"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <EditableInput
                                                    value={row.tiquete}
                                                    onChange={val => handleInputChange(activeTab, type, 'tiquete', val)}
                                                    prefix="$"
                                                />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <EditableInput
                                                        value={row.adminFeeNet}
                                                        onChange={val => handleInputChange(activeTab, type, 'adminFeeNet', val)}
                                                        prefix="N"
                                                    />
                                                    <EditableInput
                                                        value={row.adminFeeIVA}
                                                        onChange={val => handleInputChange(activeTab, type, 'adminFeeIVA', val)}
                                                        prefix="I"
                                                    />
                                                </div>
                                            </td>
                                            <td className="p-6 text-right bg-lime-500/[0.03]">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-lg font-black text-lime-400 font-mono tracking-tighter">
                                                        $ {Math.round(totalVenta).toLocaleString()}
                                                    </span>
                                                    {activeTab.includes('INTERNACIONAL') && (
                                                        <span className="text-[10px] font-bold text-lime-600/70 font-mono mt-0.5">
                                                            ≈ $ {Math.round(totalVentaCOP).toLocaleString()} COP
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex items-center justify-between p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Resumen de Cálculo</span>
                                <span className="text-xs text-slate-400">Total Venta = (Costo PT + Utilidad) + Tiquete + Fee</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">TRM Aplicada</span>
                            <span className="text-xl font-mono font-black text-white">$ {parseFloat(data[activeTab].trm).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModule;
