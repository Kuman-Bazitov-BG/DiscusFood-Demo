-- User roles for the app: regular users and admins.
create type public.user_role as enum ('user', 'admin');

-- Profile row mirrors each auth.users record and carries the role + username.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  email text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may read and update their own profile.
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Enforce "there can be only one admin": the partial unique index allows at
-- most a single row where role = 'admin'.
create unique index only_one_admin
  on public.profiles ((role = 'admin'))
  where role = 'admin';

-- Auto-create a profile (role 'user') whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'username',
    new.email,
    'user'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
