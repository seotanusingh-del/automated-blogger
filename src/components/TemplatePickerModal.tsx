import React, { useState } from 'react';
import { X, Search, Check, FileCode, Sparkles, Eye, ArrowRight, Layers } from 'lucide-react';
import { MasterTemplate, DEFAULT_MASTER_TEMPLATES } from '../data/defaultTemplates';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: MasterTemplate | any) => void;
  customTemplates: any[];
  supabaseDrafts: any[];
  isDarkMode: boolean;
  selectedEntityCount: number;
  entityLabel: string;
  onOpenFullManager: () => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  customTemplates,
  supabaseDrafts,
  isDarkMode,
  selectedEntityCount,
  entityLabel,
  onOpenFullManager,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string>(() => DEFAULT_MASTER_TEMPLATES[0].id);

  if (!isOpen) return null;

  // Combine built-in templates + user custom saved templates + supabase drafts
  const allTemplates: (MasterTemplate & { source: 'builtin' | 'custom' | 'supabase' })[] = [
    ...DEFAULT_MASTER_TEMPLATES.map(t => ({ ...t, source: 'builtin' as const })),
    ...customTemplates.map(t => ({
      id: t.id,
      templateName: t.templateName || t.title || 'Custom Saved Template',
      category: (t.category || 'general') as any,
      title: t.title || '',
      keyword: t.keyword || '',
      description: 'Custom saved template from your workspace',
      htmlContent: t.htmlContent || '',
      isBuiltIn: false,
      source: 'custom' as const
    })),
    ...supabaseDrafts.map(t => ({
      id: t.id,
      templateName: t.templateName || t.title || 'n8n / Supabase Blog',
      category: 'general' as any,
      title: t.title || '',
      keyword: t.keyword || '',
      description: 'Imported from n8n workflow / Supabase blog table',
      htmlContent: t.htmlContent || '',
      isBuiltIn: false,
      source: 'supabase' as const
    }))
  ];

  const filtered = allTemplates.filter(t => {
    const matchesSearch = (
      t.templateName.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.keyword.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
    const matchesCat = selectedCategory === 'all' || 
      (selectedCategory === 'custom' && (t.source === 'custom' || t.source === 'supabase')) ||
      t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeTemplate = allTemplates.find(t => t.id === selectedId) || filtered[0] || allTemplates[0];

  const handleApply = () => {
    if (!activeTemplate) return;
    onApplyTemplate(activeTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between gap-3 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Choose Blog Template
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                  {filtered.length} available
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Select a template structure to apply across {selectedEntityCount} selected {entityLabel.toLowerCase()}s.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenFullManager();
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Layers className="w-3.5 h-3.5" />
              Manage All Templates
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className={`px-4 sm:px-5 py-3 border-b flex flex-col sm:flex-row items-center gap-3 justify-between ${
          isDarkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'
        }`}>
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search templates, keywords, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full text-xs rounded-lg pl-9 pr-3 py-2 border outline-none ${
                isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
              }`}
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Templates' },
              { id: 'airlines', label: '✈️ Airlines' },
              { id: 'travel', label: '🌍 Travel' },
              { id: 'hotels', label: '🏨 Hotels' },
              { id: 'agency', label: '💼 Agency' },
              { id: 'custom', label: '⭐ Saved / n8n' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Left Column Template Cards + Right Column Live Preview */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* Left Column: Template Cards List (5 cols) */}
          <div className="md:col-span-5 p-3 sm:p-4 overflow-y-auto space-y-2.5">
            {filtered.map(template => {
              const isSelected = activeTemplate?.id === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedId(template.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition relative ${
                    isSelected
                      ? (isDarkMode ? 'bg-violet-950/40 border-violet-500 text-white shadow-md' : 'bg-violet-50/80 border-violet-500 text-violet-950 shadow-md')
                      : (isDarkMode ? 'bg-slate-950/40 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300')
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          template.source === 'builtin'
                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                            : template.source === 'supabase'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          {template.source === 'builtin' ? 'Master Template' : template.source === 'supabase' ? 'n8n Workflow' : 'Saved Draft'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium capitalize">
                          {template.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs leading-snug truncate">
                        {template.templateName}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {template.description}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <FileCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">No templates match your search.</p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                  className="mt-2 text-xs text-violet-600 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Live Rendered Preview Pane (7 cols) */}
          <div className="md:col-span-7 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/40">
            {activeTemplate ? (
              <div className="flex-1 flex flex-col min-h-0 p-4 sm:p-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Template Preview</span>
                    <h3 className="font-bold text-sm truncate">{activeTemplate.templateName}</h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Tokens: {'{{airline}}, {{city}}, {{tfnNumber}}'}
                  </span>
                </div>

                <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-inner">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ 
                      __html: (activeTemplate.htmlContent || '<p>No preview content.</p>')
                        .replace(/\{\{airline\}\}/gi, 'Delta Air Lines')
                        .replace(/\{\{city\}\}/gi, 'Los Angeles')
                        .replace(/\{\{tfnNumber\}\}/gi, '+1 (888) 794-3464')
                        .replace(/\{\{bannerUrl\}\}/gi, 'https://pollinations.ai/p/airplane%20terminal%20aviation?width=800&height=400&model=flux')
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-slate-400 text-xs">
                Select a template from the list to preview its rendered article layout.
              </div>
            )}
          </div>

        </div>

        {/* Footer with Apply Button */}
        <div className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDarkMode ? 'border-slate-800 bg-slate-950/80' : 'border-slate-200 bg-white'
        }`}>
          <div className="text-xs text-slate-500">
            Selected: <strong className="text-slate-700 dark:text-slate-300">{activeTemplate?.templateName}</strong> &bull; Will apply to {selectedEntityCount} {entityLabel.toLowerCase()}{selectedEntityCount === 1 ? '' : 's'}.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={!activeTemplate}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold transition shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2"
            >
              <span>Use This Template ({selectedEntityCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
