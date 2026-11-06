import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

/**
 * Standardized Access Token Retrieval using Refresh Token
 */
/**
 * Standardized Access Token Retrieval using Refresh Token
 */
async function getAccessToken(overrides?: any): Promise<string | null> {
  try {
    const hasOverrides = overrides && (overrides.client_id || overrides.refresh_token);
    
    const clientId = overrides?.client_id || process.env.GOOGLE_CLIENT_ID || '';
    const refreshToken = overrides?.refresh_token || process.env.GOOGLE_REFRESH_TOKEN || '';
    
    let clientSecret = overrides?.client_secret || process.env.GOOGLE_CLIENT_SECRET;
    if (!clientSecret && !hasOverrides && !process.env.GOOGLE_CLIENT_ID) {
      clientSecret = '';
    }

    if (!refreshToken) return null;

    const params: any = {
      client_id: clientId,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };
    if (clientSecret) params.client_secret = clientSecret;

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params),
    });
    
    const data: any = await res.json();
    
    if (!data.access_token && clientSecret && (data.error === 'unauthorized_client' || data.error === 'invalid_client')) {
      const retryParams = new URLSearchParams(params);
      retryParams.delete('client_secret');
      const retryRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: retryParams,
      });
      const retryData = await retryRes.json();
      return retryData.access_token || null;
    }

    return data.access_token || null;
  } catch (e) {
    console.error('[Vercel API] Refresh Error:', e);
    return null;
  }
}

app.get(['/api/status', '/status'], async (req, res) => {
  const token = await getAccessToken(req.query);
  res.json({ connected: !!token });
});

app.post(['/api/blogger/publish', '/blogger/publish'], async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${process.env.PUBLISH_SECRET}`) {
    if (process.env.NODE_ENV === 'production' || process.env.PUBLISH_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const { title, content, labels, isDraft, customMetaData, googleAuthConfig } = req.body;
  const blogId = req.body.blogId || process.env.BLOGGER_BLOG_ID;

  if (!blogId || !title || !content) {
    return res.status(400).json({ error: 'Missing blogId, title or content.' });
  }

  const accessToken = await getAccessToken(googleAuthConfig);
  if (!accessToken) {
    return res.status(401).json({ error: 'Google token refresh failed.', needsConfig: true });
  }

  try {
    const url = `https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}/posts${isDraft ? '?isDraft=true' : ''}`;
    const payload: any = { title, content };
    if (labels?.length) payload.labels = labels;
    if (customMetaData) payload.customMetaData = String(customMetaData).trim();

    const r = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
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

export default app;
