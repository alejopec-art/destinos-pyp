import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

const posts = [
    {
        id: 1,
        title: '10 Consejos para viajar ligero',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
        date: '12 Oct, 2023',
        author: 'Admin',
        excerpt: 'Descubre cómo empacar todo lo necesario en una sola maleta de mano sin sacrificar estilo.'
    },
    {
        id: 2,
        title: 'Los mejores destinos ocultos de Europa',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80',
        date: '05 Nov, 2023',
        author: 'Admin',
        excerpt: 'Aléjate de las multitudes y explora estos rincones mágicos que pocos turistas conocen.'
    },
    {
        id: 3,
        title: 'Guía gastronómica de Japón',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        date: '20 Nov, 2023',
        author: 'Admin',
        excerpt: 'Desde sushi callejero hasta restaurantes con estrellas Michelin, aquí tienes qué comer.'
    }
];

const Blog = () => {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
             {/* Decorative Background Elements */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <span className="text-[#D4AF37] font-bold tracking-widest uppercase text-sm mb-2 block">Nuestro Blog</span>
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#000080] mb-4">Últimas Noticias</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg">Inspiración, consejos y guías para hacer de tu próxima aventura una experiencia inolvidable.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {posts.map((post, index) => (
                        <div 
                            key={post.id} 
                            className="group bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col hover:-translate-y-2"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <div className="absolute inset-0 bg-[#000080]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                />
                                {/* Floating Date Badge */}
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md z-20 flex items-center gap-2 transform group-hover:translate-x-2 transition-transform duration-300">
                                    <Calendar className="w-4 h-4 text-[#D4AF37]" />
                                    <span className="text-xs font-bold text-[#000080] uppercase tracking-wider">{post.date}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 flex flex-col flex-grow relative">
                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-4 uppercase tracking-wider">
                                    <User className="w-3 h-3 text-[#D4AF37]" />
                                    <span>Por {post.author}</span>
                                </div>
                                
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-[#000080] transition-colors duration-300">
                                    {post.title}
                                </h3>
                                
                                <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-grow">
                                    {post.excerpt}
                                </p>

                                <div className="pt-6 border-t border-gray-100 flex items-center justify-between group/btn">
                                    <span className="text-[#000080] font-bold text-sm uppercase tracking-wide group-hover/btn:text-[#D4AF37] transition-colors duration-300">Leer Artículo</span>
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[#000080] transition-colors duration-300">
                                        <ArrowRight className="w-5 h-5 text-[#000080] group-hover:text-white transform group-hover:translate-x-1 transition-all duration-300" />
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

export default Blog;