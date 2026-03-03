import React, { useState } from 'react';
import {
    Book, RefreshCcw, BookOpen, AlertCircle,
    ChevronDown, ChevronUp, CheckCircle, Calculator, Shield,
    TerminalSquare, Plane, FileText, Download, Users, Briefcase,
    Hash, DollarSign, Database, Keyboard, Calendar, UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HelpSection = ({ userRole, advisorName }) => {
    const [activeTab, setActiveTab] = useState('cotizaciones');
    const [openAccordion, setOpenAccordion] = useState(null);

    const tabs = [
        { id: 'cotizaciones', title: 'Módulo Cotizaciones', icon: Calculator },
        { id: 'confirmacion', title: 'Confirmación (Contrato)', icon: Book },
        { id: 'reconfirmacion', title: 'Re-Confirmación', icon: Shield },
        { id: 'historial', title: 'Historial & Reportes', icon: Database },
        { id: 'diccionario', title: 'Diccionario Folios', icon: BookOpen },
        { id: 'navegacion', title: 'Navegación Avanzada', icon: Keyboard },
    ];

    const toggleAccordion = (id) => {
        setOpenAccordion(openAccordion === id ? null : id);
    };

    const AccordionItem = ({ id, title, icon: Icon, color = "blue", children }) => {
        const isOpen = openAccordion === id;
        return (
            <div className={`border border-slate-700/50 rounded-2xl overflow-hidden bg-slate-900/40 transition-all ${isOpen ? 'ring-1 ring-' + color + '-500/50 shadow-lg shadow-' + color + '-900/20' : ''}`}>
                <button
                    onClick={() => toggleAccordion(id)}
                    className="w-full flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors focus:outline-none"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-400`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-white font-bold text-left">{title}</h3>
                    </div>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-slate-700/50"
                        >
                            <div className="p-6 bg-slate-800/20 text-slate-300 text-sm leading-relaxed space-y-4">
                                {children}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header Master Manual */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-emerald-400" /> Manual Maestro & Ayuda Integral
                    </h1>
                    <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                        Guía técnica exhaustiva que cubre el 100% de la Intranet Operativa Destinos P&P. Diseñada para lograr <strong>CERO errores operativos</strong> y garantizar estandarización absoluta en todos los perfiles comerciales, administrativos y contables.
                    </p>
                </div>
                <div className="relative z-10 flex items-center gap-3 px-5 py-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-xl">
                    <UserCircle className="w-8 h-8 text-emerald-400" />
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Soporte Técnico</p>
                        <p className="text-sm text-white font-bold">{advisorName}</p>
                        <p className="text-[10px] text-emerald-400 uppercase font-bold">{userRole}</p>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-2 bg-slate-900/60 rounded-2xl border border-slate-700 overflow-x-auto custom-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setOpenAccordion(null); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.title}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 gap-4"
                >

                    {/* TAB: COTIZACIONES (4 PASOS) */}
                    {activeTab === 'cotizaciones' && (
                        <>
                            <div className="bg-slate-800/30 border border-blue-500/20 rounded-2xl p-6 mb-2">
                                <h2 className="text-xl font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Calculator className="w-6 h-6" /> El Módulo Comercial Inicial
                                </h2>
                                <p className="text-slate-400 text-sm">Este es el lienzo en blanco donde se forja el <strong>Paso 1</strong> de toda venta. Su correcta estructuración garantiza un PDF impecable y rastreabilidad forense en el Historial.</p>
                            </div>

                            <AccordionItem id="cot-paso1" title="Paso 1: Llenado de Datos del Solicitante y Destino" icon={Users} color="blue">
                                <p>El bloque innegociable. Si un solo dato de este bloque falta o es incorrecto, el sistema <strong>rechazará el guardado</strong> para proteger la Base de Datos.</p>
                                <ul className="list-disc pl-5 mt-3 space-y-2">
                                    <li><strong>Generación de Folio:</strong> Al abrir el formulario, el sistema inyecta un folio provisorio automáticamente asumiendo tu pestaña y módulo (ej. <span className="text-emerald-400 font-mono font-bold bg-slate-900 px-2 rounded">COT-COR-NAC</span>).</li>
                                    <li><strong>Obligatorio:</strong> Debes tabular rápidamente para escribir el nombre completo, celular y destino. <strong>Jamás</strong> presiones guardar sin validar estos campos primarios.</li>
                                    <li><strong>Manejo de Tabulación:</strong> Utiliza la tecla <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px] font-mono mx-1">TAB</kbd> en tu teclado para brincar ágilmente como un profesional.</li>
                                </ul>
                            </AccordionItem>

                            <AccordionItem id="cot-paso2" title="Paso 2: Selección de Vuelos y Alojamiento" icon={Plane} color="indigo">
                                <p>Agrega el itinerario logístico y fotos llamativas para vestir el documento.</p>
                                <ul className="list-disc pl-5 mt-3 space-y-2">
                                    <li><strong>Uso de Fotos de Servidor:</strong> Aprovecha las URLs predeterminadas y la descarga optimizada desde el servidor de <strong>Hostinger</strong>. Esto le quita kilos a nuestra Base de Datos en Supabase y hace que el cotizador no sufra retrasos de procesamiento.</li>
                                </ul>
                            </AccordionItem>

                            <AccordionItem id="cot-paso3" title="Paso 3: Liquidación de Costos y Matemáticas" icon={DollarSign} color="amber">
                                <p>Cruce matemático. El motor principal del algoritmo unificado.</p>
                                <ul className="list-disc pl-5 mt-3 space-y-2">
                                    <li>Todo monto llenado individualmente (por adulto, por servicio, markup o taxes) terminará en una sumatoria colosal.</li>
                                    <li>El sistema calcula los <strong>Totales resaltados en Amarillo/Esmeralda</strong> en una tabla fija invisible que protege la información antes del PDF.</li>
                                </ul>
                            </AccordionItem>

                            <AccordionItem id="cot-paso4" title="Paso 4: Generación y Respaldo de PDF" icon={FileText} color="purple">
                                <p>Último movimiento formal que bloquea la tarifa y entrega el PDF al cliente.</p>
                                <ul className="list-disc pl-5 mt-3 space-y-2">
                                    <li>Pulsar <strong>"Guardar y Generar PDF"</strong> es una acción dual: registra instantáneamente el prospecto y compila tu archivo con el diseño y folio incrustados.</li>
                                    <li>Solo debes presionar la tecla <kbd className="text-xs bg-slate-800 border border-slate-600 px-1 rounded text-white font-mono">Enter ↵</kbd> en las modales del navegador para descargar.</li>
                                </ul>
                            </AccordionItem>
                        </>
                    )}

                    {/* TAB: CONFIRMACIÓN */}
                    {activeTab === 'confirmacion' && (
                        <>
                            <div className="bg-slate-800/30 border border-fuchsia-500/20 rounded-2xl p-6 mb-2">
                                <h2 className="text-xl font-black text-fuchsia-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Book className="w-6 h-6" /> El Contrato Operativo y Pasajeros
                                </h2>
                                <p className="text-slate-400 text-sm">El momento donde el Borrador se convierte en una liquidación legal que cruza con Contabilidad y Aerolíneas.</p>
                            </div>

                            <AccordionItem id="conf-inicio" title="Carga y Asociación de Folios Existentes" icon={Hash} color="fuchsia">
                                <p><strong>Regla vital: Nunca partas de cero para confirmar.</strong></p>
                                <ul className="list-disc pl-5 mt-3 space-y-2">
                                    <li>Ingresa el folio estructurado provisto en la barra buscadora. El sistema traccionará todos los valores financieros y el pasajero titular desde la Fase 1.</li>
                                    <li>Cualquier falla digitando el folio vinculará datos huérfanos. <strong>Obligatorio Validar</strong>.</li>
                                </ul>
                            </AccordionItem>

                            <AccordionItem id="conf-liq" title="Liquidación Exacta de Pagos (Valor Total a Saldo)" icon={Calculator} color="amber">
                                <p>Una vez identificados todos y cada uno de los pasajeros reales a abordar (nombres legales, documentos, nacimiento), completamos la matriz de cuotas.</p>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl shadow-inner">
                                        <p className="font-bold text-amber-400 mb-1">1. Valor Total</p>
                                        <p className="text-xs text-slate-400">La cifra monumental inamovible de la venta que debe igualarse siempre a final de temporada.</p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl shadow-inner">
                                        <p className="font-bold text-emerald-400 mb-1">2. Abonos Planificados</p>
                                        <p className="text-xs text-slate-400">Detalle del <strong>Primer Abono</strong> (pago de reserva) y <strong>Segundo Abono</strong> intermedio.</p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-700/50 p-4 rounded-xl shadow-inner">
                                        <p className="font-bold text-blue-400 mb-1">3. Saldo Automático</p>
                                        <p className="text-xs text-slate-400">El margen pendiente que queda entre el Valor Total liquidado y la suma de Abonos declarados.</p>
                                    </div>
                                </div>
                            </AccordionItem>

                            <AccordionItem id="conf-legais" title="Habeas Data & Restricción Legal de Menores" icon={Shield} color="red">
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                                    <p className="text-sm text-red-300"><strong>🛡️ PROTECCIÓN JURÍDICA ABSOLUTA:</strong> Estas cláusulas determinan la validez total del contrato ante la ley.</p>
                                </div>
                                <ul className="list-disc pl-5 space-y-3">
                                    <li><strong>Habeas Data:</strong> Autorización explícita, que debes marcar como <strong className="text-emerald-400 font-bold">"SÍ"</strong>, asumiendo que el pasajero aprueba el alojamiento de sus datos de pasaporte confidenciales para emitir la TKT o Alojamiento. Sin eso, infringes normativa.</li>
                                    <li><strong>Protección a Menores:</strong> Responsabilidad legal vital de llevar su registro o permiso de embarque para contrarrestar fraudes a la ley 679 de Prevención Internacional. Se deben estampar los nombres de los acudientes en el Contrato de Viaje.</li>
                                </ul>
                            </AccordionItem>
                        </>
                    )}

                    {/* TAB: RECONFIRMACION */}
                    {activeTab === 'reconfirmacion' && (
                        <>
                            <div className="bg-slate-800/30 border border-emerald-500/20 rounded-2xl p-6 mb-2">
                                <h2 className="text-xl font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Shield className="w-6 h-6" /> El Checklist Operativo Final (Paso 5)
                                </h2>
                                <p className="text-slate-400 text-sm">Este entorno de Contabilidad y Operaciones define el libramiento final. Ninguna confirmación salta al Voucher Electrónico si los <strong className="text-emerald-400">3 Bloques Maestros</strong> no están en Verde.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10"></div>
                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><DollarSign className="w-4 h-4" /></div>
                                        <h3 className="font-bold text-white leading-tight">1. Área de Pagos<br /><span className="text-[10px] text-slate-400 uppercase">Soportes Reales</span></h3>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">Seccional estricta de recaudación de fondos visuales (Transferencias Bancarias confirmadas, Wompi, Datafonos). Un asesor operativo adjunta los recibos para auditoría inmediata.</p>
                                </div>

                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-colors">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10"></div>
                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400"><Calculator className="w-4 h-4" /></div>
                                        <h3 className="font-bold text-white leading-tight">2. Facturación<br /><span className="text-[10px] text-slate-400 uppercase">A Operadores Locales</span></h3>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10">Cruces de contabilidad corporativa. Validar el egreso de plata interna de la agencia hacia los intermediarios de servicios (Vuelos Consolidados u Hoteleros). Si no le pagamos al hotel, no hay Voucher.</p>
                                </div>

                                <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-colors">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10"></div>
                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><CheckCircle className="w-4 h-4" /></div>
                                        <h3 className="font-bold text-white leading-tight">3. Voucher 5/5<br /><span className="text-[10px] text-slate-400 uppercase">Documentos Finales</span></h3>
                                    </div>
                                    <p className="text-xs text-slate-300 leading-relaxed mb-4 relative z-10"><strong>La cereza del pastel.</strong> Solo cuando los 2 bloques anteriores están blindados, el sistema permite marcar como "Paso 5 / Confirmado Totalmente". Se emiten tiquetes aéreos (PNR logrados), y bitácoras definitivas preparadas para envío de WhatsApp.</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* TAB: HISTORIAL Y REPORTES */}
                    {activeTab === 'historial' && (
                        <>
                            <div className="bg-slate-800/30 border border-indigo-500/20 rounded-2xl p-6 mb-2">
                                <h2 className="text-xl font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Database className="w-6 h-6" /> Centro de Auditoría Forense
                                </h2>
                                <p className="text-slate-400 text-sm">El Historial alberga miles de transacciones operativas a lo largo de los años. Utiliza estas armas analíticas para auditar la producción de perfiles o calcular ingresos generales.</p>
                            </div>

                            <AccordionItem id="hist-filtros" title="Filtrado Potente Múltiple" icon={Calendar} color="blue">
                                <ul className="list-disc pl-5 mt-2 space-y-3">
                                    <li><strong>Filtro por Semanas/Fechas:</strong> Selecciona en el calendario interactivo. Fundamental para Contabilidad e IVA mensual.</li>
                                    <li><strong>Filtro por Nombre Asesor / Cliente:</strong> Busca un nombre. El campo descarta la "basura" visual y muestra exactamente la ID y PDF emitido por ese funcionario.</li>
                                    <li><strong>Criterio de Cotización:</strong> Podrás organizar el listado para ver solo Quinceañeras, o discriminar para revisar únicamente los Eventos Corporativos.</li>
                                </ul>
                            </AccordionItem>

                            <AccordionItem id="hist-export" title="Descarga de Documentación Gerencial (Export CSV & Gráfico PDf)" icon={Download} color="emerald">
                                <p>Capacidad de extracción analítica pura de datos restringidos.</p>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold"><Database className="w-5 h-5" /> Exportar CSV Formateado</div>
                                        <p className="text-xs text-slate-400 leading-relaxed">Extrae la tabla cruda sin embellecer. Ideal para Contabilidad externa y revisiones en Microsoft Excel. Demuestra la estructura total de cada viaje sumando todos los valores con fórmulas.</p>
                                    </div>
                                    <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl">
                                        <div className="flex items-center gap-2 mb-2 text-blue-400 font-bold"><FileText className="w-5 h-5" /> Informe Ejecutivo Visual (PDF)</div>
                                        <p className="text-xs text-slate-400 leading-relaxed">Transmuta los filtros aplicados en <strong>Gráficas de métricas visuales.</strong> Descarga un compendio formal de tortas gráficas y sumatorias de productividad ideal para reuniones directivas intempestivas.</p>
                                    </div>
                                </div>
                            </AccordionItem>
                        </>
                    )}

                    {/* TAB: DICCIONARIO DE FOLIOS */}
                    {activeTab === 'diccionario' && (
                        <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50">
                            <div className="flex items-center gap-3 text-amber-500 mb-2">
                                <AlertCircle className="w-6 h-6" />
                                <h2 className="text-2xl font-black text-white">Manual Preventivo Múltiple de Errores (Folios)</h2>
                            </div>
                            <p className="text-sm text-slate-400 mb-6 font-mono leading-relaxed bg-slate-900/80 border border-slate-700/80 p-4 rounded-xl shadow-inner mt-4">
                                Toda venta tiene un pasaporte inalterable que la persigue durante los 5 pasos sin mutar jamás, configurado así:<br /><br />
                                <span className="bg-slate-800 px-2 py-1 rounded shadow-sm text-slate-300 mr-2 border border-slate-700 text-xs">PREFIJO</span>
                                <span className="text-blue-400 text-xs">-</span>
                                <span className="bg-slate-800 px-2 py-1 rounded shadow-sm text-amber-400 font-bold mr-2 border border-amber-900/50 text-xs">CLAVE (Tipo_Cotización)</span>
                                <span className="text-emerald-400 font-bold mr-2 text-xs">AÑO</span>
                                <span className="text-blue-400 text-xs">-</span>
                                <span className="text-pink-400 font-black tracking-widest text-xs">NUMERACIÓN</span><br />
                            </p>

                            <div className="overflow-x-auto rounded-xl border border-slate-700/50 shadow-2xl">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-slate-900 text-slate-200 font-black uppercase text-[10px] tracking-widest border-b border-slate-700">
                                        <tr>
                                            <th className="p-4 border-r border-slate-800 w-1/4">Sigla / Sub-Clave <span className="text-blue-400 text-[10px]">(Crucial)</span></th>
                                            <th className="p-4 border-r border-slate-800 w-1/2">Propósito Tácito (Módulo de Origen)</th>
                                            <th className="p-4 text-center">Identidad Total Visual (Ejemplo Real)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50 text-slate-300 font-medium">
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-blue-500/20 text-blue-400 font-bold px-3 py-1 rounded-lg border border-blue-500/30">NAC</span></td>
                                            <td className="p-4">Cotización Paquetes Nacionales</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-VAC-NAC2026-0034</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-indigo-500/20 text-indigo-400 font-bold px-3 py-1 rounded-lg border border-indigo-500/30">INT</span></td>
                                            <td className="p-4">Paquetería de Internacionales Extranjeros</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-COR-INT2026-0921</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-cyan-500/20 text-cyan-400 font-bold px-3 py-1 rounded-lg border border-cyan-500/30">TIQ</span></td>
                                            <td className="p-4">Tiquetes Aéreos Consolidados o Vuelos Individuales</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-VAC-TIQ2026-0150</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-fuchsia-500/20 text-fuchsia-400 font-bold px-3 py-1 rounded-lg border border-fuchsia-500/30">QUI</span></td>
                                            <td className="p-4">Planes Elite Prom/Quinceañeras</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-VAC-QUI2026-0005</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-orange-500/20 text-orange-400 font-bold px-3 py-1 rounded-lg border border-orange-500/30">GRP</span></td>
                                            <td className="p-4">Cotización Global de Grupos de Salida y Bloqueos</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-VAC-GRP2026-0744</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-rose-500/20 text-rose-400 font-bold px-3 py-1 rounded-lg border border-rose-500/30">EVE</span></td>
                                            <td className="p-4">Eventos Corporativos (MICE)</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-COR-EVE2026-0010</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-emerald-500/20 text-emerald-400 font-bold px-3 py-1 rounded-lg border border-emerald-500/30">ALO</span></td>
                                            <td className="p-4">Reservas Limitadas a Sólo Alojamiento Hotelero.</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-COR-ALO2026-0222</span></td>
                                        </tr>
                                        <tr className="hover:bg-slate-800/70 transition-colors">
                                            <td className="p-4 border-r border-slate-800"><span className="bg-amber-500/20 text-amber-400 font-bold px-3 py-1 rounded-lg border border-amber-500/30">VAC</span></td>
                                            <td className="p-4">Plan Tailor Made (Vacaciones a Tu Medida Absoluta)</td>
                                            <td className="p-4 text-center"><span className="bg-slate-900 text-slate-400 font-mono text-xs px-2 py-1 rounded border border-slate-700">COT-VAC-VAC2026-0561</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* TAB: NAVEGACION AVANZADA Y SOLUCION DE PROBLEMAS */}
                    {activeTab === 'navegacion' && (
                        <>
                            <div className="bg-slate-800/30 border border-emerald-500/20 rounded-2xl p-6 mb-2">
                                <h2 className="text-xl font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Keyboard className="w-6 h-6" /> Tácticas Profesionales y Prevención de Bugs
                                </h2>
                                <p className="text-slate-400 text-sm">Convertirte en un "Power User". El 85% de las quejas sobre plataformas provienen de un uso incorrecto de las teclas. Erradica esos errores leyendo esto.</p>
                            </div>

                            <AccordionItem id="nav-tab" title="Conducción en Tabulación Continua (Súper Velocidad)" icon={Keyboard} color="rose">
                                <div className="p-4 border border-rose-500/30 bg-rose-500/10 rounded-xl mb-4">
                                    <h4 className="font-bold text-rose-400 mb-2">El Problema Nuclear: (Presionar Enter Irresponsablemente)</h4>
                                    <p className="text-slate-300 text-sm">Mientras escribes rápidamente un Cédula o un precio de Ticket en los formularios, tienes el mal hábito de intentar avanzar o salir de la caja oprimir la tecla <strong>ENTER ↵</strong>.</p>
                                    <p className="font-bold mt-2 text-white">CONSECUENCIA (Crash de Formulario): La web parpadea fugazmente y te devuelve hasta el título más alto de la página, desorientándote por Completo.</p>
                                </div>
                                <div className="p-5 border border-emerald-500/30 bg-emerald-500/10 rounded-xl">
                                    <h4 className="font-bold text-emerald-400 mb-2 text-lg">La Solución Profesional: "Teclado Blindado"</h4>
                                    <p className="text-slate-300 mb-4">Retira tu mano izquierda del Mouse completamente. Tus dedos solo pueden desplazarse con los botones asignados al algoritmo de focus interno de HTML.</p>
                                    <ul className="list-disc pl-5 space-y-3 font-medium text-white">
                                        <li>Para <strong>AVANZAR</strong> al siguiente micro-campo: Pulsar suavemente <kbd className="text-emerald-400 bg-slate-900 px-3 shadow flex items-center gap-2 py-1 rounded border border-emerald-500/50 font-mono text-xs w-fit inline-flex mx-1">TAB ⇥</kbd>.</li>
                                        <li>Para <strong>DEVOLVERSE</strong> a corregir un saldo sin tocar el clic: Mantener presionado <kbd className="text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-600 font-mono text-xs w-fit inline-flex mx-1">SHIFT ⇧</kbd> + <kbd className="text-emerald-400 bg-slate-900 px-3 py-1 shadow flex items-center rounded border border-emerald-500/50 font-mono text-xs w-fit inline-flex mx-1">TAB ⇥</kbd>.</li>
                                    </ul>
                                </div>
                            </AccordionItem>

                            <AccordionItem id="nav-sin-cliente" title="La Contradicción Peligrosa: Cotizaciones Fantasma" icon={AlertCircle} color="amber">
                                <div className="space-y-4">
                                    <p className="text-slate-300">Si un funcionario navega el sistema y al generar reportes encuentra lotes vacíos donde se muestra: <strong>"Sin Cliente | Sin Destino"</strong>. Se genera basura en el disco duro transaccional.</p>
                                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-inner text-amber-100">
                                        <p className="font-black text-amber-400 uppercase tracking-widest text-sm mb-2">¿Cómo cometen el crimen asíncrono?</p>
                                        El auto-guardador de Supabase está diseñado para registrar el portafolio cada vez que pulsas Descargar o cada equis minutos. Si armas tu paquete <strong>empezando por el Alojamiento y Vuelos</strong> antes de dignarte a tipiar el Nombre del Solicitante... el sistema empujará ciegamente el registro vacío, porque obedeció tu PDF antes de alimentarse de la cabecera del cliente. <strong>DIGITA EL NOMBRE DEL CLIENTE SIEMPRE EN EL SEGUNDO CERO.</strong>
                                    </div>
                                </div>
                            </AccordionItem>

                        </>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default HelpSection;
