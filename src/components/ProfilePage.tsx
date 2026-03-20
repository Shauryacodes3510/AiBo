import React from 'react';
import { motion } from 'motion/react';
import { User, Settings, LogOut, Flame, Star, Trophy, Clock, ChevronRight, Edit2, ShieldCheck, Mail } from 'lucide-react';
import { useStore } from '../store';
import { supabase } from '../services/supabase';

export const ProfilePage = () => {
  const { user, xp, streak, level, isAdmin, reset } = useStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    reset();
  };

  const stats = [
    { label: 'Streak', value: streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total XP', value: xp, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { label: 'Level', value: level, icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Time', value: '12h', icon: Clock, color: 'text-secondary-blue', bg: 'bg-blue-50' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      {/* Profile Header */}
      <div className="p-8 pb-12 bg-gradient-to-b from-primary/10 to-white flex flex-col items-center text-center relative">
        <button className="absolute top-6 right-6 p-2 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400">
          <Settings size={20} />
        </button>

        <div className="relative mb-6">
          <div className="w-32 h-32 bg-secondary-purple rounded-[40px] flex items-center justify-center text-5xl text-white font-black shadow-2xl border-4 border-white">
            {user?.email?.[0].toUpperCase() || 'A'}
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-xl shadow-lg border-2 border-white">
            <Edit2 size={16} />
          </button>
        </div>

        <h2 className="text-3xl font-black text-text-dark mb-1">
          {user?.email?.split('@')[0] || 'Explorer'}
        </h2>
        <div className="flex items-center gap-2 text-gray-400 font-bold text-sm mb-4">
          <Mail size={14} />
          {user?.email}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
            <ShieldCheck size={12} />
            Admin Explorer
          </div>
        )}
      </div>

      <div className="px-6 -mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card flex flex-col items-center p-5">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-3`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <span className="text-2xl font-black text-text-dark">{stat.value}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-3 mb-8">
          <button className="w-full card flex items-center justify-between p-5 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <User size={20} />
              </div>
              <span className="font-black text-text-dark">Edit Profile</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>

          <button className="w-full card flex items-center justify-between p-5 hover:bg-gray-50 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <Settings size={20} />
              </div>
              <span className="font-black text-text-dark">Learning Preferences</span>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full p-5 border-2 border-red-100 text-red-500 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:translate-y-1 shadow-[0_4px_0_0_#FEE2E2] active:shadow-none"
        >
          <LogOut size={20} />
          Logout Account
        </button>

        <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] mt-8 mb-4">
          AiBO v1.0.4 • Made with ✨
        </p>
      </div>
    </div>
  );
};
