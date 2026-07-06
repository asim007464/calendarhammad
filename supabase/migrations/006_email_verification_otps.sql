-- Email verification OTP for registration

create table if not exists public.email_verification_otps (
  id uuid primary key default uuid_generate_v4(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  failed_attempts int not null default 0,
  created_at timestamptz default now()
);

create index if not exists email_verification_otps_email_idx
  on public.email_verification_otps (email, created_at desc);
