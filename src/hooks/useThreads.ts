import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, where, writeBatch, getDocs, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Thread } from '../types';

export const useThreads = (userId: string | undefined) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const threadsRef = collection(db, 'users', userId, 'conversations');
    const q = query(threadsRef, orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Thread[];
      setThreads(threadsData);
    }, (error) => {
      console.error("Threads listener error:", error);
    });

    return () => unsubscribe();
  }, [userId]);

  const createThread = async (title: string = "Nouvelle conversation") => {
    if (!userId) return null;
    try {
      const threadsRef = collection(db, 'users', userId, 'conversations');
      const newThreadRef = await addDoc(threadsRef, {
        title,
        lastMessage: "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setActiveThreadId(newThreadRef.id);
      return newThreadRef.id;
    } catch (err) {
      console.error("Create thread error:", err);
      return null;
    }
  };

  const deleteThread = async (threadId: string) => {
    if (!userId) return;
    try {
      const threadRef = doc(db, 'users', userId, 'conversations', threadId);
      const messagesRef = collection(db, 'users', userId, 'conversations', threadId, 'messages');
      
      const snapshot = await getDocs(messagesRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      batch.delete(threadRef);
      await batch.commit();

      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }
    } catch (err) {
      console.error("Delete thread error:", err);
    }
  };

  const renameThread = async (threadId: string, newTitle: string) => {
    if (!userId) return;
    try {
      const threadRef = doc(db, 'users', userId, 'conversations', threadId);
      await updateDoc(threadRef, {
        title: newTitle,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Rename thread error:", err);
    }
  };

  return { threads, activeThreadId, setActiveThreadId, createThread, deleteThread, renameThread };
};
