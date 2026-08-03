import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, X, Check, Mail, ExternalLink, Globe, Lock, AlertTriangle, Scale, BookOpen, Layers } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms' | 'additional';
}

export default function LegalModal({ isOpen, onClose, defaultTab = 'privacy' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'additional'>(defaultTab);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white font-mono tracking-wide uppercase flex items-center gap-2">
                  Swanique AI Legal & Governance
                </h2>
                <p className="text-xs text-slate-400 font-sans">
                  Official Privacy Policy, Terms & Conditions, and Compliance Documents
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-3 flex items-center gap-3 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Privacy Policy
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4" /> Terms & Conditions
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('additional')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'additional'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Compliance Policies
            </button>
          </div>

          {/* Document Content Scroll Area */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 font-sans text-slate-300 leading-relaxed text-sm space-y-6">
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h1 className="text-2xl font-black text-white font-mono tracking-tight mb-1">
                    Privacy Policy
                  </h1>
                  <p className="text-xs font-mono text-indigo-400">
                    Swanique AI • Effective Date: August 2, 2026
                  </p>
                </div>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                    1. Introduction
                  </h2>
                  <p>
                    Welcome to <strong>Swanique AI</strong>. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, software, and AI-powered services.
                  </p>
                  <p>
                    By accessing Swanique AI, you agree to the practices described in this Privacy Policy.
                  </p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    2. Information We Collect
                  </h2>
                  <p>We may collect the following information:</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h3 className="font-bold text-indigo-300 uppercase font-mono">Personal Information</h3>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>Full Name</li>
                        <li>Email Address</li>
                        <li>Phone Number</li>
                        <li>Company Name</li>
                        <li>Billing Information</li>
                        <li>Account Credentials</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h3 className="font-bold text-indigo-300 uppercase font-mono">Usage Information</h3>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>Browser Type</li>
                        <li>Device Information</li>
                        <li>IP Address</li>
                        <li>Operating System</li>
                        <li>Session Duration</li>
                        <li>Pages Visited & Feature Usage</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <h3 className="font-bold text-indigo-300 uppercase font-mono">AI Content</h3>
                      <ul className="list-disc list-inside space-y-1 text-slate-400">
                        <li>Text Prompts</li>
                        <li>Images & Graphics</li>
                        <li>Uploaded Documents</li>
                        <li>Marketing Content</li>
                        <li>Business Information</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    3. How We Use Your Information
                  </h2>
                  <p>We use your information to:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>Provide AI services and content automation</li>
                    <li>Improve platform features and security</li>
                    <li>Process subscriptions and transactions</li>
                    <li>Respond to customer support requests</li>
                    <li>Personalize user experience and workflow</li>
                    <li>Improve AI performance and algorithmic safety</li>
                    <li>Detect and prevent fraud or system abuse</li>
                    <li>Send important service updates and compliance notifications</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    4. Data Security
                  </h2>
                  <p>
                    We implement reasonable administrative, technical, and organizational measures (including end-to-end encryption and Google Firestore security rules) to protect your information against unauthorized access, disclosure, or misuse.
                  </p>
                  <p className="text-xs text-amber-400 italic">
                    Note: While we enforce enterprise-grade security protocols, no online transmission or digital storage service can be guaranteed 100% immune to all security threats.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    5. Data Retention
                  </h2>
                  <p>We retain your information only for as long as necessary to:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>Provide our AI & campaign planning services</li>
                    <li>Comply with applicable statutory legal obligations</li>
                    <li>Resolve disputes and enforce platform agreements</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    6. Cookies & Tracking Technologies
                  </h2>
                  <p>
                    We use cookies and standard telemetry mechanisms (including Google Tag Manager container <code>GTM-MSGBPBT2</code>) to remember user preferences, analyze traffic patterns, measure ad performance, and optimize platform responsiveness.
                  </p>
                  <p className="text-xs text-slate-400">
                    Users may disable non-essential cookies at any time via browser settings.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    7. Third-Party Services
                  </h2>
                  <p>We work with trusted third-party service providers, including:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>Payment Processors & Gateway Networks</li>
                    <li>Analytics Providers (Google Analytics, GTM)</li>
                    <li>Cloud Hosting Infrastructure & Firestore Database</li>
                    <li>Authentication Providers</li>
                    <li>AI Engine Infrastructure Providers (Google Gemini API)</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    8. Your Data Rights
                  </h2>
                  <p>
                    Depending on your location, you may exercise rights to access, correct, port, or request deletion of your personal information held on Swanique AI servers.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    9. Children's Privacy
                  </h2>
                  <p>
                    Swanique AI is not intended for children under 13 years of age. We do not knowingly collect personal information from children.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    10. Contact Us
                  </h2>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-indigo-300">
                    <p><strong>Swanique AI Legal Desk</strong></p>
                    <p>Email: <a href="mailto:swanayamediaproduction@gmail.com" className="underline text-indigo-400">swanayamediaproduction@gmail.com</a></p>
                    <p>Website: <a href="https://www.swanique.ai" target="_blank" rel="noreferrer" className="underline text-indigo-400">https://www.swanique.ai</a></p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h1 className="text-2xl font-black text-white font-mono tracking-tight mb-1">
                    Terms & Conditions
                  </h1>
                  <p className="text-xs font-mono text-indigo-400">
                    Swanique AI • Effective Date: August 2, 2026
                  </p>
                </div>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    1. Acceptance of Terms
                  </h2>
                  <p>
                    By accessing or using Swanique AI, you agree to be bound by these Terms & Conditions. If you do not agree to all terms, please discontinue using our platform immediately.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    2. Services Description
                  </h2>
                  <p>Swanique AI provides AI-powered software tools including:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>AI Content Generation & Automation</li>
                    <li>Marketing Assistance & Campaign Strategy</li>
                    <li>Social Media Planning & Content Calendar</li>
                    <li>Business & Lead Generation Automation</li>
                    <li>AI Interactive Chat & Assistance</li>
                    <li>SEO Audit & Analytics Tools</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    3. User Accounts & Security
                  </h2>
                  <p>
                    You agree to provide accurate registration information, keep your credentials confidential, and take responsibility for all activities occurring under your authenticated account.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    4. Acceptable Use Policy
                  </h2>
                  <p>You agree NOT to:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li>Violate any local, national, or international laws</li>
                    <li>Upload malicious software, scripts, or destructive code</li>
                    <li>Attempt unauthorized access to system databases or admin consoles</li>
                    <li>Reverse engineer or decompile platform algorithms</li>
                    <li>Generate illegal, fraudulent, harassing, or harmful content</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    5. Intellectual Property
                  </h2>
                  <p>
                    All software code, visual branding, logos, AI architecture, and graphics provided by Swanique AI remain the exclusive intellectual property of Swanique AI and Swanaya Media. Users retain ownership of their submitted raw prompts and assets.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    6. AI-Generated Content Disclaimer
                  </h2>
                  <p>
                    AI-generated outputs may contain errors or inaccuracies. All content should be reviewed by qualified human editors prior to commercial, legal, or financial deployment.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    7. Payments & Subscriptions
                  </h2>
                  <p>
                    Paid subscriptions (such as 168-Hour / 1-Week Trial extensions and Pro Creator plans) are billed according to chosen terms and subject to local tax regulations.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    8. Governing Law
                  </h2>
                  <p>
                    These Terms shall be governed by and interpreted in accordance with the laws of <strong>India</strong>, without regard to conflict of law principles.
                  </p>
                </section>

                <section className="space-y-2">
                  <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    9. Contact Legal Department
                  </h2>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1 text-indigo-300">
                    <p><strong>Swanique AI Legal Desk</strong></p>
                    <p>Email: <a href="mailto:swanayamediaproduction@gmail.com" className="underline text-indigo-400">swanayamediaproduction@gmail.com</a></p>
                    <p>Website: <a href="https://www.swanique.ai" target="_blank" rel="noreferrer" className="underline text-indigo-400">https://www.swanique.ai</a></p>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'additional' && (
              <div className="space-y-6">
                <div className="border-b border-slate-800 pb-4">
                  <h1 className="text-2xl font-black text-white font-mono tracking-tight mb-1">
                    SaaS Compliance & Legal Framework
                  </h1>
                  <p className="text-xs font-mono text-indigo-400">
                    Recommended Institutional Policies for Enterprise Customers
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: '1. Cookie Policy', desc: 'Detailed breakdown of session state tokens, analytical cookies, and GTM container telemetry.' },
                    { title: '2. Refund & Cancellation Policy', desc: 'Clear guidelines on subscription cancellations, billing cycles, and trial session limits.' },
                    { title: '3. Acceptable Use Policy (AUP)', desc: 'Rules governing automated API calling, campaign generation, and multi-user node conduct.' },
                    { title: '4. Data Processing Agreement (DPA)', desc: 'Standard contractual clauses for enterprise data handlers and corporate client nodes.' },
                    { title: '5. GDPR Compliance Statement', desc: 'Cross-border data protection protocols and European data protection standards.' },
                    { title: '6. AI Usage & Responsible AI Policy', desc: 'Ethical AI generation guardrails, content filtering, and bias prevention guidelines.' },
                    { title: '7. Copyright & DMCA Policy', desc: 'Procedures for reporting copyright infringement and IP protection rights.' },
                    { title: '8. Service Level Agreement (SLA)', desc: '99.9% uptime commitment, maintenance windows, and system SLA parameters.' },
                    { title: '9. Security Policy', desc: 'Data encryption standards, SSL/TLS certificates, and Firestore security rules.' },
                    { title: '10. Community Guidelines', desc: 'Standards of conduct for shared collaborative workspaces and message tickers.' },
                  ].map((doc, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-colors space-y-1">
                      <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center justify-between">
                        <span>{doc.title}</span>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      </h3>
                      <p className="text-[11px] text-slate-400">{doc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between shrink-0 font-mono text-xs">
            <span className="text-slate-500">
              © 2026 Swanique AI • All Rights Reserved
            </span>
            <button
              type="button"
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase px-5 py-2 rounded-xl transition-all cursor-pointer shadow-lg"
            >
              I Understand & Agree
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
