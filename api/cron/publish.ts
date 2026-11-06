import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

function escapeHtml(unsafe: string = ''): string {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&#39;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || '';

  if (!clientId || !refreshToken) {
    console.error('[Cron Auth] Missing GOOGLE_CLIENT_ID or GOOGLE_REFRESH_TOKEN');
    return null;
  }

  try {
    const params = new URLSearchParams({
      client_id: clientId,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    if (clientSecret) params.append('client_secret', clientSecret);

    let res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    let data: any = await res.json();

    if (data.access_token) {
      return data.access_token;
    }

    // If client_secret caused unauthorized_client, retry cleanly without secret
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
      return retryData.access_token || null;
    }

    console.error('[Cron Auth Error]:', data);
    return null;
  } catch (e) {
    console.error('[Cron Auth Exception]:', e);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  // 1. Verify Cron Secret or Admin Authorization
  const auth = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET || process.env.PUBLISH_SECRET || '';
  
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized. Invalid CRON_SECRET.' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.' });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'Missing DEEPSEEK_API_KEY in environment variables.' });
  }

  const blogId = process.env.BLOGGER_BLOG_ID || '1660638823295885987';

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });

  let currentTopic: any = null;

  try {
    // 2. Fetch pending topic from Supabase Queue
    const { data: topics, error: fetchError } = await supabase
      .from('topics')
      .select('*')
      .eq('status', 'pending')
      .order('id', { ascending: true })
      .limit(1);

    if (fetchError) {
      console.error('[Cron Supabase Fetch Error]:', fetchError);
      return res.status(500).json({ error: fetchError.message });
    }

    if (!topics || topics.length === 0) {
      return res.json({ message: 'No pending topics in Supabase queue.' });
    }

    currentTopic = topics[0];

    // 3. Mark topic 'processing' immediately to prevent duplicate runs
    await supabase
      .from('topics')
      .update({ status: 'processing' })
      .eq('id', currentTopic.id);

    // 4. Validate Google Access Token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Google OAuth Access Token could not be retrieved. Check GOOGLE_CLIENT_ID and GOOGLE_REFRESH_TOKEN.');
    }

    // 5. Fetch Past Post History for Anti-Cannibalization
    const { data: history } = await supabase
      .from('blog_posts')
      .select('title')
      .order('created_at', { ascending: false })
      .limit(10);

    const previousTitles = history?.map(h => h.title).join(', ') || 'None';

    // Parse Airline & City from topic string
    const topicRaw = currentTopic.topic || '';
    const airlineName = topicRaw.split(' ')[0] || 'Airline';
    const city = topicRaw.includes(' in ') ? topicRaw.split(' in ')[1].trim() : 'International';

    // 6. DeepSeek AI Content Generation
    const systemPrompt = `You are a premier aviation journalist and travel directory editor.
Generate comprehensive, factual, helpful, and non-deceptive airline office and passenger support guides.
Write in a professional, objective tone. Always clearly identify this resource as an independent travel directory.`;

    const userPrompt = `Write an in-depth, verified passenger guide for "${currentTopic.topic}".
Target Keyword: ${currentTopic.keyword || 'Airline Office, Contact & Flight Assistance'}
Toll-Free Assistance Desk to naturally embed: +1 (888) 794-3464

Past titles in this cluster: [${previousTitles}].
CRITICAL: Ensure unique phrasing, distinct paragraph structures, and authentic traveler advice.

Requirements:
1. High-CTR SEO Title (include airline name, city, and guide focus).
2. Comprehensive Overview (2-3 detailed paragraphs explaining airport terminal location, passenger check-in desks, baggage assistance, and rebooking services).
3. 6-8 Specific Airline Services (e.g. ticket booking, flight rescheduling, baggage PIR tracking, pet travel policies, wheelchair assistance, refund guidelines under DOT rules).
4. 5 Helpful FAQs with detailed answers that mention the independent assistance helpline (+1 (888) 794-3464) naturally.

Format as JSON:
{
  "title": "...",
  "overview": "...",
  "services": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

    const aiRes = await openai.chat.completions.create({
      model: 'deepseek-chat',
      temperature: 0.85,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const aiContent = JSON.parse(aiRes.choices[0].message.content || '{}');
    const safeTitle = aiContent.title || `${airlineName} ${city} Office Guide (2026)`;
    const safeOverview = aiContent.overview || '';
    const services = Array.isArray(aiContent.services) ? aiContent.services : [];
    const faqs = Array.isArray(aiContent.faqs) ? aiContent.faqs : [];

    // 7. Visual Banner Generation (Pollinations FLUX Model)
    const seed = Math.floor(Math.random() * 1000000);
    const imagePrompt = encodeURIComponent(`${airlineName} aircraft passenger terminal ${city} airport travel photography`);
    const imageUrl = `https://pollinations.ai/p/${imagePrompt}?width=1200&height=630&seed=${seed}&model=flux`;

    // 8. Construct Legitimate, Non-Deceptive HTML Template with Authority & Policy Links
    const overviewHtml = safeOverview
      .split('\n\n')
      .map((p: string) => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #334155;">${escapeHtml(p)}</p>`)
      .join('');

    const servicesHtml = services
      .map((s: string) => `<li style="margin-bottom: 10px; color: #1e293b;"><strong>${escapeHtml(s)}:</strong> Passenger support, itinerary updates, and ticketing desk services.</li>`)
      .join('');

    const faqsHtml = faqs
      .map((f: any) => `
        <div style="margin-bottom: 16px; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <strong style="display: block; color: #0f172a; font-size: 15px; margin-bottom: 6px;">Q: ${escapeHtml(f.question)}</strong>
          <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">${escapeHtml(f.answer)}</p>
        </div>
      `).join('');

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 26px; color: #0f172a; font-weight: 800; line-height: 1.3;">${escapeHtml(safeTitle)}</h2>
        <img src="${imageUrl}" alt="${escapeHtml(safeTitle)}" style="max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; box-shadow: 0 6px 18px rgba(0,0,0,0.08);" />
        
        <!-- Table of Contents & Quick Navigation -->
        <div style="background: #f1f5f9; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 6px; margin: 22px 0; font-size: 14px;">
          <strong style="color: #0f172a; display: block; margin-bottom: 8px;">Table of Contents:</strong>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #0284c7;">
            <li>1. Overview &amp; Airport Terminal Location</li>
            <li>2. Key Passenger Support Services</li>
            <li>3. Verified Portals, DOT Resources &amp; Carrier Policies</li>
            <li>4. Passenger Rights &amp; Cancellation Procedures</li>
            <li>5. Frequently Asked Questions (FAQs)</li>
          </ul>
        </div>

        <!-- Overview Section -->
        <div style="background: #ffffff; padding: 10px 0;">
          ${overviewHtml}
        </div>

        <!-- Verified Portals & Authority Links (Requirement: Real External Policy Links) -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 28px 0; border: 1px solid #e2e8f0; text-align: center;">
          <strong style="color: #0f172a; display: block; margin-bottom: 12px; font-size: 15px;">🌐 Official Portals, Policy Guidelines &amp; Authority Links:</strong>
          <div style="line-height: 2.6;">
            <a href="https://www.transportation.gov/airconsumer/file-consumer-complaint" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 4px 6px; padding: 8px 16px; background: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: bold;">⚖️ US DOT Consumer Protection Portal</a>
            <a href="https://www.transportation.gov/airconsumer/fly-rights" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 4px 6px; padding: 8px 16px; background: #0369a1; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: bold;">📜 US DOT Fly Rights Guide</a>
            <a href="https://easyflightconnectblog.blogspot.com/" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 4px 6px; padding: 8px 16px; background: #0284c7; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: bold;">✈️ EasyFlightConnect Directory</a>
            <a href="https://automated-blogger-one.vercel.app" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 4px 6px; padding: 8px 16px; background: #334155; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: bold;">🛡️ Platform Terms &amp; Policies</a>
          </div>
        </div>

        <!-- Key Services -->
        <h3 style="color: #0f172a; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-top: 30px;">
          Key Services Handled at the ${escapeHtml(city)} Desk
        </h3>
        <ul style="padding-left: 20px; font-size: 15px;">
          ${servicesHtml}
        </ul>

        <!-- Independent Assistance Helpline Callout -->
        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin: 32px 0; box-shadow: 0 4px 16px rgba(2,132,199,0.25);">
          <div style="text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; color: #ffeb3b; margin-bottom: 8px;">
            24/7 Independent Travel Support &amp; Flight Assistance
          </div>
          <p style="margin: 0 0 14px 0; font-size: 14px; color: #e0f2fe;">
            Need urgent assistance with flight reservations, rebooking, ticket changes, or passenger support?
          </p>
          <a href="tel:+18887943464" style="display: inline-block; background: #ffffff; color: #0284c7; padding: 12px 28px; font-size: 20px; font-weight: 900; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            📞 Call Toll-Free: +1 (888) 794-3464
          </a>
        </div>

        <!-- FAQs -->
        <h3 style="color: #0f172a; font-size: 20px; margin-top: 30px;">
          Frequently Asked Questions
        </h3>
        ${faqsHtml}

        <!-- Explicit Legitimate Disclaimer (Correct CSS: padding-top instead of pt:) -->
        <div style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 14px; background: #f8fafc; padding: 16px; border-radius: 8px;">
          <strong>Disclaimer &amp; Transparency Notice:</strong> EasyFlightConnect is an independent online travel resource directory providing public airline office contact details, passenger rights guidelines, and general travel support information. We are not directly affiliated with, sponsored by, or endorsed by any specific commercial airline. For official ticketing rules, carriage contracts, and carrier policies, travelers can refer to the official airline portals or contact the independent passenger assistance desk at <a href="tel:+18887943464" style="color: #0284c7; font-weight: bold;">+1 (888) 794-3464</a>.
        </div>
      </div>
    `;

    // 9. Publish to Google Blogger
    const isDraft = process.env.BLOGGER_PUBLISH_AS_DRAFT === 'true';
    const bloggerUrl = `https://www.googleapis.com/blogger/v3/blogs/${encodeURIComponent(blogId)}/posts${isDraft ? '?isDraft=true' : ''}`;
    
    const labels = [
      airlineName,
      `${city} Airport Office`,
      'Flight Reservations',
      'Travel Directory',
      'Passenger Rights',
      currentTopic.keyword || 'Aviation Guide'
    ];

    const publishRes = await fetch(bloggerUrl, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        title: safeTitle,
        content: htmlContent,
        labels: labels
      }),
    });

    const publishData: any = await publishRes.json();
    if (!publishRes.ok) {
      throw new Error(publishData.error?.message || 'Google Blogger API Error');
    }

    // 10. Update Queue Status in Supabase (Mark 'published')
    await supabase
      .from('topics')
      .update({ status: 'published', post_url: publishData.url })
      .eq('id', currentTopic.id);

    // 11. Log to History (blog_posts) with fallback safety
    try {
      await supabase.from('blog_posts').insert({
        title: safeTitle,
        content: htmlContent,
        airline_name: airlineName,
        city: city,
        created_at: new Date().toISOString()
      });
    } catch (historyErr) {
      console.warn('[Cron History Insert Warning]:', historyErr);
    }

    return res.json({ 
      success: true, 
      url: publishData.url, 
      id: publishData.id, 
      title: safeTitle,
      isDraft: isDraft 
    });

  } catch (error: any) {
    console.error('[Cron Error]:', error);

    // Rollback topic to 'pending' if it failed so it can be retried cleanly
    if (currentTopic?.id) {
      try {
        await supabase
          .from('topics')
          .update({ status: 'pending' })
          .eq('id', currentTopic.id);
      } catch (rollbackErr) {
        console.error('[Cron Rollback Error]:', rollbackErr);
      }
    }

    return res.status(500).json({ error: error.message || 'Cron execution failed.' });
  }
}
