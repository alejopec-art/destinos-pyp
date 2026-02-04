import React from 'react';
import { Map, Package, Users, Award } from 'lucide-react';

const stats = [
    { value: '120+', label: 'Destinos Totales', icon: Map },
    { value: '500+', label: 'Paquetes de Viaje', icon: Package },
    { value: '12k+', label: 'Viajeros Felices', icon: Users },
    { value: '7+', label: 'Años de Experiencia', icon: Award }
];

const Stats = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-r from-[#000080] to-blue-900">
             {/* Background Animation */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    {stats.map((stat, index) => (
                        <div 
                            key={index} 
                            className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#D4AF37] p-4 rounded-2xl shadow-lg shadow-black/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                                <stat.icon className="w-8 h-8 text-white" />
                            </div>
                            
                            <div className="mt-8">
                                <div className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight group-hover:text-[#D4AF37] transition-colors duration-300">
                                    {stat.value}
                                </div>
                                <div className="h-1 w-12 bg-white/20 mx-auto rounded-full mb-4 group-hover:w-24 group-hover:bg-[#D4AF37] transition-all duration-500"></div>
                                <div className="text-lg font-medium text-blue-100 uppercase tracking-widest text-xs">
                                    {stat.label}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;