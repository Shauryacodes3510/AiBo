import React from 'react';
import { motion } from 'motion/react';
import { Gift, Star, Coins, Trophy, Zap, Shield, Heart, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import confetti from 'canvas-confetti';

const REWARDS = [
  { id: 'streak_freeze', name: 'Streak Freeze', cost: 200, icon: Shield, color: 'bg-blue-500', description: 'Protects your streak for one day of inactivity.' },
  { id: 'double_xp', name: 'Double XP (30m)', cost: 500, icon: Zap, color: 'bg-yellow-500', description: 'Earn 2x XP for the next 30 minutes.' },
  { id: 'extra_life', name: 'Extra Life', cost: 300, icon: Heart, color: 'bg-red-500', description: 'Get an extra chance in difficult challenges.' },
  { id: 'ai_avatar', name: 'Premium Avatar', cost: 1000, icon: Sparkles, color: 'bg-purple-500', description: 'Unlock a special AI-themed profile avatar.' },
];

const BADGES = [
  { id: 'first_lesson', name: 'First Step', icon: Star, color: 'text-yellow-400', earned: true },
  { id: 'streak_3', name: '3 Day Streak', icon: Zap, color: 'text-orange-500', earned: true },
  { id: 'xp_500', name: 'XP Collector', icon: Trophy, color: 'text-blue-500', earned: false },
  { id: 'ai_master', name: 'AI Master', icon: Gift, color: 'text-purple-500', earned: false },
];

export const RewardsPage = () => {
  const { coins, addCoins } = useStore();

  const handleBuy = (reward: any) => {
    if (coins >= reward.cost) {
      addCoins(-reward.cost);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      alert(`You bought ${reward.name}!`);
    } else {
      alert("Not enough coins! Keep learning to earn more.");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-text-dark">Shop & Rewards</h2>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl">
            <Coins size={20} className="text-primary fill-primary" />
            <span className="text-xl font-black text-primary">{coins}</span>
          </div>
        </div>

        <section className="mb-10">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Power-Ups</h3>
          <div className="grid grid-cols-1 gap-4">
            {REWARDS.map((reward) => (
              <motion.div 
                key={reward.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="card flex items-center gap-4 p-4"
              >
                <div className={`w-16 h-16 ${reward.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                  <reward.icon size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-text-dark">{reward.name}</h4>
                  <p className="text-xs text-gray-500 font-medium">{reward.description}</p>
                </div>
                <button 
                  onClick={() => handleBuy(reward)}
                  className="bg-gray-100 hover:bg-primary hover:text-white px-4 py-2 rounded-xl font-black text-sm transition-all flex items-center gap-1"
                >
                  <Coins size={14} />
                  {reward.cost}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">My Badges</h3>
          <div className="grid grid-cols-2 gap-4">
            {BADGES.map((badge) => (
              <div 
                key={badge.id}
                className={`card flex flex-col items-center text-center p-6 ${!badge.earned ? 'opacity-40 grayscale' : ''}`}
              >
                <div className={`w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3 ${badge.earned ? 'animate-bounce' : ''}`}>
                  <badge.icon size={32} className={badge.color} />
                </div>
                <h4 className="font-black text-sm text-text-dark">{badge.name}</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                  {badge.earned ? 'Earned' : 'Locked'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
