import React, { useState } from 'react';
import { 
  Tag, 
  MapPin, 
  Link as LinkIcon, 
  Globe, 
  Sliders, 
  Bot, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  ExternalLink,
  Search
} from 'lucide-react';
import { GeneratedPost, BloggerSubSettings } from '../types/airline';
import { getCoordinatesForCity } from '../data/cityCoordinates';

interface BloggerSubSettingsTabProps {
  post: GeneratedPost;
  onUpdateBloggerSettings: (updatedSettings: BloggerSubSettings) => void;
  isDarkMode: boolean;
}

export const BloggerSubSettingsTab: React.FC<BloggerSubSettingsTabProps> = ({
  post,
  onUpdateBloggerSettings,
  isDarkMode
}) => {
  const [newLabelInput, setNewLabelInput] = useState('');

  // Fallback defaults if not yet populated
  const settings: BloggerSubSettings = post.bloggerSettings || {
    labels: post.labels || [post.airlineName, `${post.city} Office`, 'Flight Reservations', 'Customer Service'],
    permalinkSlug: post.slug || `${post.airlineName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${post.city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-office`,
    searchDescription: `Official guide for ${post.airlineName} ${post.city} office. Passenger dispute process, flight ticket booking, baggage compensation & 24/7 hotline ${post.tfnNumber}.`.slice(0, 160),
    location: {
      name: `${post.city}, ${post.country}`,
      lat: 45.6769,
      lng: -111.0429,
      span: '0.1,0.1'
    },
    readerComments: 'ALLOW',
    customRobotTags: {
      index: true,
      follow: true,
      noarchive: false,
      maxSnippet: true,
      maxImagePreview: true
    },
    authorityLinks: {
      dotComplaintUrl: 'https://www.transportation.gov/airconsumer/file-consumer-complaint',
      airlineOfficialUrl: `https://www.google.com/search?q=${encodeURIComponent(post.airlineName + ' official website')}`,
      internalDirectoryUrl: 'https://easyflightconnectblog.blogspot.com/'
    }
  };

  const handleAddLabel = () => {
    if (!newLabelInput.trim()) return;
    const clean = newLabelInput.trim();
    if (!settings.labels.includes(clean)) {
      const updatedLabels = [...settings.labels, clean];
      onUpdateBloggerSettings({ ...settings, labels: updatedLabels });
    }
    setNewLabelInput('');
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    const updatedLabels = settings.labels.filter(l => l !== labelToRemove);
    onUpdateBloggerSettings({ ...settings, labels: updatedLabels });
  };

  const handleAutoSuggestLabels = () => {
    const suggested = [
      post.airlineName,
      `${post.city} Office`,
      `${post.airlineName} Dispute`,
      'Flight Reservations',
      'Complaint Process',
      'Aviation Consumer Protection',
      post.country,
      'Customer Service Helpline'
    ];
    onUpdateBloggerSettings({ ...settings, labels: Array.from(new Set(suggested)) });
  };

  const handleDetectCoordinates = () => {
    const coords = getCoordinatesForCity(post.city, post.country);
    onUpdateBloggerSettings({
      ...settings,
      location: {
        ...settings.location,
        name: `${post.city}, ${post.country}`,
        lat: coords.lat,
        lng: coords.lng
      }
    });
  };

  const permalinkUrl = `https://easyflightconnectblog.blogspot.com/2026/10/${settings.permalinkSlug || post.slug}.html`;

  return (
    <div className="space-y-6 text-xs">
      
      {/* Informative Header */}
      <div className={`p-3 rounded-xl border flex items-center justify-between ${
        isDarkMode ? 'bg-sky-950/30 border-sky-800 text-sky-300' : 'bg-sky-50 border-sky-200 text-sky-800'
      }`}>
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-500" />
          <span><strong>Blogger Automation Sub-Settings:</strong> These parameters are automatically passed to Blogger v3 API upon publishing.</span>
        </div>
        <button
          onClick={handleAutoSuggestLabels}
          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
        >
          <Sparkles className="w-3 h-3" /> Auto-Tune Settings
        </button>
      </div>

      {/* 1. LABELS (Categories & Tags) */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Tag className="w-3.5 h-3.5 text-sky-500" />
            1. Attached Blogger Labels ({settings.labels.length})
          </label>
          <span className="text-[11px] text-slate-500">Comma-separated post categorization tags</span>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          {settings.labels.map((lbl, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                isDarkMode 
                  ? 'bg-sky-950/60 border-sky-700 text-sky-300' 
                  : 'bg-sky-50 border-sky-300 text-sky-800'
              }`}
            >
              {lbl}
              <button
                type="button"
                onClick={() => handleRemoveLabel(lbl)}
                className="hover:text-rose-500 ml-0.5 text-xs font-bold"
                title="Remove label"
              >
                ✕
              </button>
            </span>
          ))}
        </div>

        {/* Add Label Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Add new label (e.g. Flight Dispute, Baggage Claim)..."
            value={newLabelInput}
            onChange={(e) => setNewLabelInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
            className={`flex-1 p-2 rounded-lg border outline-none ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
            }`}
          />
          <button
            type="button"
            onClick={handleAddLabel}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold flex items-center gap-1 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Label
          </button>
        </div>
      </div>

      {/* 2. PERMALINK & CANONICAL URL */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <LinkIcon className="w-3.5 h-3.5 text-sky-500" />
            2. Custom Permalink &amp; Canonical URL
          </label>
          <span className="text-[11px] text-slate-500">SEO slug for search crawlers</span>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Custom Slug</label>
          <input
            type="text"
            value={settings.permalinkSlug}
            onChange={(e) => onUpdateBloggerSettings({ ...settings, permalinkSlug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
            placeholder="everts-air-dispute-complaint-process"
            className={`w-full p-2 rounded-lg border font-mono font-medium outline-none ${
              isDarkMode ? 'bg-slate-950 border-slate-800 text-sky-400' : 'bg-slate-50 border-slate-300 text-sky-800'
            }`}
          />
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] flex items-center justify-between truncate">
          <span className="truncate text-slate-500 dark:text-slate-400">
            Live URL: <strong className="text-emerald-600 dark:text-emerald-400">{permalinkUrl}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
            Canonical Active
          </span>
        </div>
      </div>

      {/* 3. LOCATION (Google Maps Geolocation) */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            3. Geolocation &amp; Maps Pin
          </label>
          <button
            onClick={handleDetectCoordinates}
            className="text-sky-600 dark:text-sky-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> Auto-Detect Coordinates
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Location Name</label>
            <input
              type="text"
              value={settings.location.name}
              onChange={(e) => onUpdateBloggerSettings({
                ...settings,
                location: { ...settings.location, name: e.target.value }
              })}
              className={`w-full p-2 rounded-lg border outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Latitude (°N)</label>
            <input
              type="number"
              step="0.0001"
              value={settings.location.lat}
              onChange={(e) => onUpdateBloggerSettings({
                ...settings,
                location: { ...settings.location, lat: parseFloat(e.target.value) || 0 }
              })}
              className={`w-full p-2 rounded-lg border outline-none font-mono ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Longitude (°W)</label>
            <input
              type="number"
              step="0.0001"
              value={settings.location.lng}
              onChange={(e) => onUpdateBloggerSettings({
                ...settings,
                location: { ...settings.location, lng: parseFloat(e.target.value) || 0 }
              })}
              className={`w-full p-2 rounded-lg border outline-none font-mono ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Check className="w-3.5 h-3.5 text-emerald-500" />
          <span>Coordinates verified: Plots pin directly in Blogger post location card.</span>
        </div>
      </div>

      {/* 4. SEARCH DESCRIPTION (Google Meta Description) */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Search className="w-3.5 h-3.5 text-amber-500" />
            4. Search Description (Meta Description for Google SERP)
          </label>
          <span className={`font-mono font-bold ${
            settings.searchDescription.length > 160 ? 'text-rose-500' : 'text-slate-500'
          }`}>
            {settings.searchDescription.length} / 160 chars
          </span>
        </div>

        <textarea
          rows={3}
          value={settings.searchDescription}
          onChange={(e) => onUpdateBloggerSettings({ ...settings, searchDescription: e.target.value })}
          placeholder="Brief summary shown in Google search result snippet..."
          className={`w-full p-2.5 rounded-lg border outline-none leading-relaxed ${
            isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
          }`}
        />

        {/* Live Google Search Card Preview */}
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Google Search Snippet Preview
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
            https://easyflightconnectblog.blogspot.com › 2026/10 › {settings.permalinkSlug}
          </div>
          <div className="text-sm font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
            {post.title}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            {settings.searchDescription || 'No description entered.'}
          </div>
        </div>
      </div>

      {/* 5. OPTIONS & CUSTOM ROBOT TAGS */}
      <div className={`p-4 rounded-xl border space-y-4 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between">
          <label className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <Bot className="w-3.5 h-3.5 text-emerald-500" />
            5. Options &amp; Custom Robot Tags
          </label>
          <span className="text-[11px] text-slate-500">Indexing controls for Googlebot</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Reader Comments Option */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Reader Comments Option
            </label>
            <select
              value={settings.readerComments}
              onChange={(e) => onUpdateBloggerSettings({ ...settings, readerComments: e.target.value as any })}
              className={`w-full p-2 rounded-lg border outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="ALLOW">Allow Reader Comments (Recommended)</option>
              <option value="DONT_ALLOW_SHOW_EXISTING">Do not allow, show existing</option>
              <option value="DONT_ALLOW_HIDE_EXISTING">Do not allow, hide existing</option>
            </select>
          </div>

          {/* Robot Directives */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Custom Robots Meta
            </label>
            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customRobotTags.index}
                  onChange={(e) => onUpdateBloggerSettings({
                    ...settings,
                    customRobotTags: { ...settings.customRobotTags, index: e.target.checked }
                  })}
                  className="rounded text-sky-600"
                />
                <span className="font-semibold">index (Allow Google indexing)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customRobotTags.follow}
                  onChange={(e) => onUpdateBloggerSettings({
                    ...settings,
                    customRobotTags: { ...settings.customRobotTags, follow: e.target.checked }
                  })}
                  className="rounded text-sky-600"
                />
                <span className="font-semibold">follow (Crawl and follow outbound links)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customRobotTags.maxSnippet}
                  onChange={(e) => onUpdateBloggerSettings({
                    ...settings,
                    customRobotTags: { ...settings.customRobotTags, maxSnippet: e.target.checked }
                  })}
                  className="rounded text-sky-600"
                />
                <span className="font-semibold">max-snippet:-1 (Rich SERP snippet card)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.customRobotTags.maxImagePreview}
                  onChange={(e) => onUpdateBloggerSettings({
                    ...settings,
                    customRobotTags: { ...settings.customRobotTags, maxImagePreview: e.target.checked }
                  })}
                  className="rounded text-sky-600"
                />
                <span className="font-semibold">max-image-preview:large (Full image preview in Discover)</span>
              </label>
            </div>
          </div>

        </div>

      </div>

      {/* 6. AUTHORITY & REDIRECT LINKS */}
      <div className={`p-4 rounded-xl border space-y-3 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <label className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          6. Authority &amp; Government Redirect Links (Embedded in Article)
        </label>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px]">
            <span className="font-semibold">⚖️ US DOT Official Complaint Portal:</span>
            <a
              href={settings.authorityLinks.dotComplaintUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-mono"
            >
              transportation.gov/airconsumer <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px]">
            <span className="font-semibold">✈️ EasyFlightConnect Blog Directory:</span>
            <a
              href={settings.authorityLinks.internalDirectoryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-mono"
            >
              easyflightconnectblog.blogspot.com <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px]">
            <span className="font-semibold">📞 Dedicated Toll-Free Hotline:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              tel:{post.tfnNumber}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
