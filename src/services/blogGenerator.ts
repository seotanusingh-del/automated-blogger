import { AirlineItem, AirlineOffice, GeneratedPost, SocialLinks, PostSections, BloggerSubSettings } from '../types/airline';
import { getCoordinatesForCity } from '../data/cityCoordinates';

/**
 * Generate engaging, professional SVG banner matching Light or Dark theme
 */
export function generateOfficeBannerSvg(
  airline: string, 
  officeName: string, 
  city: string, 
  tfnNumber: string,
  theme: 'light' | 'dark' = 'light'
): string {
  const isSouthwest = airline.toLowerCase().includes('southwest');
  const isDelta = airline.toLowerCase().includes('delta');
  const isAmerican = airline.toLowerCase().includes('american');
  const isFrontier = airline.toLowerCase().includes('frontier');
  const isAlaska = airline.toLowerCase().includes('alaska');

  const brandAccent = isSouthwest ? '#ffc107' :
                      (isDelta || isAmerican) ? '#c8102e' :
                      isFrontier ? '#006643' :
                      isAlaska ? '#00a3e0' : '#0284c7';

  let svg = '';

  if (theme === 'light') {
    // Engaging, bright, eye-friendly light theme banner
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
      <defs>
        <linearGradient id="lightBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#f0f9ff" />
          <stop offset="100%" stop-color="#e0f2fe" />
        </linearGradient>
        <linearGradient id="tfnLightBtn" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0284c7" />
          <stop offset="100%" stop-color="#0369a1" />
        </linearGradient>
        <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0369a1" flood-opacity="0.15" />
        </filter>
      </defs>
      
      <rect width="1200" height="630" fill="url(#lightBg)"/>
      <rect x="20" y="20" width="1160" height="590" rx="16" fill="none" stroke="#bae6fd" stroke-width="2"/>
      
      <path d="M-50,450 C350,150 750,550 1250,100" fill="none" stroke="${brandAccent}" stroke-width="2.5" stroke-dasharray="10 10" opacity="0.35"/>
      <path d="M-50,550 C450,280 800,600 1250,220" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 6" opacity="0.25"/>
      
      <g transform="translate(1000, 130) rotate(-20) scale(1.8)" opacity="0.85">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${brandAccent}"/>
      </g>

      <g transform="translate(80, 75)">
        <rect width="360" height="42" rx="21" fill="#ffffff" stroke="#bae6fd" stroke-width="1.5" filter="url(#shadow)"/>
        <text x="180" y="26" fill="#0369a1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" text-anchor="middle" letter-spacing="1">
          AIRLINE HELPLINE &amp; DISPUTE DIRECTORY
        </text>
      </g>
      
      <text x="80" y="180" fill="${brandAccent}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="800" letter-spacing="1">
        ${escapeXml(airline.toUpperCase())}
      </text>
      
      <text x="80" y="250" fill="#0f172a" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="800">
        ${escapeXml(city)} Support Desk &amp; Dispute Guide
      </text>

      <text x="80" y="305" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500">
        ${escapeXml(officeName)}
      </text>
      
      <g transform="translate(80, 360)">
        <text x="0" y="0" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600">
          ✓ Official Complaint Filing, Compensation &amp; Refund Escalations
        </text>
        <text x="0" y="38" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600">
          ✓ 24/7 Priority Ticket Booking, Seat Changes &amp; Flight Re-routing
        </text>
        <text x="0" y="76" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600">
          ✓ Lost Baggage PIR Tracking &amp; Airport Terminal Counters
        </text>
      </g>

      <g transform="translate(80, 480)">
        <rect width="520" height="74" rx="37" fill="url(#tfnLightBtn)" filter="url(#shadow)"/>
        <text x="260" y="32" fill="#e0f2fe" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" text-anchor="middle" letter-spacing="1">
          CALL TOLL-FREE 24/7 RESOLUTIONS &amp; BOOKING
        </text>
        <text x="260" y="58" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="900" text-anchor="middle">
          ${escapeXml(tfnNumber)}
        </text>
      </g>

      <text x="1120" y="580" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" text-anchor="end">
        easyflightconnectblog.blogspot.com
      </text>
    </svg>`;
  } else {
    // Sleek Dark Theme Banner
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
      <defs>
        <linearGradient id="darkBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#002244" />
          <stop offset="100%" stop-color="#050e24" />
        </linearGradient>
        <linearGradient id="tfnDarkBtn" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ff3b30" />
          <stop offset="100%" stop-color="#ff9500" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#darkBg)"/>
      
      <path d="M-50,450 C350,150 750,550 1250,100" fill="none" stroke="${brandAccent}" stroke-width="2.5" stroke-dasharray="10 10" opacity="0.4"/>
      <path d="M-50,550 C450,280 800,600 1250,220" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.2"/>
      
      <g transform="translate(1000, 140) rotate(-20) scale(1.8)">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${brandAccent}" opacity="0.85"/>
      </g>

      <g transform="translate(80, 80)">
        <rect width="360" height="40" rx="20" fill="rgba(255,255,255,0.12)" stroke="${brandAccent}" stroke-width="1.5"/>
        <text x="180" y="25" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" text-anchor="middle" letter-spacing="1">
          AIRLINE HELPLINE &amp; DISPUTE DIRECTORY
        </text>
      </g>
      
      <text x="80" y="180" fill="${brandAccent}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="800" letter-spacing="1">
        ${escapeXml(airline.toUpperCase())}
      </text>
      
      <text x="80" y="250" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="50" font-weight="800">
        ${escapeXml(city)} Support Desk &amp; Dispute Guide
      </text>

      <text x="80" y="310" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22">
        ${escapeXml(officeName)}
      </text>
      
      <g transform="translate(80, 360)">
        <text x="0" y="0" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20">
          ✓ Official Complaint Filing, Compensation &amp; Refund Escalations
        </text>
        <text x="0" y="38" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20">
          ✓ 24/7 Priority Ticket Booking, Seat Changes &amp; Flight Re-routing
        </text>
        <text x="0" y="76" fill="#e2e8f0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20">
          ✓ Lost Baggage PIR Tracking &amp; Airport Terminal Counters
        </text>
      </g>

      <g transform="translate(80, 480)">
        <rect width="520" height="74" rx="37" fill="url(#tfnDarkBtn)"/>
        <text x="260" y="34" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" text-anchor="middle" letter-spacing="1">
          CALL 24/7 TOLL-FREE SUPPORT
        </text>
        <text x="260" y="60" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="900" text-anchor="middle">
          ${escapeXml(tfnNumber)}
        </text>
      </g>

      <text x="1120" y="580" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" text-anchor="end">
        easyflightconnectblog.blogspot.com
      </text>
    </svg>`;
  }

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function escapeXml(unsafe: string) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '"';
      default: return c;
    }
  });
}

