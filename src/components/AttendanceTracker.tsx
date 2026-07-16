import React, { useState } from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock, CalendarCheck, HelpCircle, CornerDownRight, LogIn, LogOut, User, Download } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface AttendanceTrackerProps {
  records: AttendanceRecord[];
  onAddRecord: (day: number, type: 'check_in' | 'check_out', notes: string) => void;
  onClearRecords: () => void;
  currentUser: string;
}

export default function AttendanceTracker({ records, onAddRecord, onClearRecords, currentUser }: AttendanceTrackerProps) {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [logType, setLogType] = useState<'check_in' | 'check_out'>('check_in');
  const [notes, setNotes] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'check_in' | 'check_out'>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'mine'>('all');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Days 1 to 31 array
  const allDays = Array.from({ length: 31 }, (_, i) => i + 1);

  // Find used days (days that have at least one check_in or check_out record)
  const usedDays = Array.from(new Set(records.map(r => r.day)));
  
  // Find "Dates Not Used" (unlogged days)
  const unusedDays = allDays.filter(day => !usedDays.includes(day));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord(selectedDay, logType, notes.trim());
    setNotes('');
  };

  const filteredRecords = records.filter(r => {
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesUser = userFilter === 'all' || r.username === currentUser;
    return matchesType && matchesUser;
  });

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['Record ID', 'Day Cycle', 'Registry Action', 'Operator', 'Timestamp', 'Date', 'Memo Notes'];
    const csvContent = [
      headers.join(','),
      ...records.map(rec => [
        `"${rec.id || ''}"`,
        `"${rec.day}"`,
        `"${rec.type === 'check_in' ? 'Check-In' : 'Check-Out'}"`,
        `"${rec.username || 'System'}"`,
        `"${rec.timestamp || ''}"`,
        `"${rec.dateTime || ''}"`,
        `"${(rec.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Swanaya_Attendance_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col h-full justify-between">
      <div>
        {/* Header section with Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-white">Attendance Node Registry</h3>
              <p className="text-slate-400 text-xs">Verify work presence across 31 log-cycles</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 text-xs font-mono">
            <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg py-1.5 px-3">
              <div className="text-emerald-400 font-bold">{usedDays.length} / 31</div>
              <div className="text-[10px] text-slate-400">Days Logged</div>
            </div>
            <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg py-1.5 px-3">
              <div className="text-amber-400 font-bold">{unusedDays.length}</div>
              <div className="text-[10px] text-slate-400">Unused Cycles</div>
            </div>
          </div>
        </div>

        {/* Presence Heatmap Calendar */}
        <div className="my-5 bg-slate-950/40 rounded-xl p-4 border border-slate-800/60 relative">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Visual Presence Heatmap
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/30 border border-indigo-900/30 px-2 py-0.5 rounded">
              31-Day Grid
            </span>
          </div>

          {/* Weekday indicator columns */}
          <div className="grid grid-cols-7 gap-2 text-center mb-1.5">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((wd, idx) => (
              <span key={idx} className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                {wd}
              </span>
            ))}
          </div>

          {/* Heatmap Cell Grid */}
          <div className="grid grid-cols-7 gap-2 text-center mb-3.5">
            {allDays.map((day) => {
              const dayLogs = records.filter(r => r.day === day);
              const hasIn = dayLogs.some(r => r.type === 'check_in');
              const hasOut = dayLogs.some(r => r.type === 'check_out');
              const isSelected = selectedDay === day;

              let cellStyle = 'bg-slate-950/50 border-slate-850 text-slate-500 hover:border-slate-700/50 hover:bg-slate-900/40';
              let indicatorColor = '';

              if (hasIn && hasOut) {
                // Successful check_in AND check_out logs
                cellStyle = 'bg-gradient-to-br from-indigo-950/85 to-emerald-950/85 border-indigo-500 text-indigo-300 font-bold shadow-sm shadow-indigo-500/10 hover:brightness-110 hover:border-indigo-400';
                indicatorColor = 'bg-indigo-400';
              } else if (hasIn) {
                cellStyle = 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400 hover:bg-emerald-900/20 hover:border-emerald-600';
                indicatorColor = 'bg-emerald-400';
              } else if (hasOut) {
                cellStyle = 'bg-amber-950/40 border-amber-800/60 text-amber-400 hover:bg-amber-900/20 hover:border-amber-600';
                indicatorColor = 'bg-amber-400';
              }

              return (
                <div key={day} className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-full aspect-square text-xs rounded-lg flex flex-col items-center justify-center border transition-all cursor-pointer ${cellStyle} ${
                      isSelected 
                        ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 z-10 scale-105 border-indigo-400' 
                        : ''
                    }`}
                  >
                    <span>{day}</span>
                    {dayLogs.length > 0 && (
                      <span className={`w-1 h-1 rounded-full mt-0.5 ${indicatorColor} animate-pulse`} />
                    )}
                  </button>

                  {/* Absolute Positioned Tooltip for Hover */}
                  {hoveredDay === day && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-52 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl z-50 text-left pointer-events-none">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                        <span className="text-[10px] font-bold text-white">Day {day} Logs</span>
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                          hasIn && hasOut ? 'bg-indigo-500/10 text-indigo-400' :
                          hasIn ? 'bg-emerald-500/10 text-emerald-400' :
                          hasOut ? 'bg-amber-500/10 text-amber-400' :
                          'bg-slate-900 text-slate-500'
                        }`}>
                          {hasIn && hasOut ? 'Complete Shift' :
                           hasIn ? 'Check-In Only' :
                           hasOut ? 'Check-Out Only' :
                           'No Logs'}
                        </span>
                      </div>

                      {dayLogs.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">No activity recorded for this date cycle.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                          {dayLogs.map((log, index) => (
                            <div key={log.id || index} className="text-[9px] text-slate-300 border-b border-slate-900/60 pb-1.5 last:border-0 last:pb-0">
                              <div className="flex items-center justify-between">
                                <span className={`font-bold flex items-center gap-1 ${
                                  log.type === 'check_in' ? 'text-emerald-400' : 'text-amber-400'
                                }`}>
                                  {log.type === 'check_in' ? 'Check In' : 'Check Out'}
                                </span>
                                <span className="text-slate-500 font-mono">{log.timestamp}</span>
                              </div>
                              <p className="text-slate-400 font-mono mt-0.5 truncate">Operator: {log.username || 'Operator'}</p>
                              {log.notes && <p className="text-[8px] text-slate-500 mt-0.5 italic truncate">"{log.notes}"</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Color Legend with visual chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/40 text-[9px] font-mono text-slate-500">
            <span className="uppercase tracking-wider">Status Legend:</span>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-slate-950 border border-slate-850" />
                <span>Unlogged</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-950/40 border border-emerald-800" />
                <span>In-Only</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-950/40 border border-amber-800" />
                <span>Out-Only</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-gradient-to-br from-indigo-950 to-emerald-950 border border-indigo-500" />
                <span>Complete (In/Out)</span>
              </span>
            </div>
          </div>
        </div>

        {/* NOT USED DATES FINDER HEADER */}
        <div className="my-5 bg-slate-950/50 rounded-xl p-4 border border-slate-800/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Unlogged Dates (Unused Cycles)
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
              Search Header
            </span>
          </div>

          {unusedDays.length === 0 ? (
            <p className="text-xs text-emerald-400 flex items-center gap-1.5 py-1">
              <CheckCircle2 className="w-4 h-4" /> Perfect attendance! All 31 calendar cycles are actively logged.
            </p>
          ) : (
            <div>
              <p className="text-[11px] text-slate-400 mb-2">
                Following calendar days have no registered logs. Select any to check-in/out:
              </p>
              {/* Responsive tag cloud of unused days */}
              <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                {unusedDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`text-[10px] font-mono font-semibold px-2 py-1 rounded transition-all cursor-pointer ${
                      selectedDay === day 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105 border border-indigo-500' 
                        : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    Day {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Log Action Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Day selector (1-31) */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Day Cycle
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 text-xs text-white outline-none"
              >
                {allDays.map((d) => (
                  <option key={d} value={d}>
                    Day {d} {usedDays.includes(d) ? '✓ (Logged)' : '(Unused)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-In / Check-Out */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Registry Action
              </label>
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setLogType('check_in')}
                  className={`py-1.5 px-2 text-xs rounded-md transition-all font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                    logType === 'check_in'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> Check In
                </button>
                <button
                  type="button"
                  onClick={() => setLogType('check_out')}
                  className={`py-1.5 px-2 text-xs rounded-md transition-all font-semibold flex items-center justify-center gap-1 cursor-pointer ${
                    logType === 'check_out'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" /> Check Out
                </button>
              </div>
            </div>

            {/* Note entry */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Optional Memo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Media review done"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 text-xs text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full text-white font-medium py-2 rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              logType === 'check_in' 
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 hover:shadow-emerald-500/15' 
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/40 hover:shadow-amber-500/15'
            }`}
          >
            <CalendarCheck className="w-4 h-4" /> Save Day {selectedDay} {logType === 'check_in' ? 'Check-In' : 'Check-Out'}
          </button>
        </form>

        {/* History / Logs table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
              Registry Logs History
            </span>
            <div className="flex items-center gap-1.5">
              <select
                value={userFilter}
                onChange={(e: any) => setUserFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 py-1 px-2 rounded outline-none"
              >
                <option value="all">All Operators</option>
                <option value="mine">My Logs Only</option>
              </select>
              <select
                value={filterType}
                onChange={(e: any) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 py-1 px-2 rounded outline-none"
              >
                <option value="all">All Types</option>
                <option value="check_in">Check-Ins</option>
                <option value="check_out">Check-Outs</option>
              </select>
            </div>
          </div>

          <div className="max-h-[175px] overflow-y-auto border border-slate-800/80 rounded-lg bg-slate-950/40 divide-y divide-slate-800/50">
            {filteredRecords.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 flex flex-col items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-slate-600" />
                No logs recorded for the selected filter yet.
              </div>
            ) : (
              [...filteredRecords].reverse().map((rec) => (
                <div key={rec.id} className="p-2.5 flex items-start justify-between text-xs hover:bg-slate-900/40 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className={`inline-flex p-1 rounded mt-0.5 ${
                      rec.type === 'check_in' 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-white">Day {rec.day}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          rec.type === 'check_in' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {rec.type === 'check_in' ? 'IN' : 'OUT'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/60">
                          <User className="w-2.5 h-2.5 text-indigo-400" /> {rec.username || 'System'}
                        </span>
                      </div>
                      {rec.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <CornerDownRight className="w-2.5 h-2.5 text-slate-600 shrink-0" />
                          {rec.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-[10px] font-mono text-slate-500">
                    <div>{rec.timestamp}</div>
                    <div className="text-[9px] opacity-70">{rec.dateTime.split(' ')[0]}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
        {records.length > 0 ? (
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Download className="w-4 h-4" /> Export Attendance Logs to CSV
          </button>
        ) : (
          <div className="text-xs text-slate-500 italic">No logs recorded yet. Complete check-in to enable CSV export.</div>
        )}

        {records.length > 0 && (
          <button
            type="button"
            onClick={onClearRecords}
            className="text-[10px] text-rose-400/80 hover:text-rose-400 hover:underline transition-colors cursor-pointer font-mono"
          >
            [Reset Attendance Log Database]
          </button>
        )}
      </div>
    </div>
  );
}
