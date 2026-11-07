import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const storageUrl = process.env.SUPABASE_URL || 'https://gplxknbnohajegmxkvot.supabase.co';
const storageBucket = 'DATA';
const publicStorageUrl = `${storageUrl}/storage/v1/object/public/${storageBucket}`;

app.get(['/api/storage/images', '/storage/images'], async (req, res) => {
  const prefix = String(req.query.prefix || '');
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!serviceKey) {
    return res.status(503).json({ error: 'Set SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY in Vercel to load the public DATA image library.' });
  }
  try {
    const response = await fetch(`${storageUrl}/storage/v1/object/list/${storageBucket}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prefix, limit: 100, sortBy: { column: 'name', order: 'asc' } })
    });
    const files = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: files?.message || 'Storage listing failed.' });
    const images = (Array.isArray(files) ? files : [])
      .filter((file: { name?: string }) => !!file.name && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name))
      .map((file: { name: string }) => `${publicStorageUrl}/${prefix ? `${prefix}/` : ''}${encodeURIComponent(file.name)}`);
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Storage listing failed.' });
  }
});

app.post(['/api/storage/upload', '/storage/upload'], async (req, res) => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const { filename, contentType, data } = req.body || {};
  if (!serviceKey) return res.status(503).json({ error: 'Supabase service storage is not configured.' });
  if (!filename || !data) return res.status(400).json({ error: 'Missing image filename or data.' });
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `Blog/${Date.now()}-${safeName}`;
  try {
    const response = await fetch(`${storageUrl}/storage/v1/object/${storageBucket}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': contentType || 'image/png',
        'x-upsert': 'false'
      },
      body: Buffer.from(String(data), 'base64')
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: result?.message || 'Image upload failed.' });
    res.json({ url: `${publicStorageUrl}/${path.split('/').map(encodeURIComponent).join('/')}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Image upload failed.' });
  }
});

/**
 * Standardized Access Token Retrieval using Refresh Token
 */
/**
 * Standardized Access Token Retrieval using Refresh Token
 */
interface TokenResult {
  token: string | null;
  error?: string;
  code?: string;
}

async function getAccessToken(customRefreshToken?: string): Promise<TokenResult> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const refreshToken = (customRefreshToken && customRefreshToken.trim()) || process.env.GOOGLE_REFRESH_TOKEN || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    if (!clientId) {
      return { 
        token: null, 
        error: 'GOOGLE_CLIENT_ID is missing from environment variables.', 
        code: 'MISSING_CLIENT_ID' 
      };
    }

    if (!refreshToken) {
      return { 
        token: null, 
        error: 'Google Refresh Token is missing. Please configure GOOGLE_REFRESH_TOKEN in Vercel or enter it in the app.', 
        code: 'MISSING_REFRESH_TOKEN' 
      };
    }

    const params = new URLSearchParams({
      client_id: clientId,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    if (clientSecret) params.append('client_secret', clientSecret);

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    
    const data: any = await res.json();
    if (data.access_token) {
      return { token: data.access_token };
    }
    
    // Check specifically for expired or revoked refresh token (7-day test limit)
    if (data.error === 'invalid_grant') {
      return { 
        token: null, 
        error: 'Google Refresh Token has expired or been revoked. If your OAuth consent screen is in "Testing" mode, Google expires tokens every 7 days. Switch to "In Production" to make it permanent.', 
        code: 'REFRESH_TOKEN_EXPIRED' 
      };
    }

    // If auth failed with client_secret, retry cleanly without secret
    if (clientSecret && (data.error === 'unauthorized_client' || data.error === 'invalid_client')) {
      const retryParams = new URLSearchParams({
        client_id: clientId,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      const retryRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: retryParams,
      });
      const retryData = await retryRes.json();
      if (retryData.access_token) {
        return { token: retryData.access_token };
      }
      if (retryData.error === 'invalid_grant') {
        return { 
          token: null, 
          error: 'Google Refresh Token has expired or been revoked. Switch OAuth consent screen to "In Production" to make it permanent.', 
          code: 'REFRESH_TOKEN_EXPIRED' 
        };
      }
    }

    return { 
      token: null, 
      error: data.error_description || data.error || 'Failed to authenticate with Google.', 
      code: data.error || 'AUTH_ERROR' 
    };
  } catch (err: any) {
    return { 
      token: null, 
      error: err?.message || 'Network error refreshing Google token.', 
      code: 'NETWORK_ERROR' 
    };
  }
}

app.get(['/api/status', '/status'], async (req, res) => {
  const queryToken = (req.query.refreshToken as string) || (req.headers['x-google-refresh-token'] as string);
  const result = await getAccessToken(queryToken);
  res.json({ 
    connected: !!result.token, 
    error: result.error, 
    code: result.code,
    hasEnvId: !!process.env.GOOGLE_CLIENT_ID,
    hasEnvToken: !!process.env.GOOGLE_REFRESH_TOKEN,
    hasDeepSeek: !!process.env.DEEPSEEK_API_KEY
  });
});

// Server-side AI Generation using DEEPSEEK_API_KEY from environment variables
app.post(['/api/ai/generate', '/ai/generate'], async (req, res) => {
  try {
    const { airlineName, city, country, keyword, tfn, recentPosts, apiKey, variationSeed } = req.body;
    const resolvedApiKey = (apiKey && String(apiKey).trim()) || process.env.DEEPSEEK_API_KEY || '';

    if (!resolvedApiKey) {
      return res.status(400).json({ 
        error: 'DEEPSEEK_API_KEY is not configured in Vercel environment variables or provided in request.',
        code: 'MISSING_AI_KEY'
      });
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: resolvedApiKey,
      baseURL: 'https://api.deepseek.com',
    });

    const previousTitles = (recentPosts && Array.isArray(recentPosts)) 
      ? recentPosts.map((p: any) => p.title).join(', ') 
      : 'None';

    const systemPrompt = `You are a premier aviation journalist and senior SEO content strategist specializing in commercial airline operations, customer service directories, and dispute resolution.
Your goal is to generate 100% unique, human-grade, deeply helpful blog posts that rank #1 on Google.
Never use repetitive corporate buzzwords or copy-pasted formulas. Write with high linguistic variety, fresh hooks, distinct paragraph structures, and authentic traveler empathy.`;

    const userPrompt = `Write a comprehensive, engaging, and original SEO guide for the "${airlineName} Office in ${city}, ${country}".
Target Keyword: ${keyword}
Toll-Free Helpline to naturally embed: ${tfn}
Unique research brief: Treat "${keyword}" as the primary search intent. Use keyword-specific questions, entities, terminology, and traveler scenarios rather than a generic airline office template.
Variation seed: ${variationSeed || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}

${recentPosts && recentPosts.length > 0 ? `Previously published titles in this topic cluster: [${previousTitles}]. 
CRITICAL: Do NOT reuse phrasing, structures, or angles from previous posts. Make this article stand out with a fresh perspective, unique traveler scenarios, and localized context for ${city}.` : ''}

Requirements:
1. High-CTR SEO Title (incorporate airline name, city, primary keyword, and clear value proposition). Use a fresh title pattern that differs from previous titles.
2. Follow this structure: introduction, "What Is [topic]?", "What Happens If...", step-by-step help instructions, fees or conditions, cancellation differences, practical tips, FAQs, and a final contact section.
3. Write 3 distinct overview paragraphs covering the keyword intent, ${city} traveler context, booking changes, missed connections, and dispute escalations. Use the exact keyword naturally in the title, first paragraph, one subheading, and at least two FAQs.
4. Provide 6-8 specific services or actions (e.g. ticket reissue, baggage claim tracking, seat upgrades, infant/pet policies, compensation claims, wheelchair assistance).
5. Provide 5 thorough, unique FAQs with realistic answers that seamlessly embed the toll-free assistance number (${tfn}).
6. Use factual, cautious language. Do not invent an airline rule, fee, route, or legal entitlement. Attribute supplied policy details as published terms when provided.

Return valid JSON with this exact structure:
{
  "title": "...",
  "overview": "...",
  "services": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const contentStr = response.choices[0].message.content;
    if (!contentStr) {
      return res.status(500).json({ error: 'DeepSeek returned an empty response.' });
    }

    const json = JSON.parse(contentStr);
    res.json({ success: true, data: json });
  } catch (err: any) {
    console.error('[AI Generate API Error]:', err);
    res.status(500).json({ error: err.message || 'AI Generation failed.' });
  }
});

