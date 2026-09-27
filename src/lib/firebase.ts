import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBqc3Pjen-uXwqFFQuTxqtwAD7l8OPhhwQ",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nailedit-dashboard.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nailedit-dashboard",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nailedit-dashboard.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "585090286381",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:585090286381:web:211524a5921e221b4bc9a4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BSHC3BDBXS",
};

// Initialize Firebase — guard against double-init in Next.js hot reload
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth, Firestore, and Storage are safe on both server and client
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics is browser-only (requires window + localStorage)
let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
