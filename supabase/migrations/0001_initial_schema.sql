-- Initial schema — ARCHITECTURE.md §9.1, IMPLEMENTATION_PLAN.md task 5.2.
-- Tables + indexes are copied verbatim from ARCHITECTURE.md §9.1. Row Level
-- Security policies below are new: §9.1 never specified them in detail,
-- only ARCHITECTURE_DECISIONS.md's approval checklist ("Defensive per-user
-- Row Level Security despite single-user v1 scope") named the *intent*.
-- Designed here following Supabase's standard per-user pattern: every table
-- keyed by `user_id` (or `id` on `users` itself) is only readable/writable
-- by its owning `auth.uid()` — defensive today (Julia is the only user),
-- load-bearing the moment a second account could ever exist.
--
-- Excluded deliberately: the `streaks` view. ARCHITECTURE.md §9.1 itself
-- marks its real query as "implementation detail for macro-stage 8" — the
-- placeholder shown there produces meaningless data, and macro-stage 5 has
-- no use for it yet. Add the real view in macro-stage 8, not a fake one now.

create extension if not exists vector;

create table users (
  id uuid primary key references auth.users,
  name text not null,
  professional_role text,
  primary_goal text,
  cefr_level text,
  created_at timestamptz not null default now()
);

-- Raw transcripts stored OUT of this table — see ARCHITECTURE.md §9.3.
create table sessions (
  id uuid primary key,                 -- client-generated UUID (localID), enables idempotent upsert
  user_id uuid references users(id),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  mode text check (mode in ('text', 'voice')),
  category text check (category in ('business', 'daily')),
  topic text,
  transcript_storage_path text,        -- pointer into Supabase Storage, not inline text
  summary text,
  summary_embedding vector(1536),
  updated_at timestamptz not null default now()
);
create index idx_sessions_user_started on sessions(user_id, started_at desc);
create index idx_sessions_embedding on sessions using hnsw (summary_embedding vector_cosine_ops);

create table vocabulary_items (
  id uuid primary key,
  user_id uuid references users(id),
  term text not null,
  definition text,
  first_seen_session_id uuid references sessions(id),
  times_used int not null default 0,
  mastery_level text check (mastery_level in ('introduced','practicing','mastered')),
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now()
);
create index idx_vocab_user_mastery on vocabulary_items(user_id, mastery_level);

create table mistakes (
  id uuid primary key,
  user_id uuid references users(id),
  type text check (type in ('grammar','pronunciation','vocabulary','fluency')),
  description text not null,
  example text,
  correction text,
  occurrences int not null default 1,
  last_seen_session_id uuid references sessions(id),
  resolved boolean not null default false,
  updated_at timestamptz not null default now()
);
create index idx_mistakes_user_resolved on mistakes(user_id, resolved, type);

create table topics (
  id uuid primary key,
  user_id uuid references users(id),
  name text not null,
  category text check (category in ('business','daily')),
  status text check (status in ('not_started','introduced','practicing','mastered')),
  last_covered_session_id uuid references sessions(id),
  updated_at timestamptz not null default now()
);

create table goals (
  id uuid primary key,
  user_id uuid references users(id),
  description text not null,
  target_date date,
  achieved boolean not null default false,
  updated_at timestamptz not null default now()
);

create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  label text not null,
  achieved_at timestamptz not null default now()
);

create table learner_profile (
  user_id uuid primary key references users(id),
  summary text not null,
  strengths text[],
  weaknesses text[],
  version int not null default 1,
  updated_at timestamptz not null default now()
);

create table device_sync_state (
  device_id uuid primary key,
  user_id uuid references users(id),
  platform text,                       -- 'ios' | 'android' | 'web'
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

-- Row Level Security — every table, every operation, owner-only.
alter table users enable row level security;
alter table sessions enable row level security;
alter table vocabulary_items enable row level security;
alter table mistakes enable row level security;
alter table topics enable row level security;
alter table goals enable row level security;
alter table achievements enable row level security;
alter table learner_profile enable row level security;
alter table device_sync_state enable row level security;

create policy "users_owner_only" on users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "sessions_owner_only" on sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "vocabulary_items_owner_only" on vocabulary_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "mistakes_owner_only" on mistakes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "topics_owner_only" on topics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_owner_only" on goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "achievements_owner_only" on achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "learner_profile_owner_only" on learner_profile
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "device_sync_state_owner_only" on device_sync_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
