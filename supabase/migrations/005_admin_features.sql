-- Admin features: site lockdown, homepage content, activity approval

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

insert into public.site_settings (key, value) values
  ('lockdown', '{"enabled":false,"message":"QSO Dates is temporarily offline for maintenance. Please check back soon.","locked_at":null,"locked_by":null}'::jsonb),
  ('homepage', '{
    "eyebrow":"Global Amateur Radio Events",
    "title":"Your Worldwide Hub For Ham Radio On Air Activities",
    "lead":"Browse contests, special event stations, POTA and SOTA activations, DXpeditions, nets, and field days. Publish your ham radio activity on QSO Dates.",
    "ctaPublish":"Publish Your Activity",
    "ctaBrowse":"Browse Events",
    "ctaCalendar":"Open Calendar",
    "statLive":"On Air Now",
    "statTotal":"Total Activities",
    "statApi":"Activities API",
    "statUpcoming":"Upcoming"
  }'::jsonb)
on conflict (key) do nothing;

-- Allow activity approval workflow
alter table public.activities drop constraint if exists activities_status_check;
alter table public.activities
  add constraint activities_status_check
  check (status in ('pending_review', 'published', 'rejected'));

-- Support AI suggested replies
alter table public.support_messages
  add column if not exists ai_suggested_reply text default '';

alter table public.site_settings enable row level security;

drop policy if exists "anon_read_public_settings" on public.site_settings;
create policy "anon_read_public_settings"
  on public.site_settings for select
  using (key in ('lockdown', 'homepage'));
