import { supabase } from './supabaseClient';
import { ERP } from './mockERP';

export const Folios = {
  async getNext(modulePrefix) {
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('next_folio', { p_module: modulePrefix });
        if (error) throw error;
        if (data && typeof data === 'string') return data;
      } catch (_) {}
    }
    return ERP.generateFolio(modulePrefix);
  }
};

