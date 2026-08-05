import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, Check, QrCode, X, Globe, ExternalLink, Sparkles, Send, Mail, Twitter, Linkedin, MessageSquare } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab?: string;
  addLog?: (msg: string, type?: 'info' | 'success' | 'warning' | 'action') => void;
}

export default function ShareAppModal({ isOpen, onClose, currentTab = 'home', addLog }: ShareAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedModule, setCopiedModule] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-w2jxzs5jepicxs4kkfysxx-824280276630.asia-southeast1.run.app';
  const fullShareUrl = `${baseUrl}?module=${currentTab}`;

  const handleCopyLink = (urlToCopy: string, moduleName?: string) => {
    navigator.clipboard.writeText(urlToCopy);
    if (moduleName) {
      setCopiedModule(moduleName);
      setTimeout(() => setCopiedModule(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (addLog) {
      addLog(`App Share: Copied share link [${urlToCopy}] to clipboard`, 'success');
    }
  };

  const moduleLinks = [
    { id: 'planner', name: 'Content Planner Workspace', icon: '🎬', url: `${baseUrl}?module=planner` },
    { id: 'writer', name: 'AI Copywriter & Editor', icon: '📝', url: `${baseUrl}?module=writer` },
    { id: 'research', name: 'R&D Compute Lab', icon: '⚡', url: `${baseUrl}?module=research` },
    { id: 'tasks', name: 'Task Manager Hub', icon: '✅', url: `${baseUrl}?module=tasks` },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl z-10 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  Share App & Workspace Link
                  <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">Invite collaborators & clients to view applet</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5 pt-4">
            {/* Primary Shareable Link Input */}
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1.5 flex items-center justify-between">
                <span>Primary Applet URL</span>
                {copied && <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Copied to Clipboard</span>}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-xs font-mono text-indigo-300 overflow-hidden">
                  <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{fullShareUrl}</span>
                </div>
                <button
                  onClick={() => handleCopyLink(fullShareUrl)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* QR Code & Fast Social Shares */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="sm:col-span-1 flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-700 text-center">
                {/* Visual SVG QR Code simulation */}
                <svg className="w-24 h-24" viewBox="0 0 100 100">
                  <rect width="100" height="100" fill="white" />
                  <path d="M10 10h30v30h-30zM15 15v20h20v-20zM20 20h10v10h-10z" fill="#0f172a" />
                  <path d="M60 10h30v30h-30zM65 15v20h20v-20zM70 20h10v10h-10z" fill="#0f172a" />
                  <path d="M10 60h30v30h-30zM15 65v20h20v-20zM20 70h10v10h-10z" fill="#0f172a" />
                  <rect x="45" y="10" width="10" height="20" fill="#4f46e5" />
                  <rect x="45" y="35" width="20" height="10" fill="#0f172a" />
                  <rect x="10" y="45" width="25" height="10" fill="#0f172a" />
                  <rect x="45" y="55" width="15" height="15" fill="#4f46e5" />
                  <rect x="65" y="45" width="25" height="25" fill="#0f172a" />
                  <rect x="75" y="75" width="15" height="15" fill="#4f46e5" />
                  <rect x="45" y="75" width="20" height="15" fill="#0f172a" />
                </svg>
                <span className="text-[9px] font-mono font-bold text-slate-800 mt-1">Scan for Mobile</span>
              </div>

              <div className="sm:col-span-2 flex flex-col justify-between space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Quick Broadcast Shortcuts</span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out our AI Workspace: ${fullShareUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold hover:bg-emerald-900/60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullShareUrl)}&text=${encodeURIComponent('Swanique AI Workspace Applet')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-300 text-xs font-bold hover:bg-sky-900/60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    <span>Twitter / X</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullShareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-bold hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Linkedin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`mailto:?subject=Swanique AI Workspace Access&body=${encodeURIComponent(`Access the workspace here: ${fullShareUrl}`)}`}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Module Deep Links */}
            <div>
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-2">Direct Module Share Links</span>
              <div className="space-y-1.5">
                {moduleLinks.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-200 font-semibold flex items-center gap-2">
                      <span>{mod.icon}</span>
                      <span>{mod.name}</span>
                    </span>
                    <button
                      onClick={() => handleCopyLink(mod.url, mod.id)}
                      className="text-[10px] font-mono font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-900/40 cursor-pointer"
                    >
                      {copiedModule === mod.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedModule === mod.id ? 'Copied' : 'Copy Deep Link'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
