import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, X, Trash2, Search, Database } from 'lucide-react';

interface Memory {
  id: string;
  content: string;
  category: string;
  timestamp: string;
}

interface MemoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onDelete: (id: string) => void;
}

export const MemoryManagementModal: React.FC<MemoryManagementModalProps> = ({ isOpen, onClose, memories, onDelete }) => {
  const [search, setSearch] = React.useState('');
  
  const filtered = memories.filter(m => 
    m.content.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

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
            className="relative w-full max-w-3xl bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Mémoire de Nemo</h2>
                  <p className="text-white/40 text-sm">Ce que j'ai appris sur vous</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type="text"
                  placeholder="Rechercher dans la mémoire..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
                />
              </div>

              <div className="max-h-[50vh] overflow-y-auto scrollbar-hide space-y-3">
                {filtered.length === 0 ? (
                  <div className="py-20 text-center">
                    <Database className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40">Ma mémoire est vide pour le moment.</p>
                  </div>
                ) : (
                  filtered.map((memory) => (
                    <div key={memory.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-400 text-[9px] font-bold uppercase tracking-widest">
                            {memory.category}
                          </span>
                          <span className="text-[9px] text-white/20 uppercase font-bold tracking-widest">
                            {new Date(memory.timestamp).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed">{memory.content}</p>
                      </div>
                      <button 
                        onClick={() => onDelete(memory.id)}
                        className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
