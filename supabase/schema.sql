-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Stores the whole app state (roster + settings) as a single row.

create table if not exists app_state (
  id text primary key,
  players jsonb not null default '[]',
  rules jsonb not null default '[]',
  team_size integer not null default 6,
  team1 jsonb not null default '{"name":"Takım 1","color":"#22c55e"}',
  team2 jsonb not null default '{"name":"Takım 2","color":"#3b82f6"}',
  balanced_teams jsonb,
  pitch_positions jsonb not null default '{}'::jsonb,
  favorites jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Safe migrations for projects whose app_state table already exists.
alter table app_state add column if not exists rules jsonb not null default '[]';
alter table app_state add column if not exists balanced_teams jsonb;
alter table app_state add column if not exists pitch_positions jsonb not null default '{}'::jsonb;
alter table app_state add column if not exists favorites jsonb not null default '[]'::jsonb;

alter table app_state enable row level security;

-- No auth in this app yet: anon key can read/write freely.
-- Tighten this (e.g. add a user_id column + auth policies) if this ever
-- becomes multi-user or public-facing.
create policy "anon can read app_state" on app_state
  for select using (true);

create policy "anon can upsert app_state" on app_state
  for insert with check (true);

create policy "anon can update app_state" on app_state
  for update using (true);

insert into app_state (id, players, team_size)
values (
  'default',
  '[
    {"id":"seed-0","name":"Emin A.","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-1","name":"Burak","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-2","name":"İlhan","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-3","name":"Samet","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-4","name":"İsa","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-5","name":"Onur","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-6","name":"Fatih","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-7","name":"Serdar","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-8","name":"Emin D.","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-9","name":"Davut","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-10","name":"Alperen","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-11","name":"Ahmet","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-12","name":"Apo","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}},
    {"id":"seed-13","name":"Koray","position":"mid","isSubstitute":false,"stats":{"attack":3,"defense":3,"playmaking":3}}
  ]'::jsonb,
  7
)
on conflict (id) do nothing;
