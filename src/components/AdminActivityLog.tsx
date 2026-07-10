import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Trash2, Search, HardDrive, Key, UserCheck, UserX, UserPlus, FileText, Check, AlertTriangle } from 'lucide-react';
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
}

export default function AdminActivityLog({ logs, onClearLogs, currentUser, addLog }: AdminActivityLogProps) {
  const [activeSubTab, setActiveSubTab] = useState<'accounts' | 'telemetry'>('accounts');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'action' | 'upload'>('all');
  
  // Registered Users list state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [resetMessage, setResetMessage] = useState<string>('');
  const [resetError, setResetError] = useState<string>('');

  // New User Creation state inside Admin Console
  const [createUsername, setCreateUsername] = useState('');
  const [createDesignation, setCreateDesignation] = useState('Editor');
  const [createPassword, setCreatePassword] = useState('');
  const [createMessage, setCreateMessage] = useState('');

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
  const handleCreateUser = (e: React.FormEvent) => {
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

    const newUser: UserProfile = {
      username: usernameClean,
      designation: createDesignation,
      joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      password: passwordClean
    };

    const updated = [...usersList, newUser];
    localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
    setUsersList(updated);
    
    setCreateMessage(`Registered profile "${usernameClean}" created!`);
    setCreateUsername('');
    setCreatePassword('');

    if (addLog) {
      addLog(`Admin Console: Created new user profile "${usernameClean}" [${createDesignation}]`, 'success');
    }
  };

  // Delete/Purge user
  const handleDeleteUser = (username: string) => {
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
          The Admin Console is restricted strictly to root system administrators (<strong className="text-rose-400 font-mono">aadithyan</strong> or <strong className="text-rose-400 font-mono">each</strong>). Normal workspace accounts cannot access global telemetry or execute user password resets.
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
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">Root Admin Console</h3>
              <p className="text-[10px] text-slate-400">Swanaya Workspace & Credentials Administrator Module</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
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
                          <th className="pb-2">Date Joined</th>
                          <th className="pb-2">Password Hash</th>
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
                            <td className="py-2.5 text-slate-400">{user.joined}</td>
                            <td className="py-2.5 text-slate-500 font-mono tracking-widest text-[10px]">
                              {user.password ? `${user.password.substring(0, 3)}***` : 'N/A'}
                            </td>
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

                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        New Security Password
                      </label>
                      <input
                        type="password"
                        required
                        disabled={!selectedUser}
                        placeholder={selectedUser ? "Enter new plain-text pass" : "Select user first"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-yellow-500 rounded px-2 py-1.5 text-xs text-white placeholder-slate-700 outline-none font-mono"
                      />
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
                          <option value="Editor">Editor</option>
                          <option value="Designer">Designer</option>
                          <option value="Videographer">Videographer</option>
                          <option value="SEO Expert">SEO Expert</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Secure Password
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Set plain password"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-2 py-1.5 text-xs text-white placeholder-slate-700 outline-none font-mono"
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

              </div>

            </div>

            {/* Hint Box */}
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-[10.5px] leading-relaxed text-slate-400 font-mono">
                <strong className="text-yellow-400 uppercase font-bold block mb-1">Root Overrides Active</strong>
                As root administrator <span className="text-white font-bold">{currentUser}</span>, your console can directly alter password properties and inspect login credentials. Normal users are isolated inside their individual workspace scopes.
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
      </div>
    </div>
  );
}
