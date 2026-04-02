import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, Memory } from '../types';

export const analyzeAndStoreInteraction = async (
  user: UserProfile | null, 
  userText: string, 
  assistantText: string, 
  userMemories: Memory[],
  currentConversationId: string | null,
  saveMessage: any
) => {
  if (!user || userText.length < 2) return;
  
  try {
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3-flash-preview",
        contents: [{ 
          role: "user", 
          parts: [{ text: `Analyse cette interaction entre l'utilisateur et Nemo.
    
    User: "${userText}"
    Nemo: "${assistantText}"
    
    Mémoires actuelles:
    ${userMemories.map(m => `${m.key}: ${m.content}`).join('\n')}

    RÈGLES:
    1. Détecte les informations CLÉS sur l'utilisateur (identité, préférences, projets, comportement).
    2. Attribue un score d'importance de 1 à 10.
    3. Ne sauvegarde en MÉMOIRE que si l'importance est >= 6.
    4. Décide si cette interaction (User + Nemo) doit être sauvegardée dans l'HISTORIQUE (importance >= 4).
    5. Assigne une clé unique par sujet (ex: 'age', 'main_language').
    6. Identifie les conflits : si l'utilisateur donne une nouvelle information qui contredit une ancienne, utilise la même clé.
    7. Retourne UNIQUEMENT un JSON valide de la forme: {
         "memories": [{"type": "...", "content": "...", "importance": number, "key": "...", "isUpdate": boolean}],
         "shouldSaveToHistory": boolean
       }.
    8. Si aucune information importante n'est détectée, retourne {"memories": [], "shouldSaveToHistory": false}.` }] 
        }],
        config: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) throw new Error("Failed to analyze interaction");
    const data = await response.json();
    const result = JSON.parse(data.text || "{}");
    
    if (result.shouldSaveToHistory && user) {
      saveMessage('user', userText, undefined, undefined, undefined, currentConversationId || undefined);
      saveMessage('assistant', assistantText, undefined, undefined, undefined, currentConversationId || undefined);
    }

    if (result.memories && Array.isArray(result.memories)) {
      for (const mem of result.memories) {
        if (mem.importance >= 6 && mem.key) {
          const existingMemory = userMemories.find(m => m.key === mem.key);
          
          if (existingMemory) {
            await updateDoc(doc(db, 'memory', existingMemory.id), {
              content: mem.content,
              importance: Math.max(mem.importance, existingMemory.importance),
              type: mem.type,
              lastUsed: serverTimestamp()
            });
          } else {
            await addDoc(collection(db, 'memory'), {
              userId: user.uid,
              key: mem.key,
              content: mem.content,
              type: mem.type,
              importance: mem.importance,
              createdAt: serverTimestamp(),
              lastUsed: serverTimestamp()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Interaction analysis error:", error);
  }
};

export const analyzeProgress = async (
  user: UserProfile | null, 
  userText: string, 
  assistantText: string, 
  userMemories: Memory[],
  updateProgression: any,
  setUser: any
) => {
  if (!user) return;
  try {
    const response = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemini-3-flash-preview",
        contents: [{ 
          role: "user", 
          parts: [{ text: `Analyse cette conversation pour extraire des informations de mémoire à long terme.
          User: ${userText}
          Assistant: ${assistantText}
          
          Mémoires actuelles:
          ${userMemories.map(m => `${m.key}: ${m.content}`).join('\n')}
          
          Objectif: 
          1. Identifier les informations CLÉS (noms, intérêts, compétences, projets, objectifs, faiblesses et préférences).
          2. Attribuer une importance de 0 à 10. Ne sauvegarde que si l'importance est >= 6.
          3. Identifier les conflits : si l'utilisateur donne une nouvelle information qui contredit une ancienne (ex: âge différent), marque-la comme mise à jour.
          4. Assigner une clé unique par sujet (ex: 'age', 'main_language', 'current_project').
          
          Retourne un JSON avec ce format:
          { 
            "level": "Beginner|Intermediate|Advanced", 
            "progress": 2, // incrément de progression (0-5)
            "memories": [
              {
                "key": "clé_unique",
                "content": "L'information extraite",
                "type": "identity|preference|project|behavior",
                "importance": 8,
                "isUpdate": true/false
              }
            ],
            "summary": "Résumé de la session",
            "topic": "Sujet technique actuel"
          }` }] 
        }],
        config: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) throw new Error("Failed to analyze progress");
    const data = await response.json();
    const analysis = JSON.parse(data.text || "{}");
    
    if (analysis.progress) {
      await updateProgression(analysis.progress * 10);
    }

    if (analysis.memories && Array.isArray(analysis.memories)) {
      for (const mem of analysis.memories) {
        if (mem.importance >= 6) {
          const existingMemory = userMemories.find(m => m.key === mem.key);
          
          if (existingMemory) {
            await updateDoc(doc(db, 'memory', existingMemory.id), {
              content: mem.content,
              importance: mem.importance,
              type: mem.type,
              lastUsed: serverTimestamp()
            });
          } else {
            await addDoc(collection(db, 'memory'), {
              userId: user.uid,
              key: mem.key,
              content: mem.content,
              type: mem.type,
              importance: mem.importance,
              createdAt: serverTimestamp(),
              lastUsed: serverTimestamp()
            });
          }
        }
      }
    }

    const res = await fetch('/api/profile/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis })
    });
    if (res.ok) {
      const updatedUser = await res.json();
      setUser(updatedUser);
    }
  } catch (err) {
    console.error("Analysis error:", err);
  }
};
