import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Sparkles, Plus, Trash2, Download, Printer, ExternalLink, 
  Layers, UploadCloud, RefreshCw, CheckCircle2, AlertCircle, Copy, Check, FileCode, ShieldAlert
} from 'lucide-react';
import { ContentDocument } from '../types';
import { launchGooglePicker } from '../lib/googlePicker';

interface ContentWriterProps {
  currentUser: string;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  isDemoUser?: boolean;
}

const TEMPLATES = {
  General: {
    title: 'Untitled Document',
    content: `# Swanaya Media Document Draft
Date: ${new Date().toISOString().split('T')[0]}
Author: USER_NAME

Write your content here...`
  },
  Proposal: {
    title: 'Media Campaign Proposal',
    content: `# SWANAYA MEDIA PRODUCTION • PROPOSAL
## CLIENT: Acme Global Brand Campaign
### Date: ${new Date().toISOString().split('T')[0]}
### Prepared By: USER_NAME (Consultant)

---

### 1. EXECUTION STRATEGY
We propose a comprehensive multi-channel content strategy spanning Instagram Reels, YouTube Shorts, and high-conversion landing page creatives.

### 2. DELIVERABLES
* **Video Production**: 12 custom video reels with professional color grading.
* **Ad Optimization**: Google & Meta Ads targeting setup and bid adjustments.
* **Asset Vault**: Google Drive folder containing raw footage and final renders.

### 3. ESTIMATED CAMPAIGN TIMELINE
* **Week 1-2**: Storyboarding & Pre-Production brief alignment.
* **Week 3-4**: Filming & Visual Design exports.
* **Week 5**: Launch & Real-time performance tracking activation.`
  },
  Script: {
    title: 'Video Production Script',
    content: `# VIDEO PRODUCTION SCRIPT • SWANAYA LABS
## TITLE: "The Future of Digital Content Creation"
### Video Duration: 60 Seconds (Short-form format)
### Target Platform: Instagram Reels / YouTube Shorts

---

| TIMECODE | VISUAL CUE (CAMERA/GRAPHIC) | AUDIO DESCRIPTION / VOICE OVER |
| :--- | :--- | :--- |
| **00:00 - 00:05** | High-energy zoom into a cinematic office setup. Text overlay fade-in. | "Everyone is talking about short-form video. But here is the secret most agencies hide..." |
| **00:05 - 00:15** | Quick-cut series of metrics screens, campaign reach graphs climbing. | "The secret isn't high budgets or fancy setups. It is raw, high-retention hook alignment." |
| **00:15 - 00:45** | Demonstrating Swanaya media workspace layout, content planner node. | "With Swanaya's fully integrated production suite, we coordinate our campaigns securely in one click." |
| **00:45 - 00:60** | Call-to-action slide with website link and high-contrast logo. | "Claim your custom strategy proposal today. Visit our link in bio to get started now." |`
  },
  Agreement: {
    title: 'Standard Agency Agreement',
    content: `# SWANAYA ENTERPRISES • BRAND PARTNERSHIP CONTRACT
## CO-OPERATION & SERVICE LEVEL AGREEMENT

This Agreement is made on this date of ${new Date().toISOString().split('T')[0]} by and between:
**SWANAYA MEDIA & PRODUCTIONS** (hereafter "Agency") and the **REGISTERED PARTNER** (hereafter "Client").

---

### 1. SCOPE OF SERVICES
The Agency agrees to provide digital media optimization, video asset editing, and scheduled publishing campaigns as logged inside the Swanaya Content Planner.

### 2. FEES & COMPENSATION
The Client agrees to pay the designated deposit fee within 7 business days of signing. Remaining milestones will be billed monthly upon review.

### 3. INTELLECTUAL PROPERTY & WATERMARKS
All final approved video renders and copy assets shall belong to the Client. Drafts, scripts, and temporary workspace document uploads remain proprietary to the Agency and may carry security verification watermarks.

### 4. SIGNATURES & VERIFICATION
* **For Agency**: Authorized Representative
* **For Client**: Verified Workspace User`
  },
  Brief: {
    title: 'Creative Campaign Brief',
    content: `# CREATIVE CAMPAIGN BRIEF
## PROJECT NAME: Summer Reach Accelerator
### Target Audience: Content Creators & Digital Marketers
### Objective: Drive 10,000 workspace trial check-ins

---

### 1. KEY CAMPAIGN MESSAGES
* "Digital operations don't have to be scattered."
* "Keep your client data, campaign metrics, and content schedules synchronized."

### 2. BRAND TONE & VISUAL GUIDELINES
* **Tone**: Technical but friendly, minimalist, high contrast, transparent.
* **Color Accents**: Slate off-whites, indigo highlights, emerald status colors.
* **Visual Style**: Clean typography (Inter, JetBrains Mono) with rich functional layouts.

### 3. BUDGET & EXPECTED METRICS
* **Ad Spend**: $1,500 total allocated.
* **Target CPA**: Under $2.50 per verified sign-up.`
  }
};

