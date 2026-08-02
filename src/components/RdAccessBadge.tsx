import React from 'react';
import { Cpu, Sparkles, ShieldCheck, Layers, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface RdAccessBadgeProps {
  level: string;
  onClick?: () => void;
  className?: string;
}

export default function RdAccessBadge({ level, onClick, className = '' }: RdAccessBadgeProps) {
  const normalized = (level || 'Research').toLowerCase();

  let tierLabel = 'RESEARCH TIER 2';
  let badgeColor = 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50 shadow-indigo-500/20';
  let dotColor = 'bg-indigo-400';
  let Icon = Cpu;

  if (normalized.includes('community')) {
    tierLabel = 'COMMUNITY TIER 1';
    badgeColor = 'bg-slate-800/80 text-slate-300 border-slate-600/60 shadow-slate-900/40';
    dotColor = 'bg-slate-400';
    Icon = Layers;
  } else if (normalized.includes('beta')) {
    tierLabel = 'BETA TIER 3';
    badgeColor = 'bg-amber-950/90 text-amber-300 border-amber-500/50 shadow-amber-500/20';
    dotColor = 'bg-amber-400';
    Icon = Sparkles;
  } else if (normalized.includes('enterprise')) {
    tierLabel = 'ENTERPRISE TIER 4';
    badgeColor = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20';
    dotColor = 'bg-emerald-400';
    Icon = Zap;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.04, translateY: -1 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      type="button"
      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-xs font-mono backdrop-blur-xl shadow-lg transition-all cursor-pointer ${className}`}
      title={`R&D Access Level: ${level}. Click to manage research access & compute credits.`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
        <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${dotColor} animate-ping opacity-75`} />
        <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">R&D Access:</span>
        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border ${badgeColor}`}>
          {tierLabel}
        </span>
      </div>

      <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
    </motion.button>
  );
}
