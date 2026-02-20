-- ============================================================
-- AI Resume Analyzer — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable pgvector for embedding-based similarity search
create extension if not exists vector;


-- ============================================================
-- USERS (auth managed by Supabase Auth, this extends it)
-- ============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  avatar_url    text,
  plan          text not null default 'free' check (plan in ('free', 'pro', 'elite')),
  stripe_id     text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Trigger: auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- RESUMES
-- ============================================================
create table if not exists public.resumes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  file_name       text not null,
  file_url        text not null,           -- Supabase Storage URL
  raw_text        text,
  parsed_at       timestamptz,
  ats_score       numeric(5,2),
  ats_breakdown   jsonb,                  -- { formatting, keywords, ... }
  embedding       vector(1536),           -- for semantic similarity
  feedback        jsonb default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

create index on public.resumes (user_id);
create index on public.resumes using ivfflat (embedding vector_cosine_ops) with (lists = 100);


-- ============================================================
-- RESUME SECTIONS (structured parsed content)
-- ============================================================
create table if not exists public.resume_sections (
  id            uuid primary key default gen_random_uuid(),
  resume_id     uuid not null references public.resumes(id) on delete cascade,
  section_type  text not null,            -- education | skills | projects | experience | certifications
  content       text not null,
  created_at    timestamptz not null default now()
);

create index on public.resume_sections (resume_id);


-- ============================================================
-- JOB MATCHES
-- ============================================================
create table if not exists public.job_matches (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  resume_id           uuid not null references public.resumes(id) on delete cascade,
  target_role         text not null,
  jd_text             text not null,
  jd_embedding        vector(1536),
  match_score         numeric(5,2),
  semantic_similarity numeric(5,2),
  skill_gap           jsonb,              -- { mandatory_missing, competitive_missing, matched_skills }
  recommendations     jsonb default '[]'::jsonb,
  created_at          timestamptz not null default now()
);

create index on public.job_matches (user_id);
create index on public.job_matches (resume_id);


-- ============================================================
-- GITHUB ANALYSIS
-- ============================================================
create table if not exists public.github_analyses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  github_username text not null,
  gpi_score       numeric(5,2),
  metrics         jsonb,                  -- { consistency, depth, diversity, production }
  strengths       jsonb default '[]'::jsonb,
  recommendations jsonb default '[]'::jsonb,
  raw_data        jsonb,
  created_at      timestamptz not null default now()
);

create index on public.github_analyses (user_id);


-- ============================================================
-- INTERVIEWS (sessions)
-- ============================================================
create table if not exists public.interview_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  resume_id       uuid references public.resumes(id) on delete set null,
  target_role     text not null,
  status          text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  overall_score   numeric(5,2),
  created_at      timestamptz not null default now()
);

create index on public.interview_sessions (user_id);


-- ============================================================
-- INTERVIEW Q&A
-- ============================================================
create table if not exists public.interview_answers (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.interview_sessions(id) on delete cascade,
  question_id     text not null,
  question        text not null,
  category        text,
  difficulty      text,
  user_answer     text not null,
  score           numeric(4,1),
  clarity_score   numeric(4,1),
  technical_score numeric(4,1),
  depth_score     numeric(4,1),
  communication_score numeric(4,1),
  strengths       jsonb default '[]'::jsonb,
  improvements    jsonb default '[]'::jsonb,
  model_answer_hint text,
  created_at      timestamptz not null default now()
);

create index on public.interview_answers (session_id);


-- ============================================================
-- RLS Policies (enable Row Level Security)
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.resumes           enable row level security;
alter table public.resume_sections   enable row level security;
alter table public.job_matches       enable row level security;
alter table public.github_analyses   enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_answers enable row level security;

-- Each user sees only their own data
create policy "own profile"   on public.profiles          for all using (auth.uid() = id);
create policy "own resumes"   on public.resumes            for all using (auth.uid() = user_id);
create policy "own sections"  on public.resume_sections   for all using (exists (select 1 from public.resumes r where r.id = resume_id and r.user_id = auth.uid()));
create policy "own matches"   on public.job_matches        for all using (auth.uid() = user_id);
create policy "own github"    on public.github_analyses    for all using (auth.uid() = user_id);
create policy "own sessions"  on public.interview_sessions for all using (auth.uid() = user_id);
create policy "own answers"   on public.interview_answers  for all using (exists (select 1 from public.interview_sessions s where s.id = session_id and s.user_id = auth.uid()));
