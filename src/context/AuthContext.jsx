import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const RBAC_MATRIX = {
    'viajes@destinospp.com': {
        role: 'manager',
        name: 'Luisa Paola Caicedo',
        role_label: 'Gerente General',
        modules: {
            dashboard: 'read',
            admin: 'full',
            vacacional: 'full',
            corporativo: 'full',
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
            vacacional: 'full',
            corporativo: 'full',
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
            vacacional: 'full',
            corporativo: 'full'
        }
    },
    'ventas2@destinospp.com': {
        role: 'advisor_corporate',
        name: 'Jenniffer Moreno',
        role_label: 'Asesora Comercial',
        modules: {
            dashboard: 'read',
            vacacional: 'full',
            corporativo: 'full'
        }
    },
    'operaciones1@destinospp.com': {
        role: 'operations_vac',
        name: 'Sandra Bonnett',
        role_label: 'Operaciones',
        modules: {
            dashboard: 'read',
            vacacional: 'full',
            corporativo: 'full'
        }
    }
};

const ROLE_MODULES = {
    'manager': {
        dashboard: 'read',
        admin: 'full',
        vacacional: 'full',
        corporativo: 'full',
        contabilidad: 'read'
    },
    'accounting': {
        dashboard: 'read',
        contabilidad: 'full'
    },
    'advisor_corporate': {
        dashboard: 'read',
        vacacional: 'full',
        corporativo: 'full'
    },
    'operations_vac': {
        dashboard: 'read',
        vacacional: 'full',
        corporativo: 'full'
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

                // CRITICAL: Refresh modules from RBAC_MATRIX to ensure updates apply immediately
                const currentConfig = RBAC_MATRIX[parsed.email.trim().toLowerCase()];
                if (currentConfig) {
                    const refreshedUser = {
                        ...parsed,
                        role: currentConfig.role,
                        modules: currentConfig.modules,
                        professional_role: parsed.professional_role || currentConfig.role_label
                    };
                    setUser(refreshedUser);
                    localStorage.setItem('intranet_user', JSON.stringify(refreshedUser));
                } else if (supabase) {
                    // Si no está en la matriz fija, refrescar desde la DB
                    supabase
                        .from('profiles')
                        .select('*')
                        .eq('email', parsed.email)
                        .single()
                        .then(({ data }) => {
                            if (data) {
                                const refreshedUser = {
                                    ...parsed,
                                    ...data,
                                    modules: ROLE_MODULES[data.role] || ROLE_MODULES['advisor_corporate']
                                };
                                setUser(refreshedUser);
                                localStorage.setItem('intranet_user', JSON.stringify(refreshedUser));
                            }
                        });
                } else {
                    setUser(parsed);
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

        let dbProfile = null;
        if (supabase) {
            const { data } = await supabase.from('profiles').select('*').eq('email', normalized).single();
            if (data) dbProfile = data;
        }

        const config = RBAC_MATRIX[normalized];

        // Si no está en la matriz ni en la DB, denegar
        if (!config && !dbProfile) {
            throw new Error('Acceso denegado: Usuario no registrado');
        }

        const userRole = dbProfile?.role || config?.role || 'advisor_corporate';
        const modules = dbProfile?.role ? ROLE_MODULES[dbProfile.role] : config?.modules;

        const nextUser = {
            email: normalized,
            role: userRole,
            full_name: dbProfile?.full_name || config?.name || 'Usuario',
            professional_role: dbProfile?.professional_role || config?.role_label || 'Asesor Comercial',
            modules: modules || ROLE_MODULES['advisor_corporate'],
            phone: dbProfile?.phone || '',
            city: dbProfile?.city || '',
            address: dbProfile?.address || '',
            birth_date: dbProfile?.birth_date || '',
            language: dbProfile?.language || 'Español',
            photo_url: dbProfile?.photo_url || ''
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
