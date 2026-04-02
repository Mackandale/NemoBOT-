import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface LazarusInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LazarusInfoModal = ({ 
  isOpen, 
  onClose 
}: LazarusInfoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-background/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-background border border-foreground/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between bg-foreground/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground">À Propos de Lazarus Lab</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-foreground/10 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
              <section className="space-y-3">
                <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs">Le Programme</h3>
                <p className="text-foreground/80 leading-relaxed">
                  Lazarus Lab est un programme d’apprentissage et de développement axé sur l’intelligence artificielle, la programmation et la création de projets technologiques avancés.
                </p>
                <p className="text-foreground/60 text-sm">
                  Son objectif est de former des développeurs capables de comprendre, construire et déployer des systèmes intelligents modernes.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  🎯 Vision
                </h3>
                <ul className="grid grid-cols-1 gap-2">
                  {[
                    "Maîtriser Python, JavaScript et le backend",
                    "Construire des IA personnalisées",
                    "Déployer des applications sur le cloud",
                    "Comprendre l’architecture moderne",
                    "Transformer des idées en projets réels"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-foreground/70 bg-foreground/5 p-3 rounded-xl border border-foreground/5">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  🚀 Philosophie
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Pratique", "Projets réels", "Expérimentation", "Autonomie"].map((item, i) => (
                    <div key={i} className="bg-foreground/5 p-4 rounded-2xl border border-foreground/5 text-center">
                      <p className="text-sm font-bold text-foreground">{item}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-foreground/40 italic text-center">
                  "La progression vient de la pratique, pas seulement de la théorie."
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                  🧠 Intégration Nemo
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Nemo est votre interface directe avec Lazarus Lab. Elle assure votre suivi, enregistre vos progrès et vous accompagne dans chaque étape de votre évolution technique.
                </p>
              </section>

              <div className="pt-4 border-t border-foreground/10 text-center">
                <p className="text-violet-400 font-bold">💎 Objectif Final</p>
                <p className="text-xs text-foreground/40 mt-1">Former une nouvelle génération de développeurs innovants.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
