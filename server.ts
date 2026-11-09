import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

function getValidSupabaseUrl(): string {
  const envUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  if (envUrl && !envUrl.includes('your-project') && envUrl.startsWith('http')) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'https://gplxknbnohajegmxkvot.supabase.co';
}

function getValidServiceKey(customKey?: string): string {
  if (customKey && customKey.trim() && !customKey.includes('your-service') && !customKey.includes('your-anon')) {
    return customKey.trim();
  }
  const envKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (envKey && !envKey.includes('your-service') && !envKey.includes('your-anon')) {
    return envKey;
  }
  return '';
}

const storageUrl = getValidSupabaseUrl();
const storageBucket = 'DATA';
const publicStorageUrl = `${storageUrl}/storage/v1/object/public/${storageBucket}`;
const pollinationsApiKey = process.env.POLLINATIONS_API_KEY || process.env.POLLINATIONS_SECRET_KEY || process.env.VITE_POLLINATIONS_API_KEY || '';

function normalizeAiContent(value: any) {
  if (!value || typeof value !== 'object' || typeof value.title !== 'string' || typeof value.overview !== 'string' || !Array.isArray(value.services) || !Array.isArray(value.faqs)) {
    return null;
  }
  return value;
}

function fallbackAiContent(airlineName: string, city: string, keyword: string, tfn: string, blogType = 'airlines') {
  const topic = keyword.trim() || `${airlineName} support guide`;
  const cleanTfn = tfn || '+1 (888) 794-3464';
  const entityDesc = blogType === 'hotels' ? 'hotel and resort services' :
                    blogType === 'travel' ? 'travel guide and destination info' :
                    blogType === 'agency' ? 'travel concierge and booking assistance' : 'passenger guide and airline customer assistance';
  return {
    title: `${airlineName} ${city} ${topic}: Complete ${blogType === 'hotels' ? 'Guest' : 'Traveler'} Guide`,
    overview: `Looking for ${topic}? This comprehensive guide explains the key steps for ${airlineName} in ${city}, including contact details, booking confirmation steps, dispute resolution, and what to verify before making itinerary changes.\n\nPolicies for reservations, schedule changes, refunds, and support depend on booking terms and room or fare conditions. Contact the customer desk promptly to confirm active policies for your booking.\n\nFor 24/7 dedicated assistance with ${topic}, keep your confirmation reference ready and call ${cleanTfn}.`,
    services: [
      `Dedicated assistance for ${topic}`,
      'Reservation verification and rebooking guidance',
      'Change policies, terms, and fee explanations',
      'Refund, credit, and cancellation advice',
      'Baggage, check-in, and accommodation assistance',
      'Escalation and direct specialist support'
    ],
    faqs: [
      { question: `What should I do first for ${topic}?`, answer: `Contact the dedicated support desk with your confirmation reference and ask what options apply. Immediate assistance is available at ${cleanTfn}.` },
      { question: 'Can my reservation or itinerary be rebooked?', answer: 'Rebooking depends on availability and the specific conditions attached to the reservation. Always confirm terms before accepting changes.' },
      { question: 'Could onward segments or connected bookings be affected?', answer: 'Some changes affect remaining travel or return legs. Ask the desk to check your entire booking record.' },
      { question: 'What is the policy for cancellation or refund?', answer: 'Eligibility depends on the published policy and the circumstances of the disruption.' },
      { question: `Where can I get immediate ${topic} help?`, answer: `Have your booking details ready and contact the team at ${cleanTfn}.` }
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
  const serviceKey = getValidServiceKey(req.headers['x-supabase-key'] as string);
  if (!serviceKey) {
    return res.status(503).json({ error: 'Supabase credentials are not configured.' });
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
  const serviceKey = getValidServiceKey(req.headers['x-supabase-key'] as string);
  const { filename, contentType, data } = req.body || {};
  if (!serviceKey) return res.status(503).json({ error: 'Supabase service storage is not configured.' });
  if (!filename || !data) return res.status(400).json({ error: 'Missing image filename or data.' });
  const safeName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
  const uploadPath = `Airlines/${Date.now()}-${safeName}`;
  try {
    const response = await fetch(`${storageUrl}/storage/v1/object/${storageBucket}/${uploadPath}`, {
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
    res.json({ url: `${publicStorageUrl}/${uploadPath.split('/').map(encodeURIComponent).join('/')}` });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Image upload failed.' });
  }
});

// n8n & Supabase Connectivity Test endpoint
app.post(['/api/workflow/test-connection', '/workflow/test-connection'], async (req, res) => {
  const { n8nWebhookUrl, n8nMcpUrl, n8nApiKey, supabaseKey } = req.body || {};
  const activeKey = getValidServiceKey(supabaseKey || (req.headers['x-supabase-key'] as string));
  const webhook = String(n8nWebhookUrl || process.env.N8N_WEBHOOK_URL || 'https://automated-blogger.app.n8n.cloud/webhook/seo-blog-generator').trim();
  const mcp = String(n8nMcpUrl || process.env.N8N_MCP_URL || 'https://automated-blogger.app.n8n.cloud/mcp-server/http').trim();

  const results: any = {
    supabase: { ok: false, message: 'Not tested' },
    n8nWebhook: { ok: false, status: 0, message: '' },
    n8nMcp: { ok: false, status: 0, message: '' }
  };

  // 1. Test Supabase requests table
  try {
    const sbRes = await fetch(`${storageUrl}/rest/v1/requests?limit=1`, {
      headers: {
        Authorization: `Bearer ${activeKey || 'placeholder'}`,
        apikey: activeKey || 'placeholder'
      }
    });
    results.supabase = {
      ok: sbRes.ok || sbRes.status === 200 || sbRes.status === 206,
      status: sbRes.status,
      message: sbRes.ok ? 'requests table accessible' : `Supabase returned ${sbRes.status}`
    };
  } catch (sbErr: any) {
    results.supabase = { ok: false, message: sbErr?.message || 'Supabase unreachable' };
  }

  // 2. Test n8n Webhook
  try {
    const wbHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (n8nApiKey) wbHeaders['X-N8N-API-KEY'] = n8nApiKey;
    const wbRes = await fetch(webhook, {
      method: 'POST',
      headers: wbHeaders,
      body: JSON.stringify({ event: 'ping', test: true, timestamp: Date.now() })
    });
    results.n8nWebhook = {
      ok: wbRes.ok || wbRes.status < 500,
      status: wbRes.status,
      message: wbRes.ok ? 'Webhook received ping successfully' : `HTTP ${wbRes.status}`
    };
  } catch (wbErr: any) {
    results.n8nWebhook = { ok: false, message: wbErr?.message || 'Webhook ping failed' };
  }

  // 3. Test n8n MCP Server
  try {
    const mcpHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (n8nApiKey) mcpHeaders['X-N8N-API-KEY'] = n8nApiKey;
    const mcpRes = await fetch(mcp, {
      method: 'POST',
      headers: mcpHeaders,
      body: JSON.stringify({ jsonrpc: '2.0', method: 'initialize', id: 1, params: { clientInfo: { name: 'Automated-Blogger' } } })
    });
    results.n8nMcp = {
      ok: mcpRes.ok || mcpRes.status < 500,
      status: mcpRes.status,
      message: mcpRes.ok ? 'MCP JSON-RPC server ready' : `HTTP ${mcpRes.status}`
    };
  } catch (mcpErr: any) {
    results.n8nMcp = { ok: false, message: mcpErr?.message || 'MCP ping failed' };
  }

  res.json({ success: true, ...results });
});

// n8n Workflow Integration: Creates one pending row in Supabase requests table & notifies n8n
app.post(['/api/workflow/trigger', '/workflow/trigger'], async (req, res) => {
  const customKey = req.body?.supabaseKey || (req.headers['x-supabase-key'] as string);
  const serviceKey = getValidServiceKey(customKey);
  const customWebhook = req.body?.n8nWebhookUrl || (req.headers['x-n8n-webhook'] as string);
  const customMcp = req.body?.n8nMcpUrl || (req.headers['x-n8n-mcp'] as string);
  const customApiKey = req.body?.n8nApiKey || (req.headers['x-n8n-api-key'] as string);

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
    // 1. Clear previous rows from requests, request, user_blog_requests, and "User blog request"
    if (serviceKey) {
      const deleteHeaders = {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json'
      };

      const tableNames = ['requests', 'request', 'user_blog_requests', encodeURIComponent('User blog request')];
      await Promise.all(tableNames.map(tbl => 
        fetch(`${storageUrl}/rest/v1/${tbl}?id=not.is.null`, {
          method: 'DELETE',
          headers: deleteHeaders
        }).catch(() => {})
      ));

      // 2. Insert single pending row into requests and alias tables
      const insertHeaders = {
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      };

      await fetch(`${storageUrl}/rest/v1/requests`, {
        method: 'POST',
        headers: insertHeaders,
        body: JSON.stringify(record)
      }).catch(() => {});

      await fetch(`${storageUrl}/rest/v1/user_blog_requests`, {
        method: 'POST',
        headers: insertHeaders,
        body: JSON.stringify(record)
      }).catch(() => {});

      await fetch(`${storageUrl}/rest/v1/${encodeURIComponent('User blog request')}`, {
        method: 'POST',
        headers: insertHeaders,
        body: JSON.stringify(record)
      }).catch(() => {});

      await fetch(`${storageUrl}/rest/v1/request`, {
        method: 'POST',
        headers: insertHeaders,
        body: JSON.stringify(record)
      }).catch(() => {});
    }

    // 3. Ping n8n webhook and MCP server endpoint
    const n8nWebhook = customWebhook || process.env.N8N_WEBHOOK_URL || 'https://automated-blogger.app.n8n.cloud/webhook/seo-blog-generator';
    const n8nMcp = customMcp || process.env.N8N_MCP_URL || 'https://automated-blogger.app.n8n.cloud/mcp-server/http';

    const n8nHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (customApiKey) {
      n8nHeaders['X-N8N-API-KEY'] = customApiKey;
      n8nHeaders['Authorization'] = `Bearer ${customApiKey}`;
    }

    let immediateBlog: any = null;

    // Trigger Webhook with flattened + nested payload so all n8n node formats work
    try {
      const webhookPayload = {
        event: 'new_request',
        trigger: 'supabase_requests_pending',
        table: 'requests',
        ...record,
        record,
        data: record
      };

      const wbRes = await fetch(n8nWebhook, {
        method: 'POST',
        headers: n8nHeaders,
        body: JSON.stringify(webhookPayload)
      });

      if (wbRes.ok) {
        const wbData = await wbRes.json().catch(() => null);
        if (wbData && (wbData.title || wbData.content_html || wbData.content || wbData.output)) {
          immediateBlog = wbData.output || wbData;
        }
      }
    } catch (wbErr) {
      console.warn('[n8n Webhook Ping Warning]:', wbErr);
    }

    // Trigger MCP Server endpoint via JSON-RPC 2.0
    try {
      fetch(n8nMcp, {
        method: 'POST',
        headers: n8nHeaders,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/call',
          params: {
            name: 'generate_blog',
            arguments: record
          },
          id: requestId
        })
      }).catch(() => {});

      fetch(n8nMcp, {
        method: 'POST',
        headers: n8nHeaders,
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notify_pending_request',
          params: { table: 'requests', request: record },
          id: `notify-${requestId}`
        })
      }).catch(() => {});
    } catch (_) {}

    res.json({
      success: true,
      requestId,
      record,
      immediateBlog: immediateBlog || undefined,
      n8nNotified: true,
      message: 'Pending request created in Supabase requests table and sent to n8n Webhook & MCP server.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Workflow trigger failed' });
  }
});

