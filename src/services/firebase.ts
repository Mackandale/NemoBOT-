import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

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
