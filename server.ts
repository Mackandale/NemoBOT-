import express from "express";
import { createServer as createViteServer } from "vite";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import path from "path";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length && process.env.FIREBASE_PROJECT_ID) {
  try {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey) {
      // Handle literal newlines and escaped newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      // Remove any surrounding quotes that might have been pasted
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
      }
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

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

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.session!.userId = decodedToken.uid;
    
    // Ensure user exists in Firestore (server-side check/init)
    if (db) {
      const userRef = db.collection("users").doc(decodedToken.uid);
      const userDoc = await userRef.get();
      if (!userDoc.exists) {
        await userRef.set({
          id: decodedToken.uid,
          email: decodedToken.email || "",
          name: decodedToken.name || "Utilisateur",
          picture: decodedToken.picture || "",
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Firebase token verification error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/api/me", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  
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

// Thread Routes
app.get("/api/threads", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const snapshot = await db.collection("users").doc(req.session.userId)
      .collection("threads")
      .orderBy("updatedAt", "desc")
      .get();
    
    const threads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching threads" });
  }
});

app.post("/api/threads", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { title } = req.body;
  try {
    const threadRef = await db.collection("users").doc(req.session.userId)
      .collection("threads")
      .add({
        title: title || "Nouvelle conversation",
        lastMessage: "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    res.json({ id: threadRef.id, title: title || "Nouvelle conversation" });
  } catch (error) {
    res.status(500).json({ error: "Error creating thread" });
  }
});

app.patch("/api/threads/:threadId", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { threadId } = req.params;
  const { title } = req.body;
  try {
    await db.collection("users").doc(req.session.userId)
      .collection("threads")
      .doc(threadId)
      .update({ title, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error updating thread" });
  }
});

app.delete("/api/threads/:threadId", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { threadId } = req.params;
  try {
    const threadRef = db.collection("users").doc(req.session.userId).collection("threads").doc(threadId);
    
    // Delete messages in thread
    const messages = await threadRef.collection("messages").get();
    const batch = db.batch();
    messages.forEach(doc => batch.delete(doc.ref));
    batch.delete(threadRef);
    await batch.commit();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error deleting thread" });
  }
});

app.get("/api/threads/:threadId/messages", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { threadId } = req.params;
  try {
    const snapshot = await db.collection("users").doc(req.session.userId)
      .collection("threads")
      .doc(threadId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .get();
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.post("/api/threads/:threadId/messages", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { threadId } = req.params;
  const { role, content, image, file, groundingMetadata } = req.body;
  try {
    const threadRef = db.collection("users").doc(req.session.userId).collection("threads").doc(threadId);
    
    const msgData: any = {
      role,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    if (image) msgData.image = image;
    if (file) msgData.file = file;
    if (groundingMetadata) msgData.groundingMetadata = groundingMetadata;

    const msgRef = await threadRef.collection("messages").add(msgData);
    
    // Update thread last message and timestamp
    await threadRef.update({
      lastMessage: content.substring(0, 100),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ id: msgRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error saving message" });
  }
});

app.get("/api/messages", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const snapshot = await db.collection("users").doc(req.session.userId)
      .collection("messages")
      .orderBy("timestamp", "asc")
      .limit(50)
      .get();
    
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate() || new Date()
    }));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});

app.post("/api/messages", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { role, content } = req.body;
  try {
    const msgRef = await db.collection("users").doc(req.session.userId)
      .collection("messages")
      .add({
        role,
        content,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    res.json({ id: msgRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error saving message" });
  }
});

app.delete("/api/account", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
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
