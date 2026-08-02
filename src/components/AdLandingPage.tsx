import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Megaphone, Target, TrendingUp, Zap, CheckCircle2, ArrowRight, ShieldCheck, 
  BarChart3, Video, DollarSign, Calculator, Send, MessageSquare, Star, Globe, Award,
  Users, Mail, Phone, Calendar, Layers, ExternalLink, Code
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

interface AdLandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register_standard' | 'register_demo') => void;
  onOpenLegal: (tab?: 'privacy' | 'terms' | 'additional') => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

export default function AdLandingPage({ onOpenAuth, onOpenLegal, addLog }: AdLandingPageProps) {
  // Campaign Estimator state
  const [adSpend, setAdSpend] = useState<number>(50000);
  const [targetRoas, setTargetRoas] = useState<number>(3.5);
  const [channel, setChannel] = useState<'all' | 'meta' | 'google' | 'reels'>('all');

  // Consultation Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('₹50,000 - ₹2,000,000+');
  const [campaignNotes, setCampaignNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculate projected revenue & ROI
  const projectedRevenue = Math.round(adSpend * targetRoas);
  const estimatedLeads = Math.round(adSpend / 150);

  const handleSubmitConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsSubmitting(true);
    const cleanEmail = email.trim();
    const leadObj = {
      id: `lead_ad_${Date.now()}`,
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      companyName: companyName.trim(),
      monthlyBudget,
      campaignNotes: campaignNotes.trim(),
      submittedAt: new Date().toISOString(),
      source: 'Ad_Landing_Page_Showcase',
      status: 'NEW_AD_LEAD'
    };

    // Save locally
    const existing = JSON.parse(localStorage.getItem('swanaya_inbound_leads') || '[]');
    localStorage.setItem('swanaya_inbound_leads', JSON.stringify([leadObj, ...existing]));

    // Try Firestore save
    try {
      const docRef = doc(db, 'inbound_leads', leadObj.id);
      await setDoc(docRef, leadObj);
      addLog(`Ad Showcase: Inbound media campaign booking saved to Firestore for ${fullName}`, 'success');
    } catch (e) {
      console.warn('Firestore offline:', e);
    }

    addLog(`Ad Showcase: New VIP Media & Ad Campaign request received from "${fullName}" (${cleanEmail})`, 'success');
    setIsSubmitting(false);
    setSubmitSuccess(true);

    // Track GTM dataLayer conversion event
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'gtm_ad_consultation_submit',
        leadName: fullName,
        budget: monthlyBudget,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        {/* Background ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
              <Megaphone className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              SWANIQUE AI & SWANAYA MEDIA AD SHOWCASE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              168-HOUR / 1-WEEK UNLOCKED TRIAL ACTIVE
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 backdrop-blur-md">
              <Code className="w-3.5 h-3.5 text-purple-400" />
              GTM CONTAINER GTM-MSGBPBT2 READY
            </span>
          </div>

          {/* Hero Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono leading-tight">
              Scale Your Advertising Revenue with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
                Next-Gen AI Media Automation
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              Combine high-converting Meta & Google ad creatives, AI-driven content scheduling, 
              GTM data tracking, and high-definition video productions into one central command hub.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => onOpenAuth('register_demo')}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-mono text-sm font-bold uppercase tracking-wider transition-all transform hover:scale-[1.02] shadow-2xl shadow-indigo-600/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
                <span>Start 168-Hour Ad Campaign Trial</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#consultation-form"
                className="w-full sm:w-auto bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 px-7 py-4 rounded-2xl font-mono text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Book VIP Ad Consultation</span>
              </a>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 max-w-4xl mx-auto font-mono text-left">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-2xl font-black text-indigo-400 block">4.2x</span>
                <span className="text-[11px] text-slate-400 uppercase">Average Ad ROAS</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-2xl font-black text-emerald-400 block">10x Faster</span>
                <span className="text-[11px] text-slate-400 uppercase">Ad Content Creation</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-2xl font-black text-purple-400 block">100%</span>
                <span className="text-[11px] text-slate-400 uppercase">GTM & DataLayer Tracking</span>
              </div>
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <span className="text-2xl font-black text-amber-400 block">168 Hours</span>
                <span className="text-[11px] text-slate-400 uppercase">Full Studio Access</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. AD CAMPAIGN ROI CALCULATOR */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-mono text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" /> Interactive Campaign ROI Estimator
              </span>
              <h2 className="text-2xl font-black text-white font-mono mt-1">
                Project Your Return on Ad Spend (ROAS)
              </h2>
            </div>
            <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-xs font-mono font-bold px-3 py-1.5 rounded-xl">
              SWANIQUE AI ALGORITHMIC SIMULATOR
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Spend Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <label className="text-slate-300 font-bold uppercase">Monthly Advertising Budget:</label>
                  <span className="text-indigo-400 font-black text-sm">₹{adSpend.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={500000}
                  step={5000}
                  value={adSpend}
                  onChange={(e) => setAdSpend(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>₹10,000</span>
                  <span>₹250,000</span>
                  <span>₹500,000+</span>
                </div>
              </div>

              {/* ROAS Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <label className="text-slate-300 font-bold uppercase">Target Return on Ad Spend (ROAS):</label>
                  <span className="text-emerald-400 font-black text-sm">{targetRoas}x Multiple</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={8.0}
                  step={0.1}
                  value={targetRoas}
                  onChange={(e) => setTargetRoas(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>2.0x (Standard)</span>
                  <span>4.0x (Swanique Avg)</span>
                  <span>8.0x (High Scale)</span>
                </div>
              </div>

              {/* Channel Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-mono text-slate-300 font-bold uppercase">Primary Campaign Channel:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'all', label: 'Omni-Channel' },
                    { id: 'meta', label: 'Meta Ads (IG/FB)' },
                    { id: 'google', label: 'Google Search/PPC' },
                    { id: 'reels', label: 'Viral Reels Production' },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setChannel(ch.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                        channel === ch.id
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Live Projected Output */}
            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  PROJECTED MONTHLY REVENUE
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                  ₹{projectedRevenue.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  Net estimated revenue generated from ₹{adSpend.toLocaleString()} spend at {targetRoas}x ROAS.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-4 grid grid-cols-2 gap-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">ESTIMATED QUALIFIED LEADS</span>
                  <span className="text-lg font-black text-indigo-300">~{estimatedLeads} Leads</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">NET PROFIT MARGIN</span>
                  <span className="text-lg font-black text-purple-300">₹{(projectedRevenue - adSpend).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenAuth('register_demo')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Launch This Campaign (168-Hr Trial)</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. ADVERTISER FEATURE MATRIX */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
            Why Top Brands & Agencies Choose Swanique AI
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Everything required to run high-performance digital ad campaigns under one unified media stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Megaphone className="w-6 h-6 text-indigo-400" />,
              title: 'AI Ad Copy & Creative Generator',
              desc: 'Generate dozens of high-converting Meta & Google ad copies, headlines, and call-to-actions in seconds tailored for your target audience.'
            },
            {
              icon: <Code className="w-6 h-6 text-purple-400" />,
              title: 'Google Tag Manager Container (GTM-MSGBPBT2)',
              desc: 'Integrated with window.dataLayer conversion tracking out-of-the-box. Track form submissions, leads, and page views effortlessly.'
            },
            {
              icon: <Video className="w-6 h-6 text-emerald-400" />,
              title: 'Reels & Video Storyboard Hub',
              desc: 'Plan, script, and schedule high-definition promotional videos and short reels with built-in shot lists and visual asset management.'
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
              title: 'SEO Audit & Keyword Tracker',
              desc: 'Track organic search positions alongside paid campaigns to capture full search intent across Google and social channels.'
            },
            {
              icon: <Users className="w-6 h-6 text-cyan-400" />,
              title: 'Multi-User Agency Collaboration',
              desc: 'Invite clients, content makers, and media buyers with custom permission levels (Administrator, Editor, Viewer).'
            },
            {
              icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
              title: 'Enterprise Security & 168-Hour Trial',
              desc: 'Fully protected by Firestore security rules, encrypted sessions, and a generous 168-hour (1 full week) unlocked trial.'
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all space-y-3">
              <div className="p-3 bg-slate-950 rounded-xl w-fit border border-slate-800">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-white font-mono">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. INBOUND VIP CONSULTATION & AD BOOKING FORM */}
      <section id="consultation-form" className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white font-mono uppercase tracking-wide">
                Book VIP Media & Ad Campaign Strategy Call
              </h3>
              <p className="text-xs text-slate-400">
                Speak directly with the Swanaya Media Production & Swanique AI growth team.
              </p>
            </div>
          </div>

          {submitSuccess ? (
            <div className="bg-emerald-950/80 border border-emerald-500/60 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white font-mono">
                Consultation Request Received!
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Thank you <strong>{fullName}</strong>. Our senior advertising strategist will contact you at <strong>{email}</strong> within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitSuccess(false)}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitConsultation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white p-3 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Business Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white p-3 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white p-3 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Swanique Productions"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white p-3 rounded-xl outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Estimated Monthly Advertising Spend
                </label>
                <select
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white p-3 rounded-xl outline-none font-mono cursor-pointer"
                >
                  <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000 / month</option>
                  <option value="₹50,000 - ₹2,000,000+">₹50,000 - ₹200,000 / month</option>
                  <option value="₹200,000 - ₹1,000,000+">₹200,000 - ₹1,000,000 / month</option>
                  <option value="₹1,000,000+ Enterprise">₹1,000,000+ Enterprise Scale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">
                  Campaign Goals & Special Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your brand target audience, current ad channels, or media goals..."
                  value={campaignNotes}
                  onChange={(e) => setCampaignNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-white p-3 rounded-xl outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider py-4 rounded-2xl transition-all shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Request...' : 'Submit VIP Consultation Booking'}</span>
              </button>
            </form>
          )}

        </div>
      </section>

      {/* 5. FOOTER WITH LEGAL LINKS */}
      <footer className="border-t border-slate-800/80 pt-10 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-mono text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-slate-300 font-bold">
            © 2026 Swanique AI • Swanaya Media Productions
          </p>
          <p className="text-[10px] text-slate-500">
            Powered by Gemini AI Engine & Firestore Multi-Tenant Architecture
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenLegal('privacy')}
            className="hover:text-indigo-400 transition-colors cursor-pointer underline"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('terms')}
            className="hover:text-indigo-400 transition-colors cursor-pointer underline"
          >
            Terms & Conditions
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenLegal('additional')}
            className="hover:text-indigo-400 transition-colors cursor-pointer underline"
          >
            Compliance Framework
          </button>
        </div>
      </footer>

    </div>
  );
}
