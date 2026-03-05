// Helper para determinar el paso actual del proceso (1-5)
// 1: Cotización, 2: Confirmación, 3: Pagos, 4: Facturación, 5: Voucher
export const getProcessStep = (row) => {
    const d = row.data || {};
    const s = row.status || d.status;

    // Si tiene voucher, registro de pago, facturación o está confirmado, es Paso 2 (Confirmación/Post-Venta)
    if (d.voucherGenerated || d.lockedBilling || (d.supports && d.supports.length > 0) || d.reconfirmData?.pagoVerificado || s === 'confirmed' || d.serviceConfirmed) {
        return 2;
    }

    if (s === 'cancelled' || d.status === 'cancelled') return 0; // Estado especial

    return 1;
};

export const PROCESS_STEPS = [
    { id: 1, label: 'COT', full: 'Cotización', color: 'blue' },
    { id: 2, label: 'CONF', full: 'Confirmación', color: 'blue' }
];
