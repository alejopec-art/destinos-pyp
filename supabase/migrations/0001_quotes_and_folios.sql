-- Folios por módulo
create table if not exists folio_counters (
  module text primary key,
  last_number bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Cotizaciones
create table if not exists quotes (
  folio text primary key,
  data jsonb not null,
  created_by uuid references auth.users(id),
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_created_by_idx on quotes(created_by);

-- Trigger updated_at
create or replace function set_quotes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_quotes_updated_at on quotes;
create trigger trg_quotes_updated_at
before update on quotes
for each row
execute procedure set_quotes_updated_at();

-- RPC para generar el siguiente folio de forma transaccional
create or replace function next_folio(p_module text)
returns text
language plpgsql
as $$
declare
  v_row folio_counters;
  v_num bigint;
  v_folio text;
begin
  if p_module is null or length(p_module) = 0 then
    raise exception 'module no puede ser nulo';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_module));

  select * into v_row from folio_counters where module = p_module for update;

  if not found then
    insert into folio_counters(module, last_number)
    values (p_module, 1)
    returning * into v_row;
  else
    update folio_counters
       set last_number = last_number + 1,
           updated_at = now()
     where module = p_module
    returning * into v_row;
  end if;

  v_num := v_row.last_number;
  v_folio := format('%s-%s-%04s', 'COT', extract(year from now())::int, v_num);
  return v_folio;
end;
$$;

-- RLS
alter table quotes enable row level security;

drop policy if exists "quotes_select" on quotes;
drop policy if exists "quotes_update" on quotes;
drop policy if exists "quotes_delete" on quotes;
drop policy if exists "quotes_insert" on quotes;

create policy "quotes_select"
  on quotes for select
  using (auth.uid() = created_by);

create policy "quotes_update"
  on quotes for update
  using (auth.uid() = created_by);

create policy "quotes_delete"
  on quotes for delete
  using (auth.uid() = created_by);

create policy "quotes_insert"
  on quotes for insert
  with check (auth.uid() = created_by);

