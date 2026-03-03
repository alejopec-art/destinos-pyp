-- Tabla de Empresas
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  nit text unique not null,
  address text,
  phone text,
  email text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habilitar RLS
alter table companies enable row level security;

-- Políticas de RLS para companies (Solo Admin - Simplificado para este contexto)
create policy "Public can select companies" on companies for select using (true);
create policy "Admins can insert companies" on companies for insert with check (true); -- En producción usaría rol de admin
create policy "Admins can update companies" on companies for update using (true);
create policy "Admins can delete companies" on companies for delete using (true);

-- Configuración de Storage para logos
-- Nota: En Supabase real, esto se hace vía consola o SQL en el esquema 'storage'
-- insert into storage.buckets (id, name, public) values ('company-logos', 'company-logos', true);
