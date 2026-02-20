export const ERP = {
    /**
     * Generates a new folio for a given module prefix.
     * Format: PREFIX-YYYY-XXXX (e.g., COT-2026-0001)
     */
    getNextFolio(prefix = 'COT') {
        const year = new Date().getFullYear();
        const storageKey = `FOLIO_COUNTER_${prefix}_${year}`;
        let counter = parseInt(localStorage.getItem(storageKey) || '0', 10);
        counter += 1;
        localStorage.setItem(storageKey, counter.toString());

        const paddedCounter = counter.toString().padStart(4, '0');
        return `${prefix}-${year}-${paddedCounter}`;
    },

    /**
     * Alias for getNextFolio, used in some parts of the app.
     */
    generateFolio(prefix) {
        return this.getNextFolio(prefix);
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
        localStorage.setItem(key, JSON.stringify(payload));
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
            console.error(`Error parsing quote ${folio}:`, e);
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
