import React, { useState } from 'react';
import { MessageCircle, Mail, Headphones, FileText, Send, X, AlertCircle, Clock, ShieldCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Contact = () => {
    const [isPQRModalOpen, setIsPQRModalOpen] = useState(false);
    const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormStatus('submitting');
        // Simulate sending
        setTimeout(() => {
            setFormStatus('success');
            setTimeout(() => {
                setIsPQRModalOpen(false);
                setFormStatus('idle');
            }, 2000);
        }, 1500);
    };

    const cards = [
        {
            id: 1,
            title: "WhatsApp (Ventas)",
            desc: "Asesoría inmediata para tus viajes",
            icon: MessageCircle,
            color: "text-green-600",
            bgIcon: "bg-green-100",
            border: "border-green-100",
            shadow: "hover:shadow-green-200",
            action: () => window.open('https://wa.me/573017636478', '_blank'),
            hasButton: false,
            colSpan: "md:col-span-1"
        },
        {
            id: 2,
            title: "Correo (Institucional)",
            desc: "gerencia@destinospp.com",
            icon: Mail,
            color: "text-blue-600",
            bgIcon: "bg-blue-100",
            border: "border-blue-100",
            shadow: "hover:shadow-blue-200",
            action: () => window.location.href = 'mailto:gerencia@destinospp.com',
            hasButton: false,
            colSpan: "md:col-span-1"
        },
        {
            id: 4,
            title: "PQR (Peticiones, Quejas y Reclamos)",
            desc: "Canal formal para radicar tus solicitudes bajo normas legales",
            icon: FileText,
            color: "text-amber-600",
            bgIcon: "bg-amber-100",
            border: "border-amber-100",
            shadow: "hover:shadow-amber-200",
            action: () => setIsPQRModalOpen(true),
            hasButton: true,
            btnText: "Radicar aquí",
            colSpan: "md:col-span-1"
        }
    ];

    return (
        <section id="contact" className="py-24 relative overflow-hidden bg-slate-50">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-[#000080] text-xs font-bold tracking-widest uppercase mb-4">
                        Canales de Atención
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                        Estamos <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000080] to-blue-600">Conectados</span> Contigo
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Elige el canal de tu preferencia para una atención ágil y personalizada.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Support Card (Replaces Soporte 24/7) */}
                    <motion.div 
                        whileHover={{ y: -5 }}
                        className="md:col-span-3 bg-[#1e293b] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden border border-slate-700/50 group"
                    >
                        {/* Glassmorphism & Background */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>

                        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-600/30 flex items-center justify-center border border-blue-500/50">
                                        <Users className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Asesoría y asistencia antes y durante tu viaje</h3>
                                </div>
                                <p className="text-blue-200 font-medium mb-4 text-lg">
                                    Estamos contigo en cada paso de tu aventura ✈️
                                </p>
                                <p className="text-slate-300 leading-relaxed mb-6">
                                    Te brindamos acompañamiento personalizado antes y durante tu viaje para que te sientas tranquilo y bien respaldado en todo momento.
                                </p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                                        <Clock className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-emerald-400 font-bold text-sm mb-1 uppercase tracking-wider">Horarios de Atención</p>
                                            <p className="text-slate-300 text-sm">
                                                Lunes a Viernes: 8:00 a.m. - 6:00 p.m. <br/>
                                                Sábados: 9:00 a.m. - 12:00 p.m.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 bg-blue-900/20 p-4 rounded-xl border border-blue-500/30">
                                        <ShieldCheck className="w-5 h-5 text-blue-400 mt-1 shrink-0" />
                                        <div>
                                            <p className="text-blue-400 font-bold text-sm mb-1 uppercase tracking-wider">Soporte en Viaje</p>
                                            <p className="text-blue-100 text-sm italic">
                                                "Y cuando ya estés viajando, cuentas con atención 24 horas para cualquier imprevisto. Viaja con la seguridad de saber que siempre estamos para ti."
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative h-full min-h-[300px] rounded-2xl overflow-hidden hidden md:block">
                                <img 
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80" 
                                    alt="Customer Support" 
                                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    </motion.div>

                    {cards.map((card) => (
                        <motion.div
                            key={card.id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className={`relative group bg-white border border-gray-100 p-8 rounded-[2rem] flex flex-col items-start h-full shadow-lg hover:shadow-2xl ${card.shadow} transition-all duration-300 cursor-pointer overflow-hidden ${card.colSpan}`}
                            onClick={card.action}
                        >
                             <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-bl-[80px] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700 z-0"></div>
                            
                            <div className={`relative z-10 w-14 h-14 rounded-2xl ${card.bgIcon} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <card.icon className={`w-7 h-7 ${card.color}`} />
                            </div>
                            
                            <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-2 leading-tight">{card.title}</h3>
                            <p className="relative z-10 text-gray-600 text-sm mb-6 flex-grow">{card.desc}</p>
                            
                            {card.hasButton && (
                                <button className="relative z-10 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm shadow-lg hover:shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 mt-auto">
                                    {card.btnText}
                                    <Send className="w-4 h-4" />
                                </button>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Footer Logo & RNT */}
                <div className="mt-24 pt-12 border-t border-gray-200/60 text-center relative flex flex-col md:flex-row items-center justify-center gap-12">
                    
                    {/* Logo Card - Left */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                            <img src="/logo-destinos.png" alt="Destinos P&P Logo" className="h-32 w-auto object-contain drop-shadow-sm" />
                        </div>
                    </div>
                    
                    {/* Info Card - Right - Glass Elegance */}
                    <div className="relative max-w-2xl w-full">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-[2.5rem] blur-xl opacity-50"></div>
                        <div className="relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-500">
                            {/* Border Beam Effect */}
                            <div className="absolute inset-0 rounded-[2.5rem] border border-white/50 pointer-events-none"></div>
                            <div className="absolute inset-0 rounded-[2.5rem] border border-gradient-to-r from-transparent via-blue-200/50 to-transparent opacity-50 pointer-events-none"></div>

                            <div className="flex flex-col items-center gap-6">
                                <h3 className="text-slate-800 font-bold text-lg tracking-wide font-sans">
                                    Destinos P&P es una marca de Trilogía Tour & Travel S.A.S.
                                </h3>
                                
                                <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
                                    {/* NIT Pill */}
                                    <div className="flex items-center gap-3 bg-slate-50/80 px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm hover:border-blue-200 transition-colors group cursor-default">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.4)]"></div>
                                        <span className="text-slate-600 font-medium text-sm tracking-wide">NIT: 901721152-3</span>
                                    </div>

                                    {/* RNT Pill */}
                                    <div className="flex items-center gap-3 bg-slate-50/80 px-5 py-3 rounded-2xl border border-slate-200/60 shadow-sm hover:border-emerald-200 transition-colors group cursor-default">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                                        <span className="text-slate-600 font-medium text-sm tracking-wide">RNT: 175012 – 175017 – 175075</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PQR Modal */}
            <AnimatePresence>
                {isPQRModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsPQRModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5" /> Radicar PQR
                                </h3>
                                <button onClick={() => setIsPQRModalOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Form */}
                            <div className="p-6 md:p-8">
                                {formStatus === 'success' ? (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                            <Send className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">¡Solicitud Radicada!</h4>
                                        <p className="text-gray-600">Hemos recibido tu PQR. Te responderemos pronto.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Nombre Completo</label>
                                                <input required type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Tu nombre" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">ID Reserva</label>
                                                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" placeholder="Ej: REF-1234" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo de Solicitud</label>
                                            <select className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all">
                                                <option>Petición</option>
                                                <option>Queja</option>
                                                <option>Reclamo</option>
                                                <option>Felicitación</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Mensaje</label>
                                            <textarea required rows="4" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all resize-none" placeholder="Describe tu solicitud..."></textarea>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={formStatus === 'submitting'}
                                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                        >
                                            {formStatus === 'submitting' ? 'Radicando...' : 'Radicar Solicitud'}
                                        </button>
                                        
                                        <div className="flex items-start gap-2 mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-xs text-blue-700">Tus datos serán tratados según nuestra política de privacidad y ley de protección de datos.</p>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Contact;