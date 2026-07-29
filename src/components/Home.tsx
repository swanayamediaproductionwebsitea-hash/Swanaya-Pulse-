import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, Sparkles, Youtube, Instagram, Shield, Layout,
  Layers, Settings, Share2, Compass, AlertCircle, Send, CheckCircle2,
  Calendar, Film, FileText, BarChart3, Users, Clock, HelpCircle, 
  ChevronRight, Laptop, Key, Power, Image, Check, Smartphone, Lock,
  ArrowRight, Filter, Globe, ExternalLink, Zap, Plus, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ContentPlan } from '../types';
import AiTodo from './AiTodo';
import { db } from '../lib/firebase';

interface HomeProps {
  plans: ContentPlan[];
  onAddPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt'>) => void;
  setActiveMainTab: (tab: any) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  currentUser: string;
  uiMode?: 'human' | 'ai';
  currentUserPermission: 'viewer' | 'editor' | 'administrator';
}

interface PlatformConfig {
  name: string;
  color: string;
  bg: string;
  border: string;
  text: string;
  formats: string[];
}

const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  'Instagram': {
    name: 'Instagram',
    color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    text: 'text-pink-400',
    formats: ['Reels', 'Story', 'Carousel', 'Poster']
  },
  'YouTube': {
    name: 'YouTube',
    color: 'from-red-600 to-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    formats: ['Video', 'Reels', 'Poster']
  },
  'Google Ads': {
    name: 'Google Ads',
    color: 'from-blue-500 to-amber-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    formats: ['Ads', 'Poster']
  },
  'Meta Ads': {
    name: 'Meta Ads',
    color: 'from-sky-500 to-indigo-500',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    text: 'text-sky-400',
    formats: ['Ads', 'Video', 'Poster', 'Carousel']
  },
  'LinkedIn': {
    name: 'LinkedIn',
    color: 'from-blue-700 to-sky-600',
    bg: 'bg-blue-600/10',
    border: 'border-blue-600/20',
    text: 'text-blue-300',
    formats: ['Poster', 'Video', 'Carousel']
  },
  'Facebook': {
    name: 'Facebook',
    color: 'from-blue-800 to-indigo-700',
    bg: 'bg-blue-800/10',
    border: 'border-blue-800/20',
    text: 'text-blue-400',
    formats: ['Story', 'Poster', 'Video', 'Ads']
  }
};

const FORMAT_TIPS: Record<string, { aspect: string; timing: string; ctr: string; advice: string }> = {
  'Reels': {
    aspect: '9:16 (1080x1920 px)',
    timing: '5:00 PM - 8:00 PM EST',
    ctr: '2.8% - 4.5%',
    advice: 'Hook the user in the first 2 seconds. Use trending background tracks and overlay bold caption keywords.'
  },
  'Video': {
    aspect: '16:9 (3840x2160 px)',
    timing: '1:00 PM - 4:00 PM EST',
    ctr: '3.5% - 6.0%',
    advice: 'High production value required. Target deep educational value or brand narratives with custom thumbnails.'
  },
  'Ads': {
    aspect: '1:1 Square or 1.91:1 Landscape',
    timing: 'Continuous delivery (AI-driven)',
    ctr: '1.5% - 3.2%',
    advice: 'A/B test direct copywriting hooks. Focus on a singular, ultra-clear Call to Action button (CTA).'
  },
  'Poster': {
    aspect: '4:5 (1080x1350 px)',
    timing: '9:00 AM - 11:30 AM EST',
    ctr: '0.8% - 1.6%',
    advice: 'Keep typography clean and text volume under 20% of canvas area. Prioritize brand palette consistency.'
  },
  'Story': {
    aspect: '9:16 vertical',
    timing: '8:00 AM & 10:00 PM EST',
    ctr: '1.2% - 2.5%',
    advice: 'Highly casual and interactive. Use poll stickers, question boxes, or slider components.'
  },
  'Carousel': {
    aspect: '1:1 or 4:5 seamless sliders',
    timing: '6:00 PM - 9:00 PM EST',
    ctr: '2.0% - 3.8%',
    advice: 'Design cohesive slide transitions. Place your hook on slide 1 and your CTA on the final slide.'
  }
};

