import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, Sparkles, Youtube, Instagram, Shield, Layout,
  Layers, Settings, Share2, Compass, AlertCircle, Send, CheckCircle2,
  Calendar, Film, FileText, BarChart3, Users, Clock, HelpCircle, 
  ChevronRight, Laptop, Key, Power, Image, Check, Smartphone, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentPlan } from '../types';
import AiTodo from './AiTodo';

interface HomeProps {
  plans: ContentPlan[];
  onAddPlan: (plan: Omit<ContentPlan, 'id' | 'createdAt'>) => void;
  setActiveMainTab: (tab: any) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  currentUser: string;
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

export default function Home({ plans, onAddPlan, setActiveMainTab, addLog, currentUser }: HomeProps) {
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
        reply = "Security & Telemetry logs record all operators actions. You can browse them on the Security Tab. Want to take a look?";
        tabLink = 'security';
      } else if (norm.includes('attendance') || norm.includes('clock') || norm.includes('check-in')) {
        reply = "Our integrated 'Attendance Tracker' helps team members log daily check-ins, record shift notes, and check which dates have not been logged. Click to jump to Attendance!";
        tabLink = 'attendance';
      } else if (norm.includes('assistant') || norm.includes('ai') || norm.includes('caption') || norm.includes('hook')) {
        reply = "The 'AI Content Assistant' has copy-ready caption templates, viral hooks, and product ad frameworks. Let's head over to the AI Assist node!";
        tabLink = 'assistant';
      } else if (norm.includes('site map') || norm.includes('modules') || norm.includes('how many')) {
        reply = "Swanaya contains 12 core modules spanning Calendar Scheduling, Client assets database, Campaign tracking (Google & Meta Ads), Attendance tracking, and AI help guides. Select any module on the interactive map card above to view detailed diagnostics!";
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

  return (
    <div className="space-y-6">

      {/* Hero Welcome banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950/45 to-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <HomeIcon className="w-64 h-64 text-indigo-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                Live Operator Control Center
              </span>
              <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight leading-none uppercase">
              Swanaya Command Node
            </h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Welcome back, <strong className="text-indigo-300 font-bold">Aadithyan M. Menon</strong>. Ready to coordinate media distributions and manage corporate client assets.
            </p>
          </div>

          <div className="flex gap-2 self-stretch md:self-auto shrink-0">
            <button
              onClick={() => setActiveMainTab('planner')}
              className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Open Scheduler
            </button>
            <button
              onClick={() => setActiveMainTab('assistant')}
              className="flex-1 sm:flex-initial bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Ask AI
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Google Auth & Media Formats Selector & Site Map Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column (5 cols): Platform Selector */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Module 2: Campaign Media Platform & Format Selector */}
          <div className="bg-slate-950/45 border border-slate-800/80 rounded-2xl p-5 space-y-4 flex-grow flex flex-col justify-between">
            <div className="space-y-1 border-b border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Format & Platform Selector</h3>
              </div>
              <p className="text-[10px] text-slate-500">Select base parameters and deploy draft campaign plan</p>
            </div>

            <div className="space-y-4">
              {/* Platforms grid */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Select Social Channel / Platform</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.keys(PLATFORM_CONFIGS).map(platName => {
                    const cfg = PLATFORM_CONFIGS[platName];
                    const active = selectedPlatform === platName;
                    return (
                      <button
                        key={platName}
                        onClick={() => setSelectedPlatform(platName)}
                        className={`py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-tight uppercase cursor-pointer transition-all border ${
                          active 
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-md' 
                            : 'bg-slate-950/60 border-slate-850 text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {platName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formats Selector */}
              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Select Content Type / Format</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-1.5">
                  {activePlatformConfig?.formats.map(format => {
                    const active = selectedFormat === format;
                    return (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold tracking-tight uppercase cursor-pointer transition-all border flex items-center justify-center gap-1.5 ${
                          active 
                            ? 'bg-slate-900 border-indigo-500 text-indigo-400 shadow' 
                            : 'bg-slate-950/40 border-slate-900 text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        {format === 'Video' && <Film className="w-3 h-3 text-red-500" />}
                        {format === 'Reels' && <Youtube className="w-3 h-3 text-red-500" />}
                        {format === 'Ads' && <BarChart3 className="w-3 h-3 text-sky-400" />}
                        {format === 'Poster' && <Image className="w-3 h-3 text-emerald-400" />}
                        {format === 'Story' && <Compass className="w-3 h-3 text-pink-400" />}
                        {format === 'Carousel' && <Layers className="w-3 h-3 text-indigo-400" />}
                        <span>{format}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic advice panel based on choice */}
              {FORMAT_TIPS[selectedFormat] && (
                <div className="bg-slate-900/60 border border-slate-850 p-3.5 rounded-xl space-y-2 text-left">
                  <div className="flex items-center gap-1.5 border-b border-slate-850 pb-1.5">
                    <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${activePlatformConfig.color}`} />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono">
                      {selectedPlatform} • {selectedFormat} Recommendations
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                    <div>
                      <span className="text-slate-500 block">Aspect Ratio:</span>
                      <strong className="text-slate-200">{FORMAT_TIPS[selectedFormat].aspect}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Optimal Hour:</span>
                      <strong className="text-slate-200">{FORMAT_TIPS[selectedFormat].timing}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-500 block">Target CTR:</span>
                      <strong className="text-emerald-400">{FORMAT_TIPS[selectedFormat].ctr}</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-relaxed border-t border-slate-850/60 pt-2 font-mono">
                    <span className="font-bold text-indigo-400 uppercase tracking-tight text-[9px] block">Strategic Advice:</span>
                    {FORMAT_TIPS[selectedFormat].advice}
                  </p>
                </div>
              )}

              {/* Quick Draft Form */}
              <form onSubmit={handleDeployDraft} className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      placeholder="e.g., Summer Brand Refresh"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white placeholder-slate-700 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Target Date</label>
                    <input
                      type="date"
                      required
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white outline-none cursor-pointer"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] py-2 rounded-lg cursor-pointer transition-colors shadow active:scale-[0.98] flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> Deploy Draft Plan to Calendar
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right column (7 cols): AI Task Planner & Strategic To-Do engine */}
        <div className="lg:col-span-7">
          <AiTodo 
            onAddPlan={onAddPlan} 
            setActiveMainTab={setActiveMainTab} 
            addLog={addLog} 
            currentUser={currentUser} 
          />
        </div>

      </div>

    </div>
  );
}
