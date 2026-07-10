import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Trash2, Search, HardDrive, CpuIcon } from 'lucide-react';
import { ActivityLog } from '../types';

interface AdminActivityLogProps {
  logs: ActivityLog[];
  onClearLogs: () => void;
  currentUser: string;
}

export default function AdminActivityLog({ logs, onClearLogs, currentUser }: AdminActivityLogProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'action' | 'upload'>('all');
  
  // Simulated dynamic system stats
  const [cpuUsage, setCpuUsage] = useState(14);
  const [ramUsage, setRamUsage] = useState(384); // MB
  const [syncStatus, setSyncStatus] = useState<'synchronized' | 'syncing'>('synchronized');

  useEffect(() => {
    // Simulate low level metrics fluctuations
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, Math.min(prev + delta, 35));
      });
      setRamUsage((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(380, Math.min(prev + delta, 395));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSyncTrigger = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synchronized');
    }, 1500);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.text.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full">
      
      <div>
        {/* Header Block */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white">Security & Action telemetry</h3>
              <p className="text-[10px] text-slate-400">Swanaya administration audit track</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
              Secure Session
            </span>
          </div>
        </div>

        {/* Real-time Hardware Indicators */}
        <div className="grid grid-cols-3 gap-3.5 mb-5 text-[10px] font-mono">
          <div className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-slate-500 mb-1 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> V-CPU Load
            </div>
            <div className="font-bold text-white text-xs">{cpuUsage}%</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg">
            <div className="text-slate-500 mb-1 flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-purple-400" /> RAM Buffers
            </div>
            <div className="font-bold text-white text-xs">{ramUsage} MB</div>
          </div>
          <div className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
            <div className="text-slate-500 flex items-center gap-1">
              <RefreshCw className={`w-3 h-3 text-emerald-400 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} /> Sync State
            </div>
            <button 
              onClick={handleSyncTrigger}
              className="font-bold text-left hover:text-indigo-400 text-[10px] text-slate-300 uppercase underline decoration-dashed shrink-0 cursor-pointer"
            >
              {syncStatus === 'synchronized' ? 'Online' : 'Syncing...'}
            </button>
          </div>
        </div>

        {/* Searching & Filter toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search security log payload..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:ring-0 rounded-lg py-1 px-3 pl-8 text-xs text-white placeholder-slate-600 outline-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 py-1 px-2.5 rounded-lg outline-none cursor-pointer"
          >
            <option value="all">All Events</option>
            <option value="success">Success</option>
            <option value="warning">Alerts</option>
            <option value="action">User Actions</option>
            <option value="upload">Upload Pipeline</option>
          </select>
        </div>

        {/* Logs terminal output */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 h-64 overflow-y-auto font-mono text-[10.5px] leading-relaxed text-slate-300 flex flex-col justify-between">
          <div className="space-y-1.5">
            {filteredLogs.length === 0 ? (
              <div className="text-center text-slate-600 py-8">
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

      <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px]">
        <span className="text-slate-500 font-mono">
          Operator: <strong className="text-slate-300 font-bold">{currentUser}</strong>
        </span>
        <button
          onClick={onClearLogs}
          className="text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors font-semibold cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Audit Logs
        </button>
      </div>

    </div>
  );
}
