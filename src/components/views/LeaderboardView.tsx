import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Loader2 } from 'lucide-react';
import { fetchLeaderboard } from '../../services/lessonService';
import { useStore } from '../../store';

export const LeaderboardView = () => {
  const { user } = useStore();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchLeaderboard();
        setLeaderboard(data || []);
      } catch (error) {
        console.error("Error loading leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      <div className="p-6 bg-secondary-yellow/10 text-center border-b border-gray-100">
        <div className="w-16 h-16 bg-secondary-yellow rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-secondary-yellow/20 rotate-3">
          <Trophy size={32} strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-black text-text-dark mb-1">Hall of Fame</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Top AI Explorers</p>
      </div>

      <div className="p-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-secondary-yellow" size={40} />
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Ranking Explorers...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Podium for Top 3 */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-2 pt-8 pb-4">
                {/* 2nd Place */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 bg-gray-100 rounded-full border-4 border-gray-300 flex items-center justify-center text-xl font-black text-gray-400 overflow-hidden">
                      {leaderboard[1].email?.[0].toUpperCase()}
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">2</div>
                  </div>
                  <div className="w-20 h-20 bg-gray-200 rounded-t-2xl flex flex-col items-center justify-center p-2">
                    <p className="text-[10px] font-black text-gray-600 truncate w-full text-center">{leaderboard[1].email?.split('@')[0]}</p>
                    <p className="text-[10px] font-bold text-gray-500">{leaderboard[1].xp} XP</p>
                  </div>
                </motion.div>

                {/* 1st Place */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <div className="w-18 h-18 bg-secondary-yellow/10 rounded-full border-4 border-secondary-yellow flex items-center justify-center text-2xl font-black text-secondary-yellow overflow-hidden">
                      {leaderboard[0].email?.[0].toUpperCase()}
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-yellow rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white shadow-lg">1</div>
                  </div>
                  <div className="w-24 h-28 bg-secondary-yellow rounded-t-2xl flex flex-col items-center justify-center p-2 shadow-lg shadow-secondary-yellow/20">
                    <p className="text-xs font-black text-white truncate w-full text-center">{leaderboard[0].email?.split('@')[0]}</p>
                    <p className="text-xs font-bold text-white/80">{leaderboard[0].xp} XP</p>
                  </div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-2">
                    <div className="w-12 h-12 bg-orange-50 rounded-full border-4 border-orange-300 flex items-center justify-center text-lg font-black text-orange-400 overflow-hidden">
                      {leaderboard[2].email?.[0].toUpperCase()}
                    </div>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-300 rounded-full flex items-center justify-center text-[8px] text-white font-bold border-2 border-white">3</div>
                  </div>
                  <div className="w-18 h-16 bg-orange-100 rounded-t-2xl flex flex-col items-center justify-center p-2">
                    <p className="text-[10px] font-black text-orange-600 truncate w-full text-center">{leaderboard[2].email?.split('@')[0]}</p>
                    <p className="text-[10px] font-bold text-orange-500">{leaderboard[2].xp} XP</p>
                  </div>
                </motion.div>
              </div>
            )}

            <div className="space-y-2">
              {leaderboard.slice(leaderboard.length >= 3 ? 3 : 0).map((entry, idx) => {
                const isCurrentUser = entry.user_id === user?.id;
                const rank = (leaderboard.length >= 3 ? 3 : 0) + idx + 1;
                
                return (
                  <motion.div 
                    key={entry.user_id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`card flex items-center justify-between p-3 ${isCurrentUser ? 'border-secondary-yellow bg-secondary-yellow/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 flex items-center justify-center font-black text-sm text-gray-400">
                        {rank}
                      </div>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg font-black text-gray-400 border-2 border-white shadow-sm">
                        {entry.email?.[0].toUpperCase() || 'A'}
                      </div>
                      <div>
                        <h4 className="font-black text-text-dark text-sm">
                          {entry.email?.split('@')[0]}
                          {isCurrentUser && <span className="ml-2 text-[8px] bg-secondary-yellow text-white px-1.5 py-0.5 rounded-full">YOU</span>}
                        </h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Level {entry.level || 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-xl border border-gray-100">
                      <Star size={12} className="text-secondary-blue fill-secondary-blue" />
                      <span className="font-black text-gray-600 text-sm">{entry.xp || 0}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
