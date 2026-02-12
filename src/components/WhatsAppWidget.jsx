import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Hide on Intranet pages
  if (location.pathname.startsWith('/intranet')) {
    return null;
  }

  const phoneNumber = "573017636478";
  const message = "Hola Destinos P&P, vengo de su página web y me gustaría recibir asesoría personalizada para mi próximo viaje o evento corporativo.";
  
  const handleOpenChat = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      
      {/* Pop-up Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-[#075E54] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white overflow-hidden border-2 border-white/30">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80" 
                      alt="Agente" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#075E54] rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Destinos P&P Asistencia</h3>
                  <p className="text-green-100 text-xs">Responde en menos de 5 min</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-[#e5ddd5] bg-opacity-30 h-64 flex flex-col relative">
              <div className="absolute inset-0 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] opacity-10"></div>
              
              <div className="relative z-10 bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm max-w-[85%] self-start mb-4">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Hola 👋, ¡qué gusto saludarte! Soy tu asesor experto. ¿En qué puedo ayudarte hoy?
                </p>
                <span className="text-[10px] text-gray-400 block text-right mt-1">Justo ahora</span>
              </div>
            </div>

            {/* Footer / Action */}
            <div className="p-4 bg-white border-t border-gray-100">
              <button
                onClick={handleOpenChat}
                className="w-full py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-full transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 group"
              >
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                Iniciar chat en WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Trigger (Floating Cloud/Pill) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={() => setIsOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 bg-white pl-2 pr-6 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(37,211,102,0.3)] border border-green-50 transition-all z-50 cursor-pointer"
          >
            {/* WhatsApp Icon (The "Image" from the old button) */}
            <div className="relative flex items-center justify-center w-12 h-12 bg-[#25D366] rounded-full text-white shadow-md group-hover:scale-110 transition-transform">
              {/* Pulse Ring */}
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
              
              <svg 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                stroke="currentColor" 
                strokeWidth="2" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="fill-white stroke-white relative z-10"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-start text-left">
              <span className="text-gray-800 font-bold text-sm">¿Necesitas ayuda?</span>
              <span className="text-green-500 text-xs font-medium">Haz clic para chatear</span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppWidget;