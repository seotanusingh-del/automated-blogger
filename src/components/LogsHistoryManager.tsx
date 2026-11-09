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
    <div className={`p-4 sm:p-6 rounded-2xl border space-y-5 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Step 5: Publishing History &amp; Real-Time Activity Logs</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {posts.length} Posts • {logs.length} Log Events
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit and track automated n8n triggers, AI generations, and live Blogger post URLs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'posts' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Posts &amp; URLs ({posts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === 'logs' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Real-Time Logs ({logs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: POSTS & PUBLISHED DIRECTORY */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          
          {/* Action & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                placeholder="Search by title, keyword, city, or status..."
                className={`text-xs rounded-xl px-3 py-2 border outline-none min-w-[240px] ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className={`text-xs rounded-xl px-3 py-2 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="all">All Statuses ({posts.length})</option>
                <option value="Published">Published ({posts.filter(p => p.status === 'Published').length})</option>
                <option value="Ready">Ready ({posts.filter(p => p.status === 'Ready').length})</option>
                <option value="Draft">Draft ({posts.filter(p => p.status === 'Draft').length})</option>
                <option value="Error">Error ({posts.filter(p => p.status === 'Error').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyLiveUrls}
                className="px-3 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Copy all live Blogger post links"
              >
                {copiedAllUrls ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAllUrls ? 'Copied!' : 'Copy Live URLs'}</span>
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Header & Selection Status */}
          {selectedIds.length > 0 && (
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs flex items-center justify-between text-sky-400">
              <span className="font-semibold">{selectedIds.length} posts selected</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPublishSelected(selectedIds)}
                  className="px-3 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Publish Selected
                </button>
                <button
                  type="button"
                  onClick={() => onDeletePosts(selectedIds)}
                  className="px-3 py-1 rounded border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl text-xs">
                No matching posts in history. Generate posts in Step 2 to populate this log.
              </div>
            ) : (
              filteredPosts.map((post, idx) => {
                const isSelected = selectedIds.includes(post.id);
                const isPublished = post.status === 'Published';
                return (
                  <div
                    key={post.id}
                    className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs transition ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/5'
                        : isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(post.id)}
                        className="rounded border-slate-700 text-sky-600 focus:ring-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 truncate">{post.title}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            isPublished
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : post.status === 'Ready'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                                : post.status === 'Error'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{post.airlineName} • {post.city}</span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{post.keyword}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.publishedUrl ? (
                        <>
                          <a
                            href={post.publishedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] hover:bg-emerald-600/30 flex items-center gap-1"
                          >
                            <span>Live Post</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            type="button"
                            onClick={() => copySingleUrl(post.id, post.publishedUrl!)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                            title="Copy Live URL"
                          >
                            {copiedUrlId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onPublishSinglePost(idx)}
                          className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Publish</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectPostToReview(idx)}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] font-semibold"
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
            <span className="text-xs text-slate-400">
              Showing background execution events, n8n webhook signals, and database status logs:
            </span>
            <button
              type="button"
              onClick={onClearLogs}
              className="text-xs text-rose-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear Logs
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs max-h-[450px] overflow-y-auto space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-600 py-6 text-center">
                No activity logs recorded yet. Events like workflow runs and publishing will stream here in real-time.
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-start gap-2.5 text-[11.5px] border-b border-slate-900 pb-1.5">
                  <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
                    log.level === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : log.level === 'error'
                        ? 'bg-rose-500/20 text-rose-400'
                        : log.level === 'warning'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-sky-500/20 text-sky-400'
                  }`}>
                    {log.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-200 font-semibold">{log.title}</span>
                    {log.details && <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>}
                    {log.url && (
                      <a href={log.url} target="_blank" rel="noreferrer" className="text-sky-400 underline text-[11px] block mt-0.5">
                        {log.url}
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
