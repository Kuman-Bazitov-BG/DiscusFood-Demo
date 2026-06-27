-- Account type + business/invoice details on profiles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_type') then
    create type account_type as enum ('personal', 'business');
  end if;
end $$;

alter table public.profiles
  add column if not exists account_type account_type not null default 'personal',
  add column if not exists company_name text,
  add column if not exists vat_number text,
  add column if not exists registration_number text,
  add column if not exists contact_name text,
  add column if not exists phone text,
  add column if not exists billing_email text,
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists postal_code text,
  add column if not exists country text;

-- Populate new profile rows from auth signup metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  meta jsonb := new.raw_user_meta_data;
  acct account_type := coalesce((meta ->> 'account_type')::account_type, 'personal');
begin
  insert into public.profiles (
    id, username, email, role, account_type,
    company_name, vat_number, registration_number, contact_name,
    phone, billing_email, address_line1, address_line2,
    city, state, postal_code, country
  )
  values (
    new.id,
    meta ->> 'username',
    new.email,
    'user',
    acct,
    meta ->> 'company_name',
    meta ->> 'vat_number',
    meta ->> 'registration_number',
    meta ->> 'contact_name',
    meta ->> 'phone',
    meta ->> 'billing_email',
    meta ->> 'address_line1',
    meta ->> 'address_line2',
    meta ->> 'city',
    meta ->> 'state',
    meta ->> 'postal_code',
    meta ->> 'country'
  );
  return new;
end;
$function$;