export default function ContentWriter({ currentUser, addLog, isDemoUser = false }: ContentWriterProps) {
  const [documents, setDocuments] = useState<ContentDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  // Active editor fields
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docTemplate, setDocTemplate] = useState<keyof typeof TEMPLATES>('General');
  const [docWatermark, setDocWatermark] = useState(true);
  const [watermarkText, setWatermarkText] = useState('SWANAYA MEDIA & ENTERPRISES • CONFIDENTIAL DRAFT');
  
  // Linked Google Doc state
  const [linkedDocId, setLinkedDocId] = useState<string | null>(null);
  const [linkedDocUrl, setLinkedDocUrl] = useState<string | null>(null);
  const [linkedDocName, setLinkedDocName] = useState<string | null>(null);

  // App UI states
  const [isCopied, setIsCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'unsynced' | 'syncing'>('synced');
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Load documents
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch('/api/documents');
        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
          localStorage.setItem('swanaya_documents', JSON.stringify(data));
          
          if (data.length > 0) {
            selectDoc(data[0]);
          }
          return;
        }
      } catch (err) {
        console.warn('Database offline, reading local documents:', err);
      }

      // Local storage fallback
      const cached = localStorage.getItem('swanaya_documents');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setDocuments(parsed);
          if (parsed.length > 0) {
            selectDoc(parsed[0]);
          }
        } catch (e) {
          console.error('Error parsing cached documents', e);
        }
      } else {
        // Create initial default document
        const initialDoc: ContentDocument = {
          id: '1',
          title: 'Welcome to Swanaya Document Studio',
          content: TEMPLATES.General.content.replace('USER_NAME', currentUser || 'Administrator'),
          templateType: 'General',
          lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16),
          modifiedBy: currentUser || 'each',
          hasWatermark: true
        };
        setDocuments([initialDoc]);
        localStorage.setItem('swanaya_documents', JSON.stringify([initialDoc]));
        selectDoc(initialDoc);
      }
    };

    fetchDocs();
  }, []);

  const selectDoc = (doc: ContentDocument) => {
    setSelectedDocId(doc.id);
    setDocTitle(doc.title);
    setDocContent(doc.content);
    setDocTemplate(doc.templateType);
    setDocWatermark(doc.hasWatermark);
    setLinkedDocId(doc.googleDocId || null);
    setLinkedDocUrl(doc.googleDocUrl || null);
    setLinkedDocName(doc.googleDocId ? 'Linked Google Doc' : null);
    setSyncStatus('synced');
  };

  // Sync / Save to DB and Storage
  const handleSaveDocument = async (updatedDocsList = documents) => {
    if (!selectedDocId) return;
    setSyncStatus('syncing');

    const updatedDoc: ContentDocument = {
      id: selectedDocId,
      title: docTitle,
      content: docContent,
      templateType: docTemplate,
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16),
      modifiedBy: currentUser || 'each',
      googleDocId: linkedDocId || undefined,
      googleDocUrl: linkedDocUrl || undefined,
      hasWatermark: docWatermark
    };

    const nextDocs = updatedDocsList.map(d => d.id === selectedDocId ? updatedDoc : d);
    setDocuments(nextDocs);
    localStorage.setItem('swanaya_documents', JSON.stringify(nextDocs));

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDoc)
      });
      if (response.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('unsynced');
      }
    } catch (err) {
      console.warn('Sync failed, saved locally:', err);
      setSyncStatus('unsynced');
    }

    // Sync to Firestore directly as well
    try {
      const { doc: fsDoc, setDoc: fsSetDoc } = await import('firebase/firestore');
      const { db: fsDb } = await import('../lib/firebase');
      const docRef = fsDoc(fsDb, 'documents', selectedDocId);
      await fsSetDoc(docRef, { ...updatedDoc, syncTime: new Date().toISOString() });
    } catch (fErr) {
      console.warn("Firestore documents sync failed:", fErr);
    }
  };

  // Auto save trigger on field blur or small delay
  const handleFieldChange = () => {
    setSyncStatus('unsynced');
  };

  const handleCreateNew = async () => {
    if (isDemoUser && documents.length >= 2) {
      alert('Demo Account Limit Reached: Demo trial accounts are restricted to a maximum of 2 active draft documents in the workspace. Upgrade to full partner operator credentials to unlock unrestricted content generation.');
      addLog('Demo Warning: Blocked document creation attempt due to 2-document trial limit.', 'warning');
      return;
    }

    const newId = String(Date.now());
    const newDoc: ContentDocument = {
      id: newId,
      title: 'New Document Draft',
      content: TEMPLATES.General.content.replace('USER_NAME', currentUser || 'Administrator'),
      templateType: 'General',
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16),
      modifiedBy: currentUser || 'each',
      hasWatermark: true
    };

    const nextDocs = [newDoc, ...documents];
    setDocuments(nextDocs);
    localStorage.setItem('swanaya_documents', JSON.stringify(nextDocs));
    
    setSelectedDocId(newId);
    setDocTitle(newDoc.title);
    setDocContent(newDoc.content);
    setDocTemplate('General');
    setDocWatermark(true);
    setLinkedDocId(null);
    setLinkedDocUrl(null);
    setLinkedDocName(null);
    
    addLog(`System action: Created new draft document node`, 'success');

    // Sync save
    try {
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDoc)
      });
    } catch (e) {}
  };

  const handleDeleteDoc = async (id: string) => {
    if (documents.length <= 1) {
      alert('You must keep at least one document in the workspace.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this document? This action is permanent.')) {
      return;
    }

    const nextDocs = documents.filter(d => d.id !== id);
    setDocuments(nextDocs);
    localStorage.setItem('swanaya_documents', JSON.stringify(nextDocs));

    try {
      await fetch(`/api/documents?id=${id}`, { method: 'DELETE' });
    } catch (err) {}

    // Delete Firestore
    try {
      const { doc: fsDoc, deleteDoc: fsDeleteDoc } = await import('firebase/firestore');
      const { db: fsDb } = await import('../lib/firebase');
      await fsDeleteDoc(fsDoc(fsDb, 'documents', id));
    } catch (e) {}

    addLog(`System action: Deleted document node ID "${id}"`, 'warning');

    if (selectedDocId === id && nextDocs.length > 0) {
      selectDoc(nextDocs[0]);
    }
  };

  const applyTemplate = (tplKey: keyof typeof TEMPLATES) => {
    if (window.confirm('Applying a new template will overwrite your current draft. Do you want to proceed?')) {
      const selectedTpl = TEMPLATES[tplKey];
      setDocTitle(selectedTpl.title);
      setDocContent(selectedTpl.content.replace('USER_NAME', currentUser || 'Administrator'));
      setDocTemplate(tplKey);
      setSyncStatus('unsynced');
      addLog(`System action: Applied creative template [${tplKey}]`, 'action');
    }
  };

  // Google Picker Linkage
  const handleGoogleDocsLink = () => {
    addLog('Google Picker: Requesting Google Docs auth context...', 'info');
    launchGooglePicker(
      (file) => {
        setLinkedDocId(file.id);
        setLinkedDocUrl(file.url);
        setLinkedDocName(file.name);
        setSyncStatus('unsynced');
        addLog(`Google Picker: Successfully integrated document "${file.name}"`, 'upload');
      },
      () => {
        addLog('Google Picker: User dismissed document picker', 'info');
      },
      (err) => {
        addLog(`Google Picker: Connection failure (${err})`, 'warning');
      }
    );
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(docContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    addLog('Clipboard Action: Copied document text draft', 'success');
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker active. Enable pop-ups to open print-ready document view.');
      return;
    }

    // Process markdown headers and formatting to simple elegant print CSS
    const formattedContent = docContent
      .replace(/^# (.*$)/gim, '<h1 class="heading-1">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="heading-2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="heading-3">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${docTitle} - Printable Document</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              background-color: #ffffff;
              margin: 0;
              padding: 40px;
              line-height: 1.6;
              font-size: 14px;
              position: relative;
              min-height: 90vh;
            }

            .watermark-overlay {
              display: ${docWatermark ? 'flex' : 'none'};
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              justify-content: center;
              align-items: center;
              z-index: -1;
              overflow: hidden;
              pointer-events: none;
            }

            .watermark-text {
              font-family: 'Inter', sans-serif;
              font-weight: 800;
              font-size: 42px;
              color: rgba(15, 23, 42, 0.05);
              text-transform: uppercase;
              letter-spacing: 4px;
              transform: rotate(-35deg);
              white-space: nowrap;
              text-align: center;
              line-height: 1.5;
            }

            .doc-header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 15px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }

            .brand-meta {
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1px;
              text-align: right;
            }

            .doc-title {
              font-size: 26px;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 5px 0;
              letter-spacing: -0.5px;
            }

            .doc-body {
              color: #334155;
              font-size: 14px;
            }

            .heading-1 {
              font-size: 20px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 25px;
              margin-bottom: 12px;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 6px;
            }

            .heading-2 {
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
              margin-top: 20px;
              margin-bottom: 10px;
            }

            .heading-3 {
              font-size: 14px;
              font-weight: 600;
              color: #475569;
              margin-top: 15px;
              margin-bottom: 8px;
            }

            hr {
              border: 0;
              border-top: 1px solid #e2e8f0;
              margin: 20px 0;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 13px;
            }

            th {
              background: #f8fafc;
              font-weight: 600;
              text-align: left;
              padding: 8px 12px;
              border: 1px solid #e2e8f0;
              color: #334155;
            }

            td {
              padding: 8px 12px;
              border: 1px solid #e2e8f0;
              color: #475569;
            }

            tr:nth-child(even) {
              background: #f8fafc;
            }

            .doc-footer {
              position: absolute;
              bottom: 20px;
              left: 40px;
              right: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 10px;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #94a3b8;
              font-family: 'JetBrains Mono', monospace;
            }

            .btn-print-overlay {
              position: fixed;
              bottom: 25px;
              right: 25px;
              background-color: #4f46e5;
              color: white;
              font-weight: bold;
              padding: 10px 20px;
              border-radius: 9999px;
              border: none;
              box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
              cursor: pointer;
              font-size: 13px;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            @media print {
              .btn-print-overlay {
                display: none;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="watermark-overlay">
            <div class="watermark-text">
              ${watermarkText}<br/>
              ${watermarkText}<br/>
              ${watermarkText}
            </div>
          </div>

          <div class="doc-header">
            <div>
              <h1 class="doc-title">${docTitle}</h1>
              <div style="font-size: 11px; color: #64748b;">
                Template: <strong>${docTemplate}</strong> • Modified by: ${currentUser || 'each'}
              </div>
            </div>
            <div class="brand-meta">
              Swanaya Enterprises<br/>
              Verified Secure Node<br/>
              Date: ${new Date().toISOString().split('T')[0]}
            </div>
          </div>

          <div class="doc-body">
            ${formattedContent}
          </div>

          ${linkedDocUrl ? `
            <div style="margin-top: 35px; padding: 12px; border: 1px dashed #cbd5e1; border-radius: 6px; background-color: #f8fafc; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #475569;">
              🔗 <strong>INTEGRATED WORKSPACE DIRECTORY:</strong><br/>
              Linked Google Document Name: ${linkedDocName || 'Google Doc'}<br/>
              Resource Link: <a href="${linkedDocUrl}" target="_blank" style="color: #4f46e5; text-decoration: none;">${linkedDocUrl}</a>
            </div>
          ` : ''}

          <div class="doc-footer">
            <span>SWANAYA CONTENT WRITER & VERIFIED SYSTEM LOGS</span>
            <span>Document ID: ${selectedDocId} • System Authenticated</span>
          </div>

          <button class="btn-print-overlay" onclick="window.print()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-printer"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6 14" width="12" height="8"></rect></svg>
            Print / Save to PDF
          </button>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    addLog(`System action: Exported document "${docTitle}" with company watermark overlay`, 'success');
  };

  const currentDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
      
      {/* Sidebar - Document List & Templates */}
      <div className="w-full lg:w-64 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-800/60 lg:pr-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white uppercase tracking-wider font-mono">Document Studio</span>
          </div>
          <button 
            onClick={handleCreateNew}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono uppercase font-bold"
            title="Create New Document Draft"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        {/* Sync Indicator */}
        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850 flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-400">Database Connection</span>
          {syncStatus === 'syncing' && (
            <span className="text-amber-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Syncing</span>
          )}
          {syncStatus === 'synced' && (
            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Secure Synced</span>
          )}
          {syncStatus === 'unsynced' && (
            <span className="text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Unsaved draft</span>
          )}
        </div>

        {/* Document List */}
        <div className="space-y-1.5 max-h-48 lg:max-h-[220px] overflow-y-auto pr-1">
          <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider">Active Drafts</label>
          {documents.map(doc => (
            <div 
              key={doc.id}
              onClick={() => selectDoc(doc)}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                selectedDocId === doc.id 
                  ? 'bg-indigo-950/20 border-indigo-500/30 text-white' 
                  : 'bg-slate-950/20 border-transparent hover:border-slate-850 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className={`w-3.5 h-3.5 shrink-0 ${selectedDocId === doc.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-xs font-medium truncate font-sans">{doc.title || 'Untitled Draft'}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDoc(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-500 hover:text-rose-400 transition-opacity rounded cursor-pointer"
                title="Delete Draft"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Document Templates */}
        <div className="space-y-2 mt-2 pt-4 border-t border-slate-800/60">
          <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider">Creative Presets</label>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5 text-left">
            <button 
              onClick={() => applyTemplate('Proposal')}
              className="text-[10px] font-mono p-1.5 bg-slate-950/30 border border-slate-850 hover:border-indigo-500/30 text-slate-300 rounded hover:bg-slate-900 transition-all text-left flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Campaign Proposal
            </button>
            <button 
              onClick={() => applyTemplate('Script')}
              className="text-[10px] font-mono p-1.5 bg-slate-950/30 border border-slate-850 hover:border-indigo-500/30 text-slate-300 rounded hover:bg-slate-900 transition-all text-left flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-emerald-400" /> Video Script Draft
            </button>
            <button 
              onClick={() => applyTemplate('Brief')}
              className="text-[10px] font-mono p-1.5 bg-slate-950/30 border border-slate-850 hover:border-indigo-500/30 text-slate-300 rounded hover:bg-slate-900 transition-all text-left flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-pink-400" /> Campaign Brief
            </button>
            <button 
              onClick={() => applyTemplate('Agreement')}
              className="text-[10px] font-mono p-1.5 bg-slate-950/30 border border-slate-850 hover:border-indigo-500/30 text-slate-300 rounded hover:bg-slate-900 transition-all text-left flex items-center gap-1.5"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" /> Brand Contract
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Workspace */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Workspace Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                handleFieldChange();
              }}
              onBlur={() => handleSaveDocument()}
              placeholder="Draft Document Title..."
              className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-indigo-500 outline-none text-base font-bold text-white px-1 py-0.5 transition-colors font-sans w-full max-w-sm"
            />
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            {/* View Mode Switcher */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-lg p-0.5 flex">
              <button 
                onClick={() => setEditorTab('write')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  editorTab === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Draft Editor
              </button>
              <button 
                onClick={() => setEditorTab('preview')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  editorTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Watermark Preview
              </button>
            </div>

            {/* Quick Actions */}
            <button 
              onClick={handleCopyContent}
              className="p-1.5 bg-slate-950/40 border border-slate-850 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 hover:border-slate-700 cursor-pointer"
              title="Copy Content To Clipboard"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>

            <button 
              onClick={handlePrintPDF}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-1 font-bold cursor-pointer"
              title="Print Document or Export PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              Export / Print
            </button>
          </div>
        </div>

        {/* Tab content area */}
        <div className="flex-1 min-h-[350px] relative flex flex-col">
          {editorTab === 'write' ? (
            <div className="flex-1 flex flex-col gap-3">
              <textarea 
                value={docContent}
                onChange={(e) => {
                  setDocContent(e.target.value);
                  handleFieldChange();
                }}
                onBlur={() => handleSaveDocument()}
                placeholder="Compose your media production content draft in markdown or standard text style..."
                className="flex-1 w-full min-h-[300px] bg-slate-950/20 border border-slate-850 rounded-xl p-4 text-xs text-slate-300 font-mono outline-none focus:border-indigo-500/50 resize-y leading-relaxed"
              />
              <p className="text-[10px] text-slate-500 font-mono">
                💡 Tip: Use markdown shorthand (e.g. # Title, ## Subheader, * bullet) to structure text. Drafts auto-save upon focus changes.
              </p>
            </div>
          ) : (
            /* Watermark Preview Mode with absolute watermark layer styled beautifully */
            <div className="flex-1 bg-white rounded-xl p-6 text-slate-900 border border-slate-300 relative overflow-hidden font-sans min-h-[300px]">
              
              {/* Overlay Watermark container with custom diagonal text rotate-35 */}
              {docWatermark && (
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none select-none z-10 opacity-[0.06] overflow-hidden">
                  <div className="font-extrabold text-[36px] text-slate-950 tracking-widest uppercase rotate-[-30deg] leading-loose text-center whitespace-nowrap">
                    {watermarkText}<br/>
                    {watermarkText}<br/>
                    {watermarkText}
                  </div>
                </div>
              )}

              {/* Verified Header overlay */}
              <div className="border-b border-slate-200 pb-3 mb-4 flex justify-between items-end relative z-20">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-slate-900">{docTitle || 'Untitled Draft'}</h3>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide">
                    Swanaya System Secure Workspace Node
                  </span>
                </div>
                <div className="text-right font-mono text-[9px] text-slate-400">
                  Swanaya Enterprises<br/>
                  Verified Document
                </div>
              </div>

              {/* Doc Body Preview with basic parsing */}
              <div className="text-xs text-slate-800 space-y-3 leading-relaxed relative z-20 whitespace-pre-wrap max-h-[400px] overflow-y-auto pr-1">
                {docContent ? (
                  docContent.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-lg font-bold border-b border-slate-100 pb-1 mt-4 text-slate-950">{line.slice(2)}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-sm font-bold mt-3 text-slate-900">{line.slice(3)}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-xs font-bold mt-2 text-slate-800">{line.slice(4)}</h3>;
                    }
                    if (line.startsWith('* ')) {
                      return <li key={idx} className="ml-4 list-disc text-slate-700">{line.slice(2)}</li>;
                    }
                    return <p key={idx} className="text-slate-700 my-1">{line}</p>;
                  })
                ) : (
                  <span className="text-slate-400 italic">No content has been written yet. Return to Draft Editor to compose content.</span>
                )}
              </div>

              {/* Linked Doc bottom panel */}
              {linkedDocUrl && (
                <div className="mt-5 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50 relative z-20 font-mono text-[9px] text-slate-600">
                  🔗 <strong>INTEGRATED WORKSPACE LINK:</strong><br/>
                  Linked Google Document: <span className="font-bold text-indigo-600">{linkedDocName || 'Google Doc'}</span><br/>
                  Url: <a href={linkedDocUrl} target="_blank" rel="noreferrer" className="text-indigo-600 underline truncate block">{linkedDocUrl}</a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security Watermark & Google Docs settings panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-slate-800/60">
          
          {/* Watermark controls */}
          <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" /> Security Watermarking
              </span>
              <p className="text-[10px] text-slate-400 mb-3 font-mono leading-normal">
                Protect your agency scripts & contract drafts with an active proprietary company watermark on visual preview & PDF print layouts.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="watermark-toggle"
                    checked={docWatermark}
                    onChange={(e) => {
                      setDocWatermark(e.target.checked);
                      handleFieldChange();
                    }}
                    onBlur={() => handleSaveDocument()}
                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                  />
                  <label htmlFor="watermark-toggle" className="text-xs text-slate-300 cursor-pointer font-sans select-none">
                    Enable Diagonal Background Watermark Overlay
                  </label>
                </div>

                {docWatermark && (
                  <div>
                    <input 
                      type="text"
                      value={watermarkText}
                      onChange={(e) => {
                        setWatermarkText(e.target.value);
                      }}
                      placeholder="CUSTOM WATERMARK TEXT..."
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-slate-300 outline-none focus:border-indigo-500 font-mono uppercase"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Google Docs integration */}
          <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
                <UploadCloud className="w-4 h-4 text-emerald-400" /> Google Docs Workspace Integration
              </span>
              <p className="text-[10px] text-slate-400 mb-3 font-mono leading-normal">
                Directly coordinate and link your official company Google Docs files straight to this workspace utilizing the secure OAuth picker interface.
              </p>

              {linkedDocId ? (
                <div className="space-y-2">
                  <div className="bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <p className="text-xs text-emerald-400 font-bold truncate">{linkedDocName || 'Google Doc Linked'}</p>
                      <span className="text-[9px] text-slate-500 font-mono truncate block">ID: {linkedDocId}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={linkedDocUrl || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded py-1 px-2.5 text-xs font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer font-sans"
                    >
                      Open in Docs <ExternalLink className="w-3 h-3" />
                    </a>
                    <button 
                      onClick={() => {
                        setLinkedDocId(null);
                        setLinkedDocUrl(null);
                        setLinkedDocName(null);
                        setSyncStatus('unsynced');
                        addLog('Google Docs: Unlinked file from document metadata registry', 'warning');
                      }}
                      className="bg-rose-950/30 border border-rose-900/30 hover:border-rose-700/50 text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                    >
                      Unlink
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleGoogleDocsLink}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded py-2.5 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer font-mono uppercase"
                >
                  <UploadCloud className="w-4 h-4 text-indigo-400 animate-pulse" /> Link Google Doc via Picker
                </button>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
