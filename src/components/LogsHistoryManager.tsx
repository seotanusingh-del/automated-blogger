import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Trash2, 
  Send, 
  Filter, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Terminal, 
  RefreshCw,
  Eye,
  Layers
} from 'lucide-react';
import { GeneratedPost } from '../types/airline';

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  type: 'workflow' | 'ai' | 'blogger' | 'supabase' | 'system';
  level: 'info' | 'success' | 'warning' | 'error';
  title: string;
  details?: string;
  url?: string;
}

interface LogsHistoryManagerProps {
  posts: GeneratedPost[];
  logs: ActivityLogItem[];
  isDarkMode: boolean;
  onPublishSinglePost: (index: number) => void;
  onPublishSelected: (ids: string[]) => void;
  onDeletePosts: (ids: string[]) => void;
  onClearLogs: () => void;
  onSelectPostToReview: (index: number) => void;
}

export const LogsHistoryManager: React.FC<LogsHistoryManagerProps> = ({
  posts,
  logs,
  isDarkMode,
  onPublishSinglePost,
  onPublishSelected,
  onDeletePosts,
  onClearLogs,
  onSelectPostToReview
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'logs'>('posts');
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GeneratedPost['status']>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [copiedAllUrls, setCopiedAllUrls] = useState(false);

  const filteredPosts = posts.filter(post => {
    const query = filterText.trim().toLowerCase();
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesSearch = !query || [
      post.title,
      post.keyword,
      post.airlineName,
      post.city,
      post.status,
      post.publishedUrl || ''
    ].some(val => val.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredPosts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const copyLiveUrls = () => {
    const targets = (selectedIds.length > 0 
      ? filteredPosts.filter(p => selectedIds.includes(p.id))
      : filteredPosts
    ).filter(p => !!p.publishedUrl);

    if (targets.length === 0) {
      alert('No published URLs available to copy yet.');
      return;
    }

    const text = targets.map(p => `${p.title}: ${p.publishedUrl}`).join('\n');
    void navigator.clipboard.writeText(text);
    setCopiedAllUrls(true);
    setTimeout(() => setCopiedAllUrls(false), 3000);
  };

  const copySingleUrl = (id: string, url: string) => {
    void navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 2000);
  };

  const exportCsv = () => {
    const headers = ['ID', 'Title', 'Entity / Airline', 'City', 'Status', 'Keyword', 'Helpline', 'Published URL', 'Created At'];
    const rows = filteredPosts.map(p => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.airlineName}"`,
      `"${p.city}"`,
      `"${p.status}"`,
      `"${p.keyword}"`,
      `"${p.tfnNumber}"`,
      `"${p.publishedUrl || ''}"`,
      `"${new Date().toISOString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `automated-blogger-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border space-y-5 transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Step 5: Publishing History &amp; Real-Time Activity Logs</h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isDarkMode ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-600 border-sky-200'
            } border`}>
              {posts.length} Posts • {logs.length} Log Events
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Audit and track automated n8n triggers, AI generations, and live Blogger post URLs.
          </p>
        </div>

        {/* Tab Switcher & Quick Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={async () => {
              const customKey = localStorage.getItem('easyflight_supabase_service_key') || '';
              const webhookUrl = localStorage.getItem('easyflight_n8n_webhook') || '';
              const mcpUrl = localStorage.getItem('easyflight_n8n_mcp') || '';
              const n8nKey = localStorage.getItem('easyflight_n8n_apikey') || '';
              try {
                const res = await fetch('/api/workflow/test-connection', { 
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    supabaseKey: customKey,
                    n8nWebhookUrl: webhookUrl,
                    n8nMcpUrl: mcpUrl,
                    n8nApiKey: n8nKey
                  })
                });
                const data = await res.json();
                if (data.success) {
                  const summary = [
                    `Supabase API: ${data.supabase?.ok ? '✅ Active' : `❌ Failed (${data.supabase?.message || 'Error'})`}`,
                    `Supabase Storage: ${data.supabaseStorage?.ok ? '✅ Active' : `❌ Failed (${data.supabaseStorage?.message || 'Error'})`}`,
                    `n8n Webhook: ${data.n8nWebhook?.ok ? '✅ Active' : `❌ Failed (${data.n8nWebhook?.message || 'Error'})`}`,
                    `n8n MCP: ${data.n8nMcp?.ok ? '✅ Active' : `❌ Failed (${data.n8nMcp?.message || 'Error'})`}`
                  ].join('\n');
                  alert(`Connectivity Check Results:\n\n${summary}\n\nCheck "Step 5: Real-Time Logs" for more details if any checks failed.`);
                } else {
                  alert(`Connectivity Check Failed: ${data.error || 'Unknown server error'}`);
                }
              } catch (e: any) { 
                alert(`Connectivity test failed: ${e.message || 'Check your network connection.'}`); 
              }
            }}
            className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-3 h-3" />
            Check Connectivity
          </button>

          <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs font-bold transition-colors ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'posts' 
                  ? 'bg-sky-600 text-white shadow-lg' 
                  : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-200')
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Posts &amp; URLs ({posts.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'logs' 
                  ? 'bg-sky-600 text-white shadow-lg' 
                  : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-200')
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Real-Time Logs ({logs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: POSTS & PUBLISHED DIRECTORY */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          
          {/* Action & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={filterText}
                  onChange={e => setFilterText(e.target.value)}
                  placeholder="Search history..."
                  className={`text-xs rounded-xl pl-8 pr-3 py-2 border outline-none min-w-[200px] transition ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 focus:bg-white'
                  }`}
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className={`text-xs rounded-xl px-3 py-2 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 focus:bg-white'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="Published">Published</option>
                <option value="Ready">Ready</option>
                <option value="Draft">Draft</option>
                <option value="Error">Error</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const allIds = filteredPosts.map(p => p.id);
                  const isAllSelected = allIds.length > 0 && allIds.every(id => selectedIds.includes(id));
                  if (isAllSelected) {
                    setSelectedIds(prev => prev.filter(id => !allIds.includes(id)));
                  } else {
                    setSelectedIds(prev => Array.from(new Set([...prev, ...allIds])));
                  }
                }}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                  isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {filteredPosts.length > 0 && filteredPosts.every(p => selectedIds.includes(p.id)) ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyLiveUrls}
                className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                  isDarkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {copiedAllUrls ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Live URLs</span>
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Selection Stats */}
          {selectedIds.length > 0 && (
            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between animate-in slide-in-from-top-1 ${
              isDarkMode ? 'bg-sky-950/20 border-sky-900/50 text-sky-400' : 'bg-sky-50 border-sky-200 text-sky-700'
            }`}>
              <span className="font-bold">{selectedIds.length} posts selected for batch action</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPublishSelected(selectedIds)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Publish Batch
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePosts(selectedIds)}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {filteredPosts.length === 0 ? (
              <div className={`p-10 text-center border-2 border-dashed rounded-2xl text-xs ${
                isDarkMode ? 'text-slate-600 border-slate-800' : 'text-slate-400 border-slate-100'
              }`}>
                No matching posts in history.
              </div>
            ) : (
              filteredPosts.map((post, idx) => {
                const isSelected = selectedIds.includes(post.id);
                const isPublished = post.status === 'Published';
                return (
                  <div
                    key={post.id}
                    className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition-all ${
                      isSelected
                        ? (isDarkMode ? 'border-sky-500 bg-sky-500/10' : 'border-sky-500 bg-sky-50 shadow-sm')
                        : (isDarkMode ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200 shadow-sm')
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(post.id)}
                        className={`rounded border-slate-300 dark:border-slate-700 text-sky-600 focus:ring-0 w-4 h-4 transition ${
                          isDarkMode ? 'bg-slate-900' : 'bg-white'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{post.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : post.status === 'Ready'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                                : post.status === 'Error'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <div className={`text-[11px] flex items-center gap-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span className="font-medium text-slate-400 dark:text-slate-500">{post.airlineName} • {post.city}</span>
                          <span className="opacity-30">•</span>
                          <span className="truncate italic">{post.keyword}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.publishedUrl ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={post.publishedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`px-2.5 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1.5 transition ${
                              isDarkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            <span>Live Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => copySingleUrl(post.id, post.publishedUrl!)}
                            className={`p-1.5 rounded-lg transition ${
                              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title="Copy Live URL"
                          >
                            {copiedUrlId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPublishSinglePost(idx)}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] flex items-center gap-1.5 shadow-sm"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectPostToReview(idx)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition ${
                          isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME ACTIVITY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-medium opacity-60 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Background execution events, webhook signals, and database status logs:
            </span>
            <button
              type="button"
              onClick={onClearLogs}
              className="text-[11px] text-rose-500 font-bold hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear History
            </button>
          </div>

          <div className={`p-4 rounded-2xl border font-mono text-[11px] max-h-[450px] overflow-y-auto space-y-2.5 transition-colors scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 ${
            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {logs.length === 0 ? (
              <div className="text-slate-400 py-10 text-center italic opacity-50">
                Waiting for real-time activity...
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`flex items-start gap-3 pb-2 border-b last:border-0 ${isDarkMode ? 'border-slate-900' : 'border-slate-100'}`}>
                  <span className="text-slate-500 font-mono text-[10px] pt-0.5 shrink-0">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter shrink-0 border ${
                    log.level === 'success'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : log.level === 'error'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        : log.level === 'warning'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                  }`}>
                    {log.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{log.title}</span>
                    {log.details && <p className={`mt-0.5 italic leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{log.details}</p>}
                    {log.url && (
                      <a href={log.url} target="_blank" rel="noreferrer" className="text-sky-500 hover:underline font-bold block mt-1">
                        View Log Resource →
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
