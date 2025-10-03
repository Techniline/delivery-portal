-- Create tables if not present
create table if not exists public.business_hours(
  warehouse_id int not null default 1,
  weekday int not null,                -- 0..6 (Sun..Sat) or 1..7 (Mon..Sun)
  open_time time not null,
  close_time time not null,
  active boolean default true,
  primary key (warehouse_id, weekday)
);

create table if not exists public.business_breaks(
  warehouse_id int not null default 1,
  weekday int not null,
  start_time time not null,
  end_time time not null
);

-- Seed Mon..Fri 09:00-18:00, Sat 09:00-16:00, Sun closed
insert into public.business_hours(warehouse_id, weekday, open_time, close_time, active) values
  (1,1,'09:00','18:00',true),
  (1,2,'09:00','18:00',true),
  (1,3,'09:00','18:00',true),
  (1,4,'09:00','18:00',true),
  (1,5,'09:00','18:00',true),
  (1,6,'09:00','16:00',true),
  (1,7,'00:00','00:00',false)
on conflict (warehouse_id, weekday) do nothing;

-- Example lunch break 13:00-14:00 Mon..Fri
insert into public.business_breaks(warehouse_id, weekday, start_time, end_time) values
  (1,1,'13:00','14:00'),
  (1,2,'13:00','14:00'),
  (1,3,'13:00','14:00'),
  (1,4,'13:00','14:00'),
  (1,5,'13:00','14:00')
on conflict do nothing;
