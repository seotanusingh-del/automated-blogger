import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, CheckCircle2, ExternalLink, Lock, Moon, Plane, ShieldCheck, Sun, Info, FileText, Zap, Bot, Send, Sparkles, ChevronRight, Mail, Linkedin, Instagram } from 'lucide-react';

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
    <div className={`min-h-screen font-sans selection:bg-sky-100 transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Helmet>
        <title>Automated Blogger | Enterprise SEO & AI Content Automation</title>
        <meta name="description" content="The ultimate AI-driven blogging engine for airlines, travel agencies, and digital marketers. Generate high-ranking SEO content with DeepSeek and n8n." />
        <meta name="google-site-verification" content="0QaizAUzKmHMNSl0nUrFqaCAltv_cEgLv-Ctphg2_1w" />
      </Helmet>

      {/* Modern Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => setPage('home')} className="flex items-center gap-3 group">
            <div className="p-2 bg-sky-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg shadow-sky-600/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase hidden sm:block">VERNIKA</span>
          </button>
          
          <nav className="hidden md:flex items-center gap-6 text-[11px] font-black uppercase tracking-widest opacity-60">
            <button onClick={() => setPage('home')} className={`hover:opacity-100 transition-opacity ${page === 'home' ? 'text-sky-500 opacity-100' : ''}`}>Overview</button>
            <a href="#how-it-works" onClick={() => setPage('home')} className="hover:opacity-100 transition-opacity">Pipeline</a>
            <button onClick={() => setPage('privacy')} className={`hover:opacity-100 transition-opacity ${page === 'privacy' ? 'text-sky-500 opacity-100' : ''}`}>Privacy</button>
            <button onClick={() => setPage('terms')} className={`hover:opacity-100 transition-opacity ${page === 'terms' ? 'text-sky-500 opacity-100' : ''}`}>Terms</button>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={onToggleTheme} className={`rounded-xl border p-2 transition-colors ${isDarkMode ? 'border-slate-800 text-amber-400 hover:bg-slate-900' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button 
              onClick={onOpenDashboard}
              className="px-5 py-2 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-500 transition shadow-lg shadow-sky-600/20 active:scale-95"
            >
              Launch Dashboard
            </button>
          </div>
        </div>
      </nav>

      {page === 'home' ? (
        <main>
          {/* Hero Section */}
          <section className="relative pt-32 pb-20 overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent opacity-50" />
            <div className="max-w-5xl mx-auto px-6 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-8 transition-colors ${
                isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>VERNIKA WORKFLOWS Verified</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                Scale Your Organic Traffic <br />
                <span className="text-sky-500">Without Lifting a Finger.</span>
                <p className="text-sm font-bold text-sky-500 uppercase tracking-widest mt-4">Developed by VERNIKA-WORKFLOWS</p>
              </h1>
              <p className={`mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed ${muted}`}>
                Automated-Blogger is the production-grade engine developed by VERNIKA that turns raw travel data into high-ranking, human-like SEO articles on bulks across Google Blogger.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={onOpenDashboard}
                  className="w-full sm:w-auto px-8 py-4 bg-sky-600 text-white rounded-2xl text-lg font-black shadow-2xl shadow-sky-600/30 hover:bg-sky-500 transition active:scale-95 flex items-center justify-center gap-2"
                >
                  Start Automation Now <ChevronRight className="w-5 h-5" />
                </button>
                <a 
                  href="#how-it-works"
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold transition flex items-center justify-center gap-2 border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  How it Works
                </a>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="how-it-works" className="py-20">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-8 rounded-3xl border transition-all hover:shadow-xl ${surface}`}>
                  <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 mb-6">
                    <Bot className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black mb-4">Bulk Automation</h3>
                  <p className={`text-sm font-medium leading-relaxed ${muted}`}>
                    Use this tool to automate your day-to-day bulk work. Reduce bulk workload into seconds, streamlining your operations effortlessly.
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border transition-all hover:shadow-xl ${surface}`}>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black mb-4">Headcount Reduction</h3>
                  <p className={`text-sm font-medium leading-relaxed ${muted}`}>
                    Efficiency at scale. This automation workflow is designed to reduce headcount by handling repetitive tasks at superhuman speeds.
                  </p>
                </div>

                <div className={`p-8 rounded-3xl border transition-all hover:shadow-xl ${surface}`}>
                  <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600 mb-6">
                    <Send className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black mb-4">Blogger-Optimized</h3>
                  <p className={`text-sm font-medium leading-relaxed ${muted}`}>
                    Direct integration allows you to generate and publish in bulk, maintaining your SEO authority without manual formatting.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Google OAuth & Security Section */}
          <section id="oauth-purpose" className="py-20 bg-slate-50 dark:bg-slate-900/20 border-y border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-6">
              <div className={`rounded-3xl border p-8 md:p-12 shadow-sm ${surface}`}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Lock className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Enterprise-Grade Security</h2>
                    <p className={`text-sm font-medium mt-1 ${muted}`}>Your data privacy is our top priority</p>
                  </div>
                </div>
                
                <div className="space-y-6 leading-relaxed text-sm font-medium">
                  <p className={muted}>
                    We utilize industry-standard security protocols for all interactions with Google APIs. Your data is handled with strict confidentiality.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-800 dark:text-slate-100">Secure Connectivity</h4>
                      <p className={`text-xs ${muted}`}>All data exchanges are performed via encrypted TLS 1.3 channels to ensure total protection.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-800 dark:text-slate-100">Zero Unrelated Access</h4>
                      <p className={`text-xs ${muted}`}>We only access the Blogger APIs strictly necessary to automate your publishing tasks.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-800 dark:text-slate-100">Data Integrity</h4>
                      <p className={`text-xs ${muted}`}>Your content and configuration data are stored securely and are never exposed to unauthorized entities.</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-black text-slate-800 dark:text-slate-100">User Sovereignty</h4>
                      <p className={`text-xs ${muted}`}>You retain full ownership and control, with the ability to revoke access at any time through your Google Security settings.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-black tracking-tighter">Growth Plans</h2>
              <p className={`mt-2 font-medium ${muted}`}>Subscription tiers for every level of automation.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <article className={`flex flex-col rounded-3xl border p-8 transition-all hover:shadow-2xl ${surface}`}>
                <h3 className="text-xl font-black">AUTOMATED-BLOGGER</h3>
                <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-sky-500">Dedicated Automation</p>
                <p className="mt-6 text-5xl font-black">$59<span className="text-sm font-bold opacity-40">/mo</span></p>
                <ul className={`my-8 flex-1 space-y-4 text-sm font-medium ${muted}`}>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Automate bulk day-to-day work</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Reduce workload to seconds</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Cut down headcount costs</span></li>
                </ul>
                <button onClick={() => window.open(`https://wa.me/916391059119?text=${encodeURIComponent("Hi, I'd like to subscribe to the AUTOMATED-BLOGGER plan ($59/month)")}`, '_blank', 'noopener,noreferrer')} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg active:scale-95">Select Plan</button>
              </article>
              <article className={`flex flex-col rounded-3xl border p-8 transition-all hover:shadow-2xl ${surface}`}>
                <h3 className="text-xl font-black">BLOGGER-INDEXER</h3>
                <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-sky-500">Bulk Indexing Power</p>
                <p className="mt-6 text-5xl font-black">$21<span className="text-sm font-bold opacity-40">/mo</span></p>
                <a href="https://seo-indexer-tool.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-4 text-[11px] font-bold text-sky-500 hover:underline">Preview Indexer Tool →</a>
                <ul className={`my-8 flex-1 space-y-4 text-sm font-medium ${muted}`}>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Bulk indexing into Google & Bing</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Complete automation for speed</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>1-person job capacity</span></li>
                </ul>
                <button onClick={() => window.open(`https://wa.me/916391059119?text=${encodeURIComponent("Hi, I'd like to subscribe to the BLOGGER-INDEXER plan ($21/month)")}`, '_blank', 'noopener,noreferrer')} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg active:scale-95">Select Plan</button>
              </article>
              <article className={`flex flex-col rounded-3xl border p-8 transition-all hover:shadow-2xl ${surface}`}>
                <h3 className="text-xl font-black">BlackHat - AUTOMATOR</h3>
                <p className="mt-2 text-[11px] font-black uppercase tracking-widest text-sky-500">High-Volume Scale</p>
                <p className="mt-6 text-5xl font-black">$111<span className="text-sm font-bold opacity-40">/mo</span></p>
                <a href="https://seo-automation-tanusingh.vercel.app/" target="_blank" rel="noopener noreferrer" className="mt-4 text-[11px] font-bold text-sky-500 hover:underline">Preview Automator Tool →</a>
                <ul className={`my-8 flex-1 space-y-4 text-sm font-medium ${muted}`}>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Create 1000s of PDFs in seconds</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Template-based mass generation</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> <span>Scale agency from 10 to 1 person</span></li>
                </ul>
                <button onClick={() => window.open(`https://wa.me/916391059119?text=${encodeURIComponent("Hi, I'd like to subscribe to the BlackHat - AUTOMATOR plan ($111/month)")}`, '_blank', 'noopener,noreferrer')} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-black uppercase tracking-widest hover:opacity-90 transition shadow-lg active:scale-95">Select Plan</button>
              </article>
            </div>
          </section>
        </main>
      ) : (
        /* Legal Pages */
        <main className="mx-auto max-w-4xl px-6 py-32 animate-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setPage('home')} className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-sky-500 hover:underline">
            ← Back to Overview
          </button>
          
          <article className={`rounded-3xl border p-10 md:p-14 leading-relaxed shadow-sm space-y-8 ${surface}`}>
            {page === 'privacy' ? (
              <div className="space-y-8">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                  <h1 className="text-4xl font-black tracking-tighter mb-2">Privacy Policy</h1>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Last Updated: March 2026</p>
                </div>

                <div className="space-y-6 text-sm font-medium leading-relaxed">
                  <section className="space-y-3">
                    <h2 className="text-xl font-black">1. Information Collection</h2>
                    <p className={muted}>
                      When you connect your Google account, we request the <code>https://www.googleapis.com/auth/blogger</code> scope. We collect your email address and unique blog IDs to provide core automation services. We <strong>never</strong> access your Gmail, Drive, Contacts, or any other unrelated Google data.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-xl font-black">2. How We Use Your Data</h2>
                    <p className={muted}>
                      Your data is used exclusively to:
                    </p>
                    <ul className={`list-disc pl-5 space-y-1 text-xs ${muted}`}>
                      <li>Identify your Blogger profile to list available blogs.</li>
                      <li>Publish SEO-optimized articles directly to your selected blog.</li>
                      <li>Save draft content to your Blogger account for manual review.</li>
                      <li>Manage scheduled publishing workflows.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-xl font-black">3. Data Storage & Security</h2>
                    <p className={muted}>
                      We prioritize your security. Your Google OAuth tokens are stored locally in your browser's <code>localStorage</code> or encrypted within our secure database environment. All communications between our tool and Google APIs are encrypted via TLS 1.3. We do not store your Google password.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-xl font-black">4. Limited Use Disclosure</h2>
                    <div className="p-5 rounded-2xl border border-sky-500/20 bg-sky-500/5 text-sky-600 dark:text-sky-400 italic">
                      Automated-Blogger's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline font-bold">Google API Services User Data Policy</a>, including the Limited Use requirements.
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-xl font-black">5. Data Sharing & Third Parties</h2>
                    <p className={muted}>
                      We have a strict <strong>Zero Data Sale</strong> policy. We do <strong>NOT</strong> sell, rent, or trade your personal information, blog content, or OAuth credentials to third parties, advertising brokers, or marketing firms. Data is only shared with Google's own APIs to perform the publishing actions you explicitly trigger.
                    </p>
                  </section>
                  
                  <section className="space-y-3">
                    <h2 className="text-xl font-black">6. Your Control & Revocation</h2>
                    <p className={muted}>
                      You have full control over your data. You can disconnect your Google account from our dashboard at any time. To permanently revoke access, visit your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">Google Security Settings</a>.
                    </p>
                  </section>
                  
                  <section className="space-y-3 border-t border-slate-200 dark:border-slate-800 pt-6">
                    <h2 className="text-xl font-black">Contact</h2>
                    <p className={muted}>For privacy inquiries or data removal requests: <a href="mailto:aws.shashanksingh@gmail.com" className="text-sky-500 underline font-bold">aws.shashanksingh@gmail.com</a></p>
                  </section>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
                  <h1 className="text-4xl font-black tracking-tighter mb-2">Terms of Service</h1>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Last Updated: March 2026</p>
                </div>
                <div className="space-y-6 text-sm font-medium leading-relaxed">
                  <section className="space-y-3">
                    <h2 className="text-xl font-black">1. Acceptance</h2>
                    <p className={muted}>By using Automated-Blogger, you agree to these terms. You are responsible for ensuring all published content complies with Google Blogger policies.</p>
                  </section>
                  <section className="space-y-3">
                    <h2 className="text-xl font-black">2. Responsibilities</h2>
                    <p className={muted}>You maintain full responsibility for your account security and the legality of the content generated and published through the platform.</p>
                  </section>
                </div>
              </div>
            )}
          </article>
        </main>
      )}

      {/* Global Footer */}
      <footer className={`py-16 px-6 border-t transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3 opacity-40 grayscale group hover:grayscale-0 transition-all">
            <Zap className="w-5 h-5 text-sky-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">VERNIAK &copy; 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="mailto:aws.shashanksingh@gmail.com" className="opacity-60 hover:opacity-100 transition-opacity"><Mail className="w-5 h-5" /></a>
            <a href="https://www.linkedin.com/in/shashankrajputx/" target="_blank" rel="noreferrer" className="opacity-60 hover:opacity-100 transition-opacity"><Linkedin className="w-5 h-5" /></a>
            <a href="https://www.instagram.com/shashankrajput.__/" target="_blank" rel="noreferrer" className="opacity-60 hover:opacity-100 transition-opacity"><Instagram className="w-5 h-5" /></a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest opacity-60">
            <button onClick={() => setPage('home')} className="hover:text-sky-500 transition-colors">Overview</button>
            <button onClick={() => setPage('privacy')} className="hover:text-sky-500 transition-colors">Privacy Policy</button>
            <button onClick={() => setPage('terms')} className="hover:text-sky-500 transition-colors">Terms of Service</button>
            <a href="mailto:seo.tanusingh@gmail.com" className="hover:text-sky-500 transition-colors">Contact Support</a>
          </div>
        </div>
        <p className="text-center text-[9px] mt-10 opacity-30 font-bold uppercase tracking-[0.3em]">Built for high-performance content teams</p>
      </footer>
    </div>
  );
};