// 12 Major Modules Site Map Registry
interface ModuleNode {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  status: 'ONLINE' | 'STANDBY';
  desc: string;
  details: string;
}

const SITE_MODULES: ModuleNode[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Monitor',
    icon: Layout,
    status: 'ONLINE',
    desc: 'Real-time campaign performance & statistics.',
    details: 'Visualizes active marketing metrics, monthly budget allocations, approval ratios, and upcoming deliverable pipelines.'
  },
  {
    id: 'planner',
    name: 'Monthly Content Planner',
    icon: Calendar,
    status: 'ONLINE',
    desc: '31-Day interactive campaign calendar.',
    details: 'Supports calendar day slots, interactive status markers, automated visual filters, and instant plan deployments.'
  },
  {
    id: 'social',
    name: 'Social Media Planner',
    icon: Compass,
    status: 'ONLINE',
    desc: 'Pre-configured channel layouts and tags.',
    details: 'Provides tailored advice for platforms including Instagram, YouTube, Google Business, Meta Ads, and Threads.'
  },
  {
    id: 'campaign',
    name: 'Campaign Management',
    icon: BarChart3,
    status: 'ONLINE',
    desc: 'Meta, Google, and SEO campaign analytics.',
    details: 'Tracks core campaign budgets, ROAS, click-through rates (CTR), conversion costs, and digital marketing footprints.'
  },
  {
    id: 'client',
    name: 'Client Management',
    icon: Users,
    status: 'ONLINE',
    desc: 'Client profiles, brands, and asset keys.',
    details: 'Secures contract periods, social channel credentials, asset collections, and individual brand strategy briefs.'
  },
  {
    id: 'project',
    name: 'Project Management',
    icon: Layers,
    status: 'ONLINE',
    desc: 'Deadlines, deliverables, and progress logs.',
    details: 'Logs critical completion percentages, specific campaign deliverables, and team task assignment states.'
  },
  {
    id: 'assignment',
    name: 'Task Assignment',
    icon: FileText,
    status: 'ONLINE',
    desc: 'Assign roles to creators, editors, and designers.',
    details: 'Allows manual task delegation, priority level setting (High/Med/Low), and binary attachment uploading.'
  },
  {
    id: 'media',
    name: 'Media Library',
    icon: Film,
    status: 'ONLINE',
    desc: 'Store brand assets, raw videos, and layouts.',
    details: 'Supports direct drag-and-drop file uploads, image assets, logo containers, and storyboards.'
  },
  {
    id: 'approval',
    name: 'Approval System',
    icon: Shield,
    status: 'ONLINE',
    desc: 'Team review and client authorization flow.',
    details: 'Enables sequential transition from draft, to team review, to client checkoff, to active scheduling.'
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    icon: BarChart3,
    status: 'ONLINE',
    desc: 'Engagement charts and conversion pipelines.',
    details: 'Aggregates social impressions, audience retention, CTR performance, and quarterly brand growth.'
  },
  {
    id: 'assistant',
    name: 'AI Content Assistant',
    icon: Sparkles,
    status: 'ONLINE',
    desc: 'Script hook and hashtag script engine.',
    details: 'Features copyable title generators, viral hooks, ad copy presets, and system help FAQs.'
  },
  {
    id: 'reports',
    name: 'Performance Reports',
    icon: FileText,
    status: 'ONLINE',
    desc: 'Generate & export PDF/CSV audit summaries.',
    details: 'Builds comprehensive executive performance reports to export campaign details and team production states.'
  }
];

