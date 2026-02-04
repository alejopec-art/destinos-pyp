import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <section id="contact" className="py-24 relative overflow-hidden bg-slate-50">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-[#000080] text-xs font-bold tracking-widest uppercase mb-4">
                        Contáctanos
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
                        Hablemos de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000080] to-blue-600">próxima aventura</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Estamos aquí para hacer realidad tus sueños de viaje. Escríbenos y comencemos a planear.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Contact Info Cards */}
                    <div className="space-y-8">
                        <div className="group relative bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="relative z-10 flex items-start gap-6">
                                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-[#000080] group-hover:bg-[#000080] group-hover:text-white transition-colors duration-500 shadow-sm group-hover:shadow-blue-500/30 group-hover:rotate-6">
                                    <Phone className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Llámanos</h3>
                                    <p className="text-gray-600 mb-1">Estamos disponibles 24/7</p>
                                    <a href="tel:+573017636478" className="text-lg font-semibold text-[#000080] hover:text-blue-600 transition-colors">
                                        +57 301 763 6478
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="relative z-10 flex items-start gap-6">
                                <div className="w-14 h-14 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-colors duration-500 shadow-sm group-hover:shadow-[#D4AF37]/30 group-hover:rotate-6">
                                    <Mail className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Escríbenos</h3>
                                    <p className="text-gray-600 mb-1">Respondemos en menos de 2h</p>
                                    <a href="mailto:viajes@destinospp.com" className="text-lg font-semibold text-[#000080] hover:text-blue-600 transition-colors">
                                        viajes@destinospp.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="group relative bg-white p-8 rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700"></div>
                            <div className="relative z-10 flex items-start gap-6">
                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-gray-800 group-hover:text-white transition-colors duration-500 shadow-sm group-hover:shadow-gray-500/30 group-hover:rotate-6">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Visítanos</h3>
                                    <p className="text-gray-600 mb-1">Ven a tomar un café</p>
                                    <p className="text-lg font-semibold text-[#000080]">
                                        Bogotá, Colombia
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#000080] to-[#D4AF37] rounded-[2.5rem] blur-lg opacity-30 animate-pulse"></div>
                        <div className="relative bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/50">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-2">Nombre</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all duration-300 hover:bg-white"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-2">Teléfono</label>
                                        <input 
                                            type="tel" 
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all duration-300 hover:bg-white"
                                            placeholder="+57 ..."
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-2">Correo Electrónico</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all duration-300 hover:bg-white"
                                        placeholder="juan@ejemplo.com"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-2">Mensaje</label>
                                    <textarea 
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 outline-none transition-all duration-300 hover:bg-white h-32 resize-none"
                                        placeholder="Cuéntanos sobre tu viaje ideal..."
                                    ></textarea>
                                </div>

                                <button 
                                    type="button" 
                                    className="w-full bg-gradient-to-r from-[#000080] to-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-blue-900/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden relative"
                                >
                                    <span className="relative z-10">Enviar Mensaje</span>
                                    <Send className="w-5 h-5 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;