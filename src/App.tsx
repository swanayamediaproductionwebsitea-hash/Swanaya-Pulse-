import React, { useState, useEffect } from 'react';
import { 
  LogOut, Monitor, UserCheck, ShieldCheck, Cpu, HardDrive, HelpCircle, 
  Clock, Zap, CheckCircle, Wifi, Database, Info, Sparkles, Film, Calendar, MessageSquare,
  Home as HomeIcon, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ContentPlan, AttendanceRecord, ActivityLog } from './types';
import Background3D from './components/Background3D';
import LoginModule from './components/LoginModule';
import InteractiveLanding from './components/InteractiveLanding';
import AttendanceTracker from './components/AttendanceTracker';
import ContentPlanner from './components/ContentPlanner';
import AdminActivityLog from './components/AdminActivityLog';
import AssistantWidget from './components/AssistantWidget';
import Home from './components/Home';
import ProfileSettings from './components/ProfileSettings';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [liveTime, setLiveTime] = useState<string>('');
  const [activeMainTab, setActiveMainTab] = useState<'home' | 'planner' | 'attendance' | 'security' | 'assistant' | 'profile'>('home');
  const [landingView, setLandingView] = useState<'landing' | 'login'>('landing');
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [userProfileImage, setUserProfileImage] = useState<string | null>(null);
  const [userProfileTitle, setUserProfileTitle] = useState<string>('Content Creator');

  // Load current user's profile image & title
  const loadCurrentUserProfile = () => {
    if (currentUser) {
      const cachedImg = localStorage.getItem(`swanaya_profile_image_${currentUser}`);
      const cachedTitle = localStorage.getItem(`swanaya_profile_title_${currentUser}`);
      setUserProfileImage(cachedImg || null);
      setUserProfileTitle(cachedTitle || 'Content Creator');
    } else {
      setUserProfileImage(null);
      setUserProfileTitle('Content Creator');
    }
  };

  useEffect(() => {
    loadCurrentUserProfile();
  }, [currentUser]);

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

  // 2. Initialize and load states from localStorage
  useEffect(() => {
    // Check if user has active session
    const activeSession = localStorage.getItem('swanaya_current_user');
    if (activeSession) {
      setCurrentUser(activeSession);
    }

    // Load plans from localStorage or load beautiful initial seed data
    const savedPlans = localStorage.getItem('swanaya_content_plans');
    if (savedPlans) {
       try {
         setPlans(JSON.parse(savedPlans));
       } catch (e) {
         console.error('Error parsing content plans', e);
       }
    } else {
       const seedPlans: ContentPlan[] = [];
       setPlans(seedPlans);
       localStorage.setItem('swanaya_content_plans', JSON.stringify(seedPlans));
    }

    // Load attendance records or load initial seed records
    const savedAttendance = localStorage.getItem('swanaya_attendance');
    if (savedAttendance) {
       try {
         setAttendanceRecords(JSON.parse(savedAttendance));
       } catch (e) {
         console.error('Error parsing attendance', e);
       }
    } else {
       const seedAttendance: AttendanceRecord[] = [];
       setAttendanceRecords(seedAttendance);
       localStorage.setItem('swanaya_attendance', JSON.stringify(seedAttendance));
    }

    // Load activity logs or set initial logs
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
           text: 'Security: Credentials initialized for root administrator "each"',
           timestamp: '07:38:20',
           type: 'success'
         }
       ];
       setLogs(seedLogs);
       localStorage.setItem('swanaya_activity_logs', JSON.stringify(seedLogs));
    }
  }, []);

  // 3. Logger utility
  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => {
    const newLog: ActivityLog = {
      id: `l_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text,
      timestamp: new Date().toLocaleTimeString(),
      type
    };
    setLogs((prev) => {
      const updated = [newLog, ...prev].slice(0, 100); // keep last 100 logs
      localStorage.setItem('swanaya_activity_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // 4. Authentication success handler
  const handleLoginSuccess = (username: string) => {
    setCurrentUser(username);
    localStorage.setItem('swanaya_current_user', username);
    localStorage.setItem('swanaya_has_logged_in', 'true');
    addLog(`Security: Authorized session created for operator "${username}"`, 'success');
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

  // 6. Attendance handlers
  const handleAddAttendance = (day: number, type: 'check_in' | 'check_out', notes: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const dateTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newRec: AttendanceRecord = {
      id: `a_${Date.now()}`,
      day,
      type,
      timestamp,
      dateTime,
      notes,
      username: currentUser || 'Unknown Operator'
    };

    const updated = [...attendanceRecords, newRec];
    setAttendanceRecords(updated);
    localStorage.setItem('swanaya_attendance', JSON.stringify(updated));
    
    addLog(`User Action: ${currentUser} registered ${type.toUpperCase()} log for Calendar Day ${day}`, 'action');
  };

  const handleClearAttendance = () => {
    if (window.confirm('Are you sure you want to reset the entire attendance logs?')) {
      setAttendanceRecords([]);
      localStorage.removeItem('swanaya_attendance');
      addLog('System Database: Reset attendance node logs successfully', 'warning');
    }
  };

  // 7. Planner handlers
  const handleAddPlan = (newPlan: Omit<ContentPlan, 'id' | 'createdAt'>) => {
    const plan: ContentPlan = {
      ...newPlan,
      createdBy: newPlan.createdBy || currentUser || 'each',
      id: `p_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updated = [plan, ...plans];
    setPlans(updated);
    localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
    addLog(`User Action: Scheduled new campaign plan "${plan.title}" under ${plan.month} Day ${plan.day}`, 'action');
  };

  const handleUpdatePlanStatus = (id: string, status: ContentPlan['status']) => {
    const updated = plans.map(p => {
      if (p.id === id) {
        addLog(`User Action: Updated plan "${p.title}" state matrix to [${status}]`, 'info');
        return { ...p, status };
      }
      return p;
    });
    setPlans(updated);
    localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
  };

  const handleUpdatePlan = (updatedPlan: ContentPlan) => {
    const updated = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(updated);
    localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
    addLog(`User Action: Updated Campaign Details for plan "${updatedPlan.title}"`, 'info');
  };

  const handleDeletePlan = (id: string) => {
    const matched = plans.find(p => p.id === id);
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    localStorage.setItem('swanaya_content_plans', JSON.stringify(updated));
    if (matched) {
      addLog(`User Action: Deleted content plan "${matched.title}" from registry`, 'warning');
    }
  };

  const handleClearLogs = () => {
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
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-slate-100 font-sans selection:bg-indigo-500/35 selection:text-white pb-0">
      
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

              <div className="text-center text-[11px] text-slate-600 font-mono mt-8">
                SWANAYA ENTERPRISES SECURE PORTAL © 2026 • WORKSPACE NODE ONLINE
              </div>
            </div>
          )
        ) : (
          
          /* ==========================================
             LOGGED IN STATE: Dashboard Workspace
             ========================================== */
          <div className="flex flex-col gap-6 py-6 flex-grow">
            
            {/* Header / Navigation bar */}
            <header className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl z-10">
              
              {/* Branding and status */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 text-lg">
                  S
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold uppercase tracking-tight text-white font-display">
                      Swanaya Media Enterprises
                    </h1>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">CUSTOM CONTENT PLANNER PRO</p>
                </div>
              </div>

              {/* Center status and time */}
              <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
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
                    <p className="text-[9px] text-slate-500 font-mono font-bold leading-none uppercase">{userProfileTitle}</p>
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

            {/* Main Tab Navigation Menu */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 p-2 rounded-2xl flex flex-wrap justify-center sm:justify-start gap-2 shadow-lg z-10">
              <button
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
              </button>
              <button
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
              </button>
              <button
                onClick={() => {
                  setActiveMainTab('attendance');
                  addLog('System Navigation: Switched workspace to [Attendance Tracker]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'attendance'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Attendance Tracker</span>
                {activeMainTab === 'attendance' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => {
                  setActiveMainTab('security');
                  addLog('System Navigation: Switched workspace to [Admin Console]', 'info');
                }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeMainTab === 'security'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{currentUser.toLowerCase() === 'aadithyan' || currentUser.toLowerCase() === 'each' ? 'Admin Console' : 'Security Logs'}</span>
                {activeMainTab === 'security' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-[2px] left-4 right-4 h-[2px] bg-indigo-400 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              <button
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
              </button>
              <button
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
              </button>
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
                      onDeletePlan={handleDeletePlan} 
                      addLog={addLog} 
                    />
                  </motion.div>
                )}

                {activeMainTab === 'attendance' && (
                  <motion.div
                    key="attendance-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <AttendanceTracker 
                      records={attendanceRecords} 
                      onAddRecord={handleAddAttendance} 
                      onClearRecords={handleClearAttendance} 
                      currentUser={currentUser || ''}
                    />
                  </motion.div>
                )}

                {activeMainTab === 'security' && (
                  <motion.div
                    key="security-tab"
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.99 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="w-full h-full flex flex-col"
                  >
                    <AdminActivityLog 
                      logs={logs} 
                      onClearLogs={handleClearLogs} 
                      currentUser={currentUser} 
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
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

          </div>
        )}

      </div>

    </div>
  );
}
