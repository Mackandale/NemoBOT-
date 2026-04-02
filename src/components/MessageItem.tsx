import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, ChevronLeft, Maximize2, Download, 
  FileText, Check, Copy, Globe 
} from 'lucide-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn, triggerHaptic } from '../lib/utils';
import { Message } from '../types';
import { useLongPress } from '../hooks/useLongPress';
import { cleanTextForCopy } from '../lib/audioUtils';
import { MessageActionBar } from './MessageActionBar';

interface MessageItemProps {
  message: Message;
  onLongPress: (e: any) => void;
  onEdit: (content: string) => void;
  onSpeak: (text: string, id: string) => void;
  onRegenerate: (id: string, type?: string) => void;
  onFavorite: (message: Message) => void;
  activeTTSMessageId: string | null;
  isTTSPaused: boolean;
  isTTSLoading: boolean;
  ttsProgress: number;
  editingMessageId: string | null;
  setEditingMessageId: (id: string | null) => void;
  editInput: string;
  setEditInput: (content: string) => void;
  updateMessage: (id: string, content: string) => void;
  nemoAvatar: string | null;
  setSelectedImage: (url: string) => void;
  copiedCodeId: string | null;
  setCopiedCodeId: (id: string | null) => void;
}

export const MessageItem = ({ 
  message, 
  onLongPress, 
  onSpeak,
  onRegenerate,
  onFavorite,
  activeTTSMessageId,
  isTTSPaused,
  isTTSLoading,
  ttsProgress,
  editingMessageId,
  setEditingMessageId,
  editInput,
  setEditInput,
  updateMessage,
  nemoAvatar,
  setSelectedImage,
  copiedCodeId,
  setCopiedCodeId
}: MessageItemProps) => {
  const [longPressProps] = useLongPress(onLongPress);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: message.role === 'user' ? 0.95 : 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, mass: 1 }}
      className={cn("flex w-full mb-8", message.role === 'user' ? "justify-end px-4" : "justify-start ai-message-container")}
      {...longPressProps}
    >
      <div className={cn("flex gap-4", message.role === 'user' ? "flex-row-reverse w-full" : "flex-col w-full max-w-4xl mx-auto")}>
        {message.role === 'assistant' && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-foreground/10 flex-shrink-0">
              {nemoAvatar ? (
                <img src={nemoAvatar} alt="Nemo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-foreground/40" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground tracking-widest uppercase">Nemo</h4>
              <p className="text-[10px] text-violet-400/60 font-medium">Assistant Lazarus Lab</p>
            </div>
          </div>
        )}

        <div className="flex flex-col w-full">
          <div className={cn("relative group transition-all duration-300", message.role === 'user' ? "message-bubble-user self-end" : "markdown-premium")}>
            {message.image && (
              <div className={cn("mb-4 rounded-2xl overflow-hidden border border-foreground/10 shadow-xl relative group/img", message.role === 'user' ? "max-w-[240px]" : "w-full max-w-2xl")}>
                {message.originalImage ? (
                  <div className="flex flex-col sm:flex-row gap-2 p-2 bg-foreground/5">
                    <div className="flex-1 relative group/orig">
                      <span className="absolute top-2 left-2 px-2 py-1 bg-background/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-foreground/80 z-10">Original</span>
                      <img src={message.originalImage} alt="Original" className="w-full h-full object-cover rounded-xl cursor-pointer" onClick={() => setSelectedImage(message.originalImage!)} referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex items-center justify-center">
                      <ChevronLeft className="w-6 h-6 text-foreground/20 rotate-180 hidden sm:block" />
                      <div className="h-px w-full bg-foreground/10 sm:hidden my-2" />
                    </div>
                    <div className="flex-1 relative group/mod">
                      <span className="absolute top-2 left-2 px-2 py-1 bg-violet-500/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-widest text-white z-10">Modifiée</span>
                      <img src={message.image} alt="Modifiée" className="w-full h-full object-cover rounded-xl cursor-pointer" onClick={() => setSelectedImage(message.image!)} referrerPolicy="no-referrer" />
                    </div>
                  </div>
                ) : (
                  <img src={message.image} alt="Preview" className="w-full h-auto object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500" onClick={() => setSelectedImage(message.image!)} referrerPolicy="no-referrer" />
                )}
                
                {message.role === 'assistant' && (
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedImage(message.image!); }} className="p-3 bg-foreground/10 hover:bg-foreground/20 rounded-full text-foreground transition-all backdrop-blur-md" title="Agrandir">
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); const link = document.createElement('a'); link.href = message.image!; link.download = `nemo-gen-${Date.now()}.png`; link.click(); }} className="p-3 bg-foreground/10 hover:bg-foreground/20 rounded-full text-foreground transition-all backdrop-blur-md" title="Télécharger">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {message.file && !message.file.type.startsWith('image/') && (
              <div className="mb-4 p-3 bg-foreground/5 rounded-xl border border-foreground/10 flex items-center gap-3 max-w-md">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-foreground">{message.file.name}</p>
                  <p className="text-[10px] text-foreground/40">{(message.file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}

            <div className={cn(message.role === 'assistant' ? "markdown-premium" : "text-sm leading-relaxed")}>
              {editingMessageId === message.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-violet-500/50 min-h-[100px]"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingMessageId(null)} className="px-3 py-1.5 rounded-lg bg-foreground/5 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:text-foreground transition-all">Annuler</button>
                    <button onClick={() => updateMessage(message.id, editInput)} className="px-3 py-1.5 rounded-lg bg-violet-500 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-violet-600 transition-all">Enregistrer</button>
                  </div>
                </div>
              ) : (
                <Markdown
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="code-block-container">
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                              setCopiedCodeId(message.id);
                              setTimeout(() => setCopiedCodeId(null), 2000);
                            }}
                            className="copy-code-btn"
                          >
                            {copiedCodeId === message.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                          <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className={className} {...props}>{children}</code>
                      );
                    }
                  }}
                >
                  {message.content}
                </Markdown>
              )}
            </div>

            {message.role === 'assistant' && !editingMessageId && (
              <div className="mt-4">
                <MessageActionBar 
                  message={message}
                  onCopy={(text) => {
                    const cleaned = cleanTextForCopy(text);
                    navigator.clipboard.writeText(cleaned);
                    triggerHaptic('light');
                  }}
                  onRegenerate={onRegenerate}
                  onSpeak={onSpeak}
                  onFavorite={onFavorite}
                  isFavorite={message.favorite || false}
                  isSpeaking={activeTTSMessageId === message.id}
                  isTTSLoading={isTTSLoading}
                  ttsProgress={ttsProgress}
                  isTTSPaused={isTTSPaused}
                />
              </div>
            )}
          </div>
        </div>

        {message.groundingMetadata?.groundingChunks && (
          <div className="mt-6 pt-6 border-t border-foreground/5 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-cyan-400" />
              <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-bold">Sources :</p>
            </div>
            <ul className="space-y-1.5">
              {message.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => (
                chunk.web && (
                  <li key={idx}>
                    <a 
                      href={chunk.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs text-cyan-400/70 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-1 rounded-full bg-cyan-500/30 group-hover:bg-cyan-500 transition-colors" />
                      {chunk.web.title || chunk.web.uri}
                    </a>
                  </li>
                )
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};