/**
 * Reassemble HTML from structured sections, solid authority redirect links, Table of Contents, and Schema.org
 */
export function buildHtmlFromSections(
  title: string,
  bannerImg: string,
  tfnNumber: string,
  airlineName: string,
  officeTitle: string,
  city: string,
  country: string,
  sections: PostSections,
  socialLinks?: SocialLinks,
  bloggerSettings?: BloggerSubSettings
): string {
  const cleanTfn = tfnNumber.trim() || '+1 (888) 794-3464';
  const telLink = cleanTfn.replace(/[^0-9+]/g, '');
  const permalinkSlug = bloggerSettings?.permalinkSlug || `${airlineName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-office`;
  const canonicalUrl = `https://easyflightconnectblog.blogspot.com/2026/10/${permalinkSlug}.html`;
  const searchDesc = bloggerSettings?.searchDescription || `Complete ${airlineName} ${city} office guide. Dispute process, flight reservations, baggage compensation & 24/7 hotline ${cleanTfn}.`;

  // Robots & SEO meta tags
  const robotsDirectives = bloggerSettings?.customRobotTags
    ? `${bloggerSettings.customRobotTags.index ? 'index' : 'noindex'}, ${bloggerSettings.customRobotTags.follow ? 'follow' : 'nofollow'}${bloggerSettings.customRobotTags.maxSnippet ? ', max-snippet:-1' : ''}${bloggerSettings.customRobotTags.maxImagePreview ? ', max-image-preview:large' : ''}${bloggerSettings.customRobotTags.noarchive ? ', noarchive' : ''}`
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  // Authority & Redirect Badges
  let linksHtml = '';
  if (socialLinks) {
    const badges: string[] = [];

    // Official & Authority redirect links
    if (socialLinks.website && socialLinks.website.trim()) {
      badges.push(`<a href="${socialLinks.website}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">🌐 Official Website</a>`);
    }
    if (socialLinks.supportUrl && socialLinks.supportUrl.trim()) {
      badges.push(`<a href="${socialLinks.supportUrl}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#0284c7;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">🛟 Help &amp; Support Portal</a>`);
    }
    // High-Authority Government Aviation Complaint Link
    badges.push(`<a href="https://www.transportation.gov/airconsumer/file-consumer-complaint" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#1e3a8a;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">⚖️ US DOT Official Complaint Portal</a>`);
    // Internal Directory Cross-Link
    badges.push(`<a href="https://easyflightconnectblog.blogspot.com/" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#0369a1;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">✈️ EasyFlightConnect Directory</a>`);

    if (socialLinks.whatsapp && socialLinks.whatsapp.trim()) {
      badges.push(`<a href="${socialLinks.whatsapp}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#25d366;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">💬 WhatsApp Chat</a>`);
    }

    // Social Media Platforms
    if (socialLinks.facebook && socialLinks.facebook.trim()) {
      badges.push(`<a href="${socialLinks.facebook}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#1877f2;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">Facebook</a>`);
    }
    if (socialLinks.twitter && socialLinks.twitter.trim()) {
      badges.push(`<a href="${socialLinks.twitter}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#000000;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">X (Twitter)</a>`);
    }
    if (socialLinks.instagram && socialLinks.instagram.trim()) {
      badges.push(`<a href="${socialLinks.instagram}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#e4405f;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">Instagram</a>`);
    }
    if (socialLinks.linkedin && socialLinks.linkedin.trim()) {
      badges.push(`<a href="${socialLinks.linkedin}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#0077b5;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">LinkedIn</a>`);
    }
    if (socialLinks.youtube && socialLinks.youtube.trim()) {
      badges.push(`<a href="${socialLinks.youtube}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#ff0000;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">YouTube</a>`);
    }

    // Custom user links
    if (socialLinks.customLinks && Array.isArray(socialLinks.customLinks)) {
      socialLinks.customLinks.forEach((c) => {
        if (c.url && c.url.trim()) {
          badges.push(`<a href="${c.url}" target="_blank" rel="noopener" style="display:inline-block;margin:4px 6px;padding:8px 16px;background:#475569;color:#ffffff;text-decoration:none;border-radius:20px;font-size:12px;font-weight:bold;">🔗 ${escapeXml(c.label || 'Link')}</a>`);
        }
      });
    }

    if (badges.length > 0) {
      linksHtml = `
<div id="resources" style="background:#f8fafc;padding:18px 20px;border-radius:10px;margin:24px 0;border:1px solid #e2e8f0;text-align:center;">
  <strong style="color:#0f172a;display:block;margin-bottom:10px;font-size:14px;">Official Portals, Authority Links &amp; Verified Resources:</strong>
  <div style="line-height:2.4;">
    ${badges.join(' ')}
  </div>
</div>`;
    }
  }

  // Dispute Steps (Like everts-air-dispute-complaint-process)
  const disputeSteps = sections.disputeSteps || [
    { stepNumber: 1, title: 'Gather Passenger Documentation & PIR Reference', instruction: `Collect your 6-character PNR booking reference, e-ticket copy, boarding pass, and baggage Property Irregularity Report (PIR) receipt issued by ${airlineName} ground staff.` },
    { stepNumber: 2, title: `Contact ${airlineName} Immediate Dispute Line`, instruction: `Call the 24/7 customer resolution hotline at ${cleanTfn} to speak directly with an escalated ticketing agent for same-day rebooking, flight voucher issues, or refund claims.` },
    { stepNumber: 3, title: 'Submit Formal Electronic Claim to Carrier Relations', instruction: `Submit your formal claim through the airline dispute portal within 30 days of the incident, specifying exact flight numbers and monetary claim amounts.` },
    { stepNumber: 4, title: 'Escalate to the US Department of Transportation (DOT)', instruction: `If ${airlineName} does not provide a satisfactory response within 30 to 60 days, file an official consumer complaint directly with the <a href="https://www.transportation.gov/airconsumer/file-consumer-complaint" target="_blank" rel="noopener" style="color:#0284c7;font-weight:bold;">US DOT Aviation Consumer Protection Office</a>.` }
  ];

  const disputeStepsHtml = disputeSteps.map(step => `
<div style="margin:16px 0;padding:16px;border-left:4px solid #0284c7;background:#f8fafc;border-radius:0 8px 8px 0;">
  <strong style="color:#0369a1;font-size:15px;">Step ${step.stepNumber}: ${escapeXml(step.title)}</strong>
  <p style="margin:6px 0 0 0;font-size:14px;color:#334155;line-height:1.6;">${step.instruction}</p>
</div>`).join('');

  // Compensation Rights Table
  const compensationRows = sections.compensationTable || [
    { event: 'Involuntary Denied Boarding (Overbooking)', right: 'Up to 400% of one-way fare (max $1,550 under DOT rules)', action: 'Immediate cash/check compensation before departure' },
    { event: 'Flight Cancellation / Significant Delay', right: 'Full refund to original payment method or free rebooking', action: 'Request full cash refund, not travel vouchers' },
    { event: 'Delayed or Damaged Checked Luggage', right: 'Up to $3,800 reimbursement under domestic air carriage', action: 'File PIR claim at airport within 24 hours of arrival' }
  ];

  const compensationHtml = `
<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
  <thead>
    <tr style="background:#0f172a;color:#ffffff;">
      <th style="padding:12px 14px;border:1px solid #334155;width:30%;">Disruption Incident</th>
      <th style="padding:12px 14px;border:1px solid #334155;width:40%;">Passenger Legal Right</th>
      <th style="padding:12px 14px;border:1px solid #334155;">Required Action</th>
    </tr>
  </thead>
  <tbody>
    ${compensationRows.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
      <td style="padding:11px 14px;border:1px solid #e2e8f0;font-weight:bold;color:#0f172a;">${escapeXml(r.event)}</td>
      <td style="padding:11px 14px;border:1px solid #e2e8f0;color:#334155;">${escapeXml(r.right)}</td>
      <td style="padding:11px 14px;border:1px solid #e2e8f0;color:#0369a1;font-weight:500;">${escapeXml(r.action)}</td>
    </tr>`).join('')}
  </tbody>
