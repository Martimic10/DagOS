-- ── DagOS Supabase Schema ───────────────────────────────────────────────────
-- Run this in the Supabase SQL editor for your project.
-- Table: public.user_profiles
-- Linked 1:1 to auth.users. Stores display name and future profile fields.

create table if not exists public.user_profiles (
  id          uuid        references auth.users on delete cascade primary key,
  first_name  text,
  email       text,
  is_pro      boolean     default false not null,
  created_at  timestamptz default timezone('utc', now()) not null

  -- Future-ready columns (uncomment and add as needed):
  -- , stripe_customer_id        text
  -- , stripe_subscription_status text default 'free'
  -- , settings                  jsonb default '{}'::jsonb
);

-- Row-level security
alter table public.user_profiles enable row level security;

create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ── Future tables (placeholders) ─────────────────────────────────────────────

-- create table public.conversations ( ... );
-- create table public.synced_settings ( ... );
