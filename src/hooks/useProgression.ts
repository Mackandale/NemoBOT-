import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Progression } from '../types';

export const useProgression = (userId: string | undefined) => {
  const [progression, setProgression] = useState<Progression>({
    xp: 0,
    level: 1,
    activityScore: 0,
    ranks: []
  });

  useEffect(() => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().progression) {
        setProgression(docSnap.data().progression as Progression);
      }
    }, (error) => {
      console.error("Progression listener error:", error);
    });

    return () => unsubscribe();
  }, [userId]);

  const updateProgression = async (xpGain: number, rank?: string) => {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const newXp = progression.xp + xpGain;
    const newLevel = Math.floor(newXp / 1000) + 1;
    
    const updates: any = {
      'progression.xp': newXp,
      'progression.level': newLevel,
      'progression.activityScore': increment(1)
    };

    if (rank) {
      updates['progression.ranks'] = arrayUnion(rank);
    }

    try {
      await setDoc(userRef, updates, { merge: true });
    } catch (err) {
      console.error("Update progression error:", err);
    }
  };

  return { progression, updateProgression };
};
