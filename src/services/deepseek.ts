import OpenAI from 'openai';

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || ''; // Must be provided via env var

const openai = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  dangerouslyAllowBrowser: true // Safe since this is a client-side tool with user-provided key
});

export interface BlogPostContent {
  title: string;
  overview: string;
  services: string[];
  faqs: { question: string; answer: string }[];
}

/**
 * Generate highly engaging, SEO-optimized blog content using DeepSeek AI.
 * Uses recent posts from Supabase (if provided) to ensure variations.
 */
export async function generateDeepSeekContent(
  airlineName: string,
  city: string,
  country: string,
  keyword: string,
  tfn: string,
  recentPosts: any[] = []
): Promise<BlogPostContent> {
  const previousTitles = recentPosts.map(p => p.title).join(', ');
  
  const systemPrompt = `You are a world-class SEO content strategist specializing in travel and airline office blogs.
Your goal is to generate content that ranks #1 on Google, is highly engaging, and converts readers into callers.
Use a professional yet inviting tone.`;

  const userPrompt = `Generate a comprehensive blog post for a "${airlineName} Office in ${city}, ${country}".
Target Keyword: ${keyword}
Toll-Free Number to embed: ${tfn}

${recentPosts.length > 0 ? `I have recently published posts with these titles: [${previousTitles}]. 
ENSURE this new post has a completely different angle, unique phrasing, and fresh insights to avoid cannibalization and provide variety.` : ''}

Requirements:
1. Catchy SEO Title (include keyword, city, and airline).
2. Engaging Overview (2-3 paragraphs explaining location benefits, services, and why customers choose this office).
3. List of 6-8 specific airline services (e.g., ticket booking, seat upgrades, baggage claims, pet travel policies, wheelchair assistance).
4. 5 unique FAQs with detailed answers that include the TFN naturally.

Format as JSON:
{
  "title": "...",
  "overview": "...",
  "services": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from DeepSeek');
    
    return JSON.parse(content) as BlogPostContent;
  } catch (error) {
    console.error('DeepSeek generation error:', error);
    throw error;
  }
}

/**
 * Free Image Generation logic using Pollinations.ai (No key required, 100% free)
 */
export function generateFreeAiImageUrl(prompt: string): string {
  const encodedPrompt = encodeURIComponent(prompt + " travel, airline, airplane, professional photography, high resolution, 4k");
  const width = 1200;
  const height = 630;
  const seed = Math.floor(Math.random() * 1000000);
  return `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux`;
}
