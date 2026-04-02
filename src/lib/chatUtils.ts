import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile } from '../types';

export const cleanTextForCopy = (text: string) => {
  return text
    .replace(/[*_`~]/g, "")
    .replace(/^\s*[-•]\s?/gm, "") // remove lists
    .trim();
};

export const ensureConversation = async (user: UserProfile | null, currentConversationId: string | null, initialTitle?: string) => {
  if (currentConversationId) return currentConversationId;
  if (!user) return null;
  
  try {
    const conversationsRef = collection(db, 'conversations');
    const newConversationRef = await addDoc(conversationsRef, {
      ownerUid: user.uid,
      title: initialTitle || "Nouvelle conversation",
      lastMessage: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      pinned: false,
      favorite: false
    });
    
    return newConversationRef.id;
  } catch (err) {
    console.error("Auto-create conversation error:", err);
  }
  return null;
};

export const copyToClipboard = (text: string, id: string, type: 'code' | 'message', stripMarkdown: (t: string) => string) => {
  const cleanText = type === 'message' ? stripMarkdown(text) : text;
  return navigator.clipboard.writeText(cleanText);
};
