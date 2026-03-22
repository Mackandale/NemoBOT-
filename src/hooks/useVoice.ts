import { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';

export const useVoice = (user: any) => {
  const [isRecordingVocal, setIsRecordingVocal] = useState(false);
  const [isVoiceResponseMode, setIsVoiceResponseMode] = useState(false);
  const [activeTTSMessageId, setActiveTTSMessageId] = useState<string | null>(null);
  const [isTTSPaused, setIsTTSPaused] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const startSpeechRecognition = (onResult: (text: string) => void) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.onstart = () => setIsRecordingVocal(true);
      recognition.onend = () => setIsRecordingVocal(false);
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onResult(text);
      };
      recognition.start();
    } else {
      console.warn("La reconnaissance vocale n'est pas supportée par votre navigateur.");
    }
  };

  const speakResponse = async (text: string, messageId: string) => {
    if (activeTTSMessageId === messageId) {
      stopAudio();
      return;
    }

    setIsTTSLoading(true);
    try {
      const voice = user?.settings?.voice === 'male' ? 'Fenrir' : 'Kore';
      const base64Audio = await geminiService.textToSpeech(text, voice);
      playAudio(base64Audio, messageId);
    } catch (error) {
      console.error("TTS error:", error);
    } finally {
      setIsTTSLoading(false);
    }
  };

  const playAudio = (base64Data: string, messageId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
    audioRef.current = audio;
    setActiveTTSMessageId(messageId);
    setIsTTSPaused(false);
    setTtsProgress(0);

    audio.onended = () => {
      setActiveTTSMessageId(null);
      setTtsProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    audio.onplay = () => {
      progressIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setTtsProgress(progress);
        }
      }, 100);
    };

    audio.play();
  };

  const togglePauseResume = () => {
    if (!audioRef.current) return;

    if (isTTSPaused) {
      audioRef.current.play();
      setIsTTSPaused(false);
    } else {
      audioRef.current.pause();
      setIsTTSPaused(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setActiveTTSMessageId(null);
      setIsTTSPaused(false);
      setTtsProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
  };

  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const callIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isCalling) {
      callIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
      setCallDuration(0);
    }
    return () => {
      if (callIntervalRef.current) clearInterval(callIntervalRef.current);
    };
  }, [isCalling]);

  const startCall = () => setIsCalling(true);
  const endCall = () => setIsCalling(false);

  return {
    isRecordingVocal,
    isListening: isRecordingVocal,
    isVoiceResponseMode,
    setIsVoiceResponseMode,
    activeTTSMessageId,
    isTTSPaused,
    isTTSLoading,
    ttsProgress,
    isCalling,
    callDuration,
    startSpeechRecognition,
    speakResponse,
    pauseResumeTTS: togglePauseResume,
    stopAudio,
    stopTTS: stopAudio,
    startCall,
    endCall,
    transcript: '',
    isSpeaking: !!activeTTSMessageId,
    audioRef
  };
};
