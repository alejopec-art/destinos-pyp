-- Profiles table to store user metadata and roles
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  professional_role text, -- manager, accounting, advisor_corporate, operations_vac
  phone text,
  city text,
  address text,
  birth_date date,
  language text default 'Español',
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Function to check if user is a manager/admin
create or replace function public.is_manager()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() 
    and (professional_role in ('Gerente General', 'Gerencia', 'Admin', 'manager')
         or email in ('viajes@destinospp.com', 'producto@destinospp.com'))
  );
end;
$$ language plpgsql security definer;

-- Hardening Quotes Table RLS
alter table quotes enable row level security;

drop policy if exists "quotes_select" on quotes;
create policy "quotes_select"
  on quotes for select
  using (auth.uid() = created_by or public.is_manager());

drop policy if exists "quotes_update" on quotes;
create policy "quotes_update"
  on quotes for update
  using (auth.uid() = created_by or public.is_manager());

-- Confirmed Quotes table (Blindaje de Confirmaciones)
create table if not exists confirmed_quotes (
  folio text primary key references quotes(folio) on delete cascade,
  data jsonb not null,
  created_by uuid references auth.users(id),
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table confirmed_quotes enable row level security;

drop policy if exists "confirmed_quotes_select" on confirmed_quotes;
create policy "confirmed_quotes_select"
  on confirmed_quotes for select
  using (auth.uid() = created_by or public.is_manager());

drop policy if exists "confirmed_quotes_insert" on confirmed_quotes;
create policy "confirmed_quotes_insert"
  on confirmed_quotes for insert
  with check (auth.uid() = created_by);

-- Tickets table (Blindaje de Tiquetería)
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  folio text references confirmed_quotes(folio) on delete cascade,
  data jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table tickets enable row level security;

drop policy if exists "tickets_select" on tickets;
create policy "tickets_select"
  on tickets for select
  using (auth.uid() = created_by or public.is_manager());

drop policy if exists "tickets_insert" on tickets;
create policy "tickets_insert"
  on tickets for insert
  with check (auth.uid() = created_by);
