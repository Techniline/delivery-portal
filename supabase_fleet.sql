-- Run this in Supabase SQL editor (safe idempotent-ish)
create table if not exists public.drivers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  photo_url text,
  active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  plate text not null,
  model text not null,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- loosen RLS to allow Admin/Warehouse Manager to read/write; everyone can read active lists
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='drivers' and policyname='drivers_read_active') then
    create policy drivers_read_active on public.drivers for select
      to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='drivers' and policyname='drivers_write_mgr') then
    create policy drivers_write_mgr on public.drivers for all
      to authenticated using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('WAREHOUSE_MANAGER','ADMIN')))
      with check (exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('WAREHOUSE_MANAGER','ADMIN')));
  end if;

  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicles' and policyname='vehicles_read_active') then
    create policy vehicles_read_active on public.vehicles for select
      to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='vehicles' and policyname='vehicles_write_mgr') then
    create policy vehicles_write_mgr on public.vehicles for all
      to authenticated using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('WAREHOUSE_MANAGER','ADMIN')))
      with check (exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('WAREHOUSE_MANAGER','ADMIN')));
  end if;
end$$;

-- Optional seed
insert into public.drivers (full_name, photo_url) values
  ('Techniline Driver A', null),
  ('Techniline Driver B', null)
on conflict do nothing;

insert into public.vehicles (plate, model) values
  ('TLC-1234','Isuzu N-Series'),
  ('TLC-5678','Toyota Hiace')
on conflict do nothing;
