export interface BlogPostContent {
  title: string;
  overview: string;
  services: string[];
  faqs: { question: string; answer: string }[];
}

export function getDeepSeekApiKey(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('easyflight_deepseek_key');
    if (saved && saved.trim()) return saved.trim();
  }
  return (import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim();
}

export function setDeepSeekApiKey(key: string) {
  if (typeof window !== 'undefined') {
    if (key && key.trim()) {
      localStorage.setItem('easyflight_deepseek_key', key.trim());
    } else {
      localStorage.removeItem('easyflight_deepseek_key');
    }
  }
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
  recentPosts: any[] = [],
  variationSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
): Promise<BlogPostContent> {
  const previousTitles = recentPosts.map(p => p.title).join(', ');
  const requestVariationSeed = variationSeed || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  
  const systemPrompt = `You are a premier aviation journalist and senior SEO content strategist specializing in commercial airline operations, customer service directories, and dispute resolution.
Your goal is to generate 100% unique, human-grade, deeply helpful blog posts that rank #1 on Google.
Never use repetitive corporate buzzwords or copy-pasted formulas. Write with high linguistic variety, fresh hooks, distinct paragraph structures, and authentic traveler empathy.`;

  const userPrompt = `Write a comprehensive, engaging, and original SEO guide for the "${airlineName} Office in ${city}, ${country}".
Target Keyword: ${keyword}
Unique research brief: Treat "${keyword}" as the primary search intent. Build the article around specific questions, entities, terminology, and traveler problems implied by that keyword. Do not fall back to a generic airline office article.
Variation seed: ${requestVariationSeed}
Toll-Free Helpline to naturally embed: ${tfn}

${recentPosts && recentPosts.length > 0 ? `Previously published titles in this topic cluster: [${previousTitles}]. 
CRITICAL: Do NOT reuse phrasing, structures, or angles from previous posts. Make this article stand out with a fresh perspective, unique traveler scenarios, and localized context for ${city}.` : ''}

Requirements:
1. High-CTR SEO Title (incorporate airline name, city, primary keyword, and clear value proposition). Use a fresh title pattern that is materially different from previous titles.
2. Engaging, In-Depth Overview (2-3 detailed paragraphs covering the city's importance to ${airlineName} passengers, airport/terminal access, booking changes, missed connections, and dispute escalations).
3. 6-8 Specific Airline Services (e.g. ticket reissue, baggage claim tracking, seat upgrades, infant/pet policies, DOT compensation claims, wheelchair assistance).
4. 5 Thorough, Unique FAQs with realistic answers that seamlessly embed the toll-free assistance number (${tfn}).

Return valid JSON with this exact structure:
{
  "title": "...",
  "overview": "...",
  "services": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

  // 1. Try calling the backend API proxy first (which uses DEEPSEEK_API_KEY from Vercel / server env)
  try {
    const customKey = getDeepSeekApiKey();
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        airlineName,
        city,
        country,
        keyword,
        tfn,
        recentPosts,
        variationSeed: requestVariationSeed,
        apiKey: customKey || undefined
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data as BlogPostContent;
      }
    } else {
      const err = await res.json().catch(() => ({}));
      // If server is missing DEEPSEEK_API_KEY and client doesn't have one either, prompt user as fallback
      if (err.code === 'MISSING_AI_KEY' && !customKey) {
        if (typeof window !== 'undefined') {
          const entered = window.prompt(
            'DEEPSEEK_API_KEY is not configured in Vercel environment variables.\n\nEnter your DeepSeek API Key (sk-...) to save locally, or add DEEPSEEK_API_KEY in Vercel to make it automatic:'
          );
          if (entered && entered.trim()) {
            setDeepSeekApiKey(entered.trim());
            return generateDeepSeekContent(airlineName, city, country, keyword, tfn, recentPosts);
          }
        }
      }
      if (err.error) {
        throw new Error(err.error);
      }
    }
  } catch (backendError: any) {
    // If backend proxy failed with a non-404 error (e.g. rate limit, bad prompt), propagate or fallback to client
    const customKey = getDeepSeekApiKey();
    if (!customKey) {
      throw backendError;
    }

    // Client-side fallback if customKey is present
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: customKey,
      baseURL: 'https://api.deepseek.com',
      dangerouslyAllowBrowser: true
    });

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Empty response from DeepSeek');
    
    return JSON.parse(content) as BlogPostContent;
  }
  throw new Error('Failed to generate AI blog content.');
}

/**
 * Free Image Generation logic using Pollinations.ai (No key required, 100% free)
 */
export function generateFreeAiImageUrl(prompt: string, seed = Math.floor(Math.random() * 1000000)): string {
  const encodedPrompt = encodeURIComponent(prompt + " travel, airline, airplane, professional photography, high resolution, 4k");
  const width = 1200;
  const height = 630;
  return `https://pollinations.ai/p/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux`;
}
