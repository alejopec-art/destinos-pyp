import React from 'react';
import { MapPin, Star, Plane, CheckCircle2 } from 'lucide-react';

const Promo = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-blue-50 to-white overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="lg:w-1/2 space-y-8 relative">
            {/* Floating Badge */}
            <div className="absolute -top-12 -left-8 bg-white p-3 rounded-2xl shadow-xl animate-bounce duration-[3000ms] hidden lg:block">
                <div className="flex items-center gap-2">
                    <div className="bg-yellow-100 p-2 rounded-full">
                        <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Valoración</p>
                        <p className="font-bold text-gray-800">4.9/5.0</p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <h2 className="text-5xl lg:text-7xl font-serif font-bold text-[#000080] leading-tight">
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#000080] to-blue-600">Fin de semana</span>
                  <span className="relative inline-block mt-2">
                    en Londres
                    <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#D4AF37] opacity-60" viewBox="0 0 200 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.00025 6.99997C25.7501 2.99999 83.2354 -2.10086 197.222 7.00005" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </h2>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600 bg-white/60 backdrop-blur-sm p-3 rounded-full w-fit border border-white/40 shadow-sm">
              <div className="bg-blue-100 p-2 rounded-full">
                <MapPin className="w-5 h-5 text-[#000080]" />
              </div>
              <span className="font-medium tracking-wide">Europa, Reino Unido</span>
            </div>
            
            <p className="text-gray-600 leading-relaxed text-lg lg:text-xl font-light">
              Londres combina historia y modernidad. Desde la City romana hasta los vibrantes pueblos que la rodean, cada rincón cuenta una historia única esperando ser descubierta por ti.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="group relative bg-[#000080] text-white font-bold py-4 px-10 rounded-full overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300">
                    <span className="relative z-10 flex items-center gap-2">
                        RESERVAR AHORA
                        <Plane className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                </button>
                <button className="flex items-center gap-2 px-8 py-4 rounded-full border-2 border-[#000080]/20 font-bold text-[#000080] hover:bg-[#000080]/5 transition-colors">
                    VER DETALLES
                </button>
            </div>
          </div>
          
          {/* Image Content - "Portal" Effect */}
          <div className="lg:w-1/2 relative perspective-1000">
            <div className="relative z-10 transform transition-transform duration-700 hover:rotate-y-12 preserve-3d">
                {/* Main Image Container */}
                <div className="relative rounded-[3rem] overflow-hidden border-[6px] border-white shadow-2xl shadow-blue-900/20 group">
                    <img 
                        src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop" 
                        alt="London Big Ben" 
                        className="w-full h-[600px] object-cover transform group-hover:scale-110 transition-transform duration-1000"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000080]/60 via-transparent to-transparent opacity-60"></div>

                    {/* Interactive Hotspots */}
                    {[
                        { top: '30%', left: '40%', label: 'Big Ben' },
                        { top: '60%', left: '20%', label: 'Tower Bridge' },
                        { top: '50%', left: '70%', label: 'London Eye' }
                    ].map((spot, i) => (
                        <div key={i} className="absolute group/spot" style={{ top: spot.top, left: spot.left }}>
                            <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75 animate-ping"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D4AF37] border-2 border-white shadow-md"></span>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-lg opacity-0 group-hover/spot:opacity-100 transition-opacity whitespace-nowrap shadow-sm text-[#000080] transform translate-y-2 group-hover/spot:translate-y-0 duration-300">
                                {spot.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Elements around Image */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                
                {/* Floating Card: Price */}
                <div className="absolute bottom-12 -left-12 bg-white p-4 rounded-2xl shadow-xl animate-float">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2.5 rounded-full">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Desde</p>
                            <p className="text-xl font-black text-[#000080]">$ 4.500.000 COP</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Promo;
