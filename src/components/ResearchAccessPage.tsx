import React, { useState, useEffect } from 'react';
import { 
  Cpu, Zap, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ArrowRight,
  Database, Lock, Key, Award, BarChart3, Layers, Clock, Server, RefreshCw,
  TrendingUp, Activity, PieChart as PieIcon, LineChart as LineIcon, UserCheck, Send, FileText, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

interface ResearchAccessPageProps {
  currentUser: string;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  onLevelChange?: (level: string) => void;
}

export default function ResearchAccessPage({ currentUser, addLog, onLevelChange }: ResearchAccessPageProps) {
  const userKey = currentUser ? currentUser.toLowerCase() : 'guest';
  const [activeTab, setActiveTab] = useState<'tiers' | 'insights' | 'request'>('tiers');
  const [userLevel, setUserLevel] = useState<string>(() => {
    return localStorage.getItem(`swanaya_rd_access_level_${userKey}`) || 'Research';
  });
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [credits, setCredits] = useState(() => {
    if (userLevel === 'Community') return 200;
    if (userLevel === 'Research') return 850;
    if (userLevel === 'Beta') return 4200;
    return 10000;
  });

  // Admin Request Modal & Form State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqFullName, setReqFullName] = useState(currentUser || '');
  const [reqEmail, setReqEmail] = useState(`${currentUser ? currentUser.toLowerCase() : 'user'}@swanayamedia.com`);
  const [reqTargetLevel, setReqTargetLevel] = useState('Enterprise Research');
  const [reqTargetRole, setReqTargetRole] = useState('Senior R&D Strategist');
  const [reqRationale, setReqRationale] = useState('');
  const [reqSubmittedSuccess, setReqSubmittedSuccess] = useState(false);

  // Existing user requests from localStorage
  const [existingRequests, setExistingRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_access_requests');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem(`swanaya_rd_access_level_${userKey}`) || 'Research';
    setUserLevel(saved);
  }, [userKey]);

  // Chart Data based on timeframe
  const getUsageTrendData = () => {
    if (timeframe === '7d') {
      return [
        { date: 'Mon', contentWriter: 120, seoAudit: 80, campaignPlanner: 60, aiAssistant: 40 },
        { date: 'Tue', contentWriter: 180, seoAudit: 110, campaignPlanner: 90, aiAssistant: 65 },
        { date: 'Wed', contentWriter: 240, seoAudit: 150, campaignPlanner: 110, aiAssistant: 85 },
        { date: 'Thu', contentWriter: 210, seoAudit: 130, campaignPlanner: 95, aiAssistant: 70 },
        { date: 'Fri', contentWriter: 290, seoAudit: 190, campaignPlanner: 140, aiAssistant: 110 },
        { date: 'Sat', contentWriter: 160, seoAudit: 90, campaignPlanner: 70, aiAssistant: 50 },
        { date: 'Sun', contentWriter: 220, seoAudit: 140, campaignPlanner: 105, aiAssistant: 80 },
      ];
    }
    if (timeframe === '90d') {
      return [
        { date: 'Week 1', contentWriter: 850, seoAudit: 520, campaignPlanner: 410, aiAssistant: 310 },
        { date: 'Week 3', contentWriter: 1120, seoAudit: 690, campaignPlanner: 580, aiAssistant: 420 },
        { date: 'Week 5', contentWriter: 1450, seoAudit: 890, campaignPlanner: 730, aiAssistant: 560 },
        { date: 'Week 7', contentWriter: 1320, seoAudit: 810, campaignPlanner: 690, aiAssistant: 510 },
        { date: 'Week 9', contentWriter: 1780, seoAudit: 1050, campaignPlanner: 890, aiAssistant: 670 },
        { date: 'Week 11', contentWriter: 2100, seoAudit: 1300, campaignPlanner: 1020, aiAssistant: 790 },
      ];
    }
    // Default 30d
    return [
      { date: 'Jul 05', contentWriter: 310, seoAudit: 180, campaignPlanner: 140, aiAssistant: 110 },
      { date: 'Jul 10', contentWriter: 420, seoAudit: 260, campaignPlanner: 210, aiAssistant: 150 },
      { date: 'Jul 15', contentWriter: 380, seoAudit: 240, campaignPlanner: 190, aiAssistant: 140 },
      { date: 'Jul 20', contentWriter: 510, seoAudit: 320, campaignPlanner: 270, aiAssistant: 190 },
      { date: 'Jul 25', contentWriter: 630, seoAudit: 410, campaignPlanner: 330, aiAssistant: 240 },
      { date: 'Jul 30', contentWriter: 590, seoAudit: 380, campaignPlanner: 310, aiAssistant: 220 },
      { date: 'Aug 02', contentWriter: 720, seoAudit: 490, campaignPlanner: 390, aiAssistant: 280 },
    ];
  };

  const getModuleAllocationData = () => [
    { name: 'Content Writer', value: 42, color: '#6366f1' },
    { name: 'SEO Audit Engine', value: 26, color: '#10b981' },
    { name: 'Campaign Planner', value: 18, color: '#a855f7' },
    { name: 'AI Workspace Assistant', value: 14, color: '#f59e0b' },
  ];

  const getPerformanceSlaData = () => [
    { metric: 'Gemini 2.5 Flash', avgMs: 112, targetMs: 200, accuracy: 99.8 },
    { metric: 'Pro Reasoning', avgMs: 245, targetMs: 350, accuracy: 99.4 },
    { metric: 'SEO Web Scraper', avgMs: 180, targetMs: 300, accuracy: 98.9 },
    { metric: 'Campaign Synthesizer', avgMs: 135, targetMs: 250, accuracy: 99.6 },
  ];

  const levels = [
    {
      id: 'community',
      name: 'Community Access',
      badge: 'Tier 1 • Open',
      desc: 'Basic R&D capabilities for individual creators & researchers.',
      credits: '200 Credits / month',
      features: [
        'Standard Gemini AI Model Access',
        'Basic Content Planner',
        '1 Active Workspace',
        'Community Forum Support',
      ],
      button: 'Activate Community Tier',
      active: userLevel === 'Community' || userLevel === 'Community Access',
    },
    {
      id: 'research',
      name: 'Research Access',
      badge: 'Tier 2 • Recommended',
      desc: 'Enhanced AI generation, campaign modeling & SEO audit tools.',
      credits: '1,000 Credits / month',
      features: [
        'Gemini 2.5 Pro & Flash Audio Models',
        'Unlimited Campaign Schedules',
        'Multi-User Collaborative Ticker',
        'Google Tag Manager GTM-MSGBPBT2 Support',
        'Full SEO Audit & Competitor Matrix',
      ],
      button: 'Activate Research Tier',
      active: userLevel === 'Research' || userLevel === 'Research Access',
    },
    {
      id: 'beta',
      name: 'Beta Access',
      badge: 'Tier 3 • Experimental',
      desc: 'Early access to unreleased AI neural models and video synthesis.',
      credits: '5,000 Credits / month',
      features: [
        'Experimental Omni & Live Speech API',
        'Automated Reel Storyboarding',
        'Custom Firestore Schema Multi-Tenancy',
        'Priority GPU Pipeline Scheduling',
      ],
      button: 'Activate Beta Access Tier',
      active: userLevel === 'Beta' || userLevel === 'Beta Access',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Research',
      badge: 'Tier 4 • Dedicated',
      desc: 'Dedicated Cloud SQL / Firestore nodes with SLA and legal DPA.',
      credits: 'Unlimited R&D Compute',
      features: [
        'Dedicated Sandbox Containers',
        'Enterprise Data Processing Agreement (DPA)',
        '24/7 Dedicated Lead Engineer Node',
        'Custom Fine-Tuned Domain Models',
      ],
      button: 'Activate Enterprise Tier',
      active: userLevel === 'Enterprise Research' || userLevel === 'Enterprise',
    },
  ];

  const handleSelectLevel = (levelName: string) => {
    let cleanLevel = 'Research';
    if (levelName.includes('Community')) cleanLevel = 'Community';
    else if (levelName.includes('Beta')) cleanLevel = 'Beta';
    else if (levelName.includes('Enterprise')) cleanLevel = 'Enterprise Research';
    else cleanLevel = 'Research';

    setUserLevel(cleanLevel);
    localStorage.setItem(`swanaya_rd_access_level_${userKey}`, cleanLevel);
    window.dispatchEvent(new CustomEvent('rd_level_changed', { detail: { level: cleanLevel } }));
    if (onLevelChange) onLevelChange(cleanLevel);

    if (cleanLevel === 'Community') setCredits(200);
    else if (cleanLevel === 'Research') setCredits(850);
    else if (cleanLevel === 'Beta') setCredits(4200);
    else setCredits(9999);

    addLog(`R&D Access: Operator "${currentUser}" activated access tier [${cleanLevel}]`, 'success');
  };

  const handleFormSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqFullName.trim() || !reqRationale.trim()) {
      alert('Please fill out your full name and rationale for administrative clearance.');
      return;
    }

    const newRequest = {
      id: `req_${Date.now()}`,
      username: currentUser || 'guest',
      fullName: reqFullName.trim(),
      email: reqEmail.trim(),
      currentLevel: userLevel,
      requestedLevel: reqTargetLevel,
      requestedRole: reqTargetRole,
      rationale: reqRationale.trim(),
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      submittedAt: new Date().toISOString(),
    };

    const updated = [newRequest, ...existingRequests];
    setExistingRequests(updated);
    localStorage.setItem('swanaya_access_requests', JSON.stringify(updated));
    window.dispatchEvent(new Event('swanaya_access_requests_updated'));

    addLog(`Admin Clearance Request: Submitted access edit request for [${reqTargetLevel}] to Administrator`, 'action');
    setReqSubmittedSuccess(true);

    setTimeout(() => {
      setReqSubmittedSuccess(false);
      setIsRequestModalOpen(false);
      setReqRationale('');
    }, 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 text-slate-100 font-sans">
      
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
              <Cpu className="w-6 h-6 animate-pulse" />
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              RESEARCH & DEVELOPMENT PROGRAM
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white font-mono tracking-tight">
            Research & Development Access
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Swanique AI operates under an R&D Access framework. Manage active research tiers, view real-time compute credit analytics, or submit registration & login access edits directly to System Admin.
          </p>
        </div>

        {/* Status Card & Admin Request Launcher */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shrink-0 space-y-3 min-w-[280px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Research Clearance
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              ACCESS GRANTED
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-mono">Current Level:</span>
            <div className="text-lg font-black font-mono text-indigo-400 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>{userLevel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono pt-1">
            <span className="text-slate-400">Compute Credits:</span>
            <span className="font-bold text-emerald-400">{credits} / 1000</span>
          </div>

          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            <UserCheck className="w-4 h-4" />
            <span>Submit Request to Admin</span>
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('tiers')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'tiers'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Access Tiers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'insights'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Research Insights & Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('request')}
          className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'request'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
          }`}
        >
          <Send className="w-4 h-4 text-amber-400" />
          <span>Admin Clearance Status ({existingRequests.length})</span>
        </button>
      </div>

      {/* TAB 1: ACCESS TIERS SELECTION */}
      {activeTab === 'tiers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {levels.map((lvl) => (
              <motion.div
                key={lvl.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`bg-slate-900/80 border p-6 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden ${
                  lvl.active
                    ? 'border-indigo-500 shadow-2xl shadow-indigo-600/20 bg-slate-900'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {lvl.active && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    ACTIVE
                  </div>
                )}

                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase px-2.5 py-1 bg-indigo-950 rounded-lg border border-indigo-800 w-fit block">
                    {lvl.badge}
                  </span>

                  <div>
                    <h3 className="text-lg font-black text-white font-mono">{lvl.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">{lvl.desc}</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono font-bold text-emerald-400">
                    {lvl.credits}
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 font-sans">
                    {lvl.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectLevel(lvl.name)}
                  disabled={lvl.active}
                  className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    lvl.active
                      ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                  }`}
                >
                  {lvl.active ? 'Current Access Tier' : `Activate ${lvl.name}`}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: RESEARCH INSIGHTS & CREDIT ANALYTICS DASHBOARD (RECHARTS) */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          
          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Total Credits Used</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-mono text-white">4,820 Credits</div>
              <p className="text-[10px] text-emerald-400 font-mono">+18% vs previous period</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Avg Model Latency</span>
                <Clock className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black font-mono text-indigo-400">138 ms</div>
              <p className="text-[10px] text-indigo-300 font-mono">Fast Gemini 2.5 Flash pipeline</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Model Accuracy</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">99.6%</div>
              <p className="text-[10px] text-slate-400 font-mono">Zero hallucination threshold</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Active Compute Nodes</span>
                <Server className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black font-mono text-purple-400">12 Worker Nodes</div>
              <p className="text-[10px] text-emerald-400 font-mono">Cloud Run & Firestore sync</p>
            </div>
          </div>

          {/* Timeframe Filter Controls */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold font-mono text-white uppercase">Compute Credit Consumption Trends</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTimeframe('7d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                  timeframe === '7d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('30d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                  timeframe === '30d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('90d')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                  timeframe === '90d' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                90 Days
              </button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart: Usage by Module Over Time */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                R&D Module Credit Consumption (Stacked Area)
              </h4>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getUsageTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorContent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorSeo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorCampaign" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="contentWriter" name="Content Writer" stackId="1" stroke="#6366f1" fillOpacity={1} fill="url(#colorContent)" />
                    <Area type="monotone" dataKey="seoAudit" name="SEO Audit" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorSeo)" />
                    <Area type="monotone" dataKey="campaignPlanner" name="Campaign Planner" stackId="1" stroke="#a855f7" fillOpacity={1} fill="url(#colorCampaign)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Chart: Credit Distribution */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-400" />
                Credit Allocation by Feature
              </h4>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getModuleAllocationData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {getModuleAllocationData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {getModuleAllocationData().map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-300">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart: Latency & Target SLA */}
            <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <LineIcon className="w-4 h-4 text-purple-400" />
                AI Model Latency Benchmark (ms vs SLA Target)
              </h4>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getPerformanceSlaData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="avgMs" name="Actual Avg Latency (ms)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="targetMs" name="SLA Target Latency (ms)" fill="#334155" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: ADMIN CLEARANCE REQUESTS LIST */}
      {activeTab === 'request' && (
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black font-mono text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-400" />
                Submitted Access & Registration Requests
              </h3>
              <p className="text-xs text-slate-400">
                Track status of requested registration edits, role changes, and tier clearance submitted to Admin.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <UserCheck className="w-4 h-4" />
              <span>Submit New Request</span>
            </button>
          </div>

          {existingRequests.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-950/60 rounded-2xl border border-slate-850 p-6">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">No clearance requests submitted yet.</p>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono font-bold underline cursor-pointer"
              >
                Submit your first registration / access request to Admin
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {existingRequests.map((req) => (
                <div key={req.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{req.fullName} (@{req.username})</span>
                      <span className="text-slate-400">• {req.email}</span>
                    </div>
                    <div className="text-slate-300">
                      Requested: <strong className="text-indigo-400">{req.requestedLevel}</strong> | Role: <strong className="text-emerald-400">{req.requestedRole}</strong>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans italic">"{req.rationale}"</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] text-slate-500">
                      {new Date(req.submittedAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                      req.status === 'approved' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : req.status === 'rejected'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {req.status === 'approved' ? '✓ APPROVED BY ADMIN' : req.status === 'rejected' ? '✗ REJECTED' : '⏳ PENDING ADMIN REVIEW'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* R&D Participation Guidelines */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          R&D Participation Guidelines & Protocols
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          As a participant in the Swanique AI Research & Development program, all generated prompts, creative assets, and performance logs are handled in compliance with our <strong>Data Protection Policy</strong> and <strong>AI Responsible Use Guidelines</strong>. Research participants are granted non-exclusive compute privileges to evaluate automation workflows prior to full enterprise production release.
        </p>
      </div>

      {/* SUBMIT ACCESS / REGISTRATION EDIT TO ADMIN MODAL */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-indigo-500/40 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-mono text-white">Submit Access & Registration Request</h3>
                    <p className="text-xs text-slate-400">Request access edits, role promotions, or tier clearance from System Admin.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {reqSubmittedSuccess ? (
                <div className="bg-emerald-950/80 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold font-mono text-white">Request Transmitted to Admin!</h4>
                  <p className="text-xs text-emerald-300 font-sans">
                    Your registration & access clearance edit request has been submitted to System Administrator for review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmitRequest} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-slate-300 font-mono font-bold mb-1">Applicant Name</label>
                    <input
                      type="text"
                      required
                      value={reqFullName}
                      onChange={(e) => setReqFullName(e.target.value)}
                      placeholder="e.g. Aadithyan / Lead Researcher"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-mono font-bold mb-1">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={reqEmail}
                      onChange={(e) => setReqEmail(e.target.value)}
                      placeholder="e.g. user@swanayamedia.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 font-mono font-bold mb-1">Requested Access Tier</label>
                      <select
                        value={reqTargetLevel}
                        onChange={(e) => setReqTargetLevel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono outline-none focus:border-indigo-500"
                      >
                        <option value="Community Access">Community Access (Tier 1)</option>
                        <option value="Research Access">Research Access (Tier 2)</option>
                        <option value="Beta Access">Beta Access (Tier 3)</option>
                        <option value="Enterprise Research">Enterprise Research (Tier 4)</option>
                        <option value="Administrator Clearance">Administrator Clearance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-mono font-bold mb-1">Requested Role Title</label>
                      <input
                        type="text"
                        value={reqTargetRole}
                        onChange={(e) => setReqTargetRole(e.target.value)}
                        placeholder="e.g. Senior Content Strategist"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-mono font-bold mb-1">Rationale / Administrative Purpose</label>
                    <textarea
                      required
                      rows={3}
                      value={reqRationale}
                      onChange={(e) => setReqRationale(e.target.value)}
                      placeholder="Describe why you need elevated access or credential modification..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-sans outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Transmit Request</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

