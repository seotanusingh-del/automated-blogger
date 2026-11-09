export interface MasterTemplate {
  id: string;
  templateName: string;
  category: 'airlines' | 'travel' | 'hotels' | 'agency' | 'general';
  title: string;
  keyword: string;
  description: string;
  htmlContent: string;
  isBuiltIn: boolean;
}

export const DEFAULT_MASTER_TEMPLATES: MasterTemplate[] = [
  {
    id: 'tpl-airline-office-guide',
    templateName: 'Aviation Office & Passenger Support Guide',
    category: 'airlines',
    title: '{{airline}} {{city}} Office: Official Contact, Passenger Support & Booking Desk',
    keyword: '{{airline}} Office in {{city}}, Ticket Support & Passenger Helpline',
    description: 'High-authority airline office guide covering terminal location, ticketing assistance, DOT consumer protection, baggage tracking, and 24/7 priority desk.',
    isBuiltIn: true,
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 26px; color: #0f172a; font-weight: 800; line-height: 1.3;">{{airline}} {{city}} Office: Contact Number &amp; Passenger Support Guide</h2>
  <img src="{{bannerUrl}}" alt="{{airline}} {{city}} Passenger Guide" style="max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; box-shadow: 0 6px 18px rgba(0,0,0,0.08);" />

  <div style="background: #f1f5f9; border-left: 4px solid #0284c7; padding: 14px 18px; border-radius: 6px; margin: 22px 0; font-size: 14px;">
    <strong style="color: #0f172a; display: block; margin-bottom: 8px;">Table of Contents:</strong>
    <ul style="margin: 0; padding-left: 20px; line-height: 1.8; color: #0284c7;">
      <li>1. Overview &amp; {{city}} Airport Passenger Desk</li>
      <li>2. Verified Passenger Services &amp; Rebooking Options</li>
      <li>3. DOT Passenger Rights &amp; Cancellation Regulations</li>
      <li>4. Verified External Authority &amp; Consumer Protection Portals</li>
      <li>5. Frequently Asked Questions (FAQs)</li>
    </ul>
  </div>

  <h3 style="color: #0f172a; font-size: 20px; margin-top: 26px;">1. Overview &amp; {{city}} Airport Passenger Desk</h3>
  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #334155;">
    Navigating flight itineraries, schedule revisions, or last-minute travel disruptions requires immediate and verified assistance. The <strong>{{airline}}</strong> passenger support desk serving travelers in <strong>{{city}}</strong> provides end-to-end guidance for ticket reissues, flight check-in inquiries, seat assignments, and dispute resolution.
  </p>
  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #334155;">
    Whether your departure originates in {{city}} or you have a connecting flight through regional hubs, understanding airline ticketing conditions, baggage claim procedures, and consumer protection protocols guarantees a smooth travel experience.
  </p>

  <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin: 30px 0; box-shadow: 0 4px 16px rgba(2,132,199,0.25);">
    <div style="text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; color: #ffeb3b; margin-bottom: 8px;">
      24/7 Priority Travel Assistance &amp; Flight Desk
    </div>
    <p style="margin: 0 0 14px 0; font-size: 14px; color: #e0f2fe;">
      Need immediate assistance with {{airline}} flight reservations, date adjustments, or missed connections?
    </p>
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #ffffff; color: #0284c7; padding: 12px 28px; font-size: 20px; font-weight: 900; text-decoration: none; border-radius: 50px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
      📞 Call Toll-Free: {{tfnNumber}}
    </a>
  </div>

  <h3 style="color: #0f172a; font-size: 20px; margin-top: 30px;">2. Key Services Available for {{city}} Passengers</h3>
  <ul style="padding-left: 20px; font-size: 15px; line-height: 1.8; color: #1e293b;">
    <li><strong>Flight Rebooking &amp; Same-Day Changes:</strong> Guidance on available seats, fare differences, and alternate routings.</li>
    <li><strong>Baggage PIR Tracking &amp; Damaged Luggage:</strong> Claim filing assistance under airline carriage contracts.</li>
    <li><strong>Seat Selection &amp; Special Assistance:</strong> Wheelchair assistance, infant meals, and medical equipment handling.</li>
    <li><strong>Refund &amp; Voucher Processing:</strong> Evaluation under carrier fare rules and government regulations.</li>
  </ul>

  <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 28px 0; border: 1px solid #e2e8f0; text-align: center;">
    <strong style="color: #0f172a; display: block; margin-bottom: 12px; font-size: 15px;">🌐 Official Portals &amp; Consumer Protection Resources:</strong>
    <div style="line-height: 2.6;">
      <a href="https://www.transportation.gov/airconsumer/file-consumer-complaint" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 4px 6px; padding: 8px 16px; background: #1e3a8a; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: bold;">⚖️ US DOT Consumer Protection</a>
      <a href="https://www.transportation.gov/airconsumer/fly-rights" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 4px 6px; padding: 8px 16px; background: #0369a1; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: bold;">📜 US DOT Fly Rights</a>
      <a href="https://automated-blogger-one.vercel.app" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 4px 6px; padding: 8px 16px; background: #334155; color: #ffffff; text-decoration: none; border-radius: 20px; font-size: 12px; font-weight: bold;">🛡️ Platform Directory</a>
    </div>
  </div>

  <h3 style="color: #0f172a; font-size: 20px; margin-top: 30px;">Frequently Asked Questions</h3>
  <div style="margin-bottom: 16px; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
    <strong style="display: block; color: #0f172a; font-size: 15px; margin-bottom: 6px;">Q: How can I contact the {{airline}} passenger desk in {{city}}?</strong>
    <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">You can connect with travel customer assistance for reservations, rebooking, and flight inquiries by calling <a href="tel:{{tfnNumber}}" style="color: #0284c7; font-weight: bold;">{{tfnNumber}}</a>.</p>
  </div>
  <div style="margin-bottom: 16px; padding: 16px 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
    <strong style="display: block; color: #0f172a; font-size: 15px; margin-bottom: 6px;">Q: What should I prepare before calling for flight changes?</strong>
    <p style="margin: 0; font-size: 14px; color: #334155; line-height: 1.6;">Keep your 6-character PNR/booking confirmation code, ticket numbers, primary passenger names, and preferred alternate travel dates ready.</p>
  </div>

  <div style="font-size: 12px; color: #64748b; margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 14px; background: #f8fafc; padding: 16px; border-radius: 8px;">
    <strong>Disclaimer &amp; Transparency Notice:</strong> This directory is an independent informational resource. We provide contact directories and travel passenger rights guidance. We are not directly affiliated with, sponsored by, or endorsed by any specific airline. For official carriage contracts and carrier terms, consult official airline portals or call the independent passenger helpline at {{tfnNumber}}.
  </div>
</div>`
  },
  {
    id: 'tpl-passenger-rights-compensation',
    templateName: 'Passenger Rights, Delays & Compensation Guide',
    category: 'airlines',
    title: '{{airline}} Flight Delay & Cancellation Rights in {{city}}: Complete Passenger Compensation Guide',
    keyword: '{{airline}} flight cancellation rights {{city}}, delay compensation, refund help',
    description: 'Focuses on traveler entitlements for delayed flights, involuntary denied boarding, tarmac delays, and refund claim processes.',
    isBuiltIn: true,
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 26px; color: #0f172a; font-weight: 800; line-height: 1.3;">{{airline}} Flight Delay, Cancellation &amp; Passenger Compensation Guide for {{city}}</h2>
  <img src="{{bannerUrl}}" alt="{{airline}} Compensation Guide" style="max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0; box-shadow: 0 6px 18px rgba(0,0,0,0.08);" />

  <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #334155;">
    Experiencing a delayed departure or unexpected cancellation on <strong>{{airline}}</strong> out of <strong>{{city}}</strong>? Knowing your rights under Department of Transportation regulations and carrier conditions of carriage can save you hundreds of dollars in meals, hotel vouchers, and rebooking costs.
  </p>

  <div style="background: linear-gradient(135deg, #0f766e 0%, #0d9488 100%); color: #ffffff; padding: 24px; border-radius: 12px; text-align: center; margin: 30px 0;">
    <div style="text-transform: uppercase; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; color: #99f6e4; margin-bottom: 8px;">
      Immediate Disruption Assistance
    </div>
    <p style="margin: 0 0 14px 0; font-size: 14px; color: #ccfbf1;">
      Flight delayed more than 3 hours? Contact the passenger rights desk for alternative flights:
    </p>
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #ffffff; color: #0f766e; padding: 12px 28px; font-size: 20px; font-weight: 900; text-decoration: none; border-radius: 50px;">
      📞 Call: {{tfnNumber}}
    </a>
  </div>

  <h3 style="color: #0f172a; font-size: 20px;">Your Entitlements During Major Disruptions:</h3>
  <ul style="padding-left: 20px; font-size: 15px; line-height: 1.8; color: #1e293b;">
    <li><strong>Full Cash Refunds:</strong> If the airline cancels or significantly alters your schedule and you decline the rebooking.</li>
    <li><strong>Complimentary Meal &amp; Hotel Accommodations:</strong> Provided during overnight disruptions under controllable airline delays.</li>
    <li><strong>Alternate Carrier Endorsements:</strong> In certain fare classes, transfer to another carrier with open seats.</li>
  </ul>

  <div style="font-size: 12px; color: #64748b; margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 14px; background: #f8fafc; padding: 16px; border-radius: 8px;">
    <strong>Notice:</strong> This is an independent consumer guide. For official carrier policies, visit the airline's website or call {{tfnNumber}}.
  </div>
</div>`
  },
  {
    id: 'tpl-baggage-lost-found',
    templateName: 'Baggage Claim, Lost Luggage & PIR Tracking',
    category: 'airlines',
    title: '{{airline}} {{city}} Baggage Help Desk: PIR Tracking, Lost Luggage & Claims',
    keyword: '{{airline}} lost baggage {{city}}, PIR tracking, damaged luggage claim',
    description: 'Detailed instructions for reporting delayed or damaged luggage, Property Irregularity Report (PIR) filing, and interim expense reimbursement.',
    isBuiltIn: true,
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 26px; color: #0f172a; font-weight: 800;">{{airline}} Baggage Claim &amp; Luggage Support at {{city}} Airport</h2>
  <img src="{{bannerUrl}}" alt="{{airline}} Baggage Assistance" style="max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0;" />
  <p style="font-size: 15px; line-height: 1.7; color: #334155;">
    If your baggage did not arrive on your <strong>{{airline}}</strong> flight into <strong>{{city}}</strong>, take immediate action before leaving the arrival hall. Filing a Property Irregularity Report (PIR) within 4 hours of arrival is essential for compensation eligibility.
  </p>
  <div style="background: #1e293b; color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
    <p style="font-size: 14px; margin-bottom: 12px;">Need help tracking your PIR report or filing for essential item reimbursement?</p>
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #38bdf8; color: #0f172a; padding: 10px 24px; font-weight: bold; text-decoration: none; border-radius: 30px;">
      📞 Call Baggage Helpline: {{tfnNumber}}
    </a>
  </div>
</div>`
  },
  {
    id: 'tpl-travel-destination-directory',
    templateName: 'Travel Destination & Directory Resource',
    category: 'travel',
    title: 'Complete {{city}} Travel & Flight Directory: Passenger Desks, Connections & Local Support',
    keyword: '{{city}} travel directory, flights from {{city}}, airport terminal help',
    description: 'Comprehensive travel hub guide with airport transit tips, local office hours, and flight booking directory.',
    isBuiltIn: true,
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 26px; color: #0f172a; font-weight: 800;">{{city}} Travel Directory: Airlines, Reservations &amp; Airport Support</h2>
  <img src="{{bannerUrl}}" alt="{{city}} Travel Directory" style="max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0;" />
  <p style="font-size: 15px; line-height: 1.7; color: #334155;">
    Planning your journey through <strong>{{city}}</strong>? This curated travel directory provides vital contact information, booking desk guidance, and terminal services for popular commercial airlines operating in the region.
  </p>
  <div style="background: #0284c7; color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #ffffff; color: #0284c7; padding: 12px 28px; font-weight: 900; text-decoration: none; border-radius: 30px;">
      📞 Speak with a Travel Specialist: {{tfnNumber}}
    </a>
  </div>
</div>`
  },
  {
    id: 'tpl-hotel-reservation-desk',
    templateName: 'Hotel & Resort Booking Support Desk',
    category: 'hotels',
    title: '{{airline}} {{city}} Hotel &amp; Accommodation Desk: Reservations, Cancellations &amp; Support',
    keyword: '{{airline}} hotel booking {{city}}, accommodation reservations, cancellation policy',
    description: 'Tailored for hotel and lodging directories with check-in policies, room modifications, and 24/7 guest reservation helpline.',
    isBuiltIn: true,
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 26px; color: #0f172a; font-weight: 800;">{{airline}} Accommodation &amp; Hotel Support in {{city}}</h2>
  <img src="{{bannerUrl}}" alt="{{airline}} Hotel Guide" style="max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0;" />
  <p style="font-size: 15px; line-height: 1.7; color: #334155;">
    Searching for seamless hotel accommodations, room changes, or corporate reservation assistance in <strong>{{city}}</strong>? Our dedicated travel lodging directory connects guests with immediate support for check-in modifications and booking updates.
  </p>
  <div style="background: #059669; color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #ffffff; color: #059669; padding: 12px 28px; font-weight: 900; text-decoration: none; border-radius: 30px;">
      📞 Call Hotel Desk: {{tfnNumber}}
    </a>
  </div>
</div>`
  },
  {
    id: 'tpl-agency-client-directory',
    templateName: 'Agency Travel Management & Concierge Desk',
    category: 'agency',
    title: '{{airline}} {{city}} Travel Concierge &amp; Priority Corporate Booking Desk',
    keyword: '{{airline}} corporate booking {{city}}, business travel desk, flight ticketing',
    description: 'Designed for travel agencies managing client itineraries, corporate flight accounts, and emergency traveler rerouting.',
    isBuiltIn: true,
    htmlContent: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto;">
  <h2 style="font-size: 26px; color: #0f172a; font-weight: 800;">{{airline}} Executive Travel &amp; Passenger Desk in {{city}}</h2>
  <img src="{{bannerUrl}}" alt="{{airline}} Concierge Guide" style="max-width: 100%; height: auto; border-radius: 12px; margin: 20px 0;" />
  <p style="font-size: 15px; line-height: 1.7; color: #334155;">
    For corporate travelers and executive clients flying with <strong>{{airline}}</strong> through <strong>{{city}}</strong>, having an accredited travel concierge ensures priority handling, quick schedule adjustments, and corporate fare upgrades.
  </p>
  <div style="background: #4f46e5; color: #ffffff; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
    <a href="tel:{{tfnNumber}}" style="display: inline-block; background: #ffffff; color: #4f46e5; padding: 12px 28px; font-weight: 900; text-decoration: none; border-radius: 30px;">
      📞 Call Priority Concierge: {{tfnNumber}}
    </a>
  </div>
</div>`
  }
];
