import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, ExternalLink, Lock, Moon, Plane, ShieldCheck, Sun } from 'lucide-react';

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
    const message = `Hi, I'd like to subscribe to the ${plan.name} plan ($${plan.price}/month).`;
    window.open(`https://wa.me/916391059119?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur ${isDarkMode ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white/90'}`}>
        <button onClick={() => setPage('home')} className="flex items-center gap-3 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white"><Plane className="h-5 w-5" /></span>
          <span><strong className="block text-sm">Automated-Blogger</strong><small className="text-xs text-slate-500">Simple content growth for busy businesses</small></span>
        </button>
        <nav className="hidden items-center gap-5 text-xs font-semibold md:flex">
          <button onClick={() => setPage('home')} className="hover:text-sky-500">Overview</button>
          <a href="#pricing" className="hover:text-sky-500">Pricing</a>
          <button onClick={() => setPage('privacy')} className="hover:text-sky-500">Privacy</button>
          <button onClick={() => setPage('terms')} className="hover:text-sky-500">Terms</button>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className={`rounded-lg border p-2 ${isDarkMode ? 'border-slate-700 text-amber-300' : 'border-slate-300 text-slate-700'}`} aria-label="Toggle theme">
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={onOpenDashboard} className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500">Open dashboard <ArrowRight className="h-4 w-4" /></button>
        </div>
      </header>

      {page === 'home' ? (
        <main>
          <section className="mx-auto max-w-5xl px-6 py-20 text-center">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-500"><ShieldCheck className="h-4 w-4" /> Trusted publishing made easy</div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Turn your ideas into <span className="text-sky-500">consistent growth.</span></h1>
            <p className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed ${muted}`}>Create helpful travel content, add your own photos, and publish with confidence. Automated-Blogger gives your team a calm, repeatable way to stay visible and serve customers better.</p>
            <button onClick={onOpenDashboard} className="mt-8 rounded-xl bg-sky-600 px-6 py-3 font-bold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500">Start publishing <ArrowRight className="ml-2 inline h-4 w-4" /></button>
          </section>

          <section className="mx-auto grid max-w-5xl gap-5 px-6 pb-20 md:grid-cols-3">
            {['Choose your audience', 'Add your brand images', 'Review and publish'].map((step, index) => (
              <div key={step} className={`rounded-2xl border p-6 ${surface}`}>
                <span className="text-sm font-black text-sky-500">0{index + 1}</span>
                <h2 className="mt-3 font-bold">{step}</h2>
                <p className={`mt-2 text-sm leading-relaxed ${muted}`}>A guided workflow that keeps every article clear, useful, and ready for your customers.</p>
              </div>
            ))}
          </section>

          <section className="mx-auto max-w-5xl px-6 pb-20">
            <div className={`rounded-3xl border p-8 ${surface}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-sky-500">A companion growth tool</p>
                  <h2 className="mt-2 text-2xl font-black">Blogger Indexer</h2>
                  <p className={`mt-3 max-w-2xl leading-relaxed ${muted}`}>
                    Help your published articles get discovered by submitting pages for search review, checking progress, and keeping your publishing workflow organized in one simple companion workspace.
                  </p>
                </div>
                <a href="https://seo-indexer-tool.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white hover:bg-sky-500">
                  Open Blogger Indexer <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-6 pb-20">
            <div className={`rounded-3xl border p-8 ${surface}`}>
              <div className="flex items-center gap-3"><Lock className="h-5 w-5 text-emerald-500" /><h2 className="text-2xl font-bold">Secure Account Connection</h2></div>
              <p className={`mt-4 leading-relaxed ${muted}`}>We only request the account access needed to publish posts to the blog you choose. Your information is handled responsibly, protected during use, and never used to read unrelated personal content. You can review or remove access at any time from your account security settings.</p>
            </div>
          </section>

          <section id="pricing" className="mx-auto max-w-6xl px-6 pb-24">
            <div className="mb-10 text-center"><h2 className="text-3xl font-black">Pricing Plans</h2><p className={`mt-2 ${muted}`}>Choose the pace that fits your next stage of growth.</p></div>
            <div className="grid gap-5 lg:grid-cols-3">
              {plans.map(plan => <article key={plan.name} className={`flex flex-col rounded-2xl border p-7 ${surface}`}>
                <h3 className="text-xl font-black">{plan.name}</h3><p className="mt-2 text-sm font-semibold text-sky-500">{plan.tagline}</p>
                <p className="mt-6 text-4xl font-black">${plan.price}<span className="text-sm font-medium text-slate-500"> / month</span></p>
                <ul className={`my-7 flex-1 space-y-3 text-sm ${muted}`}>{plan.features.map(feature => <li key={feature}><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-500" />{feature}</li>)}</ul>
                <button onClick={() => subscribe(plan)} className="rounded-xl bg-sky-600 py-3 text-sm font-bold text-white hover:bg-sky-500">Subscribe</button>
              </article>)}
            </div>
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-3xl px-6 py-16">
          <button onClick={() => setPage('home')} className="mb-8 text-sm font-bold text-sky-500">← Back to overview</button>
          <article className={`rounded-2xl border p-8 leading-relaxed ${surface}`}>
            <h1 className="mb-6 text-3xl font-black">{page === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}</h1>
            {page === 'privacy' ? <>
              <p>We collect only the details needed to create and publish the content you request, such as your account identity, publishing destination, preferences, and images you choose to upload.</p>
              <p className="mt-4">We use this information to provide the service, keep your workspace reliable, and respond to support requests. We do not sell personal information. You can disconnect your account or contact us to request help with your information.</p>
            </> : <>
              <p>By using Automated-Blogger, you agree to provide accurate information, review content before publishing, and use the service for lawful business activity.</p>
              <p className="mt-4">Plans, limits, and support are described at checkout. You remain responsible for your published content and for keeping your account details secure. We may update these terms when the service changes.</p>
            </>}
          </article>
        </main>
      )}
      <footer className={`border-t px-6 py-8 text-center text-xs text-slate-500 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>Built for thoughtful teams that want more time for their customers.</footer>
    </div>
  );
};
