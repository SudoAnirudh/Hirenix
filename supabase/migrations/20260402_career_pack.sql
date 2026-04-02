-- ============================================================
-- COVER LETTERS
-- ============================================================
create table if not exists public.cover_letters (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  resume_id     uuid not null references public.resumes(id) on delete cascade,
  target_role   text not null,
  content       text not null,
  tone          text not null default 'Professional',
  created_at    timestamptz not null default now()
);

create index on public.cover_letters (user_id);

-- ============================================================
-- JOB APPLICATIONS (Kanban)
-- ============================================================
create table if not exists public.job_applications (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  company       text not null,
  role          text not null,
  location      text,
  status        text not null default 'wishlist' check (status in ('wishlist', 'applied', 'interviewing', 'offer', 'rejected')),
  apply_url     text,
  match_score   numeric(5,2),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on public.job_applications (user_id);
create index on public.job_applications (status);

-- ============================================================
-- RLS Policies
-- ============================================================
alter table public.cover_letters   enable row level security;
alter table public.job_applications enable row level security;

create policy "own cover_letters"  on public.cover_letters   for all using (auth.uid() = user_id);
create policy "own applications"   on public.job_applications for all using (auth.uid() = user_id);
