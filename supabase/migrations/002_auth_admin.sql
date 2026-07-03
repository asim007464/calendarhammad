-- Auth & admin extensions for QSO Dates

alter table public.profiles
  add column if not exists role text not null default 'member'
    check (role in ('member', 'staff', 'admin')),
  add column if not exists is_blocked boolean not null default false,
  add column if not exists phone text;

create table if not exists public.password_reset_otps (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  failed_attempts int not null default 0,
  created_at timestamptz default now()
);

create index if not exists password_reset_otps_email_idx
  on public.password_reset_otps (email, created_at desc);

-- Update profile trigger to include display name from metadata
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, callsign, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'callsign', ''),
    coalesce(new.email, ''),
    case
      when lower(coalesce(new.email, '')) in (
        'asimsajjad928@gmail.com',
        'anwaaralajme@gmail.com',
        'hz1gv@yahoo.com',
        'openrepater@gmail.com',
        'openrepeater@gmail.com',
        'sal9k2gv@yahoo.com'
      ) then 'admin'
      else 'member'
    end
  )
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;
