import { supabase } from './supabaseClient';

export const UsersApi = {
    async listUsers() {
        if (!supabase) return [];
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (err) {

            return [];
        }
    },

    async createUser(userData) {
        if (!supabase) return { ok: false, error: 'Supabase no configurado' };
        try {
            // Nota: Esto solo crea el perfil en la tabla 'profiles'.
            // Para que el usuario pueda loguearse, debe registrarse en Supabase Auth con este mismo email.
            const { data, error } = await supabase
                .from('profiles')
                .insert([userData])
                .select();
            if (error) throw error;
            return { ok: true, data: data[0] };
        } catch (err) {

            return { ok: false, error: err.message };
        }
    },

    async updateUser(email, updates) {
        if (!supabase) return { ok: false, error: 'Supabase no configurado' };
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('email', email)
                .select();
            if (error) throw error;
            return { ok: true, data: data[0] };
        } catch (err) {

            return { ok: false, error: err.message };
        }
    },

    async deleteUser(email) {
        if (!supabase) return { ok: false, error: 'Supabase no configurado' };
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('email', email);
            if (error) throw error;
            return { ok: true };
        } catch (err) {

            return { ok: false, error: err.message };
        }
    }
};
