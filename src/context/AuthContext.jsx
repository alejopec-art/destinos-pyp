import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const RBAC_MATRIX = {
    'viajes@destinospp.com': {
        role: 'manager',
        name: 'Luisa Paola Caicedo',
        role_label: 'Gerente General',
        modules: {
            dashboard: 'read',
            admin: 'full',
            vacacional: 'read',
            corporativo: 'read',
            contabilidad: 'read'
        }
    },
    'producto@destinospp.com': {
        role: 'manager',
        name: 'Paola Palacios',
        role_label: 'Gerente General',
        modules: {
            dashboard: 'read',
            admin: 'full',
            vacacional: 'read',
            corporativo: 'read',
            contabilidad: 'read'
        }
    },
    'contabilidad@destinospp.com': {
        role: 'accounting',
        name: 'Graciela Rozo',
        role_label: 'Contabilidad',
        modules: {
            dashboard: 'read',
            contabilidad: 'full'
        }
    },
    'ventas@destinospp.com': {
        role: 'advisor_corporate',
        name: 'Juliana Rojas',
        role_label: 'Asesora Comercial',
        modules: {
            dashboard: 'read',
            corporativo: 'full'
        }
    },
    'ventas2@destinospp.com': {
        role: 'advisor_corporate',
        name: 'Jenniffer Moreno',
        role_label: 'Asesora Comercial',
        modules: {
            dashboard: 'read',
            corporativo: 'full'
        }
    },
    'operaciones1@destinospp.com': {
        role: 'operations_vac',
        name: 'Sandra Bonnett',
        role_label: 'Operaciones',
        modules: {
            dashboard: 'read',
            vacacional: 'full'
        }
    }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('intranet_user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setUser(parsed);
                // Sync with DB if available
                if (supabase) {
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('email', parsed.email)
                        .single()
                        .then(({ data }) => {
                            if (data) {
                                const merged = { ...parsed, ...data };
                                setUser(merged);
                                localStorage.setItem('intranet_user', JSON.stringify(merged));
                            }
                        });
                }
            } catch {
                localStorage.removeItem('intranet_user');
            }
        }
        setIsReady(true);
    }, []);

    const login = async (email, password) => {
        const normalized = String(email || '').trim().toLowerCase();
        if (!normalized.endsWith('@destinospp.com')) {
            throw new Error('Acceso denegado: Use su correo corporativo');
        }
        if (normalized === 'admin@destinospp.com') {
            throw new Error('Acceso denegado');
        }
        const config = RBAC_MATRIX[normalized];
        if (!config) {
            throw new Error('Acceso denegado');
        }

        let dbProfile = {};
        if (supabase) {
            const { data } = await supabase.from('profiles').select('*').eq('email', normalized).single();
            if (data) dbProfile = data;
        }

        const nextUser = {
            email: normalized,
            role: config.role,
            full_name: dbProfile.full_name || config.name,
            professional_role: dbProfile.professional_role || config.role_label,
            modules: config.modules,
            phone: dbProfile.phone || '',
            city: dbProfile.city || '',
            address: dbProfile.address || '',
            birth_date: dbProfile.birth_date || '',
            language: dbProfile.language || 'Español',
            photo_url: dbProfile.photo_url || ''
        };
        setUser(nextUser);
        localStorage.setItem('intranet_user', JSON.stringify(nextUser));
        return nextUser;
    };

    const updateProfile = async (updates) => {
        if (!user || !supabase) return;

        const { error } = await supabase
            .from('profiles')
            .upsert({ email: user.email, ...updates });

        if (error) throw error;

        const nextUser = { ...user, ...updates };
        setUser(nextUser);
        localStorage.setItem('intranet_user', JSON.stringify(nextUser));
    };

    const changePassword = async (newPassword) => {
        if (!supabase) return;
        // This assumes user is logged in via Supabase Auth as well, 
        // but since we are using a mock matrix for login, 
        // this might need a different approach if they aren't 'truly' authed in Supabase.
        // For now, let's treat it as a profile update or if Supabase Auth is active:
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('intranet_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isReady, updateProfile, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