export default function Home({ plans, onAddPlan, setActiveMainTab, addLog, currentUser, uiMode = 'ai', currentUserPermission }: HomeProps) {

  // Google Auth Simulation State
  const [googleConnected, setGoogleConnected] = useState<boolean>(() => {
    return localStorage.getItem('swanaya_google_oauth_linked') === 'true';
  });
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);
  const [googleUserEmail, setGoogleUserEmail] = useState('aadithyanmmenon@gmail.com');

  // Media Selector States
  const [selectedPlatform, setSelectedPlatform] = useState<string>('Instagram');
  const [selectedFormat, setSelectedFormat] = useState<string>('Reels');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDate, setDraftDate] = useState('2026-07-15');

  // 1-4Q Front View Schedule State
  const [homeQuarterTab, setHomeQuarterTab] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [homePlatformFilter, setHomePlatformFilter] = useState<string>('ALL');
  const [homeDayRange, setHomeDayRange] = useState<'ALL' | '1-10' | '11-20' | '21-31'>('ALL');
  const [homeSortMode, setHomeSortMode] = useState<'DAY_1_TO_31' | 'DATE_SEQ'>('DAY_1_TO_31');

  // Interactive Mapper State
  const [selectedModule, setSelectedModule] = useState<ModuleNode>(SITE_MODULES[0]);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; linkTab?: any }>>([
    {
      sender: 'bot',
      text: "Welcome to Swanaya Site Mapping Node! I'm your interactive architecture assistant. Ask me where any of our 12 major modules are located, or let me generate an on-the-fly navigation path."
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Handle Google Auth Toggle
  const triggerGoogleAuth = () => {
    if (googleConnected) {
      setGoogleConnected(false);
      localStorage.setItem('swanaya_google_oauth_linked', 'false');
      addLog('Google Security: Revoked Google Workspace session scopes', 'warning');
    } else {
      setGoogleAuthLoading(true);
      setTimeout(() => {
        setGoogleConnected(true);
        setGoogleAuthLoading(false);
        localStorage.setItem('swanaya_google_oauth_linked', 'true');
        addLog('Google Security: Successfully authenticated via Google OAuth (aadithyanmmenon@gmail.com)', 'success');
      }, 1500);
    }
  };

  // Handle Quick Deploy from Selector
  const handleDeployDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) {
      addLog('Validation Error: Draft Campaign title is required', 'warning');
      return;
    }

    const d = new Date(draftDate);
    const monthsArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthsArray[d.getMonth()] || 'July';
    const dayNum = d.getDate() || 15;
    const yearNum = d.getFullYear() || 2026;

    onAddPlan({
      title: `${selectedPlatform} [${selectedFormat}] - ${draftTitle.trim()}`,
      type: selectedFormat as any,
      description: `Format-optimized campaign draft deployed via Swanaya Selector tool. Aspect: ${FORMAT_TIPS[selectedFormat]?.aspect || 'Standard'}. Best timing: ${FORMAT_TIPS[selectedFormat]?.timing || 'Standard'}.`,
      month: monthName,
      day: dayNum,
      year: yearNum,
      assignedDate: draftDate,
      status: 'Planned',
      platform: selectedPlatform as any
    });

    setDraftTitle('');
    addLog(`Selector Engine: Generated and deployed plan into calendar for ${monthName} Day ${dayNum}`, 'success');
    setActiveMainTab('planner');
  };

  // Bot response triggers
  const sendBotQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = { sender: 'user' as const, text: queryText };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      let reply = "I didn't quite catch that. Try asking about 'Monthly Planner', 'Task Assignment', 'Client Management', or click one of the suggested paths below.";
      let tabLink: any = null;

      const norm = queryText.toLowerCase();
      if (norm.includes('schedule') || norm.includes('planner') || norm.includes('calendar') || norm.includes('monthly')) {
        reply = "The 'Monthly Content Planner' features a beautiful 31-day grid. You can toggle through months, add brand campaigns, filter by platform status, and assign tasks directly. Let me redirect you there!";
        tabLink = 'planner';
      } else if (norm.includes('task') || norm.includes('assign') || norm.includes('designer') || norm.includes('editor')) {
        reply = "Task Assignments and creators delegation live inside the 'Task Assignment' module. In that module, you can manually build, update, and manage campaigns, toggle statuses, and upload file assets.";
        tabLink = 'planner'; // In ContentPlanner component
      } else if (norm.includes('security') || norm.includes('log') || norm.includes('telemetry')) {
        if (currentUser?.toLowerCase() === 'aadithyan') {
          reply = "Security & Telemetry logs record all operator actions. You can browse them under the Telemetry tab in the Admin Console.";
          tabLink = 'admin';
        } else {
          reply = "Security & Telemetry logs are strictly restricted to system administrators and can only be viewed within the secure Admin Console.";
          tabLink = undefined;
        }
      } else if (norm.includes('attendance') || norm.includes('clock') || norm.includes('check-in') || norm.includes('write') || norm.includes('docs') || norm.includes('watermark')) {
        reply = "Our new 'Content Writer' module provides powerful template generators (proposals, briefs, scripts, agreements), instant diagonal company watermark protections, and complete Google Docs integration with direct exports. Click to jump to Content Writer!";
        tabLink = 'writer';
      } else if (norm.includes('assistant') || norm.includes('ai') || norm.includes('caption') || norm.includes('hook')) {
        reply = "The 'AI Content Assistant' has copy-ready caption templates, viral hooks, and product ad frameworks. Let's head over to the AI Assist node!";
        tabLink = 'assistant';
      } else if (norm.includes('site map') || norm.includes('modules') || norm.includes('how many')) {
        reply = "Swanaya contains core modules spanning Calendar Scheduling, Client assets database, Campaign tracking (Google & Meta Ads), Content Writer with Google Docs, and AI help guides. Select any module on the interactive map card above to view detailed diagnostics!";
      } else if (norm.includes('google ads') || norm.includes('google auth') || norm.includes('meta ads') || norm.includes('oauth')) {
        reply = "Swanaya Media tracks advertising analytics and campaigns. Access the 'Content Planner' or ask our 'AI Assistant' to craft optimized campaigns.";
      }

      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: reply,
        linkTab: tabLink
      }]);
    }, 800);
  };

  const activePlatformConfig = PLATFORM_CONFIGS[selectedPlatform] || PLATFORM_CONFIGS['Instagram'];

  // Fix format selection if the platform changes and the previously selected format isn't supported
  useEffect(() => {
    if (activePlatformConfig && !activePlatformConfig.formats.includes(selectedFormat)) {
      setSelectedFormat(activePlatformConfig.formats[0]);
    }
  }, [selectedPlatform]);

  // Status mapping for visual stats
  const statusDistribution = (() => {
    const counts = { Draft: 0, 'In Progress': 0, 'In Review': 0, Published: 0 };
    
    plans.forEach(plan => {
      if (plan.status === 'Planned') counts.Draft++;
      else if (plan.status === 'In Progress') counts['In Progress']++;
      else if (plan.status === 'Review') counts['In Review']++;
      else if (plan.status === 'Completed') counts.Published++;
    });

    const total = plans.length;
    const isDemo = total === 0;

    // Use demo data if empty
    const data = isDemo ? [
      { name: 'Draft', value: 4, color: '#6366f1' },
      { name: 'In Progress', value: 2, color: '#f59e0b' },
      { name: 'In Review', value: 3, color: '#3b82f6' },
      { name: 'Published', value: 5, color: '#10b981' }
    ] : [
      { name: 'Draft', value: counts.Draft, color: '#6366f1' },
      { name: 'In Progress', value: counts['In Progress'], color: '#f59e0b' },
      { name: 'In Review', value: counts['In Review'], color: '#3b82f6' },
      { name: 'Published', value: counts.Published, color: '#10b981' }
    ];

    return { data, total, isDemo };
  })();

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        <div className={`relative border rounded-2xl p-6 overflow-hidden shadow-2xl transition-all duration-500 ${
          uiMode === 'ai' 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/45 to-slate-900 border-slate-800'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            {uiMode === 'ai' ? (
              <Sparkles className="w-64 h-64 text-indigo-400 animate-pulse" />
            ) : (
              <HomeIcon className="w-64 h-64 text-slate-500" />
            )}
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                {uiMode === 'ai' ? (
                  <>
                    <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                      AI Integrated Autopilot Mode
                    </span>
                    <span className="h-1.5 w-1.5 bg-indigo-400 rounded-full animate-ping" />
                  </>
                ) : (
                  <>
                    <span className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <HomeIcon className="w-3 h-3 text-slate-400" />
                      Standard Human Operator Mode
                    </span>
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  </>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight leading-none uppercase">
                {uiMode === 'ai' ? 'Swanique AI Command Node' : 'Swanique Operator Workspace'}
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                {uiMode === 'ai' ? (
                  <>
                    Welcome back, <strong className="text-indigo-300 font-bold">Aadithyan M. Menon</strong>. Predictive social suggestions, co-pilots, and server-side Gemini intelligence models are fully integrated.
                  </>
                ) : (
                  <>
                    Welcome back, <strong className="text-slate-300 font-bold">Aadithyan M. Menon</strong>. Ready to coordinate strict manual campaign schedules, log crew attendance, and track secure operations.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-2 self-stretch md:self-auto shrink-0">
              <button
                onClick={() => setActiveMainTab('planner')}
                className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Open Scheduler
              </button>
              {uiMode === 'ai' && (
                <button
                  onClick={() => setActiveMainTab('assistant')}
                  className="flex-1 sm:flex-initial bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Ask AI
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Front View 1-4Q Campaign Schedule (Days 1-31) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur-md">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Clock className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
                <h3 className="text-xl font-extrabold font-display text-white uppercase tracking-tight">
                  1-4Q Daily Campaign Schedule (Days 1–31)
                </h3>
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Front View 1–31 Days
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sequential daily campaign plans categorized across Quarters 1 to 4 (Q1 - Q4) arranged by Days 1 to 31.
              </p>
            </div>

            {/* Quarter Filter Tabs */}
            <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto self-start lg:self-auto max-w-full">
              {[
                { key: 'ALL', label: '1-4Q Schedule', icon: Calendar },
                { key: 'Q1', label: 'Q1 (Jan-Mar)', icon: Sparkles },
                { key: 'Q2', label: 'Q2 (Apr-Jun)', icon: Zap },
                { key: 'Q3', label: 'Q3 (Jul-Sep)', icon: CheckCircle2 },
                { key: 'Q4', label: 'Q4 (Oct-Dec)', icon: Clock },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setHomeQuarterTab(tab.key as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    homeQuarterTab === tab.key
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Day 1-31 Range Selector & Sort Mode Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 overflow-x-auto max-w-full">
              <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5 text-emerald-400" /> Day Range:
              </span>
              {[
                { key: 'ALL', label: 'All Days (1–31)' },
                { key: '1-10', label: 'Days 1–10' },
                { key: '11-20', label: 'Days 11–20' },
                { key: '21-31', label: 'Days 21–31' },
              ].map(range => (
                <button
                  key={range.key}
                  type="button"
                  onClick={() => setHomeDayRange(range.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                    homeDayRange === range.key
                      ? 'bg-emerald-600 text-white border border-emerald-400/30 shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 shrink-0">Order:</span>
              <button
                type="button"
                onClick={() => setHomeSortMode(m => m === 'DAY_1_TO_31' ? 'DATE_SEQ' : 'DAY_1_TO_31')}
                className="px-3 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Clock className="w-3 h-3 text-emerald-400" />
                {homeSortMode === 'DAY_1_TO_31' ? 'Arranged: Day 1 → 31' : 'Arranged: Calendar Date'}
              </button>
            </div>
          </div>

          {/* Quarterly Summary Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { q: 'Q1', title: '1st Quarter', months: 'Jan - Mar', mList: ['January', 'February', 'March'], color: 'border-blue-500/30 text-blue-400 bg-blue-950/20' },
              { q: 'Q2', title: '2nd Quarter', months: 'Apr - Jun', mList: ['April', 'May', 'June'], color: 'border-amber-500/30 text-amber-400 bg-amber-950/20' },
              { q: 'Q3', title: '3rd Quarter', months: 'Jul - Sep', mList: ['July', 'August', 'September'], color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20' },
              { q: 'Q4', title: '4th Quarter', months: 'Oct - Dec', mList: ['October', 'November', 'December'], color: 'border-purple-500/30 text-purple-400 bg-purple-950/20' },
            ].map(item => {
              const qCount = plans.filter(p => item.mList.includes(p.month)).length;
              const isSel = homeQuarterTab === 'ALL' || homeQuarterTab === item.q;
              return (
                <div
                  key={item.q}
                  onClick={() => setHomeQuarterTab(item.q as any)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSel 
                      ? `${item.color} shadow-md ring-1 ring-emerald-500/30`
                      : 'bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black font-mono">{item.q} ({item.months})</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {qCount} {qCount === 1 ? 'plan' : 'plans'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sorted 1-31 Days Schedule Grid */}
          {(() => {
            const MONTH_ORDER: Record<string, number> = {
              'January': 1, 'February': 2, 'March': 3,
              'April': 4, 'May': 5, 'June': 6,
              'July': 7, 'August': 8, 'September': 9,
              'October': 10, 'November': 11, 'December': 12
            };

            const getQ = (m: string) => {
              const num = MONTH_ORDER[m] || 1;
              if (num <= 3) return 'Q1';
              if (num <= 6) return 'Q2';
              if (num <= 9) return 'Q3';
              return 'Q4';
            };

            let filteredPlans = plans.filter(plan => {
              if (homeQuarterTab !== 'ALL' && getQ(plan.month) !== homeQuarterTab) return false;
              if (homePlatformFilter !== 'ALL' && plan.platform !== homePlatformFilter) return false;
              return true;
            });

            // Filter by day range if selected
            if (homeDayRange === '1-10') {
              filteredPlans = filteredPlans.filter(p => (p.day || 1) >= 1 && (p.day || 1) <= 10);
            } else if (homeDayRange === '11-20') {
              filteredPlans = filteredPlans.filter(p => (p.day || 1) >= 11 && (p.day || 1) <= 20);
            } else if (homeDayRange === '21-31') {
              filteredPlans = filteredPlans.filter(p => (p.day || 1) >= 21 && (p.day || 1) <= 31);
            }

            // Sort plans based on homeSortMode
            const sortedPlans = [...filteredPlans].sort((a, b) => {
              const dayA = a.day || 1;
              const dayB = b.day || 1;

              if (homeSortMode === 'DAY_1_TO_31') {
                // Primary sort by Day number 1 to 31
                if (dayA !== dayB) return dayA - dayB;
                const mA = MONTH_ORDER[a.month] || 1;
                const mB = MONTH_ORDER[b.month] || 1;
                if (mA !== mB) return mA - mB;
                return (a.year || 2026) - (b.year || 2026);
              } else {
                // Calendar date sequence
                const yA = a.year || 2026;
                const yB = b.year || 2026;
                if (yA !== yB) return yA - yB;
                const mA = MONTH_ORDER[a.month] || 1;
                const mB = MONTH_ORDER[b.month] || 1;
                if (mA !== mB) return mA - mB;
                return dayA - dayB;
              }
            });

            if (sortedPlans.length === 0) {
              return (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center space-y-2">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-300">No campaigns found for selected filter criteria.</p>
                  <p className="text-[11px] text-slate-500">Add new content schedules in the Monthly Content Planner.</p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Arranged Days 1–31 ({sortedPlans.length} deliverables)</span>
                  <button
                    type="button"
                    onClick={() => setActiveMainTab('planner')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Open 1-4Q Full Planner <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {sortedPlans.slice(0, 9).map(plan => {
                    const qBadge = getQ(plan.month);
                    const dayNum = plan.day || 1;
                    const formattedDay = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;

                    return (
                      <div
                        key={plan.id}
                        className="bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/40 p-3.5 rounded-xl space-y-2.5 transition-all shadow group relative flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded font-mono font-black text-[9px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow">
                                DAY {formattedDay}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-950 border border-emerald-800/80 px-2 py-0.5 rounded flex items-center gap-1">
                                {qBadge} • {plan.month} {plan.year || 2026}
                              </span>
                            </div>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                              plan.status === 'Completed' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              plan.status === 'In Progress' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                              plan.status === 'Review' ? 'bg-indigo-950 text-indigo-300 border-indigo-800' :
                              'bg-slate-800 text-slate-300 border-slate-700'
                            }`}>
                              {plan.status}
                            </span>
                          </div>

                          <h5 className="text-xs font-bold text-white font-display line-clamp-1 group-hover:text-emerald-300 transition-colors">
                            {plan.title}
                          </h5>

                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {plan.description || 'No description added.'}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span className="text-slate-300 font-semibold">{plan.platform} ({plan.type})</span>
                          {(plan.assignee || plan.createdBy) && <span>👤 {plan.assignee || plan.createdBy}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Main Grid: AI Task Planner & Strategic To-Do engine */}
        <div className="grid grid-cols-1">
          <AiTodo 
            onAddPlan={onAddPlan} 
            setActiveMainTab={setActiveMainTab} 
            addLog={addLog} 
            currentUser={currentUser} 
            uiMode={uiMode}
          />
        </div>
      </div>
    </div>
  );
}
