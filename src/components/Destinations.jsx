import React from 'react';
import { ArrowRight, Plane } from 'lucide-react';

const destinations = [
  {
    id: 1,
    city: 'París',
    country: 'Francia',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    description: 'París es un centro mundial de arte, moda, gastronomía y cultura.'
  },
  {
    id: 2,
    city: 'Londres',
    country: 'Inglaterra',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
    description: 'Londres es una ciudad con una historia que se remonta a la época romana.'
  },
  {
    id: 3,
    city: 'Tokio',
    country: 'Japón',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
    description: 'Tokio, capital bulliciosa, mezcla lo ultramoderno con lo tradicional.'
  },
  {
    id: 4,
    city: 'Nueva York',
    country: 'Estados Unidos',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
    description: 'La ciudad de Nueva York comprende cinco distritos entre el océano.'
  }
];

const Destinations = () => {
  return (
    <section className="py-24 px-4 bg-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-yellow-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000"></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20 relative">
            {/* Floating Icon */}
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce duration-[3000ms]">
                <Plane className="w-10 h-10 text-[#D4AF37] opacity-80 rotate-45 drop-shadow-lg" />
            </div>

            <span className="text-[#D4AF37] font-bold tracking-[0.2em] uppercase text-sm mb-3 block">Descubre lo Inexplorado</span>
            <h2 className="text-5xl md:text-7xl font-serif font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#000080] via-blue-600 to-[#000080] drop-shadow-sm">
              Los mejores destinos
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-[#D4AF37] to-yellow-200 mx-auto rounded-full mb-8 shadow-sm"></div>
            <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
              Viajar por el mundo ahora es mucho más fácil y divertido. Déjate llevar por la magia de estos lugares únicos.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {destinations.map((dest) => (
            <div key={dest.id} className="group relative h-[450px] w-full rounded-[2.5rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 hover:-translate-y-4">
              {/* Image Background */}
              <div className="absolute inset-0">
                <img 
                  src={dest.image} 
                  alt={`${dest.city}, ${dest.country}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#000080] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
              </div>
              
              {/* Floating Content Card */}
              <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-lg group-hover:bg-white/20 transition-all duration-500">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-yellow-300 text-xs font-bold tracking-wider uppercase mb-1 block drop-shadow-md">{dest.country}</span>
                            <h3 className="text-3xl font-bold text-white drop-shadow-md font-serif">{dest.city}</h3>
                        </div>
                    </div>
                    
                    <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500">
                        <div className="overflow-hidden">
                            <p className="text-gray-100 text-sm mb-4 leading-relaxed pt-2 border-t border-white/20 mt-2">
                                {dest.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide mt-2 group-hover:gap-3 transition-all duration-300">
                        <span>EXPLORAR</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-20">
            <button className="group relative px-10 py-5 bg-[#000080] text-white font-bold rounded-full overflow-hidden shadow-xl hover:shadow-blue-900/40 transition-all duration-300 hover:scale-105">
                <span className="relative z-10 flex items-center gap-3 text-lg tracking-wider">
                    VER TODOS LOS PAÍSES
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-[#000080] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
            </button>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
