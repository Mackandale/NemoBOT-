import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Trash2, MessageSquare } from 'lucide-react';

interface FavoriteMessage {
  id: string;
  content: string;
  timestamp: string;
}

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: FavoriteMessage[];
  onRemove: (id: string) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({ isOpen, onClose, favorites, onRemove }) => {
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
            className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-400 fill-current" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Messages Favoris</h2>
                  <p className="text-white/40 text-sm">Vos pépites mémorisées</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto scrollbar-hide">
              {favorites.length === 0 ? (
                <div className="py-20 text-center">
                  <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/40">Aucun message favori pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((msg) => (
                    <div key={msg.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 group relative">
                      <p className="text-white/80 text-sm leading-relaxed mb-4 line-clamp-3">{msg.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                          {new Date(msg.timestamp).toLocaleString('fr-FR')}
                        </span>
                        <button 
                          onClick={() => onRemove(msg.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
