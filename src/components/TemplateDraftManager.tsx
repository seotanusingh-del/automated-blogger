import React, { useState } from 'react';
import { 
  FileCode, 
  Plus, 
  Search, 
  Eye, 
  Trash2, 
  Edit3, 
  Check, 
  CheckCircle2,
  Sparkles, 
  ArrowRight,
  Layers,
  Image as ImageIcon,
  Type,
  PhoneCall,
  LayoutTemplate
} from 'lucide-react';
import { DEFAULT_MASTER_TEMPLATES } from '../data/defaultTemplates';
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

interface FormFaqBlock {
  id: string;
  question: string;
  answer: string;
}

type BlockType = 'heading' | 'subheading' | 'paragraph' | 'checklist' | 'faq';

interface GenericBlock {
  id: string;
  type: BlockType;
  title?: string;
  content?: string;
  items?: string[];
  faqs?: FormFaqBlock[];
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

  // Editor Mode: 'form' for non-technical visual form vs 'code' for raw HTML
  const [editorMode, setEditorMode] = useState<'form' | 'code'>('form');

  // Metadata State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorName, setEditorName] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [editorKeyword, setEditorKeyword] = useState('');
  const [editorCategory, setEditorCategory] = useState<'airlines' | 'travel' | 'hotels' | 'agency' | 'general'>('airlines');
  const [editorDescription, setEditorDescription] = useState('');
  const [editorHtml, setEditorHtml] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Non-Technical Form Builder State
  const [formBannerUrl, setFormBannerUrl] = useState('');
  const [formUrgentTitle, setFormUrgentTitle] = useState('24/7 Priority Travel & Dispute Helpline');
  const [formUrgentDesc, setFormUrgentDesc] = useState('Need immediate assistance with rebooking or schedule changes?');

