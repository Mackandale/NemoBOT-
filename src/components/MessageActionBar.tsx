import React from 'react';
import { Copy, RotateCcw, Volume2, Star, Check, Pause } from 'lucide-react';
import { cn } from '../utils/cn';

interface MessageActionBarProps {
  content: string;
  messageId: string;
  isFavorite: boolean;
  onRegenerate: () => void;
  onSpeak: (text: string, id: string) => void;
  onToggleFavorite: (id: string) => void;
  activeTTSMessageId: string | null;
  isTTSPaused: boolean;
  onPauseResumeTTS: () => void;
  ttsProgress?: number;
}

export const MessageActionBar: React.FC<MessageActionBarProps> = ({
  content,
  messageId,
  isFavorite,
  onRegenerate,
  onSpeak,
  onToggleFavorite,
  activeTTSMessageId,
  isTTSPaused,
  onPauseResumeTTS,
  ttsProgress = 0
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSpeaking = activeTTSMessageId === messageId;

  return (
    <div className="flex flex-col gap-2 mt-4 w-full">
      {isSpeaking && (
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-100" 
            style={{ width: `${ttsProgress}%` }}
          />
        </div>
      )}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button 
          onClick={handleCopy}
          className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          title="Copier"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié' : 'Copier'}
        </button>
        
        <button 
          onClick={onRegenerate}
          className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
          title="Régénérer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Régénérer
        </button>

        <button 
          onClick={() => isSpeaking ? onPauseResumeTTS() : onSpeak(content, messageId)}
          className={cn(
            "p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
            isSpeaking ? "bg-cyan-500/20 text-cyan-400" : "hover:bg-white/5 text-white/40 hover:text-white"
          )}
          title="Lire"
        >
          {isSpeaking ? (isTTSPaused ? <Volume2 className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />) : <Volume2 className="w-3.5 h-3.5" />}
          {isSpeaking ? (isTTSPaused ? 'Reprendre' : 'Pause') : 'Lire'}
        </button>

        <button 
          onClick={() => onToggleFavorite(messageId)}
          className={cn(
            "p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
            isFavorite ? "text-amber-400" : "text-white/40 hover:text-white hover:bg-white/5"
          )}
          title="Favoris"
        >
          <Star className={cn("w-3.5 h-3.5", isFavorite && "fill-current")} />
          {isFavorite ? 'Favori' : 'Favoris'}
        </button>
      </div>
    </div>
  );
};
