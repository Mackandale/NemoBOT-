import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Plus, MessageSquare, Star, Settings, LogOut, ChevronRight, Trash2, Edit2, Check, Download } from 'lucide-react';
import { cn } from '../utils/cn';

interface Thread {
  id: string;
  title: string;
  updatedAt: string;
}

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  threads: Thread[];
  activeThreadId: string | null;
  onThreadSelect: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  onRenameThread: (id: string, title: string) => void;
  onExportPDF: (id: string) => void;
  onExportTXT: (id: string) => void;
  onOpenFavorites: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  user: any;
  progression: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  threads,
  activeThreadId,
  onThreadSelect,
  onNewThread,
  onDeleteThread,
  onRenameThread,
  onExportPDF,
  onExportTXT,
  onOpenFavorites,
  onOpenSettings,
  onOpenProfile,
  user,
  progression
}) => {
  const [editingThreadId, setEditingThreadId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [longClickThreadId, setLongClickThreadId] = React.useState<string | null>(null);
  const longClickTimer = React.useRef<any>(null);

  const handleTouchStart = (threadId: string) => {
    longClickTimer.current = setTimeout(() => {
      setLongClickThreadId(threadId);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longClickTimer.current) clearTimeout(longClickTimer.current);
  };

  return (
    <>
      <button 
        onClick={onToggle}
        className="fixed top-6 left-6 z-50 p-3 bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all shadow-xl"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              className="fixed top-0 left-0 bottom-0 w-[320px] bg-[#0a0a0c] border-r border-white/5 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-8 pt-24 flex flex-col h-full">
                <button 
                  onClick={() => { onNewThread(); onToggle(); }}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-between group transition-all mb-8"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm text-white/80">Nouvelle Discussion</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:translate-x-1 transition-all" />
                </button>

                <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 px-2">Historique</h3>
                  {threads.map((thread) => (
                    <div 
                      key={thread.id}
                      onMouseDown={() => handleTouchStart(thread.id)}
                      onMouseUp={handleTouchEnd}
                      onMouseLeave={handleTouchEnd}
                      onTouchStart={() => handleTouchStart(thread.id)}
                      onTouchEnd={handleTouchEnd}
                      className={cn(
                        "group flex items-center gap-2 p-3 rounded-xl transition-all cursor-pointer relative",
                        activeThreadId === thread.id ? "bg-white/5 border border-white/10" : "hover:bg-white/5"
                      )}
                    >
                      <div className="flex-1 min-w-0" onClick={() => { onThreadSelect(thread.id); onToggle(); }}>
                        {editingThreadId === thread.id ? (
                          <input 
                            autoFocus
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onBlur={() => { onRenameThread(thread.id, editTitle); setEditingThreadId(null); }}
                            onKeyDown={(e) => e.key === 'Enter' && (onRenameThread(thread.id, editTitle), setEditingThreadId(null))}
                            className="w-full bg-transparent border-none p-0 text-sm text-white focus:ring-0 outline-none"
                          />
                        ) : (
                          <>
                            <p className={cn(
                              "text-sm truncate font-medium",
                              activeThreadId === thread.id ? "text-white" : "text-white/40 group-hover:text-white/80"
                            )}>
                              {thread.title}
                            </p>
                            <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-0.5">
                              {new Date(thread.updatedAt).toLocaleDateString('fr-FR')}
                            </p>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingThreadId(thread.id);
                            setEditTitle(thread.title);
                          }}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteThread(thread.id); }}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <AnimatePresence>
                        {longClickThreadId === thread.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute inset-0 bg-[#121215] rounded-xl flex items-center justify-center gap-4 z-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button 
                              onClick={() => { onExportPDF(thread.id); setLongClickThreadId(null); }}
                              className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/60 hover:text-white"
                            >
                              <Download className="w-4 h-4" />
                              PDF
                            </button>
                            <button 
                              onClick={() => { onExportTXT(thread.id); setLongClickThreadId(null); }}
                              className="flex flex-col items-center gap-1 text-[10px] font-bold text-white/60 hover:text-white"
                            >
                              <MessageSquare className="w-4 h-4" />
                              TXT
                            </button>
                            <button 
                              onClick={() => setLongClickThreadId(null)}
                              className="p-1 hover:bg-white/5 rounded-full text-white/40"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 space-y-2">
                  <button 
                    onClick={() => { onOpenFavorites(); onToggle(); }}
                    className="w-full p-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-white/40 hover:text-white transition-all group"
                  >
                    <Star className="w-4 h-4 group-hover:text-amber-400 transition-colors" />
                    <span className="text-sm font-bold">Favoris</span>
                  </button>
                  <button 
                    onClick={() => { onOpenSettings(); onToggle(); }}
                    className="w-full p-3 hover:bg-white/5 rounded-xl flex items-center gap-3 text-white/40 hover:text-white transition-all group"
                  >
                    <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    <span className="text-sm font-bold">Paramètres</span>
                  </button>
                  
                  <div 
                    onClick={() => { onOpenProfile(); onToggle(); }}
                    className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 cursor-pointer hover:scale-[1.02] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={user?.photoURL || ''} alt="User" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-violet-600 flex items-center justify-center text-[8px] font-black text-white border-2 border-[#0a0a0c]">
                          {progression?.level || 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-white truncate">{user?.displayName}</p>
                        <p className="text-[9px] font-bold text-violet-400 uppercase tracking-widest">Niveau {progression?.level || 1}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
