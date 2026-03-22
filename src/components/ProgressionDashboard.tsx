import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Zap, Target, Award, Star, TrendingUp, Clock } from 'lucide-react';

interface ProgressionDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  progression: any;
}

export const ProgressionDashboard: React.FC<ProgressionDashboardProps> = ({ isOpen, onClose, profile, progression }) => {
  if (!progression) return null;

  const levelProgress = (progression.xp % 1000) / 10;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0a0a0c] border border-white/10 rounded-[40px] overflow-hidden shadow-2xl"
          >
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-gradient-to-br from-violet-600/10 to-transparent">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-violet-500/50 p-1">
                    <img src={profile?.photoURL || ''} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-violet-600 border-4 border-[#0a0a0c] flex items-center justify-center text-white font-black text-sm">
                    {progression.level}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">{profile?.displayName}</h2>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest">
                      Niveau {progression.level}
                    </span>
                    <span className="text-white/40 text-xs font-medium">Membre depuis {new Date(profile?.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* XP Progress */}
                <div className="p-8 rounded-[32px] bg-white/5 border border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp className="w-24 h-24 text-violet-500" />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">Progression XP</h3>
                      <p className="text-white/40 text-sm">{progression.xp} XP au total</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-violet-400">{Math.floor(levelProgress)}%</span>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-white/20">
                    <span>Niveau {progression.level}</span>
                    <span>Niveau {progression.level + 1}</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Zap, label: 'Activité', value: progression.activityScore, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { icon: Target, label: 'Rangs', value: progression.ranks.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { icon: Clock, label: 'Série', value: '7 Jours', color: 'text-blue-400', bg: 'bg-blue-500/10' }
                  ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-[28px] bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-all">
                      <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranks & Achievements */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Rangs</h3>
                  <Award className="w-4 h-4 text-violet-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {progression.ranks.map((rank: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center text-center group hover:border-violet-500/30 transition-all">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
                        <Trophy className="w-6 h-6 text-violet-400" />
                      </div>
                      <p className="text-[10px] font-bold text-white/80 leading-tight">{rank}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
