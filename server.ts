import express from "express";
import { createServer as createViteServer } from "vite";
import cookieSession from "cookie-session";
import dotenv from "dotenv";
import path from "path";
import admin from "firebase-admin";
import { GoogleGenAI, Modality } from "@google/genai";

dotenv.config();

// Initialize Gemini
const getGeminiAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('...') || apiKey.includes('YOUR_API_KEY')) {
    console.warn("GEMINI_API_KEY is missing or a placeholder. Gemini features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getGeminiAI();

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
    // 1. Check if it's a placeholder or obviously invalid
    const isPlaceholder = privateKey.includes('...') || 
                         privateKey.includes('YOUR_PRIVATE_KEY') || 
                         privateKey.includes('PLACEHOLDER');
    
    if (isPlaceholder) {
      console.warn("Firebase private key is a placeholder. Firebase features will be disabled.");
      return false;
    }

    // 2. Check if it looks like a Private Key ID (hex string, ~40 chars) instead of a key
    if (privateKey.length < 100 && /^[a-f0-9]+$/i.test(privateKey.trim())) {
      console.warn("FIREBASE_PRIVATE_KEY appears to be a Key ID instead of the actual Private Key content. Please ensure you are using the 'private_key' field from your service account JSON.");
      return false;
    }

    // 3. Check if it's a full JSON string
    if (privateKey.trim().startsWith('{')) {
      try {
        const sa = JSON.parse(privateKey.trim());
        if (sa.private_key) {
          privateKey = sa.private_key;
          console.log("Extracted private key from service account JSON.");
        }
      } catch (e) {
        // Not JSON, continue
      }
    }

    // 4. Basic cleanup
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    privateKey = privateKey.trim().replace(/^["']|["']$/g, '');

    // 5. Normalize PEM structure
    const base64Content = privateKey
      .replace(/-----BEGIN[\s\S]+?-----/g, '')
      .replace(/-----END[\s\S]+?-----/g, '')
      .replace(/[^A-Za-z0-9+/=]/g, ''); 
    
    if (!base64Content || base64Content.length < 100) {
      console.warn(`Firebase private key content is too short (${base64Content?.length || 0} chars). It should be a long base64 string. Firebase features will be disabled.`);
      return false;
    }

    // Re-wrap base64 content with newlines every 64 characters
    const wrappedContent = base64Content.match(/.{1,64}/g)?.join('\n') || base64Content;
    const finalKey = `-----BEGIN PRIVATE KEY-----\n${wrappedContent}\n-----END PRIVATE KEY-----\n`;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey: finalKey,
        clientEmail,
      }),
    });
    console.log("Firebase Admin initialized successfully with normalized key.");
    return true;
  } catch (error) {
    console.error("Firebase Admin initialization error:", error instanceof Error ? error.message : error);
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })
);

// Gemini API Routes
app.post("/api/gemini/generate", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!ai) return res.status(503).json({ error: "Gemini service unavailable" });
  const { model, contents, config } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents,
      config
    });
    res.json(response);
  } catch (error) {
    console.error("Gemini Generate Error:", error);
    res.status(500).json({ error: "Error generating content" });
  }
});

app.post("/api/gemini/chat", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!ai) return res.status(503).json({ error: "Gemini service unavailable" });
  const { prompt, history, systemInstruction, tools } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction,
        tools: tools && tools.length > 0 ? tools : undefined,
      }
    });
    res.json(response);
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "Error generating chat response" });
  }
});

app.post("/api/gemini/image", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!ai) return res.status(503).json({ error: "Gemini service unavailable" });
  const { prompt, optimizerPrompt, aspectRatio } = req.body;
  
  try {
    let finalPrompt = prompt;
    if (optimizerPrompt) {
      // 1. Optimize prompt
      const optimizerResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: optimizerPrompt + prompt }] }]
      });
      finalPrompt = optimizerResponse.text || prompt;
    }

    // 2. Generate image
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: finalPrompt }] }],
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1"
        }
      }
    });

    const imagePart = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (imagePart?.inlineData) {
      res.json({ imageData: `data:image/png;base64,${imagePart.inlineData.data}` });
    } else {
      throw new Error("Failed to generate image");
    }
  } catch (error) {
    console.error("Gemini Image Error:", error);
    res.status(500).json({ error: "Error generating image" });
  }
});

