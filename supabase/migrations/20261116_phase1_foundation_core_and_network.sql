-- Applied to project jgotjavlewvfjztunvat as "phase1_foundation_core_and_network".

create type public.app_role as enum ('owner', 'admin');
create type public.account_status as enum ('active', 'suspended', 'deactivated');

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.classes enable row level security;
insert into public.classes (name) values ('Class of 2026');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null check (char_length(display_name) between 1 and 60),
  bio text not null default '' check (char_length(bio) <= 300),
  avatar_path text,
  banner_path text,
  class_id uuid references public.classes(id),
  status public.account_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);
create unique index profiles_username_key on public.profiles (username);
create index profiles_class_idx on public.profiles (class_id);
alter table public.profiles enable row level security;

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);
alter table public.user_roles enable row level security;

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);
alter table public.admin_audit_logs enable row level security;

create table public.network_access_config (
  id smallint primary key default 1 check (id = 1),
  enforcement_enabled boolean not null default false,
  trusted_cidrs cidr[] not null default '{}',
  client_ip_header text not null default 'cf-connecting-ip',
  verified_at timestamptz,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint enforcement_needs_ranges check (
    not enforcement_enabled or coalesce(array_length(trusted_cidrs, 1), 0) > 0
  )
);
alter table public.network_access_config enable row level security;
insert into public.network_access_config (id, enforcement_enabled, trusted_cidrs)
values (1, false, array['103.160.174.114/32']::cidr[]);

revoke all on public.network_access_config from anon, authenticated;
revoke all on public.admin_audit_logs from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;
grant select on public.user_roles to authenticated;
grant select on public.admin_audit_logs to authenticated;

create or replace function public.is_trusted_network()
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare cfg record; headers json; raw_ip text; client_ip inet;
begin
  select * into cfg from public.network_access_config where id = 1;
  if not found or not cfg.enforcement_enabled then return true; end if;
  begin
    headers := current_setting('request.headers', true)::json;
    raw_ip := headers ->> cfg.client_ip_header;
    client_ip := raw_ip::inet;
  exception when others then return false; end;
  if client_ip is null then return false; end if;
  return exists (select 1 from unnest(cfg.trusted_cidrs) c where client_ip <<= c);
end; $$;
revoke all on function public.is_trusted_network() from public;
grant execute on function public.is_trusted_network() to anon, authenticated;

create or replace function public.network_status() returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'enforcement_active', coalesce((select enforcement_enabled from public.network_access_config where id = 1), false),
    'trusted', public.is_trusted_network());
$$;
revoke all on function public.network_status() from public;
grant execute on function public.network_status() to anon, authenticated;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = 'owner');
$$;
revoke all on function public.is_owner() from public, anon;
grant execute on function public.is_owner() to authenticated;

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_username text := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));
  v_display text := trim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  v_class uuid;
begin
  if v_username !~ '^[a-z0-9_]{3,20}$' then
    raise exception 'Invalid username: use 3-20 letters, numbers or underscores';
  end if;
  if char_length(v_display) not between 1 and 60 then
    raise exception 'Display name must be 1-60 characters';
  end if;
  select id into v_class from public.classes order by created_at limit 1;
  insert into public.profiles (id, username, display_name, class_id) values (new.id, v_username, v_display, v_class);
  return new;
end; $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_username_available(p_username text) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_trusted_network()
     and not exists (select 1 from public.profiles where username = lower(trim(p_username)));
$$;
revoke all on function public.is_username_available(text) from public;
grant execute on function public.is_username_available(text) to anon, authenticated;

create or replace function public.owner_set_network_config(p_cidrs text[], p_enabled boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_owner() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.network_access_config
     set trusted_cidrs = p_cidrs::cidr[], enforcement_enabled = p_enabled,
         updated_at = now(), updated_by = (select auth.uid())
   where id = 1;
  insert into public.admin_audit_logs (actor_id, action, target_type, metadata)
  values ((select auth.uid()), 'network_config_updated', 'network_access_config',
          jsonb_build_object('cidrs', p_cidrs, 'enabled', p_enabled));
end; $$;
revoke all on function public.owner_set_network_config(text[], boolean) from public, anon;
grant execute on function public.owner_set_network_config(text[], boolean) to authenticated;

create policy classes_select on public.classes for select to authenticated
  using ((select public.is_trusted_network()));
create policy profiles_select on public.profiles for select to authenticated
  using ((select public.is_trusted_network()));
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select public.is_trusted_network()) and id = (select auth.uid()))
  with check ((select public.is_trusted_network()) and id = (select auth.uid()));
revoke update on public.profiles from authenticated, anon;
grant update (username, display_name, bio, avatar_path, banner_path) on public.profiles to authenticated;
revoke insert, delete on public.profiles from authenticated, anon;
create policy user_roles_select_own on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()));
create policy audit_select_owner on public.admin_audit_logs for select to authenticated
  using ((select public.is_owner()));
