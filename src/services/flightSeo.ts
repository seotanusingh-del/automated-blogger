export interface FlightPostTemplate {
  id: string;
  airline: string;
  topic: string;
  slug: string;
  wordCount: number;
  tone: string;
  category: 'Disputes & Complaints' | 'Flight Reservations' | 'Discounts & Deals' | 'Baggage & Policies';
  defaultTitle: string;
  defaultStructure: string;
  sampleSummary: string;
  sampleHtml: string;
  recommendedImageUrl: string;
}

export const FLIGHT_SEO_TEMPLATES: FlightPostTemplate[] = [
  {
    id: 'everts-dispute',
    airline: 'Everts Air',
    topic: 'Everts Air Dispute & Complaint Process',
    slug: 'everts-air-dispute-complaint-process',
    wordCount: 850,
    tone: 'Authoritative, Empathetic & Informative',
    category: 'Disputes & Complaints',
    defaultTitle: 'Everts Air Dispute & Complaint Process: How to File Claims, Request Refunds & Contact Support',
    defaultStructure: 'Overview > Common Dispute Reasons > 4-Step Claim Process > Phone & Email Channels > Compensation Guidelines > FAQ',
    sampleSummary: 'Encountered flight disruption, cargo delay, or billing discrepancies with Everts Air? This guide outlines how to submit an official dispute and get escalated customer resolution.',
    recommendedImageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80',
    sampleHtml: `<h2>Everts Air Dispute & Complaint Process: Official Passenger & Cargo Resolution Guide</h2>
<img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80" alt="Everts Air Aircraft and Flight Terminal" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />

<div style="background:#f0f7ff;border-left:4px solid #0056b3;padding:16px;margin:20px 0;border-radius:4px;">
  <strong>Quick Summary:</strong> If you face damaged cargo, delayed regional flights, or unwarranted booking cancellation fees with Everts Air, you have the legal right under federal aviation guidelines to lodge a formal grievance. Follow the step-by-step procedure below for fast turnaround.
</div>

<h2>Common Reasons for Everts Air Passenger & Cargo Disputes</h2>
<p>Everts Air operates specialized passenger charters and scheduled cargo services throughout Alaska and North America. Most passenger complaints arise from:</p>
<ul>
  <li><strong>Severe Weather Delays:</strong> Rescheduling conflicts across remote Alaskan runways.</li>
  <li><strong>Cargo Damage or Loss:</strong> Mishandled freight or perishables during inter-island transit.</li>
  <li><strong>Ticketing Inaccuracies:</strong> Discrepancies between phone booking quotes and charged invoices.</li>
  <li><strong>Baggage Delays:</strong> Luggage not arriving on the same flight rotation due to weight restrictions.</li>
</ul>

<h2>Step-by-Step Guide to Filing an Everts Air Dispute</h2>
<p>To ensure prompt processing by the claims department, follow this 4-step escalation protocol:</p>
<ol>
  <li><strong>Step 1: Document Your Confirmation Details:</strong> Keep your 6-character PNR booking code, cargo waybill (AWB), boarding passes, and receipts handy.</li>
  <li><strong>Step 2: Collect Physical Proof:</strong> For damaged cargo or lost property, take high-resolution timestamped photographs before leaving the air cargo terminal.</li>
  <li><strong>Step 3: Submit Written Claim:</strong> Draft an email to customer care with your travel itinerary, stating the precise reimbursement amount requested.</li>
  <li><strong>Step 4: Follow Up via Priority Hotline:</strong> If no written response arrives within 72 hours, call the direct dispute desk.</li>
</ol>

<h2>Everts Air Customer Care & Dispute Contact Channels</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;text-align:left;">
  <thead>
    <tr style="background:#0056b3;color:#ffffff;">
      <th style="padding:10px;border:1px solid #ddd;">Department</th>
      <th style="padding:10px;border:1px solid #ddd;">Contact Channel</th>
      <th style="padding:10px;border:1px solid #ddd;">Operating Hours</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #ddd;"><strong>Passenger Reservation Disputes</strong></td>
      <td style="padding:10px;border:1px solid #ddd;"><a href="tel:18004780000" style="color:#0056b3;font-weight:bold;">1-800-478-0000</a> / direct desk</td>
      <td style="padding:10px;border:1px solid #ddd;">Mon-Fri 8:00 AM - 5:00 PM AKST</td>
    </tr>
    <tr style="background:#f9f9f9;">
      <td style="padding:10px;border:1px solid #ddd;"><strong>Air Cargo Claims Desk</strong></td>
      <td style="padding:10px;border:1px solid #ddd;">claims@evertsair.com</td>
      <td style="padding:10px;border:1px solid #ddd;">24/7 Digital Intake</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #ddd;"><strong>Baggage Services</strong></td>
      <td style="padding:10px;border:1px solid #ddd;">Fairbanks / Anchorage Terminal Desks</td>
      <td style="padding:10px;border:1px solid #ddd;">Flight Departure Windows</td>
    </tr>
  </tbody>
</table>

<h2>Frequently Asked Questions (FAQ)</h2>
<p><strong>How long does Everts Air take to process claims?</strong><br/>
Standard property and cargo damage claims are typically acknowledged within 3 to 5 business days, with formal settlement checks issued within 14 to 30 calendar days.</p>
<p><strong>Can I claim compensation for weather cancellations?</strong><br/>
Because Alaska weather presents extreme safety hazards, airlines are not mandated to pay cash compensation for meteorological delays. However, Everts Air will rebook passengers on the next available flight without change fees.</p>`
  },
  {
    id: 'everts-booking',
    airline: 'Everts Air',
    topic: 'Everts Air Book Flight Reservations',
    slug: 'everts-air-book-flight-reservations',
    wordCount: 800,
    tone: 'Helpful, Practical & Step-by-Step',
    category: 'Flight Reservations',
    defaultTitle: 'Everts Air Book Flight Reservations: How to Book Passenger Flights, Charters & Group Travel',
    defaultStructure: 'Introduction > Route Network > Booking Methods (Online, Phone, Airport) > Fare Classes > Baggage Rules > FAQ',
    sampleSummary: 'Looking to reserve seats with Everts Air Alaska? Here is your complete booking manual covering scheduled passenger flights, private charters, and phone reservation steps.',
    recommendedImageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop&q=80',
    sampleHtml: `<h2>Everts Air Book Flight Reservations: Complete Guide to Booking Flights & Charters</h2>
<img src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&auto=format&fit=crop&q=80" alt="Airplane Flight Booking and Travel" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />

<div style="background:#f0f7ff;border-left:4px solid #0056b3;padding:16px;margin:20px 0;border-radius:4px;">
  <strong>Booking Highlights:</strong> Everts Air offers flexible regional passenger connections across Fairbanks, Anchorage, and remote community hubs. Reserving in advance is essential due to limited aircraft capacity on remote routes.
</div>

<h2>3 Primary Ways to Book Everts Air Flights</h2>
<p>Passengers can choose from three secure booking methods depending on whether they require scheduled commuter seats or full charter contracts:</p>
<ol>
  <li><strong>Online Reservation:</strong> Check seasonal flight schedules and seat availability through regional partner portals.</li>
  <li><strong>Direct Telephone Booking:</strong> Call the Fairbanks reservations desk for immediate seat confirmation and special baggage allowances.</li>
  <li><strong>Terminal Walk-In:</strong> Book same-day or standby flights directly at Fairbanks (FAI) or Anchorage (ANC) regional gates.</li>
</ol>

<h2>Luggage Allowances & Remote Travel Guidelines</h2>
<p>Unlike major commercial jet carriers, regional Alaskan flights enforce strict weight balancing. Passengers must ensure personal luggage and hunting or freight equipment comply with published limits:</p>
<ul>
  <li><strong>Standard Checked Bag:</strong> Maximum 50 lbs per piece.</li>
  <li><strong>Carry-On Baggage:</strong> Small personal items that can fit safely under the seat or in forward stowage.</li>
  <li><strong>Excess Baggage Fares:</strong> Billed at nominal per-pound rates if total payload permits.</li>
</ul>

<h2>Frequently Asked Questions (FAQ)</h2>
<p><strong>Can I modify my Everts Air flight date?</strong><br/>
Yes, date modifications can be processed through the reservations desk up to 24 hours prior to departure, subject to fare difference and seat availability.</p>`
  },
  {
    id: 'southwest-senior',
    airline: 'Southwest Airlines',
    topic: 'Southwest Airlines Senior Discount',
    slug: 'southwest-airlines-senior-discount',
    wordCount: 900,
    tone: 'Warm, Budget-Conscious & Informative',
    category: 'Discounts & Deals',
    defaultTitle: 'Southwest Airlines Senior Discount Policy: Age Limits, Senior Fares & How to Book',
    defaultStructure: 'Introduction > Age Eligibility (65+) > Senior Fare vs Wanna Get Away > How to Book Online & by Phone > Baggage Perks > Tips > FAQ',
    sampleSummary: 'Wondering if Southwest Airlines still offers senior fares? Discover the age requirements, refundable ticket benefits, and how older travelers can maximize their savings.',
    recommendedImageUrl: 'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?w=1200&auto=format&fit=crop&q=80',
    sampleHtml: `<h2>Southwest Airlines Senior Discount: Comprehensive Policy, Age Rules & Booking Secrets</h2>
<img src="https://images.unsplash.com/photo-1517400508447-f8dd518b86db?w=1200&auto=format&fit=crop&q=80" alt="Senior Travelers enjoying flight vacation" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;box-shadow:0 4px 12px rgba(0,0,0,0.15);" />

<div style="background:#fff3cd;border-left:4px solid #ffc107;padding:16px;margin:20px 0;border-radius:4px;">
  <strong>Key Fact:</strong> Southwest Airlines caters to travelers aged <strong>65 and older</strong>. While promotional fares like "Wanna Get Away" often offer lower initial price tags, Southwest Senior Fares deliver unique flexibility including 100% refundability.
</div>

<h2>Eligibility Requirements for Southwest Senior Fares</h2>
<p>To take advantage of official senior ticket categories on Southwest, travelers must satisfy these baseline criteria:</p>
<ul>
  <li><strong>Age Requirement:</strong> You must be at least <strong>65 years of age</strong> on the date of travel.</li>
  <li><strong>Proof of Age:</strong> A valid government-issued ID (driver's license, passport, or birth certificate) may be requested at airport check-in.</li>
  <li><strong>Rapid Rewards:</strong> Seniors can earn full Rapid Rewards points on all senior ticket tiers.</li>
</ul>

<h2>Senior Fares vs. Wanna Get Away: Feature Comparison</h2>
<table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px;text-align:left;">
  <thead>
    <tr style="background:#111b40;color:#ffffff;">
      <th style="padding:10px;border:1px solid #ddd;">Feature</th>
      <th style="padding:10px;border:1px solid #ddd;">Senior Fare (65+)</th>
      <th style="padding:10px;border:1px solid #ddd;">Wanna Get Away</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px;border:1px solid #ddd;"><strong>Refundability</strong></td>
      <td style="padding:10px;border:1px solid #ddd;"><span style="color:#28a745;font-weight:bold;">100% Fully Refundable</span> to original payment</td>
      <td style="padding:10px;border:1px solid #ddd;">Non-refundable (Flight Credit)</td>
    </tr>
    <tr style="background:#f9f9f9;">
      <td style="padding:10px;border:1px solid #ddd;"><strong>Free Checked Bags</strong></td>
      <td style="padding:10px;border:1px solid #ddd;">2 Bags Fly Free (up to 50 lbs each)</td>
      <td style="padding:10px;border:1px solid #ddd;">2 Bags Fly Free (up to 50 lbs each)</td>
    </tr>
    <tr>
      <td style="padding:10px;border:1px solid #ddd;"><strong>Change / Cancellation Fees</strong></td>
      <td style="padding:10px;border:1px solid #ddd;">$0 No Change Fees</td>
      <td style="padding:10px;border:1px solid #ddd;">$0 No Change Fees</td>
    </tr>
  </tbody>
</table>

<h2>Frequently Asked Questions (FAQ)</h2>
<p><strong>Can I book Southwest Senior Fares online?</strong><br/>
Yes! When searching for flights on Southwest.com, adjust the passenger selector to designate seniors (Age 65+). You can also call Southwest customer support at 1-800-435-9792 for live telephone booking assistance.</p>`
  }
];

