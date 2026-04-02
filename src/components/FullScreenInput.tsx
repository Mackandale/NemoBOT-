import React from 'react';
import { motion } from 'framer-motion';
import { Minimize2, ArrowUp } from 'lucide-react';

interface FullScreenInputProps {
  input: string;
  setInput: (input: string) => void;
  setIsInputFocused: (focused: boolean) => void;
  setIsFullScreenInput: (full: boolean) => void;
  handleSend: () => void;
}

export const FullScreenInput = ({
  input,
  setInput,
  setIsInputFocused,
  setIsFullScreenInput,
  handleSend
}: FullScreenInputProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[200] bg-background p-8 flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-4xl flex justify-end mb-12">
        <button 
          onClick={() => setIsFullScreenInput(false)}
          className="w-14 h-14 flex items-center justify-center bg-foreground/5 hover:bg-foreground/10 rounded-full text-foreground transition-all group"
        >
          <Minimize2 className="w-7 h-7 group-hover:scale-110 transition-transform" />
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl mx-auto">
        <textarea 
          autoFocus
          value={input}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message ici..."
          className="w-full bg-transparent border-none text-3xl md:text-5xl text-foreground/90 focus:ring-0 outline-none resize-none scrollbar-hide leading-relaxed font-light text-center placeholder:text-foreground/10 h-full flex items-center justify-center"
        />
      </div>
      
      <div className="w-full max-w-4xl flex justify-center pt-12">
        <button 
          onClick={() => { handleSend(); setIsFullScreenInput(false); }}
          className="w-20 h-20 bg-violet-500 hover:bg-violet-600 rounded-full text-white flex items-center justify-center transition-all shadow-2xl shadow-violet-500/40 hover:scale-105 active:scale-95"
        >
          <ArrowUp className="w-10 h-10" />
        </button>
      </div>
    </motion.div>
  );
};
