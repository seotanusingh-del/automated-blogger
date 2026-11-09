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
  Layers,
  Image as ImageIcon,
  Type,
  AlignLeft,
  HelpCircle,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  LayoutTemplate
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

interface FormSectionBlock {
  id: string;
  subheading: string;
  paragraph: string;
  bullets?: string[];
}

interface FormFaqBlock {
  id: string;
  question: string;
  answer: string;
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
  const [formIntroPara1, setFormIntroPara1] = useState('Searching for {{keyword}}? This complete passenger directory provides verified customer service guidelines, contact numbers, and office procedures for {{airline}} travelers in {{city}}.');
  const [formIntroPara2, setFormIntroPara2] = useState('Rules for schedule changes, missed departures, refunds, and ticket reissues depend on published booking conditions. Contact reservations promptly before accepting new itineraries.');
  
  // Dynamic Section Blocks (Sub-heading + Paragraph)
  const [formSections, setFormSections] = useState<FormSectionBlock[]>([
    {
      id: 'sec-1',
      subheading: 'What To Confirm Before Making Changes to Your Itinerary',
      paragraph: 'Always confirm fare differences, baggage re-check rules, and connected flight segments with the reservation desk before accepting changes.'
    },
    {
      id: 'sec-2',
      subheading: 'Important Fee Disclosures & Policy Rights',
      paragraph: 'Standard fares and restricted tickets may carry change charges unless an involuntary cancellation or schedule delay exceeds published minimums.'
    }
  ]);

  // Bullet Services Checklist
  const [formServices, setFormServices] = useState<string[]>([
    'Reservation and ticket reissue guidance',
    'Flight delay and missed connection support',
    'Baggage claim tracing and inquiries',
    'Seat upgrades and special assistance requests',
    'Cancellation, refund, and credit checks'
  ]);
  const [newServiceInput, setNewServiceInput] = useState('');

  // FAQs List
  const [formFaqs, setFormFaqs] = useState<FormFaqBlock[]>([
    {
      id: 'faq-1',
      question: 'What is the fastest way to get help with {{keyword}}?',
      answer: 'Have your confirmation code ready and contact the dedicated assistance line at {{tfnNumber}}.'
    },
    {
      id: 'faq-2',
      question: 'Can my {{airline}} ticket be rebooked on the same day?',
      answer: 'Same-day standby and rebooking depend on seat availability and fare class rules.'
    }
  ]);

