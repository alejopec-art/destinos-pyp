import React from 'react';
import { BadgeDollarSign, CalendarCheck, Headphones, Gem } from 'lucide-react';

const features = [
  { 
    icon: BadgeDollarSign, 
    label: 'Mejores Precios',
    desc: 'Tarifas competitivas garantizadas para que viajes más por menos.'
  },
  { 
    icon: CalendarCheck, 
    label: 'Reserva Flexible',
    desc: 'Cambia tus planes sin estrés. Adaptamos tu viaje a tu ritmo.'
  },
  { 
    icon: Headphones, 
    label: 'Soporte 24/7',
    desc: 'Asistencia experta disponible en cualquier momento de tu aventura.'
  },
  { 
    icon: Gem, 
    label: 'Destinos Exclusivos',
    desc: 'Acceso VIP a lugares únicos y experiencias inolvidables.'
  },
];

const Features = () => {
  return (
    <section className="relative py-24 overflow-hidden bg-slate-50">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-slate-100"
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#000080] to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center h-full">
                <div className="mb-6 p-4 rounded-2xl bg-blue-50 text-[#000080] group-hover:bg-white/20 group-hover:text-white transition-all duration-500 shadow-sm ring-1 ring-blue-100 group-hover:ring-white/30">
                  <feature.icon strokeWidth={1.5} className="w-8 h-8 transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-white transition-colors duration-300 tracking-tight font-display">
                  {feature.label}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed group-hover:text-blue-100 transition-colors duration-300">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;