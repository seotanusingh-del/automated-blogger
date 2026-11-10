import { createClient } from '@supabase/supabase-js';

// These should be set in Vercel/Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const SUPABASE_PUBLIC_URL = supabaseUrl || 'https://gplxknbnohajegmxkvot.supabase.co';
const IMAGE_BUCKET = 'DATA';

export async function listPublicBucketImages(prefix = ''): Promise<string[]> {
  if (!supabase) {
    return listImagesThroughApi(prefix);
  }
  const { data, error } = await supabase.storage.from(IMAGE_BUCKET).list(prefix, { limit: 100, sortBy: { column: 'name', order: 'asc' } });
  if (!error) {
    const files = (data || []).filter(file => !!file.name && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name));
    const directImages = files.map(file => `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${prefix ? `${prefix}/` : ''}${file.name.split('/').map(encodeURIComponent).join('/')}`);
    const folders = (data || []).filter(file => !!file.name && !file.id && !/\./.test(file.name)).slice(0, 25);
    const nestedImages = await Promise.all(folders.map(folder => listPublicBucketImages(prefix ? `${prefix}/${folder.name}` : folder.name).catch(() => [])));
    return [...directImages, ...nestedImages.flat()];
  }
  return listImagesThroughApi(prefix);
}

export async function uploadImageToPublicBucket(file: Blob, filename: string): Promise<string> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  
  if (supabase) {
    try {
      const path = `Airlines/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
        contentType: file.type || 'image/png',
        upsert: true
      });
      if (!error) {
        return `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
      }
    } catch {
      // Continue to API upload
    }
  }

  try {
    return await uploadImageThroughApi(file, filename);
  } catch (err) {
    console.warn('[Storage Notice] Falling back to CDN URL for image:', err);
    return new Promise<string>((resolve) => {
      const cleanKeyword = filename.replace(/[-_.]+/g, ' ').replace(/blog|svg|png|jpe?g/gi, '').trim();
      resolve(`https://gen.pollinations.ai/image/${encodeURIComponent(cleanKeyword || 'travel flight')}?width=1200&height=630&nologo=true`);
    });
  }
}

async function listImagesThroughApi(prefix: string): Promise<string[]> {
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('easyflight_supabase_service_key') || '' : '';
  try {
    const response = await fetch(`/api/storage/images?prefix=${encodeURIComponent(prefix)}`, {
      headers: customKey ? { 'x-supabase-key': customKey } : undefined
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(data.images)) return data.images;
  } catch (err) {
    console.warn('[Storage Notice] Image listing fell back:', err);
  }
  return [];
}

async function uploadImageThroughApi(file: Blob, filename: string): Promise<string> {
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('easyflight_supabase_service_key') || '' : '';
  
  // Base64 conversion
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const base64 = dataUrl.split(',')[1];
  if (!base64) return dataUrl;

  try {
    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-supabase-key': customKey } : {})
      },
      body: JSON.stringify({ filename, contentType: file.type || 'image/png', data: base64 })
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && result?.url) {
      return result.url;
    }
  } catch (err) {
    console.warn('[Storage Notice] Backend upload fallback:', err);
  }

  // Graceful fallback to data URL so the uploaded image remains visible and usable everywhere
  return dataUrl;
}

export interface StoredPost {
  id?: string;
  title: string;
  content: string;
  airline_name: string;
  city: string;
  created_at?: string;
}

export interface StoredBlogDraft {
  id: string;
  title?: string;
  keyword?: string;
  content?: string;
  content_html?: string;
  html_content?: string;
  banner_url?: string;
  image_url?: string;
  status?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface BlogRequestInput {
  id: string;
  blog_type: string;
  company_name: string;
  company_email: string;
  company_website: string;
  keyword: string;
  topic: string;
  tfn: string;
  status: 'pending';
  payload: Record<string, unknown>;
}

export async function getBlogTableDrafts(limit = 100): Promise<StoredBlogDraft[]> {
  try {
    const res = await fetch('/api/workflow/drafts');
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.drafts) && json.drafts.length > 0) {
        return json.drafts as StoredBlogDraft[];
      }
    }
  } catch (apiErr) {
    console.warn('[Supabase API Drafts Warning]:', apiErr);
  }

  if (!supabase) return [];
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error('Could not load drafts from Supabase blog table:', error);
    return [];
  }

  return (data || []) as StoredBlogDraft[];
}

