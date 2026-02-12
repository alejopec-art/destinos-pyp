import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPanel from './AdminPanel';

const AdminDashboard = () => {
    const navigate = useNavigate();

    // --- ESTADO ADMINISTRATIVO GLOBAL (MAESTRO) ---
    // Duplicado de QuotesPage para simular la persistencia en esta vista independiente
    const [adminConfig, setAdminConfig] = useState({
        limits: { minPrice: 1000000, minMargin: 10 },
        inventory: [
            { name: 'Hotel Decameron', type: 'Hotel', active: true },
            { name: 'Tour Xcaret', type: 'Actividad', active: true },
            { name: 'Vuelos Charter', type: 'Aéreo', active: false },
            { name: 'Assist Card', type: 'Seguros', active: true }
        ],
        commissions: { globalPercent: 12, adminFee: 50000 }
    });

    // Mock Quotes Data para Supervisión
    const [mockQuotes, setMockQuotes] = useState([
        { 
            id: 'COT-2026-001', date: '2026-02-11', advisor: 'Paola P.', client: 'Familia González', status: 'En Proceso', step: 2,
            missing: ['Vuelos', 'Hotel'],
            history: [
                { type: 'creation', action: 'CREACIÓN', timestamp: '2026-02-11 09:00 AM', user: 'Paola P.', details: 'Inicio de cotización vacacional' },
                { type: 'update', action: 'PASO 1 COMPLETO', timestamp: '2026-02-11 09:15 AM', user: 'Paola P.', details: 'Datos del cliente registrados', changes: [{ field: 'Destino', old: '-', new: 'Cancún' }] }
            ]
        },
        { 
            id: 'COT-2026-002', date: '2026-02-10', advisor: 'Carlos R.', client: 'Tech Solutions SAS', status: 'Completado', step: 4,
            missing: [],
            history: [
                { type: 'creation', action: 'CREACIÓN', timestamp: '2026-02-10 14:00 PM', user: 'Carlos R.', details: 'Cotización corporativa' },
                { type: 'update', action: 'FINALIZADO', timestamp: '2026-02-10 16:30 PM', user: 'Carlos R.', details: 'Cotización lista para envío' }
            ]
        },
        { 
            id: 'COT-2026-003', date: '2026-02-11', advisor: 'Ana M.', client: 'Juan Pérez', status: 'Incompleto', step: 1,
            missing: ['Fecha Regreso', 'Presupuesto'],
            history: [
                { type: 'creation', action: 'CREACIÓN', timestamp: '2026-02-11 11:00 AM', user: 'Ana M.', details: 'Cotización rápida' }
            ]
        }
    ]);

    const [auditLogs, setAuditLogs] = useState([
        { date: '2026-02-10', user: 'Gerencia', action: 'UPDATE', detail: 'Ajuste de margen mínimo a 10%' },
        { date: '2026-02-09', user: 'Gerencia', action: 'CRITICAL', detail: 'Desactivación proveedor Charter' }
    ]);

    const handleAdminUpdate = (newConfig) => {
        setAdminConfig(newConfig);
        setAuditLogs(prev => [{
            date: new Date().toISOString().split('T')[0],
            user: 'Gerencia',
            action: 'UPDATE',
            detail: 'Actualización de parámetros globales desde Panel Maestro'
        }, ...prev]);
    };
    
    const handleCorrectiveEdit = (quote) => {
        // En un entorno real, esto redirigiría a la página de edición de la cotización
        // Por ahora simulamos la acción
        alert(`Iniciando Edición Correctiva para ${quote.id}. (Redirección al editor de cotización)`);
        navigate(`/intranet/quotes?edit=${quote.id}`);
    };

    const handleExit = () => {
        // Redirigir a la intranet principal
        navigate('/intranet');
    };

    // Renderizamos DIRECTAMENTE el AdminPanel (Executive Suite)
    // Ocupando toda la pantalla, reemplazando el dashboard antiguo
    return (
        <div className="w-full h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
             <AdminPanel 
                config={adminConfig} 
                onUpdateConfig={handleAdminUpdate} 
                logs={auditLogs} 
                quotes={mockQuotes}
                onEditQuote={handleCorrectiveEdit}
                onExit={handleExit}
            />
        </div>
    );
};

export default AdminDashboard;
