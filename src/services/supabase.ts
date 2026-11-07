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
  if (!supabase) return [];
  const { data, error } = await supabase.storage.from(IMAGE_BUCKET).list(prefix, {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' }
  });
  if (error) throw error;
  return (data || [])
    .filter(file => !!file.name && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name))
    .map(file => `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${prefix ? `${prefix}/` : ''}${encodeURIComponent(file.name)}`);
}

export async function uploadImageToPublicBucket(file: Blob, filename: string): Promise<string> {
  if (!supabase) {
    throw new Error('Image storage is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `Blog/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, {
    contentType: file.type || 'image/png',
    upsert: false
  });
  if (error) throw error;
  return `${SUPABASE_PUBLIC_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
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
