import React, { useState } from 'react';
import { 
  FileCode, 
  Plus, 
  Search, 
  Eye, 
  Copy, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  Code2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Layers
} from 'lucide-react';
import { MasterTemplate, DEFAULT_MASTER_TEMPLATES } from '../data/defaultTemplates';
import { GeneratedPost } from '../types/airline';

interface TemplateDraftManagerProps {
  savedTemplates: any[];
  onSaveTemplate: (template: any) => void;
  onDeleteTemplate: (id: string) => void;
  generatedPosts: GeneratedPost[];
  onApplyTemplateToQueue: (template: any) => void;
  supabaseDrafts: any[];
  onRefreshSupabaseDrafts: () => void;
  isLoadingSupabase: boolean;
  isDarkMode: boolean;
  selectedEntityCount: number;
  entityLabel: string;
}

export const TemplateDraftManager: React.FC<TemplateDraftManagerProps> = ({
  savedTemplates,
  onSaveTemplate,
  onDeleteTemplate,
  generatedPosts,
  onApplyTemplateToQueue,
  supabaseDrafts,
  onRefreshSupabaseDrafts,
  isDarkMode,
  isLoadingSupabase,
  selectedEntityCount,
  entityLabel
}) => {
  const [tab, setTab] = useState<'browse' | 'create' | 'editor'>('browse');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  // Editor State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorName, setEditorName] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [editorKeyword, setEditorKeyword] = useState('');
  const [editorCategory, setEditorCategory] = useState<'airlines' | 'travel' | 'hotels' | 'agency' | 'general'>('airlines');
  const [editorDescription, setEditorDescription] = useState('');
  const [editorHtml, setEditorHtml] = useState('');
  const [editorView, setEditorView] = useState<'code' | 'preview'>('code');
  const [notification, setNotification] = useState<string | null>(null);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Combine built-in + custom templates
  const allTemplates = [
    ...DEFAULT_MASTER_TEMPLATES.map(t => ({ ...t, isBuiltIn: true })),
    ...savedTemplates.map(t => ({
      ...t,
      isBuiltIn: false,
      category: t.category || 'airlines',
      description: t.description || 'Custom user-saved template'
    }))
  ];

  const filteredTemplates = allTemplates.filter(t => {
    const matchesSearch = (
      t.templateName.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.keyword && t.keyword.toLowerCase().includes(search.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    );
    const matchesCat = category === 'all' || t.category === category;
    return matchesSearch && matchesCat;
  });

  const handleStartCreate = () => {
    setEditingId(null);
    setEditorName('New SEO Directory Template');
    setEditorTitle('{{airline}} {{city}} Office: Official Helpline & Passenger Support');
    setEditorKeyword('{{airline}} Office in {{city}}, Ticket Support');
    setEditorCategory('airlines');
    setEditorDescription('Clean, structured guide with FAQ sections and contact details.');
    setEditorHtml(DEFAULT_MASTER_TEMPLATES[0].htmlContent);
    setTab('create');
  };

  const handleStartEdit = (tpl: any) => {
    setEditingId(tpl.id);
    setEditorName(tpl.templateName || tpl.title);
    setEditorTitle(tpl.title || '');
    setEditorKeyword(tpl.keyword || '');
    setEditorCategory(tpl.category || 'airlines');
    setEditorDescription(tpl.description || '');
    setEditorHtml(tpl.htmlContent || '');
    setTab('editor');
  };

  const handleSaveEditor = () => {
    if (!editorName.trim()) {
      alert('Please enter a template name.');
      return;
    }

    const tpl = {
      id: editingId || `custom-template-${Date.now()}`,
      templateName: editorName.trim(),
      title: editorTitle.trim(),
      keyword: editorKeyword.trim(),
      category: editorCategory,
      description: editorDescription.trim(),
      htmlContent: editorHtml,
      status: 'Draft' as const,
      isBuiltIn: false
    };

    onSaveTemplate(tpl);
    showNotify(`Template "${tpl.templateName}" saved successfully!`);
    setTab('browse');
  };

  const insertVariable = (variable: string) => {
    setEditorHtml(prev => `${prev} ${variable} `);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto rounded-2xl border p-4 sm:p-6 shadow-sm space-y-6 transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>

      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black tracking-tight">Step 4: Drafts &amp; Templates Manager</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Build, edit, and organize reusable article frameworks. Select any template to apply across your {selectedEntityCount} {entityLabel.toLowerCase()}s in Step 2.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('browse')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              tab === 'browse'
                ? 'bg-violet-600 text-white shadow'
                : 'border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Browse ({allTemplates.length})
          </button>
          <button
            onClick={handleStartCreate}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              tab === 'create'
                ? 'bg-violet-600 text-white shadow'
                : 'bg-violet-500/10 border border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/20'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            New Template
          </button>
          <button
            onClick={onRefreshSupabaseDrafts}
            disabled={isLoadingSupabase}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Refresh drafts from n8n & Supabase blogs table"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingSupabase ? 'animate-spin text-sky-500' : ''}`} />
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: BROWSE TEMPLATES */}
      {tab === 'browse' && (
        <div className="space-y-6">
          
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search templates, topics, or keywords..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full text-xs rounded-xl pl-9 pr-3 py-2.5 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'airlines', label: '✈️ Airlines' },
                { id: 'travel', label: '🌍 Travel' },
                { id: 'hotels', label: '🏨 Hotels' },
                { id: 'agency', label: '💼 Agency' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    category === cat.id
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                className={`flex flex-col justify-between p-4 rounded-2xl border transition-all hover:shadow-md ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      tpl.isBuiltIn
                        ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {tpl.isBuiltIn ? 'Built-in Master' : 'Custom Saved'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold capitalize">
                      {tpl.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm leading-snug line-clamp-1">{tpl.templateName}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tpl.description}</p>

                  <div className="mt-3 p-2 rounded-lg bg-slate-200/50 dark:bg-slate-900 text-[11px] font-mono text-slate-600 dark:text-slate-400 truncate">
                    Title: {tpl.title}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewTemplate(tpl)}
                      className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                      title="Preview rendered template"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {!tpl.isBuiltIn && (
                      <>
                        <button
                          onClick={() => handleStartEdit(tpl)}
                          className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                          title="Edit template"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete template "${tpl.templateName}"?`)) {
                              onDeleteTemplate(tpl.id);
                              showNotify('Template deleted.');
                            }
                          }}
                          className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-900/50 hover:bg-rose-500/10 text-rose-500 transition"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      onApplyTemplateToQueue(tpl);
                      showNotify(`Applied "${tpl.templateName}" to ${selectedEntityCount} ${entityLabel.toLowerCase()}s.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Supabase & n8n Live Generated Blogs Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-black flex items-center gap-2">
                  <span>n8n Workflow Output &amp; Supabase Blog Table</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {supabaseDrafts.length} synchronized
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Articles created by external n8n workflows and stored in your PostgreSQL <code>blogs</code> table.
                </p>
              </div>

              <button
                onClick={onRefreshSupabaseDrafts}
                disabled={isLoadingSupabase}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSupabase ? 'animate-spin' : ''}`} />
                <span>{isLoadingSupabase ? 'Checking...' : 'Check n8n Output'}</span>
              </button>
            </div>

            {supabaseDrafts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supabaseDrafts.map(draft => (
                  <div
                    key={draft.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                      isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs truncate">{draft.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{draft.keyword || 'No keyword'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewTemplate(draft)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => {
                          onApplyTemplateToQueue(draft);
                          showNotify(`Loaded n8n article into queue!`);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm"
                      >
                        Load to Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-xs text-slate-500">
                No external articles generated by n8n found in the <code>blogs</code> table yet. Click the <strong>Workflow</strong> button on Step 2 to generate via n8n!
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2 & 3: CREATE / EDIT TEMPLATE */}
      {(tab === 'create' || tab === 'editor') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-sm">
              {tab === 'create' ? 'Create New Article Template' : `Edit Template: ${editorName}`}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditorView(editorView === 'code' ? 'preview' : 'code')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{editorView === 'code' ? 'Switch to Live Preview' : 'Switch to HTML Code'}</span>
              </button>
              <button
                onClick={() => setTab('browse')}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditor}
                className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-sm"
              >
                Save Template
              </button>
            </div>
          </div>

          {/* Form Meta Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Template Name</label>
              <input
                type="text"
                value={editorName}
                onChange={(e) => setEditorName(e.target.value)}
                placeholder="e.g., Executive Travel Concierge Guide"
                className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Category</label>
              <select
                value={editorCategory}
                onChange={(e) => setEditorCategory(e.target.value as any)}
                className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                <option value="airlines">Airlines</option>
                <option value="travel">Travel</option>
                <option value="hotels">Hotels</option>
                <option value="agency">Agency</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Target Keyword / Topic</label>
              <input
                type="text"
                value={editorKeyword}
                onChange={(e) => setEditorKeyword(e.target.value)}
                placeholder="e.g., {{airline}} ticket rebooking {{city}}"
                className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Title Pattern (Tokens Allowed)</label>
            <input
              type="text"
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              placeholder="e.g., {{airline}} {{city}} Office: Official Passenger Support & Booking Desk"
              className={`w-full text-xs rounded-xl p-2.5 border outline-none font-medium ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Variable Injection Chips */}
          <div className="flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Insert Dynamic Tag:</span>
            {['{{airline}}', '{{city}}', '{{country}}', '{{tfnNumber}}', '{{companyName}}', '{{bannerUrl}}'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => insertVariable(tag)}
                className="px-2 py-0.5 rounded bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-mono text-[11px] transition"
              >
                + {tag}
              </button>
            ))}
          </div>

          {/* HTML Editor or Live Preview */}
          {editorView === 'code' ? (
            <textarea
              value={editorHtml}
              onChange={(e) => setEditorHtml(e.target.value)}
              rows={16}
              className={`w-full text-xs font-mono p-4 rounded-xl border outline-none resize-y leading-relaxed ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
              placeholder="Enter full article HTML..."
            />
          ) : (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 max-h-[500px] overflow-y-auto">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: editorHtml
                    .replace(/\{\{airline\}\}/gi, 'Sample Airline')
                    .replace(/\{\{city\}\}/gi, 'New York')
                    .replace(/\{\{tfnNumber\}\}/gi, '+1 (888) 794-3464')
                    .replace(/\{\{bannerUrl\}\}/gi, 'https://pollinations.ai/p/airplane%20terminal%20sample?width=800&height=400&model=flux')
                }}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setTab('browse')}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEditor}
              className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow"
            >
              Save Template
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal for Browsing */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="p-4 border-b flex items-center justify-between border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm truncate">{previewTemplate.templateName || previewTemplate.title}</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950">
              <div
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: (previewTemplate.htmlContent || previewTemplate.content_html || '<p>No content</p>')
                    .replace(/\{\{airline\}\}/gi, 'Delta Air Lines')
                    .replace(/\{\{city\}\}/gi, 'Chicago')
                    .replace(/\{\{tfnNumber\}\}/gi, '+1 (888) 794-3464')
                    .replace(/\{\{bannerUrl\}\}/gi, 'https://pollinations.ai/p/airplane%20aviation%20travel?width=800&height=400&model=flux')
                }}
              />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  onApplyTemplateToQueue(previewTemplate);
                  setPreviewTemplate(null);
                  showNotify(`Applied "${previewTemplate.templateName || previewTemplate.title}" to review queue!`);
                }}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
