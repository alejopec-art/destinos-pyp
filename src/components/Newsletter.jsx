import React from 'react';
import { Send, Plane } from 'lucide-react';

const Newsletter = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-br from-[#000080] to-[#1a1a40]">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
                 {/* Abstract World Map Dots or Lines could go here, simplified with blobs for now */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse opacity-30"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl animate-pulse delay-1000 opacity-20"></div>
            </div>

            {/* Travel Path Animation */}
            <svg className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 opacity-10 pointer-events-none" preserveAspectRatio="none">
                <path 
                    d="M0,50 Q250,0 500,50 T1000,50 T1500,50" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeDasharray="10 10"
                    className="animate-[dash_20s_linear_infinite]"
                />
            </svg>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-[2.5rem] p-8 md:p-12 border border-white/20 shadow-2xl relative overflow-hidden group">
                    {/* Floating Paper Plane */}
                    <div className="absolute top-10 right-10 text-white/20 transform rotate-12 group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-1000">
                        <Plane size={120} />
                    </div>

                    <div className="relative z-10 text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-bold tracking-widest uppercase mb-6 border border-[#D4AF37]/30">
                            Newsletter
                        </span>
                        
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                            Tu próxima aventura <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">empieza aquí</span>
                        </h2>
                        
                        <p className="text-blue-100 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                            Únete a nuestra comunidad exclusiva de viajeros. Recibe guías secretas, descuentos especiales y la inspiración que necesitas.
                        </p>

                        <form className="flex flex-col md:flex-row gap-4 max-w-lg mx-auto relative">
                            <div className="flex-1 relative group/input">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#000080] rounded-full blur opacity-25 group-hover/input:opacity-50 transition-opacity duration-300"></div>
                                <input
                                    type="email"
                                    placeholder="Ingresa tu correo electrónico"
                                    className="relative w-full px-8 py-4 rounded-full bg-white/90 backdrop-blur text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] border-none shadow-lg transition-all duration-300"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="relative bg-gradient-to-r from-[#D4AF37] to-[#b5952f] text-white font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-[#D4AF37]/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 group/btn overflow-hidden"
                            >
                                <span className="relative z-10">Suscribirse</span>
                                <Send className="w-5 h-5 relative z-10 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            </button>
                        </form>

                        <p className="mt-8 text-sm text-blue-200/80 flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                            Sin spam, solo aventuras. Cancela cuando quieras.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;