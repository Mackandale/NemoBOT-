import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Sun, Moon, PlusCircle, Search, 
  Star, Pin, MessageSquare, UserCircle, 
  Settings, Sparkles, LogOut, Loader2 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Conversation, UserProfile } from '../types';
import { useLongPress } from '../hooks/useLongPress';

interface ConversationListItemProps {
  conv: Conversation;
  currentConversationId: string | null;
  isEditingConversation: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  renameConversation: (id: string, title: string) => void;
  switchConversation: (id: string) => void;
  setConversationContextMenu: (ctx: any) => void;
}

const ConversationListItem = ({
  conv,
  currentConversationId,
  isEditingConversation,
  editTitle,
  setEditTitle,
  renameConversation,
  switchConversation,
  setConversationContextMenu
}: ConversationListItemProps) => {
  const [longPressProps, isDragged] = useLongPress((e) => {
    setConversationContextMenu({
      isOpen: true,
      conversationId: conv.id,
      position: { x: e.clientX, y: e.clientY }
    });
  });

  return (
    <div 
      key={conv.id}
      {...longPressProps}
      onClick={() => {
        if (!isDragged) {
          switchConversation(conv.id);
        }
      }}
      className={cn(
        "group relative p-3 rounded-xl border transition-all cursor-pointer",
        currentConversationId === conv.id 
          ? "bg-violet-500/10 border-violet-500/30" 
          : "bg-foreground/5 border-transparent hover:bg-foreground/10"
      )}
    >
      <div className="flex items-start gap-3">
        <MessageSquare className={cn(
          "w-4 h-4 mt-0.5 flex-shrink-0",
          currentConversationId === conv.id ? "text-violet-400" : "text-foreground/20"
        )} />
        <div className="flex-1 min-w-0">
          {isEditingConversation === conv.id ? (
            <input 
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => renameConversation(conv.id, editTitle)}
              onKeyDown={(e) => e.key === 'Enter' && renameConversation(conv.id, editTitle)}
              className="w-full bg-transparent border-none p-0 text-sm focus:ring-0"
            />
          ) : (
            <p className="text-sm font-medium truncate pr-6">{conv.title}</p>
          )}
          <p className="text-[10px] text-foreground/40 truncate">{conv.lastMessage || "Pas de message"}</p>
        </div>
      </div>
      
      {conv.pinned && (
        <div className="absolute right-2 top-2">
          <Pin className="w-3 h-3 text-yellow-400 fill-current" />
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  user: UserProfile | null;
  theme: string;
  toggleTheme: () => void;
  createNewConversation: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSidebarScroll: (e: any) => void;
  setShowFavorites: (show: boolean) => void;
  filteredConversations: Conversation[];
  currentConversationId: string | null;
  isEditingConversation: string | null;
  editTitle: string;
  setEditTitle: (title: string) => void;
  renameConversation: (id: string, title: string) => void;
  switchConversation: (id: string) => void;
  setConversationContextMenu: (ctx: any) => void;
  isSidebarScrolling: boolean;
  isAuthLoading: boolean;
  handleLogin: () => void;
  isLoginLoading: boolean;
  handleLogout: () => void;
  setShowProfile: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
}

export const Sidebar = ({
  showSidebar,
  setShowSidebar,
  user,
  theme,
  toggleTheme,
  createNewConversation,
  searchQuery,
  setSearchQuery,
  handleSidebarScroll,
  setShowFavorites,
  filteredConversations,
  currentConversationId,
  isEditingConversation,
  editTitle,
  setEditTitle,
  renameConversation,
  switchConversation,
  setConversationContextMenu,
  isSidebarScrolling,
  isAuthLoading,
  handleLogin,
  isLoginLoading,
  handleLogout,
  setShowProfile,
  setShowSettings
}: SidebarProps) => {
  return (
    <AnimatePresence>
      {showSidebar && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-[280px] bg-tertiary/90 backdrop-blur-xl border-r border-foreground/10 z-[80] flex flex-col"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-foreground/10 flex-shrink-0">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold tracking-tight text-foreground truncate max-w-[120px]">{user?.name || "Nemo AI"}</span>
                    <span className="text-[10px] text-violet-400 font-medium uppercase tracking-widest">Niveau {user?.progression?.level || 1}</span>
                  </div>
                </div>
                <button onClick={toggleTheme} className="p-2 hover:bg-foreground/5 rounded-xl text-foreground/40 hover:text-foreground transition-all">
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              <button 
                onClick={createNewConversation}
                className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-3 transition-all mb-8 shadow-xl shadow-violet-500/20 group"
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nouvelle discussion
              </button>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20" />
                <input 
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-foreground/5 border border-foreground/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                />
              </div>

              <div 
                className="flex-1 overflow-y-auto space-y-6 scrollbar-hide"
                onScroll={handleSidebarScroll}
              >
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/20 mb-3 px-2">Bibliothèque</p>
                  <div className="space-y-1">
                    <button 
                      onClick={() => { setShowFavorites(true); setShowSidebar(false); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-all text-sm font-medium group"
                    >
                      <Star className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                      Favoris
                    </button>
                    <button 
                      onClick={() => { /* Filter pinned */ }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-all text-sm font-medium group"
                    >
                      <Pin className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                      Épinglés
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/20 mb-2 px-2">Récent</p>
                  <div className="space-y-2">
                    {filteredConversations.map((conv) => (
                      <ConversationListItem
                        key={conv.id}
                        conv={conv}
                        currentConversationId={currentConversationId}
                        isEditingConversation={isEditingConversation}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        renameConversation={renameConversation}
                        switchConversation={switchConversation}
                        setConversationContextMenu={setConversationContextMenu}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {!isSidebarScrolling && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-auto pt-6 border-t border-foreground/10 space-y-4"
                  >
                    {isAuthLoading ? (
                      <div className="w-full py-3 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-foreground/20 animate-spin" />
                      </div>
                    ) : !user ? (
                      <button 
                        onClick={handleLogin}
                        disabled={isLoginLoading}
                        className="w-full py-3 px-4 rounded-xl bg-foreground text-background font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoginLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <UserCircle className="w-5 h-5" />
                            Se connecter
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button 
                          onClick={() => { setShowProfile(true); setShowSidebar(false); }}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-foreground/5 transition-all"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-500/30 bg-foreground/5">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <UserCircle className="w-full h-full text-foreground/20" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-bold truncate">{user.name}</p>
                            <p className="text-[10px] text-foreground/40 truncate">Niveau {user.progression.level}</p>
                          </div>
                          <Settings className="w-4 h-4 text-foreground/20" />
                        </button>
                        <button 
                          onClick={() => setShowSettings(true)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-all text-sm font-medium"
                        >
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          Mémoire
                        </button>
                        <button 
                          onClick={() => setShowSettings(true)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-all text-sm font-medium"
                        >
                          <Settings className="w-4 h-4" />
                          Paramètres
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400/60 hover:text-red-400 transition-all text-sm font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Déconnexion
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
