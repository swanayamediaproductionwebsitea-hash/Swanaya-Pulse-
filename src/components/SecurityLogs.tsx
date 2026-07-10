import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, RefreshCw, Search, HardDrive, FileText, CheckCircle2 } from 'lucide-react';
import { ActivityLog } from '../types';

interface SecurityLogsProps {
  logs: ActivityLog[];
  currentUser: string;
}

export default function SecurityLogs({ logs, currentUser }: SecurityLogsProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'success' | 'warning' | 'action' | 'upload'>('all');
  
  // Dynamic metrics state for a highly interactive technical vibe
  const [cpuUsage, setCpuUsage] = useState(8);
  const [ramUsage, setRamUsage] = useState(254);
  const [serverState, setServerState] = useState<'nominal' | 'calibrating'>('nominal');

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => {
        const delta = Math.floor(Math.random() * 3) - 1;
        return Math.max(3, Math.min(prev + delta, 15));
      });
      setRamUsage((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(248, Math.min(prev + delta, 262));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const triggerCalibrate = () => {
    setServerState('calibrating');
    setTimeout(() => {
      setServerState('nominal');
    }, 1500);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.text.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between h-full min-h-[580px]">
      <div>
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 mb-5 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display text-white uppercase tracking-wider">Workspace Security Logs</h3>
              <p className="text-[10px] text-slate-400">Swanaya Operational Audit Trail & Access Records</p>
            </div>
          </div>

          <div className="text-[9px] font-mono bg-indigo-950/40 border border-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full uppercase tracking-wider">
            Operator: <strong className="text-white font-bold">{currentUser}</strong>
          </div>
        </div>

        {/* Telemetry Visualizer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide block">Network Core CPU</span>
              <strong className="text-white text-lg font-mono tracking-tight">{cpuUsage}%</strong>
            </div>
            <Cpu className="w-8 h-8 text-indigo-500/30" />
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide block">RAM Allocation</span>
              <strong className="text-white text-lg font-mono tracking-tight">{ramUsage} MB</strong>
            </div>
            <HardDrive className="w-8 h-8 text-purple-500/30" />
          </div>

          <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wide block">Sync State</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${serverState === 'nominal' ? 'bg-emerald-500' : 'bg-indigo-400 animate-ping'}`} />
                <span className="text-white text-xs font-mono capitalize">{serverState === 'nominal' ? 'Nominal' : 'Calibrating...'}</span>
              </div>
            </div>
            <button 
              onClick={triggerCalibrate}
              disabled={serverState === 'calibrating'}
              className="p-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${serverState === 'calibrating' && 'animate-spin'}`} />
            </button>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4 bg-slate-950/35 border border-slate-850 p-3 rounded-xl">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Search action details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-700 outline-none"
            />
          </div>

          <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'success', 'warning', 'action', 'upload'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono uppercase tracking-wide cursor-pointer transition-all border ${
                  filterType === type
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 hover:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Terminal list */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 h-[280px] overflow-y-auto font-mono text-[11px] space-y-2.5 text-left scrollbar-thin">
          <div className="flex items-center gap-1.5 text-indigo-400 border-b border-slate-850 pb-2 mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span className="font-bold text-[10px] uppercase tracking-wider">SWANAYA ACTIVE SECURITY LOG SHIELD</span>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              NO AUDIT RECORDS FOUND MATCHING SEARCH FILTERS
            </div>
          ) : (
            filteredLogs.map((log) => {
              let textClass = 'text-slate-300';
              let badgeColor = 'bg-slate-900 text-slate-500 border-slate-800';

              if (log.type === 'success') {
                textClass = 'text-emerald-300';
                badgeColor = 'bg-emerald-950/30 text-emerald-400 border-emerald-900/20';
              } else if (log.type === 'warning') {
                textClass = 'text-rose-300';
                badgeColor = 'bg-rose-950/30 text-rose-400 border-rose-900/20';
              } else if (log.type === 'action') {
                textClass = 'text-indigo-300';
                badgeColor = 'bg-indigo-950/30 text-indigo-400 border-indigo-900/20';
              } else if (log.type === 'upload') {
                textClass = 'text-sky-300';
                badgeColor = 'bg-sky-950/30 text-sky-400 border-sky-900/20';
              }

              return (
                <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/40 p-1 rounded transition-colors border-b border-slate-900/50 pb-2">
                  <span className="text-[10px] text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={`text-[9px] font-bold px-1 rounded border shrink-0 uppercase tracking-widest ${badgeColor}`}>
                    {log.type}
                  </span>
                  <p className={`leading-relaxed ${textClass}`}>
                    {log.text}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="text-center text-[10px] font-mono text-slate-600 mt-4 border-t border-slate-850/60 pt-3">
        SECURE MONITOR CHANNEL ONLINE • SYSTEM INTEGRITY VERIFIED (100%)
      </div>
    </div>
  );
}
