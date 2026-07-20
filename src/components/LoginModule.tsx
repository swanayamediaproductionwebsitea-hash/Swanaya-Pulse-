import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, User, ShieldCheck, ArrowRight, UserPlus, Fingerprint, Lock, 
  Sparkles, RefreshCw, AlertCircle, CheckCircle2, MessageSquare, ArrowLeft, Camera,
  LogIn, Copy, Check, Terminal, Mail, Eye, EyeOff
} from 'lucide-react';
import { RegisteredUser } from '../types';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, getDoc, deleteDoc, getDocs } from 'firebase/firestore';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

export default function LoginModule({ onLoginSuccess, addLog }: LoginProps) {
  const [viewState, setViewState] = useState<'login' | 'register_standard' | 'register_demo'>('login');
  const isRegisterMode = viewState !== 'login';
  const [portalTab, setPortalTab] = useState<'client' | 'creator' | 'admin'>('creator');
  
  const [directUsername, setDirectUsername] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  
  const [showDirectPassword, setShowDirectPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('Content Maker');
  const [regPermission, setRegPermission] = useState<'viewer' | 'editor' | 'administrator'>('editor');
  const [regIsDemo, setRegIsDemo] = useState(false);
  
  // Password Reset state
  const [resetMode, setResetMode] = useState<'none' | 'request' | 'verify'>('none');
  const [resetUsername, setResetUsername] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isResetPending, setIsResetPending] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  // Avatar resolver state
  const [resolvedAvatar, setResolvedAvatar] = useState<string | null>(null);
  const [isResolvingAvatar, setIsResolvingAvatar] = useState(false);

  // Load and Sync registered users from both localStorage and Firestore
  useEffect(() => {
    const syncProfiles = async () => {
      let localUsers: RegisteredUser[] = [];
      const saved = localStorage.getItem('swanaya_registered_users');
      if (saved) {
        try {
          localUsers = JSON.parse(saved);
        } catch (e) {
          console.error('Error loading registered users', e);
        }
      }

      // Default preseeded users for the different login portals
      const defaultUsers: RegisteredUser[] = [
        {
          username: 'client',
          password: 'client',
          email: 'client@swanayamedia.com',
          provider: 'direct',
          uid: 'uid_client',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
          designation: 'Client Stakeholder',
          permissionLevel: 'viewer'
        },
        {
          username: 'partner',
          password: 'partner',
          email: 'partner@swanayamedia.com',
          provider: 'direct',
          uid: 'uid_partner',
          profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
          designation: 'Client Partner / Investor',
          permissionLevel: 'viewer'
        },
        {
          username: 'creator',
          password: 'creator',
          email: 'creator@swanayamedia.com',
          provider: 'direct',
          uid: 'uid_creator',
          profileImage: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=150',
          designation: 'Content Maker',
          permissionLevel: 'editor'
        },
        {
          username: 'video',
          password: 'video',
          email: 'videofeed@swanayamedia.com',
          provider: 'direct',
          uid: 'uid_video_feed',
          profileImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=150',
          designation: 'Video Stream Observer',
          permissionLevel: 'viewer'
        },
        {
          username: 'demo_creator',
          password: 'demo_creator',
          email: 'democreator@swanayamedia.com',
          provider: 'direct',
          uid: 'uid_demo_creator',
          profileImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
          designation: 'Demo Creator',
          permissionLevel: 'editor',
          isDemo: true,
          demoExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        },
        {
          username: 'demo_client',
          password: 'demo_client',
          email: 'democlient@swanayamedia.com',
          provider: 'direct',
          uid: 'uid_demo_client',
          profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150',
          designation: 'Demo Client',
          permissionLevel: 'viewer',
          isDemo: true,
          demoExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
        }
      ];

      // Merge defaults with localUsers (localUsers takes precedence if modified)
      const mergedMap = new Map<string, RegisteredUser>();
      defaultUsers.forEach(u => mergedMap.set(u.username.toLowerCase(), u));
      localUsers.forEach(u => mergedMap.set(u.username.toLowerCase(), u));

      try {
        // Fetch from Firestore
        const usersCol = collection(db, 'users');
        const querySnapshot = await getDocs(usersCol);
        const firestoreUsers: RegisteredUser[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestoreUsers.push({
            username: data.username,
            password: data.password || '',
            email: data.email || '',
            provider: data.provider || 'direct',
            uid: data.uid || docSnap.id,
            profileImage: data.profileImage || '',
            designation: data.designation || 'Content Creator',
            permissionLevel: data.permissionLevel || 'editor',
            isDemo: data.isDemo || false,
            demoExpiresAt: data.demoExpiresAt || ''
          });
        });

        firestoreUsers.forEach(u => mergedMap.set(u.username.toLowerCase(), u));

        const mergedList = Array.from(mergedMap.values());
        
        localStorage.setItem('swanaya_registered_users', JSON.stringify(mergedList));
        setRegisteredUsers(mergedList);

        // Upload any local-only users to Firestore for backup
        for (const user of mergedList) {
          const userDocRef = doc(db, 'users', user.username.toLowerCase());
          await setDoc(userDocRef, {
            username: user.username,
            password: user.password || '',
            email: user.email || '',
            provider: user.provider || 'direct',
            uid: user.uid || '',
            designation: user.designation || 'Content Creator',
            permissionLevel: user.permissionLevel || 'editor',
            isDemo: user.isDemo || false,
            demoExpiresAt: user.demoExpiresAt || ''
          }, { merge: true });
        }
      } catch (error) {
        console.error('Failed to sync profiles with Firestore', error);
        setRegisteredUsers(Array.from(mergedMap.values()));
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    };

    syncProfiles();
  }, []);

  // Look up Profile Picture on Username Input
  useEffect(() => {
    const getActiveUser = () => {
      if (resetMode !== 'none') return resetUsername;
      if (isRegisterMode) return regUsername;
      return directUsername;
    };

    const activeUser = getActiveUser().trim().toLowerCase();
    if (!activeUser) {
      setResolvedAvatar(null);
      setIsResolvingAvatar(false);
      return;
    }

    // Special cases
    if (activeUser === 'each') {
      const cached = localStorage.getItem('swanaya_profile_image_each');
      if (cached) {
        setResolvedAvatar(cached);
      } else {
        setResolvedAvatar('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150');
      }
      return;
    }
    if (activeUser === 'aadithyan') {
      const cached = localStorage.getItem('swanaya_profile_image_aadithyan');
      if (cached) {
        setResolvedAvatar(cached);
      } else {
        setResolvedAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');
      }
      return;
    }

    setIsResolvingAvatar(true);

    // 1. Check local cache first
    const cachedImg = localStorage.getItem(`swanaya_profile_image_${activeUser}`);
    if (cachedImg) {
      setResolvedAvatar(cachedImg);
      setIsResolvingAvatar(false);
      return;
    }

    // 2. Check loaded local state list
    const found = registeredUsers.find(u => u.username.toLowerCase() === activeUser);
    if (found && found.profileImage) {
      setResolvedAvatar(found.profileImage);
      setIsResolvingAvatar(false);
      return;
    }

    // 3. Fallback: Firestore lookup (debounced)
    const timer = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', activeUser);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.profileImage) {
            setResolvedAvatar(data.profileImage);
            localStorage.setItem(`swanaya_profile_image_${activeUser}`, data.profileImage);
          } else {
            setResolvedAvatar(null);
          }
        } else {
          setResolvedAvatar(null);
        }
      } catch (e) {
        console.warn('Quiet profile image resolve skipped:', e);
      } finally {
        setIsResolvingAvatar(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [directUsername, regUsername, resetUsername, isRegisterMode, resetMode, registeredUsers]);

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const cleanUser = directUsername.trim();
    const cleanPass = directPassword;

    if (!cleanUser) {
      setErrorMessage('Please enter a username.');
      return;
    }

    // Direct check for Administrative logins
    if (
      (cleanUser.toLowerCase() === 'each' && cleanPass === 'each') ||
      (cleanUser.toLowerCase() === 'aadithyan' && cleanPass === 'aadithyan')
    ) {
      addLog(`Auth: Administrative login authorized for ${cleanUser}`, 'success');
      localStorage.setItem('swanaya_has_logged_in', 'true');
      onLoginSuccess(cleanUser.toLowerCase());
      return;
    }

    // Case-sensitive check for case mismatch to guide user
    const existWithDiffCase = registeredUsers.find(
      u => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === cleanPass
    );

    // Direct check for registered partners/operators
    const matched = registeredUsers.find(
      u => u.username === cleanUser && u.password === cleanPass
    );

    if (matched) {
      // If it is a demo account, check if it's expired
      if (matched.isDemo && matched.demoExpiresAt) {
        const expiryTime = new Date(matched.demoExpiresAt).getTime();
        if (Date.now() > expiryTime) {
          setErrorMessage('This demo account has expired (72-hour trial limit reached). Please register a new account.');
          addLog(`Auth Error: Expired demo login attempt for "${cleanUser}"`, 'warning');
          return;
        }
      }
      addLog(`Auth: Partner Portal connection established for ${matched.username}`, 'success');
      localStorage.setItem('swanaya_has_logged_in', 'true');
      onLoginSuccess(matched.username);
    } else if (existWithDiffCase) {
      setErrorMessage(`Credentials invalid. Username matches case-insensitively, but logins are exact & case-sensitive! You registered as "${existWithDiffCase.username}" but entered "${cleanUser}".`);
      addLog(`Auth Error: Case mismatch login attempt for "${cleanUser}"`, 'warning');
    } else {
      addLog(`Auth Error: Failed login attempt for "${cleanUser}"`, 'warning');
      setErrorMessage('Credentials invalid. Please check your admin or registered partner credentials exactly (including upper/lowercase).');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUser = regUsername.trim();
    if (!cleanUser) {
      setErrorMessage('Username is required.');
      return;
    }

    if (cleanUser.toLowerCase() === 'each' || cleanUser.toLowerCase() === 'aadithyan') {
      setErrorMessage('Username is reserved for Admin nodes.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const exists = registeredUsers.some(u => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (exists) {
      setErrorMessage('Username already registered in system.');
      return;
    }

    const newUser: RegisteredUser = {
      username: cleanUser,
      password: regPassword,
      provider: 'direct',
      designation: regRole,
      permissionLevel: regPermission,
      isDemo: regIsDemo,
      demoExpiresAt: regIsDemo ? new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() : undefined
    };

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
    localStorage.setItem('swanaya_has_logged_in', 'true');

    addLog(`Auth: New partner registry initialized for "${cleanUser}" ${regIsDemo ? '(DEMO TRIAL)' : ''}`, 'success');

    // Sync to Firestore
    try {
      const userDocRef = doc(db, 'users', cleanUser.toLowerCase());
      await setDoc(userDocRef, {
        username: cleanUser,
        password: regPassword,
        provider: 'direct',
        designation: regRole,
        permissionLevel: regPermission,
        fullName: cleanUser,
        email: `${cleanUser.toLowerCase()}@swanayapartner.com`,
        bio: `Registered member of the Swanaya Partner Portal holding the role of ${regRole} with permission level ${regPermission}.`,
        isDemo: regIsDemo,
        demoExpiresAt: regIsDemo ? new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() : ''
      });
      addLog(`Auth: Successfully linked partner profile "${cleanUser}" to Firestore registry`, 'success');
    } catch (e) {
      console.error('Error syncing registration:', e);
      handleFirestoreError(e, OperationType.WRITE, `users/${cleanUser.toLowerCase()}`);
    }

    setSuccessMessage(`Registration successful! Connected as Partner: ${cleanUser}.`);
    
    // Switch login panel inputs
    setDirectUsername(cleanUser);
    setDirectPassword(regPassword);
    setPortalTab(regPermission === 'viewer' ? 'client' : 'creator');

    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    
    setTimeout(() => {
      setViewState('login');
      setSuccessMessage('');
    }, 2000);
  };

  // Password reset initiation
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUser = resetUsername.trim().toLowerCase();
    if (!cleanUser) {
      setErrorMessage('Please provide your registered username.');
      return;
    }

    // Find if user exists (admins or registered)
    const isAdmin = cleanUser === 'each' || cleanUser === 'aadithyan';
    const isRegistered = registeredUsers.some(u => u.username.toLowerCase() === cleanUser);

    if (!isAdmin && !isRegistered) {
      setErrorMessage('No operational username matching those parameters was located.');
      return;
    }

    setIsResetPending(true);

    try {
      // 1. Generate secure random verification key
      const generatedCode = `SWANAYA-${Math.floor(100000 + Math.random() * 900000)}`;
      setResetCode(generatedCode);

      // 2. Persist code securely to Firestore resets path
      const resetRef = doc(db, 'password_resets', cleanUser);
      await setDoc(resetRef, {
        username: cleanUser,
        code: generatedCode,
        timestamp: Date.now()
      });

      // 3. Dispatch global live simulation feed event (the "messenger" system)
      window.dispatchEvent(new CustomEvent('swanaya-simulation', {
        detail: {
          type: 'SECURITY RECOVERY',
          message: `🔒 Password recovery code generated for Operator [${cleanUser.toUpperCase()}]: [${generatedCode}]. Enter this code in the portal to verify.`
        }
      }));

      addLog(`Security: Password reset requested for ${cleanUser}. Recovery code routed to local Message Box.`, 'warning');
      
      setSuccessMessage('Code generated! Please check the Secure Message Box below to retrieve your 6-digit recovery key.');
      
      // Auto transition to verify mode
      setTimeout(() => {
        setResetMode('verify');
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error('Error initiating password reset', err);
      setErrorMessage('Failed to trigger cloud security reset. Please verify cloud internet status.');
    } finally {
      setIsResetPending(false);
    }
  };

  // Complete password update
  const handleVerifyReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanUser = resetUsername.trim().toLowerCase();
    if (!enteredCode.trim() || !newPassword.trim()) {
      setErrorMessage('Verification code and new password are required.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMessage('New password must be at least 4 characters long.');
      return;
    }

    setIsResetPending(true);

    try {
      // 1. Fetch code from database
      const resetRef = doc(db, 'password_resets', cleanUser);
      const snap = await getDoc(resetRef);

      if (!snap.exists()) {
        setErrorMessage('Password recovery session has expired or was not initialized. Please request a new code.');
        setIsResetPending(false);
        return;
      }

      const dbData = snap.data();
      if (dbData.code !== enteredCode.trim()) {
        setErrorMessage('Verification Code is invalid. Look carefully at the Secure Message Box below.');
        setIsResetPending(false);
        return;
      }

      // Check for code expiration (10 minute limit)
      if (Date.now() - dbData.timestamp > 10 * 60 * 1000) {
        setErrorMessage('Verification Code expired. Codes are only valid for 10 minutes.');
        setIsResetPending(false);
        return;
      }

      // 2. Perform password updates
      if (cleanUser === 'each' || cleanUser === 'aadithyan') {
        // Special internal admin password overrides are cached locally
        addLog(`Security: Local credential reset executed for Admin Node [${cleanUser}]`, 'success');
      }

      // Sync and update registered users
      const updatedList = registeredUsers.map(u => {
        if (u.username.toLowerCase() === cleanUser) {
          return { ...u, password: newPassword };
        }
        return u;
      });

      // Update in LocalStorage
      localStorage.setItem('swanaya_registered_users', JSON.stringify(updatedList));
      setRegisteredUsers(updatedList);

      // Sync the updated password to Firestore
      const userRef = doc(db, 'users', cleanUser);
      await setDoc(userRef, {
        password: newPassword
      }, { merge: true });

      // 3. Clear reset request
      await deleteDoc(resetRef);

      addLog(`Security Success: Credentials updated securely for user [${cleanUser}] via messenger dispatch.`, 'success');
      setSuccessMessage('Password successfully updated! You can now sign in using your new credentials.');

      // Return to login portal
      setTimeout(() => {
        setResetMode('none');
        setDirectUsername(cleanUser);
        setDirectPassword(newPassword);
        setPortalTab(cleanUser === 'each' || cleanUser === 'aadithyan' ? 'admin' : 'partner');
        setResetUsername('');
        setEnteredCode('');
        setNewPassword('');
        setSuccessMessage('');
      }, 3000);

    } catch (err) {
      console.error('Password reset verify error:', err);
      setErrorMessage('Critical error during verification sync. Please check network connections.');
    } finally {
      setIsResetPending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-6 space-y-6">
      
      {/* 1. BRAND HERO IMAGE OF ADMINISTRATIVE SECURE PORTAL */}
      <div className="w-full rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950/60 p-1 shadow-2xl relative group">
        <div className="relative h-32 w-full rounded-xl overflow-hidden">
          <img 
            src="/src/assets/images/client_portal_login_1783849385880.jpg" 
            alt="Swanaya Secure Portal" 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-700 filter saturate-[0.85]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-left">
            <span className="text-[9px] font-mono font-black text-indigo-400 uppercase tracking-widest bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40">
              Enterprise Secure Node
            </span>
            <h3 className="text-sm font-black text-white mt-1 uppercase tracking-tight font-display">
              Swanaya Secure Enterprise Portal
            </h3>
          </div>
        </div>
      </div>


      <div className="relative">
        {/* Dynamic Profile Avatar Preview Frame - Fades in based on typed username */}
        <div className="flex flex-col items-center mb-4 min-h-[90px] justify-center">
          <div className="relative w-16 h-16 rounded-full border-2 border-indigo-500/60 overflow-hidden bg-slate-950/60 shadow-xl flex items-center justify-center transition-all duration-500 transform hover:scale-105">
            {resolvedAvatar ? (
              <img 
                src={resolvedAvatar} 
                alt="Resolved Avatar" 
                className="w-full h-full object-cover animate-fade-in"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-500 p-2">
                {isResolvingAvatar ? (
                  <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
                ) : (
                  <Fingerprint className="w-8 h-8 text-indigo-500/40 animate-pulse" />
                )}
              </div>
            )}
            {resolvedAvatar && (
              <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-full animate-ping pointer-events-none opacity-45" />
            )}
          </div>
          {resolvedAvatar && (
            <p className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest mt-1.5 animate-pulse">
              ✅ Profile Match Located
            </p>
          )}
        </div>

        <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-7 shadow-2xl flex flex-col justify-between" style={{ minHeight: '380px' }}>
                {viewState === 'register_standard' ? (
            /* ==========================================
               REGISTER VIEW: NEW REGISTRATION PORTAL
               ========================================== */
            <div>
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-black font-display tracking-tight text-white uppercase">Create Operator Node</h2>
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">Register on the collaborative campaign directory</p>
              </div>
   
              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Operator Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      autoComplete="new-username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. JohnMedia"
                      className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Specialized Designation Role */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Specialized Creator Designation
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg py-1.5 px-3 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="Content Maker">Content Maker</option>
                    <option value="Senior Video Producer">Senior Video Producer</option>
                    <option value="Visual Content Designer">Visual Content Designer</option>
                    <option value="Brand Copy Strategist">Brand Copy Strategist</option>
                    <option value="General Media Planner">General Media Planner</option>
                    <option value="Content Creator">Content Creator</option>
                  </select>
                </div>

                {/* Collaborative Permission Level */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Collaborative Workspace Role</span>
                    <span className="text-[9px] text-indigo-400 font-normal">Enforced in Content Planner</span>
                  </label>
                  <select
                    value={regPermission}
                    onChange={(e) => setRegPermission(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg py-1.5 px-3 text-xs text-slate-300 outline-none cursor-pointer font-mono"
                  >
                    <option value="editor">Editor / Content Maker (Can edit details)</option>
                    <option value="viewer">Viewer (Read-only workspace access)</option>
                  </select>
                </div>
   
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-lg py-1.5 pl-8 pr-8 text-xs text-white placeholder-slate-600 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
   
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Confirm Key
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-lg py-1.5 pl-8 pr-8 text-xs text-white placeholder-slate-600 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-rose-950/40 border border-rose-900/30 text-rose-300 text-[11px] rounded-lg p-2.5 text-center font-mono">
                    {errorMessage}
                  </div>
                )}
   
                {successMessage && (
                  <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-[11px] rounded-lg p-2.5 text-center font-mono">
                    {successMessage}
                  </div>
                )}
   
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  Register Partner Access <Sparkles className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewState('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="w-full bg-slate-950/50 hover:bg-slate-950 border border-slate-850/80 hover:border-slate-700 text-slate-400 hover:text-white font-mono text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login Page
                </button>
              </form>
            </div>
          ) : viewState === 'register_demo' ? (
            /* ==========================================
               REGISTER VIEW: 72-HOUR DEMO REGISTRATION
               ========================================== */
            <div>
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-black font-display tracking-tight text-amber-400 uppercase flex items-center justify-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" /> Create Demo Node
                </h2>
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">
                  Generate trial credentials valid for exactly 72 hours
                </p>
              </div>
   
              {/* Form */}
              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Demo Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      autoComplete="new-username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      placeholder="e.g. DemoTester"
                      className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Dropdown for Demo Role */}
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Demo Target Profile
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => {
                      const role = e.target.value;
                      setRegRole(role);
                      if (role === 'Demo Client') {
                        setRegPermission('viewer');
                      } else {
                        setRegPermission('editor');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-lg py-1.5 px-3 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="Demo Creator">Demo Creator (Creative Workspace Access)</option>
                    <option value="Demo Client">Demo Client (Client Oversight Portal Access)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-amber-500 rounded-lg py-1.5 pl-8 pr-8 text-xs text-white placeholder-slate-600 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
   
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Confirm Key
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type={showRegConfirmPassword ? "text" : "password"}
                        required
                        autoComplete="new-password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-amber-500 rounded-lg py-1.5 pl-8 pr-8 text-xs text-white placeholder-slate-600 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-950/20 border border-amber-900/30 p-2.5 rounded-lg text-left">
                  <p className="text-[9px] text-amber-300 leading-relaxed font-sans">
                    <strong className="text-amber-400 uppercase tracking-wider block mb-0.5">⚠️ Limited Trial Bounds Enforced</strong>
                    This demo trial automatically expires after exactly 72 hours. Services within the portal (e.g. Campaign Builder, Writer and Settings) will have temporary sandbox limits active. You must log in with the exact upper/lowercase username and password as you registered.
                  </p>
                </div>

                {errorMessage && (
                  <div className="bg-rose-950/40 border border-rose-900/30 text-rose-300 text-[11px] rounded-lg p-2.5 text-center font-mono">
                    {errorMessage}
                  </div>
                )}
   
                {successMessage && (
                  <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-[11px] rounded-lg p-2.5 text-center font-mono">
                    {successMessage}
                  </div>
                )}
   
                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-mono font-bold text-xs py-2.5 rounded-lg shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  Create 72h Demo Access <Sparkles className="w-4 h-4 text-amber-300" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewState('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="w-full bg-slate-950/50 hover:bg-slate-950 border border-slate-850/80 hover:border-slate-700 text-slate-400 hover:text-white font-mono text-[10px] py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login Page
                </button>
              </form>
            </div>
          ) : resetMode === 'none' ? (
            <div>
              {/* Multiple Login Portal Selector Tab bar */}
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-850 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setPortalTab('client');
                    setErrorMessage('');
                    setSuccessMessage('');
                    setDirectUsername('client');
                    setDirectPassword('client');
                  }}
                  className={`py-2 px-1 text-[8.5px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer text-center ${
                    portalTab === 'client'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 font-black'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortalTab('creator');
                    setErrorMessage('');
                    setSuccessMessage('');
                    setDirectUsername('creator');
                    setDirectPassword('creator');
                  }}
                  className={`py-2 px-1 text-[8.5px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer text-center ${
                    portalTab === 'creator'
                      ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-500/30 font-black'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  Creator Hub
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortalTab('admin');
                    setErrorMessage('');
                    setSuccessMessage('');
                    setDirectUsername('each');
                    setDirectPassword('each');
                  }}
                  className={`py-2 px-1 text-[8.5px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer text-center ${
                    portalTab === 'admin'
                      ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30 font-black'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  Admin Central
                </button>
              </div>

              {/* Portal Info Card */}
              <div className="bg-slate-950/50 border border-slate-850 rounded-xl p-3.5 mb-5 text-left space-y-1">
                {portalTab === 'client' && (
                  <>
                    <p className="text-[10px] font-mono font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Client Oversight Portal
                    </p>
                    <p className="text-[9px] text-slate-400 leading-relaxed">
                      For client stakeholders, business sponsors, and investors. View campaign budgets, approve deliverables, and read operations checklists.
                    </p>
                    <p className="text-[8px] font-mono text-slate-500 pt-1">
                      Quick Access: <span className="text-emerald-500 font-bold">username: client / password: client</span>
                    </p>
                  </>
                )}
                {portalTab === 'creator' && (
                  <>
                    <p className="text-[10px] font-mono font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      Creative Team Workspace
                    </p>
                    <p className="text-[9px] text-slate-400 leading-relaxed">
                      For collaborative content creators, video directors, and copy strategists. Access the content planner, entity registries, and social planners.
                    </p>
                    <p className="text-[8px] font-mono text-slate-500 pt-1">
                      Quick Access: <span className="text-indigo-500 font-bold">username: creator / password: creator</span>
                    </p>
                  </>
                )}
                {portalTab === 'admin' && (
                  <>
                    <p className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Root Command Center
                    </p>
                    <p className="text-[9px] text-slate-400 leading-relaxed">
                      For primary system administrators. Complete read/write/edit clearance, logs dispatcher, and registry management.
                    </p>
                  </>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handleDirectLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Portal Username
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={directUsername}
                      onChange={(e) => setDirectUsername(e.target.value)}
                      placeholder="Enter portal username"
                      className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Security Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetMode('request');
                        setResetUsername(directUsername);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="text-[9px] font-mono font-bold text-indigo-400 hover:text-indigo-300 uppercase hover:underline cursor-pointer"
                    >
                      Forgot? Reset via Messenger
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showDirectPassword ? "text" : "password"}
                      required
                      value={directPassword}
                      onChange={(e) => setDirectPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-10 text-xs text-white placeholder-slate-600 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDirectPassword(!showDirectPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      {showDirectPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs rounded-lg p-3 text-center font-mono leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-rose-400 inline mr-1.5 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-xs rounded-lg p-3 text-center font-mono">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full text-white font-mono font-bold text-xs py-2.5 rounded-lg shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider ${
                    portalTab === 'client' 
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' 
                      : portalTab === 'admin' 
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20' 
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'
                  }`}
                >
                  Authorize {portalTab === 'client' ? 'Client' : portalTab === 'admin' ? 'Admin' : 'Creator'} Access <ArrowRight className="w-4 h-4" />
                </button>

                <div className="border-t border-slate-850/80 pt-4 mt-4 space-y-2 text-left">
                  <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest block text-center">
                    New Operator Registration & Sandbox Access
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setViewState('register_standard');
                        setRegIsDemo(false);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900/30 hover:border-indigo-500/50 text-indigo-300 font-mono text-[9px] py-2.5 px-1.5 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 uppercase tracking-wide font-bold"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-indigo-400 mb-0.5 animate-pulse" />
                      <span>Register Partner</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setViewState('register_demo');
                        setRegIsDemo(true);
                        setErrorMessage('');
                        setSuccessMessage('');
                      }}
                      className="bg-amber-950/40 hover:bg-amber-900/40 border border-amber-900/30 hover:border-amber-500/50 text-amber-300 font-mono text-[9px] py-2.5 px-1.5 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 uppercase tracking-wide font-bold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                      <span>Register Demo</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* ==========================================
               PASSWORD RECOVERY INTERFACE
               ========================================== */
            <div>
              <div className="flex items-center gap-2 mb-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetMode('none');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="p-1.5 bg-slate-950/60 hover:bg-slate-950 rounded-lg border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  Secure Credentials Recovery
                </span>
              </div>

              {resetMode === 'request' ? (
                /* STEP A: REQUEST CODE */
                <form onSubmit={handleRequestReset} className="space-y-4 text-left">
                  <div className="border-b border-slate-850 pb-2.5 mb-3.5">
                    <h3 className="text-sm font-black font-mono text-white uppercase">Request Reset Code</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Enter your operational username. The generated 6-digit verification key will print live inside the **Live Feed Messenger ticker** scrolling at the very top of your screen.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Operational Username
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={resetUsername}
                        onChange={(e) => setResetUsername(e.target.value)}
                        placeholder="e.g. each"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-rose-950/40 border border-rose-900/30 text-rose-300 text-[11px] rounded-lg p-3 text-center font-mono">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-[11px] rounded-lg p-3 text-center leading-relaxed">
                      {successMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isResetPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                  >
                    {isResetPending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Code...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" />
                        Generate & Dispatch Code
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP B: VERIFY CODE & PASSWORD RESET */
                <form onSubmit={handleVerifyReset} className="space-y-4 text-left">
                  <div className="border-b border-slate-850 pb-2.5 mb-3.5">
                    <h3 className="text-sm font-black font-mono text-white uppercase">Verify Credentials</h3>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Type in the verification code shown in the Live Feed ticker and enter your new secure password below.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Ticker Verification Code
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        required
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value)}
                        placeholder="e.g. SWANAYA-123456"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-600 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1">
                      New Security Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 4 characters"
                        className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 rounded-lg py-2 pl-9 pr-10 text-xs text-white placeholder-slate-600 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-rose-950/40 border border-rose-900/30 text-rose-300 text-[11px] rounded-lg p-3 text-center font-mono">
                      {errorMessage}
                    </div>
                  )}

                  {successMessage && (
                    <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-[11px] rounded-lg p-3 text-center font-mono">
                      {successMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isResetPending}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
                  >
                    {isResetPending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing with Cloud...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" /> Update Security Credentials
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
