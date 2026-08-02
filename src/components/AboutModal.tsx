import React from 'react';
import { Sparkles, ShieldCheck, Cpu, Code2, Globe, Heart, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegalCenter?: () => void;
}

export default function AboutModal({ isOpen, onClose, onOpenLegalCenter }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6 text-slate-100 font-sans"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30 text-white">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-mono text-white tracking-tight">Swanique AI</h2>
              <span className="text-xs font-mono font-bold text-indigo-400 uppercase bg-indigo-950 px-2.5 py-0.5 rounded-md border border-indigo-800">
                Version 1.0 • R&D Preview
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Developer:</span>
              <span className="text-white font-bold">Swanaya Web Technologies</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Division:</span>
              <span className="text-indigo-400 font-bold">R&D Wing</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Engine:</span>
              <span className="text-emerald-400 font-bold">Gemini 2.5 Pro / Flash Speech</span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Swanique AI is an advanced AI-powered platform for business automation, marketing intelligence, content creation, campaign planning, and enterprise productivity developed by the R&D Wing of Swanaya Web Technologies.
          </p>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
            {onOpenLegalCenter ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLegalCenter();
                }}
                className="text-indigo-400 hover:text-indigo-300 underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Open Legal Center</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
