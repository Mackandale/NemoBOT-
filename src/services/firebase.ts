import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, User as FirebaseUser } from "firebase/auth";
import { 
  initializeFirestore,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  getDocFromServer 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use the specific database ID from the config and force long polling for stability
const dbId = (firebaseConfig as any).firestoreDatabaseId || '(default)';
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

// Persistence disabled for stability in iframe environment
/*
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence failed: browser not supported');
    }
  });
}
*/

export const googleProvider = new GoogleAuthProvider();

// Types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// User Management
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt: any;
  roles: {
    user: boolean;
    lazarus: boolean;
    admin: boolean;
  };
  settings: {
    theme: string;
    voice: string;
    language: string;
    personality: string;
    zoomDisabled: boolean;
  };
  progression: {
    xp: number;
    level: number;
    activityScore: number;
    ranks: string[];
  };
  memories: string[];
  favorites: string[];
  conversations: string[];
}

export const defaultUserProfile = (user: FirebaseUser): UserProfile => ({
  id: user.uid,
  name: user.displayName || '',
  email: user.email || '',
  photoURL: user.photoURL || '',
  createdAt: serverTimestamp(),
  roles: {
    user: true,
    lazarus: false,
    admin: false
  },
  settings: {
    theme: 'dark',
    voice: 'female',
    language: 'fr',
    personality: 'default',
    zoomDisabled: true
  },
  progression: {
    xp: 0,
    level: 1,
    activityScore: 0,
    ranks: []
  },
  memories: [],
  favorites: [],
  conversations: []
});

export async function syncUserProfile(user: FirebaseUser) {
  const userRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, defaultUserProfile(user));
    } else {
      // Update basic info if changed
      await updateDoc(userRef, {
        name: user.displayName || userDoc.data()?.name,
        email: user.email || userDoc.data()?.email,
        photoURL: user.photoURL || userDoc.data()?.photoURL
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
  }
}

// Connection test
async function testConnection() {
  try {
    // Try to get a document. If it fails with "offline", we know there's a config issue.
    // We use getDoc which will try cache first if enabled, but here we just want to see if it works.
    await getDoc(doc(db, 'test', 'connection'));
    console.log("Firestore connection test successful");
  } catch (error) {
    console.warn("Firestore connection test warning:", error);
    if (error instanceof Error && (error.message.includes('offline') || error.message.includes('permission-denied'))) {
       // This might be expected if the doc doesn't exist, but "offline" is the one we care about.
    }
  }
}
testConnection();
