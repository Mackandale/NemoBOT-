import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile } from '../types';

export const updateUserSettings = async (user: UserProfile | null, newSettings: any, setUser: (u: any) => void) => {
  if (!user) return;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const updatedSettings = { ...user.settings, ...newSettings };
    await updateDoc(userDocRef, { settings: updatedSettings });
    setUser((prev: any) => prev ? { ...prev, settings: updatedSettings } : null);
  } catch (err) {
    console.error("Update settings error:", err);
  }
};

export const updateProgression = async (user: UserProfile | null, xpGain: number, setUser: (u: any) => void) => {
  if (!user) return;
  
  const currentXP = user.progression?.xp || 0;
  const newXP = currentXP + xpGain;
  const newLevel = Math.floor(newXP / 500) + 1;
  
  let newRank = 'Novice';
  if (newLevel >= 5) newRank = 'Apprenti';
  if (newLevel >= 10) newRank = 'Expert';
  if (newLevel >= 25) newRank = 'Maître';
  if (newLevel >= 50) newRank = 'Légende';
  if (newLevel >= 100) newRank = 'Divinité IA';

  const updatedProgression = {
    ...user.progression,
    xp: newXP,
    level: newLevel,
    rank: newRank
  };

  setUser((prev: any) => prev ? { ...prev, progression: updatedProgression } : null);
  
  try {
    await setDoc(doc(db, 'users', user.uid), {
      progression: updatedProgression,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Update progression error:", error);
  }
};
