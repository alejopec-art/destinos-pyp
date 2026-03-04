import { supabase } from './supabaseClient';

export const CompaniesApi = {
  async listCompanies() {
    try {
      if (!supabase) {
        const stored = localStorage.getItem('MOCK_COMPANIES');
        return stored ? JSON.parse(stored) : [
          { id: 'sonreir', name: 'Fundación Sonreír', logo_url: '/logos/corporate/sonreir.png', nit: '900.000.000-1' },
          { id: 'syscom', name: 'Syscom Colombia', logo_url: '/logos/corporate/syscom-colombia.png', nit: '800.000.000-2' }
        ];
      }
      const { data, error } = await supabase.from('companies').select('*').order('name');
      if (error) throw error;
      return data;
    } catch (err) {

      return [];
    }
  },

  async createCompany(companyData) {
    try {
      if (!supabase) {
        const companies = await this.listCompanies();
        const newCompany = { ...companyData, id: crypto.randomUUID() };
        companies.push(newCompany);
        localStorage.setItem('MOCK_COMPANIES', JSON.stringify(companies));
        return { ok: true, data: newCompany };
      }
      const { data, error } = await supabase.from('companies').insert(companyData).select().single();
      if (error) throw error;
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  async updateCompany(id, changes) {
    try {
      if (!supabase) {
        const companies = await this.listCompanies();
        const idx = companies.findIndex(c => c.id === id);
        if (idx === -1) throw new Error('Company not found');
        companies[idx] = { ...companies[idx], ...changes };
        localStorage.setItem('MOCK_COMPANIES', JSON.stringify(companies));
        return { ok: true };
      }
      const { error } = await supabase.from('companies').update(changes).eq('id', id);
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  async deleteCompany(id) {
    try {
      if (!supabase) {
        const companies = await this.listCompanies();
        const filtered = companies.filter(c => c.id !== id);
        localStorage.setItem('MOCK_COMPANIES', JSON.stringify(filtered));
        return { ok: true };
      }
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw error;
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  },

  async uploadLogo(file) {
    try {
      if (!supabase) {
        // Mock upload: return data URL
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ ok: true, url: reader.result });
          reader.readAsDataURL(file);
        });
      }
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message === 'Bucket not found') {
          return { ok: false, error: 'Configuración faltante: Por favor crea un Bucket llamado "company-logos" en el almacenamiento de Supabase.' };
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath);
      return { ok: true, url: data.publicUrl };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }
};
