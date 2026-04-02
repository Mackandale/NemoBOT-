import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [50]
    };
    window.navigator.vibrate(patterns[type]);
  }
};
