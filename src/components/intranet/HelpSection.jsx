import React, { useState } from 'react';
import {
    Book,
    Shield,
    Users,
    Hash,
    DollarSign,
    FileText,
    CheckCircle,
    AlertCircle,
    LifeBuoy,
    ChevronRight,
    Search,
    UserCircle,
    Building2,
    Settings,
    Clock,
    Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const HelpSection = ({ userRole, advisorName }) => {
    const [activeTab, setActiveTab] = useState('general');

    const sections = [
        { id: 'general', title: 'Lógica General', icon: Book },
        { id: 'roles', title: 'Guía por Roles', icon: Users },
        { id: 'tutorials', title: 'Tutoriales', icon: FileText },
        { id: 'support', title: 'Soporte', icon: LifeBuoy },
    ];

    const InfoCard = ({ title, children, icon: Icon, color = "blue" }) => (
        <div className={`bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 h-full`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
                    <Icon className={`w-5 h-5 text-${color}-400`} />
                </div>
                <h3 className="text-white font-bold">{title}</h3>
            </div>
            <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                {children}
            </div>
        </div>
    );

    const RoleBadge = ({ role }) => (
        <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-bold rounded uppercase tracking-wider">
            {role}
        </span>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Book className="w-8 h-8 text-blue-400" /> Centro de Ayuda Integral
                    </h1>
                    <p className="text-slate-400 max-w-2xl">
                        Bienvenida al manual oficial de Destinos P&P. Aquí encontrarás todo lo necesario para dominar el sistema, segmentado según tus responsabilidades.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-2xl border border-slate-700">
                    <UserCircle className="w-5 h-5 text-blue-400" />
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Sesión Actual</p>
                        <p className="text-xs text-white font-mono">{advisorName} ({userRole})</p>
                    </div>
                </div>
            </header>

            {/* Navigation tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-slate-700/50 w-fit">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === section.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <section.icon className="w-4 h-4" />
                        {section.title}
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
                >
                    {activeTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InfoCard title="Lógica del Folio Único" icon={Hash} color="blue">
                                <p>El Folio es el código de identidad inalterable de cada operación comercial. Sigue este ciclo vital:</p>
                                <ul className="space-y-4 pt-2">
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                        <div>
                                            <p className="font-bold text-slate-200">Cotización (COT):</p>
                                            <p className="text-xs text-slate-400">Se genera automáticamente al iniciar una propuesta. Es un borrador dinámico.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                        <div>
                                            <p className="font-bold text-slate-200">Confirmación (CONF):</p>
                                            <p className="text-xs text-slate-400">Al pulsar "Aceptar", el sistema pide el folio COT para vincular los datos y bloquearlos en la base de datos.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                        <div>
                                            <p className="font-bold text-slate-200">Tickets/Voucher:</p>
                                            <p className="text-xs text-slate-400">Utiliza el mismo folio para emitir los documentos finales de viaje.</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                    <p className="text-[11px] text-amber-200 italic">El sistema no permite saltarse el orden de folios para garantizar la trazabilidad de auditoría.</p>
                                </div>
                            </InfoCard>

                            <InfoCard title="Regla de Moneda Única (USD)" icon={DollarSign} color="emerald">
                                <p>Para eliminar errores de conversión y disputas por TRM, el sistema opera **exclusivamente en Dólares Americanos (USD)**.</p>
                                <div className="space-y-3 mt-4">
                                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                        <p className="font-bold text-emerald-400 mb-1">Impacto en Cotizaciones:</p>
                                        <p className="text-xs">Todos los campos de precio (Adultos, Niños, Extras) deben llenarse en USD.</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                        <p className="font-bold text-emerald-400 mb-1">TRM Informativa:</p>
                                        <p className="text-xs text-slate-400">Se muestra una TRM general en el encabezado solo como referencia de mercado, pero no afecta los cálculos matemáticos del sistema.</p>
                                    </div>
                                </div>
                                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-[11px] text-blue-200 italic">Esto facilita el recaudo internacional y la liquidación de proveedores globales.</p>
                                </div>
                            </InfoCard>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="space-y-6">
                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                                <div className="bg-slate-700/30 p-4 border-b border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <UserCircle className="w-5 h-5 text-blue-400" />
                                        <h3 className="text-white font-bold">Módulo Vacacional <RoleBadge role="Sandra" /></h3>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enfoque de Ventas</p>
                                        <ul className="space-y-3 text-sm">
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                <span>Uso exclusivo de marca **Destinos P&P**.</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                <span>Configuración de cruceros, hoteles y planes turísticos.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Procedimiento</p>
                                        <p className="text-xs leading-relaxed">
                                            Sandra debe asegurar que todas las inclusiones (traslados, tours) estén detalladas en la sección de "Incluye". El sistema generará automáticamente un PDF con el sello oficial de Destinos P&P y su firma digital personal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                                <div className="bg-slate-700/30 p-4 border-b border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-amber-400" />
                                        <h3 className="text-white font-bold">Módulo Corporativo <RoleBadge role="Juliana / Jenniffer" /></h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                                        <div className="space-y-4">
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Identidad Dual</p>
                                            <p className="text-sm">Al seleccionar un cliente corporativo (ej. Syscom o Sonreír), el sistema activará automáticamente el **Logo Dual** en el PDF.</p>
                                        </div>
                                        <div className="space-y-4">
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Estructura de Tickets</p>
                                            <p className="text-xs">El módulo de Tickets requiere completar **4 bloques críticos**:</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {['Identificación', 'Pasajero', 'Itinerario', 'Financiero'].map((bloque, idx) => (
                                            <div key={idx} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 text-center">
                                                <p className="text-xs font-bold text-white">{bloque}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                                <div className="bg-slate-700/30 p-4 border-b border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-white font-bold">Panel Administrador <RoleBadge role="Gerencia" /></h3>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 bg-slate-900/30 rounded-xl border border-purple-500/20">
                                        <p className="font-bold text-sm text-purple-400 mb-2">Supervisión</p>
                                        <p className="text-xs text-slate-400">Acceso global a todas las cotizaciones del equipo en tiempo real.</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/30 rounded-xl border border-purple-500/20">
                                        <p className="font-bold text-sm text-purple-400 mb-2">Auditoría</p>
                                        <p className="text-xs text-slate-400">Logs detallados de quién modificó qué y cuándo.</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/30 rounded-xl border border-purple-500/20">
                                        <p className="font-bold text-sm text-purple-400 mb-2">Reportes</p>
                                        <p className="text-xs text-slate-400">Exportación a CSV y Cierre de Mes automático.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tutorials' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-white font-bold">Firma Automática</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    No necesitas agregar tu firma. El sistema vincula tu **Nombre** y **Cargo** desde tu perfil de usuario al pie de cada documento PDF generado. Verifica que tus datos sean correctos en:
                                    <br /><br />
                                    <span className="text-blue-400 font-mono">Avatar {"->"} Configuración {"->"} Datos Personales</span>
                                </p>
                            </div>

                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h3 className="text-white font-bold">Guardar en Base de Datos</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Para que una venta sea contabilizada en los reportes de gerencia, **DEBES** pulsar el botón **"Confirmar Reserva"**.
                                    <br /><br />
                                    <span className="text-emerald-400 font-bold">IMPORTANTE:</span> Generar solo el PDF no guarda la información en Supabase.
                                </p>
                            </div>

                            <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Key className="w-6 h-6 text-purple-400" />
                                </div>
                                <h3 className="text-white font-bold">Seguridad de Perfil</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Puedes cambiar tu contraseña en cualquier momento desde el panel de **Perfil**. Se recomienda usar una combinación de letras, números y símbolos para proteger tu acceso.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="max-w-4xl mx-auto bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-4 text-amber-400">
                                    <AlertCircle className="w-6 h-6" />
                                    <h2 className="text-xl font-bold">Solución de Problemas (Troubleshooting)</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-blue-400" /> El sistema está "lento" o no carga
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Esto suele ser un problema de caché del navegador. Realiza una **limpieza forzada** presionando:
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <kbd className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white">Ctrl</kbd>
                                            <span className="text-slate-500">+</span>
                                            <kbd className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white">F5</kbd>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-white font-bold flex items-center gap-2">
                                            <Users className="w-4 h-4 text-emerald-400" /> Mi sesión se cerró sola
                                        </h4>
                                        <p className="text-xs text-slate-400">
                                            Por seguridad, el sistema valida la sesión cada 2 horas. Si esto ocurre, simplemente vuelve a ingresar tus credenciales. La información que no hayas guardado podría perderse.
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-700/50 text-center space-y-4">
                                    <p className="text-sm text-slate-300">¿Aún tienes dudas técnicas o encontraste un bug?</p>
                                    <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all flex items-center gap-2 mx-auto">
                                        <LifeBuoy className="w-5 h-5" /> Contactar Soporte Técnico
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default HelpSection;
