import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, Trash2, Star, Bot, Sparkles, X, 
  Search, Filter, Trash, RefreshCw, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Memory } from '../types';
import { useLongPress } from '../hooks/useLongPress';

export const MemoryItem = ({ 
  memory, 
  onDelete, 
  onUpdateImportance, 
  onEdit, 
  onLongPress,
  editingId,
  setEditingId,
  editContent,
  setEditContent
}: { 
  memory: Memory, 
  onDelete: (id: string) => void, 
  onUpdateImportance: (id: string, importance: number) => void, 
  onEdit: (id: string, content: string) => void,
  onLongPress: (memory: Memory, e: any) => void,
  editingId: string | null,
  setEditingId: (id: string | null) => void,
  editContent: string,
  setEditContent: (content: string) => void
}) => {
  const [longPressProps] = useLongPress((e) => onLongPress(memory, e));
  
  return (
    <div 
      key={memory.id} 
      {...longPressProps}
      className="p-4 bg-foreground/5 border border-foreground/10 rounded-2xl space-y-3 group transition-all hover:border-violet-500/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
            memory.type === 'identity' ? "bg-blue-500/20 text-blue-400" :
            memory.type === 'preference' ? "bg-emerald-500/20 text-emerald-400" :
            memory.type === 'project' ? "bg-violet-500/20 text-violet-400" :
            "bg-amber-500/20 text-amber-400"
          )}>
            {memory.type}
          </span>
          <div className="flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <button
                key={i}
                onClick={() => onUpdateImportance(memory.id, i + 1)}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  i < memory.importance ? "bg-violet-500" : "bg-foreground/10"
                )}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => {
              setEditingId(memory.id);
              setEditContent(memory.content);
            }}
            className="p-1.5 hover:bg-foreground/10 rounded-lg text-foreground/40 hover:text-foreground transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={() => onDelete(memory.id)}
            className="p-1.5 hover:bg-red-500/20 rounded-lg text-foreground/40 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {editingId === memory.id ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-background/40 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => setEditingId(null)}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all"
            >
              Annuler
            </button>
            <button 
              onClick={() => {
                onEdit(memory.id, editContent);
                setEditingId(null);
              }}
              className="px-3 py-1.5 bg-violet-500 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-foreground/80 leading-relaxed">{memory.content}</p>
      )}
      
      <div className="flex items-center justify-between pt-2 border-t border-foreground/5">
        <p className="text-[8px] text-foreground/20 uppercase tracking-widest">
          Dernière utilisation: {memory.lastUsed?.toDate ? memory.lastUsed.toDate().toLocaleDateString() : 'N/A'}
        </p>
        <div className="flex items-center gap-1">
          <Star className={cn("w-3 h-3", memory.importance >= 8 ? "text-amber-400 fill-amber-400" : "text-white/10")} />
        </div>
      </div>
    </div>
  );
};

export const MemoryPanel = ({ 
  memories, 
  onDelete, 
  onUpdateImportance, 
  onEdit,
  onLongPress
}: { 
  memories: Memory[], 
  onDelete: (id: string) => void, 
  onUpdateImportance: (id: string, importance: number) => void, 
  onEdit: (id: string, content: string) => void,
  onLongPress: (memory: Memory, e: any) => void
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {memories.length === 0 ? (
        <div className="text-center py-8 text-foreground/20">
          <Bot className="w-8 h-8 mx-auto mb-2 opacity-20" />
          <p className="text-xs uppercase tracking-widest">Aucune mémoire encore stockée</p>
        </div>
      ) : (
        memories.map(memory => (
          <MemoryItem
            key={memory.id}
            memory={memory}
            onDelete={onDelete}
            onUpdateImportance={onUpdateImportance}
            onEdit={onEdit}
            onLongPress={onLongPress}
            editingId={editingId}
            setEditingId={setEditingId}
            editContent={editContent}
            setEditContent={setEditContent}
          />
        ))
      )}
    </div>
  );
};

export const MemoryListItem = ({ 
  memory, 
  onLongPress 
}: { 
  memory: Memory, 
  onLongPress: (memory: Memory, e: any) => void 
}) => {
  const [longPressProps] = useLongPress((e) => {
    onLongPress(memory, e);
  });

  return (
    <motion.div 
      layout
      {...longPressProps}
      className="p-4 bg-foreground/5 border border-foreground/5 rounded-2xl group hover:border-violet-500/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
              memory.type === 'identity' ? "bg-blue-500/20 text-blue-400" :
              memory.type === 'preference' ? "bg-pink-500/20 text-pink-400" :
              memory.type === 'project' ? "bg-emerald-500/20 text-emerald-400" :
              "bg-amber-500/20 text-amber-400"
            )}>
              {memory.type}
            </span>
            <span className="text-[10px] text-foreground/40 font-mono">
              Importance: {memory.importance}/10
            </span>
            {memory.importance >= 8 && (
              <Star className="w-3 h-3 text-amber-400 fill-current" />
            )}
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{memory.content}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const MemoryModal = ({ 
  isOpen, 
  onClose, 
  memories,
  onDelete,
  onUpdateImportance,
  onEdit,
  onLongPress,
  onCleanup,
  onEraseAll
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  memories: Memory[],
  onDelete: (id: string) => void,
  onUpdateImportance: (id: string, importance: number) => void,
  onEdit: (id: string, content: string) => void,
  onLongPress: (memory: Memory, e: any) => void,
  onCleanup: () => void,
  onEraseAll: () => void
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Memory['type'] | 'all'>('all');

  if (!isOpen) return null;

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.type === filter;
    return matchesSearch && matchesFilter;
  });

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
        className="w-full max-w-2xl bg-background border border-foreground/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
      >
        <div className="p-8 border-b border-foreground/5 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/20 rounded-2xl">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">Banque de Mémoire</h2>
              <p className="text-[10px] text-foreground/40 font-medium uppercase tracking-widest">Gestion des souvenirs de Nemo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-foreground/5 rounded-2xl text-foreground/40 hover:text-foreground transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
              <input 
                type="text"
                placeholder="Rechercher dans les souvenirs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-4 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all appearance-none"
              >
                <option value="all">Tous les types</option>
                <option value="identity">Identité</option>
                <option value="preference">Préférences</option>
                <option value="project">Projets</option>
                <option value="fact">Faits</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <MemoryPanel 
              memories={filteredMemories}
              onDelete={onDelete}
              onUpdateImportance={onUpdateImportance}
              onEdit={onEdit}
              onLongPress={onLongPress}
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-foreground/5">
            <div className="flex gap-2">
              <button 
                onClick={onCleanup}
                className="flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-foreground/60 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                Nettoyer
              </button>
              <button 
                onClick={onEraseAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-400 transition-all"
              >
                <Trash className="w-3 h-3" />
                Tout effacer
              </button>
            </div>
            <p className="text-[10px] text-foreground/20 font-medium uppercase tracking-widest">
              {filteredMemories.length} Souvenirs actifs
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
