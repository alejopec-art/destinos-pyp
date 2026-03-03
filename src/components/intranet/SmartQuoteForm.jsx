import React, { useState, useEffect } from 'react';
import {
    Plane, Settings, ArrowLeft, Plus, CheckCircle, Briefcase, Search, AlertCircle,
    ChevronRight, Globe, Ship, Car, Baby, Users2, UserPlus, Camera, X, ClipboardList,
    FileText, ShieldCheck, DollarSign, AlertTriangle, FileDown, Check, RefreshCcw, Hotel, HeartHandshake, CalendarHeart, Trash2
} from 'lucide-react';
import { ERP } from '../../services/mockERP';
import { Folios, getSubKeyFromTab } from '../../services/foliosApi';
import { QuotesApi } from '../../services/quotesApi';
import { generateQuotePdf } from '../../utils/pdf';
import { processImageUpload, IMAGE_RECOMMENDATIONS, DEFAULT_IMAGES } from '../../utils/image';

const luggageOptions = [
    { key: 'personal', label: 'Artículo Personal (Mochila)' },
    { key: 'hand', label: 'Equipaje de Mano (10kg)' },
    { key: 'checked', label: 'Equipaje de Bodega (23kg)' }
];

const LuggageIncludedCard = ({ value, onChange }) => (
    <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50 space-y-4 hover:border-blue-500/30 transition-colors">
        <h4 className="text-white font-bold text-sm uppercase border-b border-slate-700 pb-2">Equipaje Incluido</h4>
        <div className="space-y-3">
            {luggageOptions.map((item) => (
                <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg cursor-pointer hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-700">
                    <input
                        type="checkbox"
                        className="w-4 h-4 accent-blue-500 rounded"
                        checked={!!value[item.key]}
                        onChange={() => onChange({ ...value, [item.key]: !value[item.key] })}
                    />
                    <span className="text-slate-300 text-sm">{item.label}</span>
                </label>
            ))}
        </div>
    </div>
);

