import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Cpu, Volume2, ShieldAlert, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TickerItem {
  id: string;
  text: string;
  category: 'MARKET' | 'SYSTEM' | 'SECURITY' | 'SIMULATION' | 'CREATIVE';
}

const INITIAL_TICKER_ITEMS: TickerItem[] = [
  { id: '1', text: 'SWANAYA ENTERPRISES: Brand campaign ROI increased +4.2x across Instagram and YouTube nodes.', category: 'MARKET' },
  { id: '2', text: 'SYSTEM MONITOR: All 12 media planner modules are currently synced with Firestore cloud database.', category: 'SYSTEM' },
  { id: '3', text: 'ATTENDANCE AUDIT: HOD Marketing & Productions Aadithyan M Menon verified ACTIVE on duty.', category: 'SECURITY' },
  { id: '4', text: 'ENGAGEMENT METRIC: Strategic Reels video planning forecast outputs yielding +185% organic CTR.', category: 'CREATIVE' },
  { id: '5', text: 'REAL-TIME BACKEND: Live logs streaming is operational under secure container port rules.', category: 'SYSTEM' }
];

export default function RealTimeTicker() {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>(INITIAL_TICKER_ITEMS);
  const [activeSimulationAlert, setActiveSimulationAlert] = useState<{ id: string; message: string; type: string } | null>(null);

  useEffect(() => {
    const handleSimulationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; message: string }>;
      if (!customEvent.detail) return;

      const { type, message } = customEvent.detail;

      // Do not show security recovery messages in the top ticker marquee feed
      if (type === 'SECURITY RECOVERY') {
        return;
      }

      const newItem: TickerItem = {
        id: `sim-${Date.now()}`,
        text: `🔥 SIMULATION COMPLETED [${type.toUpperCase()}]: ${message}`,
        category: 'SIMULATION'
      };

      // Add the new simulation report to the ticker list
      setTickerItems(prev => [newItem, ...prev]);

      // Trigger active notification banner animation
      setActiveSimulationAlert({
        id: `alert-${Date.now()}`,
        message,
        type
      });

      // Automatically dismiss simulation alert after 5 seconds
      const timer = setTimeout(() => {
        setActiveSimulationAlert(null);
      }, 5000);

      return () => clearTimeout(timer);
    };

    window.addEventListener('swanaya-simulation', handleSimulationEvent);
    return () => window.removeEventListener('swanaya-simulation', handleSimulationEvent);
  }, []);

  // Duplicate elements for seamless endless marquee scrolling
  const marqueeContent = [...tickerItems, ...tickerItems];

  return (
    <div className="w-full relative z-50">
      {/* 1. Global Scrolling Ticker Header */}
      <div className="w-full bg-slate-950/90 border-b border-indigo-950/80 text-white py-1.5 overflow-hidden flex items-center backdrop-blur-md">
        <div className="bg-indigo-900/40 border border-indigo-500/30 text-indigo-400 font-mono text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ml-3 shrink-0 flex items-center gap-1 z-10 shadow shadow-indigo-500/10">
          <TrendingUp className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span>Swanaya Live Feed</span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker flex items-center gap-12 pl-6">
            {marqueeContent.map((item, idx) => {
              let tagColor = 'text-indigo-400 bg-indigo-950/40 border-indigo-900/30';
              if (item.category === 'SECURITY') tagColor = 'text-rose-400 bg-rose-950/40 border-rose-900/30';
              if (item.category === 'CREATIVE') tagColor = 'text-amber-400 bg-amber-950/40 border-amber-900/30';
              if (item.category === 'SIMULATION') tagColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-900/30 animate-pulse';

              return (
                <div key={`${item.id}-${idx}`} className="flex items-center gap-3 text-xs font-medium font-sans hover:text-indigo-300 transition-colors">
                  <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${tagColor}`}>
                    {item.category}
                  </span>
                  <span className="text-slate-300 font-mono tracking-wide">{item.text}</span>
                  <span className="text-slate-700 font-bold font-mono select-none">•</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Slide-down Ticker Notification Animation (Simulation HUD Alert) */}
      <AnimatePresence>
        {activeSimulationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-full max-w-lg px-4"
          >
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/50 rounded-xl p-4 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl relative overflow-hidden">
              {/* Background Glow Ring */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-3.5 relative z-10 text-left">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/30 animate-bounce">
                  <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-widest animate-pulse">
                      Simulation Executed
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Real-time Feed</span>
                  </div>
                  
                  <h5 className="text-xs font-bold font-mono text-white uppercase tracking-tight">
                    {activeSimulationAlert.type} Mode Active
                  </h5>
                  
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {activeSimulationAlert.message}
                  </p>
                </div>

                <button
                  onClick={() => setActiveSimulationAlert(null)}
                  className="p-1 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
