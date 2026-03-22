import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Volume2, Brain, Trash2, LogOut, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onOpenMemory: () => void;
  voice: string;
  onVoiceChange: (voice: string) => void;
  autoMemory: boolean;
  onAutoMemoryChange: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onDeleteAccount,
  onOpenMemory,
  voice,
  onVoiceChange,
  autoMemory,
  onAutoMemoryChange
}) => {
  const voices = [
    { id: 'Zephyr', name: 'Zephyr (Neutre)', desc: 'Équilibré et professionnel' },
    { id: 'Kore', name: 'Kore (Féminin)', desc: 'Doux et mélodieux' },
    { id: 'Fenrir', name: 'Fenrir (Masculin)', desc: 'Profond et autoritaire' },
    { id: 'Puck', name: 'Puck (Enjoué)', desc: 'Dynamique et amical' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white/60" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Paramètres</h2>
                  <p className="text-white/40 text-sm">Personnalisez votre expérience</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Voice Selection */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 className="w-4 h-4 text-violet-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Voix de Nemo</h3>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {voices.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => onVoiceChange(v.id)}
                      className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between group ${
                        voice === v.id ? 'bg-violet-500/10 border-violet-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div>
                        <p className={`font-bold text-sm ${voice === v.id ? 'text-violet-400' : 'text-white/80'}`}>{v.name}</p>
                        <p className="text-[11px] text-white/40">{v.desc}</p>
                      </div>
                      {voice === v.id && <div className="w-2 h-2 rounded-full bg-violet-500 shadow-lg shadow-violet-500/50" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memory Settings */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white/40">Mémoire & IA</h3>
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => onAutoMemoryChange(!autoMemory)}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all"
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm text-white/80">Mémoire Automatique</p>
                      <p className="text-[11px] text-white/40">Nemo apprend de vos conversations</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-all relative ${autoMemory ? 'bg-emerald-500' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${autoMemory ? 'left-7' : 'left-1'}`} />
                    </div>
                  </button>
                  <button 
                    onClick={onOpenMemory}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all"
                  >
                    <div className="text-left">
                      <p className="font-bold text-sm text-white/80">Gérer la Mémoire</p>
                      <p className="text-[11px] text-white/40">Voir et supprimer ce que Nemo sait</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-all" />
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <button 
                  onClick={onLogout}
                  className="w-full p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-3 text-white/60 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-bold text-sm">Se déconnecter</span>
                </button>
                <button 
                  onClick={onDeleteAccount}
                  className="w-full p-4 rounded-2xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 flex items-center gap-3 text-rose-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="font-bold text-sm">Supprimer mon compte</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
