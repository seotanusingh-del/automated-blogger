import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, Lock, Moon, Plane, ShieldCheck, Sun, Info, FileText } from 'lucide-react';

interface PublicLandingPageProps {
  onOpenDashboard: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const plans = [
  { name: 'The Solo Plan', price: 59, tagline: 'Completely Unlocked Dedicated Workspace', features: ['Unlimited manual blog generation', 'Custom publishing setup', 'A uniquely published app for your business'] },
  { name: 'The Basic Plan', price: 16, tagline: 'Fast, Efficient Growth Automation', features: ['Shared workspace experience', 'Clear daily and monthly limits', 'Scheduled publishing for consistent growth'] },
  { name: 'The Professional Plan', price: 29, tagline: 'High-Performance Scaled Authority', features: ['Independent published app deployment', 'High-volume content allowances', 'Background publishing engines'] }
];

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onOpenDashboard, isDarkMode, onToggleTheme }) => {
  const [page, setPage] = useState<'home' | 'privacy' | 'terms'>('home');
  const surface = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
  const muted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
  
  const subscribe = (plan: typeof plans[number]) => {
    const message = `Hi, I'd like to subscribe to the ${plan.name} plan ($${plan.price}/month) for Automated-Blogger.`;
    window.open(`https://wa.me/916391059119?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/90'}`}>
        <button onClick={() => setPage('home')} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
            <Plane className="h-5 w-5" />
          </span>
          <span>
            <strong className="block text-base tracking-tight font-black text-sky-500">Automated-Blogger</strong>
            <small className="text-xs text-slate-400">AI Blog Automation &amp; Directory Publisher</small>
          </span>
        </button>
        <nav className="hidden items-center gap-6 text-xs font-semibold md:flex">
          <button onClick={() => setPage('home')} className={`hover:text-sky-500 transition-colors ${page === 'home' ? 'text-sky-500' : ''}`}>Overview</button>
          <a href="#how-it-works" onClick={() => setPage('home')} className="hover:text-sky-500 transition-colors">How It Works</a>
          <a href="#oauth-purpose" onClick={() => setPage('home')} className="hover:text-sky-500 transition-colors">Google OAuth &amp; Security</a>
          <a href="#pricing" onClick={() => setPage('home')} className="hover:text-sky-500 transition-colors">Pricing</a>
          <button onClick={() => setPage('privacy')} className={`hover:text-sky-500 transition-colors ${page === 'privacy' ? 'text-sky-500 font-bold' : ''}`}>Privacy Policy</button>
          <button onClick={() => setPage('terms')} className={`hover:text-sky-500 transition-colors ${page === 'terms' ? 'text-sky-500 font-bold' : ''}`}>Terms of Service</button>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={onToggleTheme} className={`rounded-lg border p-2 ${isDarkMode ? 'border-slate-700 text-amber-300' : 'border-slate-300 text-slate-700'}`} aria-label="Toggle theme">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={onOpenDashboard} className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all">
            Open Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      {page === 'home' ? (
        <main>
          {/* Hero Section */}
          <section className="mx-auto max-w-5xl px-6 py-20 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-500">
              <ShieldCheck className="h-4 w-4" /> Automated-Blogger Publishing Suite
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Turn your content ideas into <span className="text-sky-500">automated growth.</span>
            </h1>
            <p className={`mx-auto mt-6 max-w-3xl text-lg leading-relaxed ${muted}`}>
              <strong>Automated-Blogger</strong> helps you schedule, manage, and automatically publish high-quality, SEO-optimized articles and directories directly to your Google Blogger platforms. Built for businesses, agencies, and publishers who want a calm, reliable, and auditable content workflow.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button onClick={onOpenDashboard} className="rounded-xl bg-sky-600 px-6 py-3 font-bold text-white shadow-lg shadow-sky-600/25 hover:bg-sky-500 transition-all">
                Access Automated-Blogger Dashboard <ArrowRight className="ml-2 inline h-4 w-4" />
              </button>
              <button onClick={() => setPage('privacy')} className={`rounded-xl border px-6 py-3 font-bold ${surface} hover:border-sky-500 transition-colors`}>
                Read Privacy &amp; Data Policy
              </button>
            </div>
          </section>

          {/* Workflow Steps Section */}
          <section id="how-it-works" className="mx-auto max-w-5xl px-6 pb-20">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black">How Automated-Blogger Works</h2>
              <p className={`mt-2 ${muted}`}>A structured 5-stage pipeline designed for precision and compliance.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { title: '1. Setup & Branding', desc: 'Define your business name, logos, target keywords, customer support desks, and destination Blogger Blog ID.' },
                { title: '2. Curate Content & Media', desc: 'Select target locations or travel entities, attach verified banners from your media storage, and preview SEO structure.' },
                { title: '3. Review, Verify & Publish', desc: 'Preview generated drafts, audit schema markup and consumer disclosures, then publish directly to Blogger via Google OAuth.' }
              ].map((step, index) => (
                <div key={step.title} className={`rounded-2xl border p-6 ${surface}`}>
                  <span className="text-sm font-black text-sky-500">0{index + 1}</span>
                  <h3 className="mt-3 font-bold text-lg">{step.title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Companion Growth Tool: Blogger Indexer */}
          <section className="mx-auto max-w-5xl px-6 pb-20">
            <div className={`rounded-3xl border p-8 ${surface} shadow-sm`}>
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="text-xs font-black uppercase tracking-wider text-sky-500">Official Companion Tool</p>
                  <h2 className="mt-2 text-2xl font-black">Blogger Indexer Tool</h2>
                  <p className={`mt-3 leading-relaxed ${muted}`}>
                    Help your published articles get indexed faster on Google Search. Check indexing status, ping search engines, and maintain complete visibility over your published catalog with our companion suite.
                  </p>
                </div>
                <a href="https://seo-indexer-tool.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all">
                  Open Blogger Indexer <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>

          {/* Google OAuth Access & Purpose Declaration (Crucial for Verification) */}
          <section id="oauth-purpose" className="mx-auto max-w-5xl px-6 pb-20">
            <div className={`rounded-3xl border p-8 ${surface} shadow-sm`}>
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-emerald-500" />
                <h2 className="text-2xl font-bold">Why Automated-Blogger Requests Google OAuth Access</h2>
              </div>
              <div className="mt-4 space-y-3 leading-relaxed text-sm">
                <p className={muted}>
                  To enable seamless publishing, <strong>Automated-Blogger</strong> requests access to your Google Blogger account using the official scope <code className="rounded bg-sky-500/10 px-2 py-0.5 font-mono text-sky-500 text-xs">https://www.googleapis.com/auth/blogger</code>.
                </p>
                <ul className={`list-disc pl-5 space-y-2 ${muted}`}>
                  <li><strong>Clear Purpose:</strong> We request this permission strictly to create, edit, schedule, and publish authorized blog posts and drafts to the specific Blogger blog you designate.</li>
                  <li><strong>Zero Unrelated Access:</strong> Automated-Blogger never accesses your personal emails, Google Drive documents, contacts, or unrelated Google Workspace data.</li>
                  <li><strong>Data Security:</strong> Your OAuth tokens are processed through secure serverless functions, encrypted in transit using TLS 1.3, and never shared with or sold to third parties.</li>
                  <li><strong>Complete User Control:</strong> You can disconnect your Google account or revoke access at any moment via your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline font-semibold">Google Account Security Permissions</a>.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black">Subscription Plans</h2>
              <p className={`mt-2 ${muted}`}>Choose the plan that fits your publishing volume and business goals.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {plans.map(plan => (
                <article key={plan.name} className={`flex flex-col rounded-2xl border p-7 ${surface} shadow-sm`}>
                  <h3 className="text-xl font-black">{plan.name}</h3>
                  <p className="mt-2 text-sm font-semibold text-sky-500">{plan.tagline}</p>
                  <p className="mt-6 text-4xl font-black">${plan.price}<span className="text-sm font-medium text-slate-500"> / month</span></p>
                  <ul className={`my-7 flex-1 space-y-3 text-sm ${muted}`}>
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => subscribe(plan)} className="rounded-xl bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-500 shadow-md shadow-sky-600/20 transition-all">
                    Subscribe via WhatsApp
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-4xl px-6 py-16">
          <button onClick={() => setPage('home')} className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-sky-500 hover:underline">
            ← Back to Automated-Blogger Overview
          </button>
          
          <article className={`rounded-2xl border p-8 md:p-10 leading-relaxed ${surface} shadow-sm space-y-6`}>
            {page === 'privacy' ? (
              <>
                <div className="border-b pb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">
                    <ShieldCheck className="h-4 w-4" /> Legal &amp; Compliance
                  </div>
                  <h1 className="text-3xl font-black">Automated-Blogger Privacy Policy</h1>
                  <p className="text-xs text-slate-400 mt-1">Last Updated: March 2026</p>
                </div>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">1. Overview &amp; Commitment</h2>
                  <p className={muted}>
                    This Privacy Policy describes how <strong>Automated-Blogger</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;the platform&quot;) collects, uses, protects, and handles information when you use our web application at <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">https://automated-blogger-one.vercel.app</code>. We are deeply committed to safeguarding user data, honoring user privacy, and complying with all Google API Services User Data Policies.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">2. Information We Collect via Google OAuth</h2>
                  <p className={muted}>
                    When you authenticate and connect your Google account to Automated-Blogger, we request access to the Google Blogger API (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">https://www.googleapis.com/auth/blogger</code>). Through this integration, we may receive:
                  </p>
                  <ul className={`list-disc pl-5 space-y-2 text-sm ${muted}`}>
                    <li><strong>Google Account Identity:</strong> Your email address, basic profile name, and account identifier used solely to authenticate your session.</li>
                    <li><strong>Blogger Blog Information:</strong> Blog identifiers (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">blogId</code>), blog titles, and destination URLs to enable post publishing.</li>
                    <li><strong>OAuth Tokens:</strong> Encrypted Google OAuth access and refresh tokens required to communicate with the Google Blogger v3 API on your behalf.</li>
                  </ul>
                  <p className={muted}>
                    We <strong>never</strong> access, read, or request permissions for your Gmail, Google Drive, Google Contacts, Google Photos, or any unrelated services.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">3. How We Use the Information</h2>
                  <p className={muted}>
                    The collected information is used solely to provide core publishing services:
                  </p>
                  <ul className={`list-disc pl-5 space-y-2 text-sm ${muted}`}>
                    <li>Authenticating your access to the Automated-Blogger management dashboard.</li>
                    <li>Drafting, formatting, scheduling, and publishing blog posts and articles directly to your authorized Google Blogger blogs upon your explicit request.</li>
                    <li>Allowing you to preview article layouts, verify image banners, and manage past publishing history.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">4. Google API Limited Use Disclosure</h2>
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4 text-sm leading-relaxed">
                    <strong>Limited Use Compliance:</strong> Automated-Blogger&apos;s use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline font-semibold">Google API Services User Data Policy</a>, including the Limited Use requirements.
                  </div>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">5. Zero Sale of Personal Data</h2>
                  <p className={muted}>
                    We do <strong>NOT</strong> sell, rent, lease, trade, or transfer any user data, personal information, or Google OAuth credentials to third parties, advertising brokers, data aggregators, or marketing firms under any circumstances.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">6. Data Storage, Security &amp; Retention</h2>
                  <p className={muted}>
                    All communications between your browser, our application, and Google API servers occur exclusively over encrypted TLS 1.3 / HTTPS connections. OAuth tokens and configuration variables are stored in secure, isolated server-side environments or within your browser&apos;s authenticated session storage. We do not maintain unencrypted backups of your credentials.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">7. Revocation &amp; Deletion of Data</h2>
                  <p className={muted}>
                    You maintain complete ownership of your data and can revoke Automated-Blogger&apos;s access at any time through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline font-semibold">Google Account Security Permissions</a>. You may also contact us to request the immediate deletion of any workspace configuration data associated with your email address.
                  </p>
                </section>

                <section className="space-y-3 border-t pt-4">
                  <h2 className="text-xl font-bold">8. Contact Us</h2>
                  <p className={muted}>
                    If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please reach out to our privacy administrator at:
                  </p>
                  <p className="font-semibold text-sky-500">
                    Email: <a href="mailto:seo.tanusingh@gmail.com" className="underline">seo.tanusingh@gmail.com</a>
                  </p>
                </section>
              </>
            ) : (
              <>
                <div className="border-b pb-4">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-500 uppercase tracking-wider mb-2">
                    <FileText className="h-4 w-4" /> Agreement
                  </div>
                  <h1 className="text-3xl font-black">Automated-Blogger Terms of Service</h1>
                  <p className="text-xs text-slate-400 mt-1">Last Updated: March 2026</p>
                </div>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
                  <p className={muted}>
                    By accessing or using <strong>Automated-Blogger</strong>, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must discontinue use of the platform immediately.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">2. Use of Service &amp; Blogger Publishing</h2>
                  <p className={muted}>
                    Automated-Blogger provides tools to draft, format, schedule, and publish content to Google Blogger blogs. You are solely responsible for ensuring that all published articles comply with applicable laws, copyright regulations, and Google Blogger Content Policies. You agree not to publish deceptive, malicious, spammy, or defamatory content.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">3. Account Credentials &amp; Security</h2>
                  <p className={muted}>
                    You are responsible for maintaining the confidentiality of your account credentials, refresh tokens, and session passwords. Automated-Blogger cannot and will not be liable for any loss or damage arising from your failure to protect your authentication credentials.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">4. Subscriptions &amp; Payments</h2>
                  <p className={muted}>
                    Plan tiers, allowances, and subscription fees are described on our Pricing section. Subscriptions renew on a monthly basis unless cancelled prior to the billing date.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold">5. Limitation of Liability</h2>
                  <p className={muted}>
                    Automated-Blogger is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind. In no event shall the platform owners be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the service.
                  </p>
                </section>

                <section className="space-y-3 border-t pt-4">
                  <h2 className="text-xl font-bold">6. Contact</h2>
                  <p className={muted}>
                    For inquiries regarding these Terms of Service, contact: <a href="mailto:seo.tanusingh@gmail.com" className="text-sky-500 underline font-semibold">seo.tanusingh@gmail.com</a>.
                  </p>
                </section>
              </>
            )}
          </article>
        </main>
      )}

      <footer className={`border-t px-6 py-8 text-center text-xs ${isDarkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
        <div className="flex flex-wrap items-center justify-center gap-6 mb-2">
          <button onClick={() => setPage('home')} className="hover:text-sky-500">Automated-Blogger Overview</button>
          <button onClick={() => setPage('privacy')} className="hover:text-sky-500">Privacy Policy</button>
          <button onClick={() => setPage('terms')} className="hover:text-sky-500">Terms of Service</button>
          <a href="https://seo-indexer-tool.vercel.app/" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500">Blogger Indexer Tool</a>
          <a href="mailto:seo.tanusingh@gmail.com" className="hover:text-sky-500">Support: seo.tanusingh@gmail.com</a>
        </div>
        <p>&copy; {new Date().getFullYear()} Automated-Blogger. All rights reserved. Compliant with Google API Services User Data Policy.</p>
      </footer>
    </div>
  );
};
