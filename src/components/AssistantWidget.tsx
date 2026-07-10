import React, { useState } from 'react';
import { HelpCircle, Sparkles, MessageSquare, BookOpen, Copy, Check, Terminal, FileText, ChevronUp, ChevronDown } from 'lucide-react';

interface AssistantWidgetProps {
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

const TEMPLATE_CATEGORIES = [
  {
    id: 'video_hooks',
    title: 'Viral Video Hooks',
    icon: Sparkles,
    templates: [
      {
        title: 'The Counter-Intuitive Hook',
        content: 'Why 99% of creators fail on Swanaya campaigns (And the 1-step fix...)'
      },
      {
        title: 'The Behind-The-Scenes Hook',
        content: "What we actually do at Swanaya Media Enterprises behind closed doors..."
      },
      {
        title: 'The Secret Weapon Hook',
        content: 'This single asset boosted our quarterly traction by 250%.'
      }
    ]
  },
  {
    id: 'promos_templates',
    title: 'Ad Campaigns',
    icon: FileText,
    templates: [
      {
        title: 'Dynamic Product Launch Reel',
        content: 'Caption: Introducing the new standard. 🚀 Precision-engineered by Swanaya Media. Watch to learn how we built this from the ground up.\nTags: #media #innovation #design'
      },
      {
        title: 'Customer Success Highlight',
        content: 'Caption: Real results. Real scale. See how Swanaya custom plans revolutionized our clients workflows this cycle.\nTags: #growth #enterprises #planner'
      }
    ]
  },
  {
    id: 'system_assist',
    title: 'System Guide FAQ',
    icon: BookOpen,
    templates: [
      {
        title: 'How does Video Uploading work?',
        content: 'Click "Add Registry Item", fill in the form, and drag-and-drop any video clip into the file component. Click Schedule to persist it with a live video preview player.'
      },
      {
        title: 'What does "Dates Not Used" mean?',
        content: 'The header lists calendar days (1-31) that currently have no logged Check-Ins or Check-Outs. Simply check-in for those days to clear them.'
      }
    ]
  }
];

export default function AssistantWidget({ addLog }: AssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCat, setActiveCat] = useState<string>('video_hooks');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addLog(`System: Copied template helper text "${id}" to keyboard clipboard`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      
      {/* Header section */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between cursor-pointer pb-2.5"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-white">SWANAYA Full-Assist</h3>
            <p className="text-[10px] text-slate-400">Copy-ready hooks & script frameworks</p>
          </div>
        </div>

        <div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          
          {/* Quick Categories list */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
            {TEMPLATE_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`py-1.5 px-1 rounded text-[10px] font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${
                    activeCat === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-center sm:text-left">{cat.title.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Active templates list */}
          <div className="space-y-2 max-h-[195px] overflow-y-auto pr-1">
            {TEMPLATE_CATEGORIES.find(c => c.id === activeCat)?.templates.map((tpl, idx) => {
              const uniqueId = `${activeCat}_${idx}`;
              const isCopied = copiedId === uniqueId;

              return (
                <div 
                  key={idx}
                  className="bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-xl p-3 text-xs text-left relative group transition-colors"
                >
                  <div className="flex justify-between items-start gap-3 mb-1.5">
                    <span className="font-semibold text-white text-[11px]">
                      {tpl.title}
                    </span>
                    <button
                      onClick={() => handleCopy(tpl.content, uniqueId)}
                      className={`p-1.5 rounded transition-all shrink-0 cursor-pointer ${
                        isCopied 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                      title="Copy content"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed break-words font-mono bg-slate-900/40 p-2 rounded border border-slate-900">
                    {tpl.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick System Support alert */}
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 bg-indigo-950/10 border border-indigo-900/20 py-1.5 px-3 rounded-lg">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Need extra custom setups? Dial Swanaya Admin terminal.</span>
          </div>

        </div>
      )}

    </div>
  );
}
