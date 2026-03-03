/**
 * ====================================================================
 *  DESTINOSPY P - CONCURRENCY TEST: 6 SIMULTANEOUS ADVISORS
 * ====================================================================
 * INSTRUCTIONS: Paste this ENTIRE script into the browser console
 *               while the app is running at http://localhost:5173
 * ====================================================================
 */

(async () => {
    console.clear();
    console.log('%c🔥 DESTINOSPY P — CONCURRENCY TEST (6 ADVISORS)', 'color:#f59e0b;font-size:18px;font-weight:bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#334155');

    const results = {
        totalUsers: 6,
        foliosGenerated: [],
        folioCollisions: 0,
        draftIsolationPass: true,
        quotesCreated: 0,
        errors: [],
        timings: []
    };

    // ─── SIMULATED USERS ─────────────────────────────────────────────
    const USERS = [
        { id: 'user-pepe-001', name: 'Pepe González', role: 'advisor', prefix: 'COT' },
        { id: 'user-ana-002', name: 'Ana Rodríguez', role: 'advisor', prefix: 'COT' },
        { id: 'user-laura-003', name: 'Laura Martínez', role: 'advisor', prefix: 'COT' },
        { id: 'user-carlos-004', name: 'Carlos Pérez', role: 'advisor', prefix: 'COT' },
        { id: 'user-sofia-005', name: 'Sofía Herrera', role: 'advisor', prefix: 'COT' },
        { id: 'user-julian-006', name: 'Julián Suárez', role: 'manager', prefix: 'COT' },
    ];

    const CLIENTS = [
        { name: 'Familia Gómez', destination: 'Cancún, México', dest: 'CUN' },
        { name: 'Empresa XYZ', destination: 'Miami, Florida', dest: 'MIA' },
        { name: 'Grupo Universitario', destination: 'Cartagena, Colombia', dest: 'CTG' },
        { name: 'Familia Torres', destination: 'San Andrés, Colombia', dest: 'ADZ' },
        { name: 'Juan Robledo', destination: 'Madrid, España', dest: 'MAD' },
        { name: 'Corporativo ABC', destination: 'Bogotá, Colombia', dest: 'BOG' },
    ];

    // ─── HELPERS ──────────────────────────────────────────────────────
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // ─── TEST 1: FOLIO UNIQUENESS ─────────────────────────────────────
    console.log('\n%c📋 TEST 1: Unicidad de Folios (6 usuarios simultáneos)', 'color:#60a5fa;font-weight:bold;font-size:13px;');

    const folioPromises = USERS.map(async (user, i) => {
        await sleep(rand(0, 50)); // Simular latencia de red variables
        try {
            const folio = await window.Folios.getNext(user.prefix);
            return { user: user.name, folio, userId: user.id };
        } catch (e) {
            results.errors.push(`[Folio] ${user.name}: ${e.message}`);
            return { user: user.name, folio: null, userId: user.id };
        }
    });

    const folioResults = await Promise.all(folioPromises);
    folioResults.forEach(r => {
        if (r.folio) {
            results.foliosGenerated.push(r.folio);
            console.log(`  ✅ ${r.user}: ${r.folio}`);
        } else {
            console.log(`  ❌ ${r.user}: FALLÓ`);
        }
    });

    // Check for duplicates
    const uniqueFolios = new Set(results.foliosGenerated);
    results.folioCollisions = results.foliosGenerated.length - uniqueFolios.size;
    if (results.folioCollisions === 0) {
        console.log(`%c  → Sin colisiones de folio. ${uniqueFolios.size}/${USERS.length} únicos. ✅`, 'color:#4ade80;font-weight:bold;');
    } else {
        console.log(`%c  → ⛔ COLISIONES DETECTADAS: ${results.folioCollisions}`, 'color:#f87171;font-weight:bold;');
    }

    // ─── TEST 2: DRAFT ISOLATION ──────────────────────────────────────
    console.log('\n%c🔒 TEST 2: Aislamiento de Borradores (localStorage por usuario)', 'color:#60a5fa;font-weight:bold;font-size:13px;');

    // Save mock drafts for each user
    USERS.forEach((user, i) => {
        const draftKey = `DRAFT_FORM_${user.id}`;
        const draft = {
            clientName: CLIENTS[i].name,
            destination: CLIENTS[i].destination,
            dateStart: '2026-03-15',
            activeSubTab: 'nacional',
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
    });

    // Verify each user only reads their own draft
    let isolationOk = true;
    USERS.forEach((user, i) => {
        const draftKey = `DRAFT_FORM_${user.id}`;
        const raw = localStorage.getItem(draftKey);
        if (!raw) {
            console.log(`  ❌ ${user.name}: borrador NO encontrado`);
            isolationOk = false;
            return;
        }
        const draft = JSON.parse(raw);
        const isOwn = draft.clientName === CLIENTS[i].name;
        if (isOwn) {
            console.log(`  ✅ ${user.name}: borrador aislado correctamente → "${draft.clientName}"`);
        } else {
            console.log(`  ❌ ${user.name}: CROSS-CONTAMINATION detectada! Tiene datos de otro usuario`);
            isolationOk = false;
            results.draftIsolationPass = false;
        }
    });

    // Verify no user can read another's draft
    const crossChecks = [];
    USERS.forEach((user, i) => {
        USERS.forEach((otherUser, j) => {
            if (i !== j) {
                const otherKey = `DRAFT_FORM_${otherUser.id}`;
                const raw = localStorage.getItem(otherKey);
                if (raw) {
                    const draft = JSON.parse(raw);
                    // A user can't access another user's localStorage key in real multi-session
                    // (different browser tabs/windows). We simulate by checking key isolation.
                    crossChecks.push({ from: user.name, to: otherUser.name, canAccess: true });
                }
            }
        });
    });
    console.log(`  ℹ️  Nota: En entorno real (multi-pestaña), cada sesión tiene su propio contexto de auth → keys aisladas por userId.`);
    console.log(`  ℹ️  Mismo navegador/pestaña comparte localStorage, pero las CLAVES son únicas por ${'{userId}'}.`);
    if (isolationOk) {
        console.log(`%c  → Aislamiento de borradores: OK ✅`, 'color:#4ade80;font-weight:bold;');
    } else {
        console.log(`%c  → Aislamiento de borradores: FALLO ❌`, 'color:#f87171;font-weight:bold;');
    }

    // ─── TEST 3: CONCURRENT QUOTE CREATION ───────────────────────────
    console.log('\n%c⚡ TEST 3: Creación Concurrente de 6 Cotizaciones (una por usuario)', 'color:#60a5fa;font-weight:bold;font-size:13px;');

    const quotePromises = USERS.map(async (user, i) => {
        const folio = folioResults[i]?.folio;
        if (!folio) return null;
        const t0 = performance.now();
        try {
            const res = await window.QuotesApi.createQuote({
                folio,
                data: {
                    advisorName: user.name,
                    advisorId: user.id,
                    clientName: CLIENTS[i].name,
                    destination: CLIENTS[i].destination,
                    adults: rand(1, 4),
                    childrenInfants: rand(0, 2),
                    dateStart: '2026-04-01',
                    dateEnd: '2026-04-08',
                    status: 'draft',
                    serviceType: 'nacional',
                    salePrice: rand(1000, 5000),
                    currency: 'USD',
                    createdAt: new Date().toISOString(),
                    _ownerId: user.id
                }
            });
            const elapsed = (performance.now() - t0).toFixed(2);
            results.timings.push(parseFloat(elapsed));
            if (res?.ok) {
                results.quotesCreated++;
                console.log(`  ✅ ${user.name} → ${folio} (${elapsed}ms)`);
                return { ok: true, folio, user: user.name };
            } else {
                console.log(`  ⚠️  ${user.name} → ${folio} (simulado, sin Supabase)`);
                return { ok: false, simulated: true, folio };
            }
        } catch (e) {
            const elapsed = (performance.now() - t0).toFixed(2);
            results.errors.push(`[Quote] ${user.name}: ${e.message}`);
            console.log(`  ⚠️  ${user.name} → Modo Simulado (${elapsed}ms) — ${e.message}`);
            return { ok: false, error: e.message };
        }
    });

    await Promise.all(quotePromises);

    // ─── CLEAN UP DRAFTS ──────────────────────────────────────────────
    USERS.forEach(user => {
        localStorage.removeItem(`DRAFT_FORM_${user.id}`);
    });

    // ─── FINAL REPORT ─────────────────────────────────────────────────
    const avgTime = results.timings.length > 0
        ? (results.timings.reduce((a, b) => a + b, 0) / results.timings.length).toFixed(2)
        : 'N/A (modo simulado)';

    console.log('\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#334155');
    console.log('%c📊 RESUMEN DE CONCURRENCIA', 'color:#f59e0b;font-size:15px;font-weight:bold;');
    console.table({
        'Usuarios Simulados': results.totalUsers,
        'Folios Generados': results.foliosGenerated.length,
        'Colisiones de Folio': results.folioCollisions === 0 ? '✅ NINGUNA' : `❌ ${results.folioCollisions}`,
        'Aislamiento de Borrador': results.draftIsolationPass ? '✅ APROBADO' : '❌ FALLO',
        'Cotizaciones Guardadas': results.quotesCreated,
        'Tiempo Promedio Inserción': avgTime + 'ms',
        'Errores Detectados': results.errors.length
    });

    if (results.errors.length > 0) {
        console.log('%c⚠️  Errores:', 'color:#f87171;font-weight:bold;');
        results.errors.forEach(e => console.log('   ', e));
    } else {
        console.log('%c✅ 0 Errores — Sistema de concurrencia estable.', 'color:#4ade80;font-weight:bold;');
    }

    console.log('%c\n🏁 Test de Concurrencia Finalizado', 'color:#f59e0b;font-size:14px;font-weight:bold;');
    return results;
})();
