import React, { useState, useEffect } from 'react';
import { 
  LogOut, Monitor, UserCheck, ShieldCheck, Cpu, HardDrive, HelpCircle, 
  Clock, Zap, CheckCircle, Wifi, Database, Info, Sparkles, Film, Calendar, MessageSquare,
  Home as HomeIcon, User, Search, X, Users, FileText, Bell, AlertTriangle, Share2, Send, Lock, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentPlan, ContentDocument, ActivityLog } from './types';
import Background3D from './components/Background3D';
import LoginModule from './components/LoginModule';
import InteractiveLanding from './components/InteractiveLanding';
import ContentPlanner from './components/ContentPlanner';
import AssistantWidget from './components/AssistantWidget';
import Home from './components/Home';
import ProfileSettings from './components/ProfileSettings';
import RealTimeTicker from './components/RealTimeTicker';
import PopupHub from './components/PopupHub';
import AiTodo from './components/AiTodo';
import AdminActivityLog from './components/AdminActivityLog';
import ContentWriter from './components/ContentWriter';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [liveTime, setLiveTime] = useState<string>('');
  const [activeMainTab, setActiveMainTab] = useState<'home' | 'planner' | 'writer' | 'admin' | 'assistant' | 'profile' | 'client' | 'tasks' | 'collaborate' | 'notifications'>('home');
  const [landingView, setLandingView] = useState<'landing' | 'login'>('landing');
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userProfileTitle, setUserProfileTitle] = useState<string>('Content Creator');
  const [currentUserPermission, setCurrentUserPermission] = useState<'viewer' | 'editor' | 'administrator'>('editor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uiMode, setUiMode] = useState<'human' | 'ai'>(() => {
    return (localStorage.getItem('swanaya_ui_mode') as 'human' | 'ai') || 'ai';
  });

  // Demo session states
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [demoExpiresAt, setDemoExpiresAt] = useState<string | null>(null);
  const [demoTimeLeft, setDemoTimeLeft] = useState<string>('');
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  // Collaboration Chat / Feed state
  const [collabMessages, setCollabMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_collab_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'c1', sender: 'System Node', text: 'Secure multi-user collaborative workspace channel established. Speak with content makers or administration.', timestamp: '10:15 AM', role: 'System' },
      { id: 'c2', sender: 'creator', text: 'Just finished drafting the Instagram promotional reel. Feel free to review it inside the planner!', timestamp: '10:30 AM', role: 'Content Maker' },
      { id: 'c3', sender: 'client', text: 'Approved! The brand copy aligns beautifully with our campaign goals.', timestamp: '10:45 AM', role: 'Client Stakeholder' }
    ];
  });

  // Notification center state
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 'n1', title: 'Interactive Multi-User Ticker Online', message: 'Workspace collaboration session synced. Check active online operators in real-time.', time: 'Just Now', type: 'info', unread: true },
      { id: 'n2', title: 'Content Entry Modified', message: 'Campaign operator synchronized draft status to [In Progress].', time: '20m ago', type: 'success', unread: true },
      { id: 'n3', title: '72-Hour Expiration Node Safe', message: 'Demo creator restrictions applied to campaign directory. All edits are local simulations.', time: '1h ago', type: 'warning', unread: true },
    ];
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

      const isSystemAdmin = currentUser.toLowerCase() === 'aadithyan';
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
      let localIsDemo = false;
      let localExpiresAt: string | null = null;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const found = parsed.find((u: any) => u.username === currentUser || u.username.toLowerCase() === currentUser.toLowerCase());
          if (found) {
            if (found.permissionLevel) {
              foundPerm = found.permissionLevel;
            }
            if (found.isDemo) {
              localIsDemo = true;
              localExpiresAt = found.demoExpiresAt || null;
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setCurrentUserPermission(foundPerm);
      setIsDemoUser(localIsDemo);
      setDemoExpiresAt(localExpiresAt);

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
          }
          if (data.isDemo !== undefined) {
            setIsDemoUser(data.isDemo);
            setDemoExpiresAt(data.demoExpiresAt || null);
          }
          // Sync back to local storage list
          if (saved) {
            const parsed = JSON.parse(saved);
            const updated = parsed.map((u: any) => 
              u.username.toLowerCase() === currentUser.toLowerCase() 
                ? { ...u, permissionLevel: data.permissionLevel, isDemo: data.isDemo, demoExpiresAt: data.demoExpiresAt } 
                : u
            );
            localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
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

  // Demo expiry timer logic
  useEffect(() => {
    if (!isDemoUser || !demoExpiresAt) {
      setDemoTimeLeft('');
      return;
    }

    const checkExpiry = () => {
      const diff = new Date(demoExpiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setDemoTimeLeft('EXPIRED');
        addLog('Demo Warning: Trial period has fully expired. Operator session terminated.', 'warning');
        handleLogout();
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setDemoTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [isDemoUser, demoExpiresAt]);

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
             text: 'Security: Credentials initialized for system administrator "aadithyan"',
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
  const handleLogout = async () => {
    try {
      const { auth } = await import('./lib/firebase');
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (e) {
      console.warn('Google logout failed or skipped:', e);
    }
    if (currentUser) {
      addLog(`Security: Active session destroyed for operator "${currentUser}"`, 'warning');
    }
    setCurrentUser(null);
    localStorage.removeItem('swanaya_current_user');
    setLandingView('landing');
  };

  // 7. Planner handlers with DB sync
  const handleAddPlan = async (newPlan: Omit<ContentPlan, 'id' | 'createdAt'>) => {
    if (isDemoUser && plans.length >= 3) {
      setLimitWarning('Demo Account Limit Reached: Demo trial accounts are restricted to a maximum of 3 scheduled content plans in the directory. Upgrading to full partner operator credentials unlocks unrestricted workspace entries.');
      addLog('Demo Warning: Blocked campaign scheduling attempt due to 3-plan trial limit.', 'warning');
      return;
    }

    const tempId = `p_${Date.now()}`;
    const plan: ContentPlan = {
      ...newPlan,
      createdBy: newPlan.createdBy || currentUser || 'aadithyan',
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
                <p className="text-[9px] text-indigo-400 font-bold tracking-wider uppercase">LAST UPDATED ON 10:00 PM 20/07/2026 MONDAY</p>
              </div>
            </div>
          )
        ) : (
          
          /* ==========================================
             LOGGED IN STATE: Dashboard Workspace
             ========================================== */
          <div className="flex flex-col gap-6 py-6 flex-grow">
            
            {/* Header / Navigation bar */}
            <header className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl z-10 shadow-indigo-950/10">
              
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
              <div className="hidden xl:flex items-center gap-5 text-xs font-mono">
                <div className="flex items-center gap-2 border-r border-slate-800 pr-4">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-300 font-bold">{liveTime || 'LOADING...'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-[11px] font-mono shadow-sm">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Isolated Workspace: <strong className="text-white font-bold">@{currentUser || 'Guest'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400">Workspace Plans: <strong className="text-white font-bold">{
                    plans.filter(p => !p.createdBy || p.createdBy.toLowerCase() === (currentUser?.toLowerCase() || '') || currentUser === 'aadithyan' || currentUser === 'administrator').length
                  } items</strong></span>
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

            {/* Active Demo Session Trial Countdown Alert */}
            {isDemoUser && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 border-l-4 border-amber-500 p-3.5 rounded-r-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 shadow-lg backdrop-blur-md mb-3"
              >
                <div className="flex items-start gap-2.5 text-left">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-xs">
                    <span className="font-bold font-mono text-amber-400 uppercase tracking-wider block mb-0.5">
                      ⚠️ Active Trial Demo Mode Node
                    </span>
                    <p className="text-slate-300 leading-relaxed font-sans">
                      This operator credentials session has been pre-seeded for trial validation. A strict 72-hour automated destruction countdown is active.
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 bg-amber-950/60 border border-amber-900/40 px-3 py-1.5 rounded-lg font-mono text-xs text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>DESTRUCTION COUNTDOWN:</span>
                  <strong className="font-black text-white">{demoTimeLeft || '72h 00m 00s'}</strong>
                </div>
              </motion.div>
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
                  addLog('System Navigation: Switched workspace to [Content Writer]', 'info');
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
              {(currentUser?.toLowerCase() === 'aadithyan' || currentUserPermission === 'administrator' || currentUserPermission === 'editor') && (
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
                  setActiveMainTab('collaborate');
                  addLog('System Navigation: Switched workspace to [Collaborative Feed]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'collaborate'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Network className="w-4 h-4 text-emerald-400" />
                <span>Collaborate</span>
                {activeMainTab === 'collaborate' && (
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
                  setActiveMainTab('notifications');
                  // Mark all as read
                  setUnreadNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                  localStorage.setItem('swanaya_notifications', JSON.stringify(unreadNotifications.map(n => ({ ...n, unread: false }))));
                  addLog('System Navigation: Switched workspace to [Notification Center]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'notifications'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="relative">
                  <Bell className="w-4 h-4 text-amber-400" />
                  {unreadNotifications.some(n => n.unread) && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </div>
                <span>Notifications</span>
                {unreadNotifications.some(n => n.unread) && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold leading-none shrink-0 scale-90">
                    {unreadNotifications.filter(n => n.unread).length}
                  </span>
                )}
                {activeMainTab === 'notifications' && (
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
                  setActiveMainTab('tasks');
                  addLog('System Navigation: Switched workspace to [Task Manager Hub]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'tasks'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Task Manager Hub</span>
                {activeMainTab === 'tasks' && (
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
                      currentUserPermission={currentUserPermission}
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
                      currentUser={currentUser || ''}
                      addLog={addLog}
                      isDemoUser={isDemoUser}
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

                {activeMainTab === 'tasks' && (
                  <motion.div
                    key="tasks-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <AiTodo 
                      onAddPlan={handleAddPlan}
                      setActiveMainTab={setActiveMainTab}
                      addLog={addLog}
                      currentUser={currentUser || ''}
                      uiMode={uiMode}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'collaborate' && (
                  <motion.div
                    key="collaborate-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex-grow flex flex-col md:flex-row gap-6">
                      {/* Left: Online team members */}
                      <div className="w-full md:w-64 shrink-0 bg-slate-950/60 border border-slate-850 rounded-xl p-4 flex flex-col gap-4">
                        <div>
                          <h3 className="text-xs font-black font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active Workspace Nodes
                          </h3>
                          <p className="text-[10px] text-slate-500 leading-relaxed font-sans text-left">
                            These operators are currently connected to the secure collaborative Swanaya Campaign workspace.
                          </p>
                        </div>

                        <div className="space-y-2 flex-grow overflow-y-auto max-h-[220px] md:max-h-none">
                          {[
                            { name: 'aadithyan', role: 'System Owner', avatar: null, status: 'online' },
                            { name: 'creator', role: 'Content Maker', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150', status: 'online' },
                            { name: 'client', role: 'Stakeholder', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150', status: 'online' },
                            { name: currentUser, role: 'Active Operator', avatar: userProfileImage, status: 'online' }
                          ].map((member, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-900/30 border border-slate-850/50 rounded-lg hover:border-indigo-500/30 transition-all">
                              <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden border border-indigo-500/20 bg-slate-950 flex items-center justify-center">
                                {member.avatar ? (
                                  <img src={member.avatar} alt={member.name || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  <User className="w-4 h-4 text-indigo-400" />
                                )}
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
                              </div>
                              <div className="text-left overflow-hidden">
                                <p className="text-[11px] font-bold text-slate-200 truncate font-mono">{member.name}</p>
                                <p className="text-[9px] text-slate-500 uppercase truncate">{member.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Real-time Collaboration Feed Chat */}
                      <div className="flex-grow flex flex-col bg-slate-950/40 border border-slate-850 rounded-xl p-4" style={{ minHeight: '380px' }}>
                        <div className="border-b border-slate-850 pb-3 mb-4 flex justify-between items-center">
                          <div className="text-left">
                            <h2 className="text-sm font-black font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                              <Network className="w-4 h-4 text-emerald-400" />
                              Collaborate to Work Feed
                            </h2>
                            <p className="text-[10px] text-slate-500 font-sans">
                              Transmit secure project feedback, planner coordination, and production requests.
                            </p>
                          </div>
                          {isDemoUser && (
                            <span className="bg-amber-950/60 border border-amber-900/40 text-amber-400 font-mono text-[9px] py-1 px-2.5 rounded-full uppercase tracking-wider">
                              Demo Account
                            </span>
                          )}
                        </div>

                        {/* Messages display */}
                        <div className="flex-grow space-y-3.5 overflow-y-auto mb-4 pr-1 text-left max-h-[300px]">
                          {collabMessages.map((msg: any) => (
                            <div key={msg.id} className="flex gap-3 items-start">
                              <div className="shrink-0 w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs text-indigo-400 font-black uppercase">
                                {msg.sender ? msg.sender[0] : 'O'}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-[11px] font-bold text-indigo-300 font-mono">{msg.sender}</span>
                                  <span className="text-[9px] text-slate-500 font-mono">{msg.timestamp}</span>
                                  <span className="text-[8px] font-mono px-1 bg-slate-900 border border-slate-850 text-slate-400 uppercase rounded">{msg.role}</span>
                                </div>
                                <p className="text-xs text-slate-300 bg-slate-900/60 border border-slate-900 rounded-xl px-3 py-2 leading-relaxed">
                                  {msg.text}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Send Form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.currentTarget;
                            const input = form.elements.namedItem('chatText') as HTMLInputElement;
                            if (!input || !input.value.trim()) return;

                            if (isDemoUser && collabMessages.length >= 6) {
                              setLimitWarning('Demo Account Limit: Collaboration feed writes are restricted to 6 trial logs on demo nodes. Upgrade to full operator credentials for unlimited campaign broadcasts.');
                              addLog('Demo Warning: Blocked workspace feed transmit due to trial record limits.', 'warning');
                              return;
                            }

                            const text = input.value.trim();
                            const newMsg = {
                              id: `col_${Date.now()}`,
                              sender: currentUser || 'Anonymous',
                              text,
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              role: userProfileTitle
                            };

                            const updated = [...collabMessages, newMsg];
                            setCollabMessages(updated);
                            localStorage.setItem('swanaya_collab_messages', JSON.stringify(updated));
                            input.value = '';
                            addLog(`Collaboration: Transmitted workspace communication dispatch to node feed`, 'action');

                            // Broadcast mock system reply after 1.5 seconds for incredible feel of active online chat!
                            setTimeout(() => {
                              const replies = [
                                "Message received by main campaign node. Standing by for administrative authorization.",
                                "Understood. Synchronizing update across active YouTube & TikTok pipelines.",
                                "Approved by senior producer node. Campaign directory synced successfully."
                              ];
                              const randomReply = replies[Math.floor(Math.random() * replies.length)];
                              const mockReply = {
                                id: `col_reply_${Date.now()}`,
                                sender: 'aadithyan',
                                text: randomReply,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                role: 'System Admin'
                              };
                              const updatedWithReply = [...updated, mockReply];
                              setCollabMessages(updatedWithReply);
                              localStorage.setItem('swanaya_collab_messages', JSON.stringify(updatedWithReply));
                              addLog(`Collaboration: Received automated response from System Admin node`, 'info');
                            }, 1500);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            name="chatText"
                            type="text"
                            placeholder="Type a campaign message to transmit..."
                            required
                            className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                          />
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 transition-all text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer uppercase shrink-0"
                          >
                            Send <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeMainTab === 'notifications' && (
                  <motion.div
                    key="notifications-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex-grow flex flex-col gap-4 text-left">
                      <div className="border-b border-slate-850 pb-3 mb-2 flex justify-between items-center">
                        <div>
                          <h2 className="text-sm font-black font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                            <Bell className="w-4 h-4 text-amber-400" />
                            Notification Center
                          </h2>
                          <p className="text-[10px] text-slate-500 font-sans">
                            Real-time platform action signals, system status alerts, and campaign synchronizations.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setUnreadNotifications([]);
                            localStorage.setItem('swanaya_notifications', JSON.stringify([]));
                            addLog('Notifications: Cleared secure workspace alert feed', 'info');
                          }}
                          className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-[10px] text-slate-400 hover:text-white font-mono px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          Clear All Alerts
                        </button>
                      </div>

                      <div className="space-y-2.5 overflow-y-auto max-h-[380px]">
                        {unreadNotifications.length === 0 ? (
                          <div className="py-12 text-center text-slate-500 font-mono text-xs">
                            No active system notifications or alerts found. Feed is clear.
                          </div>
                        ) : (
                          unreadNotifications.map((notif: any) => (
                            <div
                              key={notif.id}
                              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                                notif.type === 'warning'
                                  ? 'bg-rose-950/10 border-rose-900/20'
                                  : notif.type === 'success'
                                  ? 'bg-emerald-950/10 border-emerald-900/20'
                                  : 'bg-slate-950/30 border-slate-850'
                              }`}
                            >
                              <div className={`p-2 rounded-lg shrink-0 ${
                                notif.type === 'warning'
                                  ? 'bg-rose-950/60 border border-rose-900/50 text-rose-400'
                                  : notif.type === 'success'
                                  ? 'bg-emerald-950/60 border border-emerald-900/50 text-emerald-400'
                                  : 'bg-indigo-950/60 border border-indigo-900/50 text-indigo-400'
                              }`}>
                                {notif.type === 'warning' ? (
                                  <AlertTriangle className="w-4 h-4" />
                                ) : notif.type === 'success' ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Info className="w-4 h-4" />
                                )}
                              </div>
                              <div className="space-y-0.5 flex-grow">
                                <div className="flex justify-between items-baseline">
                                  <h3 className="text-xs font-bold text-slate-200 font-mono">{notif.title}</h3>
                                  <span className="text-[9px] text-slate-500 font-mono">{notif.time}</span>
                                </div>
                                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{notif.message}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

          </div>
        )}

      </div>

      {/* Globally Active AI and Secure Messenger Popups Floating Hub */}
      <PopupHub addLog={addLog} />

      {/* Dynamic Limit Warning glassmorphic Modal */}
      <AnimatePresence>
        {limitWarning && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900/90 border border-slate-850 rounded-2xl max-w-md p-6 shadow-2xl relative text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black font-mono text-white uppercase tracking-wider">Demo Constraint Triggered</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {limitWarning}
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setLimitWarning(null)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2 rounded-lg transition-colors cursor-pointer uppercase tracking-wider font-bold"
                >
                  Confirm Operational Constraint
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
