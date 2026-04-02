import React from 'react';
import { motion } from 'framer-motion';

interface AudioProgressBarProps {
  isLoading: boolean;
  progress: number;
  isPlaying: boolean;
}

export const AudioProgressBar = ({ 
  isLoading, 
  progress, 
  isPlaying 
}: AudioProgressBarProps) => {
  return (
    <div className="mt-4 w-full max-w-[240px] space-y-3 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          {isLoading ? (
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500 to-transparent w-1/2"
            />
          ) : (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-violet-400 animate-pulse' : 'bg-white/20'}`} />
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">
            {isLoading ? 'Chargement...' : isPlaying ? 'Lecture' : 'Pause'}
          </span>
        </div>
      </div>
    </div>
  );
};
