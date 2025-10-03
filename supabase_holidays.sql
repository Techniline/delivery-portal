-- business_hours: weekday 0=Sun .. 6=Sat. Null open/close means closed all day.
create table if not exists public.business_hours (
  id bigserial primary key,
  warehouse_id int not null default 1,
  weekday int not null check(weekday between 0 and 6),
  open_time time,
  close_time time
);

-- breaks: recurring, by weekday window (optional)
create table if not exists public.business_breaks (
  id bigserial primary key,
  warehouse_id int not null default 1,
  weekday int not null check(weekday between 0 and 6),
  start_time time not null,
  end_time time not null
);

-- holidays: explicit closed/annotated dates or ranges
create table if not exists public.business_holidays (
  id bigserial primary key,
  warehouse_id int not null default 1,
  start_date date not null,
  end_date date not null,
  is_closed boolean not null default true,
  reason text
);

-- helpful defaults (Mon-Fri 09-18, Sat 09-16, Sun closed)
insert into public.business_hours (warehouse_id, weekday, open_time, close_time)
select 1, d.w, case when d.w between 1 and 5 then '09:00' when d.w=6 then '09:00' end,
              case when d.w between 1 and 5 then '18:00' when d.w=6 then '16:00' end
from (values (0),(1),(2),(3),(4),(5),(6)) as d(w)
on conflict do nothing;

-- Allow authenticated RLS read; admin/service writes via edge/app routes
alter table public.business_hours enable row level security;
alter table public.business_breaks enable row level security;
alter table public.business_holidays enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='business_hours' and policyname='bh_select') then
    create policy bh_select on public.business_hours for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='business_breaks' and policyname='bb_select') then
    create policy bb_select on public.business_breaks for select to authenticated using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='business_holidays' and policyname='bo_select') then
    create policy bo_select on public.business_holidays for select to authenticated using (true);
  end if;
end $$;