</table>`;

  const servicesListHtml = sections.servicesList
    .map(srv => `  <li><strong>${escapeXml(srv)}:</strong> Priority assistance for passenger tickets, rebooking, and inquiries.</li>`)
    .join('\n');

  const faqsHtml = sections.faqs
    .map(faq => `
<div style="margin:14px 0;padding:14px 18px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
  <strong style="color:#0f172a;display:block;font-size:15px;margin-bottom:6px;">Q: ${escapeXml(faq.question)}</strong>
  <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${escapeXml(faq.answer)}</p>
</div>`)
    .join('');

  // Schema.org JSON-LD Structured Data for Google Rich Snippets & Fast Crawling
  const schemaJson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        "isPartOf": { "@id": "https://easyflightconnectblog.blogspot.com" },
        "headline": title,
        "description": searchDesc,
        "image": bannerImg.startsWith('http') ? bannerImg : "https://easyflightconnectblog.blogspot.com/favicon.ico",
        "datePublished": "2026-10-15T08:00:00+00:00",
        "dateModified": new Date().toISOString(),
        "publisher": {
          "@type": "Organization",
          "name": "EasyFlightConnect",
          "url": "https://easyflightconnectblog.blogspot.com"
        }
      },
      {
        "@type": "ContactPoint",
        "telephone": cleanTfn,
        "contactType": "customer service",
        "availableLanguage": ["English", "Spanish"],
        "areaServed": country || "United States"
      },
      {
        "@type": "FAQPage",
        "mainEntity": sections.faqs.map(f => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      }
    ]
  };

  const schemaHtml = `<script type="application/ld+json">
