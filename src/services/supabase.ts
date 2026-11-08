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
  if (!supabase) {
    return uploadImageThroughApi(file, filename);
  }
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `Airlines/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type || 'image/png',
    upsert: false
  });
  if (!error) return `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
  return uploadImageThroughApi(file, filename);
}

async function listImagesThroughApi(prefix: string): Promise<string[]> {
  const response = await fetch(`/api/storage/images?prefix=${encodeURIComponent(prefix)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Public image library could not be loaded.');
  return Array.isArray(data.images) ? data.images : [];
}

async function uploadImageThroughApi(file: Blob, filename: string): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  const response = await fetch('/api/storage/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType: file.type || 'image/png', data: btoa(binary) })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.url) throw new Error(result.error || 'Image upload failed. Check Supabase storage credentials and bucket policies.');
  return result.url;
}

export interface StoredPost {
  id?: string;
  title: string;
  content: string;
  airline_name: string;
  city: string;
  created_at?: string;
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
