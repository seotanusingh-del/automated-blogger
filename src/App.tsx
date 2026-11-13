import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  Settings, 
  RefreshCw, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Upload, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Share2,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Mail,
  Linkedin,
  Instagram,
  Lock,
  LogOut,
  Globe,
  LifeBuoy,
  MessageCircle,
  Link as LinkIcon,
  Tag,
  MapPin,
  FileCode,
  CheckSquare,
  Square,
  Sliders,
  Bot,
  ListFilter,
  Eye,
  Layers,
  Key,
  Download,
  Zap
} from 'lucide-react';
import { 
  TARGET_BLOGGER_ID, 
  TARGET_BLOG_URL,
  downloadBannerImage
} from './services/drive';
import { DEFAULT_AIRLINES } from './data/defaultAirlines';
import { DEFAULT_ENTITIES_BY_TYPE, getDefaultEntities } from './data/defaultEntities';
import { AirlineItem, AirlineOffice, GeneratedPost, SocialLinks, PostSections, CustomLinkItem, BloggerSubSettings } from './types/airline';
import { 
  generateOfficeBlogPost, 
  generateOfficeBannerSvg,
  buildHtmlFromSections,
  cleanAndFormatBloggerHtml
} from './services/blogGenerator';
import { getCoordinatesForCity } from './data/cityCoordinates';
import { AirlineManagerModal } from './components/AirlineManagerModal';
import { LoginPage } from './components/LoginPage';
import { InactivityLockModal } from './components/InactivityLockModal';
import { ReviewQueueManager } from './components/ReviewQueueManager';
import { BloggerSubSettingsTab } from './components/BloggerSubSettingsTab';
import { RefreshTokenModal } from './components/RefreshTokenModal';
import { PublicLandingPage } from './components/PublicLandingPage';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { TemplateDraftManager } from './components/TemplateDraftManager';
import { AiProviderModal } from './components/AiProviderModal';
import { PublishingSecurityModal } from './components/PublishingSecurityModal';
import { N8nWorkflowModal } from './components/N8nWorkflowModal';
import { LogsHistoryManager, ActivityLogItem } from './components/LogsHistoryManager';
import { DEFAULT_MASTER_TEMPLATES } from './data/defaultTemplates';
import { 
  generateDeepSeekContent, 
  BlogPostContent, 
  getDeepSeekApiKey, 
  setDeepSeekApiKey,
  getAiProvider,
  setAiProvider,
  getGeminiApiKey,
  setGeminiApiKey,
  AiProvider
} from './services/deepseek';