/**
 * Generate a dynamic SVG banner for flight blog posts
 */
export function generateFlightSvgBanner(airline: string, title: string, category: string): string {
  const cleanTitle = title.length > 55 ? title.substring(0, 52) + '...' : title;
  const isSouthwest = airline.toLowerCase().includes('southwest');
  const primaryColor = isSouthwest ? '#111b40' : '#003366';
  const accentColor = isSouthwest ? '#ffc107' : '#00a8e8';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="#050d24" />
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${accentColor}" />
        <stop offset="100%" stop-color="#38ef7d" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="1200" height="630" fill="url(#bg)"/>
    
    <!-- Decorative flight paths -->
    <path d="M-50,450 C300,200 800,550 1250,150" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="8 8" opacity="0.3"/>
    <path d="M-50,550 C400,300 700,600 1250,250" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.15"/>
    
    <!-- Airplane Icon Motif -->
    <g transform="translate(1000, 150) rotate(-25) scale(1.6)">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${accentColor}" opacity="0.8"/>
    </g>

    <!-- Category Pill -->
    <g transform="translate(90, 110)">
      <rect width="260" height="42" rx="21" fill="rgba(255,255,255,0.12)" stroke="${accentColor}" stroke-width="1.5"/>
      <text x="130" y="26" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" text-anchor="middle" letter-spacing="1">
        ${category.toUpperCase()}
      </text>
    </g>
    
    <!-- Airline Badge -->
    <text x="90" y="210" fill="${accentColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="800" letter-spacing="2">
      ${airline.toUpperCase()} • 2026 OFFICIAL GUIDE
    </text>
    
    <!-- Article Title -->
    <text x="90" y="280" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" width="1000">
      ${escapeXml(cleanTitle)}
    </text>
    
    <!-- Subtitle Bullet Points -->
    <text x="90" y="380" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22">
      ✓ Step-by-Step Instructions &amp; Policy Rules
    </text>
    <text x="90" y="420" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22">
      ✓ Direct Customer Service Phone &amp; Email Channels
    </text>
    <text x="90" y="460" fill="#cbd5e1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22">
      ✓ Verified Passenger FAQ &amp; Settlement Rights
    </text>

    <!-- Bottom Brand Footer -->
    <line x1="90" y1="520" x2="1110" y2="520" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="90" y="565" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600">
      easyflightconnectblog.blogspot.com
    </text>
    <text x="1110" y="565" fill="#38ef7d" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" text-anchor="end">
      Updated for 2026 Travel
    </text>
  </svg>`;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
