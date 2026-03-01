import express from "express";
import { createServer as createViteServer } from "vite";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import path from "path";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
const initializeFirebase = () => {
  if (admin.apps.length > 0) return true;
  
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("Firebase environment variables are missing. Firebase features will be disabled.");
    return false;
  }

  try {
    // 1. Initial cleanup
    privateKey = privateKey.trim();

    // 2. Handle the case where the entire service account JSON might have been pasted
    if (privateKey.startsWith('{')) {
      try {
        const serviceAccount = JSON.parse(privateKey);
        if (serviceAccount.private_key) {
          privateKey = serviceAccount.private_key;
        }
      } catch (e) {
        // Not valid JSON, proceed
      }
    }

    // 3. Remove any surrounding quotes
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    
    // 4. Handle escaped newlines (both \n and \\n)
    privateKey = privateKey.replace(/\\n/g, '\n');

    // 5. Aggressive PEM normalization
    // Remove existing headers and all whitespace to get the raw base64
    const rawKey = privateKey
      .replace(/-----BEGIN [A-Z ]+-----/g, '')
      .replace(/-----END [A-Z ]+-----/g, '')
      .replace(/\s+/g, '');
    
    // Wrap the raw base64 string at 64 characters per line (standard PEM format)
    const wrappedKey = rawKey.match(/.{1,64}/g)?.join('\n') || rawKey;
    
    // Reconstruct the PEM string with proper headers and newlines
    privateKey = `-----BEGIN PRIVATE KEY-----\n${wrappedKey}\n-----END PRIVATE KEY-----\n`;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail,
      }),
    });
    console.log("Firebase Admin initialized successfully.");
    return true;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return false;
  }
};

initializeFirebase();

const getDb = () => {
  if (initializeFirebase()) {
    return admin.firestore();
  }
  return null;
};

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "nemo-secret"],
    maxAge: 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: "none",
  })
);

// Auth Routes
app.post("/api/login/firebase", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token required" });

  if (!initializeFirebase()) {
    return res.status(500).json({ error: "Firebase not initialized. Please configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY." });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.session!.userId = decodedToken.uid;
    
    // Ensure user exists in Firestore (server-side check/init)
    const db = getDb();
    if (db) {
      const userRef = db.collection("users").doc(decodedToken.uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        await userRef.set({
          id: decodedToken.uid,
          email: decodedToken.email || "",
          name: decodedToken.name || "Utilisateur",
          picture: decodedToken.picture || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          userSettings: {
            voice: 'Kore',
            personality: 'Mentor',
            theme: 'dark',
            autoMemory: true
          },
          progression: {
            xp: 0,
            level: 1,
            activityScore: 0,
            milestones: []
          }
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Firebase token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.patch("/api/settings", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    await db.collection("users").doc(req.session.userId).update({
      userSettings: req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error updating settings" });
  }
});

app.get("/api/me", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });
  
  try {
    const userDoc = await db.collection("users").doc(req.session.userId).get();
    if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
    res.json(userDoc.data());
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session = null;
  res.json({ success: true });
});

app.post("/api/profile/analyze", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { analysis } = req.body;
  const userRef = db.collection("users").doc(req.session.userId);
  
  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      const user = doc.data();
      if (!user) return;

      const updates: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (analysis.level) updates.level = analysis.level;
      if (analysis.memoryEntry) updates.memoryEntries = admin.firestore.FieldValue.arrayUnion(analysis.memoryEntry);

      t.update(userRef, updates);
    });

    const updatedDoc = await userRef.get();
    res.json(updatedDoc.data());
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: "Error updating profile" });
  }
});

// Conversation Routes (New System)
app.get("/api/conversations", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const snapshot = await db.collection("conversations")
      .where("ownerUid", "==", req.session.userId)
      .orderBy("updatedAt", "desc")
      .get();
    
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Error fetching conversations" });
  }
});

app.post("/api/conversations", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { title, messages } = req.body;
  try {
    const convRef = await db.collection("conversations").add({
      ownerUid: req.session.userId,
      title: title || "Nouvelle conversation",
      summary: "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      messages: messages || []
    });
    res.json({ id: convRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error creating conversation" });
  }
});

app.get("/api/conversations/:id", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const doc = await db.collection("conversations").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Conversation not found" });
    const data = doc.data();
    if (data?.ownerUid !== req.session.userId) return res.status(403).json({ error: "Unauthorized" });
    
    res.json({
      id: doc.id,
      ...data,
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      createdAt: data?.createdAt?.toDate() || new Date()
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching conversation" });
  }
});

app.patch("/api/conversations/:id", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const convRef = db.collection("conversations").doc(req.params.id);
    const doc = await convRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Conversation not found" });
    if (doc.data()?.ownerUid !== req.session.userId) return res.status(403).json({ error: "Unauthorized" });

    const updates = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await convRef.update(updates);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error updating conversation" });
  }
});

app.delete("/api/conversations/:id", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const convRef = db.collection("conversations").doc(req.params.id);
    const doc = await convRef.get();
    if (!doc.exists) return res.status(404).json({ error: "Conversation not found" });
    if (doc.data()?.ownerUid !== req.session.userId) return res.status(403).json({ error: "Unauthorized" });

    await convRef.delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error deleting conversation" });
  }
});

// Memory Routes
app.get("/api/memories", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const snapshot = await db.collection("users").doc(req.session.userId).collection("memories").orderBy("createdAt", "desc").get();
    const memories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching memories" });
  }
});

app.post("/api/memories", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const memRef = await db.collection("users").doc(req.session.userId).collection("memories").add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: memRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error saving memory" });
  }
});

app.delete("/api/memories/:id", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    await db.collection("users").doc(req.session.userId).collection("memories").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error deleting memory" });
  }
});

// Project Routes
app.get("/api/projects", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const snapshot = await db.collection("users").doc(req.session.userId).collection("projects").orderBy("updatedAt", "desc").get();
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Error fetching projects" });
  }
});

app.post("/api/projects", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const projRef = await db.collection("users").doc(req.session.userId).collection("projects").add({
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: projRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error saving project" });
  }
});

app.delete("/api/account", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const userRef = db.collection("users").doc(req.session.userId);
    
    // Delete legacy messages
    const legacyMessages = await userRef.collection("messages").get();
    const batch = db.batch();
    legacyMessages.forEach(doc => batch.delete(doc.ref));
    
    // Delete threads and their messages
    const threads = await userRef.collection("threads").get();
    for (const threadDoc of threads.docs) {
      const messages = await threadDoc.ref.collection("messages").get();
      messages.forEach(doc => batch.delete(doc.ref));
      batch.delete(threadDoc.ref);
    }
    
    batch.delete(userRef);
    await batch.commit();
    
    req.session = null;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error deleting account" });
  }
});

app.post("/api/notifications/token", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { token } = req.body;
  try {
    await db.collection("users").doc(req.session.userId).update({
      fcmToken: token,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error saving token" });
  }
});

app.delete("/api/profile/memory/:index", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const index = parseInt(req.params.index);
  const userRef = db.collection("users").doc(req.session.userId);

  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      const user = doc.data();
      if (!user || !user.memoryEntries) return;

      const memoryEntries = [...user.memoryEntries];
      if (index >= 0 && index < memoryEntries.length) {
        memoryEntries.splice(index, 1);
        t.update(userRef, { memoryEntries });
      }
    });

    const updatedDoc = await userRef.get();
    res.json(updatedDoc.data());
  } catch (error) {
    console.error("Delete memory entry error:", error);
    res.status(500).json({ error: "Error deleting memory entry" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("dist/index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
