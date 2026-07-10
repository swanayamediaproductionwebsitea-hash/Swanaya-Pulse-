import React, { useState, useEffect } from 'react';
import { Key, User, ShieldCheck, ArrowRight, UserPlus, Fingerprint, Lock, Sparkles } from 'lucide-react';
import { RegisteredUser } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  addLog: (text: string, type: 'info' | 'success' | 'warning' | 'action' | 'upload') => void;
}

export default function LoginModule({ onLoginSuccess, addLog }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [directUsername, setDirectUsername] = useState('');
  const [directPassword, setDirectPassword] = useState('');
  
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [showAutofill, setShowAutofill] = useState(() => {
    return localStorage.getItem('swanaya_has_logged_in') === 'true';
  });

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
            uid: data.uid || docSnap.id
          });
        });

        // Merge users by unique username
        const mergedMap = new Map<string, RegisteredUser>();
        localUsers.forEach(u => mergedMap.set(u.username.toLowerCase(), u));
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
            uid: user.uid || ''
          }, { merge: true });
        }
      } catch (error) {
        console.error('Failed to sync profiles with Firestore', error);
        setRegisteredUsers(localUsers);
      }
    };

    syncProfiles();
  }, []);

  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const cleanUser = directUsername.trim();
    const cleanPass = directPassword;

    // Check direct user (each / each or aadithyan / aadithyan)
    if (
      (cleanUser.toLowerCase() === 'each' && cleanPass === 'each') ||
      (cleanUser.toLowerCase() === 'aadithyan' && cleanPass === 'aadithyan')
    ) {
      addLog(`Auth: Direct login authorized for administrator ${cleanUser}`, 'success');
      localStorage.setItem('swanaya_has_logged_in', 'true');
      setShowAutofill(true);
      onLoginSuccess(cleanUser.toLowerCase());
      return;
    }

    // Otherwise check registered users
    const matched = registeredUsers.find(
      u => u.username.toLowerCase() === cleanUser.toLowerCase() && u.password === cleanPass
    );

    if (matched) {
      addLog(`Auth: User ${matched.username} logged in successfully`, 'success');
      localStorage.setItem('swanaya_has_logged_in', 'true');
      setShowAutofill(true);
      onLoginSuccess(matched.username);
    } else {
      addLog(`Auth: Failed login attempt for "${cleanUser}"`, 'warning');
      setErrorMessage('Invalid credentials. Use Username/Password: each, or register a new profile.');
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

    if (cleanUser.toLowerCase() === 'each') {
      setErrorMessage('Username "each" is reserved for Administrator direct login.');
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

    // Check if username already exists
    const exists = registeredUsers.some(u => u.username.toLowerCase() === cleanUser.toLowerCase());
    if (exists) {
      setErrorMessage('Username already registered. Try logging in.');
      return;
    }

    const newUser: RegisteredUser = {
      username: cleanUser,
      password: regPassword,
      provider: 'direct'
    };

    const updated = [...registeredUsers, newUser];
    setRegisteredUsers(updated);
    localStorage.setItem('swanaya_registered_users', JSON.stringify(updated));
    localStorage.setItem('swanaya_has_logged_in', 'true');
    setShowAutofill(true);

    addLog(`Auth: Created new profile for user "${cleanUser}"`, 'success');

    // Sync registration profile to Firestore cloud immediately
    try {
      const userDocRef = doc(db, 'users', cleanUser.toLowerCase());
      await setDoc(userDocRef, {
        username: cleanUser,
        password: regPassword,
        provider: 'direct',
        email: ''
      });
      addLog(`Auth: Successfully synced profile "${cleanUser}" to cloud database`, 'success');
    } catch (e) {
      console.error('Error syncing registration to Firestore', e);
    }

    setSuccessMessage(`Registration successful! You can now log in as "${cleanUser}".`);
    
    // Clear registration form and flip back to login
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
    
    // Auto-populate direct login for ease of use
    setDirectUsername(cleanUser);
    setDirectPassword(regPassword);
    
    setTimeout(() => {
      setIsRegisterMode(false);
      setSuccessMessage('');
    }, 2000);
  };

  const handleAutofillAdmin = () => {
    setDirectUsername('each');
    setDirectPassword('each');
    addLog('System: Pre-filled administrator credentials', 'info');
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 my-8">
      {/* 3D Rotating Login Box */}
      <div 
        className={`relative w-full transition-transform duration-700 transform-style-3d ${
          isRegisterMode ? 'rotate-y-180' : ''
        }`}
        style={{ minHeight: '480px' }}
      >
        
        {/* FRONT SIDE: Standard Direct Login */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mb-3 border border-indigo-500/20">
                <Fingerprint className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white">SWANAYA ENTERPRISES</h2>
              <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-wider">Direct Administrator Secure Login Node</p>
            </div>
 
            {/* Form */}
            <form onSubmit={handleDirectLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Secure Username
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
                    placeholder="e.g. each"
                    className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
 
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Secure Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={directPassword}
                    onChange={(e) => setDirectPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
 
              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs rounded-lg p-3 text-center">
                  {errorMessage}
                </div>
              )}
 
              {successMessage && (
                <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-xs rounded-lg p-3 text-center">
                  {successMessage}
                </div>
              )}
 
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Sign In to Planner <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Autofill Registered Profiles List after login & logout */}
            {showAutofill && (
              <div className="mt-5 space-y-2 text-left animate-fadeIn">
                <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Registered Profiles (Click to Autofill)</span>
                <div className="flex flex-wrap gap-1.5">
                  {/* Default Administrator profile */}
                  <button
                    type="button"
                    onClick={() => {
                      setDirectUsername('each');
                      setDirectPassword('each');
                      addLog('System Autofill: Populated Administrator "each" credentials', 'info');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-all ${
                      directUsername.toLowerCase() === 'each'
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/80 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>each (Admin)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDirectUsername('aadithyan');
                      setDirectPassword('aadithyan');
                      addLog('System Autofill: Populated Administrator "aadithyan" credentials', 'info');
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-all ${
                      directUsername.toLowerCase() === 'aadithyan'
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/80 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                    <span>aadithyan (Admin)</span>
                  </button>

                  {/* Other Registered users */}
                  {registeredUsers.map((u) => (
                    <button
                      key={u.username}
                      type="button"
                      onClick={() => {
                        setDirectUsername(u.username);
                        setDirectPassword(u.password || '');
                        addLog(`System Autofill: Populated profile credentials for user "${u.username}"`, 'info');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-all ${
                        directUsername.toLowerCase() === u.username.toLowerCase()
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md'
                          : 'bg-slate-950/80 border-slate-900 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>{u.username}</span>
                    </button>
                  ))}

                  {registeredUsers.length === 0 && (
                    <span className="text-[9px] text-slate-600 font-mono italic">No secondary custom profiles registered yet.</span>
                  )}
                </div>
              </div>
            )}

          </div>
 
          {/* Card Footer toggle */}
          <div className="border-t border-slate-800/80 pt-4 text-center mt-6">
            <p className="text-xs text-slate-400">
              Need a secondary profile?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Register & Login
              </button>
            </p>
          </div>
        </div>
 
        {/* BACK SIDE: Registration & Login */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="text-center mb-5">
              <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-400 rounded-xl mb-3 border border-indigo-500/20">
                <UserPlus className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white">CREATE REGISTRY</h2>
              <p className="text-slate-400 text-xs mt-1 font-mono uppercase tracking-wider">Register secondary custom access logs</p>
            </div>
 
            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Custom Username
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
                    className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
 
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Secure Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
 
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-slate-950/80 border border-slate-850 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
              </div>
 
              {errorMessage && (
                <div className="bg-rose-950/40 border border-rose-900/30 text-rose-300 text-xs rounded-lg p-2.5 text-center">
                  {errorMessage}
                </div>
              )}
 
              {successMessage && (
                <div className="bg-emerald-950/40 border border-emerald-900/30 text-emerald-300 text-xs rounded-lg p-2.5 text-center">
                  {successMessage}
                </div>
              )}
 
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Register Registry <Sparkles className="w-4 h-4" />
              </button>
            </form>
          </div>
 
          {/* Card Footer toggle */}
          <div className="border-t border-slate-800/80 pt-4 text-center mt-4">
            <p className="text-xs text-slate-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                Go to Direct Login
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
