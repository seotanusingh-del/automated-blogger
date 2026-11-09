import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const storageUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gplxknbnohajegmxkvot.supabase.co';
const storageBucket = 'DATA';
const publicStorageUrl = `${storageUrl}/storage/v1/object/public/${storageBucket}`;
const pollinationsApiKey = process.env.POLLINATIONS_API_KEY || process.env.POLLINATIONS_SECRET_KEY || process.env.VITE_POLLINATIONS_API_KEY || '';

function normalizeAiContent(value: any) {
  if (!value || typeof value !== 'object' || typeof value.title !== 'string' || typeof value.overview !== 'string' || !Array.isArray(value.services) || !Array.isArray(value.faqs)) {
    return null;
  }
  return value;
}

function fallbackAiContent(airlineName: string, city: string, keyword: string, tfn: string) {
  const topic = keyword.trim() || `${airlineName} flight support`;
  return {
    title: `${airlineName} ${city} ${topic}: Complete Passenger Guide`,
    overview: `Looking for ${topic}? This practical guide explains the key steps for ${airlineName} passengers in ${city}, including what to check first, which booking details to keep ready, and what to confirm before accepting a new itinerary.\n\nRules for changes, refunds, missed departures, and onward reservations can depend on the fare and the circumstances. Contact the airline promptly and ask the reservations team to confirm the current conditions for your booking.\n\nFor assistance with ${topic}, keep your confirmation number ready and contact ${tfn || '+1-888-794-3464'}.`,
    services: ['Reservation status checks', 'Flight rebooking guidance', 'Change-fee explanations', 'Refund and credit guidance', 'Baggage and check-in assistance', 'Return-flight status checks'],
    faqs: [
      { question: `What should I do about ${topic}?`, answer: `Contact the airline promptly with your booking reference and ask what options apply. Assistance is available at ${tfn || '+1-888-794-3464'}.` },
      { question: 'Can my flight be rebooked?', answer: 'Rebooking depends on available flights and the conditions attached to the reservation. Confirm all charges before accepting.' },
      { question: 'Could another segment be affected?', answer: 'Some no-show conditions may affect remaining segments, so ask the reservations team to check the full itinerary.' },
      { question: 'Can I request a refund?', answer: 'Refund eligibility depends on the fare conditions and the reason for the disruption.' },
      { question: `Where can I get ${topic} help?`, answer: `Keep your confirmation details ready and contact the reservations team at ${tfn || '+1-888-794-3464'}.` }
    ]
  };
}

app.get(['/api/images/pollinations', '/images/pollinations'], async (req, res) => {
  const rawPrompt = String(req.query.prompt || '').trim();
  if (!rawPrompt) return res.status(400).json({ error: 'Missing image prompt.' });
  const prompt = rawPrompt
    .replace(/[{}[\]<>]/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 500);
  const imageUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(prompt)}?model=flux&width=1200&height=630&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
  try {
    const response = await fetch(imageUrl, {
      headers: pollinationsApiKey ? { Authorization: `Bearer ${pollinationsApiKey}` } : undefined
    });
    if (!response.ok) {
      const details = await response.text().catch(() => '');
      return res.status(response.status).json({ error: `Pollinations image generation failed (${response.status}).`, details: details.slice(0, 300) });
    }
    res.json({ url: imageUrl });
  } catch (error) {
    res.status(502).json({ error: error instanceof Error ? error.message : 'Pollinations image generation failed.' });
  }
});

