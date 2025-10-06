-- Create profiles table that references auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  role text not null check (role in ('superadmin', 'admin', 'user')),
  cargo text,
  blocked boolean default false,
  permissions jsonb default '{"canCreateGroups": false, "canManageUsers": false, "tabPermissions": []}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Super admins can view all profiles
create policy "Super admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Super admins can insert profiles
create policy "Super admins can insert profiles"
  on public.profiles for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Super admins can update all profiles
create policy "Super admins can update all profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Super admins can delete profiles
create policy "Super admins can delete profiles"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, cargo, permissions)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    new.raw_user_meta_data->>'cargo',
    coalesce(
      (new.raw_user_meta_data->>'permissions')::jsonb,
      '{"canCreateGroups": false, "canManageUsers": false, "tabPermissions": []}'::jsonb
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
