import React from 'react';
import { BadgeDollarSign, CalendarCheck, Gem, Users, Clock, ShieldCheck } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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

        {/* New Support Section - Crucero Style */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1e293b] border border-slate-700/50 shadow-2xl group">
             {/* Glassmorphism & Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -mr-40 -mt-40 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -ml-20 -mb-20"></div>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 p-8 md:p-12 items-center">
                <div className="space-y-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
                            <ShieldCheck className="w-4 h-4" /> Soporte Premium
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                            Asesoría y asistencia <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">antes y durante tu viaje</span>
                        </h3>
                        <p className="text-blue-200 text-lg font-medium mb-4">
                            Estamos contigo en cada paso de tu aventura ✈️
                        </p>
                        <p className="text-slate-400 leading-relaxed text-lg">
                            Te brindamos acompañamiento personalizado antes y durante tu viaje para que te sientas tranquilo y bien respaldado en todo momento.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:bg-slate-800 transition-colors group/card">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-emerald-400" />
                            </div>
                            <h4 className="text-white font-bold mb-2">Horarios de Atención</h4>
                            <p className="text-slate-400 text-sm">
                                <span className="block mb-1">Lun - Vie: 8:00 a.m. - 6:00 p.m.</span>
                                <span>Sábados: 9:00 a.m. - 12:00 p.m.</span>
                            </p>
                        </div>

                        <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-500/20 hover:bg-blue-900/30 transition-colors group/card">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <h4 className="text-white font-bold mb-2">Soporte en Viaje</h4>
                            <p className="text-blue-200/80 text-sm italic">
                                "Cuentas con atención 24 horas para cualquier imprevisto. Viaja con seguridad."
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 group/image">
                    <img 
                        src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=1000&q=80" 
                        alt="Support Team" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-80"></div>
                    
                    <div className="absolute bottom-0 left-0 p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex -space-x-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center overflow-hidden">
                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Agent" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-white font-bold text-sm">+15 Expertos</span>
                        </div>
                        <p className="text-white font-medium">"Tu tranquilidad es nuestra prioridad"</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Features;