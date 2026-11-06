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

/**
 * Standardized Access Token Retrieval using Refresh Token
 */
/**
 * Standardized Access Token Retrieval using Refresh Token
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';

    if (!refreshToken) {
      console.warn('[Backend] No GOOGLE_REFRESH_TOKEN available in environment.');
      return null;
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
    
    // Retry without secret if unauthorized_client (common for public/playground clients)
    if (!data.access_token && clientSecret && (data.error === 'unauthorized_client' || data.error === 'invalid_client')) {
      console.log('[Backend] Auth failed with secret. Retrying WITHOUT client_secret...');
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
      return retryData.access_token || null;
    }

    if (!data.access_token) {
      console.error('[Backend] Token refresh failed:', JSON.stringify(data));
      return null;
    }
    return data.access_token;
  } catch (e) {
    console.error('[Backend] Refresh Error:', e);
    return null;
  }
}

app.get(['/api/status', '/status'], async (req, res) => {
  const token = await getAccessToken();
  res.json({ connected: !!token });
});

app.post(['/api/blogger/publish', '/blogger/publish'], async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${process.env.PUBLISH_SECRET}`) {
    // If not production or secret not set, allow for preview testing
    if (process.env.NODE_ENV === 'production' || process.env.PUBLISH_SECRET) {
       return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const { title, content, labels, isDraft, customMetaData, googleAuthConfig } = req.body;
  const blogId = req.body.blogId || process.env.BLOGGER_BLOG_ID;

  if (!blogId || !title || !content) {
    return res.status(400).json({ error: 'Missing blogId, title or content.' });
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return res.status(401).json({ 
      error: 'Google token refresh failed. Ensure a Refresh Token is provided via environment variables or the configuration modal.',
      needsConfig: true
    });
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
    console.log(`[AutoBlog Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
