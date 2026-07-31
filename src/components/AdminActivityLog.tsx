import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, Trash2, User, Key, Search, FileDown, UserPlus, LogIn, Sparkles, 
  ExternalLink, Lock, Wrench, AlertTriangle, Power, ShieldAlert, Clock, Calendar, CheckCircle2, AlertCircle,
  Mail, Phone, Send, MessageSquare, Check, Filter, Tag, Copy, Globe, RefreshCw
} from 'lucide-react';
import { ActivityLog } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';

interface AdminActivityLogProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
  currentUser: string;
  addLog: (msg: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload' | 'error') => void;
  onLogout?: () => void;
  onActivatePortal?: (portalType: 'login' | 'register_standard' | 'register_demo') => void;
}

export default function AdminActivityLog({ logs, onClearLogs, currentUser, addLog, onLogout, onActivatePortal }: AdminActivityLogProps) {
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_registered_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  // Maintenance & Duration Lock State
  const [maintConfig, setMaintConfig] = useState(() => {
    const saved = localStorage.getItem('swanaya_maintenance_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      isMaintenanceActive: false,
      lockedPortals: 'both' as 'both' | 'registration' | 'login',
      maintenanceReason: 'Scheduled System Maintenance & Security Audit in Progress. Portals are temporarily restricted.',
      durationLockUntil: '2026-08-14T00:00:00',
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser || 'aadithyan'
    };
  });

  const saveMaintConfig = (updated: typeof maintConfig) => {
    setMaintConfig(updated);
    localStorage.setItem('swanaya_maintenance_config', JSON.stringify(updated));
    // Dispatch a custom window event so other components (or tabs) update immediately
    window.dispatchEvent(new Event('swanaya_maintenance_updated'));
  };

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return;
    const msg = {
      id: `msg_${Date.now()}`,
      sender: currentUser,
      text: broadcastMessage,
      recipient: 'all',
      timestamp: new Date().toISOString()
    };
    const saved = localStorage.getItem('swanaya_user_messages');
    const allMsgs = saved ? JSON.parse(saved) : [];
    allMsgs.push(msg);
    localStorage.setItem('swanaya_user_messages', JSON.stringify(allMsgs));
    addLog(`Admin: Broadcasted public address message to all operators.`, 'info');
    setBroadcastMessage('');
    alert('Public address broadcasted to all operators.');
  };

  const handleResetPassword = (username: string) => {
    const tempPass = Math.random().toString(36).slice(-8);
    setUsers(prev => {
      const updated = prev.map(u => u.username === username ? { ...u, password: tempPass } : u);
      localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
      return updated;
    });
    addLog(`Admin: Reset password for ${username}. New temporary password is ${tempPass}`, 'warning');
    alert(`Temporary password for ${username} is: ${tempPass}`);
  };

  const handleUpdatePermission = (username: string, newPermission: 'viewer' | 'editor' | 'administrator') => {
    setUsers(prev => {
      const updated = prev.map(u => u.username === username ? { ...u, permissionLevel: newPermission } : u);
      localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
      return updated;
    });
    addLog(`Admin: Updated permissions for ${username} to [${newPermission.toUpperCase()}]`, 'info');
  };

  const [logins, setLogins] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_workspace_logins');
    return saved ? JSON.parse(saved) : [];
  });

  // 📥 INBOUND CONSULTATION REQUESTS DESK STATE & SYNC
  const [consultations, setConsultations] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_consultation_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'consult_sample_1',
        clientName: 'Rahul Sharma',
        clientEmail: 'rahul.sharma@apexresorts.com',
        clientPhone: '+91 98765 43210',
        service: 'Digital Marketing',
        message: 'Looking for Meta & Google Ads growth strategy for luxury resort chains in Kerala.',
        status: 'NEW',
        createdAt: new Date().toISOString(),
        timestampFormatted: new Date().toLocaleString()
      },
      {
        id: 'consult_sample_2',
        clientName: 'Dr. Ananya Nair',
        clientEmail: 'ananya@horizonacademy.edu',
        clientPhone: '+91 94471 22334',
        service: 'Website Development',
        message: 'Need a high-performance React web portal and institutional branding package.',
        status: 'IN_REVIEW',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        timestampFormatted: new Date(Date.now() - 3600000 * 4).toLocaleString()
      }
    ];
  });

  const [consultationSearch, setConsultationSearch] = useState('');
  const [consultationFilter, setConsultationFilter] = useState<'ALL' | 'NEW' | 'IN_REVIEW' | 'CONTACTED' | 'COMPLETED'>('ALL');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);

  // Sync consultations from local storage and Firestore
  useEffect(() => {
    const syncConsultations = async () => {
      const saved = localStorage.getItem('swanaya_consultation_requests');
      let localReqs = saved ? JSON.parse(saved) : [];

      try {
        if (db) {
          const snapshot = await getDocs(collection(db, 'consultation_requests'));
          const cloudReqs: any[] = [];
          snapshot.forEach(docSnap => {
            cloudReqs.push({ id: docSnap.id, ...docSnap.data() });
          });

          if (cloudReqs.length > 0) {
            const reqMap = new Map();
            localReqs.forEach((r: any) => reqMap.set(r.id, r));
            cloudReqs.forEach((r: any) => reqMap.set(r.id, r));
            const merged = Array.from(reqMap.values()).sort(
              (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            localReqs = merged;
            localStorage.setItem('swanaya_consultation_requests', JSON.stringify(merged));
          }
        }
      } catch (err) {
        // Fallback to local
      }

      setConsultations(localReqs);
    };

    syncConsultations();

    const handleUpdate = () => syncConsultations();
    window.addEventListener('swanaya_consultations_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('swanaya_consultations_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleUpdateConsultationStatus = async (id: string, newStatus: string) => {
    const updatedList = consultations.map(c => c.id === id ? { ...c, status: newStatus } : c);
    setConsultations(updatedList);
    localStorage.setItem('swanaya_consultation_requests', JSON.stringify(updatedList));

    try {
      if (db) {
        await updateDoc(doc(db, 'consultation_requests', id), { status: newStatus });
      }
    } catch (err) {
      console.warn('Firestore update failed or offline', err);
    }

    addLog(`Admin: Updated consultation request status to [${newStatus}] for request ID: ${id}`, 'info');
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this consultation request record?')) return;
    const updatedList = consultations.filter(c => c.id !== id);
    setConsultations(updatedList);
    localStorage.setItem('swanaya_consultation_requests', JSON.stringify(updatedList));

    try {
      if (db) {
        await deleteDoc(doc(db, 'consultation_requests', id));
      }
    } catch (err) {
      console.warn('Firestore delete failed or offline', err);
    }

    addLog(`Admin: Deleted consultation request record ID: ${id}`, 'warning');
  };

  const exportConsultationsCSV = () => {
    let csv = 'ID,Client Name,Email,Phone,Requested Service,Message,Status,Created At\n';
    consultations.forEach(c => {
      csv += `"${c.id}","${c.clientName}","${c.clientEmail}","${c.clientPhone}","${c.service}","${(c.message || '').replace(/"/g, '""')}","${c.status}","${c.createdAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swanaya_consultation_requests_${Date.now()}.csv`;
    a.click();
    addLog('Admin: Exported consultation requests report to CSV', 'success');
  };
  
  const exportToExcelFormat = () => {
    let csv = 'Username,Email,Permission Level,Temporary Password\n';
    users.forEach(u => {
      csv += `${u.username},${u.email || ''},${u.permissionLevel || 'editor'},${u.password || ''}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users_passwords_export.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-500" />
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">System Security & Admin Console</h2>
              <p className="text-xs text-slate-400">Manage operators, telemetry, and security protocols.</p>
            </div>
          </div>
        </div>

        {/* MAINTENANCE MODE & PORTAL DURATION LOCK BANNER */}
        <div className={`p-5 rounded-2xl border shadow-2xl mb-6 transition-all duration-300 ${
          maintConfig.isMaintenanceActive 
            ? 'bg-rose-950/70 border-rose-500/60 shadow-rose-950/50' 
            : 'bg-slate-950/90 border-slate-800'
        }`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl border shrink-0 ${
                maintConfig.isMaintenanceActive 
                  ? 'bg-rose-600/30 text-rose-400 border-rose-500/50 animate-pulse' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {maintConfig.isMaintenanceActive ? <Wrench className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                    System Maintenance Mode & Portal Duration Lock
                  </h3>
                  {maintConfig.isMaintenanceActive ? (
                    <span className="bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5 animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-400" /> MAINTENANCE ACTIVE
                    </span>
                  ) : (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ALL PORTALS OPERATIONAL
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Lock both Registration and Login Portals under system maintenance mode or set a duration lock.
                </p>
              </div>
            </div>

            {/* Power Toggle Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextActive = !maintConfig.isMaintenanceActive;
                  const newConfig = {
                    ...maintConfig,
                    isMaintenanceActive: nextActive,
                    updatedAt: new Date().toISOString(),
                    updatedBy: currentUser || 'aadithyan'
                  };
                  saveMaintConfig(newConfig);
                  addLog(
                    nextActive 
                      ? `Admin: ENABLED System Maintenance Mode on [${maintConfig.lockedPortals.toUpperCase()}] portals.` 
                      : `Admin: DISARMED System Maintenance Mode. Portals restored to normal operation.`, 
                    nextActive ? 'warning' : 'success'
                  );
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg border ${
                  maintConfig.isMaintenanceActive 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 shadow-rose-900/40' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-indigo-900/40'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{maintConfig.isMaintenanceActive ? 'Disarm Maintenance Mode' : 'Activate Maintenance Mode'}</span>
              </button>
            </div>
          </div>

          {/* Configuration Settings Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Target Portals Selector */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Target Portals to Lock
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...maintConfig, lockedPortals: 'both' as const };
                    saveMaintConfig(updated);
                    addLog('Admin Maintenance: Updated locked target to [BOTH PORTALS]', 'info');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer text-center border ${
                    maintConfig.lockedPortals === 'both'
                      ? 'bg-rose-600/20 text-rose-300 border-rose-500/60 font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  🔒 Both
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...maintConfig, lockedPortals: 'registration' as const };
                    saveMaintConfig(updated);
                    addLog('Admin Maintenance: Updated locked target to [REGISTRATION PORTAL ONLY]', 'info');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer text-center border ${
                    maintConfig.lockedPortals === 'registration'
                      ? 'bg-amber-600/20 text-amber-300 border-amber-500/60 font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  📝 Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...maintConfig, lockedPortals: 'login' as const };
                    saveMaintConfig(updated);
                    addLog('Admin Maintenance: Updated locked target to [LOGIN PORTAL ONLY]', 'info');
                  }}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer text-center border ${
                    maintConfig.lockedPortals === 'login'
                      ? 'bg-blue-600/20 text-blue-300 border-blue-500/60 font-black'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  🔑 Login
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Current lock scope: <strong className="text-slate-300 uppercase">{maintConfig.lockedPortals}</strong>
              </p>
            </div>

            {/* 2. Duration Lock Presets */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
              <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Duration Lock Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
                    const updated = { ...maintConfig, durationLockUntil: until };
                    saveMaintConfig(updated);
                    addLog('Admin Maintenance: Set duration lock preset to [+1 Hour]', 'info');
                  }}
                  className="py-1 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[10px] font-mono font-bold cursor-pointer text-left flex items-center gap-1"
                >
                  ⏱️ +1 Hour
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
                    const updated = { ...maintConfig, durationLockUntil: until };
                    saveMaintConfig(updated);
                    addLog('Admin Maintenance: Set duration lock preset to [+24 Hours]', 'info');
                  }}
                  className="py-1 px-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[10px] font-mono font-bold cursor-pointer text-left flex items-center gap-1"
                >
                  ⏱️ +24 Hours
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const until = '2026-08-14T00:00:00.000Z';
                    const updated = { ...maintConfig, durationLockUntil: until };
                    saveMaintConfig(updated);
                    addLog('Admin Maintenance: Set duration lock preset to [14/08/2026 Release Date]', 'info');
                  }}
                  className="py-1 px-2 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border border-amber-800/60 rounded-lg text-[10px] font-mono font-bold cursor-pointer text-left flex items-center gap-1 col-span-2"
                >
                  📅 Lock Until 14/08/2026
                </button>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] font-mono text-slate-400">Lock Until:</span>
                <input
                  type="datetime-local"
                  value={maintConfig.durationLockUntil.slice(0, 16)}
                  onChange={(e) => {
                    const val = e.target.value ? new Date(e.target.value).toISOString() : maintConfig.durationLockUntil;
                    const updated = { ...maintConfig, durationLockUntil: val };
                    saveMaintConfig(updated);
                  }}
                  className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[10px] text-white font-mono outline-none focus:border-amber-500 w-full"
                />
              </div>
            </div>

            {/* 3. Operational Notice & Details */}
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 md:col-span-2 lg:col-span-1">
              <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Maintenance Notice to Display
              </label>
              <textarea
                value={maintConfig.maintenanceReason}
                onChange={(e) => {
                  const updated = { ...maintConfig, maintenanceReason: e.target.value };
                  saveMaintConfig(updated);
                }}
                rows={2}
                placeholder="Enter custom maintenance banner text shown to users..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-rose-500 font-sans resize-none"
              />
              <p className="text-[10px] text-slate-500">
                This notice will be rendered on the login & register screens when blocked.
              </p>
            </div>
          </div>

          {/* Active Banner Status Telemetry */}
          {maintConfig.isMaintenanceActive && (
            <div className="mt-4 bg-rose-900/30 border border-rose-500/40 rounded-xl p-3 text-rose-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-inner">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                <span>
                  <strong>LIVE MAINTENANCE LOCK ACTIVE:</strong> Locking <u className="uppercase font-bold">{maintConfig.lockedPortals}</u> portals until {new Date(maintConfig.durationLockUntil).toLocaleString()}.
                </span>
              </div>
              <span className="text-[10px] text-rose-300/80 bg-rose-950 px-2 py-0.5 rounded border border-rose-800/80 shrink-0">
                Last modified by {maintConfig.updatedBy}
              </span>
            </div>
          )}
        </div>

        {/* Portal Activation Controls */}
        <div className="bg-slate-950/90 border border-indigo-500/40 p-5 rounded-2xl shadow-2xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  Portal Activation Controls
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-sans font-bold">
                    ONLINE
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Directly activate & switch to the public Registration Portal or Login Portal from the Admin Console.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-300 bg-slate-900 px-3 py-1 rounded-lg border border-indigo-500/30 font-bold">
                ⚡ Admin Clearance
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Button 1: Activate Registration Portal */}
            <button
              type="button"
              onClick={() => {
                if (onActivatePortal) {
                  addLog('Admin: Activated Registration Portal directly from Admin Console', 'action');
                  onActivatePortal('register_standard');
                } else if (onLogout) {
                  localStorage.setItem('swanaya_initial_auth_view', 'register_standard');
                  addLog('Admin: Activated Registration Portal from Admin Console', 'action');
                  onLogout();
                }
              }}
              className="bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-500/40 hover:border-indigo-400 p-4 rounded-xl text-left transition-all cursor-pointer group shadow-lg hover:shadow-indigo-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 bg-indigo-600/30 text-indigo-300 rounded-lg group-hover:scale-110 transition-transform border border-indigo-500/40">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                </span>
                <span className="text-[9px] font-mono font-bold bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/60 uppercase">
                  Registration Portal
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase font-mono group-hover:text-indigo-300 transition-colors flex items-center gap-1.5">
                Activate Registration Portal
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Opens the Registration Portal interface for registering new operator nodes & workspaces.
              </p>
            </button>

            {/* Button 2: Activate Login Portal */}
            <button
              type="button"
              onClick={() => {
                if (onActivatePortal) {
                  addLog('Admin: Activated Login Portal directly from Admin Console', 'action');
                  onActivatePortal('login');
                } else if (onLogout) {
                  localStorage.setItem('swanaya_initial_auth_view', 'login');
                  addLog('Admin: Activated Login Portal from Admin Console', 'action');
                  onLogout();
                }
              }}
              className="bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 hover:border-emerald-400 p-4 rounded-xl text-left transition-all cursor-pointer group shadow-lg hover:shadow-emerald-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 bg-emerald-600/30 text-emerald-300 rounded-lg group-hover:scale-110 transition-transform border border-emerald-500/40">
                  <LogIn className="w-5 h-5 text-emerald-400" />
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/60 uppercase">
                  Login Portal
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase font-mono group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                Activate Login Portal
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Switches system view directly to the Central Login Portal with credentials authentication.
              </p>
            </button>

            {/* Button 3: Activate Trial Session Portal */}
            <button
              type="button"
              onClick={() => {
                if (onActivatePortal) {
                  addLog('Admin: Activated Trial Session Portal directly from Admin Console', 'action');
                  onActivatePortal('register_demo');
                } else if (onLogout) {
                  localStorage.setItem('swanaya_initial_auth_view', 'register_demo');
                  addLog('Admin: Activated Trial Session Portal from Admin Console', 'action');
                  onLogout();
                }
              }}
              className="bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/40 hover:border-amber-400 p-4 rounded-xl text-left transition-all cursor-pointer group shadow-lg hover:shadow-amber-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 bg-amber-600/30 text-amber-300 rounded-lg group-hover:scale-110 transition-transform border border-amber-500/40">
                  <Key className="w-5 h-5 text-amber-400" />
                </span>
                <span className="text-[9px] font-mono font-bold bg-amber-900/60 text-amber-300 px-2 py-0.5 rounded border border-amber-700/60 uppercase">
                  Trial Session
                </span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase font-mono group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                Activate Trial Session
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
              </h4>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Launches the unlocked 72-hour Trial Session onboarding portal for guest operators.
              </p>
            </button>
          </div>
        </div>

        {/* 📥 SWANAYA MEDIA INBOUND CONSULTATION REQUESTS DESK */}
        <div id="consultation-desk" className="bg-slate-950/90 border border-amber-500/40 p-5 rounded-2xl shadow-2xl mb-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
                <Mail className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    Inbound Consultation Requests Desk
                  </h3>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> LIVE INQUIRIES FEED
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Manage incoming project bookings, client consultation forms & quote inquiries submitted from the showcase.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-3">
                <div className="text-center">
                  <div className="text-[9px] font-mono text-slate-400 uppercase">Total Requests</div>
                  <div className="text-xs font-mono font-bold text-white">{consultations.length}</div>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div className="text-center">
                  <div className="text-[9px] font-mono text-amber-400 uppercase">Pending Action</div>
                  <div className="text-xs font-mono font-bold text-amber-300">
                    {consultations.filter(c => c.status === 'NEW' || c.status === 'IN_REVIEW').length}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={exportConsultationsCSV}
                className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-3 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" /> Export CSV
              </button>
            </div>
          </div>

          {/* Search & Status Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search by client name, email, phone, service..."
                value={consultationSearch}
                onChange={(e) => setConsultationSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white outline-none focus:border-amber-500 font-sans"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['ALL', 'NEW', 'IN_REVIEW', 'CONTACTED', 'COMPLETED'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setConsultationFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer whitespace-nowrap border ${
                    consultationFilter === tab
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 font-black'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {tab === 'ALL' && 'All Requests'}
                  {tab === 'NEW' && '🔴 New'}
                  {tab === 'IN_REVIEW' && '🟡 In Review'}
                  {tab === 'CONTACTED' && '🔵 Contacted'}
                  {tab === 'COMPLETED' && '🟢 Completed'}
                </button>
              ))}
            </div>
          </div>

          {/* Consultation Cards List */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {consultations
              .filter(c => {
                const matchesTab = consultationFilter === 'ALL' || c.status === consultationFilter;
                const searchLower = consultationSearch.toLowerCase();
                const matchesSearch = 
                  (c.clientName || '').toLowerCase().includes(searchLower) ||
                  (c.clientEmail || '').toLowerCase().includes(searchLower) ||
                  (c.clientPhone || '').toLowerCase().includes(searchLower) ||
                  (c.service || '').toLowerCase().includes(searchLower) ||
                  (c.message || '').toLowerCase().includes(searchLower);
                return matchesTab && matchesSearch;
              })
              .map(c => {
                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case 'NEW':
                      return 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse';
                    case 'IN_REVIEW':
                      return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
                    case 'CONTACTED':
                      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
                    case 'COMPLETED':
                      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
                    default:
                      return 'bg-slate-800 text-slate-400 border-slate-700';
                  }
                };

                return (
                  <div 
                    key={c.id} 
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-4 rounded-xl transition-all shadow-md group space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center font-mono font-bold text-amber-400 text-xs shrink-0">
                          {c.clientName ? c.clientName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white font-mono uppercase tracking-tight flex items-center gap-2">
                            {c.clientName}
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase ${getStatusBadge(c.status)}`}>
                              {c.status.replace('_', ' ')}
                            </span>
                          </h4>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-3 mt-0.5 flex-wrap">
                            <a href={`mailto:${c.clientEmail}`} className="hover:text-amber-300 flex items-center gap-1 transition-colors">
                              <Mail className="w-3 h-3 text-amber-400" /> {c.clientEmail}
                            </a>
                            {c.clientPhone && c.clientPhone !== 'Not Provided' && (
                              <a href={`tel:${c.clientPhone}`} className="hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                <Phone className="w-3 h-3 text-emerald-400" /> {c.clientPhone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {c.timestampFormatted || new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Requested Service */}
                      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Requested Service</div>
                        <div className="text-xs font-bold text-amber-300 font-mono flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-amber-400" /> {c.service}
                        </div>
                      </div>

                      {/* Requirement Notes */}
                      <div className="md:col-span-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="text-[9px] font-mono text-slate-500 uppercase font-bold mb-1">Client Requirements & Message</div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans italic">
                          "{c.message}"
                        </p>
                      </div>
                    </div>

                    {/* Admin Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 border-t border-slate-800/40">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[10px] font-mono text-slate-400">Update Status:</span>
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateConsultationStatus(c.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-xs text-slate-200 px-2 py-1 rounded-lg outline-none focus:border-amber-500 font-mono cursor-pointer"
                        >
                          <option value="NEW">🔴 NEW</option>
                          <option value="IN_REVIEW">🟡 IN REVIEW</option>
                          <option value="CONTACTED">🔵 CONTACTED</option>
                          <option value="COMPLETED">🟢 COMPLETED</option>
                        </select>

                        {c.status !== 'CONTACTED' && c.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateConsultationStatus(c.id, 'CONTACTED')}
                            className="bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/80 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> Mark Contacted
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(c.clientEmail);
                            setCopiedEmailId(c.id);
                            setTimeout(() => setCopiedEmailId(null), 2000);
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedEmailId === c.id ? 'Copied Email!' : 'Copy Email'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteConsultation(c.id)}
                          className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-900/60 px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            {consultations.length === 0 && (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 p-8 rounded-xl text-center space-y-2">
                <Mail className="w-8 h-8 text-slate-600 mx-auto" />
                <h4 className="text-xs font-bold text-slate-400 uppercase font-mono">No Inbound Consultation Requests Found</h4>
                <p className="text-[10px] text-slate-500">
                  When potential clients submit consultation forms through the Swanaya Showcase advertisement, their requests will instantly appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Telemetry Logs */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" /> Active Telemetry
              </h3>
              <button onClick={onClearLogs} className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-xs">
                <Trash2 className="w-3 h-3" /> Clear Buffer
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {logs.map(log => (
                <div key={log.id} className="text-[10px] font-mono border-b border-slate-800/50 pb-2">
                  <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                  <span className={log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-slate-300'}>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* User Management */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" /> Operator Matrix
              </h3>
              <button onClick={exportToExcelFormat} className="bg-emerald-600/20 text-emerald-400 px-2 py-1 rounded text-xs flex items-center gap-1 hover:bg-emerald-600/40">
                <FileDown className="w-3 h-3" /> Export Passwords (CSV)
              </button>
            </div>
            
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search operators..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 pl-9 pr-3 py-2 rounded-lg text-xs text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 sticky top-0 font-bold">
                  <tr>
                    <th className="p-2">Operator</th>
                    <th className="p-2">Access Level</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.username.toLowerCase().includes(search.toLowerCase())).map(u => (
                    <tr key={u.username} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                      <td className="p-2 font-mono">{u.username}</td>
                      <td className="p-2">
                        <select
                          value={u.permissionLevel || 'editor'}
                          onChange={(e) => handleUpdatePermission(u.username, e.target.value as any)}
                          className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-white border border-slate-700 focus:outline-none"
                        >
                          <option value="viewer">Viewer</option>
                          <option value="editor">Editor</option>
                          <option value="administrator">Administrator</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <button 
                          onClick={() => handleResetPassword(u.username)}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px] bg-amber-400/10 px-2 py-1 rounded"
                        >
                          <Key className="w-3 h-3" /> Reset Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-400" /> Public Addressing System
              </h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a broadcast message for all operators..."
                value={broadcastMessage}
                onChange={e => setBroadcastMessage(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-xs text-white"
              />
              <button 
                onClick={handleBroadcast}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
              >
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col h-96 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" /> Workspace Login History
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 sticky top-0 font-bold">
                  <tr>
                    <th className="p-2">Operator</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logins.slice().reverse().map(l => (
                    <tr key={l.id} className="border-b border-slate-800/50 hover:bg-slate-900/50">
                      <td className="p-2 font-mono font-bold text-indigo-400">{l.username}</td>
                      <td className="p-2">{l.date}</td>
                      <td className="p-2 text-slate-400">{l.timestamp}</td>
                    </tr>
                  ))}
                  {logins.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-slate-500">No recent logins found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
