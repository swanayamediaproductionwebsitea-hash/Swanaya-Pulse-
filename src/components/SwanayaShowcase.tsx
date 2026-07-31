import React, { useState } from 'react';
import { 
  Sparkles, Phone, Mail, Instagram, Globe, Check, Star, ArrowRight,
  TrendingUp, Target, Code, Palette, Share2, Bot, Video, Building2,
  Calendar, CheckCircle2, MessageSquare, Send, Award, Clock, ShieldCheck,
  ChevronRight, ExternalLink, Zap, Users, ShieldAlert, Lock, LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface SwanayaShowcaseProps {
  onBookConsultation?: () => void;
  onAdminBypassLogin?: () => void;
  isMaintenanceMode?: boolean;
  maintenanceReason?: string;
  durationLockUntil?: string;
}

export default function SwanayaShowcase({ 
  onBookConsultation, 
  onAdminBypassLogin,
  isMaintenanceMode = false,
  maintenanceReason,
  durationLockUntil
}: SwanayaShowcaseProps) {
  const [activeServiceTab, setActiveServiceTab] = useState<'marketing' | 'branding' | 'web' | 'social' | 'ai' | 'video' | 'consultancy'>('marketing');
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [consultationSubmitted, setConsultationSubmitted] = useState(false);

  // Form State
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedService, setSelectedService] = useState('Digital Marketing');
  const [clientMessage, setClientMessage] = useState('');

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientEmail.trim()) return;

    const newRequest = {
      id: `consult_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim() || 'Not Provided',
      service: selectedService,
      message: clientMessage.trim() || 'No additional details provided.',
      status: 'NEW' as const,
      createdAt: new Date().toISOString(),
      timestampFormatted: new Date().toLocaleString()
    };

    // 1. Save to LocalStorage
    try {
      const existing = localStorage.getItem('swanaya_consultation_requests');
      const reqList = existing ? JSON.parse(existing) : [];
      reqList.unshift(newRequest);
      localStorage.setItem('swanaya_consultation_requests', JSON.stringify(reqList));
    } catch (err) {
      console.error('Failed to save consultation request locally', err);
    }

    // 2. Save to Firestore
    try {
      if (db) {
        await setDoc(doc(db, 'consultation_requests', newRequest.id), newRequest);
      }
    } catch (err) {
      console.warn('Firestore write for consultation request failed or offline:', err);
    }

    // 3. Dispatch window events for real-time update in Admin Console & Ticker
    window.dispatchEvent(new Event('swanaya_consultations_updated'));
    window.dispatchEvent(new CustomEvent('swanaya-simulation', {
      detail: {
        type: 'CONSULTATION_BOOKING',
        message: `🚀 NEW INBOUND CONSULTATION: ${clientName} (${clientEmail}) requested [${selectedService}]`
      }
    }));

    setConsultationSubmitted(true);

    setTimeout(() => {
      setShowConsultationModal(false);
      setConsultationSubmitted(false);
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setClientMessage('');
    }, 2800);
  };

  const services = [
    {
      id: 'marketing',
      icon: TrendingUp,
      title: 'Digital Marketing',
      tagline: 'Reach the right audience with targeted campaigns that drive real business growth.',
      badge: 'High ROI',
      color: 'from-amber-500 to-orange-600',
      description: 'Maximize your audience reach and lead generation with data-backed Meta Ads (Facebook & Instagram), precision Google Ads, local SEO, and multi-channel campaign architectures.',
      keyFeatures: [
        'Meta Ads (Facebook & Instagram Ads) Management',
        'Google Ads & Search Engine Marketing (SEM)',
        'SEO (Search Engine Optimization) & Local Search Rank',
        'Performance Marketing & Precision Lead Funnels',
        'Conversion Rate Optimization (CRO) & Pixel Setup'
      ],
      metrics: 'Avg. 3.4x ROAS across active client campaigns'
    },
    {
      id: 'branding',
      icon: Palette,
      title: 'Branding & Identity',
      tagline: 'Create a memorable identity with professional logos, brand guidelines, and marketing materials.',
      badge: 'Creative Excellence',
      color: 'from-purple-500 to-indigo-600',
      description: 'Craft an unforgettable brand aesthetic that resonates emotionally with your audience. From bespoke vector typography to comprehensive brand style guides and print collateral.',
      keyFeatures: [
        'Custom Vector Logo & Brand Symbol Design',
        'Complete Brand Guidelines (Color, Type, Voice)',
        'Business Cards, Letterheads & Marketing Collateral',
        'Packaging Design & Visual Retail Mockups',
        'Rebranding & Corporate Identity Transformation'
      ],
      metrics: '100+ Brands Transformed Globally'
    },
    {
      id: 'web',
      icon: Code,
      title: 'Website Development',
      tagline: 'Modern, responsive, and SEO-friendly websites built to convert visitors into customers.',
      badge: 'Ultra Fast',
      color: 'from-emerald-500 to-teal-600',
      description: 'High-performance web applications and e-commerce platforms engineered with modern frameworks. Lightning fast page speeds, mobile responsiveness, and seamless payment gateways.',
      keyFeatures: [
        'Custom Web Application & SPA Engineering',
        'Responsive E-commerce & Online Storefronts',
        'Landing Pages Engineered for High Conversions',
        'SEO-Optimized Code Architecture & Fast Speed',
        'Content Management System (CMS) Integration'
      ],
      metrics: '99.9% Uptime & Sub-Second Page Loads'
    },
    {
      id: 'social',
      icon: Share2,
      title: 'Social Media Management',
      tagline: 'Engaging content, creative designs, and strategic campaigns to grow your online community.',
      badge: 'Viral Reach',
      color: 'from-pink-500 to-rose-600',
      description: 'Build a loyal, hyper-engaged social community. We handle daily content scheduling, visual artwork creation, Instagram Reels, trend adaptation, and community interaction.',
      keyFeatures: [
        'Full Monthly Content Calendar & Copywriting',
        'Custom Reel & Short Video Editing',
        'Community Engagement & DMs/Comment Care',
        'Influencer Collaborations & Media Outreach',
        'Monthly Analytics & Audience Growth Insights'
      ],
      metrics: 'Over 10M+ Organic Video Impressions'
    },
    {
      id: 'ai',
      icon: Bot,
      title: 'AI Business Solutions',
      tagline: 'Automate workflows, generate content, and improve customer engagement with AI-powered tools.',
      badge: 'Next-Gen Tech',
      color: 'from-cyan-500 to-blue-600',
      description: 'Transform your business efficiency using custom AI models, automated workflow triggers, customer support AI chatbots, and predictive analytics dashboards.',
      keyFeatures: [
        'Custom AI Customer Support Chatbots & Agents',
        'Automated Content & Graphic Generation Pipelines',
        'Workflow Automation (CRM & Database Syncing)',
        'Predictive Lead Scoring & Social Trend Analysis',
        'Custom Gemini Model API Integrations'
      ],
      metrics: 'Reduces Manual Support Hours by 70%'
    },
    {
      id: 'video',
      icon: Video,
      title: 'Professional Video Production',
      tagline: 'Cinematic ad reels, brand films, and talk show productions that captivate your audience.',
      badge: '4K Cinema Quality',
      color: 'from-red-500 to-amber-600',
      description: 'High-impact video storytelling. From scriptwriting and multi-cam studio setups to color grading, sound design, and talk shows like "Chai with Aadithyan".',
      keyFeatures: [
        'Commercial Advertisements & Brand Promo Films',
        'Podcast & Talk Show Multi-Camera Studio Setup',
        'Corporate Event Coverage & Cinematography',
        'Product Demo Videos & Motion Graphics',
        'Professional Color Grading & Audio Mastering'
      ],
      metrics: '4K Ultra-HD Broadcast Standard'
    },
    {
      id: 'consultancy',
      icon: Building2,
      title: 'Business Consultancy',
      tagline: 'Strategic advice on digital scaling, market entry, and operational efficiency.',
      badge: 'Strategic Growth',
      color: 'from-indigo-500 to-purple-700',
      description: 'Expert advisory services for startups, educational institutions, and enterprises looking to digitize their operations, optimize customer acquisition, and scale revenue.',
      keyFeatures: [
        'Digital Transformation & Tech Stack Audits',
        'Go-To-Market Strategy for Startups & Products',
        'Customer Acquisition & Retention Roadmaps',
        'Institutional & Educational Digital Branding',
        'Executive Mentorship & Growth Advisory'
      ],
      metrics: 'Proven Track Record Across 12+ Industries'
    }
  ];

  const industries = [
    { title: 'Small & Medium Businesses', desc: 'Custom growth funnels & local customer targeting.' },
    { title: 'Startups & Tech Firms', desc: 'Fast brand launching, MVP design & investor pitch assets.' },
    { title: 'Educational Institutions', desc: 'Digital admissions campaigns & institutional branding.' },
    { title: 'Tourism & Hospitality', desc: 'Destination marketing, resort branding & booking ads.' },
    { title: 'Retail & E-commerce', desc: 'High-converting online stores & shopping ads.' },
    { title: 'Healthcare & Wellness', desc: 'Patient trust campaigns, website booking & clinic branding.' },
    { title: 'Restaurants & Cafés', desc: 'Food photography, reels & local footfall marketing.' },
    { title: 'Real Estate', desc: 'Lead generation for luxury listings & virtual tours.' },
    { title: 'Personal Brands & Influencers', desc: 'Podcast production, social growth & media strategy.' },
    { title: 'Corporate Organizations', desc: 'Corporate communications, annual report designs & PR.' }
  ];

  const testimonials = [
    {
      quote: "Swanaya Media Enterprises transformed our online presence and significantly increased our customer inquiries within 30 days.",
      author: "Rajesh V.",
      role: "Managing Director, Apex Tourism",
      rating: 5
    },
    {
      quote: "Professional, creative, and highly responsive. Our website and social media channels have never looked better!",
      author: "Dr. Ananya Nair",
      role: "Director, Horizon Academy",
      rating: 5
    },
    {
      quote: "Excellent branding and digital marketing services that delivered measurable ROI and real business growth.",
      author: "Siddharth M.",
      role: "Founder, Zenith E-commerce",
      rating: 5
    }
  ];

  const activeServiceObj = services.find(s => s.id === activeServiceTab) || services[0];

  return (
    <div className="w-full text-slate-100 font-sans space-y-8 animate-fade-in">
      
      {/* MAINTENANCE MODE ALERT TOPPER IF APPLICABLE */}
      {isMaintenanceMode && (
        <div className="bg-rose-950/90 border-2 border-rose-500 rounded-2xl p-4 text-rose-200 shadow-2xl space-y-3 font-mono text-xs text-left relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-600/30 text-rose-400 border border-rose-500/50 rounded-xl shrink-0 animate-pulse">
              <Lock className="w-6 h-6 text-rose-400" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-extrabold uppercase text-white tracking-wider text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> PORTAL ACCESS LOCKED FOR MAINTENANCE
                </span>
                <span className="bg-rose-900 px-2 py-0.5 rounded border border-rose-700 text-[9px] text-rose-200 font-bold uppercase">
                  SWANAYA SHOWCASE ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-rose-200/90 font-sans leading-relaxed">
                {maintenanceReason || 'Scheduled Maintenance & System Security Updates in progress. Portal forms are temporarily offline.'}
              </p>
              {durationLockUntil && (
                <div className="text-[10px] text-rose-300/80 pt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Scheduled Unlock: <strong>{new Date(durationLockUntil).toLocaleString()}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Emergency Access Trigger */}
          {onAdminBypassLogin && (
            <div className="pt-2 border-t border-rose-800/80 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] text-slate-300 font-sans">
                Are you a System Administrator?
              </span>
              <button
                type="button"
                onClick={onAdminBypassLogin}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-[10px] font-mono uppercase flex items-center gap-1 cursor-pointer shadow transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" /> Administrator Emergency Access
              </button>
            </div>
          )}
        </div>
      )}

      {/* HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-6 md:p-10 shadow-2xl text-center md:text-left">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Swanaya Media Enterprises</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white uppercase leading-tight">
              Transform Your Business Into A <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-500">Powerful Digital Brand</span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-mono tracking-wide uppercase text-amber-200/90 font-bold">
              Digital Marketing • Branding • Website Development • AI Solutions
            </p>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans max-w-2xl">
              Grow your business with strategic marketing, creative branding, high-performance websites, and AI-powered business solutions designed to increase your visibility, leads, and sales.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-mono font-bold text-slate-200">
              <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Free Business Consultation
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-amber-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Affordable Packages
              </div>
              <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-indigo-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> Customized Strategies
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowConsultationModal(true);
                  if (onBookConsultation) onBookConsultation();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black px-6 py-3.5 rounded-xl text-xs font-mono uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" /> 🚀 Book A Free Consultation
              </button>

              <a
                href="https://instagram.com/swanayamediaenterprises"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold px-5 py-3.5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-pink-400" /> Follow On Instagram
              </a>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl space-y-4 text-left shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white font-mono uppercase">Direct Contact Desk</h4>
                <p className="text-[10px] text-slate-400">Swanaya Media Enterprises</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate text-[11px]">swanayamediaenterpises@gmail.com</span>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="text-[11px]">@swanayamediaenterprises</span>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-[11px]">Swanaya Media Enterprises</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowConsultationModal(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2.5 px-3 rounded-xl text-xs font-mono uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors border border-amber-500/30"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" /> Request Immediate Call Back
            </button>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE SWANAYA MEDIA ENTERPRISES */}
      <div className="bg-slate-950/80 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-left shadow-xl">
        <div className="max-w-3xl space-y-2">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-2.5 py-1 rounded border border-amber-900/60">
            Why Choose Swanaya Media Enterprises?
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white font-display uppercase tracking-tight">
            We Help Businesses Establish A Strong Digital Presence
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
            We help startups, entrepreneurs, educational institutions, tourism businesses, and growing companies establish a strong digital presence through innovative marketing and technology.
          </p>
        </div>

        {/* Expertise Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {services.map((s) => {
            const IconComponent = s.icon;
            return (
              <div
                key={s.id}
                onClick={() => setActiveServiceTab(s.id as any)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-2 group ${
                  activeServiceTab === s.id
                    ? 'bg-amber-950/40 border-amber-500 text-amber-200 shadow-lg shadow-amber-950/30'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 w-fit group-hover:scale-110 transition-transform">
                  <IconComponent className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono uppercase">{s.title}</h4>
                  <p className="text-[9px] text-slate-400 line-clamp-1 mt-0.5">{s.badge}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OUR SERVICES - INTERACTIVE DEDICATED TABS */}
      <div className="bg-slate-950/90 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-left shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
              Our Services Portfolio
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white font-display uppercase tracking-tight">
              Comprehensive Growth Solutions
            </h2>
          </div>

          {/* Service Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveServiceTab(s.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  activeServiceTab === s.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 border-amber-400 shadow-md font-extrabold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Service Detailed Landing Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
                {React.createElement(activeServiceObj.icon, { className: 'w-7 h-7' })}
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800 uppercase">
                  {activeServiceObj.badge}
                </span>
                <h3 className="text-xl font-black text-white font-display uppercase tracking-tight mt-1">
                  {activeServiceObj.title}
                </h3>
              </div>
            </div>

            <p className="text-xs md:text-sm text-slate-200 font-sans leading-relaxed font-semibold">
              {activeServiceObj.tagline}
            </p>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {activeServiceObj.description}
            </p>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Key Features & Deliverables:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                {activeServiceObj.keyFeatures.map((kf, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px]">{kf}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-mono text-amber-300 font-bold">
                ⚡ Performance Benchmark: {activeServiceObj.metrics}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedService(activeServiceObj.title);
                  setShowConsultationModal(true);
                }}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs font-mono uppercase flex items-center gap-1.5 cursor-pointer shadow transition-all"
              >
                Inquire About {activeServiceObj.title} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Why Businesses Trust Us
            </h4>

            <div className="space-y-3 text-xs font-sans text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono text-[11px] uppercase">✔ Creative Strategy</strong>
                  <p className="text-[11px] text-slate-400">Marketing solutions tailored strictly to your unique business goals.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono text-[11px] uppercase">✔ Result-Oriented Campaigns</strong>
                  <p className="text-[11px] text-slate-400">Focus on measurable growth, quality lead generation, and higher conversion rates.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono text-[11px] uppercase">✔ Modern Technology</strong>
                  <p className="text-[11px] text-slate-400">Leveraging AI, automation, and the latest digital marketing trends.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-mono text-[11px] uppercase">✔ Dedicated Support</strong>
                  <p className="text-[11px] text-slate-400">A reliable team committed to your long-term business success.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OUR 4-STEP PROCESS */}
      <div className="bg-slate-950/80 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            Methodology
          </span>
          <h2 className="text-xl md:text-3xl font-black text-white font-display uppercase tracking-tight">
            Our 4-Step Execution Process
          </h2>
          <p className="text-xs text-slate-400">From initial consultation to measurable scale and business growth.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1️⃣', title: 'Consultation', desc: 'We understand your business objectives, target market, and operational challenges.' },
            { step: '2️⃣', title: 'Strategy', desc: 'Develop a customized digital marketing, branding, and web technical roadmap.' },
            { step: '3️⃣', title: 'Execution', desc: 'Launch targeted ad campaigns, build your website, and produce engaging creative media.' },
            { step: '4️⃣', title: 'Growth', desc: 'Monitor analytics performance, optimize conversion funnels, and scale your brand.' }
          ].map((proc, i) => (
            <div key={i} className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-2 relative group hover:border-amber-500/50 transition-all">
              <span className="text-2xl">{proc.step}</span>
              <h3 className="text-xs font-bold font-mono text-white uppercase">{proc.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{proc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* INDUSTRIES WE SERVE */}
      <div className="bg-slate-950/90 border border-slate-800 p-6 md:p-8 rounded-3xl space-y-6 text-left">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
            Domain Expertise
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white font-display uppercase tracking-tight">
            Industries We Serve
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {industries.map((ind, i) => (
            <div key={i} className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <h4 className="text-xs font-bold text-white font-mono uppercase">{ind.title}</h4>
              <p className="text-[10px] text-slate-400 line-clamp-2">{ind.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 p-6 md:p-8 rounded-3xl space-y-6 text-left shadow-xl">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            Client Feedback
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white font-display uppercase tracking-tight">
            Verified Reviews & Experience
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex text-amber-400 gap-1 text-xs">
                  {Array.from({ length: t.rating }).map((_, r) => (
                    <Star key={r} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic font-sans leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-900">
                <h5 className="text-xs font-bold font-mono text-white uppercase">{t.author}</h5>
                <p className="text-[10px] text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER & CTA BANNER */}
      <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-black text-white font-display uppercase tracking-tight">
            Ready To Grow Your Business?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed">
            Whether you're launching a new business or scaling an existing one, Swanaya Media Enterprises provides the digital solutions you need to succeed.
          </p>
          <div className="inline-block bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-amber-300 font-mono text-xs font-bold uppercase">
            🚀 Let's Build Your Brand Together!
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setShowConsultationModal(true)}
            className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-8 py-3 rounded-xl text-xs font-mono uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
          >
            <Sparkles className="w-4 h-4" /> Book Your Free Consultation Now
          </button>
        </div>

        <div className="pt-6 border-t border-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-400 text-left">
          <div>
            <h4 className="text-sm font-black text-white uppercase font-display">Swanaya Media Enterprises</h4>
            <p className="text-[11px] text-slate-400 mt-1">Creating Brands. Building Experiences. Growing Businesses.</p>
          </div>

          <div>
            <h5 className="font-bold text-slate-200 uppercase mb-1">Our Core Services</h5>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Digital Marketing • Branding • Website Development • AI Solutions • Video Production • Social Media • Business Consultancy
            </p>
          </div>

          <div className="space-y-1">
            <h5 className="font-bold text-slate-200 uppercase mb-1">Contact Us</h5>
            <p className="text-[11px] text-amber-300">📧 swanayamediaenterpises@gmail.com</p>
            <p className="text-[11px] text-pink-400">📸 @swanayamediaenterprises</p>
          </div>
        </div>
      </div>

      {/* CONSULTATION BOOKING MODAL */}
      <AnimatePresence>
        {showConsultationModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-amber-500/40 w-full max-w-lg p-6 rounded-3xl shadow-2xl space-y-4 text-left relative"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white font-display uppercase tracking-tight">
                      Free Business Consultation
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400">Swanaya Media Enterprises Desk</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConsultationModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {consultationSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white uppercase font-mono">Consultation Request Received!</h4>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto font-sans leading-relaxed">
                    Thank you, <strong>{clientName}</strong>. Our digital strategy team at Swanaya Media Enterprises will reach out to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConsultationSubmit} className="space-y-3 text-xs font-mono">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@company.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Phone / WhatsApp</label>
                      <input
                        type="text"
                        placeholder="+91 9876543210"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Service Interested In</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
                    >
                      <option value="Digital Marketing">Digital Marketing (Meta/Google Ads)</option>
                      <option value="Branding">Branding & Identity</option>
                      <option value="Website Development">Website Development</option>
                      <option value="Social Media Management">Social Media Management</option>
                      <option value="AI Business Solutions">AI Business Solutions</option>
                      <option value="Professional Video Production">Professional Video Production</option>
                      <option value="Business Consultancy">Business Consultancy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Business Details / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Briefly describe your business goals..."
                      value={clientMessage}
                      onChange={(e) => setClientMessage(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleConsultationSubmit}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow transition-colors mt-2"
                  >
                    <Send className="w-4 h-4" /> Submit Consultation Request
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
