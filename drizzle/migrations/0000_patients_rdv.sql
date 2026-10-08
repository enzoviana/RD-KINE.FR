create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Voir ses roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  email text not null default '',
  phone text not null default '',
  birth_date date,
  address text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Voir son profil" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Modifier son profil" on public.profiles for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Creer son profil" on public.profiles for insert to authenticated
  with check (id = auth.uid());

-- Les notes du kiné ne sont modifiables que par l'administrateur
create or replace function public.protect_profile_notes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.notes is distinct from old.notes and not public.has_role(auth.uid(), 'admin') then
    new.notes := old.notes;
  end if;
  return new;
end $$;
create trigger profiles_protect_notes before update on public.profiles
  for each row execute function public.protect_profile_notes();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, first_name, last_name, phone)
  values (new.id, coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  -- Le tout premier compte créé devient administrateur
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.practitioners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  job text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.practitioners to authenticated, anon;
grant insert, update, delete on public.practitioners to authenticated;
grant all on public.practitioners to service_role;
alter table public.practitioners enable row level security;
create policy "Praticiens visibles" on public.practitioners for select to anon, authenticated using (true);
create policy "Admin gere praticiens" on public.practitioners for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

insert into public.practitioners (name, job) values
  ('Denis', 'Masseur-kinésithérapeute'),
  ('Caroline', 'Orthophoniste / ostéopathe'),
  ('Amélie', 'Psychomotricienne');

create table public.slots (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  title text not null default 'Séance',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  patient_id uuid,
  booked_at timestamptz,
  created_at timestamptz not null default now()
);
create index slots_starts_idx on public.slots(starts_at);
grant select, insert, update, delete on public.slots to authenticated;
grant all on public.slots to service_role;
alter table public.slots enable row level security;
create policy "Voir creneaux libres ou les siens" on public.slots for select to authenticated
  using (patient_id is null or patient_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admin gere creneaux" on public.slots for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.validate_slot()
returns trigger language plpgsql as $$
begin
  if new.ends_at <= new.starts_at then raise exception 'La fin doit être après le début'; end if;
  return new;
end $$;
create trigger slots_validate before insert or update on public.slots
  for each row execute function public.validate_slot();

create or replace function public.book_slot(_slot_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Connexion requise'; end if;
  update public.slots set patient_id = auth.uid(), booked_at = now()
   where id = _slot_id and patient_id is null and starts_at > now();
  if not found then raise exception 'Ce créneau n''est plus disponible'; end if;
end $$;

create or replace function public.cancel_booking(_slot_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.slots set patient_id = null, booked_at = null
   where id = _slot_id and starts_at > now()
     and (patient_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
  if not found then raise exception 'Annulation impossible'; end if;
end $$;

revoke execute on function public.book_slot(uuid) from anon, public;
revoke execute on function public.cancel_booking(uuid) from anon, public;
grant execute on function public.book_slot(uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;