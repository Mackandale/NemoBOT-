import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Memory } from '../types';

export const useMemory = (userId: string | undefined) => {
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    if (!userId) return;

    const memoriesRef = collection(db, 'users', userId, 'memories');
    const memoriesQuery = query(memoriesRef, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(memoriesQuery, (snapshot) => {
      const mems = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: data.content || '',
          category: data.category || 'general',
          priority: data.priority || 'medium',
          timestamp: data.timestamp?.toDate() || new Date()
        };
      }) as Memory[];
      setMemories(mems);
    }, (error) => {
      console.error("Memories listener error:", error);
    });

    return () => unsubscribe();
  }, [userId]);

  const addMemory = async (content: string, category: string, priority: 'low' | 'medium' | 'high') => {
    if (!userId) return;

    const memoriesRef = collection(db, 'users', userId, 'memories');
    await addDoc(memoriesRef, {
      content,
      category,
      priority,
      timestamp: serverTimestamp()
    });
  };

  const deleteMemory = async (id: string) => {
    if (!userId) return;
    try {
      const memoryRef = doc(db, 'users', userId, 'memories', id);
      await deleteDoc(memoryRef);
    } catch (err) {
      console.error("Delete memory error:", err);
    }
  };

  return { memories, addMemory, deleteMemory };
};
