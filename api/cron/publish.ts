import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

async function getAccessToken(): Promise<string | null> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN || '',
        grant_type: 'refresh_token',
      }),
    });
    const data: any = await res.json();
    return data.access_token || null;
  } catch (e) {
    console.error('[Cron] Auth Error:', e);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  // 1. Verify Cron Secret
  const auth = req.headers.authorization || '';
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY.' });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return res.status(500).json({ error: 'Missing DEEPSEEK_API_KEY.' });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });

  try {
    // 2. Fetch pending topic from Supabase Queue
    const { data: topics, error: fetchError } = await supabase
      .from('topics')
      .select('*')
      .eq('status', 'pending')
      .limit(1);

    if (fetchError || !topics || topics.length === 0) {
      return res.json({ message: 'No pending topics in queue.' });
    }

    const topic = topics[0];
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error('Google Auth Failed');

    // 3. Fetch History (to ensure variety)
    const { data: history } = await supabase
      .from('blog_posts')
      .select('title')
      .order('created_at', { ascending: false })
      .limit(10);

    const previousTitles = history?.map(h => h.title).join(', ') || 'None';

    // 4. Generate AI Content (DeepSeek)
    const systemPrompt = `You are a world-class SEO content strategist specializing in travel and airline office blogs.
Your goal is to generate content that ranks #1 on Google, is highly engaging, and converts readers into callers.
Use a professional yet inviting tone.`;

    const userPrompt = `Generate a comprehensive blog post for: "${topic.topic}".
Target Keyword: ${topic.keyword}
Toll-Free Number: +1 (888) 794-3464

Recent History (Avoid these titles/angles): [${previousTitles}]

Requirements:
1. Catchy SEO Title (include keyword).
2. Engaging Overview (2-3 paragraphs).
3. List of 6-8 specific airline services.
4. 5 unique FAQs with detailed answers that include the TFN naturally.

Format as JSON:
{
  "title": "...",
  "overview": "...",
  "services": ["...", "..."],
  "faqs": [{"question": "...", "answer": "..."}]
}`;

    const aiRes = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    });

    const aiContent = JSON.parse(aiRes.choices[0].message.content || '{}');

    // 5. Generate Free AI Image (Pollinations)
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(topic.topic + ' travel photography airline office 4k')}?width=1200&height=630&seed=${seed}&model=flux`;

    // 6. Construct HTML (Market-Grade Template)
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #334155;">
        <h2>${aiContent.title}</h2>
        <img src="${imageUrl}" alt="${aiContent.title}" style="max-width:100%; height:auto; border-radius:12px; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; border-left: 5px solid #0284c7; margin-bottom: 25px;">
           <p style="margin: 0;">${aiContent.overview.replace(/\n\n/g, '</p><p style="margin-top: 15px;">')}</p>
        </div>

        <h3 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Key Services & Assistance</h3>
        <ul style="padding-left: 20px;">
          ${aiContent.services.map((s: string) => `<li style="margin-bottom: 8px;"><strong>${s}</strong></li>`).join('')}
        </ul>

        <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #fff; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
           <div style="text-transform: uppercase; font-size: 13px; font-weight: bold; letter-spacing: 1px; color: #ffeb3b; margin-bottom: 10px;">24/7 Priority Support Desk</div>
           <a href="tel:+18887943464" style="color: #fff; font-size: 24px; font-weight: 900; text-decoration: none;">📞 Call Toll-Free: +1 (888) 794-3464</a>
        </div>

        <h3 style="color: #0f172a;">Frequently Asked Questions</h3>
        ${aiContent.faqs.map((f: any) => `
          <div style="margin-bottom: 20px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
            <strong style="display: block; color: #1e293b; margin-bottom: 5px;">Q: ${f.question}</strong>
            <p style="margin: 0; font-size: 14px;">A: ${f.answer}</p>
          </div>
        `).join('')}

        <p style="font-size: 12px; color: #64748b; margin-top: 40px; border-top: 1px solid #e2e8f0; pt: 10px;">
          Disclaimer: This is an independent travel directory. For official ticketing policies, contact the airline directly at +1 (888) 794-3464.
        </p>
      </div>
    `;

    // 7. Publish to Blogger
    const bloggerUrl = `https://www.googleapis.com/blogger/v3/blogs/${process.env.BLOGGER_BLOG_ID}/posts`;
    const publishRes = await fetch(bloggerUrl, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        title: aiContent.title,
        content: htmlContent,
        labels: ['Automated', topic.keyword || 'Travel']
      }),
    });

    const publishData: any = await publishRes.json();
    if (!publishRes.ok) throw new Error(publishData.error?.message || 'Blogger API Error');

    // 8. Log to History (blog_posts)
    await supabase.from('blog_posts').insert({
      title: aiContent.title,
      content: htmlContent,
      airline_name: topic.topic.split(' ')[0], // Best effort
      city: topic.topic.includes(' in ') ? topic.topic.split(' in ')[1] : 'Unknown'
    });

    // 9. Update Queue Status
    await supabase
      .from('topics')
      .update({ status: 'published', post_url: publishData.url })
      .eq('id', topic.id);

    return res.json({ success: true, url: publishData.url });

  } catch (error: any) {
    console.error('[Cron Error]:', error);
    return res.status(500).json({ error: error.message });
  }
}
