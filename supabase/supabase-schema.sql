-- Rare Tattoo Studio Supabase setup
-- Run this entire file in Supabase Dashboard -> SQL Editor.
-- After creating your Auth user, run the final INSERT using that user's UUID.

create table if not exists public.designs (
  id bigint primary key,
  name text not null,
  style text not null,
  price numeric not null default 0,
  description text default '',
  image text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id boolean primary key default true check (id = true),
  phone text not null default '',
  email text not null default '',
  instagram text default '',
  address text default '',
  logo_image text default '',
  hero_image text default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id bigint primary key,
  name text not null,
  phone text not null,
  email text default '',
  style text default '',
  date date not null,
  time time not null,
  placement text default '',
  size text default '',
  message text default '',
  reference text default '',
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.designs enable row level security;
alter table public.site_settings enable row level security;
alter table public.bookings enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "Anyone can view designs"
on public.designs for select
using (true);

create policy "Admins manage designs"
on public.designs for all
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can view settings"
on public.site_settings for select
using (true);

create policy "Admins manage settings"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can submit bookings"
on public.bookings for insert
with check (true);

create policy "Admins view bookings"
on public.bookings for select
using (public.is_admin());

create policy "Admins update bookings"
on public.bookings for update
using (public.is_admin())
with check (public.is_admin());

create policy "Admins delete bookings"
on public.bookings for delete
using (public.is_admin());

create policy "Users can check admin membership"
on public.admin_users for select
using (user_id = auth.uid());

insert into public.site_settings (id, phone, email, instagram, address, logo_image, hero_image)
values (true, '+91 98765 43210', 'hello@rare-tattoo-studio.com', '@rare_tattoo_studio', 'Bengaluru, India', 'assets/rare-tattoos-logo.jpg', 'assets/rare-tattoos-logo.jpg')
on conflict (id) do nothing;

-- After creating your admin user in Authentication -> Users, replace the UUID below
-- and run this statement to grant that user dashboard access:
-- insert into public.admin_users (user_id) values ('PASTE-AUTH-USER-UUID-HERE');