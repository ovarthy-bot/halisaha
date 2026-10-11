-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- Stores the whole app state (roster + settings) as a single row.

create table if not exists app_state (
  id text primary key,
  players jsonb not null default '[]',
  rules jsonb not null default '[]',
  team_size integer not null default 6,
  team1 jsonb not null default '{"name":"Team 1","color":"#22c55e"}',
  team2 jsonb not null default '{"name":"Team 2","color":"#3b82f6"}',
  updated_at timestamptz not null default now()
);

-- If the table already exists from before the "rules" feature was added:
alter table app_state add column if not exists rules jsonb not null default '[]';

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

insert into app_state (id) values ('default')
on conflict (id) do nothing;
