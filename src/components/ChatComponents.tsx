import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Lightbulb, Briefcase, Zap, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-2xl w-fit border border-white/5">
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0 }}
      className="w-1.5 h-1.5 bg-violet-400 rounded-full"
    />
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
      className="w-1.5 h-1.5 bg-violet-400 rounded-full"
    />
    <motion.div
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
      className="w-1.5 h-1.5 bg-violet-400 rounded-full"
    />
  </div>
);

export const WelcomeScreen = ({ userName, onSuggestion }: { userName: string, onSuggestion: (text: string) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 gap-10 text-center max-w-2xl mx-auto"
  >
    <div className="space-y-4">
      <motion.div 
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl mx-auto mb-6"
      >
        <Bot className="text-white w-12 h-12" />
      </motion.div>
      <h2 className="text-4xl font-black text-foreground tracking-tight">Bon retour, {userName.split(' ')[0]}</h2>
      <p className="text-foreground/40 text-lg font-medium">Sur quoi travaillons-nous aujourd'hui ?</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-6">
      {[
        { icon: Lightbulb, label: "Idées", text: "Donne-moi 5 idées de projets innovants en IA.", color: "text-yellow-400", bg: "bg-yellow-400/10" },
        { icon: Briefcase, label: "Apprendre", text: "Explique-moi le concept de Deep Learning simplement.", color: "text-blue-400", bg: "bg-blue-400/10" },
        { icon: Zap, label: "Créer un projet", text: "Aide-moi à structurer un projet de chatbot intelligent.", color: "text-violet-400", bg: "bg-violet-400/10" },
        { icon: ImageIcon, label: "Générer une image", text: "Génère une image d'une ville futuriste sous la pluie.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
      ].map((item, i) => (
        <button
          key={i}
          onClick={() => onSuggestion(item.text)}
          className="flex items-center gap-4 p-5 bg-foreground/5 border border-foreground/10 rounded-3xl hover:bg-foreground/10 hover:border-foreground/20 transition-all text-left group"
        >
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.bg, item.color)}>
            <item.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-foreground/40 mb-1">{item.label}</p>
            <p className="text-sm font-bold text-foreground/80 line-clamp-1">{item.text}</p>
          </div>
        </button>
      ))}
    </div>
  </motion.div>
);

export const Waveform = ({ active }: { active: boolean }) => {
  return (
    <div className="flex items-center justify-center h-16 gap-1.5">
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: active ? [8, Math.random() * 56 + 8, 8] : 6
          }}
          transition={{
            repeat: Infinity,
            duration: 0.6,
            delay: i * 0.03
          }}
          className="w-1 bg-violet-500/60 rounded-full"
        />
      ))}
    </div>
  );
};

export const AudioProgressBar = ({ isLoading, progress, isPlaying }: { isLoading: boolean, progress: number, isPlaying: boolean }) => (
  <div className="w-full h-1 bg-foreground/5 rounded-full overflow-hidden mt-2 relative">
    {isLoading ? (
      <motion.div
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        className="absolute inset-0 bg-violet-500/30"
      />
    ) : (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        className={cn("h-full bg-violet-500 transition-all duration-300", !isPlaying && "opacity-50")}
      />
    )}
  </div>
);
