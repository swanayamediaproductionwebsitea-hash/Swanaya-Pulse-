import React, { useState } from 'react';
import { 
  Sparkles, Flame, BarChart3, TrendingUp, Search, Calendar, Shield,
  ArrowRight, MessageSquare, Zap, Target, Database, Terminal, Cpu,
  ChevronDown, ChevronUp, ExternalLink, Mail, Globe, Laptop, HelpCircle,
  Play, Users, Check, Star, User, Tv, Radio, Video, Plus, Trash2, Volume2, VolumeX, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveLandingProps {
  onEnterPortal: () => void;
  registeredUsersCount: number;
  isLoggedVideoOnly?: boolean;
}

export default function InteractiveLanding({ onEnterPortal, registeredUsersCount, isLoggedVideoOnly = false }: InteractiveLandingProps) {
  const [activeDemo, setActiveDemo] = useState<'roi' | 'seo' | 'status'>('roi');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [experiences, setExperiences] = useState<any[]>([]);

  // Live Telecasting Broadcast Tracker & Video Player Simulation States with workspace filters
  const [selectedWorkspaceTab, setSelectedWorkspaceTab] = useState<'client' | 'creator' | 'admin'>('creator');
  const [liveTelecasts, setLiveTelecasts] = useState([
    // Creator Hub
    { id: '1', title: 'Chai with Aadi - Episode #12: Future of AI Creative Production', category: 'Talk Show', uptime: '1h 12m', status: 'ON AIR', viewers: 1420, date: '2026-07-19', handle: '@chai_with_aadi', workspace: 'creator' },
    { id: '2', title: 'Swanaya Media Brand Reveal & Masterclass Live Stream', category: 'Live Event', uptime: '0h 0m', status: 'SCHEDULED', viewers: 0, date: '2026-07-20', handle: '@swanaya_enterprises', workspace: 'creator' },
    { id: '3', title: 'AI Production Optimization & D3 Data Visualization Panel', category: 'Masterclass', uptime: '2h 15m', status: 'COMPLETED', viewers: 0, date: '2026-07-18', handle: '@chai', workspace: 'creator' },
    
    // Client Portal
    { id: '4', title: 'Q3 Enterprise Campaign Strategy & Brand Launch Pitch', category: 'Client Pitch', uptime: '0h 45m', status: 'ON AIR', viewers: 350, date: '2026-07-19', handle: '@swanaya_enterprises', workspace: 'client' },
    { id: '5', title: 'Production Budget Audit & Social Publishing Milestones', category: 'Financial Board', uptime: '0h 0m', status: 'SCHEDULED', viewers: 0, date: '2026-07-22', handle: '@client_sponsor', workspace: 'client' },
    
    // Admin Command
    { id: '6', title: 'Mainframe Logs Real-Time Dispatcher & Firestore Audit Feed', category: 'System Logs', uptime: '14h 5m', status: 'ON AIR', viewers: 24, date: '2026-07-19', handle: '@central_admin', workspace: 'admin' },
    { id: '7', title: 'Security Perimeter Monitoring & Node Health Check Stream', category: 'Diagnostics', uptime: '0h 0m', status: 'SCHEDULED', viewers: 0, date: '2026-07-25', handle: '@root_operator', workspace: 'admin' }
  ]);
  const [activeTelecastId, setActiveTelecastId] = useState('1');
  const [isPlayingStream, setIsPlayingStream] = useState(true);
  const [streamVolume, setStreamVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [streamChatInput, setStreamChatInput] = useState('');
  const [streamChatMessages, setStreamChatMessages] = useState([
    { id: '1', user: 'aadithyan_fan', text: 'Chai with Aadi is awesome! ☕', timestamp: '14:22' },
    { id: '2', user: 'creative_mind', text: 'The AI production workflows are standard!', timestamp: '14:23' },
    { id: '3', user: 'marketing_pro', text: 'Can we edit titles of handles?', timestamp: '14:24' }
  ]);
  
  // States for creating new live broadcasts in landing page content tracker
  const [newTelecastTitle, setNewTelecastTitle] = useState('');
  const [newTelecastCategory, setNewTelecastCategory] = useState('Talk Show');
  const [newTelecastDate, setNewTelecastDate] = useState('2026-07-21');
  const [newTelecastHandle, setNewTelecastHandle] = useState('@chai_with_aadi');
  const [isEditingTelecastTitle, setIsEditingTelecastTitle] = useState<string | null>(null);
  const [editingTitleVal, setEditingTitleVal] = useState('');

  // Handle adding live stream chat message
  const handleSendStreamChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamChatInput.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setStreamChatMessages(prev => [
      ...prev, 
      { id: Date.now().toString(), user: 'guest_stakeholder', text: streamChatInput, timestamp: timeStr }
    ]);
    setStreamChatInput('');
  };

  // Handle scheduling a new stream
  const handleAddTelecast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTelecastTitle.trim()) return;
    const newId = Date.now().toString();
    setLiveTelecasts(prev => [
      ...prev,
      {
        id: newId,
        title: newTelecastTitle,
        category: newTelecastCategory,
        uptime: '0h 0m',
        status: 'SCHEDULED',
        viewers: 0,
        date: newTelecastDate,
        handle: newTelecastHandle,
        workspace: selectedWorkspaceTab
      }
    ]);
    setNewTelecastTitle('');
    // Dispatch simulation notification
    window.dispatchEvent(new CustomEvent('swanaya-simulation', {
      detail: {
        type: 'BROADCAST TRACKER',
        message: `🔴 Scheduled new live telecast in ${selectedWorkspaceTab.toUpperCase()} workspace: "${newTelecastTitle}" under ${newTelecastHandle} for ${newTelecastDate}`
      }
    }));
  };

  const handleUpdateTelecastTitle = (id: string) => {
    if (!editingTitleVal.trim()) return;
    setLiveTelecasts(prev => prev.map(t => t.id === id ? { ...t, title: editingTitleVal } : t));
    setIsEditingTelecastTitle(null);
    setEditingTitleVal('');
  };

  // Testimonial Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewDesignation, setNewReviewDesignation] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewTitle.trim() || !newReviewText.trim()) {
      alert('Please fill out all required fields.');
      return;
    }
    const newExp = {
      id: `exp_${Date.now()}`,
      username: newReviewName.trim().toLowerCase(),
      designation: newReviewDesignation.trim() || 'Content Operator',
      rating: newReviewRating,
      title: newReviewTitle.trim(),
      text: newReviewText.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    const updated = [newExp, ...experiences];
    localStorage.setItem('swanaya_user_experiences', JSON.stringify(updated));
    setExperiences(updated);

    // Reset Form
    setNewReviewName('');
    setNewReviewDesignation('');
    setNewReviewTitle('');
    setNewReviewText('');
    setNewReviewRating(5);
    setShowReviewForm(false);
    alert('Thank you! Your verified operator review has been submitted and registered successfully.');
  };

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('swanaya_user_experiences');
      if (saved) {
        setExperiences(JSON.parse(saved));
      } else {
        const defaultExperiences = [
          {
            id: 'exp_1',
            username: 'aadithyan',
            designation: 'Director & Marketing HOD',
            rating: 5,
            title: 'Unbelievable Operational Velocity',
            text: 'Swanaya Enterprises has completely re-engineered how we plan production campaigns. Moving from manual sheets to the 3D Content Planner and automatic SEO tags has cut campaign deployment times by over 80%.',
            date: 'Jul 12, 2026'
          },
          {
            id: 'exp_2',
            username: 'aadithyan',
            designation: 'System Administrator',
            rating: 5,
            title: 'Bulletproof Authentication and Auditing',
            text: 'As an admin, the capability to see real-time workspace logins, review security logs, and immediately dispatch alerts directly to employee dashboards has elevated our communication and compliance to enterprise grades.',
            date: 'Jul 14, 2026'
          },
          {
            id: 'exp_3',
            username: 'JohnMedia',
            designation: 'Senior Video Editor',
            rating: 5,
            title: 'Staging Large Files Is Seamless',
            text: 'I upload multiple draft videos directly into the Campaign view node to check compliance across mobile and billboards. Visual previews are perfectly isolated and responsive.',
            date: 'Jul 15, 2026'
          }
        ];
        localStorage.setItem('swanaya_user_experiences', JSON.stringify(defaultExperiences));
        setExperiences(defaultExperiences);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  
  // ROI Forecaster state
  const [postsPerWeek, setPostsPerWeek] = useState(4);
  const [selectedPlatform, setSelectedPlatform] = useState<'YouTube' | 'Instagram' | 'LinkedIn' | 'TikTok'>('Instagram');
  const [campaignFocus, setCampaignFocus] = useState<'engagement' | 'traffic' | 'authority'>('engagement');

  // SEO Sandbox state
  const [sandboxTopic, setSandboxTopic] = useState('');
  const [sandboxVibe, setSandboxVibe] = useState<'viral' | 'corporate' | 'brutalist'>('viral');
  const [isSeoAnalyzing, setIsSeoAnalyzing] = useState(false);
  const [generatedSeo, setGeneratedSeo] = useState<{
    score: number;
    keywords: string[];
    tags: string[];
    headline: string;
    description: string;
  } | null>(null);

  // ROI Forecast calculations
  const calculateForecast = () => {
    let multiplier = 1;
    if (selectedPlatform === 'TikTok') multiplier = 2.4;
    if (selectedPlatform === 'YouTube') multiplier = 1.8;
    if (selectedPlatform === 'LinkedIn') multiplier = 0.9;
    
    let focusMult = 1;
    if (campaignFocus === 'traffic') focusMult = 1.25;
    if (campaignFocus === 'authority') focusMult = 0.85;

    const reach = Math.round(postsPerWeek * 3420 * multiplier * focusMult);
    const ctr = (2.4 * multiplier * (campaignFocus === 'traffic' ? 1.5 : 0.9)).toFixed(1);
    const engagement = Math.round(postsPerWeek * 185 * multiplier * (campaignFocus === 'engagement' ? 1.4 : 0.8));

    return { reach, ctr, engagement };
  };

  const { reach, ctr, engagement } = calculateForecast();

  // Run mock SEO Analysis with beautiful animations
  const runSeoSandbox = () => {
    if (!sandboxTopic.trim()) return;
    setIsSeoAnalyzing(true);
    setGeneratedSeo(null);

    setTimeout(() => {
      const topic = sandboxTopic.trim();
      let keywords: string[] = [];
      let tags: string[] = [];
      let headline = '';
      let description = '';
      let score = 85;

      if (sandboxVibe === 'viral') {
        keywords = [`how to go viral with ${topic}`, `${topic} tips 2026`, `${topic} trends`, `secret behind ${topic}`];
        tags = [`#${topic.replace(/\s+/g, '')}`, '#viral', '#trending', '#insiderSecrets', '#creatorEconomy'];
        headline = `🔥 This simple ${topic} strategy changed my production workflow forever!`;
        description = `Unlock the hidden algorithms of ${topic}. Here is a step-by-step breakdown of how content creators leverage this trend for 10x organic growth in 24 hours.`;
        score = 96;
      } else if (sandboxVibe === 'corporate') {
        keywords = [`${topic} enterprise solution`, `${topic} ROI modeling`, `${topic} case study`, `optimized ${topic}`];
        tags = [`#${topic.replace(/\s+/g, '')}`, '#businessStandard', '#consulting', '#b2bmarketing', '#workflow'];
        headline = `Maximizing Enterprise Operations: An Empirical Review of ${topic} Integration`;
        description = `An in-depth corporate analysis of ${topic} metrics. Learn how industry leaders scale high-throughput media models and decrease workflow blockages.`;
        score = 91;
      } else {
        keywords = [`brutalist ${topic}`, `raw ${topic} design`, `${topic} aesthetic`, `minimalist ${topic}`];
        tags = [`#${topic.replace(/\s+/g, '')}`, '#brutalistCode', '#rawAesthetic', '#indieDeveloper', '#antiDesign'];
        headline = `✖ SYSTEM INSTRUCTION: RE-ENGINEER ${topic.toUpperCase()} NOW`;
        description = `A stark, raw visual statement focusing on the uncompromised foundation of ${topic}. No fluff, no marketing speak. Just raw production truth.`;
        score = 88;
      }

      setGeneratedSeo({ score, keywords, tags, headline, description });
      setIsSeoAnalyzing(false);

      // Dispatch global simulation alert event for Real-Time Ticker notification
      window.dispatchEvent(new CustomEvent('swanaya-simulation', {
        detail: {
          type: 'SEO Sandbox',
          message: `Gemini SEO campaign simulation on topic "${topic}" completed with score: ${score}%.`
        }
      }));
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col gap-10 py-8 text-slate-100 max-w-5xl mx-auto">
      

      {!isLoggedVideoOnly && (
        /* 1. Swanique AI Premium SaaS/Enterprise Header */
        <div className="text-center space-y-6 max-w-4xl mx-auto px-4">
          
          {/* Animated Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-emerald-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
            <span>Swanique AI Enterprise Platform</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[10px] text-slate-400">v2.10 PRO</span>
          </motion.div>

          {/* Hero Brand & Main Title */}
          <div className="space-y-3">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-indigo-300 uppercase leading-none font-display"
            >
              Swanique AI
            </motion.h1>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-emerald-300 font-sans"
            >
              AI-Powered Content Planning & Marketing Intelligence Platform
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
            >
              Plan, create, schedule, and manage high-performing content with AI-powered workflows, marketing calendars, campaign management, and analytics—all from one secure, enterprise-ready dashboard.
            </motion.p>
          </div>

          {/* CTA Buttons Block */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <button 
              onClick={onEnterPortal}
              className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-sm tracking-wide uppercase transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <span>🚀 Start Planning</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button 
              onClick={() => setShowDemoModal(true)}
              className="group px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-sm tracking-wide uppercase transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </button>

            <button 
              onClick={() => {
                setActiveDemo('roi');
                const el = document.getElementById('sandbox-header');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 rounded-xl bg-slate-950/60 border border-slate-900 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-400 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Explore Features
            </button>
          </motion.div>

          {/* Hero Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-sm md:text-base font-semibold tracking-wide text-indigo-300 font-mono italic"
          >
            "Think Smarter. Create Faster. Grow Together."
          </motion.div>

          {/* Hero Metrics Matrix - 6 Columns Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-4 text-left max-w-4xl mx-auto"
          >
            {[
              { label: 'Smart Calendar', desc: 'Campaign Nodes', icon: Calendar, color: 'text-indigo-400' },
              { label: 'AI Assistant', desc: 'Gemini Integrations', icon: Sparkles, color: 'text-yellow-400 animate-pulse' },
              { label: 'Marketing Analytics', desc: 'Engagement ROI', icon: BarChart3, color: 'text-emerald-400' },
              { label: 'Team Collaboration', desc: 'Secure Handshakes', icon: Users, color: 'text-blue-400' },
              { label: 'Workflow Automation', desc: 'Automated Pipelines', icon: Zap, color: 'text-purple-400' },
              { label: 'Multi-Platform Pub', desc: 'Direct Publishing', icon: Globe, color: 'text-teal-400' },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-slate-950/40 border border-slate-900 hover:border-slate-800 p-3 rounded-xl space-y-1 transition-all duration-300 hover:bg-slate-950/60 shadow"
                >
                  <div className="flex items-center gap-1.5">
                    <IconComp className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span className="text-[11px] font-black tracking-tight text-white font-sans">{item.label}</span>
                  </div>
                  <p className="text-[9px] font-mono text-slate-500 uppercase leading-none">{item.desc}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Active Metadata / Profiles Node Row */}
          <div className="flex items-center justify-center gap-6 mt-4 text-[10px] text-slate-500 font-mono uppercase border-t border-slate-900/60 pt-4">
            <span>📡 ACTIVE NODE: PORTAL v2.10</span>
            <span>👥 REGISTERED PROFILES: {registeredUsersCount}</span>
            <span>🟢 INFRASTRUCTURE: ONLINE</span>
          </div>
        </div>
      )}

      {/* 🔴 MULTI-WORKSPACE LIVE VIDEO TELECASTING TERMINAL & MEDIA GRID */}
      {false && (
      <div id="live-broadcast-tracker" className="w-full bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden mx-auto max-w-5xl">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-indigo-500/5 pointer-events-none" />
        
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3 text-left">
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-rose-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-black text-rose-500 uppercase tracking-widest bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/30">
                Live Broadcast Network
              </span>
              <h2 className="text-sm font-black text-white uppercase tracking-tight font-display mt-0.5 flex items-center gap-2">
                <Tv className="w-4 h-4 text-rose-500 animate-pulse" /> Multi-Workspace Streaming Station
              </h2>
            </div>
          </div>
          
          {/* Workspace Filter Tabs */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-850">
            {(['creator', 'client', 'admin'] as const).map((ws) => (
              <button
                key={ws}
                type="button"
                onClick={() => {
                  setSelectedWorkspaceTab(ws);
                  // Auto-switch active stream to the first available video in the selected workspace
                  const wsStreams = liveTelecasts.filter(t => t.workspace === ws);
                  if (wsStreams.length > 0) {
                    setActiveTelecastId(wsStreams[0].id);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                  selectedWorkspaceTab === ws
                    ? ws === 'creator'
                      ? 'bg-indigo-600 text-white shadow shadow-indigo-500/20'
                      : ws === 'client'
                      ? 'bg-emerald-600 text-white shadow shadow-emerald-500/20'
                      : 'bg-amber-500 text-slate-950 shadow shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                {ws === 'creator' ? '🎨 Creator Hub' : ws === 'client' ? '💼 Client Portal' : '🔐 Admin Central'}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Theme Banner Descriptor */}
        <div className={`p-3 rounded-xl mb-5 text-left text-xs border transition-all ${
          selectedWorkspaceTab === 'creator'
            ? 'bg-indigo-950/30 border-indigo-900/40 text-indigo-200'
            : selectedWorkspaceTab === 'client'
            ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-200'
            : 'bg-amber-950/20 border-amber-900/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-2 font-bold mb-1">
            <Video className="w-4 h-4 shrink-0" />
            <span className="uppercase font-mono text-[10px]">
              Active Source Feed: {selectedWorkspaceTab.toUpperCase()} WORKSPACE PIPELINE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {selectedWorkspaceTab === 'creator' && 'Streaming premium creator content, including "Chai with Aadi" podcasts, creative brand reveals, social masterclasses, and visual layouts compiled from the Creator Hub.'}
            {selectedWorkspaceTab === 'client' && 'Streaming secure business workspace operations, campaign launch presentations, live performance reviews, budget pitch boards, and general investor meetings.'}
            {selectedWorkspaceTab === 'admin' && 'Streaming real-time system mainframe logs, secure database operations telemetry, and background sync audits directly from the Admin control room.'}
          </p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. Video Player Simulator Container */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-slate-850 shadow-inner group">
              {/* Dynamic Workspace Gradient Background */}
              <div className={`absolute inset-0 flex flex-col justify-between p-4 transition-all duration-500 ${
                !isPlayingStream
                  ? 'bg-slate-950'
                  : selectedWorkspaceTab === 'creator'
                  ? 'bg-gradient-to-br from-indigo-950/80 via-slate-950 to-purple-950/80'
                  : selectedWorkspaceTab === 'client'
                  ? 'bg-gradient-to-br from-emerald-950/80 via-slate-950 to-indigo-950/80'
                  : 'bg-gradient-to-br from-amber-950/60 via-slate-950 to-zinc-950'
              }`}>
                
                {isPlayingStream ? (
                  <div className="w-full h-full flex flex-col justify-between relative">
                    {/* Live Watermark & Stream Handle */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[9px] font-mono text-white bg-rose-600 px-2 py-0.5 rounded font-black tracking-widest uppercase animate-pulse flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5 animate-spin" /> LIVE FEED
                      </span>
                      <span className="text-[9px] font-mono text-slate-300 bg-slate-950/90 px-2.5 py-0.5 rounded border border-slate-800">
                        {liveTelecasts.find(t => t.id === activeTelecastId)?.handle || '@swanaya_enterprises'}
                      </span>
                    </div>

                    {/* Animated visualizer/waveform representing audio feed */}
                    <div className="flex items-center justify-center gap-1.5 h-20 my-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((bar) => {
                        const randomDelay = Math.random() * 0.5;
                        const randomHeight = 25 + Math.random() * 45;
                        return (
                          <motion.div
                            key={bar}
                            animate={{ height: [12, randomHeight, 12] }}
                            transition={{
                              duration: 0.7 + Math.random() * 0.5,
                              repeat: Infinity,
                              delay: randomDelay,
                              ease: "easeInOut"
                            }}
                            className={`w-1 rounded-full transition-colors duration-500 ${
                              selectedWorkspaceTab === 'creator' 
                                ? 'bg-indigo-500' 
                                : selectedWorkspaceTab === 'client' 
                                ? 'bg-emerald-500' 
                                : 'bg-amber-400'
                            }`}
                            style={{ height: 12 }}
                          />
                        );
                      })}
                    </div>

                    {/* Stream Info overlay */}
                    <div className="bg-gradient-to-t from-black/90 to-transparent p-3 -mx-4 -mb-4 text-left">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                          selectedWorkspaceTab === 'creator'
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/30'
                            : selectedWorkspaceTab === 'client'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/30'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/30'
                        }`}>
                          {selectedWorkspaceTab.toUpperCase()} PIPELINE
                        </span>
                        <span className="text-[8px] font-mono text-slate-500">
                          Active Telecast {activeTelecastId}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-white truncate leading-snug">
                        {liveTelecasts.find(t => t.id === activeTelecastId)?.title || 'No Workspace Video Selected'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2.5">
                    <div className="p-3 bg-slate-900 rounded-full border border-slate-800 cursor-pointer hover:bg-slate-850 hover:border-slate-700 transition-all shadow animate-pulse" onClick={() => setIsPlayingStream(true)}>
                      <Play className="w-8 h-8 text-slate-400 hover:text-white transition-colors" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Feed Signal Suspended</p>
                  </div>
                )}
              </div>

              {/* Status overlay */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
                <span className="text-[9px] font-mono bg-black/75 backdrop-blur-md text-white py-0.5 px-2.5 rounded-full border border-slate-800">
                  👁 {liveTelecasts.find(t => t.id === activeTelecastId)?.status === 'ON AIR' 
                    ? `${liveTelecasts.find(t => t.id === activeTelecastId)?.viewers} watching` 
                    : '0 watching'}
                </span>
              </div>
            </div>

            {/* Video Controls bar */}
            <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-850">
              <button
                type="button"
                onClick={() => setIsPlayingStream(!isPlayingStream)}
                className="text-[10px] font-mono font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isPlayingStream ? '⏸ Pause Stream' : '▶ Play Stream'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : streamVolume}
                  onChange={(e) => {
                    setStreamVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Live Content Tracker & Scheduler */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  {selectedWorkspaceTab.toUpperCase()} STREAMS ({liveTelecasts.filter(t => t.workspace === selectedWorkspaceTab).length})
                </span>
                <span className="text-[8px] text-indigo-400 font-mono">Select stream feed</span>
              </div>

              {/* Scrollable list of streams inside the chosen workspace */}
              <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                {liveTelecasts
                  .filter((item) => item.workspace === selectedWorkspaceTab)
                  .map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative group ${
                        activeTelecastId === item.id
                          ? selectedWorkspaceTab === 'creator'
                            ? 'bg-slate-950 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                            : selectedWorkspaceTab === 'client'
                            ? 'bg-slate-950 border-emerald-500/50 shadow-md shadow-emerald-500/5'
                            : 'bg-slate-950 border-amber-500/50 shadow-md shadow-amber-500/5'
                          : 'bg-slate-950/40 hover:bg-slate-950 border-slate-850 hover:border-slate-800'
                      }`}
                      onClick={() => {
                        setActiveTelecastId(item.id);
                        setIsPlayingStream(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-mono text-slate-500">
                          {item.date} • {item.handle}
                        </span>
                        <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.status === 'ON AIR' 
                            ? selectedWorkspaceTab === 'creator'
                              ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-900/40 animate-pulse'
                              : selectedWorkspaceTab === 'client'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 animate-pulse'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-900/40 animate-pulse'
                            : item.status === 'COMPLETED'
                            ? 'bg-slate-850 text-slate-400 border border-slate-800'
                            : 'bg-slate-950 text-slate-500 border border-slate-900'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {isEditingTelecastTitle === item.id ? (
                        <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingTitleVal}
                            onChange={(e) => setEditingTitleVal(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-800 text-[10px] py-1 px-2 rounded text-white font-sans outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateTelecastTitle(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded text-[9px] font-mono font-bold text-white cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] font-bold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                          {item.title}
                        </p>
                      )}

                      {/* Quick actions inside content tracker */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingTelecastTitle(item.id);
                            setEditingTitleVal(item.title);
                          }}
                          className="text-[8px] font-mono text-indigo-400 hover:text-indigo-300 bg-slate-900 px-1 py-0.5 rounded border border-slate-800 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLiveTelecasts(prev => prev.filter(t => t.id !== item.id));
                            const remaining = liveTelecasts.filter(t => t.id !== item.id && t.workspace === selectedWorkspaceTab);
                            if (activeTelecastId === item.id) {
                              setActiveTelecastId(remaining[0]?.id || '');
                            }
                          }}
                          className="text-rose-500 hover:text-rose-400 p-0.5 cursor-pointer"
                          title="Remove scheduled item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Quick Scheduler Form */}
            <form onSubmit={handleAddTelecast} className="bg-slate-950/50 border border-slate-850 p-3 rounded-xl space-y-2 text-left">
              <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">
                + Schedule Broadcast on {selectedWorkspaceTab.toUpperCase()}
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Stream title or logs topic..."
                  value={newTelecastTitle}
                  onChange={(e) => setNewTelecastTitle(e.target.value)}
                  className="col-span-2 w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded px-2.5 py-1 text-[10px] text-white placeholder-slate-600 outline-none"
                />
                <select
                  value={newTelecastHandle}
                  onChange={(e) => setNewTelecastHandle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded px-1 py-1 text-[9px] text-slate-300 outline-none cursor-pointer font-mono"
                >
                  {selectedWorkspaceTab === 'creator' && (
                    <>
                      <option value="@chai_with_aadi">@chai_with_aadi</option>
                      <option value="@swanaya_enterprises">@swanaya</option>
                      <option value="@chai">@chai</option>
                    </>
                  )}
                  {selectedWorkspaceTab === 'client' && (
                    <>
                      <option value="@swanaya_enterprises">@swanaya</option>
                      <option value="@client_sponsor">@client_sponsor</option>
                    </>
                  )}
                  {selectedWorkspaceTab === 'admin' && (
                    <>
                      <option value="@central_admin">@central_admin</option>
                      <option value="@root_operator">@root_operator</option>
                    </>
                  )}
                </select>
                <button
                  type="submit"
                  className={`w-full text-white font-mono font-bold text-[9px] py-1 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer uppercase ${
                    selectedWorkspaceTab === 'creator'
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : selectedWorkspaceTab === 'client'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  <Plus className="w-3 h-3" /> Add Track
                </button>
              </div>
            </form>
          </div>

          {/* 3. Simulated Live Backstage Chat Feed */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider text-left">
              Live Backstage Stream Chat
            </span>
            <div className="flex-1 bg-slate-950/80 rounded-xl border border-slate-850 p-3 flex flex-col justify-between gap-3 h-[215px]">
              
              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {streamChatMessages.map((msg) => (
                  <div key={msg.id} className="text-left text-[10px] leading-relaxed">
                    <span className={`font-mono font-bold mr-1.5 hover:underline cursor-pointer ${
                      selectedWorkspaceTab === 'creator'
                        ? 'text-indigo-400'
                        : selectedWorkspaceTab === 'client'
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}>
                      {msg.user}:
                    </span>
                    <span className="text-slate-200">{msg.text}</span>
                    <span className="text-[8px] font-mono text-slate-600 block text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input bar */}
              <form onSubmit={handleSendStreamChat} className="flex gap-1 border-t border-slate-850 pt-2.5">
                <input
                  type="text"
                  placeholder="Post backstage chat..."
                  value={streamChatInput}
                  onChange={(e) => setStreamChatInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 text-[10px] py-1 px-2 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className={`p-1 rounded-lg transition-colors cursor-pointer text-white ${
                    selectedWorkspaceTab === 'creator'
                      ? 'bg-indigo-600 hover:bg-indigo-500'
                      : selectedWorkspaceTab === 'client'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
      )}

      {!isLoggedVideoOnly && (
        <>
          {/* 2. Interactive Interactive Sandbox Section */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="border-b border-slate-800/60 bg-slate-950/60 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-left">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">LIVE PLAYGROUND DEMOS</span>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-850">
            <button 
              onClick={() => setActiveDemo('roi')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemo === 'roi' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Reach Forecaster</span>
            </button>
            <button 
              onClick={() => setActiveDemo('seo')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemo === 'seo' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>SEO Sandbox</span>
            </button>
            <button 
              onClick={() => setActiveDemo('status')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeDemo === 'status' 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Network Status</span>
            </button>
          </div>
        </div>

        {/* Tab contents */}
        <div className="p-6 md:p-8 min-h-[380px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeDemo === 'roi' && (
              <motion.div
                key="roi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
              >
                {/* Inputs */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Platform Reach Projections</h3>
                    <p className="text-xs text-slate-400">Simulate how post volume & platform selection boost engagement.</p>
                  </div>

                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Choose Target Platform</span>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Instagram', 'YouTube', 'LinkedIn', 'TikTok'] as const).map((plat) => (
                        <button
                          key={plat}
                          onClick={() => setSelectedPlatform(plat)}
                          className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                            selectedPlatform === plat 
                              ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                              : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          {plat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Target */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Campaign Objective</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['engagement', 'traffic', 'authority'] as const).map((obj) => (
                        <button
                          key={obj}
                          onClick={() => setCampaignFocus(obj)}
                          className={`py-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer border ${
                            campaignFocus === obj 
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-md'
                              : 'bg-slate-950/60 border-slate-900 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          {obj}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Weekly Posts Volume</span>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{postsPerWeek} posts / week</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={postsPerWeek}
                      onChange={(e) => setPostsPerWeek(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Outputs / Gauges */}
                <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-6 flex flex-col justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-indigo-500/20 text-indigo-300 text-[8px] font-mono font-bold px-2 py-0.5 rounded-bl">ALGORITHM-BASED</div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">PROJECTED ENGAGEMENT METRICS</h4>
                    
                    {/* Reach Count */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Estimated Monthly Organic Reach</span>
                      <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                        <span>{reach.toLocaleString()}</span>
                        <span className="text-xs text-emerald-400 font-bold flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> +14.2%</span>
                      </div>
                    </div>

                    {/* CTR Score */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Predicted Click-Through Ratio (CTR)</span>
                      <div className="text-xl font-bold text-indigo-300 font-mono tracking-tight">
                        {ctr}%
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-300 h-1.5 rounded-full" style={{ width: `${Math.min(parseFloat(ctr) * 12, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Interactive interactions */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Est. Interactions (Likes, Shares, Comments)</span>
                      <div className="text-lg font-bold text-slate-200 font-mono">
                        {engagement.toLocaleString()} <span className="text-[10px] text-slate-500">/ week</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 bg-slate-900/50 p-2.5 rounded border border-slate-850 leading-relaxed">
                    💡 <strong>Tip:</strong> Sponsoring optimized format plans under <strong>{selectedPlatform}</strong> boosts exposure. Register to generate real calendar events!
                  </div>
                </div>
              </motion.div>
            )}

            {activeDemo === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
              >
                {/* Topic Input Form */}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">SEO Generative Sandbox</h3>
                    <p className="text-xs text-slate-400">Preview Swanaya's Gemini-driven automated SEO metadata generator.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Enter Content Topic / Product
                    </label>
                    <input
                      type="text"
                      value={sandboxTopic}
                      onChange={(e) => setSandboxTopic(e.target.value)}
                      placeholder="e.g. 3D workflow tools, Organic Juice Brand..."
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2.5 text-xs text-white placeholder-slate-700 outline-none transition-all"
                    />
                  </div>

                  {/* Vibe selection */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">Audience Persona Vibe</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['viral', 'corporate', 'brutalist'] as const).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSandboxVibe(v)}
                          className={`py-2 rounded-lg text-xs font-mono font-bold uppercase transition-all cursor-pointer border ${
                            sandboxVibe === v 
                              ? 'bg-indigo-950/60 border-indigo-500 text-indigo-400 shadow-md'
                              : 'bg-slate-950/60 border-slate-900 text-slate-500 hover:border-slate-800'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={runSeoSandbox}
                    disabled={isSeoAnalyzing || !sandboxTopic.trim()}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border cursor-pointer ${
                      sandboxTopic.trim()
                        ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 text-emerald-400 border-emerald-500/40 hover:from-emerald-600 hover:to-indigo-600 hover:text-white shadow-md'
                        : 'bg-slate-950 text-slate-600 border-slate-900 cursor-not-allowed'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isSeoAnalyzing ? 'animate-spin' : ''}`} />
                    {isSeoAnalyzing ? 'Analyzing Semantics...' : 'Simulate Gemini SEO Generation'}
                  </button>
                </div>

                {/* Simulated SEO Results */}
                <div className="bg-slate-950/70 border border-slate-850 rounded-xl p-5 flex flex-col justify-center min-h-[220px]">
                  {isSeoAnalyzing ? (
                    <div className="space-y-3.5 animate-pulse text-center">
                      <Cpu className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                      <p className="text-xs font-mono text-slate-400">Swanaya AI pipeline analyzing subject indexing weights...</p>
                    </div>
                  ) : generatedSeo ? (
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="font-bold text-white uppercase font-mono tracking-wider">SEO Sandbox Report</span>
                        <span className="font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-900/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Optimization Score: {generatedSeo.score}%
                        </span>
                      </div>

                      {/* Headline copy */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Suggested Headline Hook</span>
                        <p className="font-bold text-white tracking-tight">{generatedSeo.headline}</p>
                      </div>

                      {/* Keywords */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Index Keyword Suggestions</span>
                        <div className="flex flex-wrap gap-1">
                          {generatedSeo.keywords.map((kw, idx) => (
                            <span key={idx} className="bg-indigo-950/50 border border-indigo-900/20 text-indigo-300 text-[9px] px-2 py-0.5 rounded font-mono">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Social Campaign Tags</span>
                        <div className="flex flex-wrap gap-1">
                          {generatedSeo.tags.map((t, idx) => (
                            <span key={idx} className="bg-emerald-950/50 border border-emerald-900/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Enter a subject topic on the left and trigger simulation to see real-time calculated SEO keywords!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeDemo === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
              >
                {/* 3 bento stats cards */}
                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">DATABASE PACKETS</span>
                    <Database className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white">99.98%</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Swanaya secure file stream nodes actively synchronized on local storage matrix.</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">SECURE SHELL</span>
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-emerald-400">AES-256</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Operator logs and checking hashes fully isolated, secure, and hashed.</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">LATENCY RESPONSE</span>
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold font-mono text-white">14 ms</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">Ultra-responsive interface pipeline. Direct render nodes active across viewport limits.</p>
                </div>

                {/* Additional simulated telemetry logs lines */}
                <div className="col-span-1 md:col-span-3 bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[9px] text-slate-400 space-y-1">
                  <div className="text-indigo-400 font-bold border-b border-slate-900 pb-1 mb-1">SYSTEM BOOT TELEMETRY REPORT</div>
                  <div>[08:58:12] INITIALIZING BACKEND METRICS CO-PROCESSOR... <span className="text-emerald-400">DONE</span></div>
                  <div>[08:58:14] CALENDAR DATE INDEX MATRIX POPULATING SEEDS... <span className="text-emerald-400">ACTIVE (31 NODES)</span></div>
                  <div>[08:58:16] COMPILATION STATUS: OPTIMAL COMPRESSIVE RATIO PRESERVED</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Call to action footer */}
          <div className="mt-8 pt-6 border-t border-slate-850/60 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-400">Ready to build campaigns, assign priorities, and log attendance?</span>
            <button 
              onClick={onEnterPortal}
              className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase transition-all shadow hover:shadow-indigo-500/20 cursor-pointer"
            >
              Configure Portal Accounts →
            </button>
          </div>
        </div>
      </div>

      {/* 3. AI Automation Hub (SWANAYA AI CO-PILOT) */}
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Cpu className="w-5 h-5 animate-pulse" />
              </span>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-wider font-mono">SWANAYA AI CO-PILOT HUB</h3>
            </div>
            <p className="text-xs text-slate-400">Gemini-Engineered Automation & Smart Content Optimizations</p>
          </div>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-full font-mono font-bold tracking-wider uppercase self-start md:self-auto">
            Powered by Gemini 3.5 Flash
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">01. Metadata Autofills</span>
              <h4 className="text-sm font-bold text-slate-200">Semantic Task Optimization</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Our server-side Gemini system automatically scans rough task drafts to inject technical checklists, timeline estimations, and structural details.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full" /> Full Firestore Sync
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">02. Click-Through Optimization</span>
              <h4 className="text-sm font-bold text-slate-200">Hashtag & Tag Generator</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Never post without strategic intent. The AI platform parses title semantics to formulate organic search index labels and high-impact metadata.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full" /> ROAS Multiplier
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider">03. Site Mapping Assistant</span>
              <h4 className="text-sm font-bold text-slate-200">Conversational Diagnostics</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Query our automated site-mapping agent directly to extract navigation links, module details, and system diagnostic records in real time.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full" /> Multi-route Redirection
            </div>
          </div>
        </div>
      </div>

      {/* 4. FAQ & Operator Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: FAQ Node Matrix */}
        <div className="lg:col-span-7 bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-xl">
          <div className="border-b border-slate-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-extrabold text-white uppercase tracking-wider font-mono">FAQ Node Matrix</h3>
            </div>
            <p className="text-xs text-slate-400">Frequently Asked Questions & Operations Manual</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "What is Swanaya Media Enterprises?",
                a: "Swanaya Media Enterprises is an advanced digital production, brand building, and software automation department that builds bespoke corporate campaign planners, secure employee tracking layers, and high-throughput advertising structures."
              },
              {
                q: "What is Swanaya AdsPortal and where is it hosted?",
                a: "The Swanaya AdsPortal is our flagship campaign analytics and active advertising node, fully accessible online at https://swanaya-skillos.netlify.app/. It allows brand oversight and campaign tracking in high fidelity."
              },
              {
                q: "How secure is the platform operator framework?",
                a: "All operator accounts, daily attendance check-ins, and draft schedules are secured server-side via persistent Google Firebase (Firestore and Authentication) architecture or localized backup registries."
              },
              {
                q: "Who monitors and monitors the technology stack?",
                a: "All systems, 3D canvases, and automation nodes are engineered, monitored, and audited under the leadership of Aadithyan M Menon, Director and HOD of Marketing and Productions at Swanaya Media Enterprises."
              },
              {
                q: "Can I manage multiple brand platform profiles at once?",
                a: "Absolutely. Our Format & Platform Selector supports native formats for Instagram Reels/Stories/Carousels, YouTube, Google Ads, Meta Ads, LinkedIn, and Facebook with automatic algorithmic configurations."
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-slate-950/40 border border-slate-850 rounded-xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="font-mono text-indigo-400 mr-2">Q{idx + 1}. {faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-900 bg-slate-950/20"
                      >
                        <p className="p-5 text-xs text-slate-400 leading-relaxed font-sans border-l-2 border-indigo-500">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Operator Testimonials & Experience Matrix */}
        <div className="lg:col-span-5 bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
                  <Star className="w-5 h-5 fill-amber-500/20" />
                </span>
                <h3 className="text-lg font-extrabold text-white uppercase tracking-wider font-mono">Workspace Pulse</h3>
              </div>
              <p className="text-xs text-slate-400">Verified reviews and feedback from active administrators & creators</p>
            </div>

            <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {experiences.length > 0 ? (
                experiences.map((exp) => (
                  <div key={exp.id || exp.title} className="bg-slate-950/50 border border-slate-900 rounded-xl p-4 space-y-2.5 relative hover:border-slate-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-200">@{exp.username.toLowerCase() === 'aadithyan' ? 'system_owner' : exp.username}</span>
                          <span className="block text-[9px] text-indigo-400 font-mono font-medium">{exp.designation || 'Creator'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <Star 
                            key={sIdx} 
                            className={`w-3 h-3 ${sIdx < (exp.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-800'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-slate-100 font-mono tracking-tight">"{exp.title}"</h4>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">{exp.text}</p>
                    </div>
                    <span className="block text-[8.5px] text-right text-slate-600 font-mono font-semibold">{exp.date || 'Active Session'}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  Loading active operator experiences...
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-xl p-3.5 space-y-3">
            <AnimatePresence mode="wait">
              {!showReviewForm ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="space-y-2"
                >
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Have feedback or want to leave a testimonial? Submit a verified review instantly right here to register your workspace experience.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow"
                    >
                      <span>Write Review</span>
                    </button>
                    <button
                      onClick={onEnterPortal}
                      className="py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-lg text-[10px] uppercase font-mono tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Access Portal</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleAddReview}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3 text-left"
                >
                  <h4 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">Verified Experience Submission</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Username *</label>
                      <input 
                        type="text" 
                        required
                        value={newReviewName}
                        onChange={(e) => setNewReviewName(e.target.value)}
                        placeholder="e.g. JohnDev"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Role / Title</label>
                      <input 
                        type="text" 
                        value={newReviewDesignation}
                        onChange={(e) => setNewReviewDesignation(e.target.value)}
                        placeholder="e.g. Creator"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Testimonial Headline *</label>
                    <input 
                      type="text" 
                      required
                      value={newReviewTitle}
                      onChange={(e) => setNewReviewTitle(e.target.value)}
                      placeholder="e.g. Streamlined workflow"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-slate-400 font-bold uppercase mb-0.5">Review Message *</label>
                    <textarea 
                      required
                      rows={2}
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your experience working with Swanaya platforms..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white outline-none resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] text-slate-400 font-bold uppercase">Rating:</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewReviewRating(star)}
                            className="p-0.5 cursor-pointer"
                          >
                            <Star className={`w-3.5 h-3.5 \${star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 text-[9px] font-mono rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold font-mono rounded shadow"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 5. Recent Projects & Corporate Credits Section */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-indigo-950/50 rounded-2xl p-6 md:p-8 space-y-8 text-left shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
          <Laptop className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="border-b border-indigo-950 pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Laptop className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-white uppercase tracking-wider font-mono">Recent Corporate Deployments</h3>
          </div>
          <p className="text-xs text-slate-500">Active live modules under Swanaya Web Allied Technologies</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Project Card */}
          <div className="bg-slate-900/60 border border-indigo-950/50 p-6 rounded-xl space-y-4 flex flex-col justify-between hover:border-indigo-500/30 transition-all duration-300">
            <div className="space-y-2">
              <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                Production Hub
              </span>
              <h4 className="text-lg font-black text-white font-display uppercase tracking-tight">Swanaya AdsPortal</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                The official campaign management and real-time advertising oversight platform. Fully synchronized with brand strategy objectives, conversion optimization models, and visual telemetry dashboards.
              </p>
            </div>

            <div className="pt-4 border-t border-indigo-950/40 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">Status: Active & Live</span>
              <a 
                href="https://swanaya-skillos.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer"
              >
                Launch AdsPortal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Institutional Credits / Profile */}
          <div className="bg-slate-900/60 border border-slate-850 p-6 rounded-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">DEVELOPMENT CREDITS</span>
                <h4 className="text-xs font-bold text-indigo-300 font-mono uppercase tracking-wide leading-snug">
                  SWANAYA WEB ALLIED TECHNOLOGIES
                </h4>
                <p className="text-[11px] text-slate-400 font-mono italic">
                  Research & Development Dept of Swanaya Media Enterprises
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">DIRECTOR & SUPERVISOR</span>
                <p className="font-extrabold text-white uppercase tracking-tight font-sans">
                  AADITHYAN M MENON
                </p>
                <p className="text-[11px] text-slate-400 font-mono font-bold">
                  Director and HOD of Marketings and Productions
                </p>
              </div>
            </div>

            {/* Corporate Directory / Links Grid */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-850 pt-4">
              <a 
                href="mailto:Swanayamediaproduction@gmail.com"
                className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Support</span>
              </a>
              <a 
                href="https://sites.google.com/view/swanaya-media-hub-/services" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>Official Hub</span>
              </a>
              <a 
                href="https://www.instagram.com/swanaya__media_enterprises/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-indigo-400">IG</span>
                <span>Instagram Profile</span>
              </a>
              <a 
                href="https://www.linkedin.com/in/swanaya-enterprises-5a940a401/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-xs font-bold text-indigo-400">IN</span>
                <span>LinkedIn Directory</span>
              </a>
            </div>
          </div>
        </div>

        {/* Unified corporate bottom footer banner */}
        <div className="border-t border-indigo-950/60 pt-5 text-center text-[10px] font-mono text-slate-600 space-y-1.5">
          <p>© 2026 SWANAYA MEDIA ENTERPRISES. ALL PORTALS AND DIGITAL ASSETS SECURED UNDER DIRECT PROTOCOLS.</p>
          <p className="text-[9px]">DESIGNED AND MONITORED BY THE DIRECTOR & HOD OF MARKETINGS AND PRODUCTIONS AADITHYAN M MENON.</p>
          <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase">LAST UPDATED ON 10:00 PM 20/07/2026 MONDAY</p>
        </div>
      </div>
    </> )}

      {/* Watch Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-left relative overflow-hidden"
            >
              {/* Decorative accent background glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-indigo-400 fill-indigo-400" />
                  <h3 className="text-sm font-bold font-display uppercase tracking-wider text-white">Swanique AI Interactive Walkthrough</h3>
                </div>
                <button 
                  onClick={() => setShowDemoModal(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>

              {/* Walkthrough content */}
              <div className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Experience the powerful marketing workflows built directly inside the Swanique AI command console. Once authenticated, operators gain full control over campaign nodes and multi-platform publishing pipelines.
                </p>

                {/* Simulated Feature Flow */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-mono">1</span>
                      <span>Plan & Stage</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Map out your campaigns by month, day, and platform using our dynamic scheduling grids.</p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-mono">2</span>
                      <span>AI Copilot Magic</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Use built-in server-side Gemini prompts to generate tags, click-through hooks, and timelines.</p>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <span className="w-4 h-4 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-mono">3</span>
                      <span>Publish & Track</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Upload content, monitor secure employee check-ins, and export PDF deployment manifests.</p>
                  </div>
                </div>

                {/* Simulated Live Analytics Graph or Telemetry */}
                <div className="bg-slate-950 p-4 rounded-xl border border-indigo-950/50 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>⚡ WORKFLOW COMPILER ENGINE</span>
                    <span className="text-emerald-400 font-bold">READY</span>
                  </div>
                  <div className="space-y-1.5 text-[9px] text-slate-500 leading-none">
                    <div className="flex justify-between">
                      <span>• Content Model Indexing Speed:</span>
                      <span className="text-slate-300 font-bold">0.82s / draft</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Gemini Model Token Efficiency:</span>
                      <span className="text-indigo-400 font-bold">99.4% (Zero-shot)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Secure Sync Validation:</span>
                      <span className="text-emerald-400 font-bold">ACTIVE (TLS 1.3)</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] text-indigo-300 font-bold">Estimated Conversion Lift</span>
                    <span className="text-xs text-white font-bold bg-indigo-600/20 border border-indigo-500/30 px-2 py-0.5 rounded">+42% Organic Growth</span>
                  </div>
                </div>
              </div>

              {/* Close CTAs */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                  onClick={() => setShowDemoModal(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-850 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setShowDemoModal(false);
                    onEnterPortal();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-indigo-500/20"
                >
                  Access Portal Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
