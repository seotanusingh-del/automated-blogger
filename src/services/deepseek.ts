export interface BlogPostContent {
  title: string;
  overview: string;
  services: string[];
  faqs: { question: string; answer: string }[];
}

export type AiProvider = 'deepseek' | 'gemini';

export function getAiProvider(): AiProvider {
  return localStorage.getItem('easyflight_ai_provider') === 'gemini' ? 'gemini' : 'deepseek';
}

export function setAiProvider(provider: AiProvider) {
  localStorage.setItem('easyflight_ai_provider', provider);
}

export function getGeminiApiKey(): string {
  return typeof window === 'undefined' ? '' : localStorage.getItem('easyflight_gemini_key') || '';
}

export function setGeminiApiKey(key: string) {
  if (typeof window === 'undefined') return;
  if (key.trim()) localStorage.setItem('easyflight_gemini_key', key.trim());
  else localStorage.removeItem('easyflight_gemini_key');
}

function buildKeywordFallback(airlineName: string, city: string, keyword: string, tfn: string): BlogPostContent {
  const topic = keyword.trim() || `${airlineName} missed flight policy`;
  const cleanTfn = tfn.trim() || '+1-888-794-3464';
  return {
    title: `${airlineName} ${city} ${topic}: Rules, Fees, Rebooking & Passenger Guide`,
    overview: `Searching for ${topic}? This practical ${airlineName} guide explains the key steps passengers should take in ${city}, including what to do first, which reservation details to keep ready, and what questions to ask before accepting a new itinerary.\n\n${airlineName} passengers should contact the reservations team as soon as a travel problem occurs. Rebooking, fees, onward segments, refunds, and schedule changes depend on the fare and the circumstances, so travelers should confirm the current rule for their booking rather than assume a missed flight and an airline cancellation are treated the same way.\n\nFor immediate assistance with ${topic}, keep your confirmation number available and call ${cleanTfn}.`,
    services: [
      `Help with ${topic} and reservation questions`,
      'Flight rebooking and alternate departure checks',
      'Change-fee and fare-difference explanations',
      'Return and onward reservation status checks',
      'Cancellation, refund, and credit guidance',
      'Baggage, check-in, and airport timing assistance'
    ],
    faqs: [
      { question: `What is the first step for ${topic}?`, answer: `Contact the airline promptly, explain the situation, and keep your confirmation details ready. Call ${cleanTfn} for assistance.` },
      { question: `Can ${airlineName} rebook my reservation?`, answer: `Rebooking depends on available flights and the conditions attached to your reservation. Ask about fees and fare differences before confirming.` },
      { question: 'Could a return or onward flight be affected?', answer: 'Some no-show conditions may affect remaining segments. Ask the reservations team to confirm every active segment.' },
      { question: 'Are refunds guaranteed?', answer: 'Refund eligibility depends on the fare rules and the reason for the disruption. Confirm the outcome before making a new payment.' },
      { question: `Where can I get help with ${topic}?`, answer: `Have your booking reference ready and contact the reservations team at ${cleanTfn} for current guidance.` }
    ]
  };
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
  variationSeed = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  provider: AiProvider = getAiProvider()
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
2. Follow this reader-friendly structure: introduction, "What Is [topic]?", "What Happens If...", step-by-step rebooking/help instructions, fees or conditions, cancellation differences, practical tips, FAQs, and a final contact section.
3. Engaging, in-depth overview (3 distinct paragraphs) covering the keyword intent, ${city} traveler context, booking changes, missed connections, and dispute escalations. Use the user's exact keyword naturally in the title, first paragraph, one subheading, and at least two FAQs.
4. 6-8 specific services or actions (e.g. ticket reissue, baggage claim tracking, seat upgrades, infant/pet policies, compensation claims, wheelchair assistance).
5. 5 thorough, unique FAQs with realistic answers that seamlessly embed the toll-free assistance number (${tfn}).
6. Use factual, cautious language: do not invent an airline rule, fee, route, or legal entitlement. Attribute supplied policy details as published terms when the user provides them.

Return valid JSON with this exact structure:
{
  "title": "...",
  "overview": "...",
  "services": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

  const cachedKey = `easyflight_ai_cache:${provider}:${airlineName}:${city}:${keyword}`;
  const cached = localStorage.getItem(cachedKey);
  if (cached) {
    try { return JSON.parse(cached) as BlogPostContent; } catch { localStorage.removeItem(cachedKey); }
  }

  if (provider === 'gemini') {
    const geminiKey = getGeminiApiKey();
    if (!geminiKey) return buildKeywordFallback(airlineName, city, keyword, tfn);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationConfig: { temperature: 0.75, responseMimeType: 'application/json', maxOutputTokens: 1800 },
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
        })
      }
    );
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      try {
        const parsed = JSON.parse(text);
        if (parsed?.title && parsed?.overview && Array.isArray(parsed.services) && Array.isArray(parsed.faqs)) {
          localStorage.setItem(cachedKey, JSON.stringify(parsed));
          return parsed as BlogPostContent;
        }
      } catch { /* use the deterministic fallback below */ }
    }
    return buildKeywordFallback(airlineName, city, keyword, tfn);
  }

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
      if (
        data.success &&
        data.data &&
        typeof data.data.title === 'string' &&
        typeof data.data.overview === 'string' &&
        Array.isArray(data.data.services) &&
        Array.isArray(data.data.faqs)
      ) {
        localStorage.setItem(cachedKey, JSON.stringify(data.data));
        return data.data as BlogPostContent;
      }
      throw new Error('AI service returned incomplete blog content.');
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
            return generateDeepSeekContent(airlineName, city, country, keyword, tfn, recentPosts, requestVariationSeed);
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
    if (!customKey) return buildKeywordFallback(airlineName, city, keyword, tfn);

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
    
    const parsed = JSON.parse(content) as BlogPostContent;
    if (!parsed.title || !parsed.overview || !Array.isArray(parsed.services) || !Array.isArray(parsed.faqs)) {
      throw new Error('DeepSeek returned incomplete blog content.');
    }
    return parsed;
  }
  return buildKeywordFallback(airlineName, city, keyword, tfn);
}

/**
 * Free Image Generation logic using Pollinations.ai (No key required, 100% free)
 */
export function generateFreeAiImageUrl(prompt: string, seed = Math.floor(Math.random() * 1000000)): string {
  const safePrompt = prompt.replace(/[{}[\]<>]/g, ' ').replace(/\s+/g, ' ').slice(0, 500);
  const encodedPrompt = encodeURIComponent(`${safePrompt}, travel editorial photography, airline, airplane, professional lighting, high resolution`);
  const width = 1200;
  const height = 630;
  return `https://gen.pollinations.ai/image/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;
}

export async function generatePollinationsImageUrl(prompt: string): Promise<string> {
  const response = await fetch(`/api/images/pollinations?prompt=${encodeURIComponent(prompt)}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Pollinations image generation failed.');
  }
  return data.url;
}
