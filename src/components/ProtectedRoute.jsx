import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ module, children }) => {
    const { user, isReady } = useAuth();
    const location = useLocation();

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
                Cargando sesión segura...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/intranet/login" replace state={{ from: location }} />;
    }

    const access = user.modules?.[module];

    if (!access) {
        return <Navigate to="/intranet/denied" replace state={{ message: 'Acceso Restringido' }} />;
    }

    return children;
};

export default ProtectedRoute;
