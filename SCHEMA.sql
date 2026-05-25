-- ============================================================
--  CB350 QuizHub — Supabase Schema
--  Run this entire file in your Supabase SQL Editor once.
--  Dashboard → SQL Editor → New Query → paste → Run
-- ============================================================

-- 1. Sessions table — one row per quiz session
create table if not exists sessions (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,          -- 6-char room code
  topic_id         text not null,
  topic_label      text not null,
  questions        jsonb not null default '[]',   -- array of {q, a, opts}
  status           text not null default 'waiting', -- waiting | live | done
  current_question integer not null default 0,
  revealed         boolean not null default false,
  timer            integer not null default 20,
  created_at       timestamptz default now()
);

-- 2. Session students — one row per student per session
create table if not exists session_students (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid not null references sessions(id) on delete cascade,
  student_name text not null,
  score        integer not null default 0,
  joined_at    timestamptz default now(),
  unique (session_id, student_name)
);

-- 3. Student answers — one row per student per question
create table if not exists student_answers (
  id             uuid primary key default gen_random_uuid(),
  session_id     uuid not null references sessions(id) on delete cascade,
  student_name   text not null,
  question_index integer not null,
  answer         text not null,
  points         integer not null default 0,
  correct        boolean not null default false,
  answered_at    timestamptz default now(),
  unique (session_id, student_name, question_index)
);

-- 4. Indexes for fast lookups
create index if not exists idx_sessions_code          on sessions(code);
create index if not exists idx_session_students_sid   on session_students(session_id);
create index if not exists idx_student_answers_sid    on student_answers(session_id);

-- 5. Enable Realtime on all three tables
--    (Supabase requires each table to be added to the publication)
alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table session_students;
alter publication supabase_realtime add table student_answers;

-- 6. Row Level Security — allow anonymous read/write
--    (for a production app you'd lock this down further)
alter table sessions         enable row level security;
alter table session_students enable row level security;
alter table student_answers  enable row level security;

create policy "Allow all" on sessions         for all using (true) with check (true);
create policy "Allow all" on session_students for all using (true) with check (true);
create policy "Allow all" on student_answers  for all using (true) with check (true);