app.get(['/api/workflow/status', '/workflow/status'], async (req, res) => {
  const serviceKey = getValidServiceKey(req.headers['x-supabase-key'] as string);
  const requestId = String(req.query.requestId || '');

  try {
    const headers = serviceKey ? { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } : undefined;
    
    // First try by request_id
    let blogs: any[] = [];
    if (requestId) {
      const url = `${storageUrl}/rest/v1/blogs?request_id=eq.${encodeURIComponent(requestId)}&order=created_at.desc&limit=5`;
      const response = await fetch(url, { headers });
      blogs = await response.json().catch(() => []);
    }

    // If no blogs found for specific request_id, check recently created blogs (within last 15 min)
    if (!Array.isArray(blogs) || blogs.length === 0) {
      const recentUrl = `${storageUrl}/rest/v1/blogs?order=created_at.desc&limit=5`;
      const recentRes = await fetch(recentUrl, { headers });
      const recentBlogs = await recentRes.json().catch(() => []);
      if (Array.isArray(recentBlogs) && recentBlogs.length > 0) {
        blogs = recentBlogs;
      }
    }

    res.json({ success: true, blogs: Array.isArray(blogs) ? blogs : [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Workflow status check failed' });
  }
});

app.get(['/api/workflow/drafts', '/workflow/drafts'], async (req, res) => {
  const serviceKey = getValidServiceKey(req.headers['x-supabase-key'] as string);

  try {
    const headers = serviceKey ? { Authorization: `Bearer ${serviceKey}`, apikey: serviceKey } : undefined;
    const response = await fetch(`${storageUrl}/rest/v1/blogs?order=created_at.desc&limit=50`, {
      headers
    });
    const blogs = await response.json().catch(() => []);
    res.json({ success: true, drafts: Array.isArray(blogs) ? blogs : [] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Drafts listing failed' });
  }
});

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
    hasDeepSeek: !!process.env.DEEPSEEK_API_KEY,
    hasGemini: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)
  });
});