  const showNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Compile Form Builder State into Clean SEO HTML
  const compileFormToHtml = () => {
    const banner = formBannerUrl.trim() || '{{bannerUrl}}';
    const urgentHtml = formUrgentTitle ? `
    <div style="background: linear-gradient(135deg, #fef3c7, #fffbeb); border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 6px 0; color: #92400e; font-size: 16px;">${formUrgentTitle}</h3>
      <p style="margin: 0; color: #78350f; font-size: 13px;">${formUrgentDesc} Call <strong>{{tfnNumber}}</strong> for immediate assistance.</p>
    </div>` : '';

    const sectionsHtml = formSections.map(s => `
    <div style="margin: 24px 0;">
      <h2 style="color: #0f172a; font-size: 19px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">${s.subheading}</h2>
      <p style="color: #334155; line-height: 1.7; font-size: 14px;">${s.paragraph}</p>
    </div>`).join('\n');

    const servicesHtml = formServices.length > 0 ? `
    <div style="margin: 24px 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px;">
      <h3 style="margin: 0 0 12px 0; color: #0f172a; font-size: 16px;">Key Services &amp; Support Directory</h3>
      <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13.5px; line-height: 1.8;">
        ${formServices.map(srv => `<li>${srv}</li>`).join('\n        ')}
      </ul>
    </div>` : '';

    const faqsHtml = formFaqs.length > 0 ? `
    <div style="margin: 28px 0;">
      <h2 style="color: #0f172a; font-size: 19px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px;">Frequently Asked Questions</h2>
      ${formFaqs.map(f => `
      <div style="margin-bottom: 16px; padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h4 style="margin: 0 0 6px 0; color: #1e293b; font-size: 14.5px;">${f.question}</h4>
        <p style="margin: 0; color: #475569; font-size: 13.5px; line-height: 1.6;">${f.answer}</p>
      </div>`).join('')}
    </div>` : '';

    return `
<article style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 780px; margin: 0 auto; color: #1e293b; line-height: 1.65;">
  <div style="margin-bottom: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <img src="${banner}" alt="{{airline}} Office in {{city}}" style="width: 100%; height: auto; display: block;" />
  </div>

  <header style="margin-bottom: 22px;">
    <h1 style="color: #0f172a; font-size: 25px; line-height: 1.3; font-weight: 800; margin: 0 0 10px 0;">${editorTitle}</h1>
    <div style="font-size: 12px; color: #64748b;">
      <span>Published for {{airline}} Passengers in {{city}}</span> • <span>Toll-Free Helpline: {{tfnNumber}}</span>
    </div>
  </header>

  ${urgentHtml}

  <div style="margin: 20px 0;">
    <p style="color: #334155; font-size: 14.5px; line-height: 1.7; margin-bottom: 14px;">${formIntroPara1}</p>
    <p style="color: #334155; font-size: 14.5px; line-height: 1.7;">${formIntroPara2}</p>
  </div>

  ${sectionsHtml}

  ${servicesHtml}

  ${faqsHtml}

  <footer style="margin-top: 32px; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 10px; text-align: center;">
    <h3 style="margin: 0 0 6px 0; font-size: 17px; color: #38bdf8;">Need Immediate Support?</h3>
    <p style="margin: 0 0 12px 0; font-size: 13px; color: #94a3b8;">Contact our independent passenger concierge desk 24 hours a day.</p>
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: bold; font-size: 14px;">Call {{tfnNumber}}</a>
    <p style="margin: 12px 0 0 0; font-size: 10.5px; color: #64748b;">Independent travel assistance directory. Registered trademarks belong to their respective holders.</p>
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

  const handleAddSection = () => {
    setFormSections(prev => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        subheading: 'New Guide Subheading',
        paragraph: 'Enter the paragraph details here explaining guidelines, rules, or traveler instructions.'
      }
    ]);
  };

  const handleRemoveSection = (id: string) => {
    setFormSections(prev => prev.filter(s => s.id !== id));
  };

  const handleAddFaq = () => {
    setFormFaqs(prev => [
      ...prev,
      {
        id: `faq-${Date.now()}`,
        question: 'Frequently asked traveler question?',
        answer: 'Thorough answer providing clear instructions and toll-free helpline {{tfnNumber}}.'
      }
    ]);
  };

  const handleRemoveFaq = (id: string) => {
    setFormFaqs(prev => prev.filter(f => f.id !== id));
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    setFormServices(prev => [...prev, newServiceInput.trim()]);
    setNewServiceInput('');
  };

  const handleRemoveService = (index: number) => {
    setFormServices(prev => prev.filter((_, i) => i !== index));
  };

  const insertVariable = (variable: string) => {
    if (editorMode === 'code') {
      setEditorHtml(prev => `${prev} ${variable} `);
    } else {
      setEditorTitle(prev => `${prev} ${variable}`);
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border space-y-6 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
    }`}>
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Drafts &amp; Templates Suite</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {allTemplates.length} Master Templates
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create templates using the <strong>Non-Technical Form Builder</strong> or customize HTML code directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'browse' ? (
            <button
              onClick={handleStartCreate}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Template</span>
            </button>
          ) : (
            <button
              onClick={() => setTab('browse')}
              className="px-3 py-2 rounded-xl border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Back to Browse
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: BROWSE TEMPLATES */}
      {tab === 'browse' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              {['all', 'airlines', 'travel', 'hotels', 'agency'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition ${
                    category === cat
                      ? 'bg-violet-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All Templates' : cat}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates by title or topic..."
                className={`w-full text-xs rounded-xl pl-8 pr-3 py-2 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition hover:border-violet-500/50 ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {tpl.category}
                    </span>
                    {tpl.isBuiltIn && (
                      <span className="text-[10px] text-slate-500 font-medium">Built-in Master</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-100">{tpl.templateName}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{tpl.description}</p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(tpl)}
                    className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" /> Preview
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(tpl)}
                      className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                      title="Edit template"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onApplyTemplateToQueue(tpl)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1"
                      title="Apply across selected entities in Review Queue"
                    >
                      <span>Use</span>
                      <ArrowRight className="w-3 h-3" />
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
        <div className="space-y-5">
          
          {/* Mode Switcher: Visual Form vs Raw Code */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Editor Mode:</span>
              <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setEditorMode('form')}
                  className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition ${
                    editorMode === 'form' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>📝 Visual Form Builder (No Code)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editorMode === 'form') {
                      setEditorHtml(compileFormToHtml());
                    }
                    setEditorMode('code');
                  }}
                  className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition ${
                    editorMode === 'code' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>💻 Raw HTML Code</span>
                </button>
              </div>
            </div>

            {/* Token Chips Helper */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[10px] text-slate-500 font-bold">Quick Tokens:</span>
              {['{{airline}}', '{{city}}', '{{keyword}}', '{{tfnNumber}}'].map(tok => (
                <button
                  key={tok}
                  type="button"
                  onClick={() => insertVariable(tok)}
                  className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-mono hover:bg-sky-500/20"
                >
                  + {tok}
                </button>
              ))}
            </div>
          </div>

          {/* Form Meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Template Name</label>
              <input
                type="text"
                value={editorName}
                onChange={e => setEditorName(e.target.value)}
                placeholder="e.g. Flight Delay Rights Guide"
                className={`w-full text-xs rounded-lg p-2 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Category</label>
              <select
                value={editorCategory}
                onChange={e => setEditorCategory(e.target.value as any)}
                className={`w-full text-xs rounded-lg p-2 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              >
                <option value="airlines">Airlines</option>
                <option value="hotels">Hotels &amp; Resorts</option>
                <option value="travel">Travel Destinations</option>
                <option value="agency">Agency Desks</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">SEO Title (with tokens)</label>
              <input
                type="text"
                value={editorTitle}
                onChange={e => setEditorTitle(e.target.value)}
                placeholder="e.g. {{airline}} {{city}} Office: Helpline &amp; Rules"
                className={`w-full text-xs rounded-lg p-2 border outline-none font-medium ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* VISUAL FORM BUILDER FOR NON-TECHNICAL USERS */}
          {editorMode === 'form' ? (
            <div className="space-y-5">
              
              {/* Banner Image URL */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <ImageIcon className="w-4 h-4 text-sky-400" />
                  <span>Banner Image URL (PNG, JPG, WebP)</span>
                </div>
                <input
                  type="text"
                  value={formBannerUrl}
                  onChange={e => setFormBannerUrl(e.target.value)}
                  placeholder="https://... or leave blank to use automatic SVG/DATA bucket banner"
                  className={`w-full text-xs rounded-lg p-2 border outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              {/* Urgent Notice Box */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <span>🚨 Priority Callout Box</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formUrgentTitle}
                    onChange={e => setFormUrgentTitle(e.target.value)}
                    placeholder="Callout Title"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                  <input
                    type="text"
                    value={formUrgentDesc}
                    onChange={e => setFormUrgentDesc(e.target.value)}
                    placeholder="Callout Details"
                    className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Introduction Paragraphs */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <AlignLeft className="w-4 h-4 text-emerald-400" />
                  <span>Introduction Paragraphs</span>
                </div>
                <textarea
                  rows={2}
                  value={formIntroPara1}
                  onChange={e => setFormIntroPara1(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                  placeholder="Intro paragraph 1..."
                />
                <textarea
                  rows={2}
                  value={formIntroPara2}
                  onChange={e => setFormIntroPara2(e.target.value)}
                  className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                  placeholder="Intro paragraph 2..."
                />
              </div>

              {/* Dynamic Sub-Heading & Paragraph Blocks (Unlimited) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-violet-400">
                    <Type className="w-4 h-4" />
                    <span>Content Sections (Subheading + Paragraph Blocks)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Section Block
                  </button>
                </div>

                <div className="space-y-3">
                  {formSections.map((sec, idx) => (
                    <div key={sec.id} className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400">Section {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sec.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={sec.subheading}
                        onChange={e => {
                          const val = e.target.value;
                          setFormSections(prev => prev.map(s => s.id === sec.id ? { ...s, subheading: val } : s));
                        }}
                        placeholder="Sub-heading (H2)"
                        className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                      />
                      <textarea
                        rows={2}
                        value={sec.paragraph}
                        onChange={e => {
                          const val = e.target.value;
                          setFormSections(prev => prev.map(s => s.id === sec.id ? { ...s, paragraph: val } : s));
                        }}
                        placeholder="Paragraph explanation..."
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bullet Services Checklist */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
                <div className="text-xs font-bold text-slate-300">Services &amp; Checklist Items</div>
                <div className="flex flex-wrap gap-1.5">
                  {formServices.map((srv, idx) => (
                    <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <span>{srv}</span>
                      <button type="button" onClick={() => handleRemoveService(idx)} className="text-slate-500 hover:text-rose-400 ml-1">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newServiceInput}
                    onChange={e => setNewServiceInput(e.target.value)}
                    placeholder="Add service bullet item..."
                    className="flex-1 text-xs bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white"
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddService}
                    className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {/* FAQs Section */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <HelpCircle className="w-4 h-4" />
                    <span>Frequently Asked Questions (FAQs)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add FAQ
                  </button>
                </div>

                <div className="space-y-2">
                  {formFaqs.map((faq, idx) => (
                    <div key={faq.id} className="p-3 rounded-lg border border-slate-800 bg-slate-900 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">FAQ {idx + 1}</span>
                        <button type="button" onClick={() => handleRemoveFaq(faq.id)} className="text-slate-500 hover:text-rose-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={e => {
                          const val = e.target.value;
                          setFormFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, question: val } : f));
                        }}
                        placeholder="Question..."
                        className="w-full text-xs font-semibold bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white"
                      />
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={e => {
                          const val = e.target.value;
                          setFormFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, answer: val } : f));
                        }}
                        placeholder="Answer with {{tfnNumber}}..."
                        className="w-full text-xs bg-slate-950 border border-slate-800 rounded p-2 text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* RAW HTML CODE EDITOR FOR ADVANCED USERS */
            <div>
              <label className="block text-xs font-bold mb-1">Raw HTML Content</label>
              <textarea
                rows={16}
                value={editorHtml}
                onChange={e => setEditorHtml(e.target.value)}
                className="w-full text-xs font-mono bg-slate-950 border border-slate-800 rounded-xl p-3 text-sky-300 outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setTab('browse')}
              className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const html = editorMode === 'form' ? compileFormToHtml() : editorHtml;
                  setPreviewTemplate({
                    templateName: editorName,
                    title: editorTitle,
                    htmlContent: html,
                    category: editorCategory
                  });
                }}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" /> Preview Output
              </button>
              <button
                type="button"
                onClick={handleSaveEditor}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow"
              >
                Save Master Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-5 shadow-2xl flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">{previewTemplate.templateName || previewTemplate.title}</h3>
                <span className="text-[11px] text-slate-400">Live rendered preview with sample tokens interpolated</span>
              </div>
              <button onClick={() => setPreviewTemplate(null)} className="text-slate-400 hover:text-white p-1">
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 bg-white text-slate-900 rounded-xl my-3 p-6 shadow-inner">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: (previewTemplate.htmlContent || '')
                    .replace(/\{\{airline\}\}/gi, 'Delta Air Lines')
                    .replace(/\{\{city\}\}/gi, 'New York')
                    .replace(/\{\{keyword\}\}/gi, 'Office Location & Flight Reservations')
                    .replace(/\{\{tfnNumber\}\}/gi, '+1 (888) 794-3464')
                    .replace(/\{\{bannerUrl\}\}/gi, 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80')
                }} 
              />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button onClick={() => setPreviewTemplate(null)} className="px-4 py-1.5 rounded-lg border border-slate-700 text-xs text-white">
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyTemplateToQueue(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Use This Template Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
