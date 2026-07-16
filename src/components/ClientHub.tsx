import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Link2, Plus, Trash2, CheckCircle, Save, FileText,
  Sparkles, Globe, MessageSquare, Instagram, Linkedin, Youtube, Twitter, Send, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';

interface Collaborator {
  id: string;
  name: string;
  role: string;
  email: string;
  social: string;
}

export interface ClientRecord {
  id: string;
  companyName: string;
  niche: string;
  repName: string;
  email: string;
  username: string;
  password?: string;
  budget: string;
  projectScope: string;
  startDate: string;
  endDate: string;
  timestamp: number;
}

interface SocialProfile {
  platform: 'Instagram' | 'LinkedIn' | 'YouTube' | 'Twitter';
  handle: string;
  followers: string;
  connected: boolean;
}

interface ClientHubProps {
  currentUser: string;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

export default function ClientHub({ currentUser, addLog }: ClientHubProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [socials, setSocials] = useState<SocialProfile[]>([
    { platform: 'Instagram', handle: '', followers: '45.2K', connected: false },
    { platform: 'LinkedIn', handle: '', followers: '12.8K', connected: false },
    { platform: 'YouTube', handle: '', followers: '120K', connected: false },
    { platform: 'Twitter', handle: '', followers: '8.4K', connected: false }
  ]);

  // Input States
  const [activeRightColumnTab, setActiveRightColumnTab] = useState<'matrix' | 'registration'>('matrix');
  const [collabName, setCollabName] = useState('');
  const [collabRole, setCollabRole] = useState('Video Editor');
  const [collabEmail, setCollabEmail] = useState('');
  const [collabSocial, setCollabSocial] = useState('');

  // Client Registration States
  const [clientCompany, setClientCompany] = useState('');
  const [clientNiche, setClientNiche] = useState('Tech');
  const [clientRep, setClientRep] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientUsername, setClientUsername] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientBudget, setClientBudget] = useState('');
  const [clientScope, setClientScope] = useState('');
  const [clientStart, setClientStart] = useState('');
  const [clientEnd, setClientEnd] = useState('');
  const [isSubmittingClient, setIsSubmittingClient] = useState(false);
  const [clientSuccessMsg, setClientSuccessMsg] = useState('');
  const [clientErrorMsg, setClientErrorMsg] = useState('');
  const [revealedClientPasswords, setRevealedClientPasswords] = useState<Record<string, boolean>>({});

  // Collaborative Scratchpad notepad state
  const [workspaceNotes, setWorkspaceNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // AI Agent Onboarding Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'agent' | 'user'; text: string }>>([
    {
      sender: 'agent',
      text: `Welcome to Swanaya Agentic Client Onboarding Node. I am your specialized campaign setup agent. I will help you link your social media profiles and register creators or editors you need to share campaigns with. How can I assist you first?`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentReplying, setIsAgentReplying] = useState(false);

  // Load collaborators, connected socials, and shared notes from Firestore on mount
  useEffect(() => {
    const fetchClientData = async () => {
      try {
        // 1. Fetch Collaborators
        const collabCol = collection(db, 'client_partners');
        const collabSnapshot = await getDocs(collabCol);
        const collabList: Collaborator[] = [];
        collabSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          collabList.push({
            id: docSnap.id,
            name: data.name || '',
            role: data.role || '',
            email: data.email || '',
            social: data.social || ''
          });
        });
        setCollaborators(collabList);

        // 2. Fetch Social Profiles
        const socialCol = collection(db, 'client_socials');
        const socialSnapshot = await getDocs(socialCol);
        const loadedSocials = [...socials];
        socialSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const foundIdx = loadedSocials.findIndex(s => s.platform === data.platform);
          if (foundIdx !== -1) {
            loadedSocials[foundIdx] = {
              platform: data.platform,
              handle: data.handle || '',
              followers: data.followers || '10K',
              connected: true
            };
          }
        });
        setSocials(loadedSocials);

        // 3. Fetch Collaborative Workspace Notes Scratchpad
        const notesRef = doc(db, 'client_notes', 'shared_workspace');
        const notesSnap = await getDoc(notesRef);
        if (notesSnap.exists()) {
          setWorkspaceNotes(notesSnap.data().content || '');
        }

        // 4. Fetch Registered Clients
        const clientCol = collection(db, 'clients');
        const clientSnapshot = await getDocs(clientCol);
        const clientList: ClientRecord[] = [];
        clientSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          clientList.push({
            id: docSnap.id,
            companyName: data.companyName || '',
            niche: data.niche || '',
            repName: data.repName || '',
            email: data.email || '',
            username: data.username || '',
            budget: data.budget || '',
            projectScope: data.projectScope || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            timestamp: data.timestamp || Date.now()
          });
        });
        setClients(clientList);
      } catch (err) {
        console.error('Failed to load client hub data from Firestore', err);
        handleFirestoreError(err, OperationType.LIST, 'client_partners');
      }
    };

    fetchClientData();
  }, []);

  // Save collaborative workspace notes to Firestore
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const notesRef = doc(db, 'client_notes', 'shared_workspace');
      await setDoc(notesRef, {
        content: workspaceNotes,
        lastUpdated: Date.now(),
        updatedBy: currentUser
      }, { merge: true });
      addLog(`Client Hub: Saved shared campaign notes in workspace scratchpad`, 'success');
      
      // Dispatch Ticker Alert
      window.dispatchEvent(new CustomEvent('swanaya-simulation', {
        detail: {
          type: 'SCRATCHPAD UPDATE',
          message: `Workspace scratchpad updated by [${currentUser.toUpperCase()}]. Data saved to cloud Firestore.`
        }
      }));
    } catch (err) {
      console.error('Error saving workspace notes:', err);
      addLog('Client Hub Error: Failed to save scratchpad notes to Firestore', 'warning');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientSuccessMsg('');
    setClientErrorMsg('');

    const cleanCompany = clientCompany.trim();
    const cleanRep = clientRep.trim();
    const cleanEmail = clientEmail.trim();
    const cleanUser = clientUsername.trim();
    const cleanPass = clientPassword.trim();

    if (!cleanCompany || !cleanRep || !cleanEmail || !cleanUser || !cleanPass) {
      setClientErrorMsg('All registration fields are strictly required.');
      return;
    }

    if (cleanUser.toLowerCase() === 'each' || cleanUser.toLowerCase() === 'aadithyan') {
      setClientErrorMsg('Username is reserved for Admin nodes.');
      return;
    }

    if (cleanPass.length < 4) {
      setClientErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmittingClient(true);

    try {
      // 1. Save to clients collection
      const clientId = `client-${Date.now()}`;
      const clientDocRef = doc(db, 'clients', clientId);
      const newClientData: ClientRecord = {
        id: clientId,
        companyName: cleanCompany,
        niche: clientNiche,
        repName: cleanRep,
        email: cleanEmail,
        username: cleanUser,
        password: cleanPass,
        budget: clientBudget,
        projectScope: clientScope,
        startDate: clientStart,
        endDate: clientEnd,
        timestamp: Date.now()
      };

      await setDoc(clientDocRef, newClientData);

      // 2. Sync / save to users collection for login capabilities
      const userDocRef = doc(db, 'users', cleanUser.toLowerCase());
      await setDoc(userDocRef, {
        username: cleanUser,
        password: cleanPass,
        provider: 'direct',
        designation: 'Client Stakeholder',
        fullName: cleanRep,
        email: cleanEmail,
        bio: `Corporate Stakeholder representing ${cleanCompany}. Access level: Client Portal. Brand Focus: ${clientNiche}.`
      }, { merge: true });

      // 3. Register user in local storage to allow seamless immediate logins
      let localUsers = [];
      const saved = localStorage.getItem('swanaya_registered_users');
      if (saved) {
        try {
          localUsers = JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
      const updatedLocalUsers = [...localUsers.filter((u: any) => u.username.toLowerCase() !== cleanUser.toLowerCase()), {
        username: cleanUser,
        password: cleanPass,
        provider: 'direct',
        designation: 'Client Stakeholder'
      }];
      localStorage.setItem('swanaya_registered_users', JSON.stringify(updatedLocalUsers));
      // Save designation to allow ProfileSettings and Header to recognize it
      localStorage.setItem(`swanaya_profile_title_${cleanUser.toLowerCase()}`, 'Client Stakeholder');

      // 4. Update state list
      setClients(prev => [...prev, newClientData]);

      // 5. Clear fields
      setClientCompany('');
      setClientRep('');
      setClientEmail('');
      setClientUsername('');
      setClientPassword('');
      setClientBudget('');
      setClientScope('');
      setClientStart('');
      setClientEnd('');

      setClientSuccessMsg(`Success! ${cleanCompany} registered successfully. Login with username "${cleanUser}".`);
      addLog(`Client Portal: Successfully registered client account for [${cleanCompany}] (username: ${cleanUser})`, 'success');

      // 6. Trigger custom simulation event for Live Feed ticker
      window.dispatchEvent(new CustomEvent('swanaya-simulation', {
        detail: {
          type: 'CLIENT PORTAL REGISTRATION',
          message: `Corporate client registered: "${cleanCompany}" represented by ${cleanRep}. Secure gateway profile established.`
        }
      }));

      // Onboarding agent reaction
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `Incredible! I've provisioned a secure Client Node for "${cleanCompany}". Their representative can now log in using "${cleanUser}" to review creative assets and co-publish schedules.`
        }
      ]);

    } catch (err: any) {
      console.error(err);
      setClientErrorMsg('Cloud sync failed. Verification: please check network state.');
      handleFirestoreError(err, OperationType.WRITE, `clients/${cleanUser}`);
    } finally {
      setIsSubmittingClient(false);
    }
  };

  const handleDeleteClient = async (id: string, companyName: string, username: string) => {
    try {
      // Delete client record
      await deleteDoc(doc(db, 'clients', id));
      setClients(prev => prev.filter(c => c.id !== id));

      // Also clean up user node
      await deleteDoc(doc(db, 'users', username.toLowerCase()));

      addLog(`Client Portal: Removed corporate client "${companyName}" (username: ${username})`, 'warning');
      
      // Update local storage registered users
      const saved = localStorage.getItem('swanaya_registered_users');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const filtered = parsed.filter((u: any) => u.username.toLowerCase() !== username.toLowerCase());
            localStorage.setItem('swanaya_registered_users', JSON.stringify(filtered));
          }
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error('Error deleting client record:', err);
      handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
    }
  };

  // Save/Add Collaborator to Firestore
  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabName.trim()) return;

    const newCollab: Collaborator = {
      id: `collab-${Date.now()}`,
      name: collabName.trim(),
      role: collabRole,
      email: collabEmail.trim(),
      social: collabSocial.trim()
    };

    try {
      const docRef = doc(db, 'client_partners', newCollab.id);
      await setDoc(docRef, {
        name: newCollab.name,
        role: newCollab.role,
        email: newCollab.email,
        social: newCollab.social,
        createdBy: currentUser,
        timestamp: Date.now()
      });

      setCollaborators(prev => [...prev, newCollab]);
      setCollabName('');
      setCollabEmail('');
      setCollabSocial('');

      addLog(`Client Hub: Registered collaborator "${newCollab.name}" as [${newCollab.role}]`, 'success');

      // Dispatch Simulation Ticker Alert
      window.dispatchEvent(new CustomEvent('swanaya-simulation', {
        detail: {
          type: 'Partner Registered',
          message: `Registered co-publishing creator node "${newCollab.name}" holding permission class [${newCollab.role}].`
        }
      }));

      // Agent conversational reaction
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `Excellent choice! I have registered "${newCollab.name}" in the secure Firestore registry under the role of "${newCollab.role}". They are now cleared to collaborate on your active content calendars.`
        }
      ]);
    } catch (err) {
      console.error('Error saving collaborator', err);
      handleFirestoreError(err, OperationType.WRITE, `client_partners/${newCollab.id}`);
    }
  };

  // Delete Collaborator
  const handleDeleteCollaborator = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'client_partners', id));
      setCollaborators(prev => prev.filter(c => c.id !== id));
      addLog(`Client Hub: Removed collaborator "${name}" from partner registry`, 'warning');
    } catch (err) {
      console.error('Error deleting collaborator', err);
      handleFirestoreError(err, OperationType.DELETE, `client_partners/${id}`);
    }
  };

  // Connect Social Handle
  const handleConnectSocial = async (platformName: 'Instagram' | 'LinkedIn' | 'YouTube' | 'Twitter', handleText: string) => {
    if (!handleText.trim()) return;

    const cleanedHandle = handleText.trim().startsWith('@') ? handleText.trim() : `@${handleText.trim()}`;

    try {
      const docRef = doc(db, 'client_socials', platformName.toLowerCase());
      await setDoc(docRef, {
        platform: platformName,
        handle: cleanedHandle,
        followers: socials.find(s => s.platform === platformName)?.followers || '10K',
        connected: true,
        linkedBy: currentUser,
        timestamp: Date.now()
      });

      setSocials(prev => prev.map(s => {
        if (s.platform === platformName) {
          return { ...s, handle: cleanedHandle, connected: true };
        }
        return s;
      }));

      addLog(`Client Hub: Connected ${platformName} channel profile "${cleanedHandle}"`, 'success');

      // Dispatch Simulation Ticker Alert
      window.dispatchEvent(new CustomEvent('swanaya-simulation', {
        detail: {
          type: 'Social Linker',
          message: `Successfully linked ${platformName} channel profile "${cleanedHandle}" to enterprise node.`
        }
      }));

      // Agent conversational reaction
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'agent',
          text: `Outstanding! I have successfully registered your ${platformName} profile "${cleanedHandle}". Our background engines will now sync metrics directly to your Content Planner.`
        }
      ]);
    } catch (err) {
      console.error('Error connecting social profile', err);
    }
  };

  // Disconnect Social Handle
  const handleDisconnectSocial = async (platformName: 'Instagram' | 'LinkedIn' | 'YouTube' | 'Twitter') => {
    try {
      await deleteDoc(doc(db, 'client_socials', platformName.toLowerCase()));

      setSocials(prev => prev.map(s => {
        if (s.platform === platformName) {
          return { ...s, handle: '', connected: false };
        }
        return s;
      }));

      addLog(`Client Hub: Disconnected ${platformName} profile integration`, 'warning');
    } catch (err) {
      console.error('Error deleting social profile', err);
    }
  };

  // Chat agent response logic
  const handleAgentChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setIsAgentReplying(true);

    setTimeout(() => {
      let reply = `I've noted that request. You can use the panels on the right to manage who needs to share campaigns with you, or directly type in handles to link your channels.`;
      
      const lower = userText.toLowerCase();
      if (lower.includes('add') || lower.includes('share') || lower.includes('hire') || lower.includes('editor') || lower.includes('creator')) {
        reply = `To add anyone you need to share campaigns with or hire (like video editors or graphics specialists), fill out the "Share Directory Registry" panel. It will store their credentials in the Firestore cloud database!`;
      } else if (lower.includes('link') || lower.includes('connect') || lower.includes('social') || lower.includes('instagram') || lower.includes('youtube')) {
        reply = `You can easily link your social media profiles using the "Social Media Connect Panel". Simply enter your channel handle next to the platform and click "Join". I've configured automatic metric verification!`;
      } else if (lower.includes('hello') || lower.includes('hi')) {
        reply = `Hello! I am your Swanaya Agentic Setup Assistant. Let me know if you would like me to help register a content creator or connect your social profiles.`;
      }

      setChatMessages(prev => [...prev, { sender: 'agent', text: reply }]);
      setIsAgentReplying(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden text-left shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Users className="w-64 h-64 text-indigo-400" />
        </div>
        <div className="relative z-10 space-y-1.5">
          <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Agentic Client Connection Hub
          </span>
          <h2 className="text-2xl font-extrabold font-display text-white tracking-tight leading-none uppercase">
            Client Campaign Share & Social Matrix
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Link social profiles, join active channels, and register creators, designers, or team partners you need to share, collaborate, and co-publish campaigns with.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Onboarding Agent Assistant & Collaborative Notepad (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-950/45 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                  <MessageSquare className="w-4 h-4 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Agentic Onboarding Assistant</h3>
                  <p className="text-[9px] text-slate-500">Simulated AI Operator guides profile setup</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[200px] overflow-y-auto border border-slate-900 bg-slate-950/80 rounded-xl p-4 space-y-3.5 scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed text-left ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                        : 'bg-slate-900 border border-slate-850 text-slate-300 rounded-tl-none'
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isAgentReplying && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-850 text-slate-500 rounded-xl rounded-tl-none px-3.5 py-2 text-xs font-mono animate-pulse">
                      Agent is formulating response...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleAgentChat} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask setup agent (e.g., 'How do I add creators?')..."
                className="flex-grow bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 transition-all placeholder-slate-600"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-3 py-2 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Collaborative Text Scratchpad Notepad Box */}
          <div className="bg-slate-950/45 border border-slate-850 rounded-2xl p-5 space-y-4 text-left shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <FileText className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Client Workspace Scratchpad</h3>
                <p className="text-[9px] text-slate-500 font-sans">Type down live campaign notes, scripts, or outlines</p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={workspaceNotes}
                onChange={(e) => setWorkspaceNotes(e.target.value)}
                placeholder="Enter client collaboration details, shared content references, or campaign outlines..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white placeholder-slate-700 outline-none transition-all resize-none leading-relaxed"
              />
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[9px] font-mono text-slate-500 text-left">
                  {isSavingNotes ? '⚡ Saving scratchpad...' : '🔐 Live cloud-synced with Firestore'}
                </span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-[10px] px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow shadow-emerald-500/10"
                >
                  <Save className="w-3.5 h-3.5" /> Save Workspace Notes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Registry, Social Matrix, or Client Account Registration Portal (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sub-tabs header */}
          <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-850 gap-1.5">
            <button
              onClick={() => setActiveRightColumnTab('matrix')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeRightColumnTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/30'
              }`}
            >
              Social Matrix & Share
            </button>
            <button
              onClick={() => setActiveRightColumnTab('registration')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeRightColumnTab === 'registration'
                  ? 'bg-indigo-600 text-white shadow shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              Client Portal Registration
            </button>
          </div>

          {activeRightColumnTab === 'matrix' ? (
            <>
              {/* Section 1: Social Media Channel Linker */}
              <div className="bg-slate-950/45 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Link2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Social Channel Connect Panel</h3>
                    <p className="text-[9px] text-slate-500 font-sans">Join profiles directly with live feed analytics sync</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                  {socials.map((soc) => {
                    const [inputHandle, setInputHandle] = useState('');

                    return (
                      <div key={soc.platform} className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 space-y-3 hover:border-slate-800 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {soc.platform === 'Instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                            {soc.platform === 'LinkedIn' && <Linkedin className="w-4 h-4 text-sky-500" />}
                            {soc.platform === 'YouTube' && <Youtube className="w-4 h-4 text-red-500" />}
                            {soc.platform === 'Twitter' && <Twitter className="w-4 h-4 text-slate-200" />}
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{soc.platform}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                            {soc.followers} FOLLOWS
                          </span>
                        </div>

                        {soc.connected ? (
                          <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-2.5 flex items-center justify-between">
                            <div className="text-left">
                              <span className="block text-[8px] text-indigo-400 font-mono uppercase font-bold tracking-wider">ACTIVE INTEGRATION</span>
                              <strong className="text-xs text-white">{soc.handle}</strong>
                            </div>
                            <button
                              onClick={() => handleDisconnectSocial(soc.platform)}
                              className="text-[9px] font-mono font-bold uppercase text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
                            >
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={inputHandle}
                              onChange={(e) => setInputHandle(e.target.value)}
                              placeholder="Handle (e.g. @swan_media)"
                              className="flex-grow bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-[11px] text-white outline-none focus:border-indigo-500 placeholder-slate-700 transition-all"
                            />
                            <button
                              onClick={() => {
                                handleConnectSocial(soc.platform, inputHandle);
                                setInputHandle('');
                              }}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] px-3 py-1 rounded cursor-pointer transition-colors"
                            >
                              Join
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Share Directory Registry */}
              <div className="bg-slate-950/45 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <UserPlus className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Campaign Share Directory</h3>
                      <p className="text-[9px] text-slate-500 font-sans">Register collaborators who need campaign share permissions</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-indigo-950 border border-indigo-900 text-indigo-400 px-2 py-0.5 rounded font-mono">
                    {collaborators.length} registered
                  </span>
                </div>

                {/* Quick Add Form */}
                <form onSubmit={handleAddCollaborator} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-900 text-left">
                  <div className="sm:col-span-1">
                    <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Partner Name</label>
                    <input
                      type="text"
                      required
                      value={collabName}
                      onChange={(e) => setCollabName(e.target.value)}
                      placeholder="e.g. John Editor"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white outline-none placeholder-slate-700 transition-all"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Specialized Role</label>
                    <select
                      value={collabRole}
                      onChange={(e) => setCollabRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-1.5 text-[10px] text-slate-300 outline-none cursor-pointer"
                    >
                      <option value="Video Editor">Video Editor</option>
                      <option value="Graphic Designer">Graphic Designer</option>
                      <option value="Influencer">Influencer</option>
                      <option value="Copywriter">Copywriter</option>
                      <option value="Client Stakeholder">Client Partner</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={collabEmail}
                      onChange={(e) => setCollabEmail(e.target.value)}
                      placeholder="john@swanaya.com"
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-1.5 text-[10px] text-white outline-none placeholder-slate-700 transition-all"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-[10px] py-1.5 rounded cursor-pointer transition-colors flex items-center justify-center gap-1 shadow shadow-indigo-500/10 h-[28px] uppercase tracking-wider"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Partner
                    </button>
                  </div>
                </form>

                {/* List of collaborators */}
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {collaborators.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-900 rounded-xl text-slate-500 font-mono text-[10px] flex flex-col items-center justify-center gap-1">
                      <AlertCircle className="w-5 h-5 text-slate-700" />
                      <span>No partners registered to share campaigns yet.</span>
                    </div>
                  ) : (
                    collaborators.map((c) => (
                      <div key={c.id} className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex items-center justify-between text-left hover:border-slate-800 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-xs text-white">{c.name}</strong>
                            <span className="text-[8px] font-mono font-bold bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {c.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                            <span>{c.email}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteCollaborator(c.id, c.name)}
                          className="p-1.5 bg-slate-900 border border-slate-850 hover:border-rose-900 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer animate-fade-in"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Client Account Registration Portal Form Card */}
              <div className="bg-slate-950/45 border border-slate-850 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <UserPlus className="w-4 h-4 text-indigo-400" />
                  </span>
                  <div className="text-left">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Create Secure Client Profile</h3>
                    <p className="text-[9px] text-slate-500 font-sans">Establishes cloud storage credentials & contract tiers</p>
                  </div>
                </div>

                <form onSubmit={handleRegisterClient} className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Company / Brand Name</label>
                      <input
                        type="text"
                        required
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        placeholder="e.g. Acme Corporation"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none placeholder-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Brand Focus / Niche</label>
                      <select
                        value={clientNiche}
                        onChange={(e) => setClientNiche(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-slate-300 outline-none cursor-pointer"
                      >
                        <option value="Tech">Technology / SaaS</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Fashion">Fashion & Lifestyle</option>
                        <option value="Food & Beverage">Food & Beverage</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Creative Arts">Creative Arts</option>
                        <option value="Healthcare">Healthcare / Fitness</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Representative Name</label>
                      <input
                        type="text"
                        required
                        value={clientRep}
                        onChange={(e) => setClientRep(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none placeholder-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Email</label>
                      <input
                        type="email"
                        required
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="sarah@company.com"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none placeholder-slate-700 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-indigo-950/15 border border-indigo-900/30 p-3 rounded-xl">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-indigo-300 uppercase tracking-wider mb-1">System Portal Username</label>
                      <input
                        type="text"
                        required
                        value={clientUsername}
                        onChange={(e) => setClientUsername(e.target.value)}
                        placeholder="e.g. acme_partner"
                        className="w-full bg-slate-950 border border-indigo-900/40 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none placeholder-slate-700 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-indigo-300 uppercase tracking-wider mb-1">Secure Password</label>
                      <input
                        type="text"
                        required
                        value={clientPassword}
                        onChange={(e) => setClientPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950 border border-indigo-900/40 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none placeholder-slate-700 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Creative Budget</label>
                      <input
                        type="text"
                        value={clientBudget}
                        onChange={(e) => setClientBudget(e.target.value)}
                        placeholder="e.g. $7,500 / Month"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none placeholder-slate-700 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Linked Project Scope / Code</label>
                      <input
                        type="text"
                        value={clientScope}
                        onChange={(e) => setClientScope(e.target.value)}
                        placeholder="e.g. SWAN-ACME-2026"
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-white outline-none placeholder-slate-700 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Contract Start Date</label>
                      <input
                        type="date"
                        value={clientStart}
                        onChange={(e) => setClientStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-slate-300 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">Contract End Date</label>
                      <input
                        type="date"
                        value={clientEnd}
                        onChange={(e) => setClientEnd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded p-2 text-xs text-slate-300 outline-none"
                      />
                    </div>
                  </div>

                  {clientSuccessMsg && (
                    <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 text-xs leading-relaxed">
                      {clientSuccessMsg}
                    </div>
                  )}

                  {clientErrorMsg && (
                    <div className="bg-rose-950/30 border border-rose-500/30 text-rose-400 rounded-xl p-3 text-xs leading-relaxed">
                      {clientErrorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingClient}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 uppercase tracking-wider"
                  >
                    {isSubmittingClient ? (
                      <>Syncing Secure Cloud Profile...</>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Register Client Account & Portal Credentials
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Registered Corporate Clients List Section */}
              <div className="bg-slate-950/45 border border-slate-850 rounded-2xl p-5 space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <Users className="w-4 h-4 text-indigo-400" />
                    </span>
                    <div>
                      <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Registered Corporate Client Nodes</h3>
                      <p className="text-[9px] text-slate-500 font-sans">Active brand gateways managed securely in Firestore</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-indigo-950 border border-indigo-900 text-indigo-400 px-2 py-0.5 rounded font-mono">
                    {clients.length} accounts
                  </span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {clients.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-900 rounded-xl text-slate-500 font-mono text-xs flex flex-col items-center justify-center gap-1">
                      <AlertCircle className="w-5 h-5 text-slate-700" />
                      <span>No client accounts registered under this node.</span>
                    </div>
                  ) : (
                    clients.map((c) => (
                      <div key={c.id} className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-950 transition-all">
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm text-white font-display uppercase">{c.companyName}</strong>
                            <span className="text-[8px] font-mono font-bold bg-indigo-950/50 border border-indigo-900/30 text-indigo-400 px-2 py-0.5 rounded uppercase tracking-wider">
                              {c.niche}
                            </span>
                            {c.budget && (
                              <span className="text-[8px] font-mono font-bold bg-emerald-950/50 border border-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded uppercase tracking-wider">
                                {c.budget}
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 text-slate-400 text-[11px]">
                            <div>
                              <span className="text-slate-600 font-mono text-[9px] uppercase tracking-wider block">REPRESENTATIVE</span>
                              <strong className="text-slate-200">{c.repName}</strong> ({c.email})
                            </div>
                            <div>
                              <span className="text-slate-600 font-mono text-[9px] uppercase tracking-wider block">LOGIN ID & SCOPE</span>
                              <span className="font-mono text-indigo-300">{c.username}</span> | <span className="font-mono text-slate-500">{c.projectScope || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-slate-600 font-mono text-[9px] uppercase tracking-wider block">SECURE PASSWORD</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-indigo-300 tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-850">
                                  {revealedClientPasswords[c.id] ? (c.password || 'sw_pass_2026') : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setRevealedClientPasswords(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
                                  className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer p-0.5 rounded hover:bg-slate-900"
                                  title={revealedClientPasswords[c.id] ? "Hide password" : "See password"}
                                >
                                  {revealedClientPasswords[c.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          {c.startDate && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              Contract window: {c.startDate} to {c.endDate || 'Ongoing'}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to completely de-register and remove the credentials for "${c.companyName}"? This action deletes their Firestore profiles.`)) {
                                handleDeleteClient(c.id, c.companyName, c.username);
                              }
                            }}
                            className="p-2 bg-slate-900 border border-slate-850 hover:border-rose-900 text-slate-500 hover:text-rose-400 rounded-lg transition-all cursor-pointer"
                            title="Remove Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
