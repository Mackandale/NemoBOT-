import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, X, Volume2, Sun, Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, Memory } from '../types';
import { AVAILABLE_VOICES } from '../constants';
import { MemoryPanel } from './MemoryComponents';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateSettings: (settings: any) => void;
  memories: Memory[];
  onDeleteMemory: (id: string) => void;
  onUpdateImportance: (id: string, importance: number) => void;
  onEditMemory: (id: string, content: string) => void;
  onLongPressMemory: (memory: Memory, e: any) => void;
}

export const SettingsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onUpdateSettings,
  memories,
  onDeleteMemory,
  onUpdateImportance,
  onEditMemory,
  onLongPressMemory
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'memory'>('settings');
  
  if (!isOpen || !user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-md bg-secondary border border-foreground/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-foreground/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Paramètres</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-foreground/5 rounded-full text-foreground/40 hover:text-foreground transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-foreground/5">
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === 'settings' ? "text-violet-400 border-b-2 border-violet-500" : "text-foreground/20 hover:text-foreground/40"
            )}
          >
            Configuration
          </button>
          <button 
            onClick={() => setActiveTab('memory')}
            className={cn(
              "flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
              activeTab === 'memory' ? "text-violet-400 border-b-2 border-violet-500" : "text-foreground/20 hover:text-foreground/40"
            )}
          >
            Mémoire
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar max-h-[60vh]">
          {activeTab === 'settings' ? (
            <>
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-violet-400">
                  <Volume2 className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Audio & Voix</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/40 font-medium">Sélection de la voix</label>
                  <select 
                    value={user.settings?.voice || 'Kore'}
                    onChange={(e) => onUpdateSettings({ voice: e.target.value })}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-foreground text-sm focus:outline-none focus:border-violet-500 transition-all appearance-none"
                  >
                    {AVAILABLE_VOICES.map(voice => (
                      <option key={voice.id} value={voice.id} className="bg-secondary">{voice.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-foreground/40 font-medium">Vitesse de lecture</label>
                    <span className="text-xs font-mono text-violet-400">{user.settings?.speechSpeed || 1.0}x</span>
                  </div>
                  <input 
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={user.settings?.speechSpeed || 1.0}
                    onChange={(e) => onUpdateSettings({ speechSpeed: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-foreground/10 rounded-full appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <Sun className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Apparence</h3>
                </div>
                <div className="flex items-center justify-between p-4 bg-foreground/5 border border-foreground/10 rounded-2xl">
                  <span className="text-sm text-foreground/80 font-medium">Thème</span>
                  <select 
                    value={user.settings?.theme || 'dark'}
                    onChange={(e) => onUpdateSettings({ theme: e.target.value })}
                    className="bg-transparent text-foreground text-sm focus:outline-none"
                  >
                    <option value="dark" className="bg-secondary">Sombre</option>
                    <option value="light" className="bg-secondary">Clair</option>
                  </select>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Globe className="w-4 h-4" />
                  <h3 className="text-xs font-black uppercase tracking-widest">Langue & Personnalité</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/40 font-medium">Langue</label>
                  <select 
                    value={user.settings?.language || 'fr'}
                    onChange={(e) => onUpdateSettings({ language: e.target.value })}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-foreground text-sm focus:outline-none focus:border-violet-500 transition-all appearance-none"
                  >
                    <option value="fr" className="bg-secondary">Français</option>
                    <option value="en" className="bg-secondary">English</option>
                  </select>
                </div>
              </section>
            </>
          ) : (
            <MemoryPanel 
              memories={memories} 
              onDelete={onDeleteMemory} 
              onUpdateImportance={onUpdateImportance} 
              onEdit={onEditMemory} 
              onLongPress={onLongPressMemory}
            />
          )}
        </div>

        <div className="p-8 bg-foreground/5 border-t border-foreground/5 text-center">
          <p className="text-[10px] text-foreground/20 font-medium uppercase tracking-widest">Version 2.5.0 - Lazarus Lab</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
