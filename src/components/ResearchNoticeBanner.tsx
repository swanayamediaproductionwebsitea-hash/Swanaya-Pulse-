import React, { useState } from 'react';
import { Cpu, Sparkles, X, Info, ExternalLink } from 'lucide-react';

interface ResearchNoticeBannerProps {
  onOpenLegalCenter?: () => void;
  onOpenLegal?: () => void;
}

export default function ResearchNoticeBanner({ onOpenLegalCenter, onOpenLegal }: ResearchNoticeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-950 border-b border-indigo-500/30 text-slate-200 px-4 py-2 flex items-center justify-between text-xs font-mono shrink-0 relative z-30 shadow-md">
      <div className="flex items-center gap-2 max-w-5xl overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="p-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded shrink-0">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
        </span>
        <span className="font-bold text-indigo-300 uppercase tracking-wider shrink-0">
          R&D PREVIEW NOTICE:
        </span>
        <span className="text-slate-300 font-sans truncate">
          This platform is currently provided as a Research & Development (R&D) preview. Features, AI outputs, and availability may change as we continue development.
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-2">
        {onOpenLegalCenter && (
          <button
            type="button"
            onClick={onOpenLegalCenter}
            className="text-[10px] font-mono font-bold text-indigo-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
          >
            <span>Legal Center</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>
        )}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss R&D Banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
