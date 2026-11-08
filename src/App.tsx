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
  Download
} from 'lucide-react';
import { 
  TARGET_BLOGGER_ID, 
  TARGET_BLOG_URL,
  downloadBannerImage
} from './services/drive';
import { DEFAULT_AIRLINES } from './data/defaultAirlines';
import { AirlineItem, AirlineOffice, GeneratedPost, SocialLinks, PostSections, CustomLinkItem, BloggerSubSettings } from './types/airline';
import { 
  generateOfficeBlogPost, 
  generateOfficeBannerSvg,
  buildHtmlFromSections 
} from './services/blogGenerator';
import { getCoordinatesForCity } from './data/cityCoordinates';
import { AirlineManagerModal } from './components/AirlineManagerModal';
import { LoginPage } from './components/LoginPage';
import { InactivityLockModal } from './components/InactivityLockModal';
import { ReviewQueueManager } from './components/ReviewQueueManager';
import { BloggerSubSettingsTab } from './components/BloggerSubSettingsTab';
import { RefreshTokenModal } from './components/RefreshTokenModal';
import { PublicLandingPage } from './components/PublicLandingPage';
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
import {
  getRecentPosts,
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
    try { return JSON.parse(localStorage.getItem('easyflight_session_draft') || '{}').companyName || ''; } catch { return ''; }
  });
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_session_draft') || '{}').companyLogoUrl || ''; } catch { return ''; }
  });
  const [activeSection, setActiveSection] = useState<'setup' | 'airlines' | 'drafts' | 'review' | 'history'>('setup');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);

  const [isWebGroundingEnabled, setIsWebGroundingEnabled] = useState(true);

  // Social & Custom Portal Links
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(() => {
    const saved = localStorage.getItem('easyflight_session_draft');
    if (saved) {
      try { return JSON.parse(saved).socialLinks || {}; } catch (e) { /* ignore */ }
    }
    return {
      website: '',
      supportUrl: '',
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
    const saved = localStorage.getItem('easyflight_airlines');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_AIRLINES;
  });

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [airlineFilter, setAirlineFilter] = useState('');
  const [customImages, setCustomImages] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_custom_images') || '[]'); } catch { return []; }
  });
  const [imageLibrary, setImageLibrary] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<GeneratedPost[]>(() => {
    try { return JSON.parse(localStorage.getItem('easyflight_saved_templates') || '[]'); } catch { return []; }
  });

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
              : generateOfficeBannerSvg(p.airlineName, p.officeName, p.city, p.tfnNumber, theme, p.companyName || companyName, p.companyLogoUrl || companyLogoUrl);

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
    return !query || [post.title, post.keyword, post.airlineName, post.status, post.publishedUrl || ''].some(value => value.toLowerCase().includes(query));
  });
  const copyHistoryLinks = () => {
    const selected = filteredHistoryPosts.filter(post => selectedHistoryIds.includes(post.id));
    const posts = selected.length ? selected : filteredHistoryPosts;
    void navigator.clipboard.writeText(posts.map(post => post.publishedUrl || post.title).join('\n'));
    setStatusMessage(`${posts.length} history items copied.`);
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
  }, [blogId, commonTfn, targetKeyword, companyName, companyLogoUrl, socialLinks, currentPostIndex, generatedPosts]);

  // Safely persist airlines to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('easyflight_airlines', JSON.stringify(airlines));
    } catch (e) {
      console.warn('Could not save airlines to localStorage:', e);
    }
  }, [airlines]);

  useEffect(() => {
    try { localStorage.setItem('easyflight_custom_images', JSON.stringify(customImages.filter(url => !url.startsWith('data:')))); }
    catch (error) { console.warn('Could not save custom images locally:', error); }
  }, [customImages]);

  useEffect(() => {
    Promise.all([listPublicBucketImages('Airlines'), listPublicBucketImages('Blog')])
      .then(([airlineImages, blogImages]) => setImageLibrary([...new Set([...airlineImages, ...blogImages])]))
      .catch(error => console.warn('Could not load public image library:', error));
  }, []);

  useEffect(() => {
    localStorage.setItem('easyflight_saved_templates', JSON.stringify(savedTemplates));
  }, [savedTemplates]);

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
              companyLogoUrl
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
        companyLogoUrl
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

  const addCustomImages = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (!imageFiles.length) return;
    setIsUploadingImages(true);
    try {
      const uploaded = await Promise.all(imageFiles.map(async file => {
        try {
          return await uploadImageToPublicBucket(file, file.name);
        } catch (error) {
          const localUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not preview image.'));
            reader.onerror = () => reject(error);
            reader.readAsDataURL(file);
          });
          setStatusMessage('Storage upload failed; using a local preview. Configure Supabase storage before publishing.');
          return localUrl;
        }
      }));
      setCustomImages(current => [...current, ...uploaded]);
      setImageLibrary(current => [...current, ...uploaded]);
    } catch (error) {
      console.error('Image upload failed:', error);
      setStatusMessage(error instanceof Error ? error.message : 'Image upload failed.');
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

  const saveActiveAsTemplate = () => {
    if (!activePost) return;
    const name = prompt('Name this reusable draft template:', `${activePost.airlineName} ${activePost.keyword}`);
    if (!name?.trim()) return;
    setSavedTemplates(current => [{ ...activePost, id: `template-${Date.now()}`, status: 'Draft' }, ...current]);
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

  const createBlankDraft = () => {
    if (!selectedAirlines[0]) {
      setStatusMessage('Select an airline before creating a draft.');
      return;
    }
    const office = selectedAirlines[0].offices[0] || {
      id: `${selectedAirlines[0].id}-draft`,
      name: `${selectedAirlines[0].name} Office`,
      city: 'Headquarters',
      country: 'United States'
    };
    const draft = generateOfficeBlogPost(selectedAirlines[0], office, targetKeyword, commonTfn, customImages[0], socialLinks, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl);
    draft.status = 'Draft';
    setGeneratedPosts(current => [...current, draft]);
    setCurrentPostIndex(generatedPosts.length);
    setStatusMessage('Blank editable draft added to the review queue.');
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
          companyLogoUrl
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
      setStatusMessage(`AI Generation Complete for ${post.airlineName}!`);
    } catch (error) {
      console.error('AI Generation failed:', error);
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
          companyLogoUrl
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

    setIsGeneratingBulk(false);
    setBulkProgress(null);
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
    if (!post.imageUrl.startsWith('data:')) return post;
    const response = await fetch(post.imageUrl);
    const blob = await response.blob();
    const publicUrl = await uploadImageToPublicBucket(blob, `${post.airlineName}-${post.city}-blog.png`);
    return {
      ...post,
      imageUrl: publicUrl,
      htmlContent: post.htmlContent.replace(/src="data:image\/[^"]+"/, `src="${publicUrl}"`)
    };
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
      companyLogoUrl
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
        ? generateOfficeBannerSvg(post.airlineName, post.officeName, post.city, post.tfnNumber, isDarkMode ? 'dark' : 'light', companyName, companyLogoUrl)
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

  // Upload custom banner
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activePost) return;
    const file = e.target.files[0];
    void uploadImageToPublicBucket(file, file.name).then(imageUrl => {
      setCustomImages(current => [...current, imageUrl]);
      setImageLibrary(current => [...current, imageUrl]);
      setGeneratedPosts(posts => posts.map(post => rebuildPost(
        post,
        post.sections || activePost.sections!,
        imageUrl
      )));
    }).catch(error => {
      console.error('Image upload failed:', error);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') return;
        setCustomImages(current => [...current, reader.result as string]);
        setGeneratedPosts(posts => posts.map(post => rebuildPost(post, post.sections || activePost.sections!, reader.result as string)));
        setStatusMessage('Storage upload failed; showing a local preview until storage is configured.');
      };
      reader.readAsDataURL(file);
    });
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
      setGeneratedPosts(posts => posts.map(post => rebuildPost(
        post,
        post.sections || activePost.sections!,
        post.imageUrl,
        socialLinks
      )));
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
          content: publishablePost.htmlContent,
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
      } else {
        if (data.code === 'REFRESH_TOKEN_EXPIRED' || data.code === 'MISSING_REFRESH_TOKEN' || data.needsConfig) {
          setShowRefreshTokenModal(true);
          setStatusMessage('Google Refresh Token expired or missing. Please paste a valid token in the modal.');
        } else {
          setStatusMessage(`Publish status: ${data.error || 'Check Blogger Author Permissions'}`);
        }
      }
    } catch (e: any) {
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
            content: publishablePost.htmlContent,
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
          <button type="button" onClick={() => setIsSidebarOpen(true)} className="rounded-lg border p-2 lg:hidden" aria-label="Open navigation">
            <Settings className="h-4 w-4" />
          </button>
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

        {/* Right Header: Service Account Badge, Theme Switcher, Website/Social Links, Account, Lock */}
        <div className="flex items-center gap-3">
          
          {/* Public Landing Page & Policies Button */}
          <button
            onClick={() => setShowPublicPage(true)}
            hidden
            className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-400' 
                : 'bg-white hover:bg-slate-100 border-slate-300 text-sky-700 shadow-sm'
            }`}
            title="View Public Landing Page, Google Verification Info & Policies"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-semibold">Public Site</span>
          </button>
          
          {/* Connection Status Badge (Clickable to inspect/update token) */}
          <button
            onClick={() => setShowRefreshTokenModal(true)}
            hidden
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
            isBackendConnected
              ? isDarkMode
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-950/60'
                : 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
              : isDarkMode
                ? 'bg-amber-950/40 border-amber-800 text-amber-400 hover:bg-amber-950/60'
                : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
          }`}
            title="Click to view or update Google Blogger Refresh Token"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isBackendConnected ? 'Google Connected' : 'Google Token Needed'}</span>
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </button>

          {/* Google Refresh Token Button */}
          <button
            onClick={() => setShowRefreshTokenModal(true)}
            hidden
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              (isBackendConnected || customRefreshToken)
                ? (isDarkMode ? 'bg-amber-950/20 border-amber-800 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600')
                : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700')
            }`}
            title="Configure or refresh your Google OAuth Refresh Token"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="font-semibold">{customRefreshToken ? 'Custom Token' : 'Google Token'}</span>
          </button>

          <button type="button" onClick={() => setIsSidebarOpen(true)} className="rounded-lg border p-2" aria-label="Open workflow navigation">
            <Settings className="h-4 w-4" />
          </button>

          {/* Publish Secret Config Button */}
          <button
            onClick={() => {
              const msg = `Publishing from this dashboard is already authorized automatically!\n\nYou do NOT need to enter any PUBLISH_SECRET to publish posts.\n\n(PUBLISH_SECRET is an optional environment variable you can set in Vercel to protect your backend endpoint against external webhook abuse).\n\nCurrent Secret: ${publishSecret ? 'Configured' : 'None (Using default built-in auth)'}\n\nEnter custom secret or leave blank:`;
              const secret = prompt(msg, publishSecret);
              if (secret !== null) {
                setPublishSecret(secret.trim());
                if (secret.trim()) {
                  localStorage.setItem('easyflight_publish_secret', secret.trim());
                  setStatusMessage('Custom Publish Secret saved.');
                } else {
                  localStorage.removeItem('easyflight_publish_secret');
                  setStatusMessage('Publish Secret cleared (Using auto-authorization).');
                }
                setTimeout(() => setStatusMessage(null), 3000);
              }
            }}
            hidden
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              publishSecret
                ? (isDarkMode ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600')
                : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700')
            }`}
            title="Publishing is automatically authorized. Click for webhook info."
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="font-semibold">{publishSecret ? 'Secret Set' : 'Publish: Auto-Auth'}</span>
          </button>

          {/* AI Provider Config Button */}
          <button
            id="ai-settings"
            onClick={() => {
              const provider = (prompt('Choose AI provider: deepseek or gemini', aiProvider) || aiProvider).toLowerCase() === 'gemini' ? 'gemini' : 'deepseek';
              const key = prompt(provider === 'gemini' ? 'Enter Gemini API key (stored only in this browser)' : 'Enter DeepSeek API key (stored only in this browser)', provider === 'gemini' ? geminiKey : deepSeekKey);
              if (key !== null) {
                if (provider === 'gemini') { setGeminiApiKey(key); setGeminiKey(key); }
                else { setDeepSeekApiKey(key); setDeepSeekKey(key); }
                setAiProvider(provider);
                setProvider(provider);
                setStatusMessage(`${provider} provider selected. Keys are not stored in Supabase.`);
                setTimeout(() => setStatusMessage(null), 3000);
              }
            }}
            hidden
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
              aiProvider === 'gemini' ? geminiKey : deepSeekKey
                ? (isDarkMode ? 'bg-sky-950/20 border-sky-800 text-sky-400' : 'bg-sky-50 border-sky-200 text-sky-600')
                : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-700')
            }`}
            title="Configure AI provider API key"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-semibold">{(aiProvider === 'gemini' ? geminiKey : deepSeekKey) ? `${aiProvider} ready` : 'Set AI Key'}</span>
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
            <span className="font-semibold">{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>

          {/* Website & Social Links Button */}
          <button
            onClick={() => setShowSocialModal(true)}
            hidden
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-400' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-sky-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Website &amp; Social Links
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
      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
      <aside className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed left-0 top-0 bottom-0 z-50 w-[min(86vw,20rem)] border-r p-4 transition-transform ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="mb-5 flex items-center justify-between"><span className="text-sm font-black">Navigation</span><button type="button" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation"><ChevronLeft className="h-4 w-4" /></button></div>
        <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Workflow</p>
        <nav className="space-y-1 text-xs font-semibold">
          {([
            ['setup', '1. Setup & branding'],
            ['airlines', '2. Airlines'],
            ['drafts', '3. Drafts & templates'],
            ['review', '4. Review & publish'],
            ['history', '5. History & export']
          ] as const).map(([section, label]) => (
            <button key={section} type="button" onClick={() => { setActiveSection(section); setIsSidebarOpen(false); }} className={`block w-full rounded-lg px-3 py-2 text-left ${activeSection === section ? 'bg-sky-600 text-white' : 'hover:bg-sky-500/10 hover:text-sky-500'}`}>{label}</button>
          ))}
        </nav>
        <p className="mb-3 mt-7 px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Settings</p>
        <nav className="space-y-1 text-xs font-semibold">
          <button onClick={() => setShowRefreshTokenModal(true)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-sky-500/10 hover:text-sky-500">Google connection</button>
          <button onClick={() => {
            const provider = (prompt('Choose AI provider: deepseek or gemini', aiProvider) || aiProvider).toLowerCase() === 'gemini' ? 'gemini' : 'deepseek';
            const key = prompt(provider === 'gemini' ? 'Enter Gemini API key' : 'Enter DeepSeek API key', provider === 'gemini' ? geminiKey : deepSeekKey);
            if (key !== null) {
              if (provider === 'gemini') { setGeminiApiKey(key); setGeminiKey(key); } else { setDeepSeekApiKey(key); setDeepSeekKey(key); }
              setAiProvider(provider); setProvider(provider);
            }
          }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-sky-500/10 hover:text-sky-500">AI provider</button>
          <button onClick={() => {
            const secret = prompt('Optional publish secret', publishSecret);
            if (secret !== null) { setPublishSecret(secret.trim()); secret.trim() ? localStorage.setItem('easyflight_publish_secret', secret.trim()) : localStorage.removeItem('easyflight_publish_secret'); }
          }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-sky-500/10 hover:text-sky-500">Publishing security</button>
          <button onClick={() => setShowSocialModal(true)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-sky-500/10 hover:text-sky-500">Website & social links</button>
          <a href="https://seo-indexer-tool.vercel.app/" target="_blank" rel="noopener noreferrer" className="block rounded-lg px-3 py-2 hover:bg-sky-500/10 hover:text-sky-500">Blogger Indexer <ExternalLink className="ml-1 inline h-3 w-3" /></a>
        </nav>
      </aside>

      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 lg:pl-6">

        {/* LEFT COLUMN: Controls, TFN, Keyword, Airline Selector */}
        <div id="workspace-controls" className={`w-full max-w-6xl mx-auto space-y-4 ${activeSection === 'review' || activeSection === 'history' ? 'hidden' : ''}`}>
          
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
                  <span className="text-xs font-bold">Select Airlines</span>
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
                  placeholder="Quick filter airlines..."
                  value={airlineFilter}
                  onChange={(e) => setAirlineFilter(e.target.value)}
                  className={`w-full text-xs rounded-lg pl-8 pr-3 py-2 border outline-none ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-800'
                  }`}
                />
              </div>

              {/* Airline Grid */}
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
                      <span className="text-[10px] text-slate-500">{airline.offices.length} offices</span>
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
                  Manage Airlines ({airlines.length})
                </button>

                <button
                  onClick={handleGenerateBulkPosts}
                  disabled={isGeneratingBulk || selectedAirlines.length === 0}
                  className={`px-3 py-2.5 rounded-xl border font-semibold text-xs transition flex items-center gap-1.5 flex-1 justify-center ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                  title="Generate base template drafts without using AI tokens"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingBulk && !bulkProgress ? 'animate-spin' : ''}`} />
                  {isGeneratingBulk && !bulkProgress ? 'Synthesizing...' : 'Draft (Template)'}
                </button>

                <button
                  onClick={handleGenerateBulkAI}
                  disabled={isGeneratingBulk || selectedAirlines.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 flex-1 justify-center shadow"
                  title={`Generate 100% unique, human-grade SEO articles using ${aiProvider}`}
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingBulk && bulkProgress ? 'animate-spin' : ''}`} />
                  {isGeneratingBulk && bulkProgress ? `${aiProvider} Writing...` : `✨ Bulk AI Magic (${aiProvider})`}
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
                    <p className="text-xs font-bold">Custom Blog Images</p>
                    <p className="text-[11px] text-slate-500">Choose from the public library or upload images for new posts.</p>
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
                {imageLibrary.length === 0 && !isUploadingImages && (
                  <p className="mt-3 rounded-lg bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-300">
                    No public images were returned. Configure the Supabase anon key for listing or use Upload images.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    Promise.all([listPublicBucketImages('Airlines'), listPublicBucketImages('Blog')])
                      .then(([airlineImages, blogImages]) => setImageLibrary([...new Set([...airlineImages, ...blogImages])]))
                      .catch(error => setStatusMessage(error instanceof Error ? error.message : 'Image library refresh failed.'));
                  }}
                  className="mt-3 text-[11px] font-semibold text-sky-600 hover:underline dark:text-sky-400"
                >
                  Refresh public image library
                </button>
              </div>

              <div id="templates" className={`${activeSection === 'drafts' ? '' : 'hidden'} rounded-xl border p-4 ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold">Draft &amp; Template Manager</p>
                    <p className="text-[11px] text-slate-500">Save reusable structures, create your own drafts, and load them into the queue.</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={createBlankDraft} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-[11px] font-semibold dark:border-slate-700">New draft</button>
                    <button type="button" onClick={saveActiveAsTemplate} disabled={!activePost} className="rounded-lg bg-sky-600 px-2.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">Save active template</button>
                  </div>
                </div>
                {savedTemplates.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {savedTemplates.map(template => (
                      <div key={template.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2 text-[11px] dark:border-slate-800 dark:bg-slate-900">
                        <span className="truncate font-medium">{template.title}</span>
                        <div className="flex shrink-0 gap-2">
                          <button type="button" onClick={() => loadTemplate(template)} className="font-semibold text-sky-600 hover:underline">Use</button>
                          <button type="button" onClick={() => setSavedTemplates(current => current.filter(item => item.id !== template.id))} className="font-semibold text-rose-500 hover:underline">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <section className={`${activeSection === 'history' ? '' : 'hidden'} w-full max-w-6xl mx-auto rounded-2xl border p-3 sm:p-5 shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-black">Logs, status & history</h2><p className="text-xs text-slate-500">Filter, select, copy links, or export your workflow records.</p></div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelectedHistoryIds(filteredHistoryPosts.map(post => post.id))} className="rounded-lg border px-3 py-2 text-[11px] font-semibold">Select all</button>
              <button type="button" onClick={copyHistoryLinks} className="rounded-lg border px-3 py-2 text-[11px] font-semibold">Copy links</button>
              <button type="button" onClick={exportHistory} className="rounded-lg bg-sky-600 px-3 py-2 text-[11px] font-bold text-white">Export CSV</button>
            </div>
          </div>
          <input value={historyFilter} onChange={(event) => setHistoryFilter(event.target.value)} placeholder="Filter by day, keyword, airline, status, or title" className={`mt-4 w-full rounded-lg border p-2.5 text-xs outline-none ${isDarkMode ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-300 bg-slate-50 text-slate-900'}`} />
          <div className="mt-4 space-y-2">
            {filteredHistoryPosts.map(post => <label key={post.id} className={`flex items-center gap-3 rounded-lg border p-3 text-xs ${isDarkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
              <input type="checkbox" checked={selectedHistoryIds.includes(post.id)} onChange={(event) => setSelectedHistoryIds(current => event.target.checked ? [...current, post.id] : current.filter(id => id !== post.id))} />
              <span className="min-w-0 flex-1 truncate font-semibold">{post.title}</span>
              <span className="hidden text-slate-500 sm:inline">{post.keyword}</span>
              <span className="rounded-full bg-sky-500/10 px-2 py-1 text-[10px] font-bold text-sky-600">{post.status}</span>
              {post.publishedUrl && <a href={post.publishedUrl} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">Open</a>}
            </label>)}
            {!filteredHistoryPosts.length && <p className="rounded-lg bg-slate-500/10 p-4 text-xs text-slate-500">No matching history items.</p>}
          </div>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateAIPost(currentPostIndex)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded flex items-center gap-1 font-bold text-[11px] shadow-sm transition"
                        title={`Rewrite this blog post with 100% unique ${aiProvider} content`}
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Generate with {aiProvider}
                      </button>
                      <button
                        onClick={handleRegenerateBanner}
                        className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <RefreshCw className="w-3 h-3" /> Redraw SVG
                      </button>
                      <button
                        onClick={() => activePost && downloadBannerImage(activePost.imageUrl, activePost.title)}
                        className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                        title="Download current banner as high-res PNG"
                      >
                        <Download className="w-3 h-3" /> Download
                      </button>
                      <label className="cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 font-semibold text-[11px]">
                        <Upload className="w-3 h-3" /> Upload
                        <input type="file" accept="image/*" onChange={handleCustomImageUpload} className="hidden" />
                      </label>
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

      {/* Airline Manager Modal */}
      <AirlineManagerModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        airlines={airlines}
        onSave={(updated) => setAirlines(updated)}
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