const SmartQuoteForm = ({
    config,
    isReadOnly: inheritedReadOnly,
    user,
    previewFolio,
    setPreviewFolio,
    activeSubTab,
    setActiveSubTab,
    advisorName,
    advisorRole,
    cloneDataRef,
    corporateCompanies,
    setActiveMainTab,
    setFormData,
    DEFAULT_CONDITIONS,
    DEFAULT_CLOSING_NOTE
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const isCorporateModule = typeof window !== 'undefined' && (window.location.pathname.includes('corporativo') || window.location.pathname.includes('sales'));
    const [quoteType, setQuoteType] = useState(isCorporateModule ? 'corporativo' : 'vacacional');

    // Mapeo de props a nombres internos si es necesario
    const isReadOnly = inheritedReadOnly;

    // Datos del Formulario
    const [clientData, setClientData] = useState({
        // Vacacional
        name: '', id: '', phone: '', email: '',
        // Corporativo
        company: '', nit: '', costCenter: '', employeeCode: '',
        // General
        destination: '', suggestedDates: '', dateStart: '', dateEnd: '', duration: '', planType: '',
        adultsAffiliate: 1, adultsNonAffiliate: 0, children: 0, infants: 0
    });

    const [flights, setFlights] = useState([
        { id: 1, airline: '', flight: '', route: '', depTime: '', arrTime: '', flightDate: '', class: '', bag: '', photo: DEFAULT_IMAGES.flight }
    ]);
    const [includeAir, setIncludeAir] = useState(activeSubTab !== 'terrestre');
    const [showLuggage, setShowLuggage] = useState(false);
    const [luggage, setLuggage] = useState({
        personal: true,
        hand: true,
        checked: false
    });
    const [groundLogistics, setGroundLogistics] = useState({
        meetPoint: '', meetDate: '', meetTime: '', operator: ''
    });

    const [hotels, setHotels] = useState([
        {
            id: 1,
            name: '',
            category: '',
            room: '',
            observaciones: '',
            includes: '',
            images: [DEFAULT_IMAGES.lodging],
            showGallery: false,
            showItinerary: false,
            showExpectedHotels: false,
            expectedHotelsImage: DEFAULT_IMAGES.lodging,
            itineraryText: '',
            pricing: {
                adultAffiliateRate: '',
                adultNonAffiliateRate: '',
                childRate: '',
                infantRate: '',
                totalToPay: '',
                isTotalManual: false
            }
        }
    ]);

    const [extras, setExtras] = useState({
        includes: '',
        excludes: '',
        notes: ''
    });

    const [corporateOptions, setCorporateOptions] = useState({
        flexibleFare: false,
        corporateAgreement: false,
        agreementCode: ''
    });
    const [selectedCorporateBrand, setSelectedCorporateBrand] = useState(null);
    const [generalConditions, setGeneralConditions] = useState(DEFAULT_CONDITIONS);
    const [isEditingConditions, setIsEditingConditions] = useState(false);
    const DEFAULT_DOCUMENTS = 'Cédula de ciudadanía original\nPasaporte vigente (Solo vuelos internacionales)\nVisas o permisos de ingreso (si aplica)\nVacuna de Fiebre Amarilla (si aplica)';
    const [documentsInfo, setDocumentsInfo] = useState(DEFAULT_DOCUMENTS);
    const [isEditingDocuments, setIsEditingDocuments] = useState(false);
    const [closingNote, setClosingNote] = useState(DEFAULT_CLOSING_NOTE);
    const [isEditingClosingNote, setIsEditingClosingNote] = useState(false);
    const DEFAULT_OBSERVATIONS_TEXT = `Aplica penalidad por cambios y cancelaciones.\nDespués de emitido el tiquete todo cambio genera penalidad.\nLos reembolsos solo aplican si las condiciones de la tarifa lo permiten.`;
    const [observacionesImportantes, setObservacionesImportantes] = useState(DEFAULT_OBSERVATIONS_TEXT);
    const [currency, setCurrency] = useState('COP');
    const [showErrors, setShowErrors] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const [ownerId, setOwnerId] = useState(null);
    const [pendingDraft, setPendingDraft] = useState(null);

    // Quinceañeras Special States
    const [mainPhoto, setMainPhoto] = useState(DEFAULT_IMAGES.DESTINATION);
    const [itineraryTable, setItineraryTable] = useState([
        { day: '1', city: '', description: '' }
    ]);

    // Contexto de usuario prop ya viene en SmartQuoteForm({ user, ... })
    // Evitamos el shadowing
    const internalUser = user || { id: 'advisor-1', email: 'vendedor@destinospp.com' };

    // Sincronizar reglas administrativas
    useEffect(() => {
        if (config?.commissions) {
            // Aquí se podría forzar la comisión mínima, etc.
        }
    }, [config]);

    useEffect(() => {
        setQuoteType(isCorporateModule ? 'corporativo' : 'vacacional');
    }, [activeSubTab, isCorporateModule]);

    // ===== EFECTO DE RE-COTIZACIÓN (Clonar datos desde Historial) =====
    useEffect(() => {
        if (!cloneDataRef || !cloneDataRef.current) return;

        const d = cloneDataRef.current;

        // 1. Datos del cliente — mapeo correcto a los campos internos del form
        setClientData(prev => ({
            ...prev,
            name: d.clientName || '',
            company: d.clientName || '', // Support corporativo fields
            employeeCode: d.employeeCode || '',
            id: d.clientId || '',
            nit: d.clientNit || '',
            costCenter: d.clientCostCenter || '',
            phone: d.clientPhone || '',
            email: d.clientEmail || '',
            destination: d.destination || '',
            suggestedDates: d.suggestedDates || '',
            dateStart: d.dateStart || '',
            dateEnd: d.dateEnd || '',
            duration: d.duration || '',
            planType: d.planType || '',
            adultsAffiliate: d.adultsAffiliate || 1,
            adultsNonAffiliate: d.adultsNonAffiliate || 0,
            children: d.children || 0,
            infants: d.infants || 0,
        }));

        // 2. Hoteles/Alojamientos con fotos e itinerario incluidos
        if (Array.isArray(d.hotels) && d.hotels.length > 0) {
            setHotels(d.hotels);
        }

        // 3. Vuelos
        if (Array.isArray(d.flights) && d.flights.length > 0) {
            setFlights(d.flights);
        }

        // 4. Extras (includes/excludes/notes)
        if (d.extras || d.excludes || d.notes) {
            setExtras(prev => ({
                ...prev,
                ...(d.extras || {}),
                excludes: d.excludes || d.extras?.excludes || prev.excludes,
                notes: d.notes || d.extras?.notes || prev.notes,
            }));
        }

        // 5. Equipaje
        if (d.luggage) setLuggage(d.luggage);

        // 6. Moneda
        if (d.currency) setCurrency(d.currency);

        // 7. Logística terrestre
        if (d.groundLogistics) setGroundLogistics(d.groundLogistics);

        // 8. Brand corporativo
        if (d.corporateBrand) setSelectedCorporateBrand(d.corporateBrand);

        // 9. Campos legales (con fallback a defaults si no existen en el historial)
        if (d.generalConditions) setGeneralConditions(d.generalConditions);
        if (d.documentsInfo) setDocumentsInfo(d.documentsInfo);
        if (d.closingNote) setClosingNote(d.closingNote);
        if (d.observacionesImportantes) setObservacionesImportantes(d.observacionesImportantes);

        // 10. Quinceañeras Data
        if (d.itineraryTable) setItineraryTable(d.itineraryTable);
        if (d.mainPhoto) setMainPhoto(d.mainPhoto);

        // 11. Folio: ya viene asignado por handleReCotizar en QuotesPage

        // 12. Ir al Paso 3 para revisión rápida antes de guardar
        setCurrentStep(3);

        // 12. Limpiar canal para evitar re-ejecución en renders siguientes
        cloneDataRef.current = null;
    }, [cloneDataRef]);

    // --- Resumen de Inversión (Ahora vinculado a cada hotel) ---
    // Auto-calcular el total para cada hotel cuando cambian tarifas o pasajeros
    useEffect(() => {
        setHotels(prev => prev.map(h => {
            const adultsAff = parseInt(clientData.adultsAffiliate) || 0;
            const adultsNon = parseInt(clientData.adultsNonAffiliate) || 0;
            const children = parseInt(clientData.children) || 0;
            const infants = parseInt(clientData.infants) || 0;

            const rateAff = parseFloat(String(h.pricing.adultAffiliateRate).replace(/,/g, '')) || 0;
            const rateNon = parseFloat(String(h.pricing.adultNonAffiliateRate).replace(/,/g, '')) || 0;
            const rateC = parseFloat(String(h.pricing.childRate).replace(/,/g, '')) || 0;
            const rateI = parseFloat(String(h.pricing.infantRate).replace(/,/g, '')) || 0;

            const computed = quoteType === 'vacacional'
                ? (adultsAff * rateAff) + (children * rateC) + (infants * rateI)
                : (adultsAff * rateAff) + (adultsNon * rateNon) + (children * rateC) + (infants * rateI);

            return {
                ...h,
                pricing: {
                    ...h.pricing,
                    totalToPay: computed > 0 ? computed.toFixed(2) : ''
                }
            };
        }));
    }, [
        clientData.adultsAffiliate,
        clientData.adultsNonAffiliate,
        clientData.children,
        clientData.infants,
        JSON.stringify(hotels.map(h => ({
            aA: h.pricing.adultAffiliateRate,
            aN: h.pricing.adultNonAffiliateRate,
            c: h.pricing.childRate,
            i: h.pricing.infantRate,
            m: h.pricing.isTotalManual
        })))
    ]);

    // Lógica de Cálculo Automático de Duración
    useEffect(() => {
        const { dateStart, dateEnd } = clientData;
        if (dateStart && dateEnd) {
            const start = new Date(dateStart);
            const end = new Date(dateEnd);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const diffTime = end.getTime() - start.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0) {
                    const nights = diffDays;
                    const days = diffDays + 1;
                    const calculatedDuration = `${days} Días / ${nights} Noches`;

                    if (clientData.duration !== calculatedDuration) {
                        setClientData(prev => ({
                            ...prev,
                            duration: calculatedDuration
                        }));
                    }
                }
            }
        }
    }, [clientData.dateStart, clientData.dateEnd]);

    // --- Quinceañeras Handlers ---
    const addItineraryRow = () => {
        setItineraryTable(prev => [...prev, { day: String(prev.length + 1), city: '', description: '' }]);
    };

    const removeItineraryRow = (index) => {
        if (itineraryTable.length > 1) {
            setItineraryTable(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleItineraryChange = (index, field, value) => {
        setItineraryTable(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
    };

    const handleMainPhotoChange = async (e) => {
        const compressed = await processImageUpload(e);
        if (compressed) {
            setMainPhoto(compressed);
        }
    };

    // Mostrar equipaje automáticamente si hay vuelos cargados
    useEffect(() => {
        if (flights && flights.length > 0 && flights.some(f => f.airline)) {
            setShowLuggage(true);
        }
    }, [flights]);

    // Cargar borrador al montar si el usuario tiene uno
    useEffect(() => {
        if (internalUser?.id && !previewFolio) {
            QuotesApi.getDraftByUserId(internalUser.id).then(draft => {
                if (draft && draft.folio) {
                    setPendingDraft(draft);
                }
            });
        }
    }, [internalUser?.id, previewFolio]);

    // Generar Folio Automático al iniciar el Paso 1 (sin auto-guardar vacío)
    useEffect(() => {
        const initFolio = async () => {
            if (currentStep === 1 && !previewFolio && !pendingDraft) {

                const tempFolio = `TEMP-${Date.now()}`;
                setPreviewFolio(tempFolio);

                try {

                    const officialFolio = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab));

                    setPreviewFolio(officialFolio);
                } catch (error) {

                    // We keep the temp folio to allow the user to advance
                }
            }
        };
        initFolio();
    }, [currentStep, previewFolio, pendingDraft, quoteType]);

    // Auto-guardado en debouncing cada 3 segundos tras cambios (solo si ya hay cliente)
    useEffect(() => {
        if (isReadOnly) return;
        const clientName = quoteType === 'vacacional' ? clientData.name : clientData.company;
        const hasClientData = clientName && String(clientName).trim() !== '';

        if (previewFolio && hasClientData) {
            const timer = setTimeout(() => {
                handleFinalSave(false, true); // Supabase guardado silencioso
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [
        clientData, flights, hotels, extras, luggage, groundLogistics,
        corporateOptions, selectedCorporateBrand, generalConditions,
        documentsInfo, closingNote, observacionesImportantes,
        currency, currentStep, quoteType, activeSubTab, itineraryTable
    ]);

    // Handlers
    const addFlight = () => setFlights([...flights, { id: Date.now(), airline: '', flight: '', route: '', depTime: '', arrTime: '', flightDate: '', class: '', bag: '', photo: DEFAULT_IMAGES.flight }]);
    const removeFlight = (id) => setFlights(flights.filter(f => f.id !== id));
    const handleFlightChange = (id, field, value) => setFlights(flights.map(f => f.id === id ? { ...f, [field]: value } : f));
    const addHotel = () => {
        const newId = hotels.length > 0 ? Math.max(...hotels.map(h => h.id)) + 1 : 1;
        setHotels([...hotels, {
            id: newId,
            name: '',
            category: '',
            room: '',
            observaciones: '',
            includes: '',
            images: [DEFAULT_IMAGES.lodging],
            showGallery: false,
            showItinerary: false,
            showExpectedHotels: false,
            expectedHotelsImage: DEFAULT_IMAGES.lodging,
            itineraryText: '',
            pricing: {
                adultAffiliateRate: '',
                adultNonAffiliateRate: '',
                childRate: '',
                infantRate: '',
                totalToPay: '',
                isTotalManual: false
            }
        }]);
    };
    const removeHotel = (id) => !isReadOnly && setHotels(hotels.filter(h => h.id !== id));
    const handleHotelChange = (id, field, value) => !isReadOnly && setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
    const handleHotelPricingChange = (id, field, value) => {
        if (isReadOnly) return;
        setHotels(prev => prev.map(h => h.id === id ? {
            ...h,
            pricing: {
                ...h.pricing,
                [field]: value,
                isTotalManual: false
            }
        } : h));
    };


    const handleConvertToConfirmation = () => {
        setFormData(prev => ({
            ...prev,
            clientName: quoteType === 'vacacional' ? clientData.name : clientData.company,
            destination: clientData.destination,
        }));
        setActiveMainTab('confirmation');
    };

    const handleFinalSave = async (generatePdf = false, isSilentDraft = false) => {
        if (isReadOnly) return;
        if (!isSilentDraft) {

            setIsSaving(true);
            setSaveStatus('Certificando Folio...');
        }
        try {
            let folio = previewFolio;
            // EMERGENCY RULE: Only block on Folios.getNext if we have a TEMP id or no id at all.
            if (!folio || folio.startsWith('TEMP')) {

                folio = await Folios.getNext(quoteType === 'corporativo' ? 'COT-COR' : 'COT-VAC', getSubKeyFromTab(activeSubTab));

                setPreviewFolio(folio);
            }



            const flightsForPayload = Array.isArray(flights)
                ? flights.map(f => ({
                    airline: f.airline || '',
                    flight: f.flight || '',
                    route: f.route || '',
                    depTime: f.depTime || '',
                    arrTime: f.arrTime || '',
                    class: f.class || '',
                    observaciones: f.observaciones || '',
                    flightDate: f.flightDate || ''
                }))
                : [];

            const allIncludes = extras.includes || '';

            const payload = {
                folio,
                clientName: quoteType === 'vacacional' ? clientData.name : clientData.company,
                clientId: clientData.id || '',
                clientNit: clientData.nit || '',
                clientCostCenter: clientData.costCenter || '',
                clientEmail: clientData.email,
                clientPhone: clientData.phone,
                destination: clientData.destination,
                suggestedDates: clientData.suggestedDates,
                duration: clientData.duration,
                planType: clientData.planType,
                adults: (parseInt(clientData.adultsAffiliate) || 0) + (parseInt(clientData.adultsNonAffiliate) || 0),
                adultsAffiliate: clientData.adultsAffiliate,
                adultsNonAffiliate: clientData.adultsNonAffiliate,
                children: clientData.children,
                infants: clientData.infants,
                dateStart: clientData.dateStart,
                dateEnd: clientData.dateEnd,
                hotels, // Contiene imágenes y pricing por hotel
                includes: allIncludes,
                excludes: extras.excludes || '',
                notes: extras.notes,
                flights: flightsForPayload,
                luggage,
                corporateBrand: quoteType === 'corporativo' ? selectedCorporateBrand : null,
                groundLogistics: activeSubTab === 'terrestre' ? groundLogistics : null,
                itineraryTable: activeSubTab === 'quince' ? itineraryTable : null,
                mainPhoto: activeSubTab === 'quince' ? mainPhoto : (hotels[0]?.images?.[0] || DEFAULT_IMAGES.DESTINATION),
                quoteType: activeSubTab === 'quince' ? 'quince' : quoteType,
                currentStep,
                status: generatePdf ? 'completado' : 'draft',
                createdAt: new Date().toISOString(),
                advisorName,
                advisorRole,
                generalConditions,
                documentsInfo,
                currency,
                closingNote,
                observacionesImportantes
            };
            const result = await QuotesApi.createQuote(payload, user);
            if (result.ok) {
                if (!isSilentDraft) setSaveStatus('¡Guardado con éxito!');
                if (generatePdf) {
                    // Validar que al menos la primera opción tenga un total calculado
                    const firstTotal = parseFloat(String(hotels[0]?.pricing?.totalToPay || 0).replace(/,/g, '')) || 0;
                    if (firstTotal <= 0) {
                        alert('Por favor ingrese tarifas en la Propuesta Económica antes de generar el PDF.');
                        if (!isSilentDraft) setIsSaving(false);
                        return;
                    }
                    generateQuotePdf({
                        ...payload,
                        duration: clientData.duration,
                        children: clientData.children,
                        infants: clientData.infants,
                        currency
                    });
                }
            } else {
                if (!isSilentDraft) setSaveStatus('Error al guardar: ' + result.error);
            }
        } catch (error) {
            if (!isSilentDraft) setSaveStatus('Error crítico al guardar.');
        } finally {
            if (!isSilentDraft) setIsSaving(false);
            if (!isSilentDraft) setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    // Stepper Colors & Glow
    const getStepColor = (step) => {
        switch (step) {
            case 1: return 'blue';
            case 2: return 'yellow'; // Gold
            case 3: return 'emerald'; // Green
            case 4: return 'cyan';
            default: return 'slate';
        }
    };

    const isFilled = (v) => {
        if (v === 0) return true;
        if (typeof v === 'number') return !Number.isNaN(v);
        return v !== null && v !== undefined && String(v).trim() !== '';
    };

    const validateStep = () => {
        console.group(`[SmartQuoteForm] Validating Step ${currentStep}`);

        console.groupEnd();
        return true; // Bypass all validations per user request (Tolerancia Cero)
    };

    const renderStepIndicator = () => (
        <div className="flex justify-between items-center mb-8 px-4 relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-700/50 -z-0"></div>
            {[
                { num: 1, label: 'Información Base', color: 'blue' },
                { num: 2, label: 'Itinerario', color: 'yellow' },
                { num: 3, label: 'Revisión', color: 'emerald' },
                { num: 4, label: 'Finalización', color: 'cyan' }
            ].map((s) => {
                const isActive = currentStep === s.num;
                const isCompleted = currentStep > s.num;
                let activeClass = "";
                if (s.color === 'blue') activeClass = isActive || isCompleted ? "border-blue-500 text-blue-400 bg-blue-900/50 shadow-blue-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                if (s.color === 'yellow') activeClass = isActive || isCompleted ? "border-yellow-500 text-yellow-400 bg-yellow-900/50 shadow-yellow-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                if (s.color === 'emerald') activeClass = isActive || isCompleted ? "border-emerald-500 text-emerald-400 bg-emerald-900/50 shadow-emerald-500/50" : "border-slate-700 text-slate-600 bg-slate-900";
                if (s.color === 'cyan') activeClass = isActive || isCompleted ? "border-cyan-500 text-cyan-400 bg-cyan-900/50 shadow-cyan-500/50" : "border-slate-700 text-slate-600 bg-slate-900";

                return (
                    <button
                        key={s.num}
                        className="relative z-10 flex flex-col items-center cursor-pointer"
                        onClick={() => setCurrentStep(s.num)}
                    >
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 ${activeClass} ${isActive ? 'shadow-lg scale-110' : ''}`}>
                            {isCompleted ? <Check className="w-5 h-5" /> : s.num}
                        </div>
                        <span className={`text-[10px] uppercase font-bold mt-2 tracking-wider ${isActive || isCompleted ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
                    </button>
                );
            })}
        </div>
    );

    const RecoveryModal = () => {
        if (!pendingDraft) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
                    <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                        <span className="w-8 h-8 text-blue-400 animate-spin-slow">🔄</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Borrador Detectado</h2>
                        <p className="text-slate-400 text-xs">Tienes una cotización en curso con el Folio <span className="text-blue-400 font-mono font-bold">{pendingDraft.folio}</span>. ¿Deseas continuar donde lo dejaste?</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPendingDraft(null)}
                            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold uppercase hover:bg-slate-700 transition-colors"
                        >
                            Empezar Nueva
                        </button>
                        <button
                            onClick={() => {
                                setPreviewFolio(pendingDraft.folio);
                                // Restaurar datos
                                if (pendingDraft.clientName) {
                                    setClientData(prev => ({
                                        ...prev,
                                        name: pendingDraft.clientName,
                                        company: pendingDraft.clientName,
                                        email: pendingDraft.clientEmail,
                                        phone: pendingDraft.clientPhone,
                                        destination: pendingDraft.destination,
                                        duration: pendingDraft.duration,
                                        adultsAffiliate: pendingDraft.adultsAffiliate || pendingDraft.adults || 1,
                                        adultsNonAffiliate: pendingDraft.adultsNonAffiliate || 0,
                                        children: pendingDraft.children,
                                        infants: pendingDraft.infants,
                                        dateStart: pendingDraft.dateStart,
                                        dateEnd: pendingDraft.dateEnd
                                    }));
                                }
                                if (pendingDraft.flights) setFlights(pendingDraft.flights);
                                if (pendingDraft.hotels) setHotels(pendingDraft.hotels);
                                if (pendingDraft.currency) setCurrency(pendingDraft.currency);
                                if (pendingDraft.luggage) setLuggage(pendingDraft.luggage);

                                setClosingNote(pendingDraft.closingNote || DEFAULT_CLOSING_NOTE);

                                setPendingDraft(null);
                            }}
                            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold uppercase hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ReadOnlyBanner = () => {
        if (!isReadOnly) return null;
        return (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                    <span className="w-5 h-5 text-amber-500">🔒</span>
                    <div>
                        <p className="text-amber-500 text-[11px] font-black uppercase tracking-widest">Modo Solo Lectura</p>
                        <p className="text-slate-400 text-[10px]">Esta cotización pertenece a otro asesor. No tienes permisos para editarla.</p>
                    </div>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase bg-slate-800 px-3 py-1 rounded-full border border-white/5">
                    Propiedad de: {ownerId || 'Otro Asesor'}
                </div>
            </div>
        );
    };

    const renderClientCard = () => (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
            <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                Datos del {quoteType === 'vacacional' ? 'Titular' : 'Solicitante'}
            </h3>

            {quoteType === 'vacacional' ? (
                <>
                    <div className="group">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Nombre Completo</label>
                        <input
                            className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.name) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                            value={clientData.name}
                            onChange={e => setClientData({ ...clientData, name: e.target.value })}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Identificación</label>
                            <input
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.id) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                                value={clientData.id}
                                onChange={e => setClientData({ ...clientData, id: e.target.value })}
                                readOnly={isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Celular</label>
                            <input
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.phone) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                                value={clientData.phone}
                                onChange={e => setClientData({ ...clientData, phone: e.target.value })}
                                readOnly={isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Email</label>
                            <input
                                type="email"
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.email) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                                value={clientData.email}
                                onChange={e => setClientData({ ...clientData, email: e.target.value })}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="group">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Razón Social / Empresa</label>
                        <input
                            className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-all outline-none ${showErrors && !isFilled(clientData.company) ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-slate-700 focus:border-blue-500'} ${(selectedCorporateBrand || isReadOnly) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            value={clientData.company}
                            onChange={e => setClientData({ ...clientData, company: e.target.value })}
                            readOnly={!!selectedCorporateBrand || isReadOnly}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">NIT</label>
                            <input
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-all outline-none ${showErrors && !isFilled(clientData.nit) ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-slate-700 focus:border-blue-500'} ${(selectedCorporateBrand || isReadOnly) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                value={clientData.nit}
                                onChange={e => setClientData({ ...clientData, nit: e.target.value })}
                                readOnly={!!selectedCorporateBrand || isReadOnly}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Centro de Costos</label>
                            <input
                                className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-all outline-none ${showErrors && !isFilled(clientData.costCenter) ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                                value={clientData.costCenter}
                                onChange={e => setClientData({ ...clientData, costCenter: e.target.value })}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">SOLICITANTE</label>
                        <input
                            className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-all outline-none ${showErrors && !isFilled(clientData.employeeCode) ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                            value={clientData.employeeCode}
                            onChange={e => setClientData({ ...clientData, employeeCode: e.target.value })}
                            readOnly={isReadOnly}
                        />
                    </div>
                </>
            )}
        </div>
    );

    const renderDestinationCard = () => (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-4">
            <h3 className="text-blue-400 font-bold uppercase text-xs tracking-wider border-b border-slate-700 pb-2 mb-4">
                Detalles del Destino
            </h3>
            <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Destino Principal</label>
                <input
                    className={`w-full bg-slate-900 border rounded-xl p-3 text-white font-bold text-lg transition-colors outline-none uppercase ${showErrors && !isFilled(clientData.destination) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                    placeholder="EJ. MIAMI, FL"
                    value={clientData.destination}
                    onChange={e => setClientData({ ...clientData, destination: e.target.value })}
                    readOnly={isReadOnly}
                />
            </div>
            <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Sugerida de Viaje</label>
                <input
                    className={`w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                    placeholder="Ej: Mediados de Julio 2026"
                    value={clientData.suggestedDates}
                    onChange={e => setClientData({ ...clientData, suggestedDates: e.target.value })}
                    readOnly={isReadOnly}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Salida</label>
                    <input
                        type="date"
                        className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.dateStart) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                        value={clientData.dateStart}
                        onChange={e => setClientData({ ...clientData, dateStart: e.target.value })}
                        readOnly={isReadOnly}
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Fecha Regreso</label>
                    <input
                        type="date"
                        className={`w-full bg-slate-900 border rounded-xl p-3 text-white transition-colors outline-none ${showErrors && !isFilled(clientData.dateEnd) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                        value={clientData.dateEnd}
                        onChange={e => setClientData({ ...clientData, dateEnd: e.target.value })}
                        readOnly={isReadOnly}
                    />
                </div>
            </div>
            {
                activeSubTab === 'quince' && (
                    <div className="mt-4">
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Tipo de Plan</label>
                        <input
                            className={`w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                            placeholder="Ej: Plan Luxury Platinum"
                            value={clientData.planType || ''}
                            onChange={e => setClientData({ ...clientData, planType: e.target.value })}
                            readOnly={isReadOnly}
                        />
                    </div>
                )
            }
            <div className="mt-4">
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Duración del Viaje</label>
                <input
                    className={`w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white transition-colors outline-none focus:border-blue-500 ${isReadOnly ? 'opacity-70' : ''}`}
                    placeholder="Ej: 4 Días / 3 Noches"
                    value={clientData.duration}
                    onChange={e => setClientData({ ...clientData, duration: e.target.value })}
                    readOnly={isReadOnly}
                />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">
                        {quoteType === 'vacacional' ? 'Adultos' : 'Adultos Afil.'}
                    </label>
                    <div className="relative">
                        <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                            type="number"
                            min="0"
                            className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && clientData.adultsAffiliate === 0 && (quoteType === 'vacacional' || clientData.adultsNonAffiliate === 0) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                            placeholder="0"
                            value={clientData.adultsAffiliate}
                            onChange={e => setClientData({ ...clientData, adultsAffiliate: Math.max(0, parseInt(e.target.value) || 0) })}
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>
                {quoteType !== 'vacacional' && (
                    <div>
                        <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">Adultos No Afil.</label>
                        <div className="relative">
                            <UserPlus className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="number"
                                min="0"
                                className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && clientData.adultsAffiliate === 0 && clientData.adultsNonAffiliate === 0 ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                                placeholder="0"
                                value={clientData.adultsNonAffiliate}
                                onChange={e => setClientData({ ...clientData, adultsNonAffiliate: Math.max(0, parseInt(e.target.value) || 0) })}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">Niños</label>
                    <div className="relative">
                        <Users2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                            type="number"
                            min="0"
                            className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && (clientData.children === '' || isNaN(clientData.children)) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                            placeholder="0"
                            value={clientData.children}
                            onChange={e => setClientData({ ...clientData, children: Math.max(0, parseInt(e.target.value) || 0) })}
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1 line-clamp-1">Infantes</label>
                    <div className="relative">
                        <Baby className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                        <input
                            type="number"
                            min="0"
                            className={`w-full bg-slate-900 border rounded-xl pl-10 p-3 text-white transition-colors outline-none ${showErrors && (clientData.infants === '' || isNaN(clientData.infants)) ? 'border-red-500/50 focus:border-red-400' : 'border-slate-700 focus:border-blue-500'} ${isReadOnly ? 'opacity-70' : ''}`}
                            placeholder="0"
                            value={clientData.infants}
                            onChange={e => setClientData({ ...clientData, infants: Math.max(0, parseInt(e.target.value) || 0) })}
                            readOnly={isReadOnly}
                        />
                    </div>
                </div>
            </div>
        </div >
    );

    return (
        <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 p-6 md:p-10 relative overflow-hidden flex flex-col h-full animate-fade-in">
            {/* Header / Step Indicator */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-full bg-${getStepColor(currentStep)}-500/10 border border-${getStepColor(currentStep)}-500/20 text-${getStepColor(currentStep)}-400 text-[10px] font-black uppercase tracking-[0.2em]`}>
                            Paso {currentStep} de 4
                        </div>
                        <span className="text-slate-500 font-mono text-xs font-bold">{previewFolio}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                            <button
                                onClick={() => step < currentStep && setCurrentStep(step)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all duration-500 relative group ${currentStep === step
                                    ? `bg-${getStepColor(step)}-600 text-white shadow-lg shadow-${getStepColor(step)}-500/30 scale-110`
                                    : step < currentStep
                                        ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                                {currentStep === step && <div className={`absolute -inset-1 bg-${getStepColor(step)}-500/20 rounded-xl animate-pulse`}></div>}
                            </button>
                            {step < 4 && <div className={`w-4 h-0.5 mx-1 rounded-full ${step < currentStep ? `bg-${getStepColor(step)}-600` : 'bg-slate-800'}`}></div>}
                        </div>
                    ))}
                </div>
            </div>

            <RecoveryModal />
            <ReadOnlyBanner />

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-6">
                {/* PASO 1: INFORMACIÓN BASE */}
                {currentStep === 1 && (
                    <div className="space-y-8 animate-fade-in transition-all duration-500">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
                            <div className="text-left">
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {activeSubTab === 'quince' ? 'Propuesta Quinceañeras Luxury' : (quoteType === 'vacacional' ? 'Información del Viaje' : 'Corporativo')}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    {activeSubTab === 'quince' ? 'Configure una experiencia premium para la quinceañera.' : 'Ingrese los datos principales para iniciar la cotización.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-start md:justify-end">
                                <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl font-bold shadow-lg shadow-yellow-500/20 text-xs sm:text-sm">
                                    Cotización No {previewFolio || 'COT-0001'}
                                </div>
                                <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-lg">
                                    <button onClick={() => setCurrency('USD')} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${currency === 'USD' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>USD</button>
                                    <button onClick={() => setCurrency('COP')} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${currency === 'COP' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>COP</button>
                                </div>
                                <div className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-xl font-bold shadow-lg shadow-yellow-500/20 text-xs sm:text-sm">
                                    Fecha: {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {quoteType === 'vacacional' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 shadow-xl shadow-slate-900/40">
                                <div className="lg:col-span-2 space-y-6">
                                    {renderClientCard()}
                                    {renderDestinationCard()}
                                </div>
                                <div className="relative rounded-2xl overflow-hidden min-h-[220px] bg-slate-900 self-start group/banner">
                                    <img
                                        src={activeSubTab === 'quince' ? mainPhoto : (activeSubTab === 'terrestre'
                                            ? 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=1600&q=80'
                                            : 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80')}
                                        alt="Inspiración"
                                        className="w-full h-full object-cover transition-transform duration-700 opacity-90 group-hover/banner:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-4">
                                        <p className="text-white font-bold text-lg leading-tight mb-2">
                                            {activeSubTab === 'quince' ? 'Portada del Brochure' : (activeSubTab === 'terrestre' ? 'Rutas Inolvidables' : 'Experiencias Vacacionales')}
                                        </p>
                                        {activeSubTab === 'quince' && (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id="banner-upload"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleMainPhotoChange}
                                                />
                                                <label
                                                    htmlFor="banner-upload"
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-[10px] text-white font-bold uppercase cursor-pointer transition-all border border-white/20"
                                                >
                                                    <Camera className="w-3 h-3" /> Cambiar Portada
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-slate-900/40 border border-slate-700/60 rounded-2xl p-6 shadow-lg">
                                    <label className="block text-[10px] text-slate-400 uppercase font-black mb-3">Cliente Corporativo</label>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <select
                                            className="bg-slate-950 border border-slate-700/60 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-all min-w-[240px]"
                                            value={selectedCorporateBrand?.id || ''}
                                            onChange={e => {
                                                const companyId = e.target.value;
                                                const company = Array.isArray(corporateCompanies) ? corporateCompanies.find(c => c.id === companyId) : null;
                                                const brand = company ? {
                                                    id: company.id,
                                                    name: company.name,
                                                    logo: company.logo_url
                                                } : null;
                                                setSelectedCorporateBrand(brand);

                                                if (company) {
                                                    setClientData(prev => ({
                                                        ...prev,
                                                        company: company.name,
                                                        nit: company.nit || ''
                                                    }));
                                                }
                                            }}
                                        >
                                            <option value="">Seleccione Empresa (Opcional)</option>
                                            {Array.isArray(corporateCompanies) && corporateCompanies.map(company => (
                                                <option key={company.id} value={company.id}>
                                                    {company.name}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedCorporateBrand?.logo && (
                                            <div className="bg-white p-1.5 rounded-xl h-12 w-auto flex items-center justify-center shadow-lg">
                                                <img src={selectedCorporateBrand.logo} alt={selectedCorporateBrand.name} className="h-full w-auto object-contain" />
                                            </div>
                                        )}
                                        <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20">
                                            {previewFolio || 'COT-COR-0000'}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {renderClientCard()}
                                    {renderDestinationCard()}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PASO 2: ITINERARIO Y ALOJAMIENTO */}
                {currentStep === 2 && (
                    <div className="space-y-8 animate-fade-in transition-all duration-500">
                        {/* Vuelos */}
                        {activeSubTab !== 'terrestre' && (
                            <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 group-hover:w-2 transition-all"></div>
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6 pl-4">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                            <Plane className="w-5 h-5 text-yellow-400" /> Itinerario Aéreo
                                        </h3>
                                    </div>
                                    <button onClick={addFlight} className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                        <Plus className="w-3 h-3" /> Agregar
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {flights.map((flight, idx) => (
                                        <div key={flight.id} className="relative bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 transition-all hover:border-yellow-500/30 group/card">
                                            <div className="absolute -top-3 left-6 px-3 py-1 bg-yellow-600 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-yellow-400 z-10">
                                                Trayecto {idx + 1}
                                            </div>
                                            <button
                                                onClick={() => !isReadOnly && removeFlight(flight.id)}
                                                className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-2 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5">Ruta</label>
                                                        <input className={`w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white ${isReadOnly ? 'opacity-70' : ''}`} value={flight.route} onChange={e => !isReadOnly && handleFlightChange(flight.id, 'route', e.target.value)} readOnly={isReadOnly} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5">Aerolínea</label>
                                                            <input className={`w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white ${isReadOnly ? 'opacity-70' : ''}`} value={flight.airline} onChange={e => !isReadOnly && handleFlightChange(flight.id, 'airline', e.target.value)} readOnly={isReadOnly} />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5">No. Vuelo</label>
                                                            <input className={`w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white ${isReadOnly ? 'opacity-70' : ''}`} value={flight.flight} onChange={e => !isReadOnly && handleFlightChange(flight.id, 'flight', e.target.value)} readOnly={isReadOnly} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5">Fecha</label>
                                                        <input type="date" className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white" value={flight.flightDate} onChange={e => handleFlightChange(flight.id, 'flightDate', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5">Salida</label>
                                                        <input type="time" className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white" value={flight.depTime} onChange={e => handleFlightChange(flight.id, 'depTime', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] text-slate-400 uppercase font-black mb-1.5">Llegada</label>
                                                        <input type="time" className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl px-3 py-2.5 text-white" value={flight.arrTime} onChange={e => handleFlightChange(flight.id, 'arrTime', e.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Hoteles */}
                        <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500 group-hover:w-2 transition-all"></div>
                            <div className="flex justify-between items-center mb-6 pl-4">
                                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Ship className="w-5 h-5 text-yellow-400" /> Alojamiento
                                </h3>
                                <button onClick={addHotel} className="px-3 py-1.5 bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                    <Plus className="w-3 h-3" /> Agregar
                                </button>
                            </div>
                            <div className="grid gap-4">
                                {hotels.map((hotel, idx) => (
                                    <div key={hotel.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 space-y-4">
                                        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
                                            <div className="flex-1 min-w-[160px]">
                                                <input className={`w-full bg-transparent text-white font-bold text-lg outline-none uppercase ${isReadOnly ? 'opacity-70' : ''}`} placeholder="Nombre del alojamiento..." value={hotel.name} onChange={e => handleHotelChange(hotel.id, 'name', e.target.value)} readOnly={isReadOnly} />
                                            </div>
                                            <div className="w-40">
                                                <input className={`w-full bg-transparent text-slate-300 text-sm outline-none ${isReadOnly ? 'opacity-70' : ''}`} placeholder="CATEGORÍA" value={hotel.category} onChange={e => handleHotelChange(hotel.id, 'category', e.target.value)} readOnly={isReadOnly} />
                                            </div>
                                            <div className="w-32">
                                                <input className={`w-full bg-transparent text-slate-300 text-sm outline-none ${isReadOnly ? 'opacity-70' : ''}`} placeholder="HABITACIÓN" value={hotel.room} onChange={e => handleHotelChange(hotel.id, 'room', e.target.value)} readOnly={isReadOnly} />
                                            </div>
                                            <button onClick={() => removeHotel(hotel.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Itinerario Estructurado (Solo Quinceañeras) */}
                        {activeSubTab === 'quince' && (
                            <section className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:w-2 transition-all"></div>
                                <div className="flex justify-between items-center mb-6 pl-4">
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                        <CalendarHeart className="w-5 h-5 text-blue-400" /> Itinerario Detallado (Día a Día)
                                    </h3>
                                    <button onClick={addItineraryRow} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                                        <Plus className="w-3 h-3" /> Agregar Día
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {itineraryTable.map((row, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-3 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all">
                                            <div className="col-span-1">
                                                <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">Día</label>
                                                <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center text-sm" value={row.day} onChange={e => handleItineraryChange(idx, 'day', e.target.value)} />
                                            </div>
                                            <div className="col-span-4">
                                                <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">Ciudad / Actividad</label>
                                                <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" placeholder="Ej: Bogotá" value={row.city} onChange={e => handleItineraryChange(idx, 'city', e.target.value)} />
                                            </div>
                                            <div className="col-span-6">
                                                <label className="block text-[9px] text-slate-500 uppercase font-black mb-1">Descripción</label>
                                                <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-sm" placeholder="Detalle del día..." value={row.description} onChange={e => handleItineraryChange(idx, 'description', e.target.value)} />
                                            </div>
                                            <div className="col-span-1 flex items-end justify-center pb-1">
                                                <button onClick={() => removeItineraryRow(idx)} className="text-slate-600 hover:text-red-400 p-1.5 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}

                {/* PASO 3: REVISIÓN Y EXTRAS */}
                {currentStep === 3 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl">
                                <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" /> Incluye
                                </h3>
                                <textarea
                                    className="w-full bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3 text-emerald-100 text-sm h-40 outline-none"
                                    value={extras.includes || ''}
                                    onChange={(e) => setExtras({ ...extras, includes: e.target.value })}
                                />
                            </div>
                            <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-2xl">
                                <h3 className="text-red-400 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" /> No Incluye
                                </h3>
                                <textarea
                                    className="w-full bg-slate-950/60 border border-red-500/20 rounded-xl p-3 text-red-100 text-sm h-40 outline-none"
                                    value={extras.excludes || ''}
                                    onChange={(e) => setExtras({ ...extras, excludes: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Propuesta Económica */}
                        <div className="space-y-6">
                            {hotels.map((hotel, hIdx) => (
                                <section key={hotel.id} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:w-2 transition-all"></div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-6">
                                        <DollarSign className="w-5 h-5 text-emerald-400" /> Propuesta Económica: {hotel.name || 'Sin Nombre'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {activeSubTab === 'quince' ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] text-slate-400 uppercase font-black mb-1 block">Valor Base</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                                                            <input
                                                                type="number"
                                                                className="w-full pl-7 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                                                                value={hotel.pricing.adultAffiliateRate}
                                                                onChange={(e) => handleHotelPricingChange(hotel.id, 'adultAffiliateRate', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-slate-400 uppercase font-black mb-1 block">Otros Valores/Tasas</label>
                                                        <input
                                                            type="number"
                                                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                                                            value={hotel.pricing.childRate}
                                                            onChange={(e) => handleHotelPricingChange(hotel.id, 'childRate', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-end">
                                                    <div className="w-full px-4 py-3 bg-yellow-500 text-slate-900 rounded-xl font-black flex justify-between items-center shadow-lg shadow-yellow-500/20">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] uppercase tracking-tighter opacity-70">Total Orientativo</span>
                                                            <span className="text-xs">{hotel.room}</span>
                                                        </div>
                                                        <span className="text-xl">
                                                            {currency} {((parseFloat(hotel.pricing.adultAffiliateRate) || 0) + (parseFloat(hotel.pricing.childRate) || 0)).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <label className="text-xs text-slate-400 mb-1 block">
                                                        {quoteType === 'vacacional' ? `Tarifa Adulto (${currency})` : `Tarifa Adulto Afiliado (${currency})`}
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                                        <input
                                                            type="number"
                                                            className="w-full pl-7 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 transition-all"
                                                            value={hotel.pricing.adultAffiliateRate}
                                                            onChange={(e) => handleHotelPricingChange(hotel.id, 'adultAffiliateRate', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-end">
                                                    <div className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-bold">
                                                        Total: {currency} {parseFloat(hotel.pricing.totalToPay || 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </section>
                            ))}
                        </div>
                    </div>
                )}

                {/* PASO 4: FINALIZACIÓN */}
                {currentStep === 4 && (
                    <div className="flex flex-col items-center justify-center py-12 animate-fade-in space-y-8 text-center">
                        <div className="w-24 h-24 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 relative">
                            <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                            <CheckCircle className="w-12 h-12 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white mb-2">¡Cotización Lista!</h2>
                            <p className="text-slate-400">La cotización ha sido completada con éxito.</p>
                        </div>
                        <button
                            onClick={() => handleFinalSave(true)}
                            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
                        >
                            <FileDown className="w-5 h-5" /> {isSaving ? 'Guardando...' : 'Descargar PDF'}
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Navigation */}
            <div className="border-t border-slate-700/50 pt-6 mt-auto flex justify-between items-center relative z-10 bg-slate-900/40 -mx-6 px-6 -mb-6 pb-6 rounded-b-3xl">
                <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                    <ArrowLeft className="w-4 h-4" /> Anterior
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault();


                            try {
                                if (!validateStep()) {

                                    setShowErrors(true);
                                    return;
                                }
                                setShowErrors(false);

                                setCurrentStep(prev => {
                                    const next = Math.min(4, prev + 1);

                                    return next;
                                });
                            } catch (err) {

                                alert("Error técnico al avanzar: " + err.message);
                            }
                        }}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                    >
                        Siguiente Paso <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Proceso Finalizado
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartQuoteForm;
