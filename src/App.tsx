import { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp, Bot, Sparkles, Phone, Mic, MicOff, X, Volume2, Search, ExternalLink, Plus, Image as ImageIcon, FileText, Lightbulb, Paperclip, Send, Download, RefreshCw, Menu, PlusCircle, History, Settings, LogOut, Trash2, Edit3, MessageSquare, ChevronLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
  groundingMetadata?: any;
  image?: string;
  file?: {
    name: string;
    type: string;
    size: number;
  };
}

interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
  createdAt: Date;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  level: string;
  goals: string[];
  weaknesses: string[];
  strengths: string[];
  progress: number;
  learningStyle: string;
  streak: number;
  memoryEntries: string[];
  conversationSummary: string;
  lastTopic: string;
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [showMemoryManagement, setShowMemoryManagement] = useState(false);
  const [showLazarusInfo, setShowLazarusInfo] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; type: string; data: string; size: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showSidebar, setShowSidebar] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingThread, setIsEditingThread] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  const [nemoAvatar, setNemoAvatar] = useState<string | null>(null);

  const filteredThreads = useMemo(() => {
    return threads.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [threads, searchQuery]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchUser();
    loadNemoAvatar();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
        import('./services/firebase').then(({ requestNotificationPermission, onMessageListener }) => {
          requestNotificationPermission();
          onMessageListener().then((payload: any) => {
            console.log('Received foreground message:', payload);
            // You could show a toast or update state here
          });
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadNemoAvatar = async () => {
    try {
      const { generateNemoAvatar } = await import('./services/avatarService');
      const avatar = await generateNemoAvatar();
      setNemoAvatar(avatar);
    } catch (err) {
      console.error("Avatar generation error:", err);
    }
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        fetchThreads();
        import('./services/firebase').then(({ requestNotificationPermission, onMessageListener }) => {
          requestNotificationPermission();
          onMessageListener().then((payload: any) => {
            console.log('Received foreground message:', payload);
          });
        });
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error("Fetch user error:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const fetchThreads = async () => {
    try {
      const res = await fetch('/api/threads');
      if (res.ok) {
        const data = await res.json();
        setThreads(data);
        if (data.length > 0 && !currentThreadId) {
          switchThread(data[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch threads error:", err);
    }
  };

  const fetchThreadMessages = async (threadId: string) => {
    try {
      const res = await fetch(`/api/threads/${threadId}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          setMessages(data.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } else {
          setMessages([{
            id: 'welcome',
            role: 'bot',
            content: `Nouvelle conversation démarrée. Comment puis-je vous aider aujourd'hui ?`,
            timestamp: new Date(),
          }]);
        }
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  const switchThread = (threadId: string) => {
    setCurrentThreadId(threadId);
    fetchThreadMessages(threadId);
    setShowSidebar(false);
  };

  const createNewThread = async () => {
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: "Nouvelle conversation" })
      });
      if (res.ok) {
        const newThread = await res.json();
        setThreads(prev => [newThread, ...prev]);
        setCurrentThreadId(newThread.id);
        setMessages([{
          id: 'welcome',
          role: 'bot',
          content: `Nouvelle conversation démarrée. Comment puis-je vous aider aujourd'hui ?`,
          timestamp: new Date(),
        }]);
        setShowSidebar(false);
      }
    } catch (err) {
      console.error("Create thread error:", err);
    }
  };

  const deleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!confirm("Supprimer cette conversation ?")) return;
    try {
      const res = await fetch(`/api/threads/${threadId}`, { method: 'DELETE' });
      if (res.ok) {
        setThreads(prev => prev.filter(t => t.id !== threadId));
        if (currentThreadId === threadId) {
          setCurrentThreadId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Delete thread error:", err);
    }
  };

  const renameThread = async (threadId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/threads/${threadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        setThreads(prev => prev.map(t => t.id === threadId ? { ...t, title: newTitle } : t));
        setIsEditingThread(null);
      }
    } catch (err) {
      console.error("Rename thread error:", err);
    }
  };

  const saveMessage = async (role: 'user' | 'bot', content: string, image?: string, file?: any, groundingMetadata?: any, threadId?: string) => {
    const targetThreadId = threadId || currentThreadId;
    if (!targetThreadId) return;
    try {
      await fetch(`/api/threads/${targetThreadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content, image, file, groundingMetadata })
      });
      fetchThreads(); // Refresh threads list to update previews
    } catch (err) {
      console.error("Save message error:", err);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      window.open(url, 'google_auth', 'width=500,height=600');
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    setMessages([{
      id: 'logout',
      role: 'bot',
      content: "Vous avez été déconnecté. À bientôt !",
      timestamp: new Date(),
    }]);
  };

  const handleDeleteAccount = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      await fetch('/api/account', { method: 'DELETE' });
      setUser(null);
      setShowProfile(false);
    }
  };
  
  const deleteMemoryEntry = async (index: number) => {
    try {
      const res = await fetch(`/api/profile/memory/${index}`, { method: 'DELETE' });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Delete memory entry error:", err);
    }
  };

  const analyzeProgress = async (userText: string, botText: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ 
          role: "user", 
          parts: [{ text: `Analyse cette conversation pour extraire des informations de mémoire à long terme.
            User: ${userText}
            Bot: ${botText}
            
            Objectif: Identifier les noms, intérêts, compétences, projets, objectifs, faiblesses et préférences.
            
            Retourne un JSON avec ce format:
            { 
              "level": "Beginner|Intermediate|Advanced", 
              "weaknesses": ["nouveau point faible identifié"], 
              "strengths": ["nouveau point fort identifié"], 
              "progress": 2, // incrément de progression (0-5)
              "memoryEntry": "Une information clé à retenir (ex: 'L'utilisateur travaille sur un projet de robotique')",
              "summary": "Résumé mis à jour de la session",
              "topic": "Sujet technique actuel",
              "goals": ["nouvel objectif détecté"]
            }` 
          }] 
        }],
        config: { responseMimeType: "application/json" }
      });

      const analysis = JSON.parse(response.text || "{}");
      const res = await fetch('/api/profile/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
      }
    } catch (err) {
      console.error("Analysis error:", err);
    }
  };

  // Waveform Component
  const Waveform = ({ active }: { active: boolean }) => {
    return (
      <div className="flex items-center justify-center h-12 gap-1">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: active ? [10, Math.random() * 40 + 10, 10] : 4
            }}
            transition={{
              repeat: Infinity,
              duration: 0.5,
              delay: i * 0.05
            }}
            className="waveform-bar"
          />
        ))}
      </div>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = () => {
    setIsCalling(true);
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        if (isCalling) recognition.start(); // Keep listening if call is active
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript;
            handleVoiceInput(finalTranscript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(interimTranscript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const endCall = () => {
    setIsCalling(false);
    setIsListening(false);
    setIsSpeaking(false);
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (audioContextRef.current) audioContextRef.current.close();
    audioContextRef.current = null;
  };

  const handleVoiceInput = async (text: string) => {
    if (!text.trim() || isSpeaking) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    if (user) saveMessage('user', text);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const systemInstruction = `Tu es Nemo Bot, un mentor IA intelligent. Tu es en appel vocal. 
        ${user ? `
          L'utilisateur s'appelle ${user.name}. 
          Niveau: ${user.level}.
          Mémoire: ${user.memoryEntries.join('; ')}.
        ` : ''}
        Parle de manière naturelle, calme et encourageante. Adapte ton langage au niveau de l'utilisateur. Sois concis mais profond.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text }] }],
        config: {
          systemInstruction,
        }
      });

      const botText = response.text || "";
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      if (user) saveMessage('bot', botText);

      // Speak the response
      await speakResponse(botText);
    } catch (error) {
      console.error("Voice processing error:", error);
    }
  };

  const speakResponse = async (text: string) => {
    setIsSpeaking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' } // Mentor-like voice
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioData = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }

        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64.split(',')[1] // Get only the base64 data
      });
    };
    reader.readAsDataURL(file);
  };

  const ensureThread = async (initialTitle?: string) => {
    if (currentThreadId) return currentThreadId;
    if (!user) return null;
    
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: initialTitle || "Nouvelle conversation" })
      });
      if (res.ok) {
        const newThread = await res.json();
        setThreads(prev => [newThread, ...prev]);
        setCurrentThreadId(newThread.id);
        return newThread.id;
      }
    } catch (err) {
      console.error("Auto-create thread error:", err);
    }
    return null;
  };

  const generateImage = async (prompt: string) => {
    setIsGeneratingImage(true);
    setShowPlusMenu(false);
    
    const activeThreadId = await ensureThread(`Image: ${prompt.substring(0, 20)}`);
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Génère une image : ${prompt}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    if (user) saveMessage('user', `Génère une image : ${prompt}`, undefined, undefined, undefined, activeThreadId || undefined);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Step 1: Optimize prompt
      const optimizerResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: `Optimise ce prompt pour une génération d'image de haute qualité. Sois descriptif et artistique. Prompt original: "${prompt}". Réponds UNIQUEMENT avec le prompt optimisé en anglais.` }] }]
      });
      const optimizedPrompt = optimizerResponse.text?.trim() || prompt;

      // Step 2: Generate image
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: optimizedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      let imageUrl = '';
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: `Voici l'image générée pour : "${prompt}"`,
        timestamp: new Date(),
        image: imageUrl
      };
      setMessages(prev => [...prev, botMsg]);
      if (user) saveMessage('bot', `Voici l'image générée pour : "${prompt}"`, imageUrl, undefined, undefined, activeThreadId || undefined);
    } catch (error) {
      console.error("Image generation error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        content: "Désolé, une erreur est survenue lors de la génération de l'image. Le contenu est peut-être bloqué par les filtres de sécurité.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedFile) || isLoading) return;

    triggerHaptic();
    const rawInput = input.trim();
    const currentFile = attachedFile;

    // Ensure we have a thread
    const activeThreadId = await ensureThread(rawInput.substring(0, 30));

    // Command Detection: Image Generation
    const imageMatch = rawInput.match(/^(génère|générer|generate|create image)\s+(.+)/i);
    if (imageMatch && !currentFile) {
      setInput('');
      generateImage(imageMatch[2]);
      return;
    }

    const isSearchForced = rawInput.toLowerCase().startsWith('/search ');
    const cleanInput = isSearchForced ? rawInput.substring(8).trim() : rawInput;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: rawInput || (currentFile ? (currentFile.type.startsWith('image/') ? "" : `Fichier attaché : ${currentFile.name}`) : ""),
      timestamp: new Date(),
      file: currentFile ? { name: currentFile.name, type: currentFile.type, size: currentFile.size } : undefined,
      image: currentFile?.type.startsWith('image/') ? `data:${currentFile.type};base64,${currentFile.data}` : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    if (user) saveMessage('user', rawInput || `File: ${currentFile?.name}`, undefined, undefined, undefined, activeThreadId || undefined);
    
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const systemInstruction = `Tu es Nemo Bot, un assistant IA de nouvelle génération conçu par Lazarus Lab. 
        Lazarus Lab est un programme d’apprentissage et de développement axé sur l’intelligence artificielle, la programmation et la création de projets technologiques avancés.
        Ton objectif est de former des développeurs capables de comprendre, construire et déployer des systèmes intelligents modernes.
        
        STYLE DE RÉPONSE PREMIUM (OBLIGATOIRE):
        - Utilise des EMOJIS stratégiques pour structurer les informations.
        - Utilise des SYMBOLES SPÉCIAUX (📌, ⚡, 💎, 🚀, 🌑) pour organiser les sections.
        - Utilise des GROS TITRES (Markdown # ou ##) pour les sections principales.
        - Sépare les sections avec des LIGNES HORIZONTALES (Markdown ---).
        - Utilise des SOUS-TITRES (Markdown ###) pour les détails.
        - Mets les points importants en GRAS (**texte**).
        - Utilise l'ITALIQUE (*texte*) pour les nuances ou détails fins.
        - Crée des TABLEAUX structurés pour comparer des données.
        - Utilise des LISTES ordonnées pour les processus étape par étape.
        - Tes réponses doivent être VISUELLEMENT RICHES et FACILES À LIRE.
        
        Vision de Lazarus Lab:
        - Maîtriser Python, JavaScript et le développement backend.
        - Construire des intelligences artificielles personnalisées.
        - Déployer des applications sur le cloud.
        - Comprendre l’architecture des systèmes modernes.
        - Transformer des idées en projets réels.
        
        Philosophie:
        - Apprentissage pratique, construction de projets réels, expérimentation, résolution d’erreurs, autonomie technologique.
        - La progression vient de la pratique.
        
        Ton rôle en tant que Nemo Bot:
        - Tu es un espace d’apprentissage intégré.
        - Tu suis la progression de l'utilisateur.
        - Tu es un assistant technique personnalisé et un environnement d’expérimentation.
        - Tu accompagnes l’utilisateur dans son évolution technique et enregistres ses progrès.
        
        Recherche Web Autonome:
        - Tu disposes d'un système de recherche web autonome (outil googleSearch).
        - Tu DOIS effectuer des recherches sur Internet automatiquement si une information externe, technique ou actualisée est nécessaire pour répondre précisément.
        - Analyse la question, collecte les données pertinentes via l'outil, analyse les résultats et génère une réponse sourcée.
        
        Mémoire et Personnalisation:
        - Tu as accès à la mémoire à long terme de l'utilisateur. Utilise-la pour personnaliser tes conseils.
        - Si l'utilisateur mentionne un projet, souviens-t'en.
        - Adapte ton niveau d'explication à son niveau technique actuel.
        
        ${user ? `
          PROFIL UTILISATEUR:
          - Nom: ${user.name}
          - Niveau: ${user.level}
          - Objectifs: ${user.goals.join(', ')}
          - Points faibles: ${user.weaknesses.join(', ')}
          - Points forts: ${user.strengths.join(', ')}
          - Résumé des sessions passées: ${user.conversationSummary}
          - Dernier sujet abordé: ${user.lastTopic}
          - MÉMOIRE PERSISTANTE: ${user.memoryEntries.join('; ')}
        ` : ''}
        
        INSTRUCTIONS:
        - Sois technique mais pédagogique.
        - Encourage l'expérimentation.
        - Si l'utilisateur fait une erreur, guide-le pour qu'il la trouve lui-même.
        ${isSearchForced ? "- L'utilisateur a explicitement demandé une recherche web. Utilise l'outil de recherche pour répondre." : ""}`;

      // Get last 10 messages for context (Short-term memory)
      const contextMessages = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const parts: any[] = [{ text: cleanInput || "Analyse ce fichier." }];
      if (currentFile) {
        parts.push({
          inlineData: {
            data: currentFile.data,
            mimeType: currentFile.type
          }
        });
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: [
          ...contextMessages,
          {
            role: "user",
            parts: parts
          }
        ],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        }
      });

      const botText = response.text || "Désolé, je n'ai pas pu traiter votre demande.";
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: botText,
        timestamp: new Date(),
        groundingMetadata: response.candidates?.[0]?.groundingMetadata,
      };

      setMessages(prev => [...prev, botMessage]);
      if (user) {
        saveMessage('bot', botText, undefined, undefined, response.candidates?.[0]?.groundingMetadata, activeThreadId || undefined);
        // Adaptive Learning: Analyze conversation every 3 user messages
        const userMessageCount = messages.filter(m => m.role === 'user').length + 1;
        if (userMessageCount % 3 === 0) {
          analyzeProgress(input.trim(), botText);
        }
      }
    } catch (error) {
      console.error("Error calling Gemini:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: "Une erreur système est survenue. Veuillez patienter.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      {/* Sidebar / Drawer */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-[#0a0a0c]/90 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold tracking-tight">Nemo Bot</span>
                  </div>
                  <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-white/5 rounded-full text-white/40">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  onClick={createNewThread}
                  className="w-full py-3 px-4 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold flex items-center justify-center gap-2 transition-all mb-6 shadow-lg shadow-violet-500/20"
                >
                  <PlusCircle className="w-5 h-5" />
                  Nouvelle discussion
                </button>

                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-violet-500/50 transition-all"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-white/20 mb-2 px-2">Récent</p>
                  {filteredThreads.map((thread) => (
                    <div 
                      key={thread.id}
                      onClick={() => switchThread(thread.id)}
                      className={cn(
                        "group relative p-3 rounded-xl border transition-all cursor-pointer",
                        currentThreadId === thread.id 
                          ? "bg-violet-500/10 border-violet-500/30" 
                          : "bg-white/5 border-transparent hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare className={cn(
                          "w-4 h-4 mt-0.5 flex-shrink-0",
                          currentThreadId === thread.id ? "text-violet-400" : "text-white/20"
                        )} />
                        <div className="flex-1 min-w-0">
                          {isEditingThread === thread.id ? (
                            <input 
                              autoFocus
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => renameThread(thread.id, editTitle)}
                              onKeyDown={(e) => e.key === 'Enter' && renameThread(thread.id, editTitle)}
                              className="w-full bg-transparent border-none p-0 text-sm focus:ring-0"
                            />
                          ) : (
                            <p className="text-sm font-medium truncate pr-6">{thread.title}</p>
                          )}
                          <p className="text-[10px] text-white/40 truncate">{thread.lastMessage || "Pas de message"}</p>
                        </div>
                      </div>
                      
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingThread(thread.id);
                            setEditTitle(thread.title);
                          }}
                          className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => deleteThread(e, thread.id)}
                          className="p-1 hover:bg-red-500/20 rounded text-white/40 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                  {!user ? (
                    <button 
                      onClick={handleLogin}
                      className="w-full py-3 px-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all"
                    >
                      <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                      Se connecter
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button 
                        onClick={() => { setShowProfile(true); setShowSidebar(false); }}
                        className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all"
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-violet-500/30">
                          <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-bold truncate">{user.name}</p>
                          <p className="text-[10px] text-white/40 truncate">Niveau {user.level}</p>
                        </div>
                        <Settings className="w-4 h-4 text-white/20" />
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
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Header (Hamburger only) */}
      <header className="p-6 flex items-center justify-between z-30">
        <button 
          onClick={() => setShowSidebar(true)}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowLazarusInfo(true)}
            className="px-4 py-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest text-violet-400 transition-all"
          >
            Lazarus Lab
          </button>
          <button 
            onClick={startCall}
            className="w-12 h-12 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/5"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Lazarus Lab Info Modal */}
      <AnimatePresence>
        {showLazarusInfo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold">À Propos de Lazarus Lab</h2>
                </div>
                <button onClick={() => setShowLazarusInfo(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                <section className="space-y-3">
                  <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs">Le Programme</h3>
                  <p className="text-white/80 leading-relaxed">
                    Lazarus Lab est un programme d’apprentissage et de développement axé sur l’intelligence artificielle, la programmation et la création de projets technologiques avancés.
                  </p>
                  <p className="text-white/60 text-sm">
                    Son objectif est de former des développeurs capables de comprendre, construire et déployer des systèmes intelligents modernes.
                  </p>
                </section>

                <section className="space-y-4">
                  <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    🎯 Vision
                  </h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {[
                      "Maîtriser Python, JavaScript et le backend",
                      "Construire des IA personnalisées",
                      "Déployer des applications sur le cloud",
                      "Comprendre l’architecture moderne",
                      "Transformer des idées en projets réels"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white/70 bg-white/5 p-3 rounded-xl border border-white/5">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="space-y-4">
                  <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    🚀 Philosophie
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {["Pratique", "Projets réels", "Expérimentation", "Autonomie"].map((item, i) => (
                      <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-sm font-bold">{item}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-white/40 italic text-center">
                    "La progression vient de la pratique, pas seulement de la théorie."
                  </p>
                </section>

                <section className="space-y-3">
                  <h3 className="text-violet-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                    🧠 Intégration Nemo Bot
                  </h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    Nemo Bot est votre interface directe avec Lazarus Lab. Elle assure votre suivi, enregistre vos progrès et vous accompagne dans chaque étape de votre évolution technique.
                  </p>
                </section>

                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-violet-400 font-bold">💎 Objectif Final</p>
                  <p className="text-xs text-white/40 mt-1">Former une nouvelle génération de développeurs innovants.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Overlay */}
      <AnimatePresence>
        {showProfile && user && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <header className="p-8 flex items-center justify-between border-b border-white/10">
              <button onClick={() => { 
                if (showMemoryManagement) {
                  setShowMemoryManagement(false);
                } else {
                  setShowProfile(false);
                }
              }} className="text-white/60">
                {showMemoryManagement ? <ChevronLeft className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </button>
              <h2 className="text-xl font-bold">{showMemoryManagement ? "Gestion de la Mémoire" : "Profil Mentor"}</h2>
              <div className="w-6" />
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {showMemoryManagement ? (
                <div className="space-y-6">
                  <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-2xl">
                    <p className="text-sm text-violet-200 leading-relaxed">
                      Nemo Bot utilise cette mémoire pour personnaliser votre parcours d'apprentissage. Vous pouvez supprimer des entrées spécifiques ou tout réinitialiser.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Entrées de mémoire</h4>
                    {user.memoryEntries.length > 0 ? (
                      user.memoryEntries.map((entry, i) => (
                        <div key={i} className="group bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start justify-between gap-4 hover:bg-white/10 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                            <p className="text-sm text-white/80 leading-relaxed">{entry}</p>
                          </div>
                          <button 
                            onClick={() => deleteMemoryEntry(i)}
                            className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <p className="text-sm text-white/20 italic">Aucune donnée en mémoire.</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <button 
                      onClick={async () => {
                        if (confirm("Réinitialiser toute la mémoire de Nemo ? Cette action supprimera également le résumé de vos conversations.")) {
                          const res = await fetch('/api/profile/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              analysis: { 
                                memoryEntries: [], 
                                conversationSummary: "", 
                                lastTopic: "",
                                resetMemory: true 
                              } 
                            })
                          });
                          if (res.ok) {
                            setUser(await res.json());
                            setShowMemoryManagement(false);
                          }
                        }
                      }}
                      className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Tout réinitialiser
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-[#8b5cf6] neon-glow-violet">
                  <img src={user.picture} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <p className="text-white/40">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Niveau</p>
                  <p className="text-lg font-bold text-[#8b5cf6]">{user.level}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Série</p>
                  <p className="text-lg font-bold text-emerald-400">{user.streak} jours</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Progression Apprentissage</h4>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${user.progress}%` }}
                    className="h-full bg-[#8b5cf6] neon-glow-violet"
                  />
                </div>
                <p className="text-right text-xs text-white/40">{user.progress}% complété</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Mémoire Persistante</h4>
                  <button 
                    onClick={() => setShowMemoryManagement(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-all flex items-center gap-1"
                  >
                    Gérer <Settings className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {user.memoryEntries.length > 0 ? (
                    user.memoryEntries.slice(0, 3).map((entry, i) => (
                      <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs text-white/70 flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1 flex-shrink-0" />
                        {entry}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/20 italic">Aucune donnée en mémoire pour le moment.</p>
                  )}
                  {user.memoryEntries.length > 3 && (
                    <button 
                      onClick={() => setShowMemoryManagement(true)}
                      className="w-full py-2 text-[10px] text-white/40 hover:text-white/60 transition-all"
                    >
                      + {user.memoryEntries.length - 3} autres entrées
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-white/40">Actions</h4>
                <button 
                  onClick={() => setShowMemoryManagement(true)}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <Bot className="w-5 h-5 text-violet-400" />
                  Gestion de la mémoire
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                >
                  Déconnexion
                </button>
                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-all"
                >
                  Supprimer le compte
                </button>
              </div>
              
              <p className="text-center text-[10px] text-white/20 px-8">
                Toutes les données sont utilisées uniquement pour personnaliser votre expérience d'apprentissage.
              </p>
            </>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>

      {/* Call Overlay */}
      <AnimatePresence>
        {isCalling && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="call-overlay call-gradient"
          >
            {/* Call Header */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-white/40 text-sm font-medium tracking-widest uppercase">Appel en cours</span>
              <span className="text-white text-xl font-mono">{formatDuration(callDuration)}</span>
            </div>

            {/* AI Avatar */}
            <div className="relative flex flex-col items-center gap-12">
              <motion.div
                className={cn(
                  "w-48 h-48 rounded-full overflow-hidden flex items-center justify-center relative z-10 border-2 border-violet-500/30",
                  isListening && "avatar-pulse-listening",
                  isSpeaking && "avatar-glow-speaking"
                )}
              >
                {nemoAvatar ? (
                  <img src={nemoAvatar} alt="Nemo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-[#8b5cf6] to-[#4c1d95] flex items-center justify-center">
                    <Bot className="text-white w-24 h-24" />
                  </div>
                )}
                
                {/* Decorative Rings */}
                <div className="absolute inset-0 rounded-full border border-white/10 animate-ping [animation-duration:3s]" />
                <div className="absolute -inset-4 rounded-full border border-white/5 animate-ping [animation-duration:4s]" />
              </motion.div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Nemo Bot</h2>
                <p className="text-violet-400 font-medium h-6">
                  {isSpeaking ? "Nemo parle..." : isListening ? "Nemo écoute..." : "En attente..."}
                </p>
              </div>
            </div>

            {/* Call Controls */}
            <div className="flex flex-col items-center gap-12 w-full px-12">
              <div className="w-full">
                <Waveform active={isListening || isSpeaking} />
                {transcript && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/40 text-center text-sm mt-4 italic line-clamp-2"
                  >
                    "{transcript}"
                  </motion.p>
                )}
              </div>

              <div className="flex items-center gap-8">
                <button className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                  <Mic className="w-7 h-7" />
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={endCall}
                  className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20"
                >
                  <Phone className="w-8 h-8 rotate-[135deg]" />
                </motion.button>
                <button className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/60">
                  <Volume2 className="w-7 h-7" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 pt-8 pb-32 space-y-6 scrollbar-hide">
        <div className="max-w-3xl mx-auto w-full">
          {messages.length === 0 && !isAuthLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-6 text-center"
          >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#8b5cf6] to-[#4c1d95] flex items-center justify-center shadow-2xl neon-glow-violet">
              <Bot className="text-white w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold premium-gradient-text">Comment puis-je vous aider ?</h2>
              <p className="text-white/40 text-sm px-8">Posez une question, générez une image ou analysez un fichier avec Nemo.</p>
            </div>
          </motion.div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ 
                opacity: 0, 
                y: 20, 
                scale: message.role === 'user' ? 0.95 : 1
              }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1 
              }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30,
                mass: 1
              }}
              className={cn(
                "flex w-full",
                message.role === 'user' ? "justify-end px-4" : "justify-start ai-message-container"
              )}
            >
              <div
                className={cn(
                  "flex gap-4",
                  message.role === 'user' ? "flex-row-reverse max-w-[85%]" : "flex-col w-full max-w-4xl mx-auto"
                )}
              >
                {message.role === 'bot' && (
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-violet-500/30 flex-shrink-0 neon-glow-violet">
                      {nemoAvatar ? (
                        <img src={nemoAvatar} alt="Nemo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-violet-900/50 flex items-center justify-center">
                          <Bot className="w-5 h-5 text-violet-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-widest uppercase">Nemo Bot</h4>
                      <p className="text-[10px] text-violet-400/60 font-medium">Assistant Lazarus Lab</p>
                    </div>
                  </div>
                )}

                <div
                  className={cn(
                    "relative group",
                    message.role === 'user' ? "message-bubble-user" : "markdown-premium"
                  )}
                >
                  {message.image && (
                    <div className={cn(
                      "mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group/img",
                      message.role === 'user' ? "max-w-[240px]" : "w-full max-w-2xl"
                    )}>
                      <img src={message.image} alt="Preview" className="w-full h-auto object-cover" />
                      
                      {message.role === 'bot' && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = message.image!;
                              link.download = `nemo-gen-${Date.now()}.png`;
                              link.click();
                            }}
                            className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                            title="Télécharger"
                          >
                            <Download className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => {
                              const prompt = message.content.match(/"(.+)"/)?.[1] || message.content;
                              generateImage(prompt);
                            }}
                            className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
                            title="Régénérer"
                          >
                            <RefreshCw className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {message.file && !message.file.type.startsWith('image/') && (
                    <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 max-w-md">
                      <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-white">{message.file.name}</p>
                        <p className="text-xs text-white/40">{(message.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                  )}

                  <div className={cn(
                    "max-w-none",
                    message.role === 'user' ? "prose prose-invert prose-sm" : ""
                  )}>
                    <Markdown>{message.content}</Markdown>
                  </div>

                  {message.groundingMetadata?.groundingChunks && (
                    <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-violet-400" />
                        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Sources & Références</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {message.groundingMetadata.groundingChunks.map((chunk: any, idx: number) => (
                          chunk.web && (
                            <a 
                              key={idx}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-violet-500/10 border border-white/10 hover:border-violet-500/30 rounded-xl text-xs text-violet-300 transition-all group/link"
                            >
                              <ExternalLink className="w-3 h-3 opacity-50 group-hover/link:opacity-100" />
                              <span className="truncate max-w-[180px]">{chunk.web.title}</span>
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isGeneratingImage && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex justify-start pl-2"
          >
            <div className="message-bubble-bot w-full max-w-[300px] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 animate-pulse">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-violet-400">Génération en cours...</p>
              </div>
              <div className="h-48 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
                <motion.div 
                  animate={{ 
                    x: ['-100%', '100%']
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    ease: "linear"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-violet-500/20 animate-bounce" />
                </div>
              </div>
              <p className="text-[10px] text-white/40 italic text-center">Nemo peaufine les détails artistiques...</p>
            </div>
          </motion.div>
        )}

        {isLoading && !isGeneratingImage && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex justify-start pl-2"
          >
            <div className="message-bubble-bot flex items-center gap-2 py-4 px-6">
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    y: [0, -6, 0],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.8, 
                    delay: i * 0.15,
                    ease: "easeInOut"
                  }}
                  className="typing-dot" 
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Floating Input Bar */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="max-w-3xl mx-auto w-full relative">
          <AnimatePresence>
          {showPlusMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="absolute bottom-[100px] left-6 right-6 bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 rounded-[24px] p-4 shadow-2xl z-30 grid grid-cols-2 gap-3"
            >
              <button 
                onClick={() => {
                  const p = prompt("Décrivez l'image à générer :");
                  if (p) generateImage(p);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-violet-500/20 border border-white/5 hover:border-violet-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Image</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Paperclip className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Fichier</span>
              </button>

              <button 
                onClick={() => {
                  setInput("/search ");
                  setShowPlusMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Recherche</span>
              </button>

              <button 
                onClick={() => {
                  setInput("Propose-moi des idées incroyables de projets ou de startups IA.");
                  setShowPlusMenu(false);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/5 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Idées</span>
              </button>

              <div className="col-span-2 p-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center gap-4 opacity-40 grayscale">
                <Mic className="w-4 h-4" />
                <span className="text-[8px] uppercase tracking-widest font-bold">Premium: Voice (Soon)</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={cn(
          "glass-input rounded-[30px] p-2 flex flex-col gap-2 transition-all duration-500 neon-border",
          isLoading && "thinking-glow"
        )}>
          {attachedFile && (
            <div className="px-4 py-2 flex items-center justify-between bg-violet-500/10 rounded-2xl border border-violet-500/20">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileText className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-violet-200 truncate">{attachedFile.name}</span>
              </div>
              <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-white/10 rounded-full">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPlusMenu(!showPlusMenu)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                showPlusMenu ? "bg-violet-500 text-white rotate-45" : "bg-white/5 text-violet-400 hover:bg-white/10"
              )}
            >
              <Plus className="w-6 h-6" />
            </motion.button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Demandez quelque chose à Nemo..."
              className="flex-1 bg-transparent border-none px-2 py-3 text-[16px] text-white focus:ring-0 outline-none placeholder:text-white/20"
            />
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={(!input.trim() && !attachedFile) || isLoading}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                (input.trim() || attachedFile) && !isLoading 
                  ? "bg-[#8b5cf6] text-white neon-glow-violet" 
                  : "bg-white/5 text-white/20",
                !input.trim() && !attachedFile && !isLoading && "animate-pulse-glow"
              )}
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>
          </div>
        </div>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="image/*,application/pdf,text/*"
        />
      </footer>
    </div>
  );
}
