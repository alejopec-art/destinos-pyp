// Helper para determinar el paso actual del proceso (1-5)
// 1: Cotización, 2: Confirmación, 3: Pagos, 4: Facturación, 5: Voucher
export const getProcessStep = (row) => {
    const d = row.data || {};
    const s = row.status || d.status;

    if (d.voucherGenerated) return 5;
    if (d.lockedBilling) return 4;

    // ERP: Sincronización automática de Paso 3 si Contabilidad verifica pago
    if ((d.supports && d.supports.length > 0) || d.reconfirmData?.pagoVerificado) return 3;

    if (s === 'confirmed' || d.serviceConfirmed) return 2;
    if (s === 'cancelled' || d.status === 'cancelled') return 0; // Estado especial

    return 1;
};

export const PROCESS_STEPS = [
    { id: 1, label: 'COT', full: 'Cotización', color: 'blue' },
    { id: 2, label: 'CONF', full: 'Confirmación', color: 'blue' },
    { id: 3, label: 'PAG', full: 'Pagos', color: 'amber' },
    { id: 4, label: 'FACT', full: 'Facturación', color: 'blue' },
    { id: 5, label: 'VCH', full: 'Voucher', color: 'emerald' }
];
