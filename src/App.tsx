import React, { useState, useEffect } from 'react';
import { 
  LogOut, Monitor, UserCheck, ShieldCheck, Cpu, HardDrive, HelpCircle, 
  Clock, Zap, CheckCircle, Wifi, Database, Info, Sparkles, Film, Calendar, MessageSquare,
  Home as HomeIcon, User, Search, X, Users, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentPlan, ContentDocument, ActivityLog } from './types';
import Background3D from './components/Background3D';
import LoginModule from './components/LoginModule';
import InteractiveLanding from './components/InteractiveLanding';
import ContentWriter from './components/ContentWriter';
import ContentPlanner from './components/ContentPlanner';
import AdminActivityLog from './components/AdminActivityLog';
import AssistantWidget from './components/AssistantWidget';
import Home from './components/Home';
import ProfileSettings from './components/ProfileSettings';
import RealTimeTicker from './components/RealTimeTicker';
import PopupHub from './components/PopupHub';
import ClientHub from './components/ClientHub';
import FaqExperiences from './components/FaqExperiences';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [liveTime, setLiveTime] = useState<string>('');
  const [activeMainTab, setActiveMainTab] = useState<'home' | 'planner' | 'writer' | 'admin' | 'assistant' | 'profile' | 'client' | 'faq'>('home');
  const [landingView, setLandingView] = useState<'landing' | 'login'>('landing');
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userProfileTitle, setUserProfileTitle] = useState<string>('Content Creator');
  const [currentUserPermission, setCurrentUserPermission] = useState<'viewer' | 'editor' | 'administrator'>('editor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uiMode, setUiMode] = useState<'human' | 'ai'>(() => {
    return (localStorage.getItem('swanaya_ui_mode') as 'human' | 'ai') || 'ai';
  });

  // Load any unread text dispatches from Admin
  const [adminMessages, setAdminMessages] = useState<any[]>([]);

  const loadAdminMessages = () => {
    if (!currentUser) return;
    try {
      const saved = localStorage.getItem('swanaya_user_messages');
      if (saved) {
        const msgs = JSON.parse(saved);
        // Find messages for this user or 'all' broadcasts, and not dismissed
        const activeMsgs = msgs.filter((m: any) => 
          (m.recipient === 'all' || m.recipient.toLowerCase() === currentUser.toLowerCase()) && 
          !(m.dismissedBy || []).includes(currentUser.toLowerCase())
        );
        setAdminMessages(activeMsgs);
      }
    } catch (e) {
      console.warn('Failed to load admin dispatches:', e);
    }
  };

  useEffect(() => {
    loadAdminMessages();
  }, [currentUser, activeMainTab]);

  const handleDismissAdminMessage = (msgId: string) => {
    if (!currentUser) return;
    try {
      const saved = localStorage.getItem('swanaya_user_messages');
      if (saved) {
        const msgs = JSON.parse(saved);
        const updated = msgs.map((m: any) => {
          if (m.id === msgId) {
            const dismissedBy = m.dismissedBy || [];
            if (!dismissedBy.includes(currentUser.toLowerCase())) {
              dismissedBy.push(currentUser.toLowerCase());
            }
            return { ...m, dismissedBy };
          }
          return m;
        });
        localStorage.setItem('swanaya_user_messages', JSON.stringify(updated));
        
        // Update local state
        setAdminMessages(prev => prev.filter(m => m.id !== msgId));
        addLog('Admin Messaging: Dismissed secure text message alert from view', 'info');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleSetUiMode = (mode: 'human' | 'ai') => {
    setUiMode(mode);
    localStorage.setItem('swanaya_ui_mode', mode);
  };

  // Load current user's profile image & title
  const loadCurrentUserProfile = async () => {
    if (currentUser) {
      if (currentUser.toLowerCase() === 'video') {
        setCurrentUserPermission('viewer');
        setUserProfileImage('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=150');
        setUserProfileTitle('Video Stream Observer');
        return;
      }

      const isSystemAdmin = currentUser.toLowerCase() === 'each' || currentUser.toLowerCase() === 'aadithyan';
      if (isSystemAdmin) {
        setCurrentUserPermission('administrator');
        setUserProfileImage(null);
        setUserProfileTitle('System Administrator');
        return;
      }

      const cachedImg = localStorage.getItem(`swanaya_profile_image_${currentUser}`);
      const cachedTitle = localStorage.getItem(`swanaya_profile_title_${currentUser}`);
      setUserProfileImage(cachedImg || null);
      setUserProfileTitle(cachedTitle || 'Content Creator');

      // Look up permission level from local registered users list
      const saved = localStorage.getItem('swanaya_registered_users');
      let foundPerm: 'viewer' | 'editor' = 'editor';
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const found = parsed.find((u: any) => u.username.toLowerCase() === currentUser.toLowerCase());
          if (found && found.permissionLevel) {
            foundPerm = found.permissionLevel;
          }
        } catch (e) {
          console.error(e);
        }
      }
      setCurrentUserPermission(foundPerm);

      // Try fetching live from Firestore as well to keep in sync
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        const userDocRef = doc(db, 'users', currentUser.toLowerCase());
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.permissionLevel) {
            setCurrentUserPermission(data.permissionLevel);
            // Sync back to local storage list
            if (saved) {
              const parsed = JSON.parse(saved);
              const updated = parsed.map((u: any) => u.username.toLowerCase() === currentUser.toLowerCase() ? { ...u, permissionLevel: data.permissionLevel } : u);
              localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
            }
          }
        }
      } catch (err) {
        console.warn('Firestore offline or restricted:', err);
      }
    } else {
      setUserProfileImage(null);
      setUserProfileTitle('Content Creator');
      setCurrentUserPermission('editor');
    }
  };

  useEffect(() => {
    loadCurrentUserProfile();
  }, [currentUser]);

  // Auto-switch main tab to 'planner' when a search is entered so results can be seen
  useEffect(() => {
    if (searchQuery && activeMainTab !== 'planner') {
      setActiveMainTab('planner');
      addLog(`Search query active: Switched main workspace to content planner view to list matching entries`, 'action');
    }
  }, [searchQuery]);

  // Load count of registered users for showcase metrics
  useEffect(() => {
    const saved = localStorage.getItem('swanaya_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRegisteredUsersCount(parsed.length);
        }
      } catch (e) {
        console.error('Error parsing registered users', e);
      }
    }
  }, [currentUser]);

  // 1. Setup real-time system clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Initialize and load states from database with localStorage fallback
  useEffect(() => {
    // Check if user has active session
    const activeSession = localStorage.getItem('swanaya_current_user');
    if (activeSession) {
      setCurrentUser(activeSession);
    }

    // Load plans
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/plans');
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((item: any) => ({ ...item, id: String(item.id) }));
          setPlans(formatted);
          localStorage.setItem('swanaya_content_plans', JSON.stringify(formatted));
          return;
        }
      } catch (err) {
        console.warn('Database offline, using cached plans:', err);
      }
      
      const savedPlans = localStorage.getItem('swanaya_content_plans');
      if (savedPlans) {
         try {
           setPlans(JSON.parse(savedPlans));
         } catch (e) {
           console.error('Error parsing content plans', e);
         }
      }
    };

    // Load activity logs
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/logs');
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((item: any) => ({ ...item, id: String(item.id) }));
          setLogs(formatted);
          localStorage.setItem('swanaya_activity_logs', JSON.stringify(formatted));
          return;
        }
      } catch (err) {
        console.warn('Database offline, using cached logs:', err);
      }

      const savedLogs = localStorage.getItem('swanaya_activity_logs');
      if (savedLogs) {
         try {
           setLogs(JSON.parse(savedLogs));
         } catch (e) {
           console.error('Error parsing activity logs', e);
         }
      } else {
         const seedLogs: ActivityLog[] = [
           {
             id: 'l1',
             text: 'System: Initialized Swanaya Media Enterprises database pipelines',
             timestamp: '07:38:15',
             type: 'info'
           },
           {
             id: 'l2',
             text: 'Security: Credentials initialized for system administrator "each"',
             timestamp: '07:38:20',
             type: 'success'
           }
         ];
         setLogs(seedLogs);
         localStorage.setItem('swanaya_activity_logs', JSON.stringify(seedLogs));
      }
    };

    fetchPlans();
    fetchLogs();
  }, []);

  // 3. Logger utility with DB sync
  const addLog = async (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => {
    const timestamp = new Date().toLocaleTimeString();
    const tempId = `l_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newLog: ActivityLog = { id: tempId, text, timestamp, type };

    setLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 100);
      localStorage.setItem('swanaya_activity_logs', JSON.stringify(updated));
      return updated;
    });

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, timestamp, type, uid: currentUser })
      });
    } catch (err) {
      console.warn('Failed to sync log to database:', err);
    }
  };

  // 4. Authentication success handler
  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('swanaya_current_user', username);
    localStorage.setItem('swanaya_has_logged_in', 'true');
    addLog(`Security: Authorized session created for operator "${username}"`, 'success');
    
    try {
      const savedLogins = localStorage.getItem('swanaya_workspace_logins');
      const logins = savedLogins ? JSON.parse(savedLogins) : [];
      logins.push({
        id: `login_${Date.now()}`,
        username,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        userAgent: navigator.userAgent
      });
      localStorage.setItem('swanaya_workspace_logins', JSON.stringify(logins));
    } catch (e) {
      console.warn('Failed to save login event:', e);
    }
  };

  // 5. Authentication logout handler
  const handleLogout = () => {
    if (currentUser) {
      addLog(`Security: Active session destroyed for operator "${currentUser}"`, 'warning');
    }
    setCurrentUser(null);
    localStorage.removeItem('swanaya_current_user');
    setLandingView('landing');
  };

  // 7. Planner handlers with DB sync
  const handleAddPlan = async (newPlan: Omit<ContentPlan, 'id' | 'createdAt'>) => {
    const tempId = `p_${Date.now()}`;
    const plan: ContentPlan = {
      ...newPlan,
      createdBy: newPlan.createdBy || currentUser || 'each',
      id: tempId,
      createdAt: new Date().toISOString()
    };

    setPlans((prev) => {
      const updated = [plan, ...prev];
      localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
      return updated;
    });

    addLog(`User Action: Scheduled new campaign plan "${plan.title}" under ${plan.month} Day ${plan.day}`, 'action');

    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan)
      });
      if (response.ok) {
        const dbPlan = await response.json();
        setPlans((prev) =>
          prev.map((p) => p.id === tempId ? { ...p, id: String(dbPlan.id) } : p)
        );
      }
    } catch (err) {
      console.error('Failed to save plan to database:', err);
    }
  };

  const handleUpdatePlanStatus = async (id: string, status: ContentPlan['status']) => {
    let matchedPlan: ContentPlan | undefined;
    setPlans((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          matchedPlan = { ...p, status };
          return matchedPlan;
        }
        return p;
      });
      localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
      return updated;
    });

    if (matchedPlan) {
      addLog(`User Action: Updated plan "${matchedPlan.title}" state matrix to [${status}]`, 'info');
      
      if (!id.startsWith('p_')) {
        try {
          await fetch(`/api/plans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
          });
        } catch (err) {
          console.error('Failed to update plan status in DB:', err);
        }
      }
    }
  };

  const handleUpdatePlan = async (updatedPlan: ContentPlan) => {
    setPlans((prev) => {
      const updated = prev.map(p => p.id === updatedPlan.id ? updatedPlan : p);
      localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
      return updated;
    });

    addLog(`User Action: Updated Campaign Details for plan "${updatedPlan.title}"`, 'info');

    if (!updatedPlan.id.startsWith('p_')) {
      try {
        await fetch(`/api/plans/${updatedPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedPlan)
        });
      } catch (err) {
        console.error('Failed to update plan in DB:', err);
      }
    }
  };

  const handleDeletePlan = async (id: string) => {
    const matched = plans.find(p => p.id === id);
    setPlans((prev) => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
      return updated;
    });

    if (matched) {
      addLog(`User Action: Deleted content plan "${matched.title}" from registry`, 'warning');
      
      if (!id.startsWith('p_')) {
        try {
          await fetch(`/api/plans/${id}`, { method: 'DELETE' });
        } catch (err) {
          console.error('Failed to delete plan from DB:', err);
        }
      }
    }
  };

  const handleClearLogs = async () => {
    const cleared = [
      {
        id: `l_${Date.now()}`,
        text: 'System: Cleared security audit log history buffer',
        timestamp: new Date().toLocaleTimeString(),
        type: 'info' as const
      }
    ];
    setLogs(cleared);
    localStorage.setItem('swanaya_activity_logs', JSON.stringify(cleared));

    try {
      await fetch('/api/logs', { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to clear database logs:', err);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-slate-100 font-sans selection:bg-indigo-500/35 selection:text-white pb-0">
      
      {/* Real-time Rolling Ticker & Simulation Notification HUD */}
      <RealTimeTicker />
      
      {/* Absolute 3D Backdrop canvas */}
      <Background3D />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col justify-start">
        
        {/* ==========================================
            LOGGED OUT STATE: Gorgeous 3D Login
            ========================================== */}
        {!currentUser ? (
          landingView === 'landing' ? (
            <InteractiveLanding 
              onEnterPortal={() => setLandingView('login')} 
              registeredUsersCount={registeredUsersCount} 
            />
          ) : (
            <div className="flex-grow flex flex-col justify-center py-12">
              <div className="text-center mb-4">
                <button
                  type="button"
                  onClick={() => setLandingView('landing')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-400 font-mono text-[10px] uppercase tracking-wider rounded-lg shadow cursor-pointer transition-all active:scale-95"
                >
                  ← Return to Interactive Showcase Landing
                </button>
              </div>
              <div className="text-center mb-4 max-w-lg mx-auto">
                <span className="inline-flex px-3 py-1 bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 font-mono text-[10px] font-bold uppercase tracking-widest rounded-full mb-4 shadow">
                  Swanaya Media Enterprises • custom portal
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white mb-2 leading-none">
                  PRODUCTION HUB
                </h1>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Direct media planning, 3D scheduling matrices, and live video uploading pipelines
                </p>
              </div>

              <LoginModule onLoginSuccess={handleLoginSuccess} addLog={addLog} />

              <div className="text-center text-[11px] text-slate-600 font-mono mt-8 space-y-1">
                <p>SWANAYA ENTERPRISES SECURE PORTAL © 2026 • WORKSPACE NODE ONLINE</p>
                <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase">LAST UPDATED ON 21:31 PM 17/07/2026 FRIDAY</p>
              </div>
            </div>
          )
        ) : currentUser.toLowerCase() === 'video' ? (
          /* ==========================================
             LOGGED IN STATE: Video Stream Console
             ========================================== */
          <div className="flex flex-col gap-6 py-6 flex-grow">
            <header className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex justify-between items-center shadow-xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-rose-500/20 text-lg font-display animate-pulse">
                  V
                </div>
                <div className="text-left">
                  <h1 className="text-sm font-black uppercase tracking-tight text-white font-display">
                    Swanaya Stream Feed
                  </h1>
                  <p className="text-[10px] text-rose-400 font-semibold tracking-wider uppercase animate-pulse">
                    LIVE VIDEO CHANNEL ONLY
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono font-bold bg-slate-950 px-3 py-1.5 rounded-full border border-slate-850 flex items-center gap-1.5 text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" /> LIVE RECEIVER
                </span>
                
                <button
                  onClick={handleLogout}
                  className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/30 hover:border-rose-800/85 text-rose-300 rounded-lg py-1.5 px-3.5 transition-all text-xs flex items-center gap-1.5 cursor-pointer font-semibold shadow-md active:scale-95"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </header>

            <main className="flex-grow flex flex-col justify-stretch">
              <InteractiveLanding 
                onEnterPortal={() => {}} 
                registeredUsersCount={registeredUsersCount} 
                isLoggedVideoOnly={true}
              />
            </main>
          </div>
        ) : (
          
          /* ==========================================
             LOGGED IN STATE: Dashboard Workspace
             ========================================== */
          <div className="flex flex-col gap-6 py-6 flex-grow">
            
            {/* Header / Navigation bar */}
            <header className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl z-10">
              
              {/* Branding and status */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-lg font-display animate-pulse" style={{ animationDuration: uiMode === 'ai' ? '3s' : '0s' }}>
                  S
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold uppercase tracking-tight text-white font-display">
                      {uiMode === 'ai' ? 'Swanique AI' : 'Swanique Standard'}
                    </h1>
                    <span className={`h-2 w-2 rounded-full animate-pulse ${uiMode === 'ai' ? 'bg-indigo-400' : 'bg-emerald-500'}`} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                    {uiMode === 'ai' ? 'AI Integrated Autopilot' : 'Human Operator Command'}
                  </p>
                </div>
              </div>

              {/* Mode Switcher Segmented Control */}
              <div className="bg-slate-950/80 border border-slate-800/80 p-1.5 rounded-xl flex items-center gap-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    handleSetUiMode('human');
                    addLog('UI Mode Switch: Active [Human Operator Mode]. Focused on manual editing & standard structures.', 'info');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                    uiMode === 'human'
                      ? 'bg-slate-800 border-indigo-500/20 text-indigo-400 font-black shadow-sm'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Human UI</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSetUiMode('ai');
                    addLog('UI Mode Switch: Active [AI-Integrated Workspace]. Enabled predictive co-pilots, tags & automated scripts.', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer border ${
                    uiMode === 'ai'
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 font-black shadow-lg shadow-indigo-500/5'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse shrink-0" />
                  <span>AI Integrated</span>
                </button>
              </div>

              {/* Global Search Bar */}
              <div className="relative w-full md:w-60">
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter content (title, tag, status)..."
                  className="w-full pl-10 pr-9 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Center status and time */}
              <div className="hidden xl:flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300 font-bold">{liveTime || 'LOADING...'}</span>
                </div>
                <div className="flex items-center gap-2 border-r border-slate-800 pr-5">
                  <Wifi className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400">Node Status: <strong className="text-emerald-400 font-bold">ONLINE</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400">Active Registry: <strong className="text-white font-bold">{plans.length} items</strong></span>
                </div>
              </div>

              {/* Operator details & Logout */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActiveMainTab('profile');
                    addLog('System Navigation: Switched workspace to [Profile Settings] via Header Shortcut', 'info');
                  }}
                  className="bg-slate-850 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2 text-left cursor-pointer transition-colors"
                  title="Configure Operator Profile Settings"
                >
                  <div className="shrink-0 w-6 h-6 rounded-full border border-indigo-500/30 overflow-hidden bg-slate-900 flex items-center justify-center">
                    {userProfileImage ? (
                      <img src={userProfileImage} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-[9px] text-slate-500 font-mono font-bold leading-none uppercase">{userProfileTitle}</p>
                      <span className={`text-[8px] font-mono font-bold px-1 rounded uppercase ${
                        currentUserPermission === 'administrator'
                          ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/50'
                          : currentUserPermission === 'editor' 
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40' 
                            : 'bg-amber-950/60 text-amber-400 border border-amber-900/40'
                      }`}>
                        {currentUserPermission}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-bold leading-tight">{currentUser}</p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/30 hover:border-rose-800/80 text-rose-300 rounded-lg p-2.5 transition-all text-xs flex items-center gap-1.5 cursor-pointer font-semibold shadow-md"
                  title="Log out of Secure Session"
                >
                  <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
                </button>
              </div>

            </header>

            {/* Incoming Admin Dispatches Banner Alert */}
            {adminMessages.length > 0 && (
              <div className="space-y-2 mb-3">
                {adminMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r-xl flex items-start justify-between gap-3 shadow-lg backdrop-blur-md"
                  >
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold font-mono text-yellow-400 uppercase tracking-wide block mb-0.5">
                          Direct Dispatch from Administrator ({msg.sender}):
                        </span>
                        <p className="text-slate-200 leading-relaxed font-sans">{msg.text}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismissAdminMessage(msg.id)}
                      className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
                      title="Dismiss Dispatch"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Main Tab Navigation Menu */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-2 rounded-2xl flex flex-wrap justify-center sm:justify-start gap-2 shadow-lg z-10">
              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMainTab('home');
                  addLog('System Navigation: Switched workspace to [Home Control]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'home'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
                {activeMainTab === 'home' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMainTab('planner');
                  addLog('System Navigation: Switched workspace to [Content Planner]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'planner'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>Content Planner</span>
                {activeMainTab === 'planner' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMainTab('writer');
                  addLog('System Navigation: Switched workspace to [Content & Document Writer]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'writer'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Content Writer</span>
                {activeMainTab === 'writer' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMainTab('client');
                  addLog('System Navigation: Switched workspace to [Client Hub]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'client'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Client Hub</span>
                {activeMainTab === 'client' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMainTab('assistant');
                  addLog('System Navigation: Switched workspace to [Swanaya Assist]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'assistant'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>AI Assist</span>
                {activeMainTab === 'assistant' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMainTab('faq');
                  addLog('System Navigation: Switched workspace to [FAQ & Experiences]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'faq'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <span>FAQ & Reviews</span>
                {activeMainTab === 'faq' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05, translateY: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMainTab('profile');
                  addLog('System Navigation: Switched workspace to [Profile Settings]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile Settings</span>
                {activeMainTab === 'profile' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>

              {(currentUser?.toLowerCase() === 'aadithyan' || currentUser?.toLowerCase() === 'each') && (
                <motion.button
                  whileHover={{ scale: 1.05, translateY: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setActiveMainTab('admin');
                    addLog('System Navigation: Switched workspace to [Admin Console]', 'info');
                  }}
                  className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeMainTab === 'admin'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-yellow-500" />
                  <span>Admin Console</span>
                  {activeMainTab === 'admin' && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              )}
            </div>

            {/* Main Interactive Tab Views with motion animations */}
            <main className="flex-grow flex flex-col justify-stretch min-h-[450px]">
              <AnimatePresence mode="wait">
                {activeMainTab === 'home' && (
                  <motion.div
                    key="home-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <Home
                      plans={plans}
                      onAddPlan={handleAddPlan}
                      setActiveMainTab={setActiveMainTab}
                      addLog={addLog}
                      currentUser={currentUser || "aadithyan"}
                      uiMode={uiMode}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'planner' && (
                  <motion.div
                    key="planner-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <ContentPlanner 
                      plans={plans} 
                      onAddPlan={handleAddPlan} 
                      onUpdatePlanStatus={handleUpdatePlanStatus} 
                      onUpdatePlan={handleUpdatePlan}
                      currentUser={currentUser || "aadithyan"}
                      permissionLevel={currentUserPermission}
                      onDeletePlan={handleDeletePlan} 
                      addLog={addLog} 
                      searchQuery={searchQuery}
                      uiMode={uiMode}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'writer' && (
                  <motion.div
                    key="writer-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <ContentWriter 
                      currentUser={currentUser || 'each'}
                      addLog={addLog}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'admin' && (
                  <motion.div
                    key="admin-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <AdminActivityLog 
                      logs={logs} 
                      onClearLogs={handleClearLogs} 
                      currentUser={currentUser || ''} 
                      addLog={addLog}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'assistant' && (
                  <motion.div
                    key="assistant-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <AssistantWidget addLog={addLog} />
                  </motion.div>
                )}

                {activeMainTab === 'client' && (
                  <motion.div
                    key="client-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <ClientHub 
                      currentUser={currentUser || ''} 
                      addLog={addLog}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'profile' && (
                  <motion.div
                    key="profile-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <ProfileSettings 
                      currentUser={currentUser || ''} 
                      addLog={addLog} 
                      onProfileUpdate={loadCurrentUserProfile}
                      setActiveMainTab={setActiveMainTab}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'faq' && (
                  <motion.div
                    key="faq-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <FaqExperiences 
                      currentUser={currentUser || ''} 
                      addLog={addLog}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

          </div>
        )}

      </div>

      {/* Globally Active AI and Secure Messenger Popups Floating Hub */}
      <PopupHub addLog={addLog} />

    </div>
  );
}