${JSON.stringify(schemaJson, null, 2)}
</script>`;

  return `<!-- SEO Meta & Robots Directives -->
<meta name="description" content="${escapeXml(searchDesc)}" />
<meta name="robots" content="${escapeXml(robotsDirectives)}" />
<meta name="googlebot" content="${escapeXml(robotsDirectives)}" />
<link rel="canonical" href="${canonicalUrl}" />
${schemaHtml}

<h2>${escapeXml(title)}</h2>
<img src="${bannerImg}" alt="${escapeXml(airlineName)} ${escapeXml(officeTitle)} Customer Support and Flight Desk" style="max-width:100%;height:auto;border-radius:10px;margin:16px 0;box-shadow:0 6px 18px rgba(0,0,0,0.12);" />

<!-- Table of Contents / Anchor Redirects -->
<div style="background:#f1f5f9;border-left:4px solid #0284c7;padding:14px 18px;border-radius:6px;margin:20px 0;font-size:14px;">
  <strong style="color:#0f172a;display:block;margin-bottom:8px;">Table of Contents (Jump to Section):</strong>
  <ul style="margin:0;padding-left:20px;line-height:1.8;color:#0284c7;">
    <li><a href="#overview" style="color:#0284c7;text-decoration:none;font-weight:600;">1. Overview &amp; Key Contacts</a></li>
    <li><a href="#dispute-steps" style="color:#0284c7;text-decoration:none;font-weight:600;">2. Step-by-Step Dispute &amp; Complaint Process</a></li>
    <li><a href="#directory" style="color:#0284c7;text-decoration:none;font-weight:600;">3. Office Details &amp; Contact Directory</a></li>
    <li><a href="#compensation" style="color:#0284c7;text-decoration:none;font-weight:600;">4. Passenger Compensation &amp; Refund Rights</a></li>
    <li><a href="#services" style="color:#0284c7;text-decoration:none;font-weight:600;">5. Services &amp; Ticketing Assistance</a></li>
    <li><a href="#faq" style="color:#0284c7;text-decoration:none;font-weight:600;">6. Frequently Asked Questions (FAQ)</a></li>
    <li><a href="#resources" style="color:#0284c7;text-decoration:none;font-weight:600;">7. Official Portals &amp; Social Links</a></li>
  </ul>
