import React from 'react';
import { Clock, Users, ArrowRight, Star, Heart } from 'lucide-react';

const tours = [
  {
    id: 1,
    title: 'Tour de vacaciones en México',
    days: 7,
    people: 5,
    description: 'Disfruta de las playas vírgenes, la deliciosa gastronomía y la vibrante cultura mexicana en un viaje inolvidable.',
    price: '$3,200',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'De la Amazonía a los Andes',
    days: 11,
    people: 5,
    description: 'Una aventura épica atravesando selvas tropicales y montañas majestuosas. Conecta con la naturaleza.',
    price: '$3,400',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=2000&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Senderismo en el Mont Blanc',
    days: 4,
    people: 5,
    description: 'Desafía tus límites con vistas panorámicas de los Alpes. Ideal para amantes del trekking y la fotografía.',
    price: '$2,190',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80', // Updated mountain image
  },
];

const Tours = () => {
  return (
    <section className="py-24 px-4 bg-slate-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-20 -left-20 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-20 -right-20 w-96 h-96 bg-yellow-100/40 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          <span className="text-[#000080] font-bold tracking-widest uppercase text-sm mb-2 block">Experiencias Únicas</span>
          <h2 className="text-5xl font-serif font-bold text-gray-900 mb-6">Los Mejores Tours</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#D4AF37] to-yellow-200 mx-auto rounded-full mb-6"></div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Ofertas increíbles para los tours más espectaculares alrededor del mundo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tours.map((tour) => (
            <div key={tour.id} className="group relative bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden border border-gray-100">
              
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={tour.image} 
                  alt={tour.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#000080] flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {tour.rating}
                </div>
                
                <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 transition-colors text-white">
                    <Heart className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-2xl font-bold font-serif">{tour.price}</p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#000080] transition-colors leading-tight">
                  {tour.title}
                </h3>
                
                <div className="flex items-center gap-6 text-gray-500 text-sm mb-6 border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-blue-800">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{tour.days} días</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Max: {tour.people}</span>
                  </div>
                </div>
                
                <p className="text-gray-500 leading-relaxed mb-6 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                  {tour.description}
                </p>
                
                <button className="w-full py-4 rounded-xl border-2 border-[#000080] text-[#000080] font-bold flex items-center justify-center gap-2 group-hover:bg-[#000080] group-hover:text-white transition-all duration-300">
                  RESERVAR AHORA
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tours;