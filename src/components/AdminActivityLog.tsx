import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Trash2, Search, HardDrive, Key, UserCheck, UserX, UserPlus, FileText, Check, AlertTriangle, LogIn, MessageSquare, Send, Smartphone, Info, Eye, EyeOff, UploadCloud } from 'lucide-react';
import { ActivityLog } from '../types';

interface AdminActivityLogProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
  currentUser: string;
  addLog?: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

interface UserProfile {
  username: string;
  designation: string;
  joined: string;
  password?: string;
  permissionLevel?: 'viewer' | 'editor' | 'administrator';
}

export default function AdminActivityLog({ logs, onClearLogs, currentUser, addLog }: AdminActivityLogProps) {
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'telemetry' | 'logins' | 'messaging'>('accounts');
  
  // Workspace Logins state
  const [workspaceLogins, setWorkspaceLogins] = useState<any[]>([]);

  // Direct Messaging states
  const [msgRecipient, setMsgRecipient] = useState<string>('');
  const [msgText, setMsgText] = useState<string>('');
  const [msgSuccess, setMsgSuccess] = useState<string>('');
  const [msgError, setMsgError] = useState<string>('');
  const [messagesHistory, setMessagesHistory] = useState<any[]>([]);

  const loadLogins = () => {
    try {
      const saved = localStorage.getItem('swanaya_workspace_logins');
      if (saved) {
        setWorkspaceLogins(JSON.parse(saved));
      } else {
        const defaultLogins = [
          {
            id: 'login_seed_1',
            username: 'each',
            timestamp: '09:12:44 AM',
            date: 'Jul 15, 2026',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          },
          {
            id: 'login_seed_2',
            username: 'aadithyan',
            timestamp: '11:45:02 AM',
            date: 'Jul 15, 2026',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        ];
        localStorage.setItem('swanaya_workspace_logins', JSON.stringify(defaultLogins));
        setWorkspaceLogins(defaultLogins);
      }
    } catch (e) {
      console.error("Failed to load workspace logins:", e);
    }
  };

  const loadMessagesHistory = () => {
    try {
      const saved = localStorage.getItem('swanaya_user_messages');
      if (saved) {
        setMessagesHistory(JSON.parse(saved));
      } else {
        setMessagesHistory([]);
      }
    } catch (e) {
      console.error("Failed to load messaging history:", e);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMsgSuccess('');
    setMsgError('');

    if (!msgRecipient) {
      setMsgError('Please select a recipient user.');
      return;
    }
    if (!msgText.trim()) {
      setMsgError('Please enter a message.');
      return;
    }

    try {
      const saved = localStorage.getItem('swanaya_user_messages');
      const msgs = saved ? JSON.parse(saved) : [];
      const newMsg = {
        id: `msg_${Date.now()}`,
        sender: currentUser,
        recipient: msgRecipient,
        text: msgText.trim(),
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        read: false
      };
      msgs.push(newMsg);
      localStorage.setItem('swanaya_user_messages', JSON.stringify(msgs));
      setMessagesHistory(msgs);
      setMsgSuccess(`Text message successfully dispatched to user "${msgRecipient}"!`);
      if (addLog) {
        addLog(`Admin Messaging: Text dispatch sent to operator "${msgRecipient}" by admin "${currentUser}"`, 'success');
      }
      setMsgText('');
    } catch (err) {
      setMsgError('Failed to dispatch text message.');
    }
  };

  const handleClearLogins = () => {
    if (window.confirm("Are you sure you want to clear the workspace logins audit trail?")) {
      localStorage.setItem('swanaya_workspace_logins', JSON.stringify([]));
      setWorkspaceLogins([]);
      if (addLog) {
        addLog("Admin Console: Cleared workspace login audit database", "warning");
      }
    }
  };
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'action' | 'upload'>('all');
  
  // Registered Users list state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetMessage, setResetMessage] = useState<string>('');
  const [resetError, setResetError] = useState<string>('');

  // Password visibility tracking states
  const [shownPasswords, setShownPasswords] = useState<Record<string, boolean>>({});
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [createJoinedDate, setCreateJoinedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const togglePasswordVisibility = (username: string) => {
    setShownPasswords(prev => ({
      ...prev,
      [username]: !prev[username]
    }));
  };

  // New User Creation state inside Admin Console
  const [createUsername, setCreateUsername] = useState('');
  const [createDesignation, setCreateDesignation] = useState('Content Maker');
  const [createPermission, setCreatePermission] = useState<'viewer' | 'editor' | 'administrator'>('editor');
  const [createPassword, setCreatePassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');

  // Image Uploading in Admin Console state
  const [imgUser, setImgUser] = useState<string>('');
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [isImgDragging, setIsImgDragging] = useState(false);
  const [imgSuccess, setImgSuccess] = useState('');
  const [imgError, setImgError] = useState('');
  const adminFileInputRef = React.useRef<HTMLInputElement>(null);

  // Dynamic metrics state
  const [cpuUsage, setCpuUsage] = useState(12);
  const [ramUsage, setRamUsage] = useState(382);
  const [syncStatus, setSyncStatus] = useState<'synchronized' | 'syncing'>('synchronized');

  // Load registered users from localStorage
  const loadUsers = () => {
    const saved = localStorage.getItem('swanaya_registered_users');
    if (saved) {
      try {
        setUsersList(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse registered users", e);
      }
    } else {
      setUsersList([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadLogins();
    loadMessagesHistory();

    // Fluctuations for aesthetic dynamic metrics
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, Math.min(prev + delta, 32));
      });
      setRamUsage((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(378, Math.min(prev + delta, 394));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSyncTrigger = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synchronized');
      loadUsers();
      if (addLog) {
        addLog('Admin Console: Refreshed credentials registry document collection', 'success');
      }
    }, 1200);
  };

  // Reset password implementation
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage('');
    setResetError('');

    if (!selectedUser) {
      setResetError('Please select a user to reset.');
      return;
    }
    if (!newPassword.trim()) {
      setResetError('Please provide a secure new password.');
      return;
    }

    const saved = localStorage.getItem('swanaya_registered_users');
    if (saved) {
      try {
        const users: UserProfile[] = JSON.parse(saved);
        const index = users.findIndex(u => u.username.toLowerCase() === selectedUser.toLowerCase());
        if (index !== -1) {
          users[index].password = newPassword.trim();
          localStorage.setItem('swanaya_registered_users', JSON.stringify(users));
          setUsersList(users);
          setResetMessage(`Success! Password for "${selectedUser}" updated successfully.`);
          setNewPassword('');
          
          const logText = `Admin Console: Password reset successful for user "${selectedUser}" by administrator "${currentUser}"`;
          if (addLog) {
            addLog(logText, 'success');
          }
        } else {
          setResetError(`User "${selectedUser}" was not found in active credentials database.`);
        }
      } catch (err) {
        setResetError('Failed to modify user credentials file.');
      }
    } else {
      setResetError('No user profiles are registered in workspace.');
    }
  };

  // Add user directly from console
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMessage('');

    const usernameClean = createUsername.trim();
    const passwordClean = createPassword.trim();

    if (!usernameClean || !passwordClean) {
      alert('Username and password are required.');
      return;
    }

    const isExist = usersList.some(u => u.username.toLowerCase() === usernameClean.toLowerCase());
    if (isExist || usernameClean.toLowerCase() === 'each' || usernameClean.toLowerCase() === 'aadithyan') {
      alert('This username is reserved or already taken.');
      return;
    }

    let formattedDate = '';
    try {
      const parts = createJoinedDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } else {
        const d = new Date(createJoinedDate);
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch (e) {
      formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    const newUser: UserProfile = {
      username: usernameClean,
      designation: createDesignation,
      joined: formattedDate,
      password: passwordClean,
      permissionLevel: createPermission
    };

    const updated = [...usersList, newUser];
    localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
    setUsersList(updated);
    
    setCreateMessage(`Registered profile "${usernameClean}" created!`);
    setCreateUsername('');
    setCreatePassword('');

    if (addLog) {
      addLog(`Admin Console: Created new user profile "${usernameClean}" [${createDesignation}] with permission [${createPermission}]`, 'success');
    }

    // Sync to Firestore if possible
    try {
      const { doc: fsDoc, setDoc: fsSetDoc } = await import('firebase/firestore');
      const { db: fsDb } = await import('../lib/firebase');
      const userDocRef = fsDoc(fsDb, 'users', usernameClean.toLowerCase());
      await fsSetDoc(userDocRef, {
        username: usernameClean,
        password: passwordClean,
        provider: 'direct',
        designation: createDesignation,
        permissionLevel: createPermission,
        fullName: usernameClean,
        email: `${usernameClean.toLowerCase()}@swanayapartner.com`,
        bio: `Provisioned by System Administrator. Designation: ${createDesignation}, Permission: ${createPermission}.`
      });
    } catch (fErr) {
      console.warn("Firestore sync creation failed, local update saved:", fErr);
    }

    window.dispatchEvent(new Event('storage'));
  };

  // Update/reallocate user permissions dynamically
  const handleUpdatePermission = async (username: string, newPermission: 'viewer' | 'editor' | 'administrator') => {
    const updated = usersList.map(u => {
      if (u.username.toLowerCase() === username.toLowerCase()) {
        return { ...u, permissionLevel: newPermission };
      }
      return u;
    });

    localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
    setUsersList(updated);

    if (addLog) {
      addLog(`Admin Console: Reallocated user "${username}" workspace permission level to "${newPermission}"`, 'success');
    }

    // Sync back to Firestore
    try {
      const { doc: fsDoc, setDoc: fsSetDoc } = await import('firebase/firestore');
      const { db: fsDb } = await import('../lib/firebase');
      const userDocRef = fsDoc(fsDb, 'users', username.toLowerCase());
      await fsSetDoc(userDocRef, { permissionLevel: newPermission }, { merge: true });
    } catch (fErr) {
      console.warn("Firestore sync permission failed, local update saved:", fErr);
    }
    
    window.dispatchEvent(new Event('storage'));
  };

  // Delete/Purge user
  const handleDeleteUser = async (username: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"? They will lose access to their workspace.`)) {
      return;
    }

    const updated = usersList.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
    setUsersList(updated);
    
    if (selectedUser === username) {
      setSelectedUser('');
    }

    if (addLog) {
      addLog(`Admin Console: Revoked credentials and deleted user profile "${username}"`, 'warning');
    }

    // Sync deletion to Firestore
    try {
      const { doc: fsDoc, deleteDoc: fsDeleteDoc } = await import('firebase/firestore');
      const { db: fsDb } = await import('../lib/firebase');
      const userDocRef = fsDoc(fsDb, 'users', username.toLowerCase());
      await fsDeleteDoc(userDocRef);
    } catch (fErr) {
      console.warn("Firestore sync deletion failed:", fErr);
    }

    window.dispatchEvent(new Event('storage'));
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.text.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const isAdmin = currentUser.toLowerCase() === 'aadithyan' || currentUser.toLowerCase() === 'each';

  if (!isAdmin) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-rose-500/30 rounded-2xl p-8 shadow-xl text-center flex flex-col items-center justify-center gap-4 my-6">
        <Shield className="w-12 h-12 text-rose-500 animate-pulse" />
        <h3 className="text-lg font-bold text-white uppercase tracking-wider font-display">Access Denied</h3>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">
          The Admin Console is restricted strictly to authorized system administrators (<strong className="text-rose-400 font-mono">aadithyan</strong> or <strong className="text-rose-400 font-mono">each</strong>). Normal workspace accounts cannot access global telemetry or execute user password resets.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full min-h-[580px]">
      <div>
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 mb-5 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-500 rounded-xl border border-yellow-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">System Administrator Console</h3>
              <p className="text-[10px] text-slate-400">Swanaya Workspace & Credentials Administrator Module</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setActiveSubTab('accounts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer border ${
                activeSubTab === 'accounts'
                  ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-md shadow-yellow-500/5'
                  : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              User Accounts
            </button>
            <button
              onClick={() => {
                setActiveSubTab('logins');
                loadLogins();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer border ${
                activeSubTab === 'logins'
                  ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-md shadow-yellow-500/5'
                  : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Workspace Logins
            </button>
            <button
              onClick={() => {
                setActiveSubTab('messaging');
                loadMessagesHistory();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer border ${
                activeSubTab === 'messaging'
                  ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-md shadow-yellow-500/5'
                  : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Direct Messaging
            </button>
            <button
              onClick={() => setActiveSubTab('telemetry')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer border ${
                activeSubTab === 'telemetry'
                  ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400 shadow-md shadow-yellow-500/5'
                  : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Action Telemetry
            </button>
          </div>
        </div>

        {/* Real-time System Metrics Indicators */}
        <div className="grid grid-cols-3 gap-3.5 mb-5 text-[10px] font-mono">
          <div className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-slate-500 mb-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-yellow-500" /> CPU Load
            </div>
            <div className="font-bold text-white text-xs">{cpuUsage}%</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-slate-500 mb-1 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-blue-400" /> RAM Buffers
            </div>
            <div className="font-bold text-white text-xs">{ramUsage} MB</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
            <div className="text-slate-500 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 text-emerald-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /> Sync Status
            </div>
            <button 
              onClick={handleSyncTrigger}
              className="font-bold text-left hover:text-yellow-400 text-[10px] text-slate-300 uppercase underline decoration-dashed shrink-0 cursor-pointer"
            >
              {syncStatus === 'synchronized' ? 'Online Sync' : 'Re-Syncing...'}
            </button>
          </div>
        </div>

        {/* ==========================================================
            SUB-TAB 1: USER ACCOUNTS & PASSWORD RESET
            ========================================================== */}
        {activeSubTab === 'accounts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* User Accounts list (Spans 2 cols) */}
              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-yellow-500" /> Credentials Directory ({usersList.length})
                  </h4>
                  <span className="text-[9px] text-slate-500 font-mono italic">Workspace filtering active</span>
                </div>

                {usersList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-850 rounded-xl space-y-2">
                    <AlertTriangle className="w-8 h-8 text-slate-700 mx-auto" />
                    <p className="text-xs text-slate-400">No secondary user accounts registered yet.</p>
                    <p className="text-[9px] text-slate-600">Register secondary accounts inside the login panel or create one on the right form.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-850 pb-2 text-[9px] text-slate-500 uppercase tracking-wider">
                          <th className="pb-2">Username</th>
                          <th className="pb-2">Designation</th>
                          <th className="pb-2">Permission</th>
                          <th className="pb-2">Date Joined</th>
                          <th className="pb-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {usersList.map((user) => (
                          <tr key={user.username} className="hover:bg-slate-900/20 group">
                            <td className="py-2.5 font-bold text-white">{user.username}</td>
                            <td className="py-2.5">
                              <span className="bg-indigo-950/50 border border-indigo-900/30 text-indigo-300 text-[9px] px-1.5 py-0.5 rounded">
                                {user.designation}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <select
                                value={user.permissionLevel || 'editor'}
                                onChange={(e) => handleUpdatePermission(user.username, e.target.value as any)}
                                className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-0.5 outline-none cursor-pointer focus:border-indigo-500 font-mono font-bold"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                              </select>
                            </td>
                            <td className="py-2.5 text-slate-400">{user.joined}</td>
                            <td className="py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user.username);
                                    setResetMessage('');
                                    setResetError('');
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border transition-colors cursor-pointer ${
                                    selectedUser === user.username
                                      ? 'bg-yellow-500 border-yellow-400 text-slate-950'
                                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-yellow-500/40 hover:text-yellow-400'
                                  }`}
                                >
                                  Select Reset
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.username)}
                                  className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-rose-950/20 transition-colors cursor-pointer"
                                  title="Permanently Revoke and Delete User"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Password Reset form & Creation panel */}
              <div className="space-y-4">
                {/* Reset Panel */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-3">
                    <Key className="w-4 h-4 text-yellow-500" /> Credentials Reset
                  </h4>

                  <form onSubmit={handleResetPassword} className="space-y-3.5">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Active Selection
                      </label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Select a profile from table"
                        value={selectedUser}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 font-bold outline-none"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        New Security Password
                      </label>
                      <div className="relative">
                        <input
                          type={showResetPassword ? "text" : "password"}
                          required
                          disabled={!selectedUser}
                          placeholder={selectedUser ? "Enter new plain-text pass" : "Select user first"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500 rounded pl-2 pr-8 py-1.5 text-xs text-white placeholder-slate-700 outline-none font-mono"
                        />
                        {selectedUser && (
                          <button
                            type="button"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                            title={showResetPassword ? "Hide Password" : "Show Password"}
                          >
                            {showResetPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {resetMessage && (
                      <p className="text-[10px] text-emerald-400 bg-emerald-950/30 border border-emerald-900/30 p-2 rounded flex items-center gap-1 font-mono">
                        <Check className="w-3 h-3" /> {resetMessage}
                      </p>
                    )}

                    {resetError && (
                      <p className="text-[10px] text-rose-400 bg-rose-950/30 border border-rose-900/30 p-2 rounded font-mono">
                        ⚠️ {resetError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={!selectedUser || !newPassword}
                      className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-1.5 rounded text-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase font-mono tracking-wider"
                    >
                      Override Password
                    </button>
                  </form>
                </div>

                {/* Direct User Registration panel */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-3">
                    <UserPlus className="w-4 h-4 text-indigo-400" /> Force Register Profile
                  </h4>

                  <form onSubmit={handleCreateUser} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. raju"
                          value={createUsername}
                          onChange={(e) => setCreateUsername(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-2 py-1.5 text-xs text-white placeholder-slate-700 outline-none font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Designation
                        </label>
                        <select
                          value={createDesignation}
                          onChange={(e) => setCreateDesignation(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
                        >
                          <option value="Content Maker">Content Maker</option>
                          <option value="Editor">Editor</option>
                          <option value="Designer">Designer</option>
                          <option value="Videographer">Videographer</option>
                          <option value="SEO Expert">SEO Expert</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Secure Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCreatePassword ? "text" : "password"}
                          required
                          placeholder="Set plain password"
                          value={createPassword}
                          onChange={(e) => setCreatePassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded pl-2 pr-8 py-1.5 text-xs text-white placeholder-slate-700 outline-none font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCreatePassword(!showCreatePassword)}
                          className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                          title={showCreatePassword ? "Hide Password" : "Show Password"}
                        >
                          {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Workspace Permission Level
                      </label>
                      <select
                        value={createPermission}
                        onChange={(e) => setCreatePermission(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 outline-none cursor-pointer font-sans"
                      >
                        <option value="viewer">Viewer (Read-only workspace access)</option>
                        <option value="editor">Editor / Content Maker (Can edit details)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Joined / Registration Date Option
                      </label>
                      <input
                        type="date"
                        required
                        value={createJoinedDate}
                        onChange={(e) => setCreateJoinedDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-2 py-1.5 text-xs text-white outline-none font-mono cursor-pointer"
                      />
                    </div>

                    {createMessage && (
                      <p className="text-[10px] text-emerald-400 bg-emerald-950/20 p-1.5 rounded border border-emerald-900/20 font-mono text-center">
                        {createMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-xs transition-colors cursor-pointer uppercase font-mono tracking-wider"
                    >
                      Provision Account
                    </button>
                  </form>
                </div>

                {/* Operator Node Avatar Upload panel */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 border-b border-slate-850 pb-2 mb-3">
                    <UploadCloud className="w-4 h-4 text-indigo-400" /> Upload Profile Image
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Select Target User
                      </label>
                      <select
                        value={imgUser}
                        onChange={(e) => {
                          const val = e.target.value;
                          setImgUser(val);
                          setImgSuccess('');
                          setImgError('');
                          if (val) {
                            const cached = localStorage.getItem(`swanaya_profile_image_${val}`);
                            setImgPreview(cached || null);
                          } else {
                            setImgPreview(null);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-300 outline-none cursor-pointer font-sans"
                      >
                        <option value="">-- SELECT RECIPIENT --</option>
                        <option value="each">each (Admin)</option>
                        <option value="aadithyan">aadithyan (Admin)</option>
                        {usersList.map((u) => (
                          <option key={u.username} value={u.username}>
                            {u.username} ({u.designation})
                          </option>
                        ))}
                      </select>
                    </div>

                    {imgUser && (
                      <div>
                        <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Profile Avatar (Drag & Drop or Click to select)
                        </label>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsImgDragging(true);
                          }}
                          onDragLeave={() => setIsImgDragging(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsImgDragging(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) {
                              if (!file.type.startsWith('image/')) {
                                setImgError('Profile picture must be an image file type');
                                return;
                              }
                              if (file.size > 1024 * 1024) {
                                setImgError('Image file size must be less than 1MB');
                                return;
                              }
                              setImgError('');
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setImgPreview(ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          onClick={() => adminFileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                            isImgDragging
                              ? 'border-indigo-500 bg-indigo-950/20'
                              : imgPreview
                              ? 'border-emerald-500/30 bg-emerald-950/5 hover:border-emerald-500/50'
                              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                          }`}
                        >
                          <input
                            type="file"
                            ref={adminFileInputRef}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (!file.type.startsWith('image/')) {
                                  setImgError('Profile picture must be an image file type');
                                  return;
                                }
                                if (file.size > 1024 * 1024) {
                                  setImgError('Image file size must be less than 1MB');
                                  return;
                                }
                                setImgError('');
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  setImgPreview(ev.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                            accept="image/*"
                          />
                          {imgPreview ? (
                            <div className="flex flex-col items-center gap-1.5">
                              <img
                                src={imgPreview}
                                alt="Preview"
                                className="w-10 h-10 rounded-full object-cover border border-slate-700"
                              />
                              <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">Image Loaded Successfully</span>
                              <span className="text-[8px] text-slate-500">Click or drop to replace</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <UploadCloud className="w-5 h-5 text-slate-500 mx-auto" />
                              <span className="text-[9px] text-slate-400 font-mono">Drag image here or click</span>
                              <span className="text-[8px] text-slate-600 font-mono">MAX SIZE: 1MB</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {imgSuccess && (
                      <p className="text-[10px] text-emerald-400 bg-emerald-950/20 p-1.5 rounded border border-emerald-900/20 font-mono text-center">
                        {imgSuccess}
                      </p>
                    )}

                    {imgError && (
                      <p className="text-[10px] text-rose-400 bg-rose-950/20 p-1.5 rounded border border-rose-900/20 font-mono text-center">
                        ⚠️ {imgError}
                      </p>
                    )}

                    <button
                      type="button"
                      disabled={!imgUser || !imgPreview}
                      onClick={async () => {
                        if (!imgUser || !imgPreview) return;
                        setImgSuccess('');
                        setImgError('');

                        try {
                          // 1. Save locally in swanaya_profile_image_${username}
                          localStorage.setItem(`swanaya_profile_image_${imgUser}`, imgPreview);

                          // 2. If it's a registered user, update their entry in swanaya_registered_users list
                          const savedUsers = localStorage.getItem('swanaya_registered_users');
                          if (savedUsers) {
                            const parsed = JSON.parse(savedUsers);
                            const index = parsed.findIndex((u: any) => u.username.toLowerCase() === imgUser.toLowerCase());
                            if (index !== -1) {
                              parsed[index].profileImage = imgPreview;
                              localStorage.setItem('swanaya_registered_users', JSON.stringify(parsed));
                              setUsersList(parsed);
                            }
                          }

                          // 3. Sync to Firestore if online
                          try {
                            const { doc: fsDoc, setDoc: fsSetDoc } = await import('firebase/firestore');
                            const { db: fsDb } = await import('../lib/firebase');
                            const userDocRef = fsDoc(fsDb, 'users', imgUser.toLowerCase());
                            await fsSetDoc(userDocRef, { profileImage: imgPreview }, { merge: true });
                          } catch (fErr) {
                            console.warn("Firestore sync failed, local update saved:", fErr);
                          }

                          setImgSuccess(`Avatar successfully saved for user "${imgUser}"!`);
                          if (addLog) {
                            addLog(`Admin Console: Set custom avatar image for operator "${imgUser}"`, 'upload');
                          }
                          window.dispatchEvent(new Event('storage'));
                        } catch (err) {
                          setImgError('Failed to apply custom avatar image');
                        }
                      }}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-1.5 rounded text-xs transition-colors cursor-pointer uppercase font-mono tracking-wider flex items-center justify-center gap-1.5"
                    >
                      Apply & Sync Avatar
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Hint Box */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-[10.5px] leading-relaxed text-slate-400 font-mono">
                <strong className="text-yellow-400 uppercase font-bold block mb-1">Administrator Overrides Active</strong>
                As system administrator <span className="text-white font-bold">{currentUser}</span>, your console can directly alter password properties and inspect login credentials. Normal users are isolated inside their individual workspace scopes.
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            SUB-TAB 2: SECURITY & ACTION TELEMETRY
            ========================================================== */}
        {activeSubTab === 'telemetry' && (
          <div className="space-y-4">
            {/* Searching & Filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search security log payload..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-yellow-500 focus:ring-0 rounded-lg py-1 px-3 pl-8 text-xs text-white placeholder-slate-600 outline-none font-mono"
                />
              </div>

              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 py-1 px-2.5 rounded-lg outline-none cursor-pointer font-mono"
              >
                <option value="all">All Events</option>
                <option value="success">Success</option>
                <option value="warning">Alerts</option>
                <option value="action">User Actions</option>
                <option value="upload">Upload Pipeline</option>
              </select>
            </div>

            {/* Logs terminal output */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-80 overflow-y-auto font-mono text-[10.5px] leading-relaxed text-slate-300 flex flex-col justify-between">
              <div className="space-y-1.5">
                {filteredLogs.length === 0 ? (
                  <div className="text-center text-slate-600 py-12">
                    --- NO SEARCH PAYLOAD FOUND ---
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    let textCol = 'text-slate-300';
                    if (log.type === 'success') textCol = 'text-emerald-400';
                    if (log.type === 'warning') textCol = 'text-rose-400 font-bold';
                    if (log.type === 'action') textCol = 'text-indigo-400';
                    if (log.type === 'upload') textCol = 'text-purple-400';

                    return (
                      <div key={log.id} className="hover:bg-slate-900/50 p-1 rounded transition-colors flex items-start gap-1">
                        <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                        <span className={textCol}>{log.text}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================================
            SUB-TAB 3: WORKSPACE LOGIN AUDITING
            ========================================================== */}
        {activeSubTab === 'logins' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <LogIn className="w-4 h-4 text-yellow-500" /> Active Workspace Logins Audit Log ({workspaceLogins.length})
              </h4>
              <span className="text-[9px] text-slate-500 font-mono italic">Recorded in secure local storage</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-900/40 text-[9px] text-slate-500 uppercase tracking-wider">
                      <th className="p-3">Session ID</th>
                      <th className="p-3">Workspace operator</th>
                      <th className="p-3">Login Date</th>
                      <th className="p-3">Login Time</th>
                      <th className="p-3">Device / User Agent / IP Access Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/60">
                    {workspaceLogins.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                          No workspace login events have been registered in this sandbox.
                        </td>
                      </tr>
                    ) : (
                      [...workspaceLogins].reverse().map((login, idx) => (
                        <tr key={login.id || idx} className="hover:bg-slate-900/20 group">
                          <td className="p-3 text-slate-500 text-[10px]">{login.id || `LOG_${idx}`}</td>
                          <td className="p-3 font-bold text-white flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {login.username}
                          </td>
                          <td className="p-3 text-indigo-400">{login.date}</td>
                          <td className="p-3 text-slate-400">{login.timestamp}</td>
                          <td className="p-3 text-slate-500 text-[10px] truncate max-w-xs" title={login.userAgent}>
                            {login.userAgent || 'Unknown Environment / Simulation Client'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <p className="text-[10px] font-mono text-slate-500 leading-relaxed flex items-center gap-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              This table lists secure authorization logs compiled upon successful entry through the Swanaya portal. 
              The system automatically tracks active platform keys and browser configurations to audit workspace usage.
            </p>
          </div>
        )}

        {/* ==========================================================
            SUB-TAB 4: DIRECT ADMIN-TO-USER MESSAGING
            ========================================================== */}
        {activeSubTab === 'messaging' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-yellow-500" /> Administrative SMS & Text Dispatch Center
              </h4>
              <span className="text-[9px] text-slate-500 font-mono italic">User popups and banner dispatches</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              {/* Form panel (2 cols) */}
              <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 rounded-xl p-4">
                <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono mb-3 border-b border-slate-900 pb-1.5">
                  Compose Dispatch Note
                </h5>

                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Recipient operator
                    </label>
                    <select
                      value={msgRecipient}
                      onChange={(e) => setMsgRecipient(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500 rounded p-2 text-xs text-white outline-none"
                    >
                      <option value="">-- SELECT RECIPIENT USER --</option>
                      <option value="all">All Workspace Users (Broadcast)</option>
                      {usersList.map(u => (
                        <option key={u.username} value={u.username}>{u.username} ({u.designation})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Text message body (Dispatched directly to screen banner)
                    </label>
                    <textarea
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Type secure instruction, deadline warning, or access notice..."
                      rows={4}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500 rounded p-2 text-xs text-white placeholder-slate-700 outline-none font-sans leading-relaxed"
                    />
                  </div>

                  {msgSuccess && (
                    <p className="text-[10px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded flex items-center gap-1 font-mono">
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> {msgSuccess}
                    </p>
                  )}

                  {msgError && (
                    <p className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-900/30 p-2 rounded font-mono">
                      ⚠️ {msgError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2 rounded text-xs transition-colors cursor-pointer uppercase font-mono tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Text Message
                  </button>
                </form>
              </div>

              {/* History panel (3 cols) */}
              <div className="lg:col-span-3 bg-slate-950/40 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h5 className="text-[10px] font-bold text-white uppercase tracking-wider font-mono mb-3 border-b border-slate-900 pb-1.5">
                    Recent Dispatches Audit Trail ({messagesHistory.length})
                  </h5>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {messagesHistory.length === 0 ? (
                      <p className="text-xs text-slate-600 italic py-8 text-center font-mono">
                        --- NO ADMIN TEXT DISPATCHES SENT YET ---
                      </p>
                    ) : (
                      [...messagesHistory].reverse().map((m, idx) => (
                        <div key={m.id || idx} className="bg-slate-950 border border-slate-900 p-2.5 rounded-lg space-y-1 hover:border-slate-800 transition-colors">
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="font-bold text-yellow-500 uppercase tracking-tight">
                              To: {m.recipient === 'all' ? '📢 Broadcast (All)' : `👤 ${m.recipient}`}
                            </span>
                            <span className="text-slate-500">{m.date} • {m.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            "{m.text}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-3 text-[9px] font-mono text-slate-600 leading-normal border-t border-slate-900 pt-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 shrink-0" />
                  Dispatched messages are securely saved. Corresponding operators will instantly receive notification badges upon logging in.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-mono">
          Operator: <strong className="text-slate-300 font-bold uppercase">{currentUser}</strong>
        </span>
        {activeSubTab === 'telemetry' && (
          <button
            onClick={onClearLogs}
            className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors font-semibold cursor-pointer font-mono"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Audit Logs
          </button>
        )}
        {activeSubTab === 'logins' && workspaceLogins.length > 0 && (
          <button
            onClick={handleClearLogins}
            className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors font-semibold cursor-pointer font-mono"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Logins Database
          </button>
        )}
      </div>
    </div>
  );
}
