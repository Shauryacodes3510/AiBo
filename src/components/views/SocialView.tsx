import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Heart, Share2, Loader2, Sparkles } from 'lucide-react';
import { fetchGlobalActivity } from '../../services/lessonService';

export const SocialView = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGlobalActivity();
        setActivities(data || []);
      } catch (error) {
        console.error("Error loading activity:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-24">
      <div className="p-3 bg-secondary-blue/10 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-text-dark">Social Feed</h2>
          <p className="text-gray-500 font-bold text-[10px]">See what other explorers are learning!</p>
        </div>
        <div className="w-10 h-10 bg-secondary-blue rounded-xl flex items-center justify-center text-white shadow-lg">
          <Users size={20} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-secondary-blue" size={40} />
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Loading Activity...</p>
          </div>
        ) : (
          activities.map((activity, idx) => (
            <motion.div 
              key={activity.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-3 border-2 border-gray-50"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-8 h-8 bg-secondary-purple rounded-full flex items-center justify-center text-white font-black text-base border-2 border-white shadow-sm">
                  {activity.user_id?.[0].toUpperCase() || 'A'}
                </div>
                <div>
                  <h4 className="font-black text-text-dark text-xs">Explorer {activity.user_id?.slice(0, 5)}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    {new Date(activity.completed_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl mb-2.5 border border-gray-100">
                <p className="text-gray-600 font-bold text-xs">
                  Just completed the mission: <span className="text-primary">"{activity.lessons?.title || 'AI Basics'}"</span> 🚀
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-primary text-[9px] font-black uppercase">
                    <Sparkles size={10} />
                    +{activity.xp_earned} XP
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-400">
                <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                  <Heart size={16} />
                  <span className="text-[10px] font-black">24</span>
                </button>
                <button className="flex items-center gap-1 hover:text-secondary-blue transition-colors">
                  <MessageCircle size={16} />
                  <span className="text-[10px] font-black">3</span>
                </button>
                <button className="flex items-center gap-1 hover:text-primary transition-colors ml-auto">
                  <Share2 size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}

        {!loading && activities.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
              <Sparkles size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-400">No activity yet</h3>
            <p className="text-gray-500 font-medium text-sm">Be the first to complete a mission!</p>
          </div>
        )}
      </div>
    </div>
  );
};
