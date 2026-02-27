import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAOBPl7p_8b_j8ghQs-DC6txiVk4_KX-Ng",
  authDomain: "nemo-ia.firebaseapp.com",
  projectId: "nemo-ia",
  storageBucket: "nemo-ia.firebasestorage.app",
  messagingSenderId: "80789688035",
  appId: "1:80789688035:web:093eadb201c22852133fd6",
  measurementId: "G-P0VSYW5VJN"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Force long polling to avoid WebSocket issues in some environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export const googleProvider = new GoogleAuthProvider();
