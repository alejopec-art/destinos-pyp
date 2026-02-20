import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AccessDeniedPage = () => {
    const location = useLocation();
    const message = location.state?.message || 'Acceso Restringido';
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-200">
            <div className="bg-slate-900/80 border border-red-500/40 rounded-2xl p-8 max-w-md text-center shadow-lg shadow-red-900/30">
                <h2 className="text-xl font-bold text-red-400 mb-2">Acceso Restringido</h2>
                <p className="text-sm text-slate-200 mb-4">{message}</p>
                <Link
                    to="/intranet/dashboard"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-widest text-slate-100 border border-slate-600 transition-colors"
                >
                    Volver al panel
                </Link>
            </div>
        </div>
    );
};

export default AccessDeniedPage;

