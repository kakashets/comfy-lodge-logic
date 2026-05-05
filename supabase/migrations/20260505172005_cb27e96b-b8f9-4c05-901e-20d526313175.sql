create or replace function public.prevent_removing_last_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining_admins integer;
begin
  if (tg_op = 'DELETE' and old.role = 'admin') or (tg_op = 'UPDATE' and old.role = 'admin' and new.role <> 'admin') then
    select count(*) into remaining_admins
    from public.user_roles
    where role = 'admin'
      and id <> old.id;

    if remaining_admins = 0 then
      raise exception 'At least one administrator must remain.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_removing_last_admin_trigger on public.user_roles;

create trigger prevent_removing_last_admin_trigger
before update or delete on public.user_roles
for each row
execute function public.prevent_removing_last_admin();