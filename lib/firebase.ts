import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';

// Load Firebase configuration
let firebaseConfig: any = null;

// 1. Try reading from environment variables
if (process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID,
  };
} else {
  // 2. Fallback: Try reading from imported JSON
  firebaseConfig = firebaseConfigJson;
}

if (!firebaseConfig) {
  console.warn('Firebase configuration not found. Please set environment variables or ensure firebase-applet-config.json exists.');
}

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig || {}) : getApp();

// Initialize Firestore
const databaseId = firebaseConfig?.firestoreDatabaseId || '(default)';
const db = getFirestore(app, databaseId);

export { app, db, firebaseConfig };
