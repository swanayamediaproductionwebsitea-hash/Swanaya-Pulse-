import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAcmw-UzV9jiZCrRa9Mg54CG8rg8BggX1c",
  authDomain: "bionic-crowbar-rj4jh.firebaseapp.com",
  projectId: "bionic-crowbar-rj4jh",
  storageBucket: "bionic-crowbar-rj4jh.firebasestorage.app",
  messagingSenderId: "213246895138",
  appId: "1:213246895138:web:ff08df64c2fccb0e53167b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Firestore with the specific database ID
const db = getFirestore(app, "ai-studio-swanayamediaente-6a2ff765-5afb-4af3-86d0-d6ea111dbb9b");

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, googleProvider };
