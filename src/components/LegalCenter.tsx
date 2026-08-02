import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, BookOpen, Cookie, FileText, Lock, Mail,
  Search, Printer, Download, Clock, Sparkles, CheckCircle2, ChevronRight,
  HelpCircle, ExternalLink, RefreshCw, Layers, Cpu, Server, PhoneCall, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type LegalDocType = 
  | 'privacy' 
  | 'terms' 
  | 'manual' 
  | 'cookie' 
  | 'acceptable_use' 
  | 'ai_responsible' 
  | 'data_protection' 
  | 'security' 
  | 'contact';

interface LegalCenterProps {
  initialTab?: LegalDocType;
  onClose?: () => void;
}

export default function LegalCenter({ initialTab = 'privacy', onClose }: LegalCenterProps) {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedManualSection, setSelectedManualSection] = useState<string>('intro');

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  // Handle simulated PDF export
  const handleExportPDF = () => {
    const docName = activeTab.replace('_', ' ').toUpperCase();
    const content = `SWANIQUE AI LEGAL DOCUMENT - ${docName}\nVersion: 1.0\nLast Updated: August 2026\nDeveloper: Swanaya Web Technologies - R&D Wing\n\nDocument Exported Successfully.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Swanique_AI_${activeTab}_v1.0.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navItems: { id: LegalDocType; label: string; icon: any; version: string }[] = [
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck, version: 'v1.0' },
    { id: 'terms', label: 'Terms & Conditions', icon: ShieldAlert, version: 'v1.0' },
    { id: 'manual', label: 'User Manual', icon: BookOpen, version: 'v1.0' },
    { id: 'cookie', label: 'Cookie Policy', icon: Cookie, version: 'v1.0' },
    { id: 'acceptable_use', label: 'Acceptable Use Policy', icon: FileText, version: 'v1.0' },
    { id: 'ai_responsible', label: 'AI Responsible Use', icon: Sparkles, version: 'v1.0' },
    { id: 'data_protection', label: 'Data Protection Policy', icon: Lock, version: 'v1.0' },
    { id: 'security', label: 'Security Policy', icon: Server, version: 'v1.0' },
    { id: 'contact', label: 'Contact & Support', icon: Mail, version: 'v1.0' },
  ];

  const manualSections = [
    { id: 'intro', title: '1. Introduction', content: 'Swanique AI is a high-performance marketing automation, AI text/image generation, and SEO research platform designed by Swanaya Web Technologies R&D Wing.' },
    { id: 'getting_started', title: '2. Getting Started', content: 'To get started, authenticate through the portal or launch a 168-Hour / 1-Week R&D Trial Session. All session state is preserved locally and synced to secure Firestore collections.' },
    { id: 'dashboard', title: '3. Dashboard', content: 'The primary dashboard provides real-time analytics, user active node counts, live tickers, quick task dispatch modules, and campaign creation shortcuts.' },
    { id: 'ai_chat', title: '4. AI Chat', content: 'Communicate with Gemini 2.5 Pro models for strategic marketing planning, creative copywriting, audio transcription, and content strategy.' },
    { id: 'content_planner', title: '5. Content Planner', content: 'Schedule social media posts across Instagram, YouTube, LinkedIn, and Facebook with custom release dates, status badges, and asset attachments.' },
    { id: 'campaigns', title: '6. Campaigns', content: 'Organize holistic marketing campaigns with target demographics, budget allocation, conversion triggers, and multi-channel synchronization.' },
    { id: 'image_studio', title: '7. Image Studio', content: 'Generate high-resolution visual marketing banners, custom logos, and storyboards directly using modern Gemini image synthesis models.' },
    { id: 'projects', title: '8. Projects', content: 'Group marketing assets, SEO audits, and content documents into organized workspace projects.' },
    { id: 'analytics', title: '9. Analytics', content: 'Track engagement metrics, audit logs, click-through rates, and live system latency metrics across active campaigns.' },
    { id: 'settings', title: '10. Settings', content: 'Configure profile credentials, security protocols, notification channels, visual appearance, R&D Access level, and legal preferences.' },
    { id: 'research_access', title: '11. Research Access', content: 'Manage your R&D level clearance (Community, Research, Beta, Enterprise Research) and view active compute credit balances.' },
    { id: 'security_manual', title: '12. Security', content: 'Understand row-level Firestore rules, 256-bit encryption standards, and user clearance verification.' },
    { id: 'troubleshooting', title: '13. Troubleshooting', content: 'If you encounter connection drops, click "Refresh Connection", verify internet bandwidth, or clear local browser storage.' },
    { id: 'faq', title: '14. FAQ', content: 'Q: Is my data private? A: Yes, all prompt data is encrypted and handled in accordance with GDPR principles.' },
    { id: 'support', title: '15. Support', content: 'Contact Swanaya Web Technologies R&D Wing directly via email at swanayamediaproductionwebsitea@gmail.com.' },
  ];

  const filteredManualSections = manualSections.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 text-slate-100 font-sans print:bg-white print:text-slate-900">
      
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest">
              LEGAL & GOVERNANCE CENTER
            </span>
          </div>
          <h1 className="text-2xl font-black text-white font-mono mt-1">
            Swanique AI Legal Documentation
          </h1>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
            <span>Version 1.0</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Last Updated: August 2026
            </span>
            <span>•</span>
            <span className="text-indigo-400">Swanaya Web Technologies – R&D Wing</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-white" />
            <span>Export Document</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ml-2"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Sidebar Navigation + Content Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3 print:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search legal docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[10px] ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                    {item.version}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Document Display Panel */}
        <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 text-slate-200 print:border-none print:p-0">
          
          {/* PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  DOCUMENT VERIFICATION: PRIVACY POLICY V1.0
                </span>
                <h2 className="text-2xl font-black text-white font-mono mt-1">Privacy Policy</h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">Effective Date: August 2026</p>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">1. Data Collection</h3>
                  <p>Swanique AI collects minimal operational data required for service provision, including username credentials, full names, email addresses, profile avatars, and session authorization tokens.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">2. Personal Information & Storage</h3>
                  <p>Personal information is encrypted using industry-standard AES-256 protocols and stored securely in Google Firestore databases. User passwords are kept as cryptographic hashes and are never stored in plaintext.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">3. AI Prompt & Generation Storage</h3>
                  <p>Prompts and visual generation queries entered into Swanique AI tools are processed via Gemini 2.5 Pro models. Prompts are used solely for fulfilling output requests and are retained in audit logs to support platform troubleshooting and user history tracking.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">4. Cookies & Local Analytics</h3>
                  <p>We utilize local browser storage and cookie configurations for session maintenance, theme preferences, and tag tracking (Google Tag Manager GTM-MSGBPBT2). No invasive cross-site advertising cookies are placed.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">5. User Rights & Data Deletion</h3>
                  <p>Under GDPR and global privacy frameworks, users maintain the right to request full export of stored personal data, request account deletion, or modify consent permissions directly inside Settings or by emailing R&D Support.</p>
                </section>
              </div>
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  DOCUMENT VERIFICATION: TERMS & CONDITIONS V1.0
                </span>
                <h2 className="text-2xl font-black text-white font-mono mt-1">Terms & Conditions</h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">Effective Date: August 2026</p>
              </div>

              <div className="space-y-4 text-xs leading-relaxed">
                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">1. Acceptance of Terms</h3>
                  <p>By accessing or utilizing Swanique AI, you agree to bound by these Terms & Conditions. If you do not accept these terms, you must cease platform utilization immediately.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">2. R&D Access & Platform Availability</h3>
                  <p>Swanique AI is provided as a Research & Development preview platform. Swanaya Web Technologies R&D Wing reserves the right to modify, suspend, or update AI models, feature sets, and compute credit allocations without prior notice.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">3. Intellectual Property & AI Content</h3>
                  <p>Users retain rights to marketing content and copy generated through their authorized prompts. Swanique AI and Swanaya Web Technologies retain all rights, title, and interest in underlying proprietary algorithms, UI architecture, and software code.</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono uppercase">4. Limitation of Liability</h3>
                  <p>To the maximum extent permitted by applicable law, Swanaya Web Technologies shall not be liable for indirect, incidental, or consequential damages resulting from AI generation outputs or operational downtime.</p>
                </section>
              </div>
            </div>
          )}

          {/* USER MANUAL */}
          {activeTab === 'manual' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  DOCUMENTATION: USER MANUAL V1.0
                </span>
                <h2 className="text-2xl font-black text-white font-mono mt-1">Comprehensive User Manual</h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">Interactive Navigation & Knowledge Base</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {filteredManualSections.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedManualSection(s.id)}
                    className={`text-left p-3 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedManualSection === s.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </div>

              {/* Selected Manual Section Detail */}
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <h3 className="text-sm font-bold text-indigo-400 font-mono uppercase">
                  {manualSections.find(m => m.id === selectedManualSection)?.title}
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {manualSections.find(m => m.id === selectedManualSection)?.content}
                </p>
              </div>
            </div>
          )}

          {/* COOKIE POLICY */}
          {activeTab === 'cookie' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-white font-mono">Cookie Policy</h2>
                <p className="text-xs text-slate-400 font-mono">v1.0 • Session & Operational Tokens</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                We use strictly necessary cookies and local browser storage to keep you logged in, persist visual dark/light theme choices, and sync GTM-MSGBPBT2 analytics for R&D performance evaluation.
              </p>
            </div>
          )}

          {/* ACCEPTABLE USE */}
          {activeTab === 'acceptable_use' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-white font-mono">Acceptable Use Policy</h2>
                <p className="text-xs text-slate-400 font-mono">v1.0 • Platform Conduct Guidelines</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Users are strictly prohibited from utilizing Swanique AI to generate malicious content, automated spam, deceptive marketing copy, or unverified claims violating advertising regulations.
              </p>
            </div>
          )}

          {/* AI RESPONSIBLE USE */}
          {activeTab === 'ai_responsible' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-white font-mono">AI Responsible Use Policy</h2>
                <p className="text-xs text-slate-400 font-mono">v1.0 • Gemini Safety & Ethics Alignment</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Swanique AI adheres to Google DeepMind safety guidelines. Generative outputs are monitored for safety, accuracy, and compliance with anti-bias policies.
              </p>
            </div>
          )}

          {/* DATA PROTECTION */}
          {activeTab === 'data_protection' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-white font-mono">Data Protection Policy</h2>
                <p className="text-xs text-slate-400 font-mono">v1.0 • GDPR & ISO Security Compliance</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                All data transmitted to Firestore or Gemini endpoint APIs is secured via SSL/TLS encryption. Data subject access requests (DSAR) are processed within 30 days.
              </p>
            </div>
          )}

          {/* SECURITY POLICY */}
          {activeTab === 'security' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-white font-mono">Security Policy</h2>
                <p className="text-xs text-slate-400 font-mono">v1.0 • Infrastructure Defense Standards</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                Swanique AI utilizes row-level Firestore security rules, environment secret isolation, anti-DDoS proxy layers, and role-based access control (RBAC).
              </p>
            </div>
          )}

          {/* CONTACT & SUPPORT */}
          {activeTab === 'contact' && (
            <div className="space-y-6 font-sans">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-black text-white font-mono">Contact & Support</h2>
                <p className="text-xs text-slate-400 font-mono">Swanaya Web Technologies – R&D Wing</p>
              </div>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 font-mono text-xs">
                <div><strong className="text-indigo-400">Developer:</strong> Swanaya Web Technologies</div>
                <div><strong className="text-indigo-400">R&D Wing Direct Email:</strong> swanayamediaproductionwebsitea@gmail.com</div>
                <div><strong className="text-indigo-400">Location:</strong> Cloud Run Containers Node Asia-East</div>
                <div><strong className="text-indigo-400">Support Hours:</strong> 24/7 Automated R&D Operations</div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
