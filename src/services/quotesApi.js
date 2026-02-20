import { supabase } from './supabaseClient';
import { ERP } from './mockERP';

/**
 * Sanitización recursiva para limpiar strings de etiquetas HTML
 * y prevenir inyecciones básicas XSS.
 */
function sanitize(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      let val = obj[key];
      if (typeof val === 'string') {
        val = val.replace(/<[^>]*>?/gm, '').trim();
      } else if (typeof val === 'object') {
        val = sanitize(val);
      }
      sanitized[key] = val;
    }
  }
  return sanitized;
}

async function getAuthUserId() {
  try {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Valida que exista una sesión activa en Supabase antes de proceder.
 */
async function validateSession() {
  if (!supabase) return true;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Sesión expirada o inválida. Por favor, inicie sesión de nuevo.');
  }
  return true;
}

export const QuotesApi = {
  async createQuote(quoteData, user) {
    try {
      if (!user) return { ok: false, error: 'Sesión no válida' };
      await validateSession();

      if (!quoteData || !quoteData.folio) {
        return { ok: false, error: 'Datos de cotización incompletos (Falta Folio)' };
      }

      const sanitizedData = sanitize(quoteData);

      const payload = {
        folio: sanitizedData.folio,
        data: sanitizedData,
        created_by: user.id || user.uid,
        created_by_email: user.email,
        updated_at: new Date().toISOString()
      };

      if (!supabase) {
        ERP.saveQuote(sanitizedData.folio, sanitizedData);
        return { ok: true, data: sanitizedData };
      }

      const { data, error } = await supabase
        .from('quotes')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return this.updateQuote(sanitizedData.folio, sanitizedData);
        }
        throw error;
      }
      return { ok: true, data: data.data };
    } catch (err) {
      return { ok: false, error: err.message || 'Error al crear cotización' };
    }
  },

  async listQuotes(search) {
    try {
      if (!supabase) {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('QUOTE_')) {
            const raw = localStorage.getItem(key);
            const data = raw ? JSON.parse(raw) : {};
            const folio = key.replace('QUOTE_', '');
            items.push({
              folio,
              data,
              created_at: data.createdAt || null
            });
          }
        }
        return items.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      }

      await validateSession();
      let query = supabase.from('quotes').select('folio,data,created_at').order('created_at', { ascending: false });

      if (search && search.trim()) {
        const term = `%${sanitize(search.trim())}%`;
        query = query.or(`folio.ilike.${term},data->>clientName.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      return [];
    }
  },

  async getQuoteByFolio(folio) {
    try {
      if (!supabase) return ERP.getQuoteByFolio(folio);

      await validateSession();
      const { data, error } = await supabase.from('quotes').select('data').eq('folio', folio).single();
      if (error) {
        if (error.code === 'PGRST116') return ERP.getQuoteByFolio(folio);
        throw error;
      }
      return data?.data || ERP.getQuoteByFolio(folio);
    } catch (err) {
      return ERP.getQuoteByFolio(folio);
    }
  },

  async updateQuote(folio, changes) {
    try {
      if (!folio) return { ok: false, error: 'Folio requerido para actualizar' };
      await validateSession();

      const existing = await this.getQuoteByFolio(folio);
      const sanitizedChanges = sanitize(changes);
      const mergedData = { ...(existing || {}), ...sanitizedChanges, folio };

      if (!supabase) {
        ERP.saveQuote(folio, mergedData);
        return { ok: true };
      }

      const { data, error } = await supabase
        .from('quotes')
        .update({
          data: mergedData,
          updated_at: new Date().toISOString()
        })
        .eq('folio', folio)
        .select()
        .single();

      if (error) throw error;
      return { ok: true, data: data.data };
    } catch (err) {
      return { ok: false, error: err.message || 'Error al actualizar' };
    }
  },

  async deleteQuote(folio) {
    try {
      await validateSession();
      localStorage.removeItem(`QUOTE_${folio}`);

      if (!supabase) return { ok: true, local: true };

      const uid = await getAuthUserId();
      let query = supabase.from('quotes').delete().eq('folio', folio);
      if (uid) query = query.eq('created_by', uid);

      const { error } = await query;
      if (error) throw error;

      return { ok: true, local: false };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  async confirmQuote(payload, user) {
    try {
      await validateSession();
      const sanitizedPayload = sanitize(payload);
      const folio = sanitizedPayload.folio;

      const existing = await this.getQuoteByFolio(folio) || {};
      const merged = { ...existing, ...sanitizedPayload, status: 'confirmed' };

      if (!supabase) {
        ERP.saveQuote(folio, merged);
        return { ok: true, folio: folio };
      }

      const uid = await getAuthUserId();

      // Actualizar en tabla quotes
      await supabase.from('quotes').update({
        data: merged,
        updated_at: new Date().toISOString()
      }).eq('folio', folio);

      // Upsert en tabla confirmed_quotes para reportes
      const row = {
        folio: folio,
        data: merged,
        created_by: uid,
        created_by_email: user?.email || null
      };

      const { error: errorConfirm } = await supabase.from('confirmed_quotes').upsert(row);
      if (errorConfirm) throw errorConfirm;

      return { ok: true, folio: folio };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
};
