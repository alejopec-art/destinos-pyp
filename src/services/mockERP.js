export const ERP = {
    /**
     * Generates a new folio for a given module prefix.
     * Format: PREFIX-YYYY-XXXX (e.g., COT-2026-0001)
     */
    getNextFolio(prefix, subKey = '') {
        // FAIL-SAFE: If prefix is generic COT or missing, detect segment from URL
        let safePrefix = prefix;
        if (!safePrefix || safePrefix === 'COT') {
            const isCorp = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
            safePrefix = isCorp ? 'COT-COR' : 'COT-VAC';

        }

        const year = new Date().getFullYear();
        const storageKey = `FOLIO_COUNTER_${safePrefix}_${year}`;
        let counter = parseInt(localStorage.getItem(storageKey) || '0', 10);
        counter += 1;
        localStorage.setItem(storageKey, counter.toString());

        const paddedCounter = counter.toString().padStart(4, '0');

        if (subKey) {
            return `${safePrefix}-${subKey}${year}-${paddedCounter}`;
        }
        return `${safePrefix}-${year}-${paddedCounter}`;
    },

    /**
     * Alias for getNextFolio, used in some parts of the app.
     */
    generateFolio(prefix, subKey = '') {
        return this.getNextFolio(prefix, subKey);
    },

    /**
     * Saves a quote to local storage.
     */
    saveQuote(folio, data) {
        const key = `QUOTE_${folio}`;
        const payload = {
            ...data,
            updatedAt: new Date().toISOString(),
            createdAt: data.createdAt || new Date().toISOString()
        };

        try {
            localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {


                // 1. Intentar limpiar cotizaciones muy antiguas para liberar espacio real
                try {
                    const keys = Object.keys(localStorage).filter(k => k.startsWith('QUOTE_'));
                    if (keys.length > 20) {
                        // Ordenar por fecha de actualización aproximada o simplemente borrar las más viejas
                        // Como no tenemos un índice real, borramos las 5 más antiguas por nombre de folio (que es cronológico)
                        keys.sort().slice(0, 5).forEach(k => localStorage.removeItem(k));

                    }
                } catch (cleanError) {

                }

                // 2. Intentar guardar el payload actual (quizás la limpieza funcionó)
                try {
                    localStorage.setItem(key, JSON.stringify(payload));
                    return;
                } catch (retryFull) {

                }

                // 3. Intento de recuperación final: Eliminar imágenes de todos los hoteles
                const lightHotels = (payload.hotels || []).map(h => ({ ...h, images: [] }));
                const lightPayload = { ...payload, hotels: lightHotels, hotelImages: [] };

                try {
                    localStorage.setItem(key, JSON.stringify(lightPayload));

                } catch (retryError) {

                    throw new Error('No hay espacio suficiente en el dispositivo para guardar la cotización.');
                }
            } else {
                throw e;
            }
        }
    },

    /**
     * Retrieves a quote from local storage.
     */
    getQuoteByFolio(folio) {
        const key = `QUOTE_${folio}`;
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {

            return null;
        }
    },

    /**
     * Mock database for additional pages.
     */
    db: {
        logistics: [
            { id: 1, date: '2026-02-05', type: 'departure', client: 'Familia Perez', time: '08:00 AM', dest: 'Cancun', paxs: 4, status: 'confirmado' },
            { id: 2, date: '2026-02-05', type: 'arrival', client: 'Juan Garcia', time: '14:30 PM', dest: 'Bogota', paxs: 1, status: 'pendiente' },
            { id: 3, date: '2026-02-06', type: 'departure', client: 'Empresa ABC', time: '10:00 AM', dest: 'Miami', paxs: 2, status: 'confirmado' }
        ]
    }
};
