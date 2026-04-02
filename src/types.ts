export interface Message {
  id: string;
  conversationId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  groundingMetadata?: any;
  image?: string;
  images?: string[];
  originalImage?: string;
  isPinned?: boolean;
  isSaved?: boolean;
  isModified?: boolean;
  important?: boolean;
  favorite?: boolean;
  sources?: { uri: string; title: string }[];
  file?: {
    name: string;
    type: string;
    size: number;
  };
  files?: {
    name: string;
    type: string;
    data: string;
    size: number;
  }[];
}

export interface Conversation {
  id: string;
  ownerUid: string;
  title: string;
  summary?: string;
  lastMessage: string;
  updatedAt: Date;
  createdAt: Date;
  pinned: boolean;
  favorite: boolean;
}

export interface Memory {
  id: string;
  userId: string;
  type: "identity" | "preference" | "project" | "behavior";
  key: string; 
  content: string;
  importance: number; 
  createdAt: any;
  lastUsed: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  roles: {
    user: boolean;
    admin: boolean;
    lazarus: boolean;
  };
  settings: {
    theme: 'dark' | 'light';
    voice: string;
    language: string;
    personality: string;
    zoomDisabled: boolean;
    speechSpeed: number;
  };
  progression: {
    xp: number;
    level: number;
    rank: string;
    activityScore: number;
  };
  createdAt: any;
  updatedAt: any;
  stats?: {
    messagesSent: number;
    imagesGenerated: number;
    activeTimeMinutes: number;
    xp: number;
    level: number;
    badges: string[];
  };
  evolutionTimeline?: { date: Date; event: string; type: string }[];
  memoryEntries: string[];
  picture?: string;
  streak: number;
  progress: number;
}

export interface Progression {
  xp: number;
  level: number;
  ranks: string[];
  activityScore: number;
}

export interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: any;
  updatedAt: any;
}

export interface GlobalMemory {
  id: string;
  content: string;
  updatedAt: any;
  updatedBy: string;
}
