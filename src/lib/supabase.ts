import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client configuration
 * Users can plug in their free Supabase credentials in the Admin panel to sync
 * users, subscriptions, and resume records directly into Supabase PostgreSQL.
 */

export function getSupabaseClient(url?: string, anonKey?: string) {
  const supabaseUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client", error);
    return null;
  }
}

/**
 * SQL Schema script that admin can run in Supabase SQL editor with 1 click:
 */
export const SUPABASE_SETUP_SQL = `
-- 1. Create Accounts table for managing user access and subscriptions
create table if not exists public.accounts (
  id text primary key,
  username text unique not null,
  password_hash text not null,
  role text not null check (role in ('admin', 'user')),
  api_key text default '',
  subscription_plan text not null check (subscription_plan in ('1-month', '6-month', '12-month', 'unlimited')),
  expires_at timestamptz not null,
  is_active boolean default true,
  usage_count int default 0,
  max_usage_limit int default 100,
  created_at timestamptz default now()
);

-- 2. Create Tailored Resumes Records table (Can effortlessly hold 50,000+ resumes on free tier)
create table if not exists public.tailored_resumes (
  id text primary key,
  user_id text references public.accounts(id) on delete cascade,
  title text not null,
  format_style text not null,
  ats_score int default 85,
  associated_jds jsonb not null default '[]'::jsonb,
  ats_feedback jsonb not null default '{}'::jsonb,
  resume_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table public.accounts enable row level security;
alter table public.tailored_resumes enable row level security;

-- Public read/write policy for API operations
create policy "Allow full access for authenticated service or anon demo"
  on public.accounts for all using (true);

create policy "Allow full access for resumes"
  on public.tailored_resumes for all using (true);
`;
