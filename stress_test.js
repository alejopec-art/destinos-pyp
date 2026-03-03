/**
 * Destinos P&P - Stress Test Script
 * Simula la creación masiva de cotizaciones para verificar rendimiento y concurrencia.
 * 
 * INSTRUCCIONES:
 * 1. Abrir la consola del navegador (F12) en la Intranet (puerto 5173).
 * 2. Pegar este código y presionar Enter.
 * 3. Ejecutar la función: runStressTest(500, 10);
 */

window.runStressTest = async function (totalToCreate = 500, batchSize = 10) {
    console.log(`%c🚀 Iniciando Prueba de Estrés: ${totalToCreate} cotizaciones...`, 'color: #0ea5e9; font-weight: bold; font-size: 14px;');
    const results = { success: 0, error: 0, timings: [] };
    const startTime = performance.now();

    for (let i = 0; i < totalToCreate; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, totalToCreate - i);
        console.log(`📦 Procesando bloque: ${i + 1} a ${i + currentBatchSize}...`);

        const batchPromises = Array.from({ length: currentBatchSize }).map(async (_, idx) => {
            const quoteIndex = i + idx + 1;
            const startInsert = performance.now();
            try {
                // Obtener un folio real para la prueba
                const folio = await window.Folios.getNext('STRESS');

                const mockQuote = {
                    folio: folio,
                    clientName: `Simulación Stress #${quoteIndex}`,
                    clientDoc: `999${quoteIndex}`,
                    destination: "SAN ANDRES - STRESS TEST",
                    dateStart: "2026-10-01",
                    dateEnd: "2026-10-05",
                    serviceType: "nacional",
                    status: "draft",
                    advisorName: "QA Bot Simulator",
                    createdAt: new Date().toISOString()
                };

                // Uso de la API expuesta
                const res = await window.QuotesApi.createQuote(mockQuote, window.auth.user);

                const endInsert = performance.now();
                if (res.ok) {
                    results.success++;
                    results.timings.push(endInsert - startInsert);
                } else {
                    results.error++;
                    console.error(`❌ Error en cotización #${quoteIndex} (${folio}):`, res.error);
                }
            } catch (err) {
                results.error++;
                console.error(`💥 Excepción en cotización #${quoteIndex}:`, err);
            }
        });

        await Promise.all(batchPromises);
        console.log(`✅ Progreso: ${results.success + results.error}/${totalToCreate}`);
    }

    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    const avgTime = results.timings.length > 0
        ? (results.timings.reduce((a, b) => a + b, 0) / results.timings.length).toFixed(2)
        : 0;

    console.log(`%c🏁 PRUEBA FINALIZADA`, 'color: #10b981; font-weight: bold; font-size: 16px;');
    console.table({
        "Total Cotizaciones": totalToCreate,
        "Éxitos ✅": results.success,
        "Errores ❌": results.error,
        "Tiempo Total (s)": totalTime,
        "Promedio por inserción (ms)": avgTime
    });
};

console.log("%c✅ Script de Stress Test cargado. Ejecuta 'runStressTest(500, 10)' para iniciar.", 'color: #10b981; font-weight: bold;');
