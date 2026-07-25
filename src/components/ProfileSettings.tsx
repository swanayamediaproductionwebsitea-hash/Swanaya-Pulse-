import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Shield, Mail, Briefcase, FileText, Camera, UploadCloud, 
  CheckCircle2, AlertCircle, Save, Award, RefreshCw, UserCheck, Code2, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RegisteredUser } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

import { doc, getDoc, setDoc } from 'firebase/firestore';

interface ProfileSettingsProps {
  currentUser: string;
  currentUserPermission?: 'viewer' | 'editor' | 'administrator';
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
  onProfileUpdate?: () => void;
  setActiveMainTab?: (tab: any) => void;
}

const PRESET_AVATARS = [
  { name: 'Director', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
  { name: 'Producer', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
  { name: 'HOD Marketing', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' },
  { name: 'R&D Lead', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150' },
  { name: 'Video Editor', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
  { name: 'Creative Designer', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' }
];

export default function ProfileSettings({ currentUser, currentUserPermission, addLog, onProfileUpdate, setActiveMainTab }: ProfileSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('Content Creator');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'clientHub'>('profile');
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Load existing profile from Firestore or LocalStorage
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const cleanUser = currentUser.toLowerCase();
      
      // 1. Try local cache first
      let localUser: RegisteredUser | null = null;
      const cached = localStorage.getItem('swanaya_registered_users');
      if (cached) {
        try {
          const list: RegisteredUser[] = JSON.parse(cached);
          const found = list.find(u => u.username.toLowerCase() === cleanUser);
          if (found) localUser = found;
        } catch (e) {
          console.error('Error loading profile local cache', e);
        }
      }

      // Populate local state as fallback
      if (localUser) {
        setFullName(localUser.fullName || '');
        setEmail(localUser.email || '');
        setDesignation(localUser.designation || 'Content Creator');
        setBio(localUser.bio || '');
        setProfileImage(localUser.profileImage || null);
      }

      // 2. Fetch fresh Firestore data
      try {
        const userDocRef = doc(db, 'users', cleanUser);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || data.username || '');
          setEmail(data.email || '');
          setDesignation(data.designation || 'Content Creator');
          setBio(data.bio || '');
          if (data.profileImage) {
            setProfileImage(data.profileImage);
          }
          
          // Sync back to local storage
          if (cached) {
            const list: RegisteredUser[] = JSON.parse(cached);
            const index = list.findIndex(u => u.username.toLowerCase() === cleanUser);
            if (index !== -1) {
              list[index] = {
                ...list[index],
                fullName: data.fullName || '',
                email: data.email || '',
                designation: data.designation || 'Content Creator',
                bio: data.bio || '',
                profileImage: data.profileImage || ''
              };
              localStorage.setItem('swanaya_registered_users', JSON.stringify(list));
            }
          }
        }
      } catch (error) {
        console.error('Failed to sync profile from Firestore', error);
        handleFirestoreError(error, OperationType.GET, `users/${cleanUser}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  // Handle saving profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    const cleanUser = currentUser.toLowerCase();

    try {
      // 1. Update Firestore
      const userDocRef = doc(db, 'users', cleanUser);
      await setDoc(userDocRef, {
        fullName,
        email,
        designation,
        bio,
        profileImage: profileImage || ''
      }, { merge: true });

      // 2. Update LocalStorage
      const cached = localStorage.getItem('swanaya_registered_users');
      if (cached) {
        const list: RegisteredUser[] = JSON.parse(cached);
        const index = list.findIndex(u => u.username.toLowerCase() === cleanUser);
        if (index !== -1) {
          list[index] = {
            ...list[index],
            fullName,
            email,
            designation,
            bio,
            profileImage: profileImage || ''
          };
          localStorage.setItem('swanaya_registered_users', JSON.stringify(list));
        }
      }

      // 3. Update top-level profile reference for immediate header updates
      localStorage.setItem(`swanaya_profile_image_${currentUser}`, profileImage || '');
      localStorage.setItem(`swanaya_profile_title_${currentUser}`, designation);

      setSaveStatus('success');
      addLog(`Profile Settings: Updated operator profile configurations for ${currentUser}`, 'success');
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }

      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
      setSaveStatus('error');
      addLog(`Profile Settings Error: Failed to save changes to Firestore`, 'warning');
      handleFirestoreError(err, OperationType.WRITE, `users/${cleanUser}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Convert uploaded image file to base64
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addLog('Validation Error: Profile picture must be an image file type', 'warning');
      return;
    }
    
    // limit to 1MB to preserve Firestore / LocalStorage constraints safely
    if (file.size > 1024 * 1024) {
      addLog('Validation Error: Image file size must be less than 1MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setProfileImage(base64);
      addLog('Profile Settings: Processed and set custom profile avatar image', 'upload');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">Loading Operator Profile Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Sub-Tab Navigation Header */}
      <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-850 max-w-sm">
        <button
          type="button"
          onClick={() => {
            setSettingsSubTab('profile');
            addLog('Profile Settings: Switched setting category to Operator Profile Parameters', 'info');
          }}
          className={`flex-1 py-1.5 px-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            settingsSubTab === 'profile' 
              ? 'bg-indigo-600 text-white shadow shadow-indigo-500/15' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Operator Profile</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSettingsSubTab('clientHub');
            addLog('Profile Settings: Switched setting category to Client Connection Hub Matrix', 'info');
          }}
          className={`flex-1 py-1.5 px-3.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            settingsSubTab === 'clientHub' 
              ? 'bg-indigo-600 text-white shadow shadow-indigo-500/15' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Client Hub</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {settingsSubTab === 'profile' && (
          <motion.div
            key="profile-form-parameters"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
          >
      
      {/* LEFT COLUMN: Visual Profile Card Mockup (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award className="w-48 h-48 text-indigo-400" />
          </div>

          <div className="space-y-6 text-center relative z-10">
            {/* Operator Tag */}
            <div className="flex justify-center">
              <span className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Approved Operator Node
              </span>
            </div>

            {/* Profile Avatar Frame with Edit Badge */}
            <div className="relative w-28 h-28 mx-auto group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-emerald-500 animate-pulse blur-sm opacity-50" />
              <div className="relative w-full h-full rounded-full border-2 border-indigo-500/60 overflow-hidden bg-slate-950">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
                    <User className="w-12 h-12" />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 border border-indigo-400 hover:bg-indigo-500 text-white rounded-full cursor-pointer transition-transform group-hover:scale-110 shadow-lg"
                title="Upload Profile Image"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Identity details */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-white uppercase tracking-tight font-display leading-tight">
                {fullName || currentUser}
              </h3>
              <p className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                {designation}
              </p>
              <p className="text-[10px] font-mono text-slate-500 uppercase">
                Operator ID: <span className="text-slate-400 font-bold">{currentUser}</span>
              </p>
            </div>

            {/* Quick stats / summary block */}
            <div className="bg-slate-950/60 border border-slate-850 rounded-xl p-4 text-left space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Professional Bio</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans italic">
                  {bio || '"No custom biography established. Fill out the operational focus on the profile form to populate this area."'}
                </p>
              </div>

              <div className="border-t border-slate-900 pt-3 space-y-1.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Network Identity Metadata</span>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
                  <div>
                    <span className="text-slate-600 block">Registry Access:</span>
                    <strong className="text-slate-300">AUTHORIZED</strong>
                  </div>
                  <div>
                    <span className="text-slate-600 block">Cloud Server Synced:</span>
                    <strong className="text-emerald-400">ONLINE</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Avatars Selection Panel */}
        <div className="bg-slate-950/45 border border-slate-800/80 rounded-2xl p-5 space-y-3.5">
          <div className="border-b border-slate-850 pb-2.5">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Select Preset Creator Avatars</h4>
            <p className="text-[10px] text-slate-500">Fast presets designed for Swanaya creator nodes</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {PRESET_AVATARS.map((avatar) => (
              <button
                key={avatar.name}
                type="button"
                onClick={() => {
                  setProfileImage(avatar.url);
                  addLog(`Profile Settings: Loaded preset avatar for "${avatar.name}"`, 'info');
                }}
                className={`p-2 rounded-xl border text-center transition-all cursor-pointer bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-500/40 flex flex-col items-center gap-1.5 group ${
                  profileImage === avatar.url 
                    ? 'border-indigo-500 ring-1 ring-indigo-500/30' 
                    : 'border-slate-850 text-slate-400'
                }`}
              >
                <img 
                  src={avatar.url} 
                  alt={avatar.name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-800 group-hover:border-indigo-400/40 transition-colors"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[8px] font-mono font-bold leading-none uppercase truncate max-w-full">
                  {avatar.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Developer Information Card */}
        <div className="bg-slate-950/45 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-850 pb-2.5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Developer Information</h4>
              <p className="text-[10px] text-slate-500">System architecture & workspace metadata</p>
            </div>
            <Code2 className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-3">
            <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-xl space-y-2 text-left font-mono text-[10px]">
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-500">Workspace Mode:</span>
                <span className="text-indigo-400 font-bold">Hybrid Node (React/Vite)</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-500">Server Ingress:</span>
                <span className="text-slate-300">Port 3000</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-500">Cloud Database:</span>
                <span className="text-emerald-400 font-bold">Active (Firestore)</span>
              </div>
              <div className="flex justify-between border-b border-slate-850 pb-1.5">
                <span className="text-slate-500">Security Credentials:</span>
                <span className="text-amber-400">RSA-2048 Shared Key</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Local System Clock:</span>
                <span className="text-slate-300">{new Date().toISOString().split('T')[0]}</span>
              </div>
            </div>

            {/* Hidden Console Access under Dev Info */}
            <div className="pt-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase block mb-2 text-left font-bold font-display">Administrative Commands</span>
              
              {setActiveMainTab && (currentUser?.toLowerCase() === 'aadithyan' || currentUserPermission === 'administrator') ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainTab('admin');
                    addLog('System Navigation: Switched workspace to [Admin Console] via Developer Information', 'info');
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono font-bold text-[10px] py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Launch Admin Console</span>
                </button>
              ) : (
                <div className="text-[10px] text-slate-500 bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-left">
                  🔒 Administrative Console is strictly restricted to System Administrators.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Profile Form Fields (7 Cols) */}
      <div className="lg:col-span-7">
        <form onSubmit={handleSaveProfile} className="bg-slate-950/45 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6 text-left shadow-2xl">
          <div className="border-b border-slate-850 pb-4 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">OPERATOR PROFILE PARAMETERS</h3>
              <p className="text-[10px] text-slate-500 font-sans">Manage database variables and authorization details</p>
            </div>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-5">
            {/* Username (Disabled / Readonly) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Unique Operator Username</span>
                <span className="text-[9px] font-mono text-slate-500 lowercase italic">non-editable credentials lock</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  disabled
                  value={currentUser}
                  className="w-full bg-slate-900/60 border border-slate-850/80 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-400 outline-none cursor-not-allowed font-mono uppercase font-bold"
                />
              </div>
            </div>

            {/* Grid for Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Display Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aadithyan M Menon"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. Swanayamediaproduction@gmail.com"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Designation / Role Selection Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Creator Designation / Role
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Briefcase className="w-4 h-4" />
                </span>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white outline-none transition-all cursor-pointer"
                >
                  <option value="Director of Marketing & Productions">Director of Marketing & Productions</option>
                  <option value="R&D Software Engineer">R&D Software Engineer</option>
                  <option value="Senior Video Producer">Senior Video Producer</option>
                  <option value="Brand Copy Strategist">Brand Copy Strategist</option>
                  <option value="Visual Content Designer">Visual Content Designer</option>
                  <option value="General Media Planner">General Media Planner</option>
                  <option value="Content Creator">Content Creator</option>
                </select>
              </div>
            </div>

            {/* Biography Text Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Biography / Professional Focus
              </label>
              <div className="relative">
                <span className="absolute top-2.5 left-3 text-slate-500">
                  <FileText className="w-4 h-4" />
                </span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your creative objectives or specialized marketing focuses..."
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Custom Image Drag-and-Drop Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Custom Drag-and-Drop Profile Image Uploader
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border border-dashed p-6 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-indigo-500 bg-indigo-950/20' 
                    : 'border-slate-850 hover:border-slate-800 bg-slate-950/40 hover:bg-slate-950/80'
                }`}
              >
                <UploadCloud className={`w-8 h-8 ${isDragging ? 'text-indigo-400 scale-110' : 'text-slate-500'} transition-transform`} />
                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-300">Drag & Drop profile picture here or <span className="text-indigo-400 hover:underline">Browse</span></p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Supports PNG, JPG, or WEBP. Limit size to 1MB.</p>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Feedback & Saving Section */}
          <div className="pt-4 border-t border-slate-850/60 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <AnimatePresence mode="wait">
              {saveStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Profile Successfully Synced!
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4" /> Sync Failure. Try Again.
                </motion.div>
              )}
              {saveStatus === 'idle' && (
                <div className="text-[10px] font-mono text-slate-500 leading-none">
                  🔐 Settings are preserved securely in local cache and Firestore.
                </div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Profile Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