</div>

<div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 22px 26px; border-radius: 12px; margin: 24px 0; box-shadow: 0 4px 16px rgba(2,132,199,0.3); border-left: 6px solid #ff9500;">
  <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #ffeb3b; font-weight: bold; margin-bottom: 6px;">
    🚨 ${escapeXml(sections.urgentCalloutTitle)}
  </div>
  <p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.5; color: #ffffff;">
    ${escapeXml(sections.urgentCalloutDesc)}
  </p>
  <div style="text-align: center; margin-top: 12px;">
    <a href="tel:${telLink}" style="display: inline-block; background: #e11d48; color: #ffffff; padding: 14px 28px; font-size: 18px; font-weight: bold; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(225,29,72,0.4); border: 2px solid #ffffff;">
      📞 Call Toll-Free: ${cleanTfn}
    </a>
  </div>
</div>

<h2 id="overview">Overview of the ${escapeXml(airlineName)} ${escapeXml(city)} Office</h2>
<p>${escapeXml(sections.overviewPara1)}</p>
<p>${escapeXml(sections.overviewPara2)}</p>

<h2 id="dispute-steps">Step-by-Step ${escapeXml(airlineName)} Dispute &amp; Complaint Process</h2>
<p>Passengers encountering flight disruptions, delayed baggage, or billing disputes with <strong>${escapeXml(airlineName)}</strong> should follow this proven protocol to expedite settlement:</p>
${disputeStepsHtml}

