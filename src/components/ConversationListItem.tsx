import React from 'react';
import { MessageSquare, Pin } from 'lucide-react';
import { cn } from '../lib/utils';
import { Conversation } from '../types';
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

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conv,
  currentConversationId,
  isEditingConversation,
  editTitle,
  setEditTitle,
  renameConversation,
  switchConversation,
  setConversationContextMenu
}) => {
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
