-- API keys for developer access (QSO Dates public API)

alter table public.profiles
  add column if not exists api_key text unique,
  add column if not exists api_requests_today int not null default 0,
  add column if not exists api_requests_date date;

create index if not exists profiles_api_key_idx on public.profiles (api_key) where api_key is not null;
