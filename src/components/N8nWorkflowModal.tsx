import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  Database, 
  Bot, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  Sliders
} from 'lucide-react';

interface N8nWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  n8nWebhookUrl: string;
  onChangeN8nWebhookUrl: (url: string) => void;
  n8nMcpUrl: string;
  onChangeN8nMcpUrl: (url: string) => void;
  n8nApiKey: string;
  onChangeN8nApiKey: (key: string) => void;
  supabaseCustomKey: string;
  onChangeSupabaseCustomKey: (key: string) => void;
}

export const N8nWorkflowModal: React.FC<N8nWorkflowModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  n8nWebhookUrl,
  onChangeN8nWebhookUrl,
  n8nMcpUrl,
  onChangeN8nMcpUrl,
  n8nApiKey,
  onChangeN8nApiKey,
  supabaseCustomKey,
  onChangeSupabaseCustomKey
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    tested: boolean;
    webhookOk?: boolean;
    webhookStatus?: number;
    webhookMessage?: string;
    mcpOk?: boolean;
    mcpStatus?: number;
    mcpMessage?: string;
    supabaseOk?: boolean;
    supabaseMessage?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnections = async () => {
    setIsTesting(true);
    setTestResults(null);

    try {
      const res = await fetch('/api/workflow/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          n8nWebhookUrl,
          n8nMcpUrl,
          n8nApiKey,
          supabaseKey: supabaseCustomKey
        })
      });

      const data = await res.json().catch(() => ({}));
      setTestResults({
        tested: true,
        webhookOk: data.n8nWebhook?.ok,
        webhookStatus: data.n8nWebhook?.status,
        webhookMessage: data.n8nWebhook?.message,
        mcpOk: data.n8nMcp?.ok,
        mcpStatus: data.n8nMcp?.status,
        mcpMessage: data.n8nMcp?.message,
        supabaseOk: data.supabase?.ok,
        supabaseMessage: data.supabase?.message
      });
    } catch (err: any) {
      setTestResults({
        tested: true,
        webhookOk: false,
        webhookMessage: err?.message || 'Network test failed',
        mcpOk: false,
        supabaseOk: false,
        supabaseMessage: err?.message || 'Network test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copySqlSchema = () => {
    const sql = `-- ==============================================================================
-- AUTOMATED-BLOGGER SQL SCHEMA FOR SUPABASE & N8N WORKFLOW
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Table: requests (Primary queue watched by n8n)
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

-- 2. Compatible alias tables: request & user_blog_requests & "User blog request"
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

create table if not exists public.user_blog_requests (
  id text primary key default gen_random_uuid()::text,
  company_name text not null default '',
  blog_type text not null default 'airlines',
  keyword text not null default '',
  topic text not null default '',
  tfn_number text not null default '',
  airline_name text not null default '',
  city text not null default 'Headquarters',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public."User blog request" (
  id text primary key default gen_random_uuid()::text,
  company_name text not null default '',
  blog_type text not null default 'airlines',
  keyword text not null default '',
  topic text not null default '',
  tfn_number text not null default '',
  airline_name text not null default '',
  city text not null default 'Headquarters',
  status text not null default 'pending',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 3. Table: blogs (Destination where n8n returns the generated blog)
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
  created_at timestamptz not null default now()
);

-- 4. Enable Row Level Security & Open Access Policies
alter table public.requests enable row level security;
alter table public.request enable row level security;
alter table public.user_blog_requests enable row level security;
alter table public."User blog request" enable row level security;
alter table public.blogs enable row level security;

create policy "Allow all on requests" on public.requests for all using (true) with check (true);
create policy "Allow all on request" on public.request for all using (true) with check (true);
create policy "Allow all on user_blog_requests" on public.user_blog_requests for all using (true) with check (true);
create policy "Allow all on User blog request" on public."User blog request" for all using (true) with check (true);
create policy "Allow all on blogs" on public.blogs for all using (true) with check (true);

-- Grant direct rights to anonymous and service roles
grant all on table public.requests to anon, authenticated, service_role;
grant all on table public.request to anon, authenticated, service_role;
grant all on table public.user_blog_requests to anon, authenticated, service_role;
grant all on table public."User blog request" to anon, authenticated, service_role;
grant all on table public.blogs to anon, authenticated, service_role;`;

    void navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className={`border rounded-2xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`flex items-start justify-between pb-4 border-b gap-3 ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">n8n Workflow &amp; Supabase Integration</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                End-to-end automation connecting Step 2 with your n8n workflow, MCP server, and Supabase database.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

          {/* Workflow Architecture Diagram / Steps */}
          <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
            isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`}>
              <Bot className="w-4 h-4" />
              <span>How the n8n + Supabase Loop Works:</span>
            </div>
            <ol className={`list-decimal list-inside space-y-1.5 text-[11px] ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <li>
                Clicking <strong className={isDarkMode ? 'text-violet-300' : 'text-violet-600'}>⚡ Run n8n Workflow</strong> clears previous rows and inserts <strong>exactly 1 pending row</strong> into Supabase table <code className={isDarkMode ? 'text-sky-300' : 'text-sky-700'}>requests</code>.
              </li>
              <li>
                The app calls your n8n Webhook &amp; MCP endpoint. If n8n listens to database row changes on <code className={isDarkMode ? 'text-sky-300' : 'text-sky-700'}>status = 'pending'</code>, it triggers automatically!
              </li>
              <li>
                n8n processes the topic, generates the blog, and saves it into the Supabase <code className={isDarkMode ? 'text-sky-300' : 'text-sky-700'}>blogs</code> table.
              </li>
              <li>
                The tool polls the <code className={isDarkMode ? 'text-sky-300' : 'text-sky-700'}>blogs</code> table, fetches the blog, and presents it in the Review Queue!
              </li>
            </ol>
          </div>

          {/* n8n Configuration Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-70 uppercase tracking-wider">
                n8n Webhook URL (Production / Test)
              </label>
              <input
                type="text"
                value={n8nWebhookUrl}
                onChange={(e) => {
                  onChangeN8nWebhookUrl(e.target.value);
                  localStorage.setItem('easyflight_n8n_webhook', e.target.value);
                }}
                placeholder="https://automated-blogger.app.n8n.cloud/webhook/seo-blog-generator"
                className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-violet-500 focus:bg-white'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed">
                Called via HTTP POST when you click "Run n8n Workflow".
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-70 uppercase tracking-wider">
                n8n MCP Server URL (Model Context Protocol)
              </label>
              <input
                type="text"
                value={n8nMcpUrl}
                onChange={(e) => {
                  onChangeN8nMcpUrl(e.target.value);
                  localStorage.setItem('easyflight_n8n_mcp', e.target.value);
                }}
                placeholder="https://automated-blogger.app.n8n.cloud/mcp-server/http"
                className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-violet-500 focus:bg-white'
                }`}
              />
              <span className="text-[10px] text-slate-500 mt-1 block leading-relaxed">
                Called via JSON-RPC 2.0 protocol on <code className="text-violet-500 font-bold">tools/call</code>.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-70 uppercase tracking-wider">
                  n8n API Key (Optional)
                </label>
                <input
                  type="password"
                  value={n8nApiKey}
                  onChange={(e) => {
                    onChangeN8nApiKey(e.target.value);
                    localStorage.setItem('easyflight_n8n_api_key', e.target.value);
                  }}
                  placeholder="n8n_api_..."
                  className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-violet-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-violet-500 focus:bg-white'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-70 uppercase tracking-wider">
                  Supabase Key Override (Optional)
                </label>
                <input
                  type="password"
                  value={supabaseCustomKey}
                  onChange={(e) => {
                    onChangeSupabaseCustomKey(e.target.value);
                    localStorage.setItem('easyflight_supabase_service_key', e.target.value);
                  }}
                  placeholder="eyJhbGciOi..."
                  className={`w-full text-xs font-mono rounded-lg p-2.5 border outline-none transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-sky-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Test Connection Button & Live Results */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestConnections}
              disabled={isTesting}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing all connections...' : '🔌 Test Connections Now'}</span>
            </button>

            {testResults && (
              <div className={`mt-4 p-4 rounded-xl border space-y-3 text-xs animate-in slide-in-from-top-2 ${
                isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`font-bold opacity-70 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Connection Test Report:
                </div>
                
                {/* Supabase Status */}
                <div className={`flex items-center justify-between text-[11px] p-2.5 rounded border transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Supabase requests Table:</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded font-bold ${
                    testResults.supabaseOk ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {testResults.supabaseOk ? '✅ Accessible' : '⚠️ Unverified'}
                  </span>
                </div>

                {/* n8n Webhook Status */}
                <div className={`flex items-center justify-between text-[11px] p-2.5 rounded border transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-violet-500" />
                    <span>n8n Webhook:</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded font-bold ${
                    testResults.webhookOk ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {testResults.webhookOk ? `✅ Connected (${testResults.webhookStatus || 200})` : `⚠️ ${testResults.webhookMessage || 'Check URL'}`}
                  </span>
                </div>

                {/* n8n MCP Status */}
                <div className={`flex items-center justify-between text-[11px] p-2.5 rounded border transition ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
                }`}>
                  <div className="flex items-center gap-2">
                    <Bot className="w-3.5 h-3.5 text-sky-500" />
                    <span>n8n MCP Server:</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded font-bold ${
                    testResults.mcpOk ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                  }`}>
                    {testResults.mcpOk ? `✅ Responded (${testResults.mcpStatus || 200})` : `ℹ️ ${testResults.mcpMessage || 'HTTP JSON-RPC Ready'}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Copy SQL Schema Box */}
          <div className={`pt-4 border-t space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Supabase SQL Schema</span>
              <button
                type="button"
                onClick={copySqlSchema}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-sky-600/20"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Paste this into your Supabase SQL Editor. It creates tables <code className={isDarkMode ? 'text-sky-300' : 'text-sky-700 font-bold'}>requests</code>, <code className={isDarkMode ? 'text-sky-300' : 'text-sky-700 font-bold'}>blogs</code>, etc., with full RLS and open permissions.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className={`pt-4 border-t flex items-center justify-between ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <a
            href="https://automated-blogger.app.n8n.cloud"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-violet-500 hover:underline flex items-center gap-1.5 font-bold"
          >
            Open n8n Dashboard <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2 rounded-lg font-bold text-xs transition ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Done
          </button>
        </div>

      </div>
    </div>

  );
};
