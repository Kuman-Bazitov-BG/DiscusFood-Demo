-- Auto-confirm each new user's email at insert time so they can log in right
-- after registering (the project has "Confirm email" enabled by default and
-- there's no SMTP set up). Set email_confirmed_at before the row is written.
create or replace function public.auto_confirm_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;
  return new;
end;
$$;

create trigger auto_confirm_email_trigger
  before insert on auth.users
  for each row execute function public.auto_confirm_email();
