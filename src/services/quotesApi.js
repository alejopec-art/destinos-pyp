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
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('intranet_user');
    if (!user) {
      throw new Error('Sesión expirada o inválida. Por favor, inicie sesión de nuevo.');
    }
  }
  return true;
}

export const QuotesApi = {
  async createQuote(quoteData, user, retryCount = 0) {
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
        try {
          ERP.saveQuote(sanitizedData.folio, sanitizedData);
          return { ok: true, data: sanitizedData };
        } catch (erpError) {
          return { ok: false, error: erpError.message || 'Error al guardar localmente' };
        }
      }

      const { data, error } = await supabase
        .from('quotes')
        .insert(payload)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // ANTI-COLLISION SYSTEM: Prevent overwrite if another advisor saved fractions of a second earlier
          if (retryCount >= 3) {
            return { ok: false, error: 'Múltiples colisiones de folio. Por favor, reintente guardar.' };
          }



          const parts = sanitizedData.folio.split('-');
          const modulePrefix = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : 'COT-VAC';
          const subKeyWithYear = parts.length >= 3 ? parts[2] : 'GEN';
          const subKey = subKeyWithYear.substring(0, 3);

          const { Folios } = await import('./foliosApi');
          const newFolio = await Folios.getNext(modulePrefix, subKey);

          // Modify payload with new folio
          quoteData.folio = newFolio;
          if (quoteData.id) quoteData.id = newFolio;


          return this.createQuote(quoteData, user, retryCount + 1);
        }
        throw error;
      }
      return { ok: true, data: data.data };
    } catch (err) {
      return { ok: false, error: err.message || 'Error al crear cotización' };
    }
  },

  async listQuotes(search, limit = 50, offset = 0, userId = null) {
    try {
      if (!supabase) {
        let items = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('QUOTE_')) {
            const raw = localStorage.getItem(key);
            const data = raw ? JSON.parse(raw) : {};
            const folio = key.replace('QUOTE_', '');

            // Filtro por Usuario (Local)
            if (userId && data.created_by !== userId) continue;

            items.push({
              folio,
              data,
              created_at: data.createdAt || null
            });
          }
        }
        const filtered = items
          .filter(it => {
            if (!search) return true;
            const term = search.toLowerCase();
            const d = it.data || {};
            return (
              it.folio.toLowerCase().includes(term) ||
              (d.clientName || '').toLowerCase().includes(term) ||
              (d.clientDoc || '').toLowerCase().includes(term) ||
              (d.destination || '').toLowerCase().includes(term)
            );
          })
          .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

        return {
          data: filtered.slice(offset, offset + limit),
          count: filtered.length
        };
      }

      await validateSession();
      let query = supabase
        .from('quotes')
        .select('folio,data,created_at,created_by,created_by_email', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('created_by', userId);
      }

      if (search && search.trim()) {
        const term = `%${sanitize(search.trim())}%`;
        // Búsqueda Universal: Folio, Cliente, Cédula/Pasaporte, NIT, Destino
        query = query.or(`folio.ilike.${term},data->>clientName.ilike.${term},data->>clientDoc.ilike.${term},data->>clientNit.ilike.${term},data->>destination.ilike.${term}`);
      }

      // Aplicar rango después de filtros
      const { data, error, count } = await query.range(offset, offset + limit - 1);
      if (error) throw error;
      return {
        data: data || [],
        count: count || 0
      };
    } catch (err) {

      return { data: [], count: 0 };
    }
  },

  async getQuoteByFolio(folio) {
    try {
      if (!supabase) return ERP.getQuoteByFolio(folio);

      await validateSession();
      const { data, error } = await supabase
        .from('quotes')
        .select('*, data')
        .eq('folio', folio)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return ERP.getQuoteByFolio(folio);
        throw error;
      }
      // Retornar tanto el JSON data como los metadatos de propiedad
      return { ...data?.data, _ownerId: data.created_by, _folio: data.folio } || ERP.getQuoteByFolio(folio);
    } catch (err) {
      return ERP.getQuoteByFolio(folio);
    }
  },

  async getDraftByUserId(userId) {
    try {
      if (!supabase) return null;
      await validateSession();
      const { data, error } = await supabase
        .from('quotes')
        .select('folio, data')
        .eq('created_by', userId)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return { ...data?.data, folio: data.folio };
    } catch {
      return null;
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
        try {
          ERP.saveQuote(folio, mergedData);
          return { ok: true };
        } catch (erpError) {
          return { ok: false, error: erpError.message || 'Error al actualizar localmente' };
        }
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
        try {
          ERP.saveQuote(folio, merged);
          return { ok: true, folio: folio };
        } catch (erpError) {
          return { ok: false, error: erpError.message || 'Error al confirmar localmente' };
        }
      }
      const uid = await getAuthUserId();

      // Actualizar en tabla quotes
      await supabase.from('quotes').update({
        data: merged,
        status: 'confirmed', // Cambiar estado a confirmado
        updated_at: new Date().toISOString()
      }).eq('folio', folio);

      // Upsert en tabla confirmed_quotes para reportes
      const row = {
        folio: folio,
        data: merged,
        created_by: uid,
        created_by_email: user?.email || null,
        status: 'confirmed'
      };

      const { error: errorConfirm } = await supabase.from('confirmed_quotes').upsert(row);
      if (errorConfirm) throw errorConfirm;

      return { ok: true, folio: folio };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  async reassignQuote(folio, newEmail) {
    try {
      await validateSession();
      // 1. Buscar el ID del nuevo usuario por email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', newEmail)
        .single();

      if (userError || !userData) throw new Error('Usuario no encontrado');

      // 2. Obtener datos actuales para actualizar historial
      const { data: currentQuote, error: getError } = await supabase
        .from('quotes')
        .select('data')
        .eq('folio', folio)
        .single();

      if (getError) throw getError;

      const updatedData = { ...currentQuote.data };
      const history = updatedData.history || [];
      history.push({
        type: 'reassignment',
        action: 'RE-ASIGNACIÓN',
        timestamp: new Date().toLocaleString(),
        user: 'Gerencia',
        details: `Propiedad transferida a ${newEmail} (${userData.full_name || 'Nuevo Asesor'})`
      });
      updatedData.history = history;

      // 3. Actualizar registro
      const { error } = await supabase
        .from('quotes')
        .update({
          created_by: userData.id,
          created_by_email: newEmail,
          data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('folio', folio);

      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
};
