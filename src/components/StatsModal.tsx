import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, X, Zap } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: any;
}

export const StatsModal = ({ 
  isOpen, 
  onClose, 
  stats 
}: StatsModalProps) => {
  if (!isOpen || !stats) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md bg-background border border-foreground/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-8 border-b border-foreground/5 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/20 rounded-2xl">
              <BarChart2 className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Statistiques</h2>
              <p className="text-xs text-foreground/40 font-medium uppercase tracking-widest">{stats.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-foreground/5 rounded-2xl text-foreground/40 hover:text-foreground transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
              <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest mb-1">Messages Vous</p>
              <p className="text-2xl font-black text-foreground">{stats.userMessages}</p>
            </div>
            <div className="p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
              <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest mb-1">Messages Nemo</p>
              <p className="text-2xl font-black text-foreground">{stats.botMessages}</p>
            </div>
            <div className="p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
              <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest mb-1">Caractères</p>
              <p className="text-2xl font-black text-foreground">{stats.totalCharacters}</p>
            </div>
            <div className="p-4 bg-foreground/5 rounded-2xl border border-foreground/5">
              <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest mb-1">Moyenne/Msg</p>
              <p className="text-2xl font-black text-foreground">{stats.avgMessageLength}</p>
            </div>
          </div>

          <div className="p-6 bg-violet-500/10 rounded-2xl border border-violet-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-violet-400" />
              <p className="text-sm font-bold text-foreground">Analyse d'engagement</p>
            </div>
            <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-violet-500" 
                style={{ width: `${Math.min(100, (stats.userMessages / 20) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-foreground/40 mt-2">
              {stats.userMessages > 50 ? "Conversation très riche et profonde." : "Conversation en cours de développement."}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
