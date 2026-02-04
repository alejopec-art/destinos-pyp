import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Escápate a Santorini",
    subtitle: "Vistas inolvidables y atardeceres mágicos",
    description: "Disfruta de 7 días en las islas griegas con todo incluido. Hoteles de lujo y tours privados.",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$1,800",
  },
  {
    id: 2,
    title: "Aventura en los Alpes",
    subtitle: "Nieve, esquí y confort en la montaña",
    description: "Paquete de invierno premium. Incluye pase de esquí, equipo y alojamiento en chalet.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$2,100",
  },
  {
    id: 3,
    title: "Magia en Tokio",
    subtitle: "Tradición y futuro en un solo lugar",
    description: "Explora Japón con guía en español. Templos, tecnología y gastronomía única.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$2,500",
  },
  {
    id: 4,
    title: "Paraíso en Maldivas",
    subtitle: "El descanso que mereces",
    description: "Bungalows sobre el agua, buceo y spa. La experiencia de relajación definitiva.",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    price: "$3,200",
  }
];

const FeaturedCarousel = () => {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[500px] group">
        
        {/* Slides */}
        {slides.map((slide, index) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image */}
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#000080]/90 via-[#000080]/40 to-transparent"></div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16 text-white max-w-2xl">
              <span className="inline-block px-3 py-1 bg-yellow-400 text-[#000080] rounded-full text-xs font-bold uppercase tracking-wider w-fit mb-4">
                Oferta Destacada
              </span>
              <h2 className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-md leading-tight">
                {slide.title}
              </h2>
              <p className="text-xl md:text-2xl font-light mb-6 text-blue-100">
                {slide.subtitle}
              </p>
              <p className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed max-w-lg">
                {slide.description}
              </p>
              
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm opacity-80">Desde</p>
                  <p className="text-3xl font-bold text-yellow-400">{slide.price}</p>
                </div>
                <button className="bg-white text-[#000080] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2">
                  Ver Detalles <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition-all z-20 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full text-white transition-all z-20 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Dots Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === current ? 'bg-yellow-400 w-8' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel;