import { supabase } from './supabaseClient';
import { ERP } from './mockERP';

// Promise Queue for single-threaded folio generation
let folioQueue = Promise.resolve();

// Helper para mapear el submódulo o pestaña a la subclave de 3 letras exigida
export const getSubKeyFromTab = (tabValue) => {
  switch (tabValue) {
    case 'nacional': return 'NAC';
    case 'internacional': return 'INT';
    case 'tiquetes': return 'TIQ';
    case 'vuelos': return 'TIQ'; // alias en corpotativo
    case 'terrestre': return 'POR';
    case 'quince': return 'QUI';
    case 'quince-grupos': return 'GRP';
    case 'grupos': return 'GRP';
    case 'eventos': return 'EVE';
    case 'alojamiento': return 'ALO';
    case 'hoteles': return 'ALO';
    case 'hotel': return 'ALO';
    case 'vacaciones-medida': return 'VAC';
    case 'crucero': return 'CRU';
    case 'cruceros': return 'CRU';
    case 'auto': return 'AUT';
    default: return 'GEN';
  }
};

export const Folios = {
  getNext(modulePrefix, subKey = '') {
    // FAIL-SAFE: If prefix is generic COT or missing, detect segment from URL
    let safePrefix = modulePrefix;
    if (!safePrefix || safePrefix === 'COT') {
      const isCorp = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
      safePrefix = isCorp ? 'COT-COR' : 'COT-VAC';

    }


    // Encolar la petición de folio para forzar exclusión mutua local
    const nextInQueue = folioQueue.then(async () => {
      // Delay transaccional de 50 a 150ms para separar peticiones cuasi-simultáneas
      const delay = Math.floor(Math.random() * 100) + 50;
      await new Promise(r => setTimeout(r, delay));

      let result;
      if (supabase) {
        try {
          // RPC for atomic sequence in DB if available
          const { data, error } = await supabase.rpc('next_folio', { p_module: safePrefix });
          if (!error && data && typeof data === 'string') {
            result = data;
          }
        } catch (_) { }
      }

      if (!result) {
        result = ERP.generateFolio(safePrefix, subKey);
      }

      // SEGMENTATION GUARD: If we requested COT-VAC or COT-COR but got COT-, we force the conversion.
      if (result && safePrefix && safePrefix !== 'COT' && !result.startsWith(safePrefix)) {

        result = result.replace(/^COT-/, safePrefix + "-");
      }


      return result;
    });

    folioQueue = nextInQueue.catch(() => { }); // Resilient queue

    return nextInQueue;
  }
};

