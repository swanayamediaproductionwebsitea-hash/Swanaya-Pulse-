import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Mail, MessageSquare, X, Check, Copy, Bell, 
  HelpCircle, ChevronUp, ChevronDown, Terminal, ShieldAlert 
} from 'lucide-react';
import AssistantWidget from './AssistantWidget';

interface PopupHubProps {
  addLog?: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

interface SystemMessage {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  code?: string;
  unread: boolean;
}

export default function PopupHub({ addLog }: PopupHubProps) {
  const [activePopup, setActivePopup] = useState<'ai' | 'messenger' | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Secure Messenger Messages State
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([
    {
      id: 'init',
      type: 'PORTAL LINK',
      message: '🔒 Portal Secure Link Node: Ready for direct creative partner authorization.',
      timestamp: Date.now(),
      unread: true
    }
  ]);

  // Ref to audio for a subtle soft notification tone
  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // AudioContext blocks until user interaction, ignore errors
    }
  };

  // Listen to the simulation events (like password recovery triggers) globally
  useEffect(() => {
    const handleSimulationEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; message: string }>;
      if (!customEvent.detail) return;

      const { type, message } = customEvent.detail;
      
      // Extract code like SWANAYA-123456
      const codeMatch = message.match(/\[(SWANAYA-\d+)\]/);
      const code = codeMatch ? codeMatch[1] : undefined;

      const newMessage: SystemMessage = {
        id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type,
        message,
        timestamp: Date.now(),
        code,
        unread: true
      };

      setSystemMessages(prev => [newMessage, ...prev]);
      
      if (activePopup !== 'messenger') {
        setUnreadCount(prev => prev + 1);
      }
      
      // Play a soft synth beep to notify user of new code/dispatch
      playAlertSound();

      if (addLog) {
        addLog(`Notification received in Popup Messenger: [${type}]`, 'success');
      }
    };

    window.addEventListener('swanaya-simulation', handleSimulationEvent);
    return () => window.removeEventListener('swanaya-simulation', handleSimulationEvent);
  }, [activePopup, addLog]);

  const handleToggle = (popup: 'ai' | 'messenger') => {
    if (activePopup === popup) {
      setActivePopup(null);
    } else {
      setActivePopup(popup);
      if (popup === 'messenger') {
        setUnreadCount(0);
        // Mark all as read
        setSystemMessages(prev => prev.map(m => ({ ...m, unread: false })));
      }
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedMessageId(id);
    if (addLog) {
      addLog(`Copied authorization code: ${code}`, 'success');
    }
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const clearMessages = () => {
    setSystemMessages([
      {
        id: 'init',
        type: 'PORTAL LINK',
        message: '🔒 Portal Secure Link Node: Ready for direct creative partner authorization.',
        timestamp: Date.now(),
        unread: false
      }
    ]);
    setUnreadCount(0);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Popovers Area */}
      <AnimatePresence>
        {activePopup === 'ai' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-[320px] sm:w-[380px] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 pointer-events-auto mb-2 relative overflow-hidden"
            id="ai-popup-panel"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full filter blur-2xl -mr-8 -mt-8 pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black font-mono text-white uppercase tracking-wider">
                    Swanaya AI Assistant
                  </h4>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">
                    Live System Co-Pilot
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePopup(null)}
                className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded AssistantWidget with scrolling container */}
            <div className="max-h-[350px] overflow-y-auto pr-1">
              <AssistantWidget addLog={addLog || (() => {})} />
            </div>
          </motion.div>
        )}

        {activePopup === 'messenger' && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="w-[320px] sm:w-[380px] bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-4 pointer-events-auto mb-2 relative overflow-hidden"
            id="messenger-popup-panel"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-600/10 rounded-full filter blur-2xl -ml-8 -mt-8 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black font-mono text-white uppercase tracking-wider">
                    📩 Secure Messenger
                  </h4>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">
                    Encrypted Verification Feed
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {systemMessages.length > 1 && (
                  <button
                    onClick={clearMessages}
                    className="text-[9px] font-mono text-slate-500 hover:text-slate-300 hover:underline cursor-pointer transition-colors"
                  >
                    Clear Feed
                  </button>
                )}
                <button
                  onClick={() => setActivePopup(null)}
                  className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of security logs & dispatches */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {systemMessages.length === 0 ? (
                <p className="text-[10px] text-slate-600 font-mono text-center py-8">
                  Inbox is empty.
                </p>
              ) : (
                <div className="space-y-2">
                  {systemMessages.map((msg) => {
                    let tagClass = 'bg-indigo-950/50 text-indigo-400 border-indigo-900/30';
                    if (msg.type === 'SECURITY RECOVERY') {
                      tagClass = 'bg-rose-950/50 text-rose-300 border-rose-900/30 animate-pulse';
                    }
                    
                    return (
                      <div 
                        key={msg.id}
                        className={`border rounded-xl p-3 flex flex-col gap-1.5 transition-all bg-slate-900/60 hover:bg-slate-900 ${
                          msg.unread ? 'border-indigo-500/30 ring-1 ring-indigo-500/10' : 'border-slate-850/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded border ${tagClass}`}>
                            {msg.type}
                          </span>
                          <span className="text-[8px] text-slate-500 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {msg.message}
                        </p>

                        {msg.code && (
                          <div className="mt-1 bg-slate-950/80 border border-indigo-500/20 rounded-lg p-2 flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-bold text-indigo-300 tracking-wider">
                              Code: {msg.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(msg.code || '', msg.id)}
                              className="p-1 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 hover:text-indigo-200 rounded-md border border-indigo-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>COPIED</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>COPY</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="mt-2 text-center text-[9px] text-slate-500 font-mono uppercase tracking-widest">
              ⚡ Live Socket Link Active
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button Group */}
      <div className="flex flex-row gap-3 pointer-events-auto">
        
        {/* AI Co-Pilot Floating Action Button */}
        <button
          onClick={() => handleToggle('ai')}
          className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-2xl transition-all duration-350 cursor-pointer active:scale-90 relative ${
            activePopup === 'ai'
              ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-500/30 ring-4 ring-indigo-500/25'
              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-indigo-400'
          }`}
          title="Open AI Assistant Popup"
        >
          <Sparkles className={`w-5 h-5 ${activePopup === 'ai' ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          {/* Subtle surrounding glow */}
          <span className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping opacity-10 pointer-events-none" />
        </button>

        {/* Secure Messenger Floating Action Button */}
        <button
          onClick={() => handleToggle('messenger')}
          className={`w-12 h-12 rounded-full border flex items-center justify-center shadow-2xl transition-all duration-350 cursor-pointer active:scale-90 relative ${
            activePopup === 'messenger'
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30 ring-4 ring-emerald-500/25'
              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400'
          }`}
          title="Open Secure Messenger Popover"
        >
          <Mail className="w-5 h-5" />
          
          {/* Unread Alert Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black font-mono text-white ring-2 ring-slate-950 shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
          
          {/* Pulsing signal dot on bottom corner */}
          <span className="absolute bottom-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </button>

      </div>

    </div>
  );
}
