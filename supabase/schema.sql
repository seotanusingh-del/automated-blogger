-- ==============================================================================
-- AUTOMATED-BLOGGER SQL SCHEMA FOR SUPABASE & N8N WORKFLOW INTEGRATION
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Table: requests (Primary queue table for n8n workflow trigger)
-- When user clicks "Run n8n Workflow" on Step 2, the app clears previous rows and inserts
-- exactly one row with status = 'pending'. This triggers your n8n workflow.
create table if not exists public.requests (
  id text primary key default gen_random_uuid()::text,
  company_name text not null default '',
  company_email text not null default '',
  company_website text not null default '',
  blog_type text not null default 'airlines',
  keyword text not null default '',
  topic text not null default '',
  tfn text not null default '',
  tfn_number text not null default '',
  airline_name text not null default '',
  city text not null default 'Headquarters',
  country text not null default 'United States',
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'error')),
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Compatible Table: request (Singular alias in case n8n references "request")
create table if not exists public.request (
  id text primary key default gen_random_uuid()::text,
  company_name text not null default '',
  company_email text not null default '',
  company_website text not null default '',
  blog_type text not null default 'airlines',
  keyword text not null default '',
  topic text not null default '',
  tfn text not null default '',
  tfn_number text not null default '',
  airline_name text not null default '',
  city text not null default 'Headquarters',
  country text not null default 'United States',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Friendly Table: user_blog_requests (Snake_case alias)
create table if not exists public.user_blog_requests (
  id text primary key default gen_random_uuid()::text,
  company_name text not null default '',
  company_email text not null default '',
  company_website text not null default '',
  blog_type text not null default 'airlines',
  keyword text not null default '',
  topic text not null default '',
  tfn text not null default '',
  tfn_number text not null default '',
  airline_name text not null default '',
  city text not null default 'Headquarters',
  country text not null default 'United States',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Friendly Table: "User blog request" (Exact title case with spaces if created in Supabase UI)
create table if not exists public."User blog request" (
  id text primary key default gen_random_uuid()::text,
  company_name text not null default '',
  company_email text not null default '',
  company_website text not null default '',
  blog_type text not null default 'airlines',
  keyword text not null default '',
  topic text not null default '',
  tfn text not null default '',
  tfn_number text not null default '',
  airline_name text not null default '',
  city text not null default 'Headquarters',
  country text not null default 'United States',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Table: blogs (Destination table where n8n returns the generated blog)
-- Once n8n finishes, it inserts the generated article here with request_id matching the request.
create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  request_id text,
  blog_type text not null default 'airlines',
  title text not null default '',
  keyword text not null default '',
  topic text not null default '',
  content_html text not null default '',
  html_content text not null default '',
  content text not null default '',
  banner_url text,
  image_url text,
  airline_name text not null default '',
  city text not null default '',
  status text not null default 'Draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Table: blog_templates (Reusable Master Templates)
create table if not exists public.blog_templates (
  id text primary key,
  template_name text not null default '',
  name text not null default '',
  category text not null default 'airlines',
  title text not null default '',
  keyword text not null default '',
  description text not null default '',
  html_content text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Table: blog_posts (History & anti-cannibalization tracking)
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  content text not null default '',
  airline_name text not null default '',
  city text not null default '',
  post_url text,
  created_at timestamptz not null default now()
);

-- 8. Indexes for ultra-fast polling & query performance
create index if not exists requests_status_idx on public.requests(status, created_at desc);
create index if not exists blogs_request_idx on public.blogs(request_id, created_at desc);
create index if not exists blog_posts_airline_city_idx on public.blog_posts(airline_name, city);

-- 9. Row Level Security (RLS) - Permissive rules for web app and n8n workflow
alter table public.requests enable row level security;
alter table public.request enable row level security;
alter table public.user_blog_requests enable row level security;
alter table public."User blog request" enable row level security;
alter table public.blogs enable row level security;
alter table public.blog_templates enable row level security;
alter table public.blog_posts enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow all on requests" on public.requests;
drop policy if exists "Allow all on request" on public.request;
drop policy if exists "Allow all on user_blog_requests" on public.user_blog_requests;
drop policy if exists "Allow all on User blog request" on public."User blog request";
drop policy if exists "Allow all on blogs" on public.blogs;
drop policy if exists "Allow all on blog_templates" on public.blog_templates;
drop policy if exists "Allow all on blog_posts" on public.blog_posts;

-- Create open access policies for anonymous and authenticated clients
create policy "Allow all on requests" on public.requests for all using (true) with check (true);
create policy "Allow all on request" on public.request for all using (true) with check (true);
create policy "Allow all on user_blog_requests" on public.user_blog_requests for all using (true) with check (true);
create policy "Allow all on User blog request" on public."User blog request" for all using (true) with check (true);
create policy "Allow all on blogs" on public.blogs for all using (true) with check (true);
create policy "Allow all on blog_templates" on public.blog_templates for all using (true) with check (true);
create policy "Allow all on blog_posts" on public.blog_posts for all using (true) with check (true);

-- Explicit table grants
grant all on table public.requests to anon, authenticated, service_role;
grant all on table public.request to anon, authenticated, service_role;
grant all on table public.user_blog_requests to anon, authenticated, service_role;
grant all on table public."User blog request" to anon, authenticated, service_role;
grant all on table public.blogs to anon, authenticated, service_role;
grant all on table public.blog_templates to anon, authenticated, service_role;
grant all on table public.blog_posts to anon, authenticated, service_role;
