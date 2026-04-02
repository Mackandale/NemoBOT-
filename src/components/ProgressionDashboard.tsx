import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, UserCircle, MessageSquare, Image as ImageIcon, 
  Zap, Heart, Star 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';
import { MACK_EMAILS } from '../constants';

interface ProgressionDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export const ProgressionDashboard = ({ isOpen, onClose, profile }: ProgressionDashboardProps) => {
  if (!isOpen || !profile) return null;
  
  const isMack = MACK_EMAILS.includes(profile.email || '');

  const stats = isMack ? {
    messagesSent: 9999,
    imagesGenerated: 999,
    activeTimeMinutes: 99999,
    xp: 999999,
    level: 999,
    badges: ["Admin", "Alpha", "Creator", "Legend", "Mack's Right Hand"]
  } : profile.stats || {
    messagesSent: 0,
    imagesGenerated: 0,
    activeTimeMinutes: 0,
    xp: profile.progression?.xp || 0,
    level: profile.progression?.level || 1,
    badges: []
  };

  const progression = isMack ? {
    xp: 999999,
    level: 999,
    activityScore: 100
  } : profile.progression || {
    xp: 0,
    level: 1,
    activityScore: 0
  };

  const xpToNextLevel = 100 * Math.pow(progression.level, 1.5);
  const progressPercent = (progression.xp / xpToNextLevel) * 100;

  const activityData = [
    { name: 'Lun', xp: 12 },
    { name: 'Mar', xp: 45 },
    { name: 'Mer', xp: 30 },
    { name: 'Jeu', xp: 80 },
    { name: 'Ven', xp: 55 },
    { name: 'Sam', xp: 90 },
    { name: 'Dim', xp: 120 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-4xl bg-secondary border border-foreground/10 rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-10 border-b border-foreground/5 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-transparent">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-foreground/10">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                  <UserCircle className="w-10 h-10 text-foreground/20" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-black text-foreground tracking-tight">{profile.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/30">
                  Niveau {progression.level}
                </span>
                <span className="text-sm text-foreground/40 font-medium">{profile.progression?.rank || 'Membre Premium'}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-foreground/5 rounded-full text-foreground/40 hover:text-foreground transition-all">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <div className="bg-violet-500/5 border border-violet-500/10 rounded-[32px] p-8 relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Progression Globale</p>
                  <h3 className="text-2xl font-bold text-foreground">{progression.xp} <span className="text-foreground/20">/ {Math.round(xpToNextLevel)} XP</span></h3>
                </div>
                <span className="text-sm font-bold text-violet-400">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-4 w-full bg-foreground/5 rounded-full overflow-hidden border border-foreground/5 p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-violet-600 rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Messages', value: stats.messagesSent, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              { label: 'Images', value: stats.imagesGenerated, icon: ImageIcon, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
              { label: 'Temps Actif', value: `${stats.activeTimeMinutes}m`, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
              { label: 'Activité', value: `${progression.activityScore}%`, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
            ].map((stat, i) => (
              <div key={i} className="bg-foreground/5 border border-foreground/10 rounded-3xl p-6 flex flex-col items-center text-center hover:border-foreground/20 transition-all group">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-foreground">{stat.value}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-foreground/5 border border-foreground/10 rounded-[32px] p-8">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/40 mb-8">Activité Hebdomadaire</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: '16px', fontSize: '12px', padding: '12px' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="xp" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorXp)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Badges & Succès</h4>
            <div className="flex flex-wrap gap-4">
              {stats.badges.length > 0 ? stats.badges.map((badge, i) => (
                <div key={i} className="px-6 py-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center gap-3 group hover:bg-violet-500/20 transition-all">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white">{badge}</span>
                </div>
              )) : (
                <p className="text-sm text-white/20 italic">Aucun badge pour le moment. Continuez à interagir !</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Timeline d'Évolution</h4>
            <div className="space-y-4">
              {profile.evolutionTimeline?.map((item, i) => (
                <div key={i} className="flex gap-4 items-start relative">
                  {i !== (profile.evolutionTimeline?.length || 0) - 1 && (
                    <div className="absolute left-[3px] top-4 bottom-0 w-[1px] bg-white/5" />
                  )}
                  <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 z-10" />
                  <div>
                    <p className="text-xs font-bold text-white">{item.event}</p>
                    <p className="text-[10px] text-white/40">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              <div className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-white/10 mt-1.5" />
                <div>
                  <p className="text-xs font-bold text-white/40 italic">Prochaine étape : Premier projet majeur</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