app.post(['/api/blogger/publish', '/blogger/publish'], async (req, res) => {
  // Authorization: Enforce PUBLISH_SECRET only if configured AND request is not from the same-origin app
  const auth = req.headers.authorization || '';
  const isAppRequest = req.headers['sec-fetch-site'] === 'same-origin' || 
                       req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                       req.headers['x-client-app'] === 'automated-blogger' ||
                       !process.env.PUBLISH_SECRET;
  const isAuthorized = isAppRequest || (process.env.PUBLISH_SECRET && auth === `Bearer ${process.env.PUBLISH_SECRET}`);

  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing PUBLISH_SECRET.' });
  }

  const { title, content, labels, isDraft, refreshToken } = req.body;
  const blogId = req.body.blogId || process.env.BLOGGER_BLOG_ID;

  if (!blogId || !title || !content) {
    return res.status(400).json({ error: 'Missing blogId, title or content.' });
  }

  const tokenResult = await getAccessToken(refreshToken);
  if (!tokenResult.token) {
    return res.status(401).json({ 
      error: tokenResult.error || 'Google authentication failed.',
      code: tokenResult.code || 'AUTH_FAILED',
      needsConfig: true
    });
  }

  try {
    const url = `https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}/posts${isDraft ? '?isDraft=true' : ''}`;
    const payload: any = { title, content };
    if (labels?.length) payload.labels = labels;

    const r = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${tokenResult.token}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    const data: any = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ 
        error: data?.error?.message || 'Blogger API error', 
        details: data 
      });
    }

    res.json({ 
      success: true, 
      url: data.url, 
      id: data.id, 
      title: data.title 
    });
  } catch (error: any) {
    console.error('[Vercel API] Exception publishing:', error);
    return res.status(500).json({ error: error.message });
  }
});

app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

export default app;
