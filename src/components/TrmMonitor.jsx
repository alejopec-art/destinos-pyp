import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, RefreshCw, AlertCircle, Calculator, Activity } from 'lucide-react';

const TrmMonitor = () => {
    // 1. Configuración y Constantes
    const CACHE_KEY = 'destinos_trm_cache';
    const SPREAD_OPERATIVO = 50; // Margen de $50 pesos para cubrir spread bancario
    const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'; // API Real y Estable
    const UPDATE_INTERVAL = 6 * 60 * 60 * 1000; // Actualización cada 6 Horas

    // 2. Estado
    const [trm, setTrm] = useState(null);
    const [status, setStatus] = useState('loading'); // 'loading', 'live', 'cache', 'error'
    const [calcAmount, setCalcAmount] = useState('');
    const [conversion, setConversion] = useState(null);

    // 3. Lógica de Datos Robusta (API + Timeout + Fallback)
    const fetchTrm = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout

        try {
            const response = await fetch(API_URL, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Error en API de Divisas');
            
            const data = await response.json();
            if (!data || !data.rates || !data.rates.COP) throw new Error('Datos de TRM no disponibles');

            const officialRate = data.rates.COP;
            
            // Guardar en Cache y Estado
            const newData = {
                rate: officialRate,
                date: new Date().toISOString()
            };
            
            setTrm(officialRate);
            setStatus('live');
            localStorage.setItem(CACHE_KEY, JSON.stringify(newData));

        } catch (error) {
            console.warn('Fallo en TRM en vivo, buscando caché...', error);
            loadFromCache();
        }
    };

    const loadFromCache = () => {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const data = JSON.parse(cached);
                setTrm(data.rate);
                setStatus('cache');
            } else {
                // Si falla API y no hay caché, mostramos error crítico
                setTrm(null);
                setStatus('error');
            }
        } catch (e) {
            setTrm(null);
            setStatus('error');
        }
    };

    // 4. Ciclo de Vida
    useEffect(() => {
        // Intentar carga inicial rápida desde caché para UX inmediata
        loadFromCache(); 
        // Luego buscar dato fresco
        fetchTrm();

        const interval = setInterval(fetchTrm, UPDATE_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    // 5. Calculadora Instantánea
    const handleCalculation = (val) => {
        // Permitir entrada vacía para limpiar
        if (val === '') {
            setCalcAmount('');
            setConversion(null);
            return;
        }

        // Sanitizar entrada: solo números y un punto decimal
        const sanitizedVal = val.replace(/[^0-9.]/g, '');
        setCalcAmount(sanitizedVal);
        
        // Validación estricta para el cálculo
        const numberVal = parseFloat(sanitizedVal);

        // Si no hay TRM válida o el valor no es un número, no calculamos
        if (!trm || isNaN(numberVal)) {
            setConversion(null);
            return;
        }
        
        const totalRate = trm + SPREAD_OPERATIVO; // Lógica de Negocio: TRM + Spread
        const result = numberVal * totalRate;
        setConversion(result);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative h-full bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] p-5 rounded-3xl flex flex-col justify-between overflow-hidden group hover:border-blue-400/50 transition-all duration-300"
        >
            {/* Header & Status */}
            <div className="flex justify-between items-start">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                    <DollarSign className="w-6 h-6" />
                </div>
                
                {/* Indicador de Estado */}
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full border text-[10px] font-bold tracking-wider ${
                    status === 'live' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : status === 'cache'
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {status === 'live' && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    )}
                    {status === 'live' ? 'EN VIVO' : status === 'cache' ? 'DATA CACHÉ' : 'OFFLINE'}
                </div>
            </div>

            {/* Main Value */}
            <div className="mt-4">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">TRM Oficial</p>
                {status === 'error' ? (
                     <div className="flex flex-col gap-1">
                        <span className="text-2xl font-bold text-red-400 tracking-tight">---</span>
                        <p className="text-[10px] text-red-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Error de conexión:
                        </p>
                        <p className="text-[10px] text-red-300">Por favor verifica la TRM manualmente</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                ${trm ? trm.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '---'}
                            </span>
                            <span className="text-xs text-slate-500">COP</span>
                        </div>
                        {status === 'cache' && (
                            <p className="text-[10px] text-amber-500/80 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Usando última tasa registrada
                            </p>
                        )}
                    </>
                )}
            </div>

            {/* Instant Calculator */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="relative group/input">
                    <Calculator className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                    <input 
                        type="number" 
                        value={calcAmount}
                        onChange={(e) => handleCalculation(e.target.value)}
                        placeholder="Calcular USD..."
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                    />
                </div>
                
                {conversion !== null && (
                    <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 flex flex-col items-end px-2"
                    >
                        <span className="text-[10px] text-slate-400 mb-0.5">Total (+Spread)</span>
                        <span className="text-lg font-bold text-blue-300 font-mono tracking-tight break-all text-right w-full">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(conversion)}
                        </span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default TrmMonitor;