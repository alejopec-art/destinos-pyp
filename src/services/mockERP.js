export const ERP = {
  // 1. MOTOR DE CONSECUTIVOS ATÓMICOS
  // Obtener el siguiente folio sin "quemarlo" (para previsualización)
  getNextFolio: (modulePrefix) => {
    const year = new Date().getFullYear();
    const key = `SEQ_${modulePrefix}_${year}`;
    let currentSeq = parseInt(localStorage.getItem(key) || "0");
    return `${modulePrefix}-${year}-${(currentSeq + 1).toString().padStart(4, '0')}`;
  },
  // Generar y guardar el consecutivo oficialmente
  commitFolio: (modulePrefix) => {
    const year = new Date().getFullYear();
    const key = `SEQ_${modulePrefix}_${year}`;
    let currentSeq = parseInt(localStorage.getItem(key) || "0");
    currentSeq++;
    localStorage.setItem(key, currentSeq.toString());
    return `${modulePrefix}-${year}-${currentSeq.toString().padStart(4, '0')}`;
  },
  // Mantener compatibilidad (alias de commit)
  generateFolio: (modulePrefix) => {
    return ERP.commitFolio(modulePrefix);
  },

  // 2. BASE DE DATOS RELACIONAL (SIMULADA)
  db: {
    costCenters: [
      { id: 'CC-001', name: 'Vacacional - Playa', budget: 50000000 },
      { id: 'CC-002', name: 'Vacacional - Europa', budget: 45000000 },
      { id: 'CC-003', name: 'Vacacional - Exótico', budget: 30000000 },
      { id: 'CC-004', name: 'Corporativo Nacional', budget: 120000000 }
    ],
    suppliers: [
        { id: 'SUP-001', name: 'Hotel Xcaret Arte', nit: '900.123.456-1', contact: 'reservas@xcaret.com' },
        { id: 'SUP-002', name: 'Avianca', nit: '890.100.200-5', contact: 'agencias@avianca.com' },
        { id: 'SUP-003', name: 'Assist Card', nit: '860.000.111-2', contact: 'soporte@assistcard.com' },
        { id: 'SUP-004', name: 'Decameron', nit: '900.222.333-8', contact: 'ventas@decameron.com' },
        { id: 'SUP-005', name: 'Iberia', nit: '800.555.666-3', contact: 'comercial@iberia.es' }
    ],
    advisors: [
      { id: 'ADV-001', name: 'Ana María', role: 'Senior', email: 'ana@destinospp.com' },
      { id: 'ADV-002', name: 'Carlos R.', role: 'Junior', email: 'carlos@destinospp.com' },
      { id: 'ADV-003', name: 'Luisa F.', role: 'Manager', email: 'luisa@destinospp.com' }
    ],
    clients: [
      { id: 'CLI-8832', name: 'Tech Solutions SAS', type: 'Corporativo', contact: 'Jorge Torres' },
      { id: 'CLI-8833', name: 'Juan Pérez', type: 'Vacacional', contact: 'Juan Pérez' },
      { id: 'CLI-8834', name: 'Eventos Globales', type: 'Corporativo', contact: 'Maria Paz' }
    ],
    logistics: [
      { id: 1, type: 'departure', date: '2026-02-05', time: '08:00', client: 'Tech Solutions', paxs: 12, dest: 'Cartagena', status: 'confirmado' },
      { id: 2, type: 'arrival', date: '2026-02-05', time: '14:30', client: 'Familia Ruiz', paxs: 4, dest: 'Bogotá', status: 'retrasado' },
      { id: 3, type: 'departure', date: '2026-02-06', time: '06:00', client: 'Grupo Médico', paxs: 25, dest: 'Eje Cafetero', status: 'pendiente' }
    ],
    legal: {
      terms: "1. Destinos P&P actúa como intermediario entre el cliente y los prestadores de servicios turísticos.\n2. Las tarifas están sujetas a cambios sin previo aviso hasta el momento de la emisión.\n3. Es responsabilidad del viajero tener su documentación (pasaporte, visas) al día.",
      cancellation: "1. Cancelaciones con 30+ días de antelación: Penalidad del 10% administrativo.\n2. Cancelaciones entre 29-15 días: Penalidad del 50%.\n3. Cancelaciones con menos de 15 días: Penalidad del 100% (No Show)."
    }
  },
  // 3. LÓGICA DE NEGOCIO
  getTRM: () => 4150, // TRM Simulada
  calculateQuote: (baseAmount, marginPercent, isCorp) => {
    const margin = baseAmount * (marginPercent / 100);
    const subtotal = baseAmount + margin;
    const iva = subtotal * 0.19;
    const ica = isCorp ? subtotal * 0.00966 : 0;
    return {
      base: baseAmount,
      margin: margin,
      subtotal: subtotal,
      iva: iva,
      ica: ica,
      total: subtotal + iva + ica
    };
  }
};