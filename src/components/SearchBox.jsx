import React from 'react';
import { Search, Calendar, MapPin, Layers, Clock, DollarSign } from 'lucide-react';

const SearchBox = () => {
  return (
    <div className="w-full max-w-7xl mx-auto relative z-30 px-4 pb-6">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-2 lg:p-3">
        <div className="flex flex-col lg:flex-row items-center lg:divide-x divide-gray-100 gap-2 lg:gap-0">
          
          {/* Brand/Title Badge */}
          <div className="hidden lg:flex flex-col justify-center px-6 py-2 shrink-0">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Encuentra</span>
             <h3 className="text-xl font-extrabold text-[#000080] leading-none">Tu Viaje</h3>
          </div>

          {/* Keywords / Destination */}
          <div className="flex-1 w-full px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
             <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
                   <MapPin size={20} />
                </div>
                <div className="flex flex-col w-full min-w-0">
                   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Destino / Clave</label>
                   <input 
                     type="text" 
                     placeholder="¿A dónde vas?" 
                     className="w-full bg-transparent border-none p-0 text-gray-900 font-bold placeholder-gray-400 focus:ring-0 text-sm truncate leading-tight"
                   />
                </div>
             </div>
          </div>

          {/* Category */}
          <div className="w-full lg:w-48 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2 rounded-lg text-orange-600 group-hover:bg-orange-100 transition-colors shrink-0">
                   <Layers size={20} />
                </div>
                <div className="flex flex-col w-full min-w-0">
                   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Categoría</label>
                   <select className="w-full bg-transparent border-none p-0 text-gray-900 font-bold focus:ring-0 text-sm cursor-pointer appearance-none leading-tight">
                      <option>Cualquier</option>
                      <option>Aventura</option>
                      <option>Relax</option>
                      <option>Cultural</option>
                   </select>
                </div>
             </div>
          </div>

          {/* Duration */}
          <div className="w-full lg:w-44 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
             <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded-lg text-purple-600 group-hover:bg-purple-100 transition-colors shrink-0">
                   <Clock size={20} />
                </div>
                <div className="flex flex-col w-full min-w-0">
                   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Duración</label>
                   <select className="w-full bg-transparent border-none p-0 text-gray-900 font-bold focus:ring-0 text-sm cursor-pointer appearance-none leading-tight">
                      <option>Cualquier</option>
                      <option>1-3 Días</option>
                      <option>1 Semana</option>
                      <option>+1 Semana</option>
                   </select>
                </div>
             </div>
          </div>

          {/* Date */}
          <div className="w-full lg:w-44 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
             <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg text-green-600 group-hover:bg-green-100 transition-colors shrink-0">
                   <Calendar size={20} />
                </div>
                <div className="flex flex-col w-full min-w-0">
                   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Fecha</label>
                   <input 
                      type="date" 
                      className="w-full bg-transparent border-none p-0 text-gray-900 font-bold focus:ring-0 text-sm cursor-pointer leading-tight font-sans"
                   />
                </div>
             </div>
          </div>

           {/* Budget (Min-Max) */}
           <div className="w-full lg:w-56 px-4 py-2 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer">
             <div className="flex items-center gap-3">
                <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600 group-hover:bg-yellow-100 transition-colors shrink-0">
                   <DollarSign size={20} />
                </div>
                <div className="flex flex-col w-full min-w-0">
                   <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Presupuesto</label>
                   <div className="flex items-center gap-2">
                      <input type="text" placeholder="Min" className="w-full bg-transparent border-b border-gray-200 p-0 text-xs font-bold focus:ring-0 focus:border-[#000080]" />
                      <span className="text-gray-300">-</span>
                      <input type="text" placeholder="Max" className="w-full bg-transparent border-b border-gray-200 p-0 text-xs font-bold focus:ring-0 focus:border-[#000080]" />
                   </div>
                </div>
             </div>
          </div>

          {/* Search Button */}
          <div className="p-1 shrink-0 w-full lg:w-auto">
             <button className="w-full h-12 lg:h-14 lg:w-14 bg-[#D4AF37] hover:bg-[#b5952f] text-white rounded-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-lg group">
                <Search size={24} className="group-hover:scale-110 transition-transform" />
                <span className="lg:hidden ml-2 font-bold">BUSCAR VIAJE</span>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SearchBox;