// Server-side AI Generation supporting Gemini, DeepSeek, Pollinations, and template fallback
app.post(['/api/ai/generate', '/ai/generate'], async (req, res) => {
  try {
    const { airlineName, city, country, keyword, tfn, recentPosts, apiKey, geminiApiKey, variationSeed, blogType } = req.body;
    const previousTitles = (recentPosts && Array.isArray(recentPosts)) 
      ? recentPosts.map((p: any) => p.title).join(', ') 
      : 'None';

    const entityTypeStr = String(blogType || 'airlines').trim();
    const entityRole = entityTypeStr === 'hotels' ? 'luxury hospitality directory and hotel guest assistance' :
                       entityTypeStr === 'travel' ? 'world travel destinations and local visitor information' :
                       entityTypeStr === 'agency' ? 'travel concierge desks and booking dispute resolution' :
                       'commercial airline operations and passenger assistance';

    const systemPrompt = `You are a premier SEO content strategist and journalist specializing in ${entityRole}.
Your goal is to generate 100% unique, human-grade, authoritative blog posts that rank #1 on Google.
Never use repetitive corporate buzzwords or copy-pasted formulas. Write with high linguistic variety, fresh hooks, distinct paragraph structures, and authentic traveler empathy.`;

    const userPrompt = `Write a comprehensive, engaging, and original SEO guide for "${airlineName} in ${city}, ${country}".
Target Keyword: ${keyword}
Toll-Free Helpline to naturally embed: ${tfn}
Unique research brief: Treat "${keyword}" as the primary search intent. Use keyword-specific questions, entities, terminology, and traveler scenarios.
Variation seed: ${variationSeed || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}

${recentPosts && recentPosts.length > 0 ? `Previously published titles in this topic cluster: [${previousTitles}]. 
CRITICAL: Do NOT reuse phrasing, structures, or angles from previous posts. Make this article stand out with a fresh perspective and localized context for ${city}.` : ''}

Requirements:
1. High-CTR SEO Title (incorporate entity name, city, primary keyword, and clear value proposition).
2. Follow this structure: introduction, "What Is [topic]?", "What Happens If...", step-by-step help instructions, fees or conditions, cancellation differences, practical tips, FAQs, and a final contact section.
3. Write 3 distinct overview paragraphs covering the keyword intent, ${city} traveler context, booking changes, and dispute escalations. Use the exact keyword naturally in the title, first paragraph, one subheading, and at least two FAQs.
4. Provide 6-8 specific services or actions.
5. Provide 5 thorough, unique FAQs with realistic answers that seamlessly embed the toll-free assistance number (${tfn}).
6. Use factual, cautious language.

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
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const cleanText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
          content = JSON.parse(cleanText || 'null');
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
          const rawText = response.choices[0]?.message?.content || '';
          const cleanText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
          content = JSON.parse(cleanText || 'null');
        }
        const normalized = normalizeAiContent(content);
        if (normalized) return res.json({ success: true, provider, data: normalized });
      } catch (providerError) {
        console.warn(`[AI provider failed: ${provider}]`, providerError);
      }
    }

    return res.json({ success: true, provider: 'template', data: fallbackAiContent(airlineName, city, keyword, tfn, entityTypeStr) });
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
    console.error('[Backend] Exception publishing:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Catch-all for API routes to return JSON instead of HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Setup Vite dev middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Automated-Blogger Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
