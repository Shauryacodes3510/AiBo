import React from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Flame, Star, Trophy, Settings, ChevronRight, Mail, GraduationCap } from 'lucide-react';
import { useStore } from '../../store';
import { supabase } from '../../services/supabase';

export const ProfileView = () => {
  const { user, xp, streak, level, gradeLevel, isAdmin, reset } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    reset();
  };

  const stats = [
    { label: 'Streak', value: streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total XP', value: xp, icon: Star, color: 'text-secondary-blue', bg: 'bg-secondary-blue/10' },
    { label: 'Level', value: level, icon: Trophy, color: 'text-secondary-yellow', bg: 'bg-secondary-yellow/10' },
    { label: 'Grade', value: gradeLevel, icon: GraduationCap, color: 'text-secondary-purple', bg: 'bg-secondary-purple/10' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      <div className="p-4 flex flex-col items-center text-center bg-gradient-to-b from-primary/5 to-white border-b border-gray-100">
        <div className="relative mb-3">
          <div className="w-20 h-20 bg-secondary-purple rounded-[28px] flex items-center justify-center text-3xl text-white font-black shadow-2xl border-4 border-white">
            {user?.email?.[0].toUpperCase() || 'A'}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-xl border-4 border-white shadow-lg text-white">
            <Settings size={16} />
          </div>
        </div>
        
        <h2 className="text-xl font-black text-text-dark mb-0.5">
          {user?.email?.split('@')[0] || 'Explorer'}
        </h2>
        <div className="flex items-center gap-2 text-gray-400 font-bold mb-2 text-xs">
          <Mail size={12} />
          <span>{user?.email}</span>
        </div>

        {isAdmin && (
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
            Admin Mode Active
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {stats.map((stat) => (
            <div key={stat.label} className="card flex flex-col items-center p-3 border-2 border-gray-50">
              <motion.div 
                animate={stat.label === 'Streak' && streak > 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-8 h-8 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-1.5`}
              >
                <stat.icon size={16} fill="currentColor" fillOpacity={0.2} />
              </motion.div>
              <span className="text-lg font-black text-text-dark">{stat.value}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">Account Settings</h3>
          
          <button className="w-full card flex items-center justify-between p-3 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <User size={16} />
              </div>
              <span className="font-black text-text-dark text-xs">Edit Profile</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button className="w-full card flex items-center justify-between p-3 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <GraduationCap size={16} />
              </div>
              <span className="font-black text-text-dark text-xs">Change Grade Level</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full card flex items-center justify-between p-3 border-red-50 hover:bg-red-50 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <LogOut size={16} />
              </div>
              <span className="font-black text-red-500 text-xs">Logout</span>
            </div>
            <ChevronRight size={16} className="text-red-200" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 mt-auto">
        <p className="text-center text-gray-300 font-bold text-xs uppercase tracking-widest">
          AiBO v1.0.0 • Made with ❤️ for AI Explorers
        </p>
      </div>
    </div>
  );
};