app.post("/api/gemini/memories", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!ai) return res.status(503).json({ error: "Gemini service unavailable" });
  const { conversation, analyzerPrompt } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: analyzerPrompt + conversation }] }],
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || '{"memories": []}');
    res.json(data.memories || []);
  } catch (error) {
    console.error("Gemini Memories Error:", error);
    res.status(500).json({ error: "Error analyzing memories" });
  }
});

app.post("/api/gemini/tts", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  if (!ai) return res.status(503).json({ error: "Gemini service unavailable" });
  const { text, voiceName } = req.body;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName || 'Zephyr' }
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.json({ audioData: base64Audio });
    } else {
      throw new Error("Failed to generate speech");
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    res.status(500).json({ error: "Error generating speech" });
  }
});

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
    
    // Automatic user creation/update
    const db = getDb();
    if (db) {
      const userRef = db.collection("users").doc(decodedToken.uid);
      const userDoc = await userRef.get();
      
      const userData = {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        name: decodedToken.name || "Utilisateur",
        photoURL: decodedToken.picture || "",
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (!userDoc.exists) {
        // First connection: create with default structure
        await userRef.set({
          ...userData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          roles: {
            user: true,
            lazarus: false,
            admin: decodedToken.email === "mackandaledardayes@gmail.com" // Set default admin
          },
          settings: {
            theme: "dark",
            voice: "Kore",
            language: "fr",
            personality: "Nemo",
            zoomDisabled: false,
            speechSpeed: 1.0
          },
          progression: {
            xp: 0,
            level: 1,
            rank: "Explorateur",
            activityScore: 0
          }
        });
        console.log(`New user created: ${decodedToken.uid}`);
      } else {
        // Subsequent connection: update basic info only
        await userRef.update(userData);
        console.log(`User updated: ${decodedToken.uid}`);
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
  if (analysis.topic) updates.currentTopic = analysis.topic;
  if (analysis.summary) updates.lastSessionSummary = analysis.summary;

  if (analysis.memories && Array.isArray(analysis.memories)) {
    const currentMemories = user.memoryEntries || [];
    let updatedMemories = [...currentMemories];

    analysis.memories.forEach((m: any) => {
      if (m.importance >= 8) {
        const keyPrefix = `${m.key}:`;
        // Remove old entry with the same key
        updatedMemories = updatedMemories.filter((entry: string) => !entry.startsWith(keyPrefix));
        // Add new entry
        updatedMemories.push(`${m.key}: ${m.content}`);
      }
    });
    
    if (JSON.stringify(updatedMemories) !== JSON.stringify(currentMemories)) {
      updates.memoryEntries = updatedMemories;
    }
  }

      t.update(userRef, updates);
    });

    const updatedDoc = await userRef.get();
    res.json(updatedDoc.data());
  } catch (error) {
    console.error("Transaction error:", error);
    res.status(500).json({ error: "Error updating profile" });
  }
});

// Conversation Routes
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

  const { title } = req.body;
  try {
    const convRef = await db.collection("conversations").add({
      ownerUid: req.session.userId,
      title: title || "Nouvelle conversation",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      pinned: false,
      favorite: false
    });
    res.json({ id: convRef.id, title: title || "Nouvelle conversation" });
  } catch (error) {
    res.status(500).json({ error: "Error creating conversation" });
  }
});

app.patch("/api/conversations/:id", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { id } = req.params;
  const updates = req.body;
  
  // Security check: ensure user owns the conversation
  const convRef = db.collection("conversations").doc(id);
  const convDoc = await convRef.get();
  if (!convDoc.exists || convDoc.data()?.ownerUid !== req.session.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    await convRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error updating conversation" });
  }
});

app.delete("/api/conversations/:id", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { id } = req.params;
  
  // Security check
  const convRef = db.collection("conversations").doc(id);
  const convDoc = await convRef.get();
  if (!convDoc.exists || convDoc.data()?.ownerUid !== req.session.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const batch = db.batch();
    
    // Delete messages
    const messages = await db.collection("messages").where("conversationId", "==", id).get();
    messages.forEach(doc => batch.delete(doc.ref));
    
    batch.delete(convRef);
    await batch.commit();
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error deleting conversation" });
  }
});

