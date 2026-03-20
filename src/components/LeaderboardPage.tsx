import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Star, Crown, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { supabase } from '../services/supabase';

export const LeaderboardPage = () => {
  const { user, xp } = useStore();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      setLoading(true);
      try {
        // In a real app, we'd fetch from a 'leaderboard' view or aggregate user_progress
        // For now, let's mock some data but try to fetch real user profiles if possible
        const { data: profiles, error } = await supabase
          .from('user_profiles')
          .select('user_id, email')
          .limit(10);

        if (error) throw error;

        const mockLeaders = (profiles || []).map((p, i) => ({
          id: p.user_id,
          name: p.email?.split('@')[0] || `Explorer ${i + 1}`,
          xp: 1500 - (i * 120),
          rank: i + 1,
          isMe: p.user_id === user?.id
        }));

        // Add current user if not in top 10
        if (user && !mockLeaders.find(l => l.id === user.id)) {
          mockLeaders.push({
            id: user.id,
            name: user.email?.split('@')[0] || 'Me',
            xp: xp,
            rank: 42, // Mock rank
            isMe: true
          });
        }

        setLeaders(mockLeaders.sort((a, b) => b.xp - a.xp));
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaders();
  }, [user, xp]);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      <div className="bg-primary p-8 text-center text-white rounded-b-[48px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <Trophy size={200} className="absolute -top-10 -left-10 rotate-12" />
          <Star size={100} className="absolute bottom-0 right-0 -rotate-12" />
        </div>
        
        <Crown size={48} className="mx-auto mb-4 text-yellow-300 fill-yellow-300" />
        <h2 className="text-3xl font-black mb-2">Leaderboard</h2>
        <p className="font-bold opacity-80">Top AI Explorers this week</p>
      </div>

      <div className="p-6 -mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Ranking Explorers...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, idx) => (
              <motion.div 
                key={leader.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`card flex items-center gap-4 p-4 ${leader.isMe ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="w-10 text-center font-black text-xl text-gray-400">
                  {leader.rank <= 3 ? (
                    <Medal className={leader.rank === 1 ? 'text-yellow-400' : leader.rank === 2 ? 'text-gray-400' : 'text-amber-600'} size={28} />
                  ) : (
                    leader.rank
                  )}
                </div>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-xl shadow-sm
                  ${leader.rank === 1 ? 'bg-yellow-400' : leader.rank === 2 ? 'bg-gray-300' : leader.rank === 3 ? 'bg-amber-600' : 'bg-secondary-purple'}
                `}>
                  {leader.name[0].toUpperCase()}
                </div>

                <div className="flex-1">
                  <h4 className="font-black text-text-dark flex items-center gap-2">
                    {leader.name}
                    {leader.isMe && <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase">You</span>}
                  </h4>
                  <div className="flex items-center gap-1 text-gray-400 font-bold text-xs">
                    <Star size={12} className="fill-gray-400" />
                    {leader.xp} XP
                  </div>
                </div>

                {leader.rank === 1 && (
                  <div className="bg-yellow-100 p-2 rounded-xl">
                    <Crown size={20} className="text-yellow-500" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
