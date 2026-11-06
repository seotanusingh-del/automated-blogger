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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <span>📋 Full Review Queue</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              {posts.length} Generated Blog Posts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verify every generated airline office blog, inspect SEO metadata, and publish sequentially or in bulk to Blogger.
          </p>
        </div>

        {/* Verification Stats & Return Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            ✓ Verified: <strong>{verifiedCount}</strong> / {posts.length}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-lg border font-semibold bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300">
            🚀 Published: <strong>{publishedCount}</strong>
          </span>
          {onCloseQueueView && (
            <button
              onClick={onCloseQueueView}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Open Active Post Simulator
            </button>
          )}
        </div>
      </div>

      {/* Bulk Progress Bar if active */}
      {bulkProgress && (
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-sky-800 dark:text-sky-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-600 dark:text-sky-400" />
              Publishing Posts in Progress: {bulkProgress.current} of {bulkProgress.total}
            </span>
            <span>{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
            />
          </div>
          {bulkProgress.currentTitle && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Currently Publishing: <strong>{bulkProgress.currentTitle}</strong>
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
            placeholder="Search generated posts by airline, city, or title..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className={`w-full pl-8 pr-3 py-2 rounded-lg border outline-none text-xs ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              statusFilter === 'all' ? 'bg-sky-600 text-white font-bold' : 'text-slate-500'
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setStatusFilter('verified')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              statusFilter === 'verified' ? 'bg-sky-600 text-white font-bold' : 'text-slate-500'
            }`}
          >
            Verified ({verifiedCount})
          </button>
          <button
            onClick={() => setStatusFilter('unverified')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              statusFilter === 'unverified' ? 'bg-sky-600 text-white font-bold' : 'text-slate-500'
            }`}
          >
            Pending ({posts.length - verifiedCount})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              statusFilter === 'published' ? 'bg-sky-600 text-white font-bold' : 'text-slate-500'
            }`}
          >
            Published ({publishedCount})
          </button>
        </div>

        {/* Batch Verify & Publish Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVerifyAll(verifiedCount !== posts.length)}
            className={`px-3 py-2 rounded-lg border font-semibold flex items-center gap-1.5 transition ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {verifiedCount === posts.length ? <Square className="w-3.5 h-3.5" /> : <CheckSquare className="w-3.5 h-3.5" />}
            {verifiedCount === posts.length ? 'Unverify All' : 'Verify All'}
          </button>

          <button
            onClick={onPublishAllVerified}
            disabled={isPublishingBulk || verifiedCount === 0}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow transition"
          >
            {isPublishingBulk ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Publish All Verified ({verifiedCount})
          </button>
        </div>

      </div>

      {/* Posts List / Table */}
      <div className={`rounded-xl border max-h-[560px] overflow-y-auto divide-y ${
        isDarkMode 
          ? 'bg-slate-950/60 border-slate-800 divide-slate-800/80' 
          : 'bg-slate-50 border-slate-200 divide-slate-200'
      }`}>
        {filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No generated posts match the selected filters.
          </div>
        ) : (
          filteredPosts.map(({ post, originalIndex }) => {
            const isSelected = originalIndex === currentIndex;
            const isVerified = !!post.verified;
            const isPublished = post.status === 'Published';

            return (
              <div
                key={post.id || originalIndex}
                className={`p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition ${
                  isSelected 
                    ? (isDarkMode ? 'bg-sky-950/40 border-l-4 border-l-sky-500' : 'bg-sky-50/80 border-l-4 border-l-sky-600') 
                    : (isDarkMode ? 'hover:bg-slate-900/60' : 'hover:bg-white')
                }`}
              >
                
                {/* Left: Verification Checkbox, Index & Details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleVerifyPost(originalIndex)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-500 transition"
                    title={isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
                  >
                    {isVerified ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        #{originalIndex + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {post.airlineName}
                      </span>
                      <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                        {post.city} ({post.country})
                      </span>
                      {isPublished && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Published
                        </span>
                      )}
                      {isVerified && !isPublished && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                          Verified &amp; Ready
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {post.title}
                    </h4>

                    {/* Metadata tags */}
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        📞 {post.tfnNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {post.labels.slice(0, 3).join(', ')}{post.labels.length > 3 ? ` +${post.labels.length - 3}` : ''}
                      </span>
                      {post.bloggerSettings?.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {post.bloggerSettings.location.lat.toFixed(2)}, {post.bloggerSettings.location.lng.toFixed(2)}
                        </span>
                      )}
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
                      className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Post
                    </a>
                  )}

                  <button
                    onClick={() => onSelectPost(originalIndex)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600'
                        : (isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300')
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isSelected ? 'Viewing' : 'Inspect & Edit'}
                  </button>

                  <button
                    onClick={() => onDownloadBanner(post.imageUrl, post.title)}
                    className={`p-1.5 rounded-lg border transition ${
                      isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700' : 'bg-white hover:bg-slate-100 text-slate-500 border-slate-300'
                    }`}
                    title="Download Banner Image (PNG)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onPublishSinglePost(originalIndex)}
                    disabled={isPublishingBulk}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 transition shadow"
                    title="Publish this post to Blogger"
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