<h2 id="directory">${escapeXml(airlineName)} ${escapeXml(city)} Office Details &amp; Directory</h2>
<table style="width:100%; border-collapse:collapse; margin:22px 0; font-size:14px; text-align:left; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
  <thead>
    <tr style="background:#0284c7; color:#ffffff;">
      <th style="padding:12px 14px; border:1px solid #cbd5e1; width:30%;">Key Service Detail</th>
      <th style="padding:12px 14px; border:1px solid #cbd5e1;">Official Information</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:11px 14px; border:1px solid #e2e8f0; font-weight:bold; background:#f8fafc;">Airline Name</td>
      <td style="padding:11px 14px; border:1px solid #e2e8f0;">${escapeXml(airlineName)}</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:11px 14px; border:1px solid #e2e8f0; font-weight:bold; background:#f8fafc;">Office Location</td>
      <td style="padding:11px 14px; border:1px solid #e2e8f0;">${escapeXml(officeTitle)}</td>
    </tr>
    <tr>
      <td style="padding:11px 14px; border:1px solid #e2e8f0; font-weight:bold; background:#f8fafc;">City &amp; Country</td>
      <td style="padding:11px 14px; border:1px solid #e2e8f0;">${escapeXml(city)}, ${escapeXml(country)}</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:11px 14px; border:1px solid #e2e8f0; font-weight:bold; background:#f8fafc;">Direct Helpline</td>
      <td style="padding:11px 14px; border:1px solid #e2e8f0;">
        <a href="tel:${telLink}" style="color:#0284c7; font-weight:bold; text-decoration:none;">${cleanTfn}</a> (Toll-Free 24/7)
      </td>
    </tr>
    <tr>
      <td style="padding:11px 14px; border:1px solid #e2e8f0; font-weight:bold; background:#f8fafc;">Working Hours</td>
      <td style="padding:11px 14px; border:1px solid #e2e8f0;">${escapeXml(sections.officeHours)}</td>
    </tr>
    <tr style="background:#ffffff;">
      <td style="padding:11px 14px; border:1px solid #e2e8f0; font-weight:bold; background:#f8fafc;">Terminal / Address</td>
      <td style="padding:11px 14px; border:1px solid #e2e8f0;">${escapeXml(sections.officeAddress)}</td>
    </tr>
  </tbody>
</table>

<h2 id="compensation">Passenger Rights &amp; Compensation Guidelines</h2>
<p>Under US federal regulations and international civil aviation treaties, travelers flying on <strong>${escapeXml(airlineName)}</strong> maintain legally protected rights:</p>
${compensationHtml}

<h2 id="services">Key Services Handled at the ${escapeXml(airlineName)} ${escapeXml(city)} Desk</h2>
<p>The customer service representatives at the <strong>${escapeXml(city)}</strong> center provide comprehensive solutions for all phases of your journey:</p>
<ul>
${servicesListHtml}
</ul>

<h2>How to Contact the ${escapeXml(airlineName)} ${escapeXml(city)} Office</h2>
<p>Passengers have multiple convenient avenues to reach the <strong>${escapeXml(airlineName)} ${escapeXml(city)}</strong> team:</p>
<ol>
  <li><strong>Telephone Helpline:</strong> For immediate assistance with flight disputes, refunds, or same-day reservations, call <a href="tel:${telLink}" style="color:#0284c7; font-weight:bold;">${cleanTfn}</a>. Live specialists can access global reservations systems in real-time.</li>
  <li><strong>Airport Passenger Desk:</strong> Visit the official airline check-in counter located in the main terminal prior to flight departure.</li>
  <li><strong>Aviation Consumer Protection:</strong> If unresolved, passengers can file an official complaint via the <a href="https://www.transportation.gov/airconsumer/file-consumer-complaint" target="_blank" rel="noopener" style="color:#0284c7; font-weight:bold;">US Department of Transportation Portal</a>.</li>
