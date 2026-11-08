-- Workflow persistence for the five dashboard steps.
-- Run this once in Supabase SQL Editor for the configured project.

create table if not exists public.blog_workspaces (
  id text primary key,
  blog_type text not null,
  company_name text,
  company_email text,
  company_website text,
  tfn text,
  keyword text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_entities (
  id text primary key,
  workspace_id text not null references public.blog_workspaces(id) on delete cascade,
  name text not null,
  code text,
  primary_color text,
  accent_color text,
  locations jsonb not null default '[]'::jsonb,
  selected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id text not null references public.blog_workspaces(id) on delete cascade,
  url text not null,
  filename text,
  source text not null default 'library',
  created_at timestamptz not null default now()
);

create table if not exists public.blog_drafts (
  id text primary key,
  workspace_id text not null references public.blog_workspaces(id) on delete cascade,
  entity_id text,
  title text not null default '',
  keyword text not null default '',
  html_content text not null default '',
  image_url text,
  status text not null default 'Draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_templates (
  id text primary key,
  workspace_id text not null references public.blog_workspaces(id) on delete cascade,
  name text not null,
  title text not null default '',
  keyword text not null default '',
  html_content text not null default '',
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_history (
  id text primary key,
  workspace_id text not null references public.blog_workspaces(id) on delete cascade,
  draft_id text,
  title text not null default '',
  status text not null default 'Draft',
  published_url text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_entities_workspace_idx on public.blog_entities(workspace_id);
create index if not exists blog_assets_workspace_idx on public.blog_assets(workspace_id);
create index if not exists blog_drafts_workspace_idx on public.blog_drafts(workspace_id);
create index if not exists blog_templates_workspace_idx on public.blog_templates(workspace_id);
create index if not exists blog_history_workspace_idx on public.blog_history(workspace_id);
