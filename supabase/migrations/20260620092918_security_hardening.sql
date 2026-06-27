-- Pin search_path on the trigger function.
create or replace function public.touch_updated_at()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- These SECURITY DEFINER functions are used internally (triggers / RLS).
-- They should never be callable directly through the REST RPC endpoint,
-- so revoke EXECUTE from the API roles. is_admin() still works inside
-- RLS policies because policy evaluation doesn't require EXECUTE grants.
revoke execute on function public.touch_updated_at()   from anon, authenticated;
revoke execute on function public.handle_new_user()    from anon, authenticated;
revoke execute on function public.auto_confirm_email()  from anon, authenticated;
revoke execute on function public.is_admin()           from anon, authenticated;