type SavedTemplate = GeneratedPost & { templateName?: string };
type BlogType = 'airlines' | 'travel' | 'hotels' | 'agency';
const N8N_BLOG_WEBHOOK = 'https://automated-blogger.app.n8n.cloud/webhook/seo-blog-generator';
import {
  getRecentPosts,
  getBlogTableDrafts,
  createPendingBlogRequest,
  getBlogsForRequest,
  StoredBlogDraft,
  listPublicBucketImages,
  savePostToSupabase,
  uploadImageToPublicBucket
} from './services/supabase';

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export default function App() {
  // Authentication & Session Security (Autolocks on page refresh or tab close)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSessionLocked, setIsSessionLocked] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [showPublicPage, setShowPublicPage] = useState<boolean>(false);
  const [returnOtpRequired, setReturnOtpRequired] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  // Theme state - Eye-friendly LIGHT THEME by default
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('easyflight_theme') === 'dark';
  });

  // Backend Connection State
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [publishSecret, setPublishSecret] = useState<string>(() => localStorage.getItem('easyflight_publish_secret') || '');
  const [deepSeekKey, setDeepSeekKey] = useState<string>(() => getDeepSeekApiKey());
  const [aiProvider, setProvider] = useState<AiProvider>(() => getAiProvider());
  const [geminiKey, setGeminiKey] = useState<string>(() => getGeminiApiKey());
  const [customRefreshToken, setCustomRefreshToken] = useState<string>(() => localStorage.getItem('easyflight_google_refresh_token') || '');
  const [showRefreshTokenModal, setShowRefreshTokenModal] = useState<boolean>(false);
  
  // Active Navigation & Settings Modals
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showPublishingSecurityModal, setShowPublishingSecurityModal] = useState<boolean>(false);
  const [showN8nWorkflowModal, setShowN8nWorkflowModal] = useState<boolean>(false);

  // n8n Webhook, MCP Server & Supabase Custom Settings
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState<string>(() => localStorage.getItem('easyflight_n8n_webhook') || N8N_BLOG_WEBHOOK);
  const [n8nMcpUrl, setN8nMcpUrl] = useState<string>(() => localStorage.getItem('easyflight_n8n_mcp') || 'https://automated-blogger.app.n8n.cloud/mcp-server/http');
  const [n8nApiKey, setN8nApiKey] = useState<string>(() => localStorage.getItem('easyflight_n8n_apikey') || '');
  const [supabaseCustomKey, setSupabaseCustomKey] = useState<string>(() => localStorage.getItem('easyflight_supabase_service_key') || '');

  // Step 1 Campaign Banner State
  const [campaignBannerUrl, setCampaignBannerUrl] = useState<string>('');
  const [reviewBannerUrl, setReviewBannerUrl] = useState<string>('');
  const [applyBannerScope, setApplyBannerScope] = useState<'single' | 'all'>('single');

  // Activity Logs for Step 5
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('easyflight_activity_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'log-init',
        timestamp: new Date().toLocaleTimeString(),
        type: 'system',
        level: 'info',
        title: 'Studio Initialized',
        details: 'Ready to generate, review, and publish blogs across selected entities.'
      }
    ];
  });

  const addLog = (
    type: ActivityLogItem['type'],
    level: ActivityLogItem['level'],
    title: string,
    details?: string,
    url?: string
  ) => {
    const item: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      level,
      title,
      details,
      url
    };
    setActivityLogs(prev => {
      const updated = [item, ...prev].slice(0, 200);
      try { localStorage.setItem('easyflight_activity_logs', JSON.stringify(updated)); } catch {}
      return updated;
    });
  };


  // Target Blogger ID
  const [blogId, setBlogId] = useState<string>(() => {
    const saved = localStorage.getItem('easyflight_session_draft');
    if (saved) {
      try { return JSON.parse(saved).blogId || TARGET_BLOGGER_ID; } catch (e) { /* ignore */ }
    }
    return TARGET_BLOGGER_ID;
  });

  // Common TFN Number (Default: +1 (888) 794-3464)
  const [commonTfn, setCommonTfn] = useState<string>(() => {
    const saved = localStorage.getItem('easyflight_session_draft');
    if (saved) {
      try { return JSON.parse(saved).commonTfn || '+1 (888) 794-3464'; } catch (e) { /* ignore */ }
    }
    return '+1 (888) 794-3464';
  });

  // Keyword / Topic
  const [targetKeyword, setTargetKeyword] = useState<string>(() => {
    const saved = localStorage.getItem('easyflight_session_draft');
    if (saved) {
      try { return JSON.parse(saved).targetKeyword || 'Office Location, Contact Number & Flight Reservations'; } catch (e) { /* ignore */ }
    }
    return 'Office Location, Contact Number & Flight Reservations';
  });
  const [companyName, setCompanyName] = useState<string>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_session_draft') || '{}').companyName || 'Easy Flight Connect'; } catch { return 'Easy Flight Connect'; }
  });
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_session_draft') || '{}').companyLogoUrl || ''; } catch { return ''; }
  });
  const [contactEmail, setContactEmail] = useState<string>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_session_draft') || '{}').contactEmail || ''; } catch { return ''; }
  });
  const [activeSection, setActiveSection] = useState<'setup' | 'airlines' | 'drafts' | 'review' | 'history'>('setup');
  const [blogType, setBlogType] = useState<BlogType>(() => (localStorage.getItem('easyflight_blog_type') as BlogType) || 'airlines');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | GeneratedPost['status']>('all');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);

  const [isWebGroundingEnabled, setIsWebGroundingEnabled] = useState(true);

  // Social & Custom Portal Links
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
    const saved = localStorage.getItem('easyflight_session_draft');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved).socialLinks || {}; 
        if (!parsed.website) parsed.website = 'https://easyflightconnect.com';
        return parsed;
      } catch (e) { /* ignore */ }
    }
    return {
      website: 'https://easyflightconnect.com',
      supportUrl: 'https://easyflightconnect.com/support',
      whatsapp: '',
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      customLinks: []
    };
  });

  // Temporary custom link input for modal
  const [customLinkLabel, setCustomLinkLabel] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');

  // Persistent Airlines
  const [airlines, setAirlines] = useState<AirlineItem[]>(() => {
    const savedBlogType = localStorage.getItem('easyflight_blog_type') || 'airlines';
    const saved = localStorage.getItem(`easyflight_entities_${savedBlogType}`) || (savedBlogType === 'airlines' ? localStorage.getItem('easyflight_airlines') : null);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return savedBlogType === 'airlines' ? DEFAULT_AIRLINES : [];
  });

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [airlineFilter, setAirlineFilter] = useState('');
  const [customImages, setCustomImages] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_custom_images') || '[]'); } catch { return []; }
  });
  const [imageLibrary, setImageLibrary] = useState<string[]>([]);
  const [isLoadingImageLibrary, setIsLoadingImageLibrary] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_saved_templates') || '[]'); } catch { return []; }
  });
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [templateTitleInput, setTemplateTitleInput] = useState('');
  const [templateKeywordInput, setTemplateKeywordInput] = useState('');
  const [templateHtmlInput, setTemplateHtmlInput] = useState('');
  const [draftNameInput, setDraftNameInput] = useState('');
  const [supabaseDrafts, setSupabaseDrafts] = useState<SavedTemplate[]>([]);
  const [isLoadingSupabaseDrafts, setIsLoadingSupabaseDrafts] = useState(false);
  const [workflowRequestId, setWorkflowRequestId] = useState<string | null>(null);
  const [showDraftPicker, setShowDraftPicker] = useState(false);
  const [showTemplatePickerModal, setShowTemplatePickerModal] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  // Queue & Review State (Hydrates compact storage or full draft)
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>(() => {
    const saved = localStorage.getItem('easyflight_session_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.generatedPosts && parsed.generatedPosts.length > 0) {
          const theme = localStorage.getItem('easyflight_theme') === 'dark' ? 'dark' : 'light';
          return parsed.generatedPosts.map((p: any) => {
            const banner = p.imageUrl && p.imageUrl.trim() && !p.imageUrl.startsWith('data:image/svg')
              ? p.imageUrl
              : generateOfficeBannerSvg(p.airlineName, p.officeName, p.city, p.tfnNumber, theme, p.companyName || companyName, p.companyLogoUrl || companyLogoUrl, p.socialLinks?.website || socialLinks.website);

            const html = p.htmlContent && p.htmlContent.length > 50
              ? p.htmlContent
              : (p.sections ? buildHtmlFromSections(
                  p.title,
                  banner,
                  p.tfnNumber,
                  p.airlineName,
                  p.officeName,
                  p.city,
                  p.country,
                  p.sections,
                  p.socialLinks,
                  p.bloggerSettings,
                  p.companyName || companyName
                ) : '');

            return {
              ...p,
              imageUrl: banner,
              htmlContent: html
            };
          });
        }
      } catch (e) {
        console.warn('Error hydrating draft from localStorage:', e);
      }
    }
    return [];
  });

  const [currentPostIndex, setCurrentPostIndex] = useState<number>(() => {
    const saved = localStorage.getItem('easyflight_session_draft');
    if (saved) {
      try { return JSON.parse(saved).currentPostIndex || 0; } catch (e) { /* ignore */ }
    }
    return 0;
  });

  const [isGeneratingBulk, setIsGeneratingBulk] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [authorInviteNotice, setAuthorInviteNotice] = useState<string | null>(null);

  // Non-technical review mode: 'visual' preview vs 'form' easy editor vs 'settings' Blogger sub-settings vs 'raw' code
  const [reviewTab, setReviewTab] = useState<'visual' | 'form' | 'settings' | 'raw'>('visual');
  const [viewMode, setViewMode] = useState<'simulator' | 'queue'>('simulator');
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; currentTitle?: string } | null>(null);

  const activePost = generatedPosts[currentPostIndex] || null;
  const workflowSteps = ['setup', 'airlines', 'drafts', 'review', 'history'] as const;
  const goToWorkflowStep = (direction: 1 | -1) => {
    const current = workflowSteps.indexOf(activeSection);
    const next = Math.min(workflowSteps.length - 1, Math.max(0, current + direction));
    setActiveSection(workflowSteps[next]);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const filteredHistoryPosts = generatedPosts.filter(post => {
    const query = historyFilter.trim().toLowerCase();
    const matchesStatus = historyStatusFilter === 'all' || post.status === historyStatusFilter;
    return matchesStatus && (!query || [post.title, post.keyword, post.airlineName, post.status, post.publishedUrl || ''].some(value => value.toLowerCase().includes(query)));
  });
  const copyHistoryLinks = () => {
    const selected = filteredHistoryPosts.filter(post => selectedHistoryIds.includes(post.id));
    const posts = (selected.length ? selected : filteredHistoryPosts).filter(post => post.publishedUrl);
    if (!posts.length) {
      setStatusMessage('No published URL links are available to copy.');
      return;
    }
    void navigator.clipboard.writeText(posts.map(post => post.publishedUrl as string).join('\n'));
    setStatusMessage(`${posts.length} published URL link${posts.length === 1 ? '' : 's'} copied.`);
  };
  const exportHistory = () => {
    const selected = filteredHistoryPosts.filter(post => selectedHistoryIds.includes(post.id));
    const posts = selected.length ? selected : filteredHistoryPosts;
    const csv = ['Title,Keyword,Airline,Status,Published URL', ...posts.map(post => [post.title, post.keyword, post.airlineName, post.status, post.publishedUrl || ''].map(value => `"${value.replace(/"/g, '""')}"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'blog-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Safely persist session work to localStorage without exceeding quota
  useEffect(() => {
    try {
      // Create a compact payload omitting massive repetitive SVG data URIs and HTML blobs
      const compactPosts = generatedPosts.map((p: GeneratedPost) => ({
        id: p.id,
        airlineName: p.airlineName,
        officeName: p.officeName,
        city: p.city,
        country: p.country,
        title: p.title,
        slug: p.slug,
        tfnNumber: p.tfnNumber,
        keyword: p.keyword,
        status: p.status,
        publishedUrl: p.publishedUrl,
        labels: p.labels,
        verified: p.verified,
        sections: p.sections,
        bloggerSettings: p.bloggerSettings,
        // Only keep external URLs, strip huge SVG data URIs
        imageUrl: p.imageUrl && !p.imageUrl.startsWith('data:image/svg') ? p.imageUrl : '',
        // Omit raw HTML since it is reconstructed instantaneously from sections
        htmlContent: p.sections ? '' : p.htmlContent
      }));

      const draftPayload = {
        blogId,
        commonTfn,
        targetKeyword,
        companyName,
        companyLogoUrl,
        contactEmail,
        socialLinks,
        currentPostIndex,
        generatedPosts: compactPosts
      };
      localStorage.setItem('easyflight_session_draft', JSON.stringify(draftPayload));
    } catch (err) {
      console.warn('LocalStorage quota limit reached, falling back to saving core settings:', err);
      try {
        const minimalPayload = {
          blogId,
          commonTfn,
          targetKeyword,
          socialLinks,
          currentPostIndex
        };
        localStorage.setItem('easyflight_session_draft', JSON.stringify(minimalPayload));
      } catch (innerErr) {
        console.error('Failed to write to localStorage:', innerErr);
      }
    }
  }, [blogId, commonTfn, targetKeyword, companyName, companyLogoUrl, contactEmail, socialLinks, currentPostIndex, generatedPosts]);

  // Safely persist airlines to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`easyflight_entities_${blogType}`, JSON.stringify(airlines));
      if (blogType === 'airlines') localStorage.setItem('easyflight_airlines', JSON.stringify(airlines));
    } catch (e) {
      console.warn('Could not save airlines to localStorage:', e);
    }
  }, [airlines, blogType]);

  useEffect(() => {
    try { localStorage.setItem('easyflight_custom_images', JSON.stringify(customImages.filter(url => !url.startsWith('data:')))); }
    catch (error) { console.warn('Could not save custom images locally:', error); }
  }, [customImages]);

  const refreshImageLibrary = async () => {
    setIsLoadingImageLibrary(true);
    try {
      const prefixes = ['Airlines', 'Blog', ''];
      const images = await Promise.all(prefixes.map(prefix => listPublicBucketImages(prefix)));
      setImageLibrary([...new Set(images.flat())]);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Image library refresh failed.');
    } finally {
      setIsLoadingImageLibrary(false);
    }
  };

  useEffect(() => { void refreshImageLibrary(); }, []);

  useEffect(() => {
    localStorage.setItem('easyflight_saved_templates', JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  const refreshSupabaseDrafts = async () => {
    setIsLoadingSupabaseDrafts(true);
    try {
      const rows = await getBlogTableDrafts();
      setSupabaseDrafts(rows.map((row: StoredBlogDraft, index) => {
        const title = String(row.title || row.keyword || `Saved blog ${index + 1}`);
        const rawHtml = String(
          row.content_html || row.html_content || row.content || row.article_html ||
          row.blog_content || row.article || row.body || ''
        );
        const htmlContent = cleanAndFormatBloggerHtml(rawHtml);
        return {
          id: `supabase-blog-${row.id || index}`,
          templateName: title,
          airlineName: String(row.airline_name || row.brand || companyName || 'Saved blog'),
          officeName: String(row.office_name || 'Saved draft'),
          city: String(row.city || 'Online'),
          country: String(row.country || ''),
          title,
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          tfnNumber: commonTfn,
          keyword: String(row.keyword || targetKeyword),
          htmlContent,
          imageUrl: String(row.banner_url || row.image_url || ''),
          status: 'Draft' as const,
          labels: [],
          socialLinks,
          isAiGenerated: true
        };
      }).filter(draft => draft.htmlContent.trim().length > 0));
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Supabase drafts could not be loaded.');
    } finally {
      setIsLoadingSupabaseDrafts(false);
    }
  };

  useEffect(() => { void refreshSupabaseDrafts(); }, []);

  // 10-Minute Inactivity Activity Tracker
  useEffect(() => {
    if (!isAuthenticated) return;

    const resetActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(evt => window.addEventListener(evt, resetActivity));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS && !isSessionLocked) {
        setIsSessionLocked(true);
      }
    }, 15000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, resetActivity));
      clearInterval(interval);
    };
  }, [isAuthenticated, isSessionLocked]);

  // Backend connection status check
  useEffect(() => {
    const query = customRefreshToken ? `?refreshToken=${encodeURIComponent(customRefreshToken)}` : '';
    fetch(`/api/status${query}`)
      .then(r => r.json())
      .then(data => {
        setIsBackendConnected(!!data.connected);
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, [customRefreshToken]);



  // Initial Post Batch on Mount - Populate all offices of selected airlines (e.g. 40+ posts)
  useEffect(() => {
    if (generatedPosts.length === 0 && airlines.length > 0) {
      const activeAirlines = airlines.filter((a: AirlineItem) => a.selected);
      const toProcess = activeAirlines.length > 0 ? activeAirlines : [airlines[0]];
      const initialBatch: GeneratedPost[] = [];
      const currentTheme = isDarkMode ? 'dark' : 'light';

      toProcess.forEach((airline: AirlineItem) => {
        const officesToProcess: AirlineOffice[] = airline.offices.length > 0 
          ? airline.offices 
          : [{ id: `${airline.id}-hq`, name: `${airline.name} Headquarters`, city: 'Headquarters', country: 'United States' }];

        officesToProcess.forEach((office: AirlineOffice) => {
          initialBatch.push(
            generateOfficeBlogPost(
              airline,
              office,
              targetKeyword,
              commonTfn,
              customImages[initialBatch.length % Math.max(customImages.length, 1)],
              socialLinks,
              currentTheme,
              companyName,
              companyLogoUrl,
              socialLinks.website
            )
          );
        });
      });

      setGeneratedPosts(initialBatch);
      setCurrentPostIndex(0);
    }
  }, []);

  // Toggle Theme & re-render banner for current theme
  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('easyflight_theme', next ? 'dark' : 'light');

    if (activePost) {
      const newBanner = generateOfficeBannerSvg(
        activePost.airlineName, 
        activePost.officeName, 
        activePost.city, 
        activePost.tfnNumber, 
        next ? 'dark' : 'light',
        companyName,
        companyLogoUrl,
        socialLinks.website
      );
      const updatedSections = activePost.sections || {
        urgentCalloutTitle: '24/7 Priority Travel Assistance & Booking Desk',
        urgentCalloutDesc: 'Need immediate booking assistance?',
        overviewPara1: '',
        overviewPara2: '',
        officeHours: '24/7',
        officeAddress: activePost.officeName,
        servicesList: [],
        faqs: []
      };
      const updatedHtml = buildHtmlFromSections(
        activePost.title,
        newBanner,
        activePost.tfnNumber,
        activePost.airlineName,
        activePost.officeName,
        activePost.city,
        activePost.country,
        updatedSections,
        activePost.socialLinks,
        activePost.bloggerSettings,
        companyName
      );
      const updated = { ...activePost, imageUrl: newBanner, htmlContent: updatedHtml };
      const newPosts = [...generatedPosts];
      newPosts[currentPostIndex] = updated;
      setGeneratedPosts(newPosts);
    }
  };



  const handleFullLogout = () => {
    setIsAuthenticated(false);
    setIsSessionLocked(false);
  };

  const toggleAirlineSelection = (id: string) => {
    setAirlines(airlines.map((a: AirlineItem) => a.id === id ? { ...a, selected: !a.selected } : a));
  };

  const handleSelectAll = (select: boolean) => {
    setAirlines(airlines.map((a: AirlineItem) => ({ ...a, selected: select })));
  };

  const selectedAirlines = airlines.filter((a: AirlineItem) => a.selected);
  const entryLabel = blogType === 'airlines' ? 'Airline' : blogType === 'hotels' ? 'Hotel' : blogType === 'travel' ? 'Travel entry' : 'Client';
  const entryLabelPlural = blogType === 'airlines' ? 'Airlines' : blogType === 'hotels' ? 'Hotels' : blogType === 'travel' ? 'Travel entries' : 'Client entries';
  const availableDraftSources = [...savedTemplates, ...supabaseDrafts];

  const handleBlogTypeChange = (nextType: BlogType) => {
    if (nextType === blogType) return;
    setBlogType(nextType);
    localStorage.setItem('easyflight_blog_type', nextType);
    const saved = localStorage.getItem(`easyflight_entities_${nextType}`);
    if (saved) {
      try { setAirlines(JSON.parse(saved)); } catch { setAirlines([]); }
    } else {
      setAirlines(nextType === 'airlines' ? DEFAULT_AIRLINES : []);
    }
    setAirlineFilter('');
    setGeneratedPosts([]);
    setCurrentPostIndex(0);
    setStatusMessage(nextType === 'airlines'
      ? 'Airline workspace loaded.'
      : `New ${nextType} workspace started. Add entries in Step 2 using Manage.`);
  };

  const addCustomImages = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setIsUploadingImages(true);
    try {
      const uploaded = await Promise.all(imageFiles.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read image file.'));
          reader.onerror = () => reject(new Error('File read error.'));
          reader.readAsDataURL(file);
        });
      }));
      setCustomImages(current => [...current, ...uploaded]);
      setImageLibrary(current => [...current, ...uploaded]);
      setStatusMessage(`Successfully loaded ${uploaded.length} image(s) locally.`);
    } catch (error) {
      console.warn('[Notice] Image loading notice:', error);
      setStatusMessage('Image loading processed with local preview.');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleCompanyLogoUpload = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setCompanyLogoUrl(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => setStatusMessage('Company logo could not be read.');
    reader.readAsDataURL(file);
  };

  const removeCustomImage = (index: number) => setCustomImages(current => current.filter((_, i) => i !== index));

  const createStarterPost = (kind: 'draft' | 'template'): GeneratedPost => {
    const entryName = companyName.trim() || (blogType === 'hotels' ? 'Hotel brand' : blogType === 'travel' ? 'Travel brand' : 'SEO client');
    const entry: AirlineItem = { id: `${kind}-${Date.now()}`, name: entryName, offices: [], selected: true };
    const office: AirlineOffice = { id: `${kind}-location`, name: 'Location placeholder', city: 'Your City', country: 'Your Country' };
    return generateOfficeBlogPost(entry, office, targetKeyword.trim() || 'Your target keyword', commonTfn, customImages[0], socialLinks, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl, socialLinks.website);
  };

  const saveNewTemplate = () => {
    const base = createStarterPost('template');
    const templateName = templateNameInput.trim() || `${blogType} reusable template`;
    const template: SavedTemplate = {
      ...base,
      id: `template-${Date.now()}`,
      templateName,
      title: templateTitleInput.trim() || base.title,
      keyword: templateKeywordInput.trim() || targetKeyword.trim() || base.keyword,
      htmlContent: templateHtmlInput.trim() || base.htmlContent,
      status: 'Draft'
    };
    setSavedTemplates(current => [template, ...current.filter(item => item.templateName !== templateName)]);
    setTemplateNameInput('');
    setTemplateTitleInput('');
    setTemplateKeywordInput('');
    setTemplateHtmlInput('');
    setStatusMessage(`Template "${templateName}" saved and ready to reuse.`);
  };

  const saveActiveAsTemplate = () => {
    if (!activePost) return;
    const name = prompt('Name this reusable draft template:', `${activePost.airlineName} ${activePost.keyword}`);
    if (!name?.trim()) return;
    const template: SavedTemplate = {
      ...activePost,
      id: `template-${Date.now()}`,
      status: 'Draft' as const,
      templateName: name.trim()
    };

    setSavedTemplates(current => [template, ...current.filter(item => item.templateName !== template.templateName)]);
    setStatusMessage(`Saved template "${name.trim()}".`);
  };

  const loadTemplate = (template: GeneratedPost) => {
    const copy = {
      ...template,
      id: `draft-${Date.now()}`,
      status: 'Draft' as const,
      publishedUrl: undefined,
      title: template.title,
      sections: template.sections ? { ...template.sections, faqs: [...template.sections.faqs], servicesList: [...template.sections.servicesList] } : undefined
    };

    setGeneratedPosts(current => [...current, copy]);
    setCurrentPostIndex(generatedPosts.length);
    setStatusMessage('Draft template added to the review queue.');
  };

  const applySourceToSelectedEntries = (source: any) => {
    const entries = selectedAirlines.length ? selectedAirlines : airlines;
    if (!entries.length) {
      setStatusMessage(`Select at least one ${entryLabel.toLowerCase()} in Step 2 first.`);
      setActiveSection('airlines');
      return;
    }
    const currentTheme = isDarkMode ? 'dark' : 'light';
    const queue: GeneratedPost[] = [];
    entries.forEach((entry, entryIndex) => {
      const offices = entry.offices.length ? entry.offices : [{
        id: `${entry.id}-draft`,
        name: `${entry.name} location`,
        city: 'Online',
        country: 'Worldwide'
      }];
      offices.forEach((office, officeIndex) => {
        const banner = source.imageUrl || source.banner_url || customImages[(entryIndex + officeIndex) % Math.max(customImages.length, 1)] || generateOfficeBannerSvg(entry.name, office.name, office.city, commonTfn, currentTheme, companyName, companyLogoUrl, socialLinks.website);
        const rawTitle = source.title || `${entry.name} ${office.city} Office Guide`;
        const rawKeyword = source.keyword || targetKeyword;
        const rawHtml = source.htmlContent || source.content_html || source.content || '';

        const title = rawTitle
          .replace(/\{\{(entry|airline|brand)\}\}/gi, entry.name)
          .replace(/\{\{city\}\}/gi, office.city)
          .replace(/\{\{country\}\}/gi, office.country)
          .replace(/\{\{tfnNumber\}\}/gi, commonTfn)
          .replace(/\{\{companyName\}\}/gi, companyName || entry.name);

        const htmlContent = cleanAndFormatBloggerHtml(
          rawHtml
            .replace(/\{\{(entry|airline|brand)\}\}/gi, entry.name)
            .replace(/\{\{city\}\}/gi, office.city)
            .replace(/\{\{country\}\}/gi, office.country)
            .replace(/\{\{tfnNumber\}\}/gi, commonTfn)
            .replace(/\{\{bannerUrl\}\}/gi, banner)
            .replace(/\{\{companyName\}\}/gi, companyName || entry.name)
        );

        queue.push({
          ...source,
          id: `draft-${Date.now()}-${entryIndex}-${officeIndex}`,
          airlineName: entry.name,
          officeName: office.name,
          city: office.city,
          country: office.country,
          title,
          keyword: rawKeyword.replace(/\{\{(entry|airline|brand)\}\}/gi, entry.name).replace(/\{\{city\}\}/gi, office.city),
          slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          tfnNumber: commonTfn,
          imageUrl: banner,
          htmlContent,
          status: 'Ready',
          publishedUrl: undefined,
          verified: true,
          isAiGenerated: true,
          companyName,
          companyLogoUrl
        });
      });
    });
    setGeneratedPosts(queue);
    setCurrentPostIndex(0);
    setActiveSection('review');
    setStatusMessage(`Applied template "${source.templateName || source.title}" to ${queue.length} articles! Ready for review & publishing.`);
  };

  const openDraftPicker = () => {
    setSelectedSourceId(availableDraftSources[0]?.id || null);
    setShowDraftPicker(true);
  };

  const generateFromSelectedSource = () => {
    const source = availableDraftSources.find(item => item.id === selectedSourceId);
    if (!source) {
      setStatusMessage('Select a draft or template first.');
      return;
    }
    setShowDraftPicker(false);
    applySourceToSelectedEntries(source);
  };

  const updateDraftField = (id: string, field: 'title' | 'keyword' | 'htmlContent' | 'status', value: string) => {
    setGeneratedPosts(posts => posts.map(post => post.id === id ? { ...post, [field]: value } : post));
  };

  const deleteDraft = (id: string) => {
    setGeneratedPosts(posts => posts.filter(post => post.id !== id));
    if (activePost?.id === id) setCurrentPostIndex(0);
  };

  const createDraftFromScratch = () => {
    const draft = createStarterPost('draft');
    draft.title = draftNameInput.trim() || draft.title;
    draft.status = 'Draft';
    setGeneratedPosts(current => [...current, draft]);
    setCurrentPostIndex(generatedPosts.length);
    setDraftNameInput('');
    setActiveSection('drafts');
    setStatusMessage('New standalone draft created. Select it below to edit and save.');
  };

  const createBlankDraft = () => {
    const airline = selectedAirlines[0] || airlines[0] || {
      id: `custom-${Date.now()}`,
      name: companyName.trim() || (blogType === 'hotels' ? 'Hotel' : blogType === 'travel' ? 'Travel Brand' : 'SEO Client'),
      offices: [],
      selected: true
    };

    const office = airline.offices[0] || {
      id: `${airline.id}-draft`,
      name: `${airline.name} Office`,
      city: 'Headquarters',
      country: 'United States'
    };
    const draft = generateOfficeBlogPost(airline, office, targetKeyword || 'New blog topic', commonTfn, customImages[0], socialLinks, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl, socialLinks.website);
    draft.status = 'Draft';
    setGeneratedPosts(current => [...current, draft]);
    setCurrentPostIndex(generatedPosts.length);
    setActiveSection('drafts');
    setStatusMessage('Blank editable draft added to the review queue.');
  };

  const createTemplateFromScratch = () => {
    const airline = selectedAirlines[0] || airlines[0] || {
      id: `template-entry-${Date.now()}`,
      name: companyName.trim() || (blogType === 'hotels' ? 'Hotel Template' : blogType === 'travel' ? 'Travel Template' : 'Client Template'),
      offices: [],
      selected: true
    };
    const office = airline.offices[0] || {
      id: `${airline.id}-template`,
      name: `${airline.name} location`,
      city: 'Your City',
      country: 'Your Country'
    };
    const draft = generateOfficeBlogPost(
      airline,
      office,
      targetKeyword || 'Your target blog topic',
      commonTfn,
      customImages[0],
      socialLinks,
      isDarkMode ? 'dark' : 'light',
      companyName,
      companyLogoUrl,
      socialLinks.website
    );
    draft.status = 'Draft';
    const templateName = prompt('Name your new reusable template:', `${blogType} content template`);
    if (!templateName?.trim()) return;
    const template: SavedTemplate = { ...draft, id: `template-${Date.now()}`, templateName: templateName.trim() };
    setSavedTemplates(current => [template, ...current.filter(item => item.templateName !== template.templateName)]);
    setGeneratedPosts(current => [...current, draft]);
    setCurrentPostIndex(generatedPosts.length);
    setActiveSection('drafts');
    setStatusMessage(`Template "${template.templateName}" created. Edit its draft content, then reuse it from this panel.`);
  };

  // Bulk Post Generator
  const handleGenerateBulkPosts = () => {
    setIsGeneratingBulk(true);
    const newQueue: GeneratedPost[] = [];
    const currentTheme = isDarkMode ? 'dark' : 'light';

    selectedAirlines.forEach((airline: AirlineItem) => {
      const officesToProcess: AirlineOffice[] = airline.offices.length > 0 
        ? airline.offices 
        : [{ id: `${airline.id}-hq`, name: `${airline.name} Headquarters`, city: 'Headquarters', country: 'United States' }];

      officesToProcess.forEach((office: AirlineOffice) => {
        const post = generateOfficeBlogPost(
          airline,
          office,
          targetKeyword,
          commonTfn,
          customImages[newQueue.length % Math.max(customImages.length, 1)],
          socialLinks,
          currentTheme,
          companyName,
          companyLogoUrl,
          socialLinks.website
        );
        newQueue.push(post);
      });
    });

    setTimeout(() => {
      setGeneratedPosts(newQueue);
      setCurrentPostIndex(0);
      setIsGeneratingBulk(false);
      setStatusMessage(`Generated ${newQueue.length} flight blogs with TFN (${commonTfn})! Review and edit using the Easy Editor.`);
      setTimeout(() => setStatusMessage(null), 5000);
    }, 600);
  };

  const handleGenerateWithWorkflow = async () => {
    if (isGeneratingBulk) return;
    setIsGeneratingBulk(true);
    setStatusMessage('Generating content with AI...');

    const entries = selectedAirlines.length > 0 ? selectedAirlines : airlines;
    if (!entries.length) {
      setStatusMessage('Add and select at least one entry in Step 2 before running.');
      setIsGeneratingBulk(false);
      return;
    }

    const firstEntry = entries[0];
    const firstOffice = firstEntry.offices[0] || { city: 'Global', country: 'International' };

    try {
      addLog('ai', 'info', 'Generating AI Content', `Generating content for ${firstEntry.name}`);
      
      const aiContent = await generateDeepSeekContent(
        firstEntry.name,
        firstOffice.city,
        firstOffice.country,
        targetKeyword.trim(),
        commonTfn,
        [],
        `${Date.now()}-${firstEntry.name}`,
        aiProvider
      );
      
      addLog('ai', 'success', 'Blog Generated', 'Successfully generated blog content.');

      const banner = customImages[0] || '';
      
      const queue: GeneratedPost[] = [];
      entries.forEach((entry, entryIndex) => {
        const offices = entry.offices.length ? entry.offices : [{ id: `${entry.id}-hq`, name: `${entry.name} Headquarters`, city: 'Headquarters', country: 'United States' }];
        offices.forEach((office, officeIndex) => {
          const imageUrl = banner || generateOfficeBannerSvg(entry.name, office.name, office.city, commonTfn, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl, socialLinks.website);
          
          // Generate content with placeholders
          const post = generateOfficeBlogPost(entry, office, targetKeyword, commonTfn, imageUrl, socialLinks, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl, socialLinks.website);
          
          queue.push({
            ...post,
            title: aiContent.title.replace(/\{\{(entry|airline|brand)\}\}/gi, entry.name),
            htmlContent: cleanAndFormatBloggerHtml(post.htmlContent),
            imageUrl,
            status: 'Ready',
            verified: true,
            isAiGenerated: true
          });
        });
      });
      setGeneratedPosts(queue);
      setCurrentPostIndex(0);
      setActiveSection('review');
      setStatusMessage(`⚡ AI generated blog successfully! Created ${queue.length} review-ready post${queue.length === 1 ? '' : 's'}.`);
    } finally {
      setIsGeneratingBulk(false);
    }
  };

  // AI-Powered Single Post Generator
  const handleGenerateAIPost = async (index: number) => {
    const post = generatedPosts[index];
    if (!post) return;

    const newPosts = [...generatedPosts];
    newPosts[index] = { ...post, status: 'Draft' as any }; // Visual indicator
    setGeneratedPosts(newPosts);
    setStatusMessage(`Generating AI Content for ${post.airlineName} - ${post.city}...`);

    try {
      // 1. Get history from Supabase to ensure variety
      const history = await getRecentPosts(post.airlineName, post.city);
      
      // 2. Generate content with DeepSeek
      const aiContent: BlogPostContent = await generateDeepSeekContent(
        post.airlineName,
        post.city,
        post.country,
        targetKeyword.trim() || post.keyword,
        post.tfnNumber,
        history,
        `${Date.now()}-${index}-${post.airlineName}-${post.city}`,
        aiProvider
      );

      // Keep imagery deterministic and user-controlled; text providers never create images.
      const aiImageUrl = customImages[index % Math.max(customImages.length, 1)] || post.imageUrl;

      // 4. Update the post sections
      const updatedSections: PostSections = {
        ...(post.sections || {
          urgentCalloutTitle: '24/7 Priority Travel Assistance & Dispute Helpline',
          urgentCalloutDesc: `Need immediate assistance with your ${post.airlineName} dispute at ${post.city}?`,
          overviewPara1: '',
          overviewPara2: '',
          officeHours: '24/7',
          officeAddress: post.officeName,
          servicesList: [],
          faqs: []
        }),
        overviewPara1: aiContent.overview.split('\n\n')[0] || aiContent.overview,
        overviewPara2: aiContent.overview.split('\n\n')[1] || '',
        servicesList: aiContent.services,
        faqs: aiContent.faqs
      };

      const updatedHtml = buildHtmlFromSections(
        aiContent.title,
        aiImageUrl,
        post.tfnNumber,
        post.airlineName,
        post.officeName,
        post.city,
        post.country,
        updatedSections,
        post.socialLinks || socialLinks,
        post.bloggerSettings,
        post.companyName || companyName
      );

      const finalPost: GeneratedPost = {
        ...post,
        title: aiContent.title,
        imageUrl: aiImageUrl,
        sections: updatedSections,
        htmlContent: updatedHtml,
        status: 'Ready',
        verified: true,
        isAiGenerated: true
      };

      const finalPosts = [...generatedPosts];
      finalPosts[index] = finalPost;
      setGeneratedPosts(finalPosts);
      addLog('ai', 'success', 'Single AI Post Ready', `${post.airlineName} article rewritten using ${aiProvider}.`);
      setStatusMessage(`AI Generation Complete for ${post.airlineName}!`);
    } catch (error) {
      console.error('AI Generation failed:', error);
      addLog('ai', 'error', 'AI Post Failed', `Failed for ${post.airlineName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusMessage(error instanceof Error ? `AI generation issue: ${error.message}` : 'AI generation failed; keyword fallback was unavailable.');
      const fallbackPosts = [...generatedPosts];
      fallbackPosts[index] = { ...post, status: 'Error' };
      setGeneratedPosts(fallbackPosts);
    } finally {
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleGenerateBulkAI = async () => {
    if (selectedAirlines.length === 0 || isGeneratingBulk) return;
    setIsGeneratingBulk(true);
    setStatusMessage(`Synthesizing base posts for ${selectedAirlines.length} airlines...`);

    const currentTheme = isDarkMode ? 'dark' : 'light';
    const baseQueue: GeneratedPost[] = [];

    selectedAirlines.forEach((airline: AirlineItem) => {
      const officesToProcess: AirlineOffice[] = airline.offices.length > 0 
        ? airline.offices 
        : [{ id: `${airline.id}-hq`, name: `${airline.name} Headquarters`, city: 'Headquarters', country: 'United States' }];

      officesToProcess.forEach((office: AirlineOffice) => {
        const post = generateOfficeBlogPost(
          airline,
          office,
          targetKeyword,
          commonTfn,
          customImages[baseQueue.length % Math.max(customImages.length, 1)],
          socialLinks,
          currentTheme,
          companyName,
          companyLogoUrl,
          socialLinks.website
        );
        baseQueue.push(post);
      });
    });

    setGeneratedPosts(baseQueue);
    setCurrentPostIndex(0);

    const workingPosts = [...baseQueue];
    for (let i = 0; i < workingPosts.length; i++) {
      const post = workingPosts[i];
      setBulkProgress({ 
        current: i + 1, 
        total: workingPosts.length, 
        currentTitle: `Writing AI Guide: ${post.airlineName} (${post.city})` 
      });
      setStatusMessage(`[${i + 1}/${workingPosts.length}] Generating unique ${aiProvider} content for ${post.airlineName} - ${post.city}...`);

      try {
        const history = await getRecentPosts(post.airlineName, post.city);
        const aiContent = await generateDeepSeekContent(
          post.airlineName,
          post.city,
          post.country,
          targetKeyword.trim() || post.keyword,
          post.tfnNumber,
          history,
          `${Date.now()}-${i}-${post.airlineName}-${post.city}`,
          aiProvider
        );

        const aiImageUrl = customImages[i % Math.max(customImages.length, 1)] || post.imageUrl;

        const updatedSections: PostSections = {
          ...(post.sections || {
            urgentCalloutTitle: '24/7 Priority Travel Assistance & Dispute Helpline',
            urgentCalloutDesc: `Need immediate assistance with your ${post.airlineName} dispute at ${post.city}?`,
            overviewPara1: '',
            overviewPara2: '',
            officeHours: '24/7',
            officeAddress: post.officeName,
            servicesList: [],
            faqs: []
          }),
          overviewPara1: aiContent.overview.split('\n\n')[0] || aiContent.overview,
          overviewPara2: aiContent.overview.split('\n\n')[1] || '',
          servicesList: aiContent.services,
          faqs: aiContent.faqs
        };

        const updatedHtml = buildHtmlFromSections(
          aiContent.title,
          aiImageUrl,
          post.tfnNumber,
          post.airlineName,
          post.officeName,
          post.city,
          post.country,
          updatedSections,
          post.socialLinks || socialLinks,
          post.bloggerSettings,
          post.companyName || companyName
        );

        const finalPost: GeneratedPost = {
          ...post,
          title: aiContent.title,
          imageUrl: aiImageUrl,
          sections: updatedSections,
          htmlContent: updatedHtml,
          status: 'Ready',
          verified: true,
          isAiGenerated: true
        };

        workingPosts[i] = finalPost;
        setGeneratedPosts([...workingPosts]);
      } catch (err: any) {
        console.error(`AI generation failed for ${post.airlineName} ${post.city}:`, err);
      }
    }

    setBulkProgress(null);
    addLog('ai', 'success', 'Bulk Generation Finished', `Successfully synthesized ${workingPosts.length} unique articles.`);
    setStatusMessage(`Bulk AI Generation Complete! ${workingPosts.length} posts generated with unique ${aiProvider} content.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const rebuildPost = (
    post: GeneratedPost,
    sections: PostSections,
    imageUrl: string,
    links: SocialLinks = post.socialLinks || socialLinks,
    branding = post.companyName || companyName
  ): GeneratedPost => ({
    ...post,
    sections,
    imageUrl,
    socialLinks: links,
    htmlContent: buildHtmlFromSections(
      post.title,
      imageUrl,
      post.tfnNumber,
      post.airlineName,
      post.officeName,
      post.city,
      post.country,
      sections,
      links,
      post.bloggerSettings,
      branding
    )
  });

  const makePostPublishable = async (post: GeneratedPost): Promise<GeneratedPost> => {
    // If it's a data URL, we don't need to upload to Supabase to publish; 
    // Blogger accepts base64 data URIs for images in post bodies.
    return { ...post, htmlContent: cleanAndFormatBloggerHtml(post.htmlContent) };
  };

  // Easy Non-Technical Section Update. Shared edits are applied to every
  // unpublished draft so the queue remains consistent before publishing.
  const handleUpdateSection = (field: keyof PostSections, value: any) => {
    if (!activePost || !activePost.sections) return;
    setGeneratedPosts(posts => posts.map(post => rebuildPost(
      post,
      { ...(post.sections || activePost.sections!), [field]: value },
      post.imageUrl
    )));
  };

  const handleUpdateFaq = (index: number, question: string, answer: string) => {
    if (!activePost || !activePost.sections) return;
    const newFaqs = [...activePost.sections.faqs];
    newFaqs[index] = { question, answer };
    handleUpdateSection('faqs', newFaqs);
  };

  const handleAddFaq = () => {
    if (!activePost || !activePost.sections) return;
    const newFaqs = [
      ...activePost.sections.faqs,
      { question: `New Question about ${activePost.airlineName}?`, answer: `Contact our customer service desk at ${activePost.tfnNumber} for direct help.` }
    ];
    handleUpdateSection('faqs', newFaqs);
  };

  const handleDeleteFaq = (index: number) => {
    if (!activePost || !activePost.sections) return;
    const newFaqs = activePost.sections.faqs.filter((_: any, i: number) => i !== index);
    handleUpdateSection('faqs', newFaqs);
  };

  // Regenerate SVG Banner
  const handleRegenerateBanner = () => {
    if (!activePost) return;
    const newBanner = generateOfficeBannerSvg(
      activePost.airlineName, 
      activePost.officeName, 
      activePost.city, 
      activePost.tfnNumber,
      isDarkMode ? 'dark' : 'light',
      companyName,
      companyLogoUrl,
      socialLinks.website
    );
    const updatedSections = activePost.sections || {
      urgentCalloutTitle: '24/7 Priority Travel Assistance & Booking Desk',
      urgentCalloutDesc: 'Need immediate booking assistance?',
      overviewPara1: '',
      overviewPara2: '',
      officeHours: '24/7',
      officeAddress: activePost.officeName,
      servicesList: [],
      faqs: []
    };

    setGeneratedPosts(posts => posts.map(post => rebuildPost(
      post,
      post.sections || updatedSections,
      newBanner
    )));
  };

  const applyBrandingToPosts = () => {
    setGeneratedPosts(posts => posts.map(post => {
      const banner = post.imageUrl.startsWith('data:image/svg')
        ? generateOfficeBannerSvg(post.airlineName, post.officeName, post.city, post.tfnNumber, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl, socialLinks.website)
        : post.imageUrl;
      return {
        ...rebuildPost(post, post.sections || {
          urgentCalloutTitle: '24/7 Priority Travel Assistance & Booking Desk',
          urgentCalloutDesc: 'Need immediate booking assistance?',
          overviewPara1: '',
          overviewPara2: '',
          officeHours: '24/7',
          officeAddress: post.officeName,
          servicesList: [],
          faqs: []
        }, banner, post.socialLinks || socialLinks, companyName),
        companyName,
        companyLogoUrl
      };
    }));
    setStatusMessage('Company branding applied to the current blog queue.');
  };

  // Upload custom banner (local preview / base64 without flooding Supabase storage)
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activePost) return;
    const file = e.target.files[0];
    const scope = applyBannerScope;
    
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const localUrl = reader.result as string;
      setCustomImages(current => [...current, localUrl]);
      setImageLibrary(current => [...current, localUrl]);
      
      setGeneratedPosts(posts => posts.map((post, idx) => {
        if (scope === 'all' || idx === currentPostIndex) {
          return rebuildPost(
            post,
            post.sections || activePost.sections!,
            localUrl
          );
        }
        return post;
      }));
      setStatusMessage(`Custom local banner applied to ${scope === 'all' ? 'every generated post' : 'this post only'}.`);
    };
    reader.onerror = () => {
      setStatusMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  // Add custom link in modal
  const handleAddCustomLink = () => {
    if (!customLinkUrl.trim()) return;
    const newLink: CustomLinkItem = {
      id: `custom-${Date.now()}`,
      label: customLinkLabel.trim() || 'Portal Link',
      url: customLinkUrl.trim()
    };
    const updatedCustom = [...(socialLinks.customLinks || []), newLink];
    setSocialLinks({ ...socialLinks, customLinks: updatedCustom });
    setCustomLinkLabel('');
    setCustomLinkUrl('');
  };

  const handleDeleteCustomLink = (id: string) => {
    const updatedCustom = (socialLinks.customLinks || []).filter((c: CustomLinkItem) => c.id !== id);
    setSocialLinks({ ...socialLinks, customLinks: updatedCustom });
  };

  // Save Links & re-render active post
  const handleSaveLinksAndApply = () => {
    setShowSocialModal(false);
    if (activePost && activePost.sections) {
      setGeneratedPosts(posts => posts.map(post => {
        const banner = post.imageUrl.startsWith('data:image/svg')
          ? generateOfficeBannerSvg(post.airlineName, post.officeName, post.city, post.tfnNumber, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl, socialLinks.website)
          : post.imageUrl;
        return rebuildPost(post, post.sections || activePost.sections!, banner, socialLinks, companyName);
      }));
    }
    setStatusMessage('Website, portals, and social links saved & embedded!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleToggleVerifyPost = (index: number) => {
    const post = generatedPosts[index];
    if (!post) return;
    const updated = { ...post, verified: !post.verified };
    const newPosts = [...generatedPosts];
    newPosts[index] = updated;
    setGeneratedPosts(newPosts);
  };

  const handleVerifyAll = (verify: boolean) => {
    const newPosts = generatedPosts.map((p: GeneratedPost) => ({ ...p, verified: verify }));
    setGeneratedPosts(newPosts);
    setStatusMessage(verify ? `All ${newPosts.length} posts marked as verified!` : 'Unverified all posts.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpdateBloggerSettings = (updatedSettings: BloggerSubSettings) => {
    if (!activePost || !activePost.sections) return;
    const updatedHtml = buildHtmlFromSections(
      activePost.title,
      activePost.imageUrl,
      activePost.tfnNumber,
      activePost.airlineName,
      activePost.officeName,
      activePost.city,
      activePost.country,
      activePost.sections,
      activePost.socialLinks,
      updatedSettings,
      activePost.companyName || companyName
    );
    const updated: GeneratedPost = {
      ...activePost,
      bloggerSettings: updatedSettings,
      labels: updatedSettings.labels,
      slug: updatedSettings.permalinkSlug,
      htmlContent: updatedHtml
    };
    const newPosts = [...generatedPosts];
    newPosts[currentPostIndex] = updated;
    setGeneratedPosts(newPosts);
  };



  // Publish Single Post to Blogger
  const handlePublishSinglePost = async (index: number) => {
    const targetPost = generatedPosts[index];
    if (!targetPost) return;

    setIsPublishing(true);
    setStatusMessage(`Publishing "${targetPost.title}" to Blogger...`);
    setAuthorInviteNotice(null);

    try {
      const publishablePost = await makePostPublishable(targetPost);
      if (publishablePost.imageUrl !== targetPost.imageUrl) {
        const nextPosts = [...generatedPosts];
        nextPosts[index] = publishablePost;
        setGeneratedPosts(nextPosts);
      }
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-Client-App': 'automated-blogger'
      };
      if (publishSecret && publishSecret.trim()) {
        headers['Authorization'] = `Bearer ${publishSecret.trim()}`;
      }

      const res = await fetch('/api/blogger/publish', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          blogId: blogId,
          title: publishablePost.title,
          content: cleanAndFormatBloggerHtml(publishablePost.htmlContent),
          labels: publishablePost.bloggerSettings?.labels || publishablePost.labels,
          customMetaData: publishablePost.bloggerSettings?.searchDescription,
          location: publishablePost.bloggerSettings?.location,
          readerComments: publishablePost.bloggerSettings?.readerComments,
          isDraft: false,
          refreshToken: customRefreshToken || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const liveUrl = data.url || TARGET_BLOG_URL;
        const updated = { ...publishablePost, status: 'Published' as const, publishedUrl: liveUrl };
        const newPosts = [...generatedPosts];
        newPosts[index] = updated;
        setGeneratedPosts(newPosts);
        setStatusMessage(`Successfully published live to Blogger! Post Link: ${liveUrl}`);
        
        // Save to Supabase on success
        savePostToSupabase({
          title: publishablePost.title,
          content: publishablePost.htmlContent,
          airline_name: publishablePost.airlineName,
          city: publishablePost.city
        });

        addLog('blogger', 'success', 'Published to Blogger', `"${publishablePost.title}" is now live.`, liveUrl);
      } else {
        if (data.code === 'REFRESH_TOKEN_EXPIRED' || data.code === 'MISSING_REFRESH_TOKEN' || data.needsConfig) {
          setShowRefreshTokenModal(true);
          addLog('blogger', 'warning', 'Auth Expired', 'Google token expired during publish.');
          setStatusMessage('Google Refresh Token expired or missing. Please paste a valid token in the modal.');
        } else {
          addLog('blogger', 'error', 'Publish Failed', data.error || 'Check permissions');
          setStatusMessage(`Publish status: ${data.error || 'Check Blogger Author Permissions'}`);
        }
      }
    } catch (e: any) {
      addLog('blogger', 'error', 'System Error', e.message);
      setStatusMessage(`Error: ${e.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishToBlogger = async () => {
    await handlePublishSinglePost(currentPostIndex);
  };

  // Bulk Publish All Verified Posts
  const handlePublishAllVerified = async () => {
    const verifiedIndices = generatedPosts
      .map((p: GeneratedPost, idx: number) => ({ p, idx }))
      .filter(({ p }: { p: GeneratedPost; idx: number }) => p.verified && p.status !== 'Published');

    if (verifiedIndices.length === 0) {
      setStatusMessage('No un-published verified posts in queue. Click "Verify All" or mark posts as verified first.');
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    setIsPublishing(true);
    setAuthorInviteNotice(null);

    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Client-App': 'automated-blogger'
    };
    if (publishSecret && publishSecret.trim()) {
      headers['Authorization'] = `Bearer ${publishSecret.trim()}`;
    }
    const updatedQueue = [...generatedPosts];

    for (let i = 0; i < verifiedIndices.length; i++) {
      const { p: postToPublish, idx } = verifiedIndices[i];
      setBulkProgress({
        current: i + 1,
        total: verifiedIndices.length,
        currentTitle: `${postToPublish.airlineName} - ${postToPublish.city}`
      });

      try {
        const publishablePost = await makePostPublishable(postToPublish);
        updatedQueue[idx] = publishablePost;
        const res = await fetch('/api/blogger/publish', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            blogId: blogId,
            title: publishablePost.title,
            content: cleanAndFormatBloggerHtml(publishablePost.htmlContent),
            labels: publishablePost.bloggerSettings?.labels || publishablePost.labels,
            customMetaData: publishablePost.bloggerSettings?.searchDescription,
            location: publishablePost.bloggerSettings?.location,
            readerComments: publishablePost.bloggerSettings?.readerComments,
            isDraft: false,
            refreshToken: customRefreshToken || undefined
          })
        });

        const data = await res.json();
        if (res.ok && data.success) {
          updatedQueue[idx] = {
            ...publishablePost,
            status: 'Published',
            publishedUrl: data.url || TARGET_BLOG_URL
          };
          setGeneratedPosts([...updatedQueue]);

          // Save to Supabase on success
          savePostToSupabase({
            title: publishablePost.title,
            content: publishablePost.htmlContent,
            airline_name: publishablePost.airlineName,
            city: publishablePost.city
          });
        } else {
          if (data.code === 'REFRESH_TOKEN_EXPIRED' || data.code === 'MISSING_REFRESH_TOKEN' || data.needsConfig) {
            setShowRefreshTokenModal(true);
            setStatusMessage('Google Refresh Token expired or missing. Please update it in the modal.');
            break;
          }
          updatedQueue[idx] = {
            ...postToPublish,
            status: 'Error'
          };
          setGeneratedPosts([...updatedQueue]);
        }
      } catch (err) {
        updatedQueue[idx] = { ...postToPublish, status: 'Error' };
        setGeneratedPosts([...updatedQueue]);
      }
    }

    setIsPublishing(false);
    setBulkProgress(null);
    setStatusMessage(`Bulk publishing finished for ${verifiedIndices.length} posts!`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Filter airlines by search query
  const filteredAirlines = airlines.filter((a: AirlineItem) => 
    a.name.toLowerCase().includes(airlineFilter.toLowerCase()) ||
    a.offices.some((o: AirlineOffice) => o.name.toLowerCase().includes(airlineFilter.toLowerCase()))
  );

  // If user is not authenticated on this tab load/refresh, show the Public Landing Page by default
  // (Ensures Google OAuth reviewers & Search Console can view the complete public application)
  if (!isAuthenticated) {
    if (isLoggingIn) {
      return (
        <LoginPage 
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            setIsLoggingIn(false);
            lastActivityRef.current = Date.now();
          }}
          onBackToPublic={() => setIsLoggingIn(false)}
          isDarkMode={isDarkMode}
        />
      );
    }
    return (
      <PublicLandingPage 
        onOpenDashboard={() => setIsLoggingIn(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (returnOtpRequired) {
    return (
      <LoginPage
        otpOnly
        isDarkMode={isDarkMode}
        onLoginSuccess={() => { setReturnOtpRequired(false); setShowPublicPage(false); }}
        onBackToPublic={() => setReturnOtpRequired(false)}
      />
    );
  }

  // If user is authenticated but clicked to view the Public Site
  if (showPublicPage) {
    return (
      <PublicLandingPage 
        onOpenDashboard={() => setReturnOtpRequired(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 font-sans flex flex-col ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      
      {/* Top Navbar */}
      <header className={`border-b sticky top-0 z-40 px-6 py-2.5 flex items-center justify-between transition-colors ${
        isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow font-bold">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight">Automated-Blogger</h1>
            <span className={`text-[11px] border-l pl-2 ${isDarkMode ? 'text-slate-400 border-slate-700' : 'text-slate-500 border-slate-300'}`}>
              Blogger Publishing Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          
          {/* Sidebar Toggle */}
          <button type="button" onClick={() => setIsSidebarOpen(current => !current)} className={`rounded-lg border p-2 ${isDarkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'}`} aria-label="Toggle workflow navigation">
            <Settings className="h-4 w-4" />
          </button>

          {/* Google connection status */}
          <button
            onClick={() => setShowRefreshTokenModal(true)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition cursor-pointer shadow-sm ${
              isBackendConnected
                ? isDarkMode
                  ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100'
                : isDarkMode
                  ? 'bg-amber-950/40 border-amber-600 text-amber-300 hover:bg-amber-900/50'
                  : 'bg-amber-50 border-amber-400 text-amber-800 hover:bg-amber-100'
            }`}
            title={isBackendConnected ? 'Google connection is ACTIVE. Click to manage or refresh token.' : 'Google connection is INACTIVE or token has expired. Click to enter a new refresh token.'}
            aria-label={isBackendConnected ? 'Google connection active' : 'Google connection inactive'}
          >
            <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${isBackendConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-pulse' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]'}`} />
            <Key className={`h-3.5 w-3.5 ${isBackendConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className="hidden sm:inline font-bold">
              {isBackendConnected ? 'Google: Active' : 'Google: Inactive'}
            </span>
          </button>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title={isDarkMode ? 'Switch to Eye-Friendly Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Lock Screen Button */}
          <button
            onClick={() => setIsSessionLocked(true)}
            className={`p-2 rounded-lg border text-xs transition ${
              isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title="Lock Studio Screen"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

  {/* Author Invite Alert Notice if needed */}
      {authorInviteNotice && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span><strong>Blogger Permission Setup:</strong> {authorInviteNotice}</span>
          </div>
        </div>
      )}

      {/* Settings and related tools remain available without crowding the header. */}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-0 bottom-0 z-50 w-[min(86vw,20rem)] border-r p-4 transition-transform ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="mb-5 flex items-center justify-between"><span className="text-sm font-black">Navigation</span><button type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation"><ChevronLeft className="h-4 w-4" /></button></div>
        <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Workflow</p>
        <nav className="space-y-1 text-xs font-semibold">
          {([
            ['setup', '1. Setup & branding'],
            ['airlines', `2. ${entryLabelPlural}`],
            ['drafts', '3. Drafts & templates'],
            ['review', '4. Review & AI Generate'],
            ['history', '5. History & Logs']
          ] as const).map(([section, label]) => (
            <button key={section} type="button" onClick={() => { setActiveSection(section); setIsSidebarOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left ${activeSection === section ? 'bg-sky-600 text-white' : 'hover:bg-sky-500/10 hover:text-sky-500'}`}>{label}</button>
          ))}
        </nav>
        <p className="mb-3 mt-7 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Settings</p>
        <nav className="space-y-1 text-xs font-semibold">
          <button onClick={() => setShowRefreshTokenModal(true)} className={`block w-full rounded-lg px-3 py-2 text-left transition ${isBackendConnected ? 'text-emerald-500 hover:bg-emerald-500/10' : 'hover:bg-sky-500/10 hover:text-sky-500'}`}>
            Google Connection {isBackendConnected && '✓'}
          </button>
          <button onClick={() => setShowAiModal(true)} className={`block w-full rounded-lg px-3 py-2 text-left transition ${(aiProvider === 'gemini' ? geminiKey : deepSeekKey) ? 'text-sky-500 hover:bg-sky-500/10' : 'hover:bg-sky-500/10 hover:text-sky-500'}`}>
            ✨ AI Engine {(aiProvider === 'gemini' ? geminiKey : deepSeekKey) && '• Active'}
          </button>
          <button onClick={() => setShowPublishingSecurityModal(true)} className={`block w-full rounded-lg px-3 py-2 text-left transition ${publishSecret ? 'text-emerald-500 hover:bg-emerald-500/10' : 'hover:bg-sky-500/10 hover:text-sky-500'}`}>
            🛡️ Publishing Security {publishSecret && '• Secure'}
          </button>
          <button onClick={() => setShowN8nWorkflowModal(true)} className={`block w-full rounded-lg px-3 py-2 text-left transition ${n8nApiKey ? 'text-violet-500 hover:bg-violet-500/10' : 'hover:bg-sky-500/10 hover:text-sky-500'}`}>
            ⚡ n8n Workflow {n8nApiKey && '• Wired'}
          </button>
          <button onClick={() => setShowSocialModal(true)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-sky-500/10 hover:text-sky-500">Website & Social Links</button>
          <button onClick={() => setShowPublicPage(true)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-sky-500/10 hover:text-sky-500">Public Page & Verification</button>
          <a href="https://seo-indexer-tool.vercel.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-sky-500/10 hover:text-sky-500">Blogger Indexer <ExternalLink className="ml-1 inline h-3 w-3" /></a>
        </nav>
      </aside>

      {!isSidebarOpen && (
        <nav className={`fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl border p-2 shadow-xl ${
          isDarkMode ? 'border-slate-700 bg-slate-900/95' : 'border-slate-200 bg-white/95'
        }`} aria-label="Workflow quick navigation">
          {workflowSteps.map((section, index) => {
            const Icon = index === 0 ? Settings : index === 1 ? Plane : index === 2 ? Eye : index === 3 ? FileCode : ListFilter;
            return <button key={section} type="button" onClick={() => setActiveSection(section)} title={`Step ${index + 1}: ${section}`} className={`rounded-xl p-2.5 ${activeSection === section ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-sky-500/10'}`}><Icon className="h-4 w-4" /></button>;
          })}
          <button type="button" onClick={() => setIsSidebarOpen(true)} title="Open full navigation" className="rounded-xl p-2.5 text-slate-500 hover:bg-sky-500/10"><ChevronRight className="h-4 w-4 rotate-90" /></button>
        </nav>
      )}

      <main className={`flex-1 w-full max-w-7xl mx-auto p-3 pb-24 sm:p-5 sm:pb-24 transition-[margin] duration-200 ${isSidebarOpen ? 'ml-[min(86vw,20rem)]' : 'ml-0'}`}>

        {/* LEFT COLUMN: Controls, TFN, Keyword, Airline Selector */}
        <div id="workspace-controls" className={`w-full max-w-6xl mx-auto space-y-4 ${activeSection === 'setup' || activeSection === 'airlines' ? '' : 'hidden'}`}>
          
          <div className={`border rounded-2xl p-5 shadow-sm space-y-4 transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            
            <div className={`${activeSection === 'setup' ? '' : 'hidden'} rounded-xl border border-sky-500/20 bg-sky-500/5 p-3`}>
              <p className="text-xs font-black">Brand details</p>
              <p className="mt-1 text-[11px] text-slate-500">These appear on every generated article and banner.</p>
              <input
                type="text"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Agency or company name"
                className={`mt-3 w-full rounded-lg border p-2.5 text-xs outline-none ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="Contact email for the workflow"
                className={`mt-2 w-full rounded-lg border p-2.5 text-xs outline-none ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
              />
              <div className="mt-2 flex items-center gap-3">
                {companyLogoUrl && <img src={companyLogoUrl} alt="Company logo preview" className="h-10 w-10 rounded-lg border border-slate-300 object-contain dark:border-slate-700" />}
                <label className="cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-[11px] font-semibold dark:border-slate-700">
                  Add small banner logo
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => handleCompanyLogoUpload(event.target.files?.[0])} />
                </label>
                {companyLogoUrl && <button type="button" onClick={() => setCompanyLogoUrl('')} className="text-[11px] font-semibold text-rose-500">Remove</button>}
              </div>
              <button type="button" onClick={applyBrandingToPosts} className="mt-3 rounded-lg bg-sky-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-sky-500">Apply branding to blog queue</button>
            </div>

            <div className={`${activeSection === 'setup' ? '' : 'hidden'} rounded-xl border border-sky-500/20 bg-sky-500/5 p-3`}>
              <p className="text-xs font-black">Campaign Banner (Global)</p>
              <p className="mt-1 text-[11px] text-slate-500">Set a global banner for all generated posts or upload a custom one.</p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="text"
                  value={campaignBannerUrl}
                  onChange={(e) => setCampaignBannerUrl(e.target.value)}
                  placeholder="Banner Image URL (PNG/JPG/WebP)"
                  className={`flex-1 rounded-lg border p-2.5 text-xs outline-none ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-900'}`}
                />
                <label className="shrink-0 cursor-pointer rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-bold text-white hover:bg-slate-700">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setCampaignBannerUrl(reader.result);
                          addLog('system', 'success', 'Banner Attached', `Local campaign banner attached: ${file.name}`);
                        }
                      };
                      reader.onerror = () => {
                        setStatusMessage('Failed to read campaign banner file.');
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              </div>
              {campaignBannerUrl && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-700 aspect-[21/9]">
                  <img src={campaignBannerUrl} className="w-full h-full object-cover" alt="Campaign Banner Preview" />
                </div>
              )}
            </div>

            <div className={activeSection === 'setup' ? '' : 'hidden'}>
              <label className="block text-xs font-bold">Blog type</label>
              <select value={blogType} onChange={(event) => handleBlogTypeChange(event.target.value as BlogType)} className={`mt-1 w-full rounded-lg border p-2.5 text-xs ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-300 bg-white text-slate-900'}`}>
                <option value="airlines">Airlines &amp; flights</option>
                <option value="travel">Travel services</option>
                <option value="hotels">Hotels &amp; hospitality</option>
                <option value="agency">SEO agency client</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Step 2 changes to a blank manager for non-airline projects so you can add your own entries and locations.</p>
            </div>

            {/* Common TFN Number Input */}
            <div className={activeSection === 'setup' ? '' : 'hidden'}>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-bold">
                  Common Toll-Free Number (TFN)
                </label>
                <button
                  onClick={() => setCommonTfn('+1 (888) 794-3464')}
                  className="text-sky-600 dark:text-sky-400 hover:underline text-[11px]"
                >
                  Reset Default (+1 888 794 3464)
                </button>
              </div>

              <input
                type="text"
                value={commonTfn}
                onChange={(e) => setCommonTfn(e.target.value)}
                placeholder="+1 (888) 794-3464"
                className={`w-full text-sm font-bold rounded-lg p-2.5 border outline-none ${
                  isDarkMode 
                    ? 'bg-slate-950 border-slate-800 text-emerald-400 focus:border-emerald-500' 
                    : 'bg-slate-50 border-slate-300 text-emerald-700 focus:border-emerald-500'
                }`}
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Embedded across all blog headlines, callout buttons, and contact tables.
              </span>
            </div>

            {/* Keyword / Topic Input with Web Grounding */}
            <div className={activeSection === 'setup' ? '' : 'hidden'}>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="font-bold">Target Keyword / Topic</label>
                <label className="flex items-center gap-1 cursor-pointer text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                  <input
                    type="checkbox"
                    checked={isWebGroundingEnabled}
                    onChange={(e) => setIsWebGroundingEnabled(e.target.checked)}
                    className="w-3 h-3 rounded"
                  />
                  <span>Web Grounding &amp; Fast Indexing</span>
                </label>
              </div>
              <input
                type="text"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="Office Location, Contact Number & Flight Reservations"
                className={`w-full text-xs rounded-lg p-2.5 border outline-none ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Automatically adapts to each selected airline and airport city.
              </span>
            </div>

            {/* Target Blogger ID Input */}
            <div className={activeSection === 'setup' ? '' : 'hidden'}>
              <label className="block text-xs font-bold mb-1">Target Blogger Blog ID</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  placeholder="Enter Blogger Blog ID"
                  className={`w-full text-xs font-mono rounded-lg p-2 border outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
                <a
                  href={`https://www.blogger.com/blog/posts/${blogId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                >
                  Blogger <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Airline Selector Header */}
            <div className={`${activeSection === 'airlines' ? '' : 'hidden'} pt-3 border-t space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">Select {entryLabelPlural}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                    {selectedAirlines.length} / {airlines.length} selected
                  </span>
                </div>
                <button
                  onClick={() => handleSelectAll(selectedAirlines.length !== airlines.length)}
                  className={`text-[11px] font-semibold px-2 py-1 rounded border transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  {selectedAirlines.length === airlines.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Quick filter ${entryLabelPlural.toLowerCase()}...`}
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className={`w-full text-xs rounded-lg pl-8 pr-3 py-2 border outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              {/* Entry Grid */}
              <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1.5 rounded-xl border ${
                isDarkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                {filteredAirlines.map((airline: AirlineItem) => (
                  <label
                    key={airline.id}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                      airline.selected
                        ? (isDarkMode ? 'bg-sky-950/40 border-sky-500/50 text-white' : 'bg-sky-50 border-sky-300 text-sky-900')
                        : (isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!airline.selected}
                      onChange={() => toggleAirlineSelection(airline.id)}
                      className="rounded border-slate-400 text-sky-600 focus:ring-0 w-3.5 h-3.5"
                    />
                    <div className="truncate flex-1">
                      <span className="font-medium truncate block">{airline.name}</span>
                      <span className="text-[10px] text-slate-500">{airline.offices.length} locations</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 flex-1 justify-center ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Manage {entryLabelPlural} ({airlines.length})
                </button>

                <button
                  onClick={handleGenerateBulkPosts}
                  disabled={isGeneratingBulk}
                  className={`px-3 py-2.5 rounded-xl border font-semibold text-xs transition flex items-center gap-1.5 flex-1 justify-center ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                  title="Generate base template drafts without using AI tokens"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBulk && !bulkProgress ? 'animate-spin' : ''}`} />
                  {isGeneratingBulk && !bulkProgress ? 'Creating...' : 'Create draft'}
                </button>

                <button
                  onClick={handleGenerateBulkAI}
                  disabled={isGeneratingBulk || selectedAirlines.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 flex-1 justify-center shadow"
                  title="Generate unique, human-grade SEO articles using AI"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingBulk && bulkProgress ? 'animate-spin' : ''}`} />
                  {isGeneratingBulk && bulkProgress ? 'Writing...' : '✨ Generate with AI'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTemplatePickerModal(true)}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 flex-1 justify-center flex items-center gap-1.5"
                  title="Choose from master templates or saved drafts with live preview"
                >
                  <FileCode className="w-3.5 h-3.5 text-violet-500" />
                  <span>Drafts &amp; Templates</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateWithWorkflow}
                  disabled={isGeneratingBulk}
                  className="px-3 py-2.5 rounded-xl border border-violet-300 bg-violet-500/10 hover:bg-violet-500/20 text-violet-700 dark:text-violet-300 text-xs font-bold transition disabled:opacity-50 flex-1 justify-center flex items-center gap-1.5"
                  title="Trigger automated n8n workflow: saves pending request to requests table, executes n8n, and loads generated blog"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span>{isGeneratingBulk ? 'Triggering...' : '⚡ Run n8n Workflow'}</span>
                </button>
                {workflowRequestId && (
                  <button
                    type="button"
                    onClick={async () => {
                      setStatusMessage('Checking for workflow output manually...');
                      const blogs = await getBlogsForRequest(workflowRequestId);
                      if (blogs.length) {
                        setStatusMessage('Found generated blog! Loading into queue...');
                        // (Re-use logic from handleGenerateWithWorkflow if possible or trigger a refresh)
                        void handleGenerateWithWorkflow(); 
                      } else {
                        setStatusMessage('No blog found yet. Wait for n8n or check Step 5 logs.');
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition ${isDarkMode ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
                    title="Manually check if n8n has finished and saved the blog to Supabase"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowN8nWorkflowModal(true)}
                  className={`p-2.5 rounded-xl border transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
                  title="n8n Connection Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              <div
                className={`${activeSection === 'setup' ? '' : 'hidden'} rounded-xl border-2 border-dashed p-4 transition ${
                  isDarkMode ? 'border-slate-700 bg-slate-950/60' : 'border-slate-300 bg-slate-50'
                }`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => { event.preventDefault(); addCustomImages(event.dataTransfer.files); }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold">Banner image library</p>
                    <p className="text-[11px] text-slate-500">Select an existing DATA bucket image or upload a local banner. It is converted to a public URL before Blogger publishing.</p>
                  </div>
                  <label className="shrink-0 cursor-pointer rounded-lg bg-sky-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-sky-500">
                    {isUploadingImages ? 'Uploading...' : 'Upload images'}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => {
                      if (event.target.files) addCustomImages(event.target.files);
                      event.currentTarget.value = '';
                    }} />
                  </label>
                </div>
                {customImages.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {customImages.map((src, index) => (
                      <div key={`${src.slice(0, 20)}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                        <img src={src} alt={`Custom blog image ${index + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removeCustomImage(index)} className="absolute right-1 top-1 rounded-full bg-slate-950/75 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100" aria-label="Remove image">×</button>
                      </div>
                    ))}
                  </div>
                )}
                {imageLibrary.length > 0 && (
                  <>
                    <p className="mt-4 text-[11px] font-bold text-slate-500">Public image library</p>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {imageLibrary.map((src, index) => (
                        <button
                          key={`${src}-${index}`}
                          type="button"
                          onClick={() => {
                            setCustomImages(current => current.includes(src) ? current : [...current, src]);
                          }}
                          className={`aspect-square overflow-hidden rounded-lg border-2 ${customImages.includes(src) ? 'border-emerald-500' : 'border-transparent'}`}
                          title="Use this image for generated blogs"
                        >
                          <img src={src} alt={`Library image ${index + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {isLoadingImageLibrary && <p className="mt-3 text-[11px] text-sky-600 dark:text-sky-400">Loading images from the public DATA library...</p>}
                {imageLibrary.length === 0 && !isUploadingImages && !isLoadingImageLibrary && (
                  <p className="mt-3 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-300">
                    No public images were returned. Configure the Supabase anon key for listing or use Upload images.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    void refreshImageLibrary();
                  }}
                  className="mt-3 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                >
                  Refresh public image library
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* STEP 4: Full-Width End-to-End Drafts & Templates Manager */}
        <section className={`${activeSection === 'drafts' ? '' : 'hidden'} w-full max-w-6xl mx-auto`}>
          <TemplateDraftManager
            savedTemplates={savedTemplates}
            onSaveTemplate={(tpl) => {
              const updated = [tpl, ...savedTemplates.filter(item => item.id !== tpl.id)];
              setSavedTemplates(updated);
              try {
                localStorage.setItem('easyflight_saved_templates', JSON.stringify(updated));
              } catch (e) {
                console.warn('Could not save template locally:', e);
              }
            }}
            onDeleteTemplate={(id) => {
              const updated = savedTemplates.filter(item => item.id !== id);
              setSavedTemplates(updated);
              try {
                localStorage.setItem('easyflight_saved_templates', JSON.stringify(updated));
              } catch (e) {
                console.warn('Could not save templates locally:', e);
              }
            }}
            generatedPosts={generatedPosts}
            onApplyTemplateToQueue={applySourceToSelectedEntries}
            supabaseDrafts={supabaseDrafts}
            onRefreshSupabaseDrafts={() => void refreshSupabaseDrafts()}
            isLoadingSupabase={isLoadingSupabaseDrafts}
            isDarkMode={isDarkMode}
            selectedEntityCount={selectedAirlines.length || airlines.length}
            entityLabel={entryLabel}
          />
        </section>

        <section className={`${activeSection === 'history' ? '' : 'hidden'} w-full max-w-6xl mx-auto`}>
          <LogsHistoryManager
            posts={generatedPosts}
            logs={activityLogs}
            isDarkMode={isDarkMode}
            onPublishSinglePost={handlePublishSinglePost}
            onPublishSelected={(ids) => {
              const selected = generatedPosts.filter(p => ids.includes(p.id));
              // Bulk publish logic
              setStatusMessage(`Starting bulk publish for ${selected.length} posts...`);
              handlePublishAllVerified();
            }}
            onDeletePosts={(ids) => {
              const updated = generatedPosts.filter(p => !ids.includes(p.id));
              setGeneratedPosts(updated);
              addLog('system', 'warning', 'Posts Deleted', `Removed ${ids.length} posts from history.`);
            }}
            onClearLogs={() => {
              setActivityLogs([]);
              localStorage.removeItem('easyflight_activity_logs');
            }}
            onSelectPostToReview={(idx) => {
              setCurrentPostIndex(idx);
              setActiveSection('review');
            }}
          />
        </section>

        {/* RIGHT COLUMN: Live Review Studio & Non-Technical Easy Editor */}
        <div id="review-queue" className={`${activeSection === 'review' ? '' : 'hidden'} w-full max-w-6xl mx-auto border rounded-2xl p-3 sm:p-5 shadow-sm flex flex-col justify-between space-y-4 transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div>
            
            {/* Top Queue Bar & View Selector */}
            <div className={`flex flex-wrap items-center justify-between pb-3 border-b gap-2 ${
              isDarkMode ? 'border-slate-800' : 'border-slate-200'
            }`}>
              
              {/* Queue Mode vs Simulator Mode Toggle */}
              <div className="flex items-center gap-2">
                <div className={`flex items-center p-0.5 rounded-lg border text-xs ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
                }`}>
                  <button
                    onClick={() => setViewMode('simulator')}
                    className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition ${
                      viewMode === 'simulator' 
                        ? 'bg-sky-600 text-white font-bold shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Live Simulator ({currentPostIndex + 1}/{generatedPosts.length || 1})
                  </button>
                  <button
                    onClick={() => setViewMode('queue')}
                    className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition ${
                      viewMode === 'queue' 
                        ? 'bg-sky-600 text-white font-bold shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    Review All ({generatedPosts.length}) Posts
                  </button>
                </div>

                {viewMode === 'simulator' && activePost && (
                  <span className="text-xs font-semibold truncate max-w-[150px] hidden sm:inline">
                    {activePost.airlineName} • {activePost.city}
                  </span>
                )}
              </div>

              {/* Stepper & View Mode Tabs (When in simulator mode) */}
              {viewMode === 'simulator' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPostIndex(Math.max(0, currentPostIndex - 1))}
                    disabled={currentPostIndex === 0}
                    className={`p-1 rounded border disabled:opacity-40 transition ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                    }`}
                    title="Previous Post"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono px-1">
                    {currentPostIndex + 1} / {generatedPosts.length || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPostIndex(Math.min(generatedPosts.length - 1, currentPostIndex + 1))}
                    disabled={currentPostIndex >= generatedPosts.length - 1}
                    className={`p-1 rounded border disabled:opacity-40 transition ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'
                    }`}
                    title="Next Post"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className={`flex items-center p-0.5 rounded-lg border text-xs ml-1 ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
                  }`}>
                    <button
                      onClick={() => setReviewTab('visual')}
                      className={`px-2 py-1 rounded font-medium transition ${
                        reviewTab === 'visual' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Visual Preview
                    </button>
                    <button
                      onClick={() => setReviewTab('form')}
                      className={`px-2 py-1 rounded font-medium transition ${
                        reviewTab === 'form' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Easy Editor
                    </button>
                    <button
                      onClick={() => setReviewTab('settings')}
                      className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition ${
                        reviewTab === 'settings' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Labels, Permalink, Geolocation & Search Description"
                    >
                      <Sliders className="w-3 h-3" />
                      Blogger Sub-Settings
                    </button>
                    <button
                      onClick={() => setReviewTab('raw')}
                      className={`px-2 py-1 rounded font-medium transition ${
                        reviewTab === 'raw' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Raw HTML
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Banner */}
            {statusMessage && (
              <div className="mt-3 p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs text-sky-800 dark:text-sky-300 flex items-center justify-between">
                <span>{statusMessage}</span>
                <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕</button>
              </div>
            )}

            {viewMode === 'queue' ? (
              <div className="mt-3">
                <ReviewQueueManager
                  posts={generatedPosts}
                  currentIndex={currentPostIndex}
                  onSelectPost={(idx) => {
                    setCurrentPostIndex(idx);
                    setViewMode('simulator');
                  }}
                  onToggleVerifyPost={handleToggleVerifyPost}
                  onVerifyAll={handleVerifyAll}
                  onPublishSinglePost={handlePublishSinglePost}
                  onPublishAllVerified={handlePublishAllVerified}
                  onDownloadBanner={(url, title) => downloadBannerImage(url, title)}
                  isPublishingBulk={isPublishing && !!bulkProgress}
                  bulkProgress={bulkProgress}
                  isDarkMode={isDarkMode}
                  onCloseQueueView={() => setViewMode('simulator')}
                />
              </div>
            ) : (
              <>
                {/* Banner Quick Actions */}
                {activePost && (
                  <div className={`mt-3 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 text-xs ${
                    isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold">Headline:</span>
                      <span className="truncate max-w-sm font-medium">{activePost.title}</span>
                      {activePost.isAiGenerated ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1 shrink-0">
                          <Sparkles className="w-2.5 h-2.5" /> {aiProvider}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0" title={`This post currently uses the template skeleton. Click 'Generate with ${aiProvider}' to rewrite it with AI.`}>
                          Template Draft
                        </span>
                      )}
                    </div>
                    <div className="w-full flex items-center gap-3 pt-2 border-t border-slate-800">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={activePost.imageUrl || ''}
                          onChange={(e) => {
                            const updated = { ...activePost, imageUrl: e.target.value };
                            const newPosts = [...generatedPosts];
                            newPosts[currentPostIndex] = updated;
                            setGeneratedPosts(newPosts);
                          }}
                          placeholder="Image URL (SVG data: or https://...)"
                          className={`w-full p-1.5 border rounded text-[10px] outline-none ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-300 text-slate-700'}`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateAIPost(currentPostIndex)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded flex items-center gap-1 font-bold text-[11px] shadow-sm transition"
                          title={`Rewrite this blog post with 100% unique ${aiProvider} content`}
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Generate
                        </button>
                        <button
                          onClick={handleRegenerateBanner}
                          className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        >
                          <RefreshCw className="w-3 h-3" /> Redraw
                        </button>
                        <button
                          onClick={() => activePost && downloadBannerImage(activePost.imageUrl, activePost.title)}
                          className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                          title="Download banner"
                        >
                          <Download className="w-3 h-3" /> Save
                        </button>
                        <label className="cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-semibold text-[11px]">
                          <Upload className="w-3 h-3" />
                          <input type="file" accept="image/*" onChange={handleCustomImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Review Area */}
                <div className={`mt-3 rounded-xl border p-4 max-h-[500px] overflow-y-auto leading-relaxed ${
                  isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/70 border-slate-200'
                }`}>
                  {activePost ? (
                    reviewTab === 'visual' ? (
                      <div dangerouslySetInnerHTML={{ __html: activePost.htmlContent }} className="prose prose-sm max-w-none" />
                    ) : reviewTab === 'form' ? (
                      <div className="space-y-4 text-xs">
                        <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300">
                          <strong>Easy Editor:</strong> Change any field below. The visual preview and live article HTML will update automatically.
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold">Article Headline</label>
                            <button 
                              onClick={() => copyToClipboard(activePost.title, 'title')}
                              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[10px]"
                            >
                              {copiedKey === 'title' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                              Copy
                            </button>
                          </div>
                          <input
                            type="text"
                            value={activePost.title}
                            onChange={(e) => {
                              const updated = { ...activePost, title: e.target.value };
                              const newPosts = [...generatedPosts];
                              newPosts[currentPostIndex] = updated;
                              setGeneratedPosts(newPosts);
                            }}
                            className={`w-full p-2 border rounded-lg font-medium outline-none ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold">Alert Box Title</label>
                              <button 
                                onClick={() => copyToClipboard(activePost.sections?.urgentCalloutTitle || '', 'callout')}
                                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[10px]"
                              >
                                {copiedKey === 'callout' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                Copy
                              </button>
                            </div>
                            <input
                              type="text"
                              value={activePost.sections?.urgentCalloutTitle || ''}
                              onChange={(e) => handleUpdateSection('urgentCalloutTitle', e.target.value)}
                              className={`w-full p-2 border rounded-lg outline-none ${
                                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-bold">Office Hours</label>
                              <button 
                                onClick={() => copyToClipboard(activePost.sections?.officeHours || '', 'hours')}
                                className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[10px]"
                              >
                                {copiedKey === 'hours' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                Copy
                              </button>
                            </div>
                            <input
                              type="text"
                              value={activePost.sections?.officeHours || ''}
                              onChange={(e) => handleUpdateSection('officeHours', e.target.value)}
                              className={`w-full p-2 border rounded-lg outline-none ${
                                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold">Overview Description</label>
                            <button 
                              onClick={() => copyToClipboard(activePost.sections?.overviewPara1 || '', 'overview')}
                              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[10px]"
                            >
                              {copiedKey === 'overview' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                              Copy
                            </button>
                          </div>
                          <textarea
                            rows={3}
                            value={activePost.sections?.overviewPara1 || ''}
                            onChange={(e) => handleUpdateSection('overviewPara1', e.target.value)}
                            className={`w-full p-2 border rounded-lg outline-none ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="font-bold">Terminal Address</label>
                            <button 
                              onClick={() => copyToClipboard(activePost.sections?.officeAddress || '', 'address')}
                              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[10px]"
                            >
                              {copiedKey === 'address' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                              Copy
                            </button>
                          </div>
                          <input
                            type="text"
                            value={activePost.sections?.officeAddress || ''}
                            onChange={(e) => handleUpdateSection('officeAddress', e.target.value)}
                            className={`w-full p-2 border rounded-lg outline-none ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-800'
                            }`}
                          />
                        </div>

                        {/* FAQ Items */}
                        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">Frequently Asked Questions (FAQ)</span>
                            <button
                              onClick={handleAddFaq}
                              className="text-xs text-sky-600 dark:text-sky-400 font-semibold flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Question
                            </button>
                          </div>

                          {activePost.sections?.faqs.map((faq: { question: string; answer: string }, idx: number) => (
                            <div key={idx} className={`p-3 rounded-lg border space-y-2 ${
                              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-300'
                            }`}>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-500">Question #{idx + 1}</span>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => copyToClipboard(`Q: ${faq.question}\nA: ${faq.answer}`, `faq-${idx}`)}
                                    className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 text-[10px]"
                                  >
                                    {copiedKey === `faq-${idx}` ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                                    Copy
                                  </button>
                                  <button onClick={() => handleDeleteFaq(idx)} className="text-rose-500 hover:text-rose-600">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => handleUpdateFaq(idx, e.target.value, faq.answer)}
                                className={`w-full p-1.5 border rounded text-xs outline-none ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                                }`}
                              />
                              <textarea
                                rows={2}
                                value={faq.answer}
                                onChange={(e) => handleUpdateFaq(idx, faq.question, e.target.value)}
                                className={`w-full p-1.5 border rounded text-xs outline-none ${
                                  isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                                }`}
                              />
                            </div>
                          ))}
                        </div>

                      </div>
                    ) : reviewTab === 'settings' ? (
                      <BloggerSubSettingsTab
                        post={activePost}
                        onUpdateBloggerSettings={handleUpdateBloggerSettings}
                        isDarkMode={isDarkMode}
                      />
                    ) : (
                      <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-300 whitespace-pre-wrap">
                        <code>{activePost.htmlContent}</code>
                      </pre>
                    )
                  ) : (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No post selected. Click "Generate Bulk Blogs" on the left.
                    </div>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Action Footer */}
          <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDarkMode ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">
                Target Blog: <code className="text-sky-600 dark:text-sky-400 font-mono font-bold">{blogId}</code>
              </span>
              {activePost?.publishedUrl && (
                <a
                  href={activePost.publishedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline flex items-center gap-1 font-semibold"
                >
                  <ExternalLink className="w-3 h-3" /> Live Post
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => activePost && copyToClipboard(activePost.htmlContent, 'copied')}
                className={`px-3.5 py-2 rounded-xl font-semibold border transition flex items-center gap-1.5 ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200' : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                }`}
              >
                {copiedKey === 'copied' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy HTML
              </button>

              <button
                onClick={handlePublishToBlogger}
                disabled={isPublishing || !activePost}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition flex items-center gap-2 shadow"
              >
                {isPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publish to Blogger (Auto)
              </button>
            </div>
          </div>

        </div>

        <div className={`mx-auto mt-5 flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border p-3 sm:p-4 ${isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <button type="button" onClick={() => goToWorkflowStep(-1)} disabled={activeSection === workflowSteps[0]} className="rounded-xl border px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40">
            <ChevronLeft className="mr-1 inline h-4 w-4" /> Previous
          </button>
          <span className="text-center text-[11px] font-bold text-slate-500">
            Step {workflowSteps.indexOf(activeSection) + 1} of {workflowSteps.length}
          </span>
          <button type="button" onClick={() => goToWorkflowStep(1)} disabled={activeSection === workflowSteps[workflowSteps.length - 1]} className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            Next <ChevronRight className="ml-1 inline h-4 w-4" />
          </button>
        </div>
      </main>

      {/* Website, Portals, Social & Custom Links Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                Website, Portals &amp; Social Links (Optional)
              </h3>
              <button onClick={() => setShowSocialModal(false)} className="text-slate-400 hover:text-slate-600 text-xs">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Add your official website, customer support portals, chat links, social profiles, or any custom URLs. When filled, branded badges automatically embed in your blog articles.
            </p>

            {/* Official Website & Support Portals */}
            <div className="space-y-3 pt-1">
              <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Official Websites &amp; Contact Portals
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-slate-400" /> Official Website URL
                </label>
                <input
                  type="text"
                  placeholder="https://easyflightconnect.com"
                  value={socialLinks.website || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                  className={`w-full p-2 border rounded-lg text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <LifeBuoy className="w-3 h-3 text-slate-400" /> Support / Help Center URL
                </label>
                <input
                  type="text"
                  placeholder="https://easyflightconnect.com/support"
                  value={socialLinks.supportUrl || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, supportUrl: e.target.value })}
                  className={`w-full p-2 border rounded-lg text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
                  <MessageCircle className="w-3 h-3 text-slate-400" /> WhatsApp Live Chat URL
                </label>
                <input
                  type="text"
                  placeholder="https://wa.me/18887943464"
                  value={socialLinks.whatsapp || ''}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  className={`w-full p-2 border rounded-lg text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Social Media Profiles */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Social Media Channels
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Facebook</label>
                  <input
                    type="text"
                    placeholder="https://facebook.com/..."
                    value={socialLinks.facebook || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                    className={`w-full p-2 border rounded-lg text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">X (Twitter)</label>
                  <input
                    type="text"
                    placeholder="https://x.com/..."
                    value={socialLinks.twitter || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                    className={`w-full p-2 border rounded-lg text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Instagram</label>
                  <input
                    type="text"
                    placeholder="https://instagram.com/..."
                    value={socialLinks.instagram || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                    className={`w-full p-2 border rounded-lg text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">YouTube</label>
                  <input
                    type="text"
                    placeholder="https://youtube.com/@..."
                    value={socialLinks.youtube || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                    className={`w-full p-2 border rounded-lg text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">LinkedIn</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/company/..."
                    value={socialLinks.linkedin || ''}
                    onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                    className={`w-full p-2 border rounded-lg text-xs outline-none ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Custom User-Added Links */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center justify-between">
                <span>Custom Brand &amp; Resource Links</span>
                <span className="text-[10px] text-slate-400 font-normal">Add unlimited custom links</span>
              </div>

              {socialLinks.customLinks && socialLinks.customLinks.length > 0 && (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {socialLinks.customLinks.map((item: CustomLinkItem) => (
                    <div key={item.id} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs ${
                      isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="truncate flex-1 pr-2">
                        <span className="font-semibold">{item.label}: </span>
                        <span className="text-slate-400 truncate text-[11px]">{item.url}</span>
                      </div>
                      <button onClick={() => handleDeleteCustomLink(item.id)} className="text-rose-500 hover:text-rose-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Link Form */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Button Label (e.g. Booking Portal)"
                  value={customLinkLabel}
                  onChange={(e) => setCustomLinkLabel(e.target.value)}
                  className={`w-1/3 p-2 border rounded-lg text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="URL (https://...)"
                  value={customLinkUrl}
                  onChange={(e) => setCustomLinkUrl(e.target.value)}
                  className={`flex-1 p-2 border rounded-lg text-xs outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddCustomLink}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            <button
              onClick={handleSaveLinksAndApply}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition shadow mt-3"
            >
              Save &amp; Apply All Links to Blog
            </button>
          </div>
        </div>
      )}

      {/* Template Picker Modal for Step 2 */}
      <TemplatePickerModal
        isOpen={showTemplatePickerModal}
        onClose={() => setShowTemplatePickerModal(false)}
        onApplyTemplate={(tpl) => {
          applySourceToSelectedEntries(tpl);
        }}
        customTemplates={savedTemplates}
        supabaseDrafts={supabaseDrafts}
        isDarkMode={isDarkMode}
        selectedEntityCount={selectedAirlines.length || airlines.length}
        entityLabel={entryLabel}
        onOpenFullManager={() => {
          setShowTemplatePickerModal(false);
          setActiveSection('drafts');
        }}
      />

      {/* Airline Manager Modal */}
      <AirlineManagerModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        airlines={airlines}
        onSave={(updated) => setAirlines(updated)}
        isDarkMode={isDarkMode}
        entityLabel={entryLabel}
        activeBlogType={blogType}
        onChangeBlogType={handleBlogTypeChange}
      />

      {/* Google Refresh Token Modal */}
      <RefreshTokenModal
        isOpen={showRefreshTokenModal}
        onClose={() => setShowRefreshTokenModal(false)}
        isDarkMode={isDarkMode}
        currentToken={customRefreshToken}
        onSave={(token) => {
          setCustomRefreshToken(token);
          if (token) {
            localStorage.setItem('easyflight_google_refresh_token', token);
          } else {
            localStorage.removeItem('easyflight_google_refresh_token');
          }
          setStatusMessage(token ? 'Google Refresh Token saved!' : 'Google Refresh Token cleared.');
          setTimeout(() => setStatusMessage(null), 3000);
        }}
      />
      <InactivityLockModal
        isOpen={isSessionLocked}
        onUnlock={() => {
          setIsSessionLocked(false);
          lastActivityRef.current = Date.now();
        }}
        onFullLogout={handleFullLogout}
        isDarkMode={isDarkMode}
      />

      {/* AI Provider Modal */}
      <AiProviderModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        isDarkMode={isDarkMode}
        onSaved={(msg) => {
          setStatusMessage(msg);
          setDeepSeekKey(getDeepSeekApiKey());
          setGeminiKey(getGeminiApiKey());
          setProvider(getAiProvider());
          addLog('system', 'success', 'AI Config Updated', msg);
          setTimeout(() => setStatusMessage(null), 3000);
        }}
      />

      {/* Publishing Security Modal */}
      <PublishingSecurityModal
        isOpen={showPublishingSecurityModal}
        onClose={() => setShowPublishingSecurityModal(false)}
        isDarkMode={isDarkMode}
        publishSecret={publishSecret}
        onSave={(secret) => {
          setPublishSecret(secret);
          if (secret) {
            localStorage.setItem('easyflight_publish_secret', secret);
            addLog('system', 'success', 'Security Configured', 'Custom publish secret has been set.');
          } else {
            localStorage.removeItem('easyflight_publish_secret');
            addLog('system', 'info', 'Security Reset', 'Using default built-in dashboard auth.');
          }
          setStatusMessage(secret ? 'Publish Secret saved!' : 'Auto-authorization enabled.');
          setTimeout(() => setStatusMessage(null), 3000);
        }}
      />

      {/* n8n Workflow Modal */}
      <N8nWorkflowModal
        isOpen={showN8nWorkflowModal}
        onClose={() => setShowN8nWorkflowModal(false)}
        isDarkMode={isDarkMode}
        n8nWebhookUrl={n8nWebhookUrl}
        onChangeN8nWebhookUrl={(url) => {
          setN8nWebhookUrl(url);
          localStorage.setItem('easyflight_n8n_webhook', url);
        }}
        n8nMcpUrl={n8nMcpUrl}
        onChangeN8nMcpUrl={(url) => {
          setN8nMcpUrl(url);
          localStorage.setItem('easyflight_n8n_mcp', url);
        }}
        n8nApiKey={n8nApiKey}
        onChangeN8nApiKey={(key) => {
          setN8nApiKey(key);
          localStorage.setItem('easyflight_n8n_apikey', key);
          addLog('system', 'success', 'n8n API Key Updated', 'New n8n API key saved.');
        }}
        supabaseCustomKey={supabaseCustomKey}
        onChangeSupabaseCustomKey={(key) => {
          setSupabaseCustomKey(key);
          localStorage.setItem('easyflight_supabase_service_key', key);
          addLog('supabase', 'success', 'Service Key Updated', 'Custom Supabase service key saved.');
        }}
      />

      {/* Footer with Developer Credits and Social Icons */}
      <footer className={`border-t py-3 px-6 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
      }`}>
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <span>TFN Active:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{commonTfn}</span>
        </div>

        {/* Developer Attribution & Clean Icons (No app name mentioned) */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">Developed by Shashank Rajput</span>
          <div className="flex items-center gap-2 ml-1">
            <a
              href="https://mail.google.com/mail/u/0/?fs=1&to=aws.shashanksingh@gmail.com&tf=cm"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-sky-600 transition"
              title="Email"
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.linkedin.com/in/shashankrajputx/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
              title="LinkedIn"
            >
              <Linkedin className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://www.instagram.com/shashankrajput.__/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition"
              title="Instagram"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <button
          onClick={handleFullLogout}
          className="text-slate-500 hover:text-rose-500 flex items-center gap-1 text-[11px] font-semibold transition"
          title="Sign out of Studio"
        >
          <LogOut className="w-3 h-3" />
          <span>Lock / Exit</span>
        </button>
      </footer>

    </div>
  );
}