  const [formBlocks, setFormBlocks] = useState<GenericBlock[]>([
    {
      id: 'block-intro',
      type: 'paragraph',
      content: 'Searching for {{keyword}}? This complete passenger directory provides verified customer service guidelines, contact numbers, and office procedures for {{airline}} travelers in {{city}}.\n\nRules for schedule changes, missed departures, refunds, and ticket reissues depend on published booking conditions.'
    },
    {
      id: 'block-guide',
      type: 'subheading',
      title: 'What To Confirm Before Making Changes'
    },
    {
      id: 'block-guide-para',
      type: 'paragraph',
      content: 'Always confirm fare differences, baggage re-check rules, and connected flight segments with the reservation desk before accepting changes.'
    },
    {
      id: 'block-services',
      type: 'checklist',
      title: 'Key Services & Support Directory',
      items: [
        'Reservation and ticket reissue guidance',
        'Flight delay and missed connection support',
        'Baggage claim tracing and inquiries',
        'Cancellation, refund, and credit checks'
      ]
    },
    {
      id: 'block-faqs',
      type: 'faq',
      title: 'Frequently Asked Questions',
      faqs: [
        {
          id: 'faq-1',
          question: 'What is the fastest way to get help with {{keyword}}?',
          answer: 'Have your confirmation code ready and contact the dedicated assistance line at {{tfnNumber}}.'
        }
      ]
    }
  ]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const addBlock = (type: BlockType) => {
    const id = `block-${Date.now()}`;
    const newBlock: GenericBlock = { id, type };
    if (type === 'heading') newBlock.title = 'Main Section Heading';
    if (type === 'subheading') newBlock.title = 'Guide Subheading';
    if (type === 'paragraph') newBlock.content = 'Enter your detailed paragraph text here...';
    if (type === 'checklist') { newBlock.title = 'Key Checklist'; newBlock.items = ['First item', 'Second item']; }
    if (type === 'faq') { newBlock.title = 'Common Questions'; newBlock.faqs = [{ id: `faq-${Date.now()}`, question: 'Your question?', answer: 'Your detailed answer.' }]; }
    setFormBlocks([...formBlocks, newBlock]);
  };

  const removeBlock = (id: string) => setFormBlocks(prev => prev.filter(b => b.id !== id));

  const updateBlock = (id: string, updates: Partial<GenericBlock>) => {
    setFormBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  // Compile Form Builder State into Clean SEO HTML
  const compileFormToHtml = () => {
    const banner = formBannerUrl.trim() || '{{bannerUrl}}';
    const urgentHtml = formUrgentTitle ? `
    <div style="background: linear-gradient(135deg, #fef3c7, #fffbeb); border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 6px 0; color: #92400e; font-size: 16px;">${formUrgentTitle}</h3>
      <p style="margin: 0; color: #78350f; font-size: 13px;">${formUrgentDesc} Call <strong>{{tfnNumber}}</strong> for immediate assistance.</p>
    </div>` : '';

    const blocksHtml = formBlocks.map(block => {
      switch (block.type) {
        case 'heading':
          return `<h2 style="color: #0f172a; font-size: 22px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 32px 0 16px 0;">${block.title}</h2>`;
        case 'subheading':
          return `<h3 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 24px 0 12px 0;">${block.title}</h3>`;
        case 'paragraph':
          return `<p style="color: #334155; line-height: 1.8; font-size: 15px; margin-bottom: 16px;">${block.content?.replace(/\n/g, '<br/>')}</p>`;
        case 'checklist':
          return `
          <div style="margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
            <h4 style="margin: 0 0 12px 0; color: #0f172a; font-size: 16px;">${block.title}</h4>
            <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.8;">
              ${block.items?.map(srv => `<li>${srv}</li>`).join('\n        ')}
            </ul>
          </div>`;
        case 'faq':
          return `
          <div style="margin: 28px 0;">
            <h3 style="color: #0f172a; font-size: 19px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px;">${block.title}</h3>
            ${block.faqs?.map(f => `
            <div style="margin-bottom: 16px; padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 14.5px;">${f.question}</h4>
              <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 1.6;">${f.answer}</p>
            </div>`).join('')}
          </div>`;
        default:
          return '';
      }
    }).join('\n');

    return `
<article style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; color: #1e293b; line-height: 1.7;">
  <div style="margin-bottom: 24px; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
    <img src="${banner}" alt="{{airline}} Office in {{city}}" style="width: 100%; height: auto; display: block;" />
  </div>

  <header style="margin-bottom: 28px;">
    <h1 style="color: #0f172a; font-size: 28px; line-height: 1.2; font-weight: 900; margin: 0 0 12px 0;">${editorTitle}</h1>
    <div style="font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 10px;">
      <span>Published for {{airline}} Passengers in {{city}}</span> • <span style="font-weight: bold; color: #0284c7;">Helpline: {{tfnNumber}}</span>
    </div>
  </header>

  ${urgentHtml}

  ${blocksHtml}

  <footer style="margin-top: 40px; padding: 30px; background: #0f172a; color: #f8fafc; border-radius: 16px; text-align: center;">
    <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #38bdf8; font-weight: 800;">Need Immediate SEO Traveler Support?</h3>
    <p style="margin: 0 0 18px 0; font-size: 14px; color: #94a3b8;">Contact our independent passenger concierge desk available 24 hours a day for ${editorTitle}.</p>
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 12px 32px; border-radius: 30px; text-decoration: none; font-weight: 800; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">Call {{tfnNumber}} Now</a>
    <p style="margin: 18px 0 0 0; font-size: 10.5px; color: #64748b; opacity: 0.8;">Independent travel assistance directory. Registered trademarks and brand logos belong to their respective copyright holders. This page is for passenger informational support only.</p>
  </footer>
</article>`.trim();
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
    setEditorMode('form');
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
    setEditorMode('code');
    setTab('editor');
  };

  const handleSaveEditor = () => {
    if (!editorName.trim()) {
      alert('Please enter a template name.');
      return;
    }

    const finalHtml = editorMode === 'form' ? compileFormToHtml() : editorHtml;

    const tpl = {
      id: editingId || `custom-template-${Date.now()}`,
      templateName: editorName.trim(),
      title: editorTitle.trim(),
      keyword: editorKeyword.trim(),
      category: editorCategory,
      description: editorDescription.trim(),
      htmlContent: finalHtml,
      status: 'Draft' as const,
      isBuiltIn: false
    };

    onSaveTemplate(tpl);
    showNotify(`Template "${tpl.templateName}" saved successfully!`);
    setTab('browse');
  };

  const insertVariable = (variable: string) => {
    if (editorMode === 'code') {
      setEditorHtml(prev => `${prev} ${variable} `);
    } else {
      setEditorTitle(prev => `${prev} ${variable}`);
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border space-y-6 transition-colors ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Top Header */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${
        isDarkMode ? 'border-slate-800' : 'border-slate-100'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Drafts &amp; Templates Suite</h2>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              isDarkMode ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-violet-50 text-violet-600 border-violet-200'
            }`}>
              {allTemplates.length} Master Templates
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Create templates using the <strong>Non-Technical Form Builder</strong> or customize HTML code directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'browse' ? (
            <button
              onClick={handleStartCreate}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-violet-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          ) : (
            <button
              onClick={() => setTab('browse')}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Back to Browse
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in slide-in-from-top-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: BROWSE TEMPLATES */}
      {tab === 'browse' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs font-bold transition-colors ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              {['all', 'airlines', 'travel', 'hotels', 'agency'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    category === cat
                      ? 'bg-violet-600 text-white shadow-sm'
                      : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200')
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates..."
                className={`w-full text-xs rounded-xl pl-8 pr-3 py-2 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all group hover:shadow-lg ${
                  isDarkMode ? 'bg-slate-950/40 border-slate-800 hover:border-violet-500/50' : 'bg-white border-slate-100 hover:border-violet-300 shadow-sm'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      isDarkMode ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' : 'bg-violet-50 text-violet-600 border-violet-100'
                    }`}>
                      {tpl.category}
                    </span>
                    {tpl.isBuiltIn && (
                      <span className="text-[9px] text-slate-400 font-bold uppercase">System</span>
                    )}
                  </div>
                  <h3 className={`font-bold text-sm leading-snug ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{tpl.templateName}</h3>
                  <p className={`text-xs line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{tpl.description}</p>
                </div>

                <div className={`pt-4 mt-4 border-t flex items-center justify-between gap-2 ${isDarkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className="text-xs font-bold text-sky-500 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(tpl)}
                      className={`p-2 rounded-lg border transition ${
                        isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title="Edit template"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyTemplateToQueue(tpl)}
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95"
                      title="Use template"
                    >
                      <span>Use</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2 & 3: FORM BUILDER & CODE EDITOR */}
      {(tab === 'create' || tab === 'editor') && (
        <div className="space-y-5 animate-in fade-in duration-300">
          
          {/* Mode Switcher */}
          <div className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold opacity-60 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Editor Mode:</span>
              <div className={`flex items-center p-0.5 rounded-xl border text-xs font-bold ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'}`}>
                <button
                  type="button"
                  onClick={() => setEditorMode('form')}
                  className={`px-4 py-2 rounded-lg transition ${
                    editorMode === 'form' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Visual Form
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorMode === 'form') setEditorHtml(compileFormToHtml());
                    setEditorMode('code');
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    editorMode === 'code' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  HTML Code
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
              <span className="text-[10px] font-black uppercase opacity-40">Variables:</span>
              {['{{airline}}', '{{city}}', '{{keyword}}', '{{tfnNumber}}'].map(tok => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => insertVariable(tok)}
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                    isDarkMode ? 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20' : 'bg-white border-slate-200 text-sky-600 hover:border-sky-300'
                  }`}
                >
                  {tok}
                </button>
              ))}
            </div>
          </div>

          {/* Form Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider opacity-60">Template Name</label>
              <input
                type="text"
                value={editorName}
                onChange={e => setEditorName(e.target.value)}
                placeholder="e.g. Flight Delay Guide"
                className={`w-full text-xs font-bold rounded-xl p-2.5 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-violet-500' : 'bg-white border-slate-200 focus:bg-white shadow-sm focus:border-violet-500'
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider opacity-60">Category</label>
              <select
                value={editorCategory}
                onChange={e => setEditorCategory(e.target.value as any)}
                className={`w-full text-xs font-bold rounded-xl p-2.5 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-violet-500' : 'bg-white border-slate-200 focus:bg-white shadow-sm focus:border-violet-500'
                }`}
              >
                <option value="airlines">Airlines</option>
                <option value="hotels">Hotels</option>
                <option value="travel">Travel</option>
                <option value="agency">Agency</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider opacity-60">SEO Title</label>
              <input
                type="text"
                value={editorTitle}
                onChange={e => setEditorTitle(e.target.value)}
                placeholder="e.g. {{airline}} Office in {{city}}"
                className={`w-full text-xs font-bold rounded-xl p-2.5 border outline-none transition ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-violet-500' : 'bg-white border-slate-200 focus:bg-white shadow-sm focus:border-violet-500'
                }`}
              />
            </div>
          </div>

          {/* VISUAL FORM BUILDER */}
          {editorMode === 'form' ? (
            <div className="space-y-6">
              
              {/* Banner & Helpline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border space-y-2.5 transition-colors ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-white shadow-sm'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                    <ImageIcon className="w-4 h-4 text-sky-400" />
                    <span>Template Banner Image URL</span>
                  </div>
                  <input
                    type="text"
                    value={formBannerUrl}
                    onChange={e => setFormBannerUrl(e.target.value)}
                    placeholder="https://... (or leave blank for dynamic banner)"
                    className={`w-full text-[11px] rounded-lg p-2.5 border outline-none transition font-mono ${
                      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 focus:bg-white'
                    }`}
                  />
                </div>
                <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-white shadow-sm'}`}>
                  <div className="text-xs font-bold text-amber-500 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4" />
                    <span>Emergency Helpline Callout</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formUrgentTitle}
                      onChange={e => setFormUrgentTitle(e.target.value)}
                      placeholder="Title"
                      className={`w-full text-xs font-bold border rounded-lg p-2 outline-none transition ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                    />
                    <input
                      type="text"
                      value={formUrgentDesc}
                      onChange={e => setFormUrgentDesc(e.target.value)}
                      placeholder="Description"
                      className={`w-full text-xs border rounded-lg p-2 outline-none transition ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Content Blocks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest opacity-50">Article Structure Blocks</h3>
                  <div className="flex items-center gap-2">
                    {(['heading', 'subheading', 'paragraph', 'checklist', 'faq'] as const).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addBlock(type)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all hover:scale-105 active:scale-95 ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        + {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {formBlocks.map((block, idx) => (
                    <div 
                      key={block.id} 
                      className={`p-5 rounded-2xl border transition-all relative group ${
                        isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                      }`}
                    >
                      {/* Block Controls */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => removeBlock(block.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2 rounded-lg border ${
                          isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <span className="text-[10px] font-black uppercase">{idx + 1}</span>
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-violet-500 tracking-tighter bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">{block.type}</span>
                          </div>

                          {(block.type === 'heading' || block.type === 'subheading' || block.type === 'checklist' || block.type === 'faq') && (
                            <input
                              type="text"
                              value={block.title || ''}
                              onChange={e => updateBlock(block.id, { title: e.target.value })}
                              placeholder={`${block.type.charAt(0).toUpperCase() + block.type.slice(1)} title...`}
                              className={`w-full text-sm font-bold border-b bg-transparent outline-none pb-1 transition ${
                                isDarkMode ? 'border-slate-800 focus:border-violet-500 text-white' : 'border-slate-100 focus:border-violet-500 text-slate-900'
                              }`}
                            />
                          )}

                          {block.type === 'paragraph' && (
                            <textarea
                              rows={3}
                              value={block.content || ''}
                              onChange={e => updateBlock(block.id, { content: e.target.value })}
                              placeholder="Enter your detailed SEO content here..."
                              className={`w-full text-xs p-3 rounded-xl border outline-none transition leading-relaxed ${
                                isDarkMode ? 'bg-slate-950 border-slate-800 text-slate-300 focus:border-violet-500' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-violet-500'
                              }`}
                            />
                          )}

                          {block.type === 'checklist' && (
                            <div className="space-y-2">
                              {block.items?.map((item, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={e => {
                                      const newItems = [...(block.items || [])];
                                      newItems[sIdx] = e.target.value;
                                      updateBlock(block.id, { items: newItems });
                                    }}
                                    className={`flex-1 text-xs p-2 rounded-lg border bg-transparent outline-none ${
                                      isDarkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-700'
                                    }`}
                                  />
                                  <button 
                                    onClick={() => updateBlock(block.id, { items: block.items?.filter((_, i) => i !== sIdx) })}
                                    className="text-slate-400 hover:text-rose-500"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => updateBlock(block.id, { items: [...(block.items || []), ''] })}
                                className="text-[10px] font-bold text-sky-500 hover:underline"
                              >
                                + Add Item
                              </button>
                            </div>
                          )}

                          {block.type === 'faq' && (
                            <div className="space-y-3">
                              {block.faqs?.map((faq, fIdx) => (
                                <div key={faq.id} className={`p-3 rounded-xl border space-y-2 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold opacity-30">Q&A {fIdx + 1}</span>
                                    <button onClick={() => updateBlock(block.id, { faqs: block.faqs?.filter(f => f.id !== faq.id) })} className="text-slate-400 hover:text-rose-500"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                                  <input
                                    type="text"
                                    value={faq.question}
                                    onChange={e => {
                                      const newFaqs = [...(block.faqs || [])];
                                      newFaqs[fIdx] = { ...faq, question: e.target.value };
                                      updateBlock(block.id, { faqs: newFaqs });
                                    }}
                                    placeholder="Question"
                                    className="w-full text-xs font-bold bg-transparent outline-none"
                                  />
                                  <textarea
                                    rows={2}
                                    value={faq.answer}
                                    onChange={e => {
                                      const newFaqs = [...(block.faqs || [])];
                                      newFaqs[fIdx] = { ...faq, answer: e.target.value };
                                      updateBlock(block.id, { faqs: newFaqs });
                                    }}
                                    placeholder="Answer"
                                    className="w-full text-xs bg-transparent outline-none resize-none border-t border-slate-800/10 pt-2 mt-1"
                                  />
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => updateBlock(block.id, { faqs: [...(block.faqs || []), { id: `faq-${Date.now()}`, question: '', answer: '' }] })}
                                className="text-[10px] font-bold text-sky-500 hover:underline"
                              >
                                + Add FAQ
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
              <label className="block text-[11px] font-black uppercase tracking-wider opacity-60 mb-2">Advanced HTML Structure</label>
              <textarea
                rows={18}
                value={editorHtml}
                onChange={e => setEditorHtml(e.target.value)}
                className={`w-full text-[11px] font-mono border rounded-2xl p-5 outline-none focus:border-violet-500 transition-all ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-sky-400' : 'bg-slate-50 border-slate-200 text-sky-900 shadow-inner'
                }`}
              />
            </div>
          )}

          {/* Editor Footer */}
          <div className={`flex items-center justify-between pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={() => setTab('browse')}
              className={`px-6 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
              }`}
            >
              Cancel &amp; Discard
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const html = editorMode === 'form' ? compileFormToHtml() : editorHtml;
                  setPreviewTemplate({ templateName: editorName, title: editorTitle, htmlContent: html, category: editorCategory });
                }}
                className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black uppercase tracking-widest transition shadow-xl shadow-violet-600/30 active:scale-95"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-8 animate-in fade-in duration-300">
          <div className={`border rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl flex flex-col max-h-[90vh] transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-start justify-between pb-5 border-b border-slate-800/50">
              <div>
                <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{previewTemplate.templateName || 'Preview'}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Global Master Template Live View</p>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="p-2 rounded-full hover:bg-slate-800 transition-colors text-slate-400">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <div className={`flex-1 overflow-y-auto my-6 rounded-2xl p-1 sm:p-6 transition-colors border shadow-inner ${
              isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="bg-white rounded-xl p-8 shadow-2xl max-w-[800px] mx-auto text-slate-900 border border-slate-200">
                <div dangerouslySetInnerHTML={{ 
                  __html: (previewTemplate.htmlContent || '')
                    .replace(/\{\{airline\}\}/gi, 'Delta Air Lines')
                    .replace(/\{\{city\}\}/gi, 'New York')
                    .replace(/\{\{keyword\}\}/gi, 'Passenger Support Office')
                    .replace(/\{\{tfnNumber\}\}/gi, '+1 (888) 794-3464')
                    .replace(/\{\{bannerUrl\}\}/gi, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80')
                }} />
              </div>
            </div>

            <div className={`flex items-center justify-between pt-5 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <button onClick={() => setPreviewTemplate(null)} className={`px-6 py-2.5 rounded-xl border text-xs font-bold transition ${isDarkMode ? 'border-slate-700 text-white hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                Back to Edit
              </button>
              <button
                type="button"
                onClick={() => { onApplyTemplateToQueue(previewTemplate); setPreviewTemplate(null); }}
                className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/30 active:scale-95"
              >
                Use this Template Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
