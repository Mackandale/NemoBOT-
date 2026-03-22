export interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  text?: string; // For requested structure compatibility
  type?: string;
  timestamp: any;
  fromUser?: boolean;
  files?: any[];
  images?: string[];
  groundingMetadata?: any;
}

export interface Thread {
  id: string;
  title: string;
  updatedAt: any;
  createdAt: any;
  lastMessage?: string;
  ownerUid?: string;
}

export interface UserProfile {
  id: string;
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  photoURL: string;
  createdAt: any;
  roles: {
    user: boolean;
    lazarus: boolean;
    admin: boolean;
  };
  settings: {
    theme: string;
    voice: string;
    language: string;
    personality: string;
    zoomDisabled: boolean;
    autoMemory?: boolean;
  };
  progression: {
    xp: number;
    level: number;
    activityScore: number;
    ranks: string[];
  };
  memories: string[];
  favorites: string[];
  conversations: string[];
}

export interface Memory {
  id: string;
  content: string;
  category: string;
  priority: number;
  timestamp: any;
}

export interface Progression {
  xp: number;
  level: number;
  activityScore: number;
  ranks: string[];
}
