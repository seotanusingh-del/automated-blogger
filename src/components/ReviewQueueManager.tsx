import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Search, 
  Send, 
  Eye, 
  CheckSquare, 
  Square, 
  ExternalLink, 
  RefreshCw, 
  Plane, 
  Tag, 
  MapPin, 
  Sliders, 
  Sparkles,
  Download
} from 'lucide-react';
import { GeneratedPost } from '../types/airline';

interface ReviewQueueManagerProps {
  posts: GeneratedPost[];
  currentIndex: number;
  onSelectPost: (index: number) => void;
  onToggleVerifyPost: (index: number) => void;
  onVerifyAll: (verify: boolean) => void;
  onPublishSinglePost: (index: number) => void;
  onPublishAllVerified: () => void;
  onDownloadBanner: (imageUrl: string, title: string) => void;
  isPublishingBulk: boolean;
  bulkProgress: { current: number; total: number; currentTitle?: string } | null;
  isDarkMode: boolean;
  onCloseQueueView?: () => void;
}

export const ReviewQueueManager: React.FC<ReviewQueueManagerProps> = ({
  posts,
  currentIndex,
  onSelectPost,
  onToggleVerifyPost,
  onVerifyAll,
  onPublishSinglePost,
  onPublishAllVerified,
  onDownloadBanner,
  isPublishingBulk,
  bulkProgress,
  isDarkMode,
  onCloseQueueView
}) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'unverified' | 'published'>('all');

  const verifiedCount = posts.filter(p => p.verified).length;
  const publishedCount = posts.filter(p => p.status === 'Published').length;

  const filteredPosts = posts.map((post, originalIndex) => ({ post, originalIndex })).filter(({ post }) => {
    const matchesSearch = 
      post.airlineName.toLowerCase().includes(filterText.toLowerCase()) ||
      post.city.toLowerCase().includes(filterText.toLowerCase()) ||
      post.officeName.toLowerCase().includes(filterText.toLowerCase()) ||
      post.title.toLowerCase().includes(filterText.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'verified') return !!post.verified;
    if (statusFilter === 'unverified') return !post.verified;
    if (statusFilter === 'published') return post.status === 'Published';
    return true;
  });

  return (
    <div className={`rounded-2xl border p-5 shadow-sm space-y-4 transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      
      {/* Top Header Summary */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3 ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <span>📋 Full Review Queue</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
              isDarkMode ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-sky-50 text-sky-600 border-sky-200'
            }`}>
              {posts.length} Generated Blog Posts
            </span>
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Verify every generated airline office blog, inspect SEO metadata, and publish sequentially or in bulk to Blogger.
          </p>
        </div>

        {/* Verification Stats & Return Button */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-tight ${
            isDarkMode ? 'bg-emerald-950/30 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            ✓ Verified: <strong>{verifiedCount}</strong> / {posts.length}
          </span>
          <span className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold uppercase tracking-tight ${
            isDarkMode ? 'bg-blue-950/30 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            🚀 Published: <strong>{publishedCount}</strong>
          </span>
          {onCloseQueueView && (
            <button
              onClick={onCloseQueueView}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Open Simulator
            </button>
          )}
        </div>
      </div>

      {/* Bulk Progress Bar if active */}
      {bulkProgress && (
        <div className={`p-4 rounded-xl border space-y-2.5 animate-in slide-in-from-top-2 ${
          isDarkMode ? 'bg-sky-950/40 border-sky-800' : 'bg-sky-50 border-sky-200'
        }`}>
          <div className={`flex items-center justify-between text-xs font-bold ${isDarkMode ? 'text-sky-200' : 'text-sky-800'}`}>
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-500" />
              Publishing in Progress: {bulkProgress.current} of {bulkProgress.total}
            </span>
            <span>{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
            />
          </div>
          {bulkProgress.currentTitle && (
            <p className={`text-[10px] font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Processing: <strong className={isDarkMode ? 'text-slate-200' : 'text-slate-700'}>{bulkProgress.currentTitle}</strong>
            </p>
          )}
        </div>
      )}

      {/* Filter and Bulk Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search generated posts..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={`w-full pl-8 pr-3 py-2 rounded-xl border outline-none text-xs transition ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-sky-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-sky-500 focus:bg-white'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center p-1 rounded-xl border text-[11px] font-bold ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'verified' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setStatusFilter('unverified')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'unverified' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1 rounded-lg transition ${
              statusFilter === 'published' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Live
          </button>
        </div>

        {/* Batch Verify & Publish Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVerifyAll(verifiedCount !== posts.length)}
            className={`px-3 py-2 rounded-xl border font-bold flex items-center gap-1.5 transition ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
            }`}
          >
            {verifiedCount === posts.length ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
            {verifiedCount === posts.length ? 'Unverify All' : 'Verify All'}
          </button>

          <button
            onClick={onPublishAllVerified}
            disabled={isPublishingBulk || verifiedCount === 0}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            {isPublishingBulk ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publish Verified ({verifiedCount})
          </button>
        </div>

      </div>

      {/* Posts List / Table */}
      <div className={`rounded-2xl border max-h-[560px] overflow-y-auto divide-y scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 ${
        isDarkMode 
          ? 'bg-slate-950/60 border-slate-800 divide-slate-800/80' 
          : 'bg-slate-50 border-slate-200 divide-slate-200/50'
      }`}>
        {filteredPosts.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs italic">
            No generated posts match your current filter.
          </div>
        ) : (
          filteredPosts.map(({ post, originalIndex }) => {
            const isSelected = originalIndex === currentIndex;
            const isVerified = !!post.verified;
            const isPublished = post.status === 'Published';

            return (
              <div
                key={post.id || originalIndex}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isSelected 
                    ? (isDarkMode ? 'bg-sky-950/40 border-l-4 border-l-sky-500' : 'bg-sky-50 border-l-4 border-l-sky-600 shadow-sm') 
                    : (isDarkMode ? 'hover:bg-slate-900/60 border-l-4 border-l-transparent' : 'hover:bg-white border-l-4 border-l-transparent')
                }`}
              >
                
                {/* Left: Verification Checkbox, Index & Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleVerifyPost(originalIndex)}
                    className="mt-1 transition-transform active:scale-90"
                    title={isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-500/10" />
                    ) : (
                      <Circle className={`w-6 h-6 ${isDarkMode ? 'text-slate-700' : 'text-slate-300'}`} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {post.airlineName}
                      </span>
                      <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.city}
                      </span>
                      {isPublished && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          LIVE
                        </span>
                      )}
                      {post.isAiGenerated && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                      )}
                    </div>

                    <h4 className={`text-xs font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {post.title}
                    </h4>

                    {/* Metadata tags */}
                    <div className={`flex items-center gap-3 mt-2 text-[10px] font-medium flex-wrap ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        📞 {post.tfnNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 opacity-50" />
                        {post.labels.slice(0, 2).join(', ')}{post.labels.length > 2 ? ` +${post.labels.length - 2}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {isPublished && post.publishedUrl && (
                    <a
                      href={post.publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-2 rounded-lg border transition ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50 shadow-sm'
                      }`}
                      title="View Live Post"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={() => onSelectPost(originalIndex)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                        : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm')
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isSelected ? 'Viewing' : 'Inspect'}
                  </button>

                  <button
                    onClick={() => onDownloadBanner(post.imageUrl, post.title)}
                    className={`p-2 rounded-lg border transition ${
                      isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700' : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200 shadow-sm'
                    }`}
                    title="Download Banner"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onPublishSinglePost(originalIndex)}
                    disabled={isPublishingBulk}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1.5 transition shadow-md active:scale-95"
                  >
                    <Send className="w-3 h-3" /> Publish
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
