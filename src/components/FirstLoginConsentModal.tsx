import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Check, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FirstLoginConsentModalProps {
  isOpen: boolean;
  username: string;
  onAccept: () => void;
  onOpenLegal?: (tab: 'privacy' | 'terms') => void;
  onViewDetails?: (doc: string) => void;
}

export default function FirstLoginConsentModal({ isOpen, username, onAccept, onOpenLegal, onViewDetails }: FirstLoginConsentModalProps) {
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-slate-100 font-sans"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                WELCOME TO SWANIQUE AI R&D PLATFORM
              </span>
              <h2 className="text-xl font-black font-mono text-white">Legal & R&D Consent Required</h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Hello <strong className="text-white font-mono">{username}</strong>. Before accessing the Swanique AI workspace, please review and accept our Research & Development governance terms:
          </p>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">1. Privacy Policy v1.0</span>
              <button
                type="button"
                onClick={() => onOpenLegal('privacy')}
                className="text-indigo-400 hover:text-indigo-300 underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Read Policy</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center justify-between border-t border-slate-850 pt-2">
              <span className="text-slate-300 font-bold">2. Terms & Conditions v1.0</span>
              <button
                type="button"
                onClick={() => onOpenLegal('terms')}
                className="text-indigo-400 hover:text-indigo-300 underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Read Terms</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-3 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl cursor-pointer hover:bg-indigo-950/60 transition-colors">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
            />
            <span className="text-xs text-slate-200 font-medium leading-tight">
              I agree to the <strong className="text-indigo-300">Privacy Policy</strong> and <strong className="text-indigo-300">Terms & Conditions</strong> for Swanique AI R&D Participation.
            </span>
          </label>

          <button
            type="button"
            disabled={!agreed}
            onClick={onAccept}
            className={`w-full py-3.5 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
              agreed
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Accept & Enter Swanique AI Workspace</span>
          </button>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
