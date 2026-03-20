import React from 'react';
import { motion } from 'motion/react';
import { Users, Zap, MessageCircle, Heart, Share2, Sparkles, Target } from 'lucide-react';
import { useStore } from '../store';

const CHALLENGES = [
  { id: 1, title: 'AI Ethics Master', description: 'Complete 3 lessons on AI Ethics.', progress: 1, total: 3, reward: 50 },
  { id: 2, title: 'Streak Builder', description: 'Maintain a 5-day learning streak.', progress: 3, total: 5, reward: 100 },
  { id: 3, title: 'Fast Learner', description: 'Complete a lesson in under 3 minutes.', progress: 0, total: 1, reward: 30 },
];

const FEED = [
  { id: 1, user: 'Alex', action: 'completed', item: 'Neural Networks 101', time: '2m ago', avatar: 'A' },
  { id: 2, user: 'Sarah', action: 'earned', item: 'AI Master Badge', time: '15m ago', avatar: 'S' },
  { id: 3, user: 'Leo', action: 'reached', item: 'Level 5', time: '1h ago', avatar: 'L' },
];

export const SocialPage = () => {
  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      <div className="p-6">
        <h2 className="text-3xl font-black text-text-dark mb-8">Social & Challenges</h2>

        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Daily Challenges</h3>
            <div className="flex items-center gap-1 text-primary font-black text-xs">
              <Zap size={14} className="fill-primary" />
              Resets in 14h
            </div>
          </div>
          
          <div className="space-y-4">
            {CHALLENGES.map((challenge) => (
              <div key={challenge.id} className="card p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-text-dark">{challenge.title}</h4>
                    <p className="text-xs text-gray-500 font-medium">{challenge.description}</p>
                  </div>
                  <div className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                    <Sparkles size={12} />
                    +{challenge.reward}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <span className="text-xs font-black text-gray-400">{challenge.progress}/{challenge.total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Friend Activity</h3>
          <div className="space-y-4">
            {FEED.map((item) => (
              <div key={item.id} className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-secondary-blue rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm shrink-0">
                  {item.avatar}
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
                  <p className="text-sm font-bold text-gray-600">
                    <span className="font-black text-text-dark">{item.user}</span> {item.action}{' '}
                    <span className="text-primary font-black">{item.item}</span>
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.time}</span>
                    <div className="flex gap-3">
                      <button className="text-gray-300 hover:text-red-500 transition-colors"><Heart size={16} /></button>
                      <button className="text-gray-300 hover:text-primary transition-colors"><MessageCircle size={16} /></button>
                      <button className="text-gray-300 hover:text-secondary-blue transition-colors"><Share2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button className="btn-secondary w-full mt-10 flex items-center justify-center gap-2">
          <Users size={20} />
          Find More Friends
        </button>
      </div>
    </div>
  );
};
