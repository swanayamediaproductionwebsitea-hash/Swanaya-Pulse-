import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, Sparkles, Youtube, Instagram, Shield, Layout,
  Layers, Settings, Share2, Compass, AlertCircle, Send, CheckCircle2,
  Calendar, Film, FileText, BarChart3, Users, Clock, HelpCircle, 
  ChevronRight, Laptop, Key, Power, Image, Check, Smartphone, Lock
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
