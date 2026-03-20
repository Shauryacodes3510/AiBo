import React from 'react';
import { motion } from 'motion/react';
import { Gift, Coins, Star, Zap, ShoppingBag, Lock } from 'lucide-react';
import { useStore } from '../../store';

export const RewardsView = () => {
  const { coins, xp } = useStore();

  const rewards = [
    { id: 1, title: 'Double XP (15m)', cost: 100, icon: Zap, color: 'bg-secondary-yellow' },
    { id: 2, title: 'Freeze Streak', cost: 200, icon: Gift, color: 'bg-secondary-blue' },
    { id: 3, title: 'Robot Avatar', cost: 500, icon: ShoppingBag, color: 'bg-secondary-purple' },
    { id: 4, title: 'Premium Theme', cost: 1000, icon: Lock, color: 'bg-secondary-pink' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      <div className="p-3 bg-primary/5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-text-dark">Rewards Shop</h2>
          <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border-2 border-gray-100 shadow-sm">
            <Coins size={16} className="text-secondary-yellow fill-secondary-yellow" />
            <span className="text-base font-black text-gray-600">{coins}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="card bg-white flex flex-col items-center text-center p-2">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-1">
              <Star size={16} fill="currentColor" />
            </div>
            <span className="text-lg font-black">{xp}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Total XP</span>
          </div>
          <div className="card bg-white flex flex-col items-center text-center p-2">
            <div className="w-8 h-8 bg-secondary-yellow/10 rounded-xl flex items-center justify-center text-secondary-yellow mb-1">
              <Coins size={16} fill="currentColor" />
            </div>
            <span className="text-lg font-black">{coins}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase">Coins</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-black text-text-dark mb-3 uppercase tracking-wider">Available Items</h3>
        <div className="grid grid-cols-1 gap-2.5">
          {rewards.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card flex items-center justify-between p-2.5"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  <item.icon size={20} />
                </div>
                <div>
                  <h4 className="font-black text-sm text-text-dark">{item.title}</h4>
                  <div className="flex items-center gap-1 text-secondary-yellow font-bold text-xs">
                    <Coins size={10} fill="currentColor" />
                    <span>{item.cost}</span>
                  </div>
                </div>
              </div>
              <button 
                disabled={coins < item.cost}
                className={`px-3 py-1 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all
                  ${coins >= item.cost 
                    ? 'bg-primary text-white shadow-[0_3px_0_0_#46A302] active:translate-y-1 active:shadow-none' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                Buy
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-secondary-blue/10 p-3 rounded-2xl border-2 border-dashed border-secondary-blue/20 text-center">
          <h3 className="text-base font-black text-secondary-blue mb-1">Daily Bonus</h3>
          <p className="text-gray-500 font-bold mb-2.5 text-xs">Come back tomorrow to claim your daily reward!</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((day) => (
              <div key={day} className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${day === 1 ? 'bg-secondary-blue text-white' : 'bg-white text-gray-300 border-2 border-gray-100'}`}>
                {day}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