app.get(['/api/storage/images', '/storage/images'], async (req, res) => {
  const prefix = String(req.query.prefix || '');
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
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
    const entries = Array.isArray(files) ? files : [];
    const images = entries
      .filter((file: { name?: string }) => !!file.name && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name))
      .map((file: { name: string }) => `${publicStorageUrl}/${prefix ? `${prefix}/` : ''}${encodeURIComponent(file.name)}`);
    const folders = entries
      .filter((file: { name?: string; id?: string | null }) => !!file.name && !file.id && !/\./.test(file.name))
      .slice(0, 25);
    const nested = await Promise.all(folders.map(async (folder: { name: string }) => {
      const nestedResponse = await fetch(`${storageUrl}/storage/v1/object/list/${storageBucket}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prefix: prefix ? `${prefix}/${folder.name}` : folder.name, limit: 100, sortBy: { column: 'name', order: 'asc' } })
      });
      const nestedFiles = await nestedResponse.json().catch(() => []);
      return (Array.isArray(nestedFiles) ? nestedFiles : [])
        .filter((file: { name?: string }) => !!file.name && /\.(avif|gif|jpe?g|png|webp)$/i.test(file.name))
        .map((file: { name: string }) => `${publicStorageUrl}/${prefix ? `${prefix}/` : ''}${encodeURIComponent(folder.name)}/${encodeURIComponent(file.name)}`);
    }));
    res.json({ images: [...images, ...nested.flat()] });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Storage listing failed.' });
  }
});

app.post(['/api/storage/upload', '/storage/upload'], async (req, res) => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const { filename, contentType, data } = req.body || {};
  if (!serviceKey) return res.status(503).json({ error: 'Supabase service storage is not configured.' });
  if (!filename || !data) return res.status(400).json({ error: 'Missing image filename or data.' });
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `Airlines/${Date.now()}-${safeName}`;
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

// n8n Workflow Integration: Creates one pending row in Supabase requests table & notifies n8n
app.post(['/api/workflow/trigger', '/workflow/trigger'], async (req, res) => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!serviceKey) return res.status(503).json({ error: 'Supabase credentials are not configured in Vercel.' });
  
  const { id, blog_type, company_name, company_email, company_website, keyword, topic, tfn, tfn_number, airline_name, city, country, payload } = req.body || {};
  const requestId = id || `req-${Date.now()}`;
  const record = {
    id: requestId,
    company_name: String(company_name || '').trim(),
    company_email: String(company_email || '').trim(),
    company_website: String(company_website || '').trim(),
    blog_type: String(blog_type || 'airlines').trim(),
    keyword: String(keyword || topic || '').trim(),
    topic: String(topic || keyword || '').trim(),
    tfn: String(tfn || tfn_number || '+1 (888) 794-3464').trim(),
    tfn_number: String(tfn_number || tfn || '+1 (888) 794-3464').trim(),
    airline_name: String(airline_name || company_name || 'Airline').trim(),
    city: String(city || 'Headquarters').trim(),
    country: String(country || 'United States').trim(),
    status: 'pending',
    payload: payload || {}
  };

  try {
    // 1. Clear previous rows to avoid n8n confusion
    await fetch(`${storageUrl}/rest/v1/requests?id=neq.placeholder`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json'
      }
    }).catch(() => {});

    await fetch(`${storageUrl}/rest/v1/user_blog_requests?id=neq.placeholder`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json'
      }
    }).catch(() => {});

    // 2. Insert single pending row into requests
    const insertRes = await fetch(`${storageUrl}/rest/v1/requests`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(record)
    });

    const insertData = await insertRes.json().catch(() => ({}));
    if (!insertRes.ok) {
      return res.status(insertRes.status).json({ error: insertData?.message || 'Failed to insert request into Supabase requests table.' });
    }

    // Also insert into user_blog_requests if present
    fetch(`${storageUrl}/rest/v1/user_blog_requests`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(record)
    }).catch(() => {});

    // 3. Ping n8n webhook and MCP server endpoint
    const n8nWebhook = 'https://automated-blogger.app.n8n.cloud/webhook/seo-blog-generator';
    const n8nMcp = 'https://automated-blogger.app.n8n.cloud/mcp-server/http';
    fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'new_request', record })
    }).catch(() => {});

    fetch(n8nMcp, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'notify_request', params: record, id: requestId })
    }).catch(() => {});

    res.json({ success: true, requestId, record });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Workflow trigger failed' });
  }
});

app.get(['/api/workflow/status', '/workflow/status'], async (req, res) => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!serviceKey) return res.status(503).json({ error: 'Supabase credentials are not configured.' });
  const requestId = String(req.query.requestId || '');

  try {
    const url = requestId 
      ? `${storageUrl}/rest/v1/blogs?request_id=eq.${encodeURIComponent(requestId)}&order=created_at.desc&limit=5`
      : `${storageUrl}/rest/v1/blogs?order=created_at.desc&limit=5`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey
      }
    });
    const blogs = await response.json().catch(() => []);
    res.json({ success: true, blogs: Array.isArray(blogs) ? blogs : [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Workflow status check failed' });
  }
});

app.get(['/api/workflow/drafts', '/workflow/drafts'], async (req, res) => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!serviceKey) return res.status(503).json({ error: 'Supabase credentials are not configured.' });

  try {
    const response = await fetch(`${storageUrl}/rest/v1/blogs?order=created_at.desc&limit=50`, {
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey
      }
    });
    const blogs = await response.json().catch(() => []);
    res.json({ success: true, drafts: Array.isArray(blogs) ? blogs : [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Drafts listing failed' });
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
    const { airlineName, city, country, keyword, tfn, recentPosts, apiKey, geminiApiKey, variationSeed } = req.body;
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

    const providers: string[] = [];
    const deepseekKey = (apiKey && String(apiKey).trim()) || process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || '';
    const geminiKey = (geminiApiKey && String(geminiApiKey).trim()) || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
    if (geminiKey) providers.push('gemini');
    if (deepseekKey) providers.push('deepseek');
    if (pollinationsApiKey) providers.push('pollinations');

    for (const provider of providers) {
      try {
        let content: any = null;
        if (provider === 'gemini') {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              generationConfig: { temperature: 0.75, responseMimeType: 'application/json', maxOutputTokens: 1800 },
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
            })
          });
          const data = await response.json();
          content = JSON.parse(data?.candidates?.[0]?.content?.parts?.[0]?.text || 'null');
        } else {
          const { default: OpenAI } = await import('openai');
          const openai = new OpenAI({
            apiKey: provider === 'deepseek' ? deepseekKey : pollinationsApiKey,
            baseURL: provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://gen.pollinations.ai/v1'
          });
          const response = await openai.chat.completions.create({
            model: provider === 'deepseek' ? 'deepseek-chat' : 'openai/gpt-oss-20b',
            temperature: 0.75,
            max_tokens: 1800,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            response_format: { type: 'json_object' }
          });
          content = JSON.parse(response.choices[0]?.message?.content || 'null');
        }
        const normalized = normalizeAiContent(content);
        if (normalized) return res.json({ success: true, provider, data: normalized });
      } catch (providerError) {
        console.warn(`[AI provider failed: ${provider}]`, providerError);
      }
    }

    return res.json({ success: true, provider: 'template', data: fallbackAiContent(airlineName, city, keyword, tfn) });
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

  const { title, content, labels, isDraft, refreshToken, customMetaData, location, readerComments } = req.body;
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
    if (customMetaData) payload.customMetaData = String(customMetaData).trim();
    if (location) payload.location = location;
    if (readerComments) payload.readerComments = readerComments;

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