</ol>

<h2 id="faq">Frequently Asked Questions (FAQ)</h2>
${faqsHtml}
${linksHtml}
<div style="background:#f1f5f9; padding:16px 20px; border-radius:8px; margin:24px 0; border:1px solid #e2e8f0; font-size:13px; color:#475569;">
  <strong>Disclaimer:</strong> This website is an independent travel resource directory providing passenger guidance, contact numbers, and airline office updates. For official ticketing and carrier regulations, refer to airline policies or speak with a telephone representative at <a href="tel:${telLink}" style="color:#0284c7; font-weight:bold;">${cleanTfn}</a>.
</div>`;
}

/**
 * Generate market-grade SEO blog post matching easyflightconnectblog style
 */
export function generateOfficeBlogPost(
  airline: AirlineItem,
  office: AirlineOffice,
  keyword: string,
  tfnNumber: string,
  customImageUrl?: string,
  socialLinks?: SocialLinks,
  theme: 'light' | 'dark' = 'light'
): GeneratedPost {
  const cleanTfn = tfnNumber.trim() || '+1 (888) 794-3464';
  const city = office.city;
  const country = office.country;
  const officeTitle = office.name;
  const airlineName = airline.name;

  const defaultKeyword = keyword && keyword.trim().length > 0 
    ? keyword.trim() 
    : 'Dispute, Complaint Process & Contact Helpline';

  // Determine post title based on keyword or airline dispute style
  const isDisputeTopic = defaultKeyword.toLowerCase().includes('dispute') || defaultKeyword.toLowerCase().includes('complaint');
  
  const postTitle = isDisputeTopic
    ? `${airlineName} ${city} Dispute & Complaint Process: How to File, Compensation & Helpline (2026)`
    : `${airlineName} ${officeTitle}: Contact Number, Address & Flight Booking (2026 Guide)`;

  const permalinkSlug = `${airlineName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-office`;

  const bannerImg = customImageUrl || generateOfficeBannerSvg(airlineName, officeTitle, city, cleanTfn, theme);

  // Search description strictly 150-160 characters for maximum Google search CTR
  const searchDescription = `Complete guide for ${airlineName} ${city} office. Step-by-step dispute filing, compensation, ticket booking & 24/7 customer helpline ${cleanTfn}.`.slice(0, 160);

  // Geocoding Coordinates for Google Maps integration
  const coords = getCoordinatesForCity(city, country);

  // Blogger Automated Sub-Settings
  const bloggerSettings: BloggerSubSettings = {
    labels: [
      airlineName, 
      `${city} Office`, 
      `${airlineName} Dispute`, 
      'Flight Reservations', 
      'Customer Service', 
      'Complaint Process', 
      country
    ],
    permalinkSlug,
    searchDescription,
    location: {
      name: `${city}, ${country}`,
      lat: coords.lat,
      lng: coords.lng,
      span: '0.1,0.1'
    },
    readerComments: 'ALLOW',
    customRobotTags: {
      index: true,
      follow: true,
      noarchive: false,
      maxSnippet: true,
      maxImagePreview: true
    },
    authorityLinks: {
      dotComplaintUrl: 'https://www.transportation.gov/airconsumer/file-consumer-complaint',
      airlineOfficialUrl: socialLinks?.website || 'https://www.google.com/search?q=' + encodeURIComponent(`${airlineName} official website`),
      internalDirectoryUrl: 'https://easyflightconnectblog.blogspot.com/'
    }
  };

  const defaultSections: PostSections = {
    urgentCalloutTitle: '24/7 Priority Travel Assistance & Dispute Helpline',
    urgentCalloutDesc: `Need immediate assistance with your ${airlineName} dispute, flight reservations, same-day cancellations, name corrections, or lost luggage at the ${city} office? Connect with a live travel specialist instantly:`,
    overviewPara1: `Whether you are filing a formal dispute or planning a journey departing from ${city} (${country}), the ${airlineName} ${officeTitle} acts as the central service and liaison point for regional and international travelers. As airline operations evolve in 2026, having direct access to verified contact details, terminal hours, and passenger rights is crucial to avoiding unnecessary airport delays.`,
    overviewPara2: `Passengers visiting or calling the ${city} customer support center can obtain tailored guidance regarding flight cancellations, missed connection compensation, unaccompanied minors, pet cargo policies, and dispute resolution.`,
    officeHours: 'Monday to Sunday: 24 Hours / Terminal Check-in Windows',
    officeAddress: `${officeTitle}, Main Passenger Terminal, ${city}, ${country}`,
    servicesList: [
      'Dispute & Complaint Filing with Expedited Review',
      'Flight Cancellations & Cash Refund Processing',
      'New Flight Booking & Fare Quotes',
      'Ticket Rescheduling & Flight Changes',
      'Baggage Inquiry & Lost Property (PIR Tracking)'
    ],
    faqs: [
      {
        question: `How do I file a formal complaint or dispute with ${airlineName} in ${city}?`,
        answer: `Passengers can file an initial complaint by calling the 24/7 dedicated helpline at ${cleanTfn}, visiting the airport terminal desk, or submitting an online dispute ticket through the carrier relations department.`
      },
      {
        question: `What compensation am I entitled to if ${airlineName} cancels my flight?`,
        answer: `If your flight is cancelled or significantly delayed, you are entitled to a full refund to your original payment method or free rebooking on the next available flight without penalty fees.`
      },
      {
        question: `What should I do if my luggage is delayed or damaged at ${city}?`,
        answer: `Report the missing luggage immediately to the baggage service desk before exiting the airport arrival hall to receive a Property Irregularity Report (PIR) reference number for claims up to $3,800.`
      }
    ],
    disputeSteps: [
      { stepNumber: 1, title: 'Gather Passenger Documentation & PIR Reference', instruction: `Collect your 6-character PNR booking reference, e-ticket copy, boarding pass, and baggage Property Irregularity Report (PIR) receipt issued by ${airlineName} ground staff.` },
      { stepNumber: 2, title: `Contact ${airlineName} Immediate Dispute Line`, instruction: `Call the 24/7 customer resolution hotline at ${cleanTfn} to speak directly with an escalated ticketing agent for same-day rebooking, flight voucher issues, or refund claims.` },
      { stepNumber: 3, title: 'Submit Formal Electronic Claim to Carrier Relations', instruction: `Submit your formal claim through the airline dispute portal within 30 days of the incident, specifying exact flight numbers and monetary claim amounts.` },
      { stepNumber: 4, title: 'Escalate to the US Department of Transportation (DOT)', instruction: `If ${airlineName} does not provide a satisfactory response within 30 to 60 days, file an official consumer complaint directly with the US DOT Aviation Consumer Protection Office.` }
    ]
  };

  const htmlContent = buildHtmlFromSections(
    postTitle,
    bannerImg,
    cleanTfn,
    airlineName,
    officeTitle,
    city,
    country,
    defaultSections,
    socialLinks,
    bloggerSettings
  );

  return {
    id: `${airline.id}-${office.id}`,
    airlineName,
    officeName: officeTitle,
    city,
    country,
    title: postTitle,
    slug: permalinkSlug,
    tfnNumber: cleanTfn,
    keyword: defaultKeyword,
    htmlContent,
    imageUrl: bannerImg,
    status: 'Ready',
    labels: bloggerSettings.labels,
    socialLinks,
    sections: defaultSections,
    bloggerSettings
  };
}
