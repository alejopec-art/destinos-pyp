import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plane, FileCheck, Users, DollarSign, Settings, 
    ArrowLeft, Plus, Printer, Save 
} from 'lucide-react';
import { ERP } from '../../services/mockERP';

const QuotesPage = () => {
    // Estado Principal
    const [view, setView] = useState('pipeline'); // 'pipeline' | 'form' | 'settings'
    const [activeTab, setActiveTab] = useState('client'); // client, itinerary, finance, summary
    const [folio, setFolio] = useState('');
    const [previewFolio, setPreviewFolio] = useState('');
    
    // Estado del Formulario
    const [formData, setFormData] = useState({
        // Datos Cliente
        clientName: '',
        clientDoc: '',
        destination: '',
        dateStart: '',
        dateEnd: '',
        costCenter: '',
        // Itinerario Dinámico
        supplier: '',
        supplierInfo: {},
        itineraryItems: [
            { day: 1, port: '', arrival: '', departure: '', activity: '' }
        ],
        // Finanzas Multidivisa
        currency: 'COP', // COP | USD
        exchangeRate: ERP.getTRM(),
        usdPrice: 0,
        taxes: 0,
        onboardCredit: 0,
        netCost: 0,
        marginPercent: 15,
        salePrice: 0,
        payments: {
            downPayment: 0,
            balance: 0,
            deadline: ''
        },
        // Extras y Legales
        includes: {
            beverages: false,
            tips: false,
            excursions: false,
            wifi: false
        },
        legalText: ERP.db.legal?.terms || '',
        cancellationPolicy: ERP.db.legal?.cancellation || '',
        status: 'Cotizado' // Cotizado, Pagado, Emitido, Viajando, Finalizado
    });

    // Cargar folio preliminar al entrar al formulario
    useEffect(() => {
        if (view === 'form' && !folio) {
            setPreviewFolio(ERP.getNextFolio('COT'));
        }
    }, [view, folio]);

    // Cálculos Financieros en Vivo
    useEffect(() => {
        let net = parseFloat(formData.netCost) || 0;
        
        // Si es USD, convertir a COP para cálculos internos base
        if (formData.currency === 'USD') {
            const trm = parseFloat(formData.exchangeRate) || 1;
            const usd = parseFloat(formData.usdPrice) || 0;
            const taxes = parseFloat(formData.taxes) || 0;
            net = (usd + taxes) * trm;
        }

        const margin = parseFloat(formData.marginPercent) || 0;
        const sale = net / (1 - (margin / 100)); // Fórmula de margen sobre venta
        const profit = sale - net;
        
        setFormData(prev => ({
            ...prev,
            netCost: net, // Guardamos el neto en COP para consistencia
            salePrice: sale,
            profit: profit,
            payments: {
                ...prev.payments,
                balance: sale - (prev.payments.downPayment || 0)
            }
        }));
    }, [formData.netCost, formData.marginPercent, formData.payments.downPayment, formData.currency, formData.usdPrice, formData.taxes, formData.exchangeRate]);

    // Manejadores
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleItineraryChange = (index, field, value) => {
        const newItems = [...formData.itineraryItems];
        newItems[index][field] = value;
        setFormData(prev => ({ ...prev, itineraryItems: newItems }));
    };

    const addItineraryDay = () => {
        setFormData(prev => ({
            ...prev,
            itineraryItems: [...prev.itineraryItems, { day: prev.itineraryItems.length + 1, port: '', arrival: '', departure: '', activity: '' }]
        }));
    };

    const removeItineraryDay = (index) => {
        const newItems = formData.itineraryItems.filter((_, i) => i !== index);
        // Reordenar días
        const reordered = newItems.map((item, i) => ({ ...item, day: i + 1 }));
        setFormData(prev => ({ ...prev, itineraryItems: reordered }));
    };

    const handleSupplierChange = (e) => {
        const supplierId = e.target.value;
        const supplier = ERP.db.suppliers.find(s => s.id === supplierId);
        setFormData(prev => ({ 
            ...prev, 
            supplier: supplierId,
            supplierInfo: supplier || {}
        }));
    };

    const handleSaveQuote = () => {
        // Validación básica
        if (!formData.clientName || !formData.destination) {
            alert("Por favor completa los datos obligatorios del cliente.");
            return;
        }

        // 1. Verificar y quemar folio (Atomicidad simulada)
        const finalFolio = ERP.commitFolio('COT');
        setFolio(finalFolio);
        
        // 2. Simular guardado en DB
        alert(`¡Cotización ${finalFolio} guardada exitosamente! \nVinculada a: ${formData.costCenter || 'General'}`);
        setView('pipeline');
    };

    const handleGeneratePDF = () => {
        alert("Generando PDF de Lujo...\n- Incluyendo fotos de destino\n- Adjuntando códigos QR\n- Firmando digitalmente");
    };

    // Componentes de la Interfaz
    const PipelineCard = ({ status, count, color }) => (
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl p-4 min-h-[400px]">
            <div className={`pb-3 border-b border-slate-700 mb-4 flex justify-between items-center`}>
                <span className={`font-bold text-${color}-400 uppercase tracking-wider text-xs`}>{status}</span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full">{count}</span>
            </div>
            {/* Placeholder items */}
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
        <div className="max-w-7xl mx-auto min-h-screen pb-20">
            {/* Header Global del Módulo */}
            <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        {view === 'form' && (
                            <button onClick={() => setView('pipeline')} className="p-1 rounded-full hover:bg-slate-800 transition-colors">
                                <ArrowLeft className="w-6 h-6 text-slate-400" />
                            </button>
                        )}
                        Módulo Vacacional
                        {view === 'form' && <span className="text-sm font-normal text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Nueva Cotización</span>}
                    </h1>
                    <p className="text-slate-400">Gestión profesional de viajes y reservas.</p>
                </div>
                
                <div className="flex gap-3">
                    {view === 'pipeline' && (
                        <>
                            <button onClick={() => alert("Configuración de Asesor: Firma, Metas, Plantillas")} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all">
                                <Settings className="w-5 h-5" />
                            </button>
                            <button onClick={() => setView('form')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Nueva Cotización
                            </button>
                        </>
                    )}
                </div>
            </header>

            {/* VISTA: PIPELINE */}
            {view === 'pipeline' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
                    <PipelineCard status="Cotizado" count={12} color="blue" />
                    <PipelineCard status="Pagado" count={5} color="emerald" />
                    <PipelineCard status="Por Emitir" count={3} color="yellow" />
                    <PipelineCard status="Viajando" count={8} color="purple" />
                    <PipelineCard status="Finalizado" count={45} color="slate" />
                </div>
            )}

            {/* VISTA: FORMULARIO MULTICAPA */}
            {view === 'form' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar de Navegación del Formulario */}
                    <div className="lg:col-span-3 space-y-2">
                        {[
                            { id: 'client', label: 'Datos Cliente', icon: Users },
                            { id: 'itinerary', label: 'Itinerario', icon: Plane },
                            { id: 'finance', label: 'Finanzas', icon: DollarSign },
                            { id: 'summary', label: 'Resumen & Emisión', icon: FileCheck },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all font-medium text-sm ${
                                    activeTab === tab.id 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                                    : 'bg-[#1e293b] text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" /> {tab.label}
                            </button>
                        ))}

                        {/* Widget de Folio Flotante */}
                        <div className="mt-8 bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-center">
                            <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Folio Asignado</p>
                            <p className="text-xl font-mono text-blue-400 font-bold">{folio || previewFolio}</p>
                            <div className="mt-2 flex justify-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs text-green-400">Verificando secuencia...</span>
                            </div>
                        </div>
                    </div>

                    {/* Área de Contenido */}
                    <div className="lg:col-span-9">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-8 min-h-[600px] relative"
                        >
                            {/* TAB: DATOS CLIENTE */}
                            {activeTab === 'client' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Users className="w-6 h-6 text-blue-400" /> Información del Cliente</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Nombre Completo</label>
                                            <input name="clientName" value={formData.clientName} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ej: Juan Pérez" />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Documento / Pasaporte</label>
                                            <input name="clientDoc" value={formData.clientDoc} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ej: 1020304050" />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Destino Principal</label>
                                            <input name="destination" value={formData.destination} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ej: Punta Cana" />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Centro de Costos</label>
                                            <select name="costCenter" value={formData.costCenter} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none">
                                                <option value="">Seleccionar...</option>
                                                {ERP.db.costCenters.map(cc => <option key={cc.id} value={cc.name}>{cc.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-2">Ida</label>
                                                <input type="date" name="dateStart" value={formData.dateStart} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-sm mb-2">Regreso</label>
                                                <input type="date" name="dateEnd" value={formData.dateEnd} onChange={handleInputChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-8">
                                        <button onClick={() => setActiveTab('itinerary')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">
                                            Siguiente: Itinerario <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB: ITINERARIO */}
                            {activeTab === 'itinerary' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Plane className="w-6 h-6 text-teal-400" /> Itinerario Detallado (Día a Día)</h2>
                                    
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 mb-6">
                                        <label className="block text-teal-400 font-bold text-sm mb-4 uppercase tracking-wide">Proveedor & Barco/Hotel</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <select name="supplier" value={formData.supplier} onChange={handleSupplierChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-teal-500 outline-none">
                                                <option value="">Seleccionar Proveedor...</option>
                                                {ERP.db.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            {formData.supplier && (
                                                <div className="text-sm text-slate-400 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                                                    <p><span className="font-bold text-slate-300">NIT:</span> {formData.supplierInfo.nit}</p>
                                                    <p><span className="font-bold text-slate-300">Contacto:</span> {formData.supplierInfo.contact}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-400">
                                            <thead className="bg-slate-800 text-xs uppercase font-bold text-slate-300">
                                                <tr>
                                                    <th className="px-4 py-3 text-center w-16">Día</th>
                                                    <th className="px-4 py-3">Puerto / Ciudad</th>
                                                    <th className="px-4 py-3 w-32">Llegada</th>
                                                    <th className="px-4 py-3 w-32">Salida</th>
                                                    <th className="px-4 py-3">Actividad / Notas</th>
                                                    <th className="px-4 py-3 w-16"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-700/50">
                                                {formData.itineraryItems.map((item, index) => (
                                                    <tr key={index} className="hover:bg-slate-800/30">
                                                        <td className="px-4 py-2 text-center font-bold text-white">{item.day}</td>
                                                        <td className="px-4 py-2">
                                                            <input 
                                                                type="text" 
                                                                value={item.port} 
                                                                onChange={(e) => handleItineraryChange(index, 'port', e.target.value)}
                                                                className="w-full bg-transparent border-b border-slate-700 focus:border-teal-500 outline-none text-white" 
                                                                placeholder="Ej: Miami"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input 
                                                                type="time" 
                                                                value={item.arrival} 
                                                                onChange={(e) => handleItineraryChange(index, 'arrival', e.target.value)}
                                                                className="w-full bg-transparent border-b border-slate-700 focus:border-teal-500 outline-none text-white" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input 
                                                                type="time" 
                                                                value={item.departure} 
                                                                onChange={(e) => handleItineraryChange(index, 'departure', e.target.value)}
                                                                className="w-full bg-transparent border-b border-slate-700 focus:border-teal-500 outline-none text-white" 
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <input 
                                                                type="text" 
                                                                value={item.activity} 
                                                                onChange={(e) => handleItineraryChange(index, 'activity', e.target.value)}
                                                                className="w-full bg-transparent border-b border-slate-700 focus:border-teal-500 outline-none text-white" 
                                                                placeholder="Ej: Embarque"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button onClick={() => removeItineraryDay(index)} className="text-red-400 hover:text-red-300">
                                                                <ArrowLeft className="w-4 h-4 rotate-45" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <button onClick={addItineraryDay} className="mt-4 text-sm text-teal-400 font-bold hover:text-teal-300 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Agregar Día
                                        </button>
                                    </div>

                                    <div className="flex justify-between mt-8">
                                        <button onClick={() => setActiveTab('client')} className="text-slate-400 hover:text-white font-medium">Atrás</button>
                                        <button onClick={() => setActiveTab('finance')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">
                                            Siguiente: Finanzas <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB: FINANZAS */}
                            {activeTab === 'finance' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><DollarSign className="w-6 h-6 text-emerald-400" /> Finanzas Multidivisa</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                                        <div>
                                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Moneda Base</label>
                                            <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white">
                                                <option value="COP">Peso Colombiano (COP)</option>
                                                <option value="USD">Dólar (USD)</option>
                                            </select>
                                        </div>
                                        {formData.currency === 'USD' && (
                                            <>
                                                <div>
                                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Precio USD</label>
                                                    <input type="number" name="usdPrice" value={formData.usdPrice} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">TRM del Día</label>
                                                    <input type="number" name="exchangeRate" value={formData.exchangeRate} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Impuestos (USD)</label>
                                                    <input type="number" name="taxes" value={formData.taxes} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white" />
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Costo Neto (COP)</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">$</span>
                                                <input type="number" name="netCost" value={formData.netCost} readOnly={formData.currency === 'USD'} onChange={handleInputChange} className="w-full bg-transparent text-white font-mono font-bold outline-none" placeholder="0" />
                                            </div>
                                            {formData.currency === 'USD' && <p className="text-[10px] text-slate-500 mt-1">Calculado: (USD + Tax) * TRM</p>}
                                        </div>
                                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                            <label className="block text-blue-400 text-xs uppercase font-bold mb-2">Margen (%)</label>
                                            <div className="flex items-center gap-2">
                                                <input type="number" name="marginPercent" value={formData.marginPercent} onChange={handleInputChange} className="w-full bg-transparent text-blue-400 font-mono font-bold outline-none" placeholder="15" />
                                                <span className="text-slate-500">%</span>
                                            </div>
                                        </div>
                                        <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                                            <label className="block text-emerald-400 text-xs uppercase font-bold mb-2">Precio Venta (Sugerido)</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-500">$</span>
                                                <span className="text-emerald-400 font-mono font-bold text-xl">{new Intl.NumberFormat('es-CO').format(formData.salePrice)}</span>
                                            </div>
                                            <p className="text-[10px] text-emerald-600 mt-1">Utilidad: ${new Intl.NumberFormat('es-CO').format(formData.profit)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                                        <h3 className="text-sm font-bold text-white mb-4 uppercase">Incluye / No Incluye</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" name="includes.beverages" checked={formData.includes.beverages} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-600 text-blue-600 bg-slate-700 focus:ring-blue-500" />
                                                <span className="text-slate-300 text-sm">Paquete de Bebidas</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" name="includes.tips" checked={formData.includes.tips} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-600 text-blue-600 bg-slate-700 focus:ring-blue-500" />
                                                <span className="text-slate-300 text-sm">Propinas Pre-pagadas</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" name="includes.excursions" checked={formData.includes.excursions} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-600 text-blue-600 bg-slate-700 focus:ring-blue-500" />
                                                <span className="text-slate-300 text-sm">Excursiones en Tierra</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" name="includes.wifi" checked={formData.includes.wifi} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-600 text-blue-600 bg-slate-700 focus:ring-blue-500" />
                                                <span className="text-slate-300 text-sm">Internet / Wi-Fi</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Desglose de Pagos */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Anticipo Recibido</label>
                                            <input type="number" 
                                                value={formData.payments.downPayment} 
                                                onChange={(e) => setFormData(prev => ({...prev, payments: {...prev.payments, downPayment: parseFloat(e.target.value)}}))} 
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 text-sm mb-2">Saldo Pendiente</label>
                                            <div className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-red-400 font-bold">
                                                $ {new Intl.NumberFormat('es-CO').format(formData.payments.balance || 0)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-8">
                                        <button onClick={() => setActiveTab('itinerary')} className="text-slate-400 hover:text-white font-medium">Atrás</button>
                                        <button onClick={() => setActiveTab('summary')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">
                                            Siguiente: Resumen <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* TAB: RESUMEN (Actualizado con Legales) */}
                            {activeTab === 'summary' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FileCheck className="w-6 h-6 text-purple-400" /> Revisión & Legal</h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                            <h3 className="text-sm font-bold text-white mb-4 uppercase">Resumen del Viaje</h3>
                                            <p className="text-slate-400 text-sm mb-2"><span className="font-bold text-slate-300">Cliente:</span> {formData.clientName}</p>
                                            <p className="text-slate-400 text-sm mb-2"><span className="font-bold text-slate-300">Destino:</span> {formData.destination}</p>
                                            <p className="text-slate-400 text-sm mb-2"><span className="font-bold text-slate-300">Fecha:</span> {formData.dateStart}</p>
                                            <p className="text-slate-400 text-sm mb-2"><span className="font-bold text-slate-300">Total Venta:</span> ${new Intl.NumberFormat('es-CO').format(formData.salePrice)}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Términos y Condiciones</label>
                                                <textarea 
                                                    name="legalText" 
                                                    value={formData.legalText} 
                                                    onChange={handleInputChange} 
                                                    className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:border-purple-500 outline-none resize-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-slate-400 text-xs uppercase font-bold mb-2">Políticas de Cancelación</label>
                                                <textarea 
                                                    name="cancellationPolicy" 
                                                    value={formData.cancellationPolicy} 
                                                    onChange={handleInputChange} 
                                                    className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-300 focus:border-purple-500 outline-none resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between mt-8">
                                        <button onClick={() => setActiveTab('finance')} className="text-slate-400 hover:text-white font-medium">Atrás</button>
                                        <div className="flex gap-4">
                                            <button onClick={handleGeneratePDF} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors flex items-center gap-2">
                                                <Printer className="w-5 h-5" /> Vista Previa PDF
                                            </button>
                                            <button onClick={handleSaveQuote} className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-900/20 hover:bg-green-500 transition-colors flex items-center gap-2">
                                                <Save className="w-5 h-5" /> Guardar & Emitir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default QuotesPage;