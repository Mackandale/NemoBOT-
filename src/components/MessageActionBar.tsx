import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, RefreshCw, Volume2, Star, Square, 
  Loader2, Minimize2, Maximize2, Search 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Message } from '../types';
import { cleanTextForSpeech } from '../lib/audioUtils';
import { AudioProgressBar } from './AudioProgressBar';

interface MessageActionBarProps {
  message: Message;
  onCopy: (text: string) => void;
  onRegenerate: (id: string, type?: string) => void;
  onSpeak: (text: string, id: string) => void;
  onFavorite: (message: Message) => void;
  isFavorite: boolean;
  isSpeaking: boolean;
  isTTSLoading: boolean;
  ttsProgress: number;
  isTTSPaused: boolean;
}

export const MessageActionBar = ({ 
  message, 
  onCopy, 
  onRegenerate, 
  onSpeak, 
  onFavorite,
  isFavorite,
  isSpeaking,
  isTTSLoading,
  ttsProgress,
  isTTSPaused
}: MessageActionBarProps) => {
  const [showRegenOptions, setShowRegenOptions] = useState(false);

  if (message.role === 'user') return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="message-actions-bar flex items-center gap-2">
        <button 
          onClick={() => onCopy(message.content)}
          className="action-btn-pill p-2 hover:bg-foreground/5 rounded-full transition-all"
          title="Copier"
        >
          <Copy className="w-3 h-3" />
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowRegenOptions(!showRegenOptions)}
            className="action-btn-pill p-2 hover:bg-foreground/5 rounded-full transition-all"
            title="Régénérer"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          
          <AnimatePresence>
            {showRegenOptions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 mb-2 bg-background/90 border border-foreground/10 rounded-xl p-1 shadow-2xl z-50 flex flex-col min-w-[140px] backdrop-blur-xl"
              >
                <button 
                  onClick={() => { onRegenerate(message.id, 'shorter'); setShowRegenOptions(false); }}
                  className="px-3 py-2 hover:bg-foreground/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all text-left flex items-center gap-2"
                >
                  <Minimize2 className="w-3 h-3" /> Plus court
                </button>
                <button 
                  onClick={() => { onRegenerate(message.id, 'longer'); setShowRegenOptions(false); }}
                  className="px-3 py-2 hover:bg-foreground/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all text-left flex items-center gap-2"
                >
                  <Maximize2 className="w-3 h-3" /> Plus long
                </button>
                <button 
                  onClick={() => { onRegenerate(message.id, 'full'); setShowRegenOptions(false); }}
                  className="px-3 py-2 hover:bg-foreground/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all text-left flex items-center gap-2 border-t border-foreground/5 mt-1 pt-2"
                >
                  <RefreshCw className="w-3 h-3" /> Complet
                </button>
                <button 
                  onClick={() => { onRegenerate(message.id, 'analyze'); setShowRegenOptions(false); }}
                  className="px-3 py-2 hover:bg-foreground/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-all text-left flex items-center gap-2"
                >
                  <Search className="w-3 h-3" /> Analyser plus
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => {
            const cleaned = cleanTextForSpeech(message.content);
            onSpeak(cleaned, message.id);
          }}
          className={cn("action-btn-pill p-2 hover:bg-foreground/5 rounded-full transition-all", isSpeaking && "text-violet-400 border-violet-500/50 bg-violet-500/10")}
          title="Lecture vocale"
        >
          {isSpeaking ? (
            isTTSLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />
          ) : <Volume2 className="w-3 h-3" />}
        </button>

        <button 
          onClick={() => onFavorite(message)}
          className={cn("action-btn-pill p-2 hover:bg-foreground/5 rounded-full transition-all", isFavorite && "text-yellow-400 border-yellow-500/50 bg-yellow-500/10")}
          title="Favoris"
        >
          <Star className={cn("w-3 h-3", isFavorite && "fill-current")} />
        </button>
      </div>

      {isSpeaking && (
        <AudioProgressBar 
          isLoading={isTTSLoading} 
          progress={ttsProgress} 
          isPlaying={!isTTSPaused} 
        />
      )}
    </div>
  );
};
