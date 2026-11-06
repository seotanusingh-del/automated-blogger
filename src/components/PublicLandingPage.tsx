import React, { useState } from 'react';
import { 
  Plane, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight, 
  Globe, 
  Database, 
  FileText, 
  Share2, 
  Layers, 
  Clock, 
  Eye, 
  Sun, 
  Moon, 
  Mail, 
  Linkedin, 
  Instagram, 
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  Code
} from 'lucide-react';

interface PublicLandingPageProps {
  onOpenDashboard: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onOpenDashboard,
  isDarkMode,
  onToggleTheme
}) => {
  const [activeTab, setActiveTab] = useState<'landing' | 'privacy' | 'terms' | 'oauth'>('landing');

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 flex flex-col ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Top Navbar */}
      <header className={`border-b sticky top-0 z-50 backdrop-blur-md px-6 py-3.5 flex items-center justify-between transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                Automated-Blogger
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verified OAuth
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              AI Blog Automation &amp; Google Blogger Directory Engine
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('landing')}
            className={`transition ${activeTab === 'landing' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Overview
          </button>
          <a 
            href="#features" 
            onClick={() => setActiveTab('landing')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Features
          </a>
          <a 
            href="#how-it-works" 
            onClick={() => setActiveTab('landing')}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            How It Works
          </a>
          <button 
            onClick={() => setActiveTab('oauth')}
            className={`transition ${activeTab === 'oauth' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Google OAuth &amp; Scopes
          </button>
          <button 
            onClick={() => setActiveTab('privacy')}
            className={`transition ${activeTab === 'privacy' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setActiveTab('terms')}
            className={`transition ${activeTab === 'terms' ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            Terms of Service
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border text-xs transition ${
              isDarkMode 
                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-400' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
            }`}
            title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenDashboard}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition active:scale-95"
          >
            <span>Sign In / Open Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* VIEW 1: Main Public Landing Page */}
        {activeTab === 'landing' && (
          <div>
            
            {/* HERO SECTION */}
            <section className="relative overflow-hidden pt-16 pb-20 px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-5xl mx-auto text-center space-y-6">
                
                {/* Verified Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Official Google Cloud OAuth Verified Application: Automated-Blogger</span>
                </div>

                {/* Primary Brand Headline (Exact name match: Automated-Blogger) */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                  Automate Your Google Blogger Workflow with <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">
                    Automated-Blogger
                  </span>
                </h1>

                {/* Clear Explanation of Purpose (Requirement #4) */}
                <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  <strong>Automated-Blogger</strong> is an enterprise content automation and directory publishing platform. 
                  It enables website owners and travel publishers to generate structured, keyword-targeted articles, 
                  synthesize responsive banners and SEO metadata, and seamlessly publish directly to <strong>Google Blogger</strong> via 
                  authenticated REST API integrations.
                </p>

                {/* Primary Actions */}
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={onOpenDashboard}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-sky-600/25 transition active:scale-95"
                  >
                    <span>Launch Publisher Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setActiveTab('oauth')}
                    className={`px-6 py-3 rounded-xl border font-bold text-sm flex items-center gap-2 transition ${
                      isDarkMode 
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200' 
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-sm'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>View Google OAuth Permissions</span>
                  </button>
                </div>

                {/* Key Pillars */}
                <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2 font-bold">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Blogger v3 API</div>
                    <p className="text-[11px] text-slate-500 mt-1">Direct REST publishing to Blog ID 1660638823295885987.</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">DeepSeek AI</div>
                    <p className="text-[11px] text-slate-500 mt-1">Unique, human-grade travel directory content &amp; FAQs.</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 font-bold">
                      <Database className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Supabase Archive</div>
                    <p className="text-[11px] text-slate-500 mt-1">Deduplication engine prevents keyword cannibalization.</p>
                  </div>

                  <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Google Limited Use</div>
                    <p className="text-[11px] text-slate-500 mt-1">100% compliant with Google API User Data Policies.</p>
                  </div>
                </div>

              </div>
            </section>

            {/* WHAT THE APP DOES / HOW IT WORKS SECTION (Requirement #4) */}
            <section id="how-it-works" className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-5xl mx-auto space-y-12">
                
                <div className="text-center space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    How Automated-Blogger Works
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    A streamlined, 4-step workflow that transforms raw destination and airline office data into indexed, high-converting Google Blogger publications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Step 1 */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-extrabold text-xs flex items-center justify-center border border-sky-500/20">
                        1
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Curate Airline &amp; City Target Profiles
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Select from verified international carriers (e.g. Southwest, Delta, American, Frontier, Alaska) and over 40+ destination cities. Configure target keywords, toll-free assistance numbers, and authority link structures.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-xs flex items-center justify-center border border-purple-500/20">
                        2
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        DeepSeek AI &amp; Responsive Media Generation
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Automated-Blogger synthesizes 100% unique, human-grade editorial copy via DeepSeek AI. It generates responsive SVG banners and AI photography, structured FAQs, and LocalBusiness schema markup tailored for search rankings.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center border border-emerald-500/20">
                        3
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Direct Google Blogger REST Publishing
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      With authorized Google OAuth 2.0 access, posts are transferred directly to Google Blogger. The platform configures SEO permalinks, search meta descriptions, latitude/longitude geotags, and custom robot tags automatically.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center border border-indigo-500/20">
                        4
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Quality Review &amp; Supabase Archiving
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Review drafts using the Live Blog Simulator or Review Queue Manager. Every published record is logged in Supabase with title and timestamp to prevent duplicate indexing and ensure content diversity.
                    </p>
                  </div>

                </div>

              </div>
            </section>

            {/* GOOGLE OAUTH PERMISSIONS & SCOPES TRANSPARENCY (Requirement #4 & Google Review) */}
            <section id="features" className="py-16 px-6 border-b border-slate-200 dark:border-slate-800">
              <div className="max-w-5xl mx-auto space-y-8">
                
                <div className="p-8 rounded-2xl border border-sky-500/30 bg-gradient-to-br from-sky-500/5 via-blue-500/5 to-transparent space-y-6">
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow font-bold">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Google OAuth 2.0 Scopes &amp; Permission Transparency
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Automated-Blogger operates under the strict principle of least privilege.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <p>
                      <strong>Why Automated-Blogger requests Google account permissions:</strong>
                    </p>
                    <div className={`p-4 rounded-xl border font-mono text-[11px] ${isDarkMode ? 'bg-slate-950 border-slate-800 text-sky-400' : 'bg-slate-100 border-slate-300 text-sky-800'}`}>
                      Scope Requested: https://www.googleapis.com/auth/blogger
                    </div>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>
                        <strong>Purpose:</strong> We request access to the Google Blogger API solely to draft, format, schedule, and publish authorized blog posts to your designated blog (Target Blog ID: <code>1660638823295885987</code> or custom user blog).
                      </li>
                      <li>
                        <strong>Strict Isolation:</strong> We <strong>never</strong> access your Google Drive, Gmail, Google Photos, Contacts, or any other personal Google data.
                      </li>
                      <li>
                        <strong>Storage &amp; Encryption:</strong> Refresh tokens are stored strictly in server-side environment variables or protected local storage during your authenticated session.
                      </li>
                      <li>
                        <strong>User Revocation:</strong> You may disconnect or revoke Automated-Blogger’s access at any time through your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">Google Account Security Settings</a>.
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('privacy')}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
                    >
                      Read Full Privacy Policy
                    </button>
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg border text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1"
                    >
                      Google API Services User Data Policy <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                </div>

              </div>
            </section>

          </div>
        )}

        {/* VIEW 2: Google OAuth Transparency Tab */}
        {activeTab === 'oauth' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            <button
              onClick={() => setActiveTab('landing')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              ← Back to Automated-Blogger Overview
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                OAuth 2.0 Integration &amp; Scope Disclosures
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                Google OAuth Scopes in Automated-Blogger
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Automated-Blogger is configured in the Google Cloud Console to streamline content creation for verified Google Blogger webmasters. Here is an explicit declaration of how Google OAuth is utilized.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Explicit Scope Declaration
              </h2>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-xs text-sky-700 dark:text-sky-400">
                https://www.googleapis.com/auth/blogger
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This scope allows Automated-Blogger to view and manage your Blogger blogs. Specifically, our application uses this scope exclusively to:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
                <li>Create and publish new blog posts containing formatted travel guides and office directories.</li>
                <li>Apply labels, location geotags, custom permalinks, and search descriptions.</li>
                <li>Publish posts as drafts or live posts based on your explicit review.</li>
              </ul>
            </div>

            <div className={`p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. What Automated-Blogger Does NOT Do
              </h2>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside">
                <li>We <strong>never</strong> delete existing posts or modify blogs other than the target blog configured by the publisher.</li>
                <li>We <strong>never</strong> access any other Google services (such as Gmail, Google Drive, Contacts, or Calendar).</li>
                <li>We <strong>never</strong> sell or share tokens or user credentials with any third party.</li>
                <li>We <strong>never</strong> use your Google Blogger data to train generalized AI/ML models.</li>
              </ul>
            </div>

            <div className={`p-6 rounded-2xl border space-y-4 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. How to Revoke Access
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                You maintain total authority over your Google account. You can revoke Automated-Blogger’s access at any time:
              </p>
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                <li>Visit your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">Google Account Security Permissions</a>.</li>
                <li>Find <strong>Automated-Blogger</strong> under Third-party apps with account access.</li>
                <li>Click <strong>Remove Access</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* VIEW 3: Comprehensive Privacy Policy (Requirement #2) */}
        {activeTab === 'privacy' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            <button
              onClick={() => setActiveTab('landing')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              ← Back to Automated-Blogger Overview
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Privacy &amp; Data Protection Compliance
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                Privacy Policy for Automated-Blogger
              </h1>
              <p className="text-xs text-slate-500">
                Effective Date: November 6, 2026 | Last Updated: November 6, 2026
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                This Privacy Policy describes how <strong>Automated-Blogger</strong> ("we", "our", or "the Service"), developed by Shashank Rajput, collects, uses, protects, and handles information when you use our web application located at <code>https://automated-blogger-one.vercel.app</code>.
              </p>
            </div>

            {/* Privacy Section 1 */}
            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Information We Collect
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When you interact with Automated-Blogger, we collect only the minimum information necessary to provide our publishing features:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>Google OAuth Data:</strong> If you authenticate with Google, we receive an authorized OAuth 2.0 access and refresh token under the <code>https://www.googleapis.com/auth/blogger</code> scope, as well as basic profile identification (e.g. user email address).
                </li>
                <li>
                  <strong>Blog Post Metadata:</strong> Post titles, HTML bodies, keywords, location coordinates, and category labels generated for publication.
                </li>
                <li>
                  <strong>Publishing History:</strong> Historical records of published post titles stored in Supabase to prevent duplicate content publishing.
                </li>
              </ul>
            </div>

            {/* Privacy Section 2 */}
            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. How We Use Your Information
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                We use the collected information strictly to:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
                <li>Authenticate your identity and verify authorization to publish to your target Google Blogger blog.</li>
                <li>Transmit approved blog content to the Google Blogger v3 REST API.</li>
                <li>Prevent duplicate content generation and keyword cannibalization across publishing sessions.</li>
                <li>Provide operational debugging and technical error resolution.</li>
              </ul>
            </div>

            {/* Privacy Section 3 - EXPLICIT NO SALE OF DATA */}
            <div className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <h2 className="text-base font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                3. Explicit Statement: We Do Not Sell User Data
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Automated-Blogger does not sell, rent, lease, trade, or transfer your personal data or Google user data to any third party under any circumstances.</strong> We do not engage with third-party ad networks, data brokers, or marketing syndicates.
              </p>
            </div>

            {/* Privacy Section 4 - GOOGLE LIMITED USE POLICY */}
            <div className="p-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 space-y-3">
              <h2 className="text-base font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-600" />
                4. Google API Services User Data Policy Compliance (Limited Use Requirements)
              </h2>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Automated-Blogger’s use and transfer to any other app of information received from Google APIs will strictly adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 underline font-semibold">Google API Services User Data Policy</a>, including the <strong>Limited Use</strong> requirements:
              </p>
              <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  We do not use Google user data to serve advertisements, including personalized, re-targeted, or interest-based advertising.
                </li>
                <li>
                  We do not allow humans to read user data unless we have obtained your affirmative agreement, for security purposes (such as investigating a bug), to comply with applicable law, or when data is aggregated and anonymized.
                </li>
                <li>
                  We do not use Google user data to train, fine-tune, or develop generalized Artificial Intelligence (AI) or Machine Learning (ML) models.
                </li>
              </ul>
            </div>

            {/* Privacy Section 5 */}
            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                5. Data Retention, Security &amp; Deletion
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                All OAuth tokens are secured using industry-standard TLS encryption in transit and environment variable protection at rest. If you wish to delete all associated history or clear local session data, you can do so directly within the application settings or by contacting our team.
              </p>
            </div>

            {/* Privacy Section 6 */}
            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                6. Contact Information
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                If you have any questions, concerns, or requests regarding this Privacy Policy or your data, please contact:
              </p>
              <div className="text-xs font-mono text-slate-700 dark:text-slate-300 space-y-1">
                <div>Application: <strong>Automated-Blogger</strong></div>
                <div>Developer: Shashank Rajput</div>
                <div>Support Email: <a href="mailto:seo.tanusingh@gmail.com" className="text-sky-600 dark:text-sky-400 underline">seo.tanusingh@gmail.com</a></div>
                <div>Website: <a href="https://automated-blogger-one.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 underline">https://automated-blogger-one.vercel.app</a></div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 4: Terms of Service */}
        {activeTab === 'terms' && (
          <div className="max-w-4xl mx-auto py-12 px-6 space-y-8">
            <button
              onClick={() => setActiveTab('landing')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              ← Back to Automated-Blogger Overview
            </button>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                <FileText className="w-3.5 h-3.5" />
                Terms of Service
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                Terms of Service for Automated-Blogger
              </h1>
              <p className="text-xs text-slate-500">
                Effective Date: November 6, 2026
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                By accessing or using <strong>Automated-Blogger</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                1. Permitted Use
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated-Blogger is provided solely to assist authorized publishers in generating, managing, and publishing content to blogs they own or have explicit authorization to administer on Google Blogger. You agree not to use the service for spamming, distributing malicious code, or violating third-party rights.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                2. Third-Party Services
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The service integrates with the Google Blogger API, DeepSeek AI, Pollinations, and Supabase. Your use of third-party features is subject to the respective terms and privacy policies of those providers.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                3. Disclaimer &amp; Limitation of Liability
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated-Blogger is provided on an "as-is" and "as-available" basis without warranties of any kind. In no event shall the developer or contributors be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the application.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                4. Contact
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                For questions regarding these Terms, contact <strong>seo.tanusingh@gmail.com</strong>.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER (Exact brand name, attribution, and contact) */}
      <footer className={`border-t py-8 px-6 transition-colors ${
        isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Automated-Blogger
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20">
                v2.6
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Google Blogger REST API Automation &amp; SEO Content Platform
            </p>
            <p className="text-[11px] text-slate-400">
              Developed by Shashank Rajput • Contact: <a href="mailto:seo.tanusingh@gmail.com" className="text-sky-600 dark:text-sky-400 underline">seo.tanusingh@gmail.com</a>
            </p>
          </div>

          {/* Quick Legal and Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button onClick={() => setActiveTab('landing')} className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Overview
            </button>
            <button onClick={() => setActiveTab('oauth')} className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Google OAuth Scopes
            </button>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-sky-600 dark:hover:text-sky-400 transition font-semibold text-slate-700 dark:text-slate-300">
              Privacy Policy
            </button>
            <button onClick={() => setActiveTab('terms')} className="hover:text-sky-600 dark:hover:text-sky-400 transition">
              Terms of Service
            </button>
            <button onClick={onOpenDashboard} className="text-sky-600 dark:text-sky-400 font-bold hover:underline">
              Publisher Sign In
            </button>
          </div>

        </div>

        {/* Verification Meta Notice */}
        <div className="max-w-5xl mx-auto mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 text-center">
          Google Search Console Property: https://automated-blogger-one.vercel.app • Google OAuth Consent Screen Application Name: Automated-Blogger
        </div>
      </footer>

    </div>
  );
};
