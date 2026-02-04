import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
    {
        id: 1,
        name: 'María González',
        location: 'Madrid, España',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: '¡El mejor viaje de mi vida! La organización fue impecable y los destinos superaron todas mis expectativas. Definitivamente volveré a viajar con Destinos P&P.'
    },
    {
        id: 2,
        name: 'Carlos Rodríguez',
        location: 'Bogotá, Colombia',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        rating: 5,
        text: 'Atención personalizada las 24 horas. Tuvimos un pequeño inconveniente con un vuelo y lo solucionaron al instante. Muy recomendados.'
    },
    {
        id: 3,
        name: 'Ana Smith',
        location: 'Londres, UK',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        rating: 4,
        text: 'Excelentes precios y destinos exclusivos. Me encantó la guía turística en París. Una experiencia inolvidable para toda mi familia.'
    }
];

const Testimonials = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Animated Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse delay-1000"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <span className="text-[#000080] font-bold tracking-widest uppercase text-sm mb-3 block">Experiencias Reales</span>
                    <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Lo que dicen nuestros viajeros</h2>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-[#000080] to-[#D4AF37] mx-auto rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {testimonials.map((testimonial, index) => (
                        <div 
                            key={testimonial.id} 
                            className="group relative bg-white/80 backdrop-blur-lg p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-white/50"
                            style={{ animationDelay: `${index * 200}ms` }}
                        >
                            {/* Decorative Quote */}
                            <div className="absolute top-6 right-8 text-gray-100 group-hover:text-blue-50 transition-colors duration-300">
                                <Quote size={80} className="transform rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            className={`w-5 h-5 ${i < testimonial.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'} transition-transform duration-300 group-hover:scale-110`} 
                                        />
                                    ))}
                                </div>

                                <p className="text-gray-600 text-lg leading-relaxed mb-8 italic relative">
                                    "{testimonial.text}"
                                </p>

                                <div className="flex items-center gap-5 border-t border-gray-100 pt-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#000080] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="relative w-16 h-16 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl text-[#000080] group-hover:text-[#D4AF37] transition-colors duration-300">{testimonial.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">{testimonial.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;