// Message Routes
app.get("/api/conversations/:id/messages", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { id } = req.params;
  
  // Security check
  const convDoc = await db.collection("conversations").doc(id).get();
  if (!convDoc.exists || convDoc.data()?.ownerUid !== req.session.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const snapshot = await db.collection("messages")
      .where("conversationId", "==", id)
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

app.post("/api/conversations/:id/messages", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { id } = req.params;
  const { role, content } = req.body;

  // Security check
  const convRef = db.collection("conversations").doc(id);
  const convDoc = await convRef.get();
  if (!convDoc.exists || convDoc.data()?.ownerUid !== req.session.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const msgRef = await db.collection("messages").add({
      conversationId: id,
      role,
      content,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Update conversation timestamp
    await convRef.update({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ id: msgRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error saving message" });
  }
});

// Memory Routes
app.get("/api/memory", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const snapshot = await db.collection("memory")
      .where("userId", "==", req.session.userId)
      .orderBy("createdAt", "desc")
      .get();
    
    const memories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    }));
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching memory" });
  }
});

app.post("/api/memory", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { content, importance } = req.body;
  try {
    const memRef = await db.collection("memory").add({
      userId: req.session.userId,
      content,
      importance: importance || 5,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: memRef.id });
  } catch (error) {
    res.status(500).json({ error: "Error saving memory" });
  }
});

// Progression Routes
app.post("/api/progression/update", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const { xpGain } = req.body;
  const userRef = db.collection("users").doc(req.session.userId);

  try {
    await db.runTransaction(async (t) => {
      const doc = await t.get(userRef);
      const user = doc.data();
      if (!user) return;

      let { xp, level, rank } = user.progression || { xp: 0, level: 1, rank: "Explorateur" };
      xp += xpGain;

      // Level up logic
      const xpToNextLevel = 100 * Math.pow(level, 1.5);
      if (xp >= xpToNextLevel) {
        xp -= xpToNextLevel;
        level += 1;
        
        // Rank logic
        if (level >= 50) rank = "Légende";
        else if (level >= 20) rank = "Maître";
        else if (level >= 10) rank = "Expert";
        else if (level >= 5) rank = "Vétéran";
      }

      t.update(userRef, {
        "progression.xp": xp,
        "progression.level": level,
        "progression.rank": rank,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    const updatedDoc = await userRef.get();
    res.json(updatedDoc.data());
  } catch (error) {
    res.status(500).json({ error: "Error updating progression" });
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

// Global Memory Routes
app.get("/api/global-memory", async (req, res) => {
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  try {
    const snapshot = await db.collection("global_memory").orderBy("updatedAt", "desc").limit(10).get();
    const memories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(memories);
  } catch (error) {
    res.status(500).json({ error: "Error fetching global memory" });
  }
});

app.post("/api/global-memory", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  // Check if user is admin
  const userDoc = await db.collection("users").doc(req.session.userId).get();
  if (!userDoc.exists || !userDoc.data()?.roles?.admin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { content } = req.body;
  try {
    await db.collection("global_memory").add({
      content,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.session.userId
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error saving global memory" });
  }
});

// Admin Routes
app.get("/api/admin/users", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const adminDoc = await db.collection("users").doc(req.session.userId).get();
  if (!adminDoc.exists || !adminDoc.data()?.roles?.admin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

app.get("/api/admin/user/:userId/threads", async (req, res) => {
  if (!req.session?.userId) return res.status(401).json({ error: "Not authenticated" });
  const db = getDb();
  if (!db) return res.status(500).json({ error: "Database not initialized" });

  const adminDoc = await db.collection("users").doc(req.session.userId).get();
  if (!adminDoc.exists || !adminDoc.data()?.roles?.admin) {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { userId } = req.params;
  try {
    const snapshot = await db.collection("users").doc(userId).collection("threads").get();
    const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(threads);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user threads" });
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
