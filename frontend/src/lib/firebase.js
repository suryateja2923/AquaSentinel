import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getEnv = (key, fallback) => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[`VITE_${key}`]) {
      return import.meta.env[`VITE_${key}`];
    }
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env && (process.env[`REACT_APP_${key}`] || process.env[key])) {
      return process.env[`REACT_APP_${key}`] || process.env[key];
    }
  } catch (e) {}
  return fallback;
};

export const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY", "AIzaSyAMfX6b8HFV_kjriE8222hQYD7xUcXSLUE"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN", "astra-database-f9830.firebaseapp.com"),
  projectId: getEnv("FIREBASE_PROJECT_ID", "astra-database-f9830"),
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET", "astra-database-f9830.firebasestorage.app"),
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID", "1056979226271"),
  appId: getEnv("FIREBASE_APP_ID", "1:1056979226271:web:8ca1cb918625de70579caa"),
  measurementId: getEnv("FIREBASE_MEASUREMENT_ID", "G-JYVV84E2VL"),
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
