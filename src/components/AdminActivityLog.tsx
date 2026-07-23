import React, { useState } from 'react';
import { ShieldCheck, Activity, Trash2, User, Key, Search, FileDown } from 'lucide-react';
import { ActivityLog } from '../types';

interface AdminActivityLogProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
  currentUser: string;
  addLog: (msg: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function AdminActivityLog({ logs, onClearLogs, currentUser, addLog }: AdminActivityLogProps) {
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem('swanaya_registered_users');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

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
