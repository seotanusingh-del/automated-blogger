import { createClient } from '@supabase/supabase-js';

// These should be set in Vercel/Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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
