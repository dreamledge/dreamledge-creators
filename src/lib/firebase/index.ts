import { getApp, getApps, initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig, firebaseConfigured } from "@/lib/firebase/config";

console.log('Firebase config:', firebaseConfig);
console.log('Firebase configured:', firebaseConfigured);

const app = firebaseConfigured ? (getApps().length ? getApp() : initializeApp(firebaseConfig)) : null;
const authInstance = app ? getAuth(app) : null;

if (authInstance) {
  void setPersistence(authInstance, browserLocalPersistence);
}

export const firebaseApp = app;
export const firebaseAuth = authInstance;
export const auth = authInstance;
export const firestore = app ? getFirestore(app) : null;
export const db = firestore;
export const storage = app ? getStorage(app) : null;
export const firebaseEnabled = firebaseConfigured;
