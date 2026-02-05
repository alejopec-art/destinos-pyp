import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Plane, CheckCircle, AlertTriangle } from 'lucide-react';
import { ERP } from '../../services/mockERP';

const LogisticsPage = () => {
  const [selectedDate, setSelectedDate] = useState('2026-02-05');
  const logisticsData = ERP.db.logistics;

  const todayEvents = logisticsData.filter(e => e.date === selectedDate);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Logística y Operaciones</h1>
        <p className="text-slate-400">Calendario maestro de salidas y llegadas de pasajeros.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel de Calendario (Simulado) */}
        <div className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Selector de Fecha
          </h3>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-sm mb-2">Febrero 2026</p>
            <div className="grid grid-cols-7 gap-2 text-sm">
              {['D','L','M','M','J','V','S'].map(d => <span key={d} className="text-slate-500 font-bold">{d}</span>)}
              {Array.from({length: 28}, (_, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedDate(`2026-02-${String(i+1).padStart(2, '0')}`)}
                  className={`p-2 rounded-lg transition-all ${
                    selectedDate === `2026-02-${String(i+1).padStart(2, '0')}` 
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/30' 
                    : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" /> Itinerario: {selectedDate}
          </h3>
          {todayEvents.length > 0 ? todayEvents.map(event => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#1e293b] border border-slate-700/50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${event.type === 'departure' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                  <Plane className={`w-6 h-6 ${event.type === 'arrival' ? 'rotate-90' : '-rotate-45'}`} />
                </div>
                <div>
                  <p className="text-white font-bold">{event.client}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.dest}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.paxs} pax</span>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                event.status === 'confirmado' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                event.status === 'retrasado' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {event.status.toUpperCase()}
              </div>
            </motion.div>
          )) : (
            <div className="p-8 text-center text-slate-500 bg-[#1e293b]/50 rounded-2xl border border-slate-800">
              No hay operaciones programadas para esta fecha.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogisticsPage;