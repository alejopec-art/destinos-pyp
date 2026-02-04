import React, { useState, useEffect } from 'react';
import SearchBox from './SearchBox';

const videos = [
  { src: 'https://videos.pexels.com/video-files/3209828/3209828-uhd_2560_1440_25fps.mp4', duration: 12000 },
  { src: 'https://videos.pexels.com/video-files/4133023/4133023-uhd_3840_2160_30fps.mp4', duration: 19000 }
];

const Hero = () => {
  const [currentVideo, setCurrentVideo] = useState(0);

  useEffect(() => {
    // Configura el temporizador basado en la duración del video actual
    const timer = setTimeout(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length);
    }, videos[currentVideo].duration);
    
    return () => clearTimeout(timer);
  }, [currentVideo]);

  return (
    <section className="relative w-full h-screen min-h-[600px] flex flex-col">
      {/* Background Videos with Transition */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {videos.map((video, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-2000 ease-in-out ${
              index === currentVideo ? 'opacity-100' : 'opacity-0'
            }`}
          >
             <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
             >
                <source src={video.src} type="video/mp4" />
                {/* Fallback para .mov si el usuario usa ese formato renombrado */}
                <source src={video.src.replace('.mp4', '.mov')} type="video/quicktime" />
             </video>
          </div>
        ))}
         {/* Overlay */}
         <div className="absolute inset-0 bg-black/40 z-10"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 mt-16 animate-fade-in-up">
        <h2 className="text-sm md:text-base font-bold text-white uppercase tracking-widest mb-4 drop-shadow-md">
          ¿CUÁL SERÁ EL PRÓXIMO PAÍS?
        </h2>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 drop-shadow-lg max-w-4xl leading-tight">
          Tus sueños, nuestro destino
        </h1>
        <button className="bg-[#D4AF37] hover:bg-[#b5952f] text-white font-bold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl">
          RESERVA TU VIAJE
        </button>
      </div>

      {/* Search Box Integration */}
      <div className="w-full absolute bottom-0 transform translate-y-1/2 z-30 px-4">
         <SearchBox />
      </div>
    </section>
  );
};

export default Hero;
