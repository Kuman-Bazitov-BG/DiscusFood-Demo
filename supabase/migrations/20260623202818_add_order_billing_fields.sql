-- Company / billing snapshot stored per order for invoices
alter table public.orders
  add column if not exists billing_company text,
  add column if not exists billing_vat_number text,
  add column if not exists billing_registration_number text,
  add column if not exists billing_contact_name text,
  add column if not exists billing_phone text,
  add column if not exists billing_email text,
  add column if not exists billing_address1 text,
  add column if not exists billing_address2 text,
  add column if not exists billing_city text,
  add column if not exists billing_state text,
  add column if not exists billing_postal_code text,
  add column if not exists billing_country text;
