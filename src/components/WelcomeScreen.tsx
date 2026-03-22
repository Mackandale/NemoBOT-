import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Brain, Cpu } from 'lucide-react';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  const suggestions = [
    { icon: Sparkles, text: "Génère une image d'une ville futuriste", color: "text-violet-400", bg: "bg-violet-500/10" },
    { icon: Zap, text: "Analyse ce code et propose des optimisations", color: "text-amber-400", bg: "bg-amber-500/10" },
    { icon: Brain, text: "Explique-moi la physique quantique simplement", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: Cpu, text: "Crée un plan de startup IA innovante", color: "text-blue-400", bg: "bg-blue-500/10" }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-violet-500/20 relative group">
          <div className="absolute inset-0 bg-white/20 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          NEMO <span className="text-violet-500">ULTRA</span>
        </h1>
        <p className="text-white/40 text-lg max-w-md mx-auto font-light leading-relaxed">
          L'intelligence artificielle de nouvelle génération, conçue pour l'excellence et la créativité sans limites.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestions.map((item, idx) => (
          <motion.button
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => onPromptClick(item.text)}
            className="group p-6 rounded-[24px] bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all text-left relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <p className="text-sm text-white/60 font-medium group-hover:text-white transition-colors leading-snug">
              {item.text}
            </p>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Zap className="w-4 h-4 text-white/20" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
