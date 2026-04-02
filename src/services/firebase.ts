import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, import.meta.env.VITE_FIREBASE_DATABASE_ID || "(default)");

let analytics = null;
if (firebaseConfig.measurementId) {
  isSupported().then(supported => {
    if (supported && typeof window !== "undefined") {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Silently fail if analytics is blocked or fails to initialize
  });
}

export const googleProvider = new GoogleAuthProvider();
export { auth, db, analytics };