export async function createPendingBlogRequest(request: BlogRequestInput & { immediateBlog?: any }): Promise<BlogRequestInput & { immediateBlog?: any }> {
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('easyflight_supabase_service_key') || '' : '';
  const n8nWebhookUrl = typeof window !== 'undefined' ? localStorage.getItem('easyflight_n8n_webhook') || '' : '';
  const n8nMcpUrl = typeof window !== 'undefined' ? localStorage.getItem('easyflight_n8n_mcp') || '' : '';
  const n8nApiKey = typeof window !== 'undefined' ? localStorage.getItem('easyflight_n8n_apikey') || '' : '';

  // 1. Try server-side proxy route first (clears previous rows & inserts single pending row)
  try {
    const res = await fetch('/api/workflow/trigger', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(customKey ? { 'x-supabase-key': customKey } : {}),
        ...(n8nWebhookUrl ? { 'x-n8n-webhook': n8nWebhookUrl } : {}),
        ...(n8nMcpUrl ? { 'x-n8n-mcp': n8nMcpUrl } : {}),
        ...(n8nApiKey ? { 'x-n8n-api-key': n8nApiKey } : {})
      },
      body: JSON.stringify({
        ...request,
        supabaseKey: customKey || undefined,
        n8nWebhookUrl: n8nWebhookUrl || undefined,
        n8nMcpUrl: n8nMcpUrl || undefined,
        n8nApiKey: n8nApiKey || undefined
      })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        return {
          ...((json.record || request) as BlogRequestInput),
          immediateBlog: json.immediateBlog
        };
      }
    }
  } catch (apiErr) {
    console.warn('[Workflow API Trigger Warning]:', apiErr);
  }

  // 2. Direct client-side Supabase fallback if available
  if (supabase) {
    try {
      await supabase.from('requests').delete().not('id', 'is', null);
    } catch (_) {}
    try {
      await supabase.from('user_blog_requests').delete().not('id', 'is', null);
    } catch (_) {}
    try {
      const { data, error } = await supabase.from('requests').insert(request).select().single();
      if (!error && data) return data as BlogRequestInput;
    } catch (_) {}
  }

  return request;
}

export async function getBlogsForRequest(requestId: string): Promise<StoredBlogDraft[]> {
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('easyflight_supabase_service_key') || '' : '';

  // 1. Try server-side status endpoint first
  try {
    const res = await fetch(`/api/workflow/status?requestId=${encodeURIComponent(requestId)}`, {
      headers: customKey ? { 'x-supabase-key': customKey } : undefined
    });
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.blogs) && json.blogs.length > 0) {
        return json.blogs as StoredBlogDraft[];
      }
    }
  } catch (apiErr) {
    console.warn('[Workflow API Status Warning]:', apiErr);
  }

  // 2. Direct client-side Supabase fallback
  if (supabase) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })
      .limit(10);
    if (!error && data && data.length > 0) return data as StoredBlogDraft[];

    // If empty for specific requestId, grab latest generated blog
    const { data: recentData } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (recentData && recentData.length > 0) return recentData as StoredBlogDraft[];
  }

  return [];
}

/**
 * Save a generated post to Supabase for future reference/variations
 */
export async function savePostToSupabase(post: StoredPost) {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select();
      
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error saving post to Supabase:', err);
    return null;
  }
}

/**
 * Fetch old posts to help AI generate different content
 */
export async function getRecentPosts(airlineName: string, city: string, limit = 5) {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('title, content')
      .eq('airline_name', airlineName)
      .eq('city', city)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching posts from Supabase:', err);
    return [];
  }
}
