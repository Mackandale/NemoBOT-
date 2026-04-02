import React from 'react';
import { motion } from 'framer-motion';
import { Star, X, Bot, Trash2, Copy } from 'lucide-react';
import Markdown from 'react-markdown';
import { Message } from '../types';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Message[];
  onRemove: (msg: Message) => void;
}

export const FavoritesModal = ({ isOpen, onClose, favorites, onRemove }: FavoritesModalProps) => {
  if (!isOpen) return null;
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
        className="w-full max-w-2xl bg-secondary border border-foreground/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-foreground/5 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-400">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Messages Favoris</h2>
              <p className="text-sm text-foreground/40 font-medium">{favorites.length} messages enregistrés</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-foreground/5 rounded-full text-foreground/40 hover:text-foreground transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/10">
                <Star className="w-10 h-10" />
              </div>
              <p className="text-foreground/40 font-medium">Aucun favori pour le moment.</p>
            </div>
          ) : (
            favorites.map((msg) => (
              <div key={msg.id} className="p-6 rounded-2xl bg-foreground/5 border border-foreground/10 hover:border-orange-500/30 transition-all group relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">Nemo Assistant</span>
                  </div>
                  <button 
                    onClick={() => onRemove(msg)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg text-foreground/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-foreground/80 leading-relaxed markdown-premium">
                  <Markdown>{msg.content}</Markdown>
                </div>
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-foreground/5">
                  <span className="text-[10px] text-foreground/20 font-medium">{new Date(msg.timestamp).toLocaleString()}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(msg.content);
                    }}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copier
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
