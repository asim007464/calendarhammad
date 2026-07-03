-- QSODates Supabase schema
-- Run in Supabase SQL Editor or via CLI

create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  callsign text not null default '',
  email text default '',
  bio text default '',
  avatar_url text,
  website text,
  qrz text,
  theme text default 'lime',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activity types (API-managed, users can add custom)
create table if not exists public.activity_types (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  color text not null default '#64748b',
  icon text,
  is_system boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- Schedule recurrence: none | annual | weekly | monthly
create type public.recurrence_type as enum ('none', 'annual', 'weekly', 'monthly');

create table if not exists public.activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  type_id uuid references public.activity_types(id),
  type_name text not null default 'Other',
  name text not null,
  description text default '',
  callsign text default '',
  organizer text default '',
  start_at timestamptz not null,
  end_at timestamptz,
  recurrence public.recurrence_type default 'annual',
  bands text[] default '{}',
  modes text[] default '{}',
  frequencies text default '',
  country text default '',
  grid text default '',
  reference text default '',
  website text default '',
  email text default '',
  qrz text default '',
  registration text default '',
  certificate text default 'no',
  award_details text default '',
  logo_url text,
  image_url text,
  notes text default '',
  custom_fields jsonb default '{}',
  status text default 'published',
  view_count int default 0,
  click_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activity view/click log
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  activity_id uuid references public.activities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  event_type text not null check (event_type in ('view', 'click', 'share', 'social_post')),
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Support messages
create table if not exists public.support_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  user_name text default 'Guest',
  callsign text default '',
  email text default '',
  subject text not null,
  message text not null,
  status text default 'open' check (status in ('open', 'resolved')),
  reply text default '',
  created_at timestamptz default now()
);

-- Admin broadcasts
create table if not exists public.broadcasts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  created_at timestamptz default now()
);

-- Social post queue / log
create table if not exists public.social_posts (
  id uuid primary key default uuid_generate_v4(),
  activity_id uuid references public.activities(id) on delete cascade,
  platform text not null check (platform in ('facebook', 'instagram', 'x')),
  status text default 'pending' check (status in ('pending', 'posted', 'failed')),
  post_id text,
  error_message text,
  created_at timestamptz default now()
);

-- External feed connections (eHamHub, CQHams)
create table if not exists public.external_feeds (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  platform text not null check (platform in ('ehamhub', 'cqhams')),
  api_key_encrypted text,
  username text,
  is_active boolean default true,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz default now(),
  unique(user_id, platform)
);

-- Cached external feed items
create table if not exists public.external_feed_items (
  id uuid primary key default uuid_generate_v4(),
  feed_id uuid references public.external_feeds(id) on delete cascade,
  external_id text,
  title text,
  summary text,
  url text,
  published_at timestamptz,
  raw jsonb default '{}',
  created_at timestamptz default now()
);

-- User sessions (online tracking)
create table if not exists public.user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  page text default '/',
  last_seen timestamptz default now()
);

-- Seed activity types
insert into public.activity_types (name, slug, color, is_system) values
  ('Contest', 'contest', '#ef4444', true),
  ('Special Event', 'special-event', '#f59e0b', true),
  ('Award Program', 'award-program', '#eab308', true),
  ('POTA', 'pota', '#10b981', true),
  ('SOTA', 'sota', '#06b6d4', true),
  ('DXpedition', 'dxpedition', '#8b5cf6', true),
  ('Net', 'net', '#3b82f6', true),
  ('Field Day', 'field-day', '#ec4899', true),
  ('Other', 'other', '#64748b', true)
on conflict (slug) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.activity_types enable row level security;
alter table public.activities enable row level security;
alter table public.activity_logs enable row level security;
alter table public.support_messages enable row level security;
alter table public.broadcasts enable row level security;
alter table public.social_posts enable row level security;
alter table public.external_feeds enable row level security;
alter table public.external_feed_items enable row level security;
alter table public.user_sessions enable row level security;

-- Public read policies
create policy "Public read activities" on public.activities for select using (status = 'published');
create policy "Public read activity types" on public.activity_types for select using (true);
create policy "Public read broadcasts" on public.broadcasts for select using (true);
create policy "Public read profiles" on public.profiles for select using (true);

-- Authenticated users
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users insert activities" on public.activities for insert with check (auth.uid() = user_id);
create policy "Users update own activities" on public.activities for update using (auth.uid() = user_id);
create policy "Users delete own activities" on public.activities for delete using (auth.uid() = user_id);
create policy "Users insert activity types" on public.activity_types for insert with check (auth.uid() is not null);
create policy "Users insert support" on public.support_messages for insert with check (true);
create policy "Users read own support" on public.support_messages for select using (auth.uid() = user_id);
create policy "Users manage external feeds" on public.external_feeds for all using (auth.uid() = user_id);
create policy "Users read own feed items" on public.external_feed_items for select using (
  feed_id in (select id from public.external_feeds where user_id = auth.uid())
);
create policy "Anyone insert activity logs" on public.activity_logs for insert with check (true);
create policy "Public read activity logs count" on public.activity_logs for select using (true);
create policy "Users manage sessions" on public.user_sessions for all using (auth.uid() = user_id);

-- Storage bucket for activity logos
-- Create in Supabase Dashboard: bucket name "activity-logos", public read

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, callsign, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'callsign', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
