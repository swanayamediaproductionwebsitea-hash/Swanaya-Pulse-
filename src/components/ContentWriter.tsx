import React, { useState } from 'react';
import { FileText, Save, Download, Sparkles } from 'lucide-react';
import { ContentDocument } from '../types';

interface ContentWriterProps {
  currentUser: string;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload' | 'error') => void;
  isDemoUser?: boolean;
}

export default function ContentWriter({ currentUser, addLog, isDemoUser = false }: ContentWriterProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [template, setTemplate] = useState<'Proposal' | 'Script' | 'Agreement' | 'Brief' | 'General'>('General');

  const handleSave = () => {
    addLog(`Writer: Saved document "${title || 'Untitled'}"`, 'success');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.txt`;
    a.click();
    addLog(`Writer: Downloaded document "${title || 'Untitled'}"`, 'info');
  };

  const handleAIComplete = () => {
    addLog('AI Assist: Generating text structure...', 'info');
    setTimeout(() => {
      setContent(prev => prev + '\n\n[AI Generated Expansion]\nBased on the current context, this project will focus on dynamic multi-channel engagement to maximize audience retention.');
      addLog('AI Assist: Completed generation.', 'success');
    }, 1000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-400" />
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-tight">Ultimate Content Planning Software built by Swanaya Media Enterprises Team</h2>
            <p className="text-xs text-slate-400">Draft, format, and generate scripts or proposals.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAIComplete} className="bg-indigo-950/60 border border-indigo-900/50 hover:bg-indigo-900/60 text-indigo-300 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Expand
          </button>
          <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs flex items-center gap-1">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={handleDownload} className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Document Title" 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          />
          <select 
            value={template}
            onChange={e => setTemplate(e.target.value as any)}
            className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="General">General Form</option>
            <option value="Script">Video Script</option>
            <option value="Proposal">Client Proposal</option>
            <option value="Brief">Creative Brief</option>
            <option value="Agreement">Standard Agreement</option>
          </select>
        </div>
        <textarea 
          placeholder="Start writing or ask AI for help..."
          value={content}
          onChange={e => setContent(e.target.value)}
          className="flex-1 bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-slate-300 font-sans resize-none focus:outline-none focus:border-indigo-500 leading-relaxed"
        />
      </div>
    </div>
  );
}
