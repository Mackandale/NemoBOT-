import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Maximize2, Square, Mic, Volume2, 
  Pause, ArrowUp, X, FileText, Globe, 
  Terminal, Gamepad2, UserCircle, Briefcase, 
  Mic2, Sword, Heart, Loader2, Image as ImageIcon,
  Sparkles, Lightbulb, Paperclip
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Message } from '../types';

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  isInputFocused: boolean;
  setIsInputFocused: (focused: boolean) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  lineCount: number;
  setIsFullScreenInput: (full: boolean) => void;
  showPlusMenu: boolean;
  setShowPlusMenu: (show: boolean) => void;
  attachedFiles: any[];
  setAttachedFiles: (files: any[]) => void;
  isWebSearchMode: boolean;
  setIsWebSearchMode: (mode: boolean) => void;
  isPythonMode: boolean;
  setIsPythonMode: (mode: boolean) => void;
  simulationMode: string | null;
  setSimulationMode: (mode: string | null) => void;
  showSimulationSubMenu: boolean;
  setShowSimulationSubMenu: (show: boolean) => void;
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  isRecordingVocal: boolean;
  setIsRecordingVocal: (recording: boolean) => void;
  activeTTSMessageId: string | null;
  isTTSPaused: boolean;
  setIsTTSPaused: (paused: boolean) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  messages: Message[];
  handleSpeak: (text: string, id: string) => void;
  handleSend: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInput = ({
  input,
  setInput,
  isLoading,
  isInputFocused,
  setIsInputFocused,
  textareaRef,
  lineCount,
  setIsFullScreenInput,
  showPlusMenu,
  setShowPlusMenu,
  attachedFiles,
  setAttachedFiles,
  isWebSearchMode,
  setIsWebSearchMode,
  isPythonMode,
  setIsPythonMode,
  simulationMode,
  setSimulationMode,
  showSimulationSubMenu,
  setShowSimulationSubMenu,
  isRecording,
  startRecording,
  stopRecording,
  isRecordingVocal,
  setIsRecordingVocal,
  activeTTSMessageId,
  isTTSPaused,
  setIsTTSPaused,
  audioRef,
  messages,
  handleSpeak,
  handleSend,
  fileInputRef,
  handleFileUpload
}: ChatInputProps) => {
  return (
    <footer className="p-4 md:p-8 pb-8 md:pb-12 max-w-4xl mx-auto w-full relative z-30">
      <div className="relative">
        <AnimatePresence>
          {showPlusMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-full left-0 mb-4 w-full max-w-[280px] bg-tertiary/95 backdrop-blur-2xl border border-foreground/15 rounded-[32px] p-4 shadow-2xl z-50 flex flex-col gap-2"
            >
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <Paperclip className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Fichier</span>
                </button>
                <button 
                  onClick={() => { setIsWebSearchMode(!isWebSearchMode); setShowPlusMenu(false); }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group",
                    isWebSearchMode ? "bg-blue-500/20 border border-blue-500/30" : "bg-foreground/5 hover:bg-foreground/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    isWebSearchMode ? "bg-blue-500 text-white" : "bg-blue-500/20 text-blue-400"
                  )}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Search</span>
                </button>
                <button 
                  onClick={() => { setIsPythonMode(!isPythonMode); setShowPlusMenu(false); }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group",
                    isPythonMode ? "bg-amber-500/20 border border-amber-500/30" : "bg-foreground/5 hover:bg-foreground/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    isPythonMode ? "bg-amber-500 text-white" : "bg-amber-500/20 text-amber-400"
                  )}>
                    <Terminal className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Python</span>
                </button>
                <button 
                  onClick={() => setShowSimulationSubMenu(!showSimulationSubMenu)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all group",
                    simulationMode ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-foreground/5 hover:bg-foreground/10"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform",
                    simulationMode ? "bg-indigo-500 text-white" : "bg-indigo-500/20 text-indigo-400"
                  )}>
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Simu</span>
                </button>
              </div>

              <AnimatePresence>
                {showSimulationSubMenu && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-2 pt-2 border-t border-foreground/5"
                  >
                    {[
                      { id: 'character', icon: UserCircle, label: 'Personnage', color: 'text-blue-400' },
                      { id: 'job', icon: Briefcase, label: 'Entretien', color: 'text-emerald-400' },
                      { id: 'interview', icon: Mic2, label: 'Interview', color: 'text-cyan-400' },
                      { id: 'strategy', icon: Sword, label: 'Stratégie', color: 'text-rose-400' },
                      { id: 'rpg', icon: Gamepad2, label: 'RPG', color: 'text-indigo-400' },
                      { id: 'real-life', icon: Heart, label: 'Vie Réelle', color: 'text-fuchsia-400' }
                    ].map((sim) => (
                      <button
                        key={sim.id}
                        onClick={() => {
                          setSimulationMode(sim.id);
                          setShowSimulationSubMenu(false);
                          setShowPlusMenu(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest",
                          simulationMode === sim.id ? "bg-foreground/10 text-foreground" : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
                        )}
                      >
                        <sim.icon className={cn("w-4 h-4", sim.color)} />
                        {sim.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ 
            borderRadius: lineCount > 1 || (textareaRef.current && textareaRef.current.scrollHeight > 38) ? "20px" : "999px",
            boxShadow: isInputFocused ? "0 0 20px rgba(139, 92, 246, 0.15)" : "0 10px 30px rgba(0,0,0,0.5)"
          }}
          className={cn(
            "bg-secondary px-3 py-1.5 flex flex-col gap-1 transition-all duration-500 border border-foreground/15 overflow-hidden min-h-[38px]",
            isLoading && "opacity-50"
          )}
        >
          {attachedFiles.length > 0 && (
            <div className="px-2 pt-2 flex flex-wrap gap-2">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="px-3 py-1.5 flex items-center gap-2 bg-violet-500/10 rounded-full border border-violet-500/20">
                  <FileText className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[11px] text-violet-200 truncate max-w-[120px]">{file.name}</span>
                  <button 
                    onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                    className="p-0.5 hover:bg-foreground/10 rounded-full"
                  >
                    <X className="w-3 h-3 text-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(isWebSearchMode || isPythonMode || simulationMode) && (
            <div className="px-3 pt-2 flex flex-wrap gap-2">
              {isWebSearchMode && (
                <div className="px-2 py-1 flex items-center gap-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  <Globe className="w-3 h-3" />
                  Web Search
                  <button onClick={() => setIsWebSearchMode(false)} className="ml-1 hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                </div>
              )}
              {isPythonMode && (
                <div className="px-2 py-1 flex items-center gap-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  <Terminal className="w-3 h-3" />
                  Python IDE
                  <button onClick={() => setIsPythonMode(false)} className="ml-1 hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                </div>
              )}
              {simulationMode && (
                <div className="px-2 py-1 flex items-center gap-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  <Gamepad2 className="w-3 h-3" />
                  Simu: {simulationMode}
                  <button onClick={() => setSimulationMode(null)} className="ml-1 hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2 relative min-h-[32px] py-0.5 px-1">
            <button 
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                showPlusMenu ? "bg-violet-500 text-white rotate-45" : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
              )}
            >
              <Plus className="w-4 h-4" />
            </button>

            <div className="flex-1 relative flex items-center h-full">
              <AnimatePresence>
                {!input && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col"
                  >
                    <span className="text-[11px] text-foreground/40 font-bold uppercase tracking-[0.2em]">Répondre à Nemo...</span>
                  </motion.div>
                )}
                {lineCount >= 3 && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setIsFullScreenInput(true)}
                    className="absolute top-0 right-0 w-6 h-6 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors z-10"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    // Enter = newline only, send via button
                  }
                }}
                className={cn(
                  "w-full bg-transparent border-none px-3 py-1 text-[14px] text-foreground focus:ring-0 outline-none resize-none scrollbar-hide leading-relaxed overflow-y-auto",
                  isPythonMode && "font-mono text-[13px]"
                )}
                style={{ maxHeight: '140px', minHeight: '28px' }}
              />
            </div>
            
            <div className="flex items-center gap-1.5 h-full flex-shrink-0">
              <AnimatePresence mode="popLayout">
                {input.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    className="flex items-center gap-1.5"
                  >
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        isRecording ? "bg-red-500 text-white animate-pulse" : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
                      )}
                      title={isRecording ? "Arrêter" : "Vocal"}
                    >
                      {isRecording ? <Square className="w-3.5 h-3.5" /> : <Mic className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        if (activeTTSMessageId) {
                          if (isTTSPaused) {
                            audioRef.current?.play();
                            setIsTTSPaused(false);
                          } else {
                            audioRef.current?.pause();
                            setIsTTSPaused(true);
                          }
                          return;
                        }

                        const lastBotMessage = [...messages].reverse().find(m => m.role === 'assistant');
                        if (lastBotMessage && input.length === 0) {
                          handleSpeak(lastBotMessage.content, lastBotMessage.id);
                        } else {
                          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                          if (SpeechRecognition) {
                            const recognition = new SpeechRecognition();
                            recognition.lang = 'fr-FR';
                            recognition.onstart = () => setIsRecordingVocal(true);
                            recognition.onend = () => setIsRecordingVocal(false);
                            recognition.onresult = (event: any) => {
                              const text = event.results[0][0].transcript;
                              setInput(text);
                            };
                            recognition.start();
                          }
                        }
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                        isRecordingVocal ? "bg-red-500 text-white animate-pulse" : 
                        activeTTSMessageId ? "bg-cyan-500 text-white animate-pulse" :
                        "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
                      )}
                      title={activeTTSMessageId ? "Pause/Reprendre Lecture" : "Vocal / Lecture"}
                    >
                      {activeTTSMessageId ? (isTTSPaused ? <Volume2 className="w-4 h-4" /> : <Pause className="w-4 h-4" />) : <Volume2 className="w-4 h-4" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSend()}
                disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                  (input.trim() || attachedFiles.length > 0) && !isLoading 
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
                    : "bg-foreground/5 text-foreground/10"
                )}
              >
                <ArrowUp className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*,application/pdf,text/*"
      />
    </footer>
  );
};
