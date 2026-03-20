import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home,
  Gift,
  Trophy,
  Users,
  User,
  Flame,
  Zap,
  Star,
  ChevronRight,
  CheckCircle2,
  MessageCircle,
  X,
  LogOut,
  Mail,
  Lock,
  ArrowRight,
  Clock,
  Check,
  ChevronDown,
  Trash2,
  Gamepad2,
  Loader2,
  Plus,
  Sparkles,
  Coins,
  HelpCircle,
  Target,
  Brain,
  Lightbulb
} from 'lucide-react';
import { useStore } from './store';
import { getAiTutorResponse } from './services/aiService';
import { fetchLessons, createAndSaveNewLesson, getUserProfile, createUserProfile, fetchUserProgress, saveUserProgress } from './services/lessonService';
import { supabase } from './services/supabase';
import confetti from 'canvas-confetti';
import { AdminPanel } from './components/AdminPanel';
import { RewardsView } from './components/views/RewardsView';
import { LeaderboardView } from './components/views/LeaderboardView';
import { SocialView } from './components/views/SocialView';
import { ProfileView } from './components/views/ProfileView';

// --- Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="bg-primary h-full"
    />
  </div>
);

const BottomNav = ({ activeTab, setActiveTab, isAdmin }: { activeTab: string, setActiveTab: (t: string) => void, isAdmin?: boolean }) => {
  const tabs = [
    { id: 'learn', icon: Home, label: 'Home' },
    { id: 'practice', icon: Gift, label: 'Rewards' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    { id: 'challenges', icon: Users, label: 'Social' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', icon: Lock, label: 'Admin' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-gray-100 px-4 py-2 flex justify-between items-center z-50">
      {tabs.map((item) => (
        <button 
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`nav-item flex-1 ${activeTab === item.id ? 'active' : ''}`}
        >
          <div className={`p-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary/10' : ''}`}>
            <item.icon size={24} strokeWidth={activeTab === item.id ? 3 : 2} />
          </div>
        </button>
      ))}
    </div>
  );
};

const LessonModal = ({ lesson, isOpen, onClose, onStart }: { lesson: any, isOpen: boolean, onClose: () => void, onStart: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-white w-full max-w-md rounded-t-[32px] p-8 pb-12 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-black text-text-dark mb-2">{lesson.title}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-400 font-bold text-sm uppercase tracking-wider">
                <Clock size={16} />
                {lesson.estimated_time ? Math.round(lesson.estimated_time / 60) : 5}m
              </div>
              <div className="flex items-center gap-1 text-primary font-bold text-sm uppercase tracking-wider">
                <Star size={16} fill="currentColor" />
                +{lesson.xp_reward || 10} XP
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          {lesson.description || "Master this concept to unlock the next level in your AI journey!"}
        </p>

        <button 
          onClick={onStart}
          className="btn-primary w-full text-xl"
        >
          Start Lesson
        </button>
      </motion.div>
    </div>
  );
};

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 justify-center">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-text-dark mb-2">AiBO</h1>
        <p className="text-gray-500 font-medium">Your AI Learning Buddy</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-primary outline-none transition-all"
              placeholder="explorer@aibo.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Login' : 'Sign Up')}
          <ArrowRight size={20} />
        </button>
      </form>

      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="mt-8 text-gray-400 font-bold hover:text-primary transition-colors"
      >
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </button>
    </div>
  );
};

const SplashScreen = ({ onNext }: { onNext: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <motion.div 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="mb-8"
    >
    </motion.div>
    <h1 className="text-4xl font-black text-text-dark mb-2">AiBO</h1>
    <p className="text-xl text-gray-500 font-medium mb-12">Learn AI the Fun Way.</p>
    
    <div className="w-full space-y-4">
      <button onClick={onNext} className="btn-primary w-full text-lg">Get Started</button>
    </div>
  </div>
);

const CharacterIntro = ({ onNext }: { onNext: () => void }) => {
  const [step, setStep] = useState(0);
  const messages = [
    "Hey there! 👋",
    "I'm AiBO.",
    "Your AI learning buddy.",
    "I'll help you learn AI through games and challenges."
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <motion.div 
        key={step}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
      </motion.div>

      <button 
        onClick={() => step < messages.length - 1 ? setStep(s => s + 1) : onNext()} 
        className="btn-primary w-full mt-auto"
      >
        {step < messages.length - 1 ? 'Continue' : 'Let\'s Go!'}
      </button>
    </div>
  );
};

const Personalization = ({ onNext }: { onNext: () => void }) => {
  const { user, setGradeLevel } = useStore();
  const [questionIdx, setQuestionIdx] = useState(0);
  const [reaction, setReaction] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any>({});

  const questions = [
    { 
      id: 'grade_level',
      q: "Hey explorer! Which grade are you in? 🎒", 
      options: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"],
      reaction: "Nice! We're starting your AI journey today! 🚀"
    },
    { 
      id: 'ai_knowledge_level',
      q: "How much do you already know about AI? ✨", 
      options: ["😅 Never heard of it!", "🙂 I've seen AI tools.", "😎 I play with AI sometimes.", "🤓 I want to build AI!"],
      reaction: "Awesome choice! Let's build something cool. 🚀"
    },
    { 
      id: 'weekly_time',
      q: "How much time can you spend learning each week? ⏰", 
      options: ["⚡ 10 minutes", "🎮 30 minutes", "🚀 1 hour", "🧠 2+ hours"],
      reaction: "You're going to love this mission! 🎮"
    }
  ];

  const handleOptionClick = async (opt: string) => {
    const q = questions[questionIdx];
    const newAnswers = { ...answers, [q.id]: opt };
    setAnswers(newAnswers);

    if (q.id === 'grade_level') {
      const level = parseInt(opt.split(' ')[1]);
      setGradeLevel(level);
    }

    setReaction(q.reaction);
    setTimeout(async () => {
      setReaction(null);
      if (questionIdx < questions.length - 1) {
        setQuestionIdx(i => i + 1);
      } else {
        // Save profile to Supabase
        if (user) {
          await createUserProfile({
            user_id: user.id,
            email: user.email || '',
            grade_level: parseInt(newAnswers.grade_level.split(' ')[1]),
            ai_knowledge_level: newAnswers.ai_knowledge_level,
            weekly_time: parseInt(newAnswers.weekly_time.split(' ')[1]) || 1
          });
        }
        onNext();
      }
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="mb-8">
        <ProgressBar progress={((questionIdx + 1) / questions.length) * 100} />
      </div>
      
      <AnimatePresence mode="wait">
        {reaction ? (
          <motion.div 
            key="reaction"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center"
          >
          </motion.div>
        ) : (
          <motion.div 
            key={questionIdx}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="flex-1"
          >
            <div className="mb-8 flex justify-center">
            </div>
            <h2 className="text-3xl font-black text-text-dark mb-8">{questions[questionIdx].q}</h2>
            <div className="space-y-4">
              {questions[questionIdx].options.map(opt => (
                <button 
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  className="w-full p-5 text-left bg-white border-2 border-gray-100 rounded-2xl font-bold text-lg hover:border-primary hover:bg-primary/5 transition-all shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SectionHeader = ({ section }: { section: any }) => (
  <div className="px-4 mb-12">
    <div className="bg-primary rounded-[24px] p-6 shadow-[0_6px_0_0_#46A302] border-2 border-white/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="relative z-10">
        <div className="text-white/80 font-black text-xs uppercase tracking-[0.2em] mb-1">
          Section {section.section_order || 1}, Unit {section.unit_number || 1}
        </div>
        <h2 className="text-white font-black text-2xl leading-tight">
          {section.title}
        </h2>
      </div>
    </div>
  </div>
);

const PathNode = ({ 
  lesson, 
  index, 
  isUnlocked, 
  isCompleted, 
  isActive, 
  onClick,
  type = 'lesson'
}: any) => {
  // Zig-zag offsets: center, left, right, left, right, center
  const xOffsets = [0, -60, 60, -60, 60, 0];
  const xOffset = xOffsets[index % xOffsets.length];
  
  const getIcon = () => {
    if (type === 'chest') return <Gift size={32} className="text-white" />;
    if (type === 'character') return <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl">🤖</div>;
    if (type === 'milestone') return <Trophy size={32} className="text-white" />;
    
    if (isCompleted) return <Check size={36} className="text-white" strokeWidth={4} />;
    if (!isUnlocked) return <Lock size={28} className="text-gray-400" />;
    return <Star size={36} fill="white" className="text-white" />;
  };

  const isLocked = !isUnlocked;

  return (
    <div 
      className="relative flex flex-col items-center py-8" 
      style={{ transform: `translateX(${xOffset}px)` }}
    >
      {/* Active Label */}
      {isActive && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-6 bg-white border-2 border-gray-100 text-primary font-black px-4 py-1.5 rounded-xl shadow-md z-20 text-[10px] uppercase tracking-[0.2em] whitespace-nowrap"
        >
          START
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-gray-100 rotate-45"></div>
        </motion.div>
      )}

      <div className="relative">
        {/* Progress Ring - Animated independently with zoom effect */}
        {isActive && (
          <motion.div 
            className="absolute inset-0 -m-4 pointer-events-none"
            animate={{
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <svg className="w-full h-full -rotate-90 drop-shadow-md">
              {/* Outer white border for distinction */}
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                fill="none"
                stroke="white"
                strokeWidth="12"
              />
              <circle
                cx="50%"
                cy="50%"
                r="42%"
                fill="none"
                stroke="#E5E5E5"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <motion.circle
                cx="50%"
                cy="50%"
                r="42%"
                fill="none"
                stroke="#58CC02"
                strokeWidth="8"
                strokeDasharray="100 100"
                initial={{ strokeDashoffset: 100 }}
                animate={{ strokeDashoffset: 30 }} // 70% progress
                strokeLinecap="round"
                pathLength="100"
              />
            </svg>
          </motion.div>
        )}

        <motion.button
          whileHover={isUnlocked ? { scale: 1.05 } : {}}
          whileTap={isUnlocked ? { scale: 0.95 } : {}}
          onClick={() => isUnlocked && onClick(lesson)}
          className={`
            relative w-20 h-20 rounded-full flex items-center justify-center transition-all z-10
            ${isCompleted ? 'bg-primary shadow-[0_6px_0_0_#46A302]' : 
              isActive ? 'bg-primary shadow-[0_6px_0_0_#46A302]' : 
              'bg-gray-200 shadow-[0_6px_0_0_#E5E5E5]'}
          `}
        >
          <div className="relative z-10 flex items-center justify-center">
            {getIcon()}
          </div>
        </motion.button>
      </div>

      {/* Lesson Title Tag */}
      {!isActive && !isLocked && (
        <div className="mt-4 bg-white/50 px-3 py-1 rounded-lg">
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{lesson.title}</span>
        </div>
      )}
    </div>
  );
};

const HomeScreen = ({ onStartLesson }: { onStartLesson: (lesson: any) => void }) => {
  const { xp, coins, streak, energy, completedLessons, gradeLevel, user } = useStore();
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLessons();
      setSections(data || []);
    } catch (error) {
      console.error("Error loading lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [gradeLevel]);

  // Determine if a lesson is unlocked
  const isLessonUnlocked = (sectionIdx: number, lessonIdx: number) => {
    if (sectionIdx === 0 && lessonIdx === 0) return true;
    
    // If it's the first lesson of a section, check the last lesson of the previous section
    if (lessonIdx === 0) {
      const prevSection = sections[sectionIdx - 1];
      if (!prevSection || !prevSection.lessons) return false;
      const lastLessonOfPrevSection = prevSection.lessons[prevSection.lessons.length - 1];
      return completedLessons.includes(lastLessonOfPrevSection.id);
    }
    
    // Otherwise check the previous lesson in the same section
    const prevLesson = sections[sectionIdx].lessons[lessonIdx - 1];
    return completedLessons.includes(prevLesson.id);
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* 1. TOP STATUS BAR */}
      <div className="bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-50 border-b-2 border-gray-100">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇺🇸</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <motion.div
              animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flame size={22} className={`${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'}`} />
            </motion.div>
            <span className={`text-lg font-black ${streak > 0 ? 'text-orange-500' : 'text-gray-400'}`}>{streak}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Star size={22} className="text-secondary-yellow fill-secondary-yellow" />
            <span className="text-lg font-black text-gray-500">{xp}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Zap size={22} className="text-secondary-blue fill-secondary-blue" />
            <span className="text-lg font-black text-gray-500">{energy}</span>
          </div>
        </div>
        
        <div className="w-10 h-10 bg-secondary-purple rounded-full flex items-center justify-center text-white font-black shadow-sm border-2 border-white">
          {user?.email?.[0].toUpperCase() || 'A'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Loading Path...</p>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            {sections.map((section: any, sIdx: number) => (
              <div key={section.id} className="mb-16">
                <SectionHeader section={section} />

                <div className="flex flex-col items-center relative px-6">
                  {/* Roadmap SVG Path */}
                  <svg 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full -z-10 pointer-events-none overflow-visible"
                    style={{ height: (section.lessons?.length || 0) * 140 }}
                    viewBox={`-200 0 400 ${(section.lessons?.length || 0) * 140}`}
                  >
                    {section.lessons?.map((_: any, idx: number) => {
                      if (idx === section.lessons.length - 1) return null;
                      
                      const xOffsets = [0, -60, 60, -60, 60, 0];
                      const startX = xOffsets[idx % xOffsets.length];
                      const startY = idx * 140 + 48;
                      const endX = xOffsets[(idx + 1) % xOffsets.length];
                      const endY = (idx + 1) * 140 + 48;
                      
                      const cp1X = startX;
                      const cp1Y = startY + 70;
                      const cp2X = endX;
                      const cp2Y = endY - 70;

                      const isCompleted = completedLessons.includes(section.lessons[idx].id);
                      const isNextCompleted = completedLessons.includes(section.lessons[idx+1].id);
                      const pathColor = isCompleted && isNextCompleted ? '#58CC02' : '#E5E7EB';

                      return (
                        <path
                          key={`path-${section.id}-${idx}`}
                          d={`M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`}
                          fill="none"
                          stroke={pathColor}
                          strokeWidth="16"
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>

                  {section.lessons?.map((lesson: any, lIdx: number) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isUnlocked = isLessonUnlocked(sIdx, lIdx);
                    const isActive = isUnlocked && !isCompleted;
                    
                    // Inject some special nodes for variety
                    let type = 'lesson';
                    if (lIdx === 3) type = 'chest';
                    if (lIdx === 6) type = 'character';

                    return (
                      <PathNode
                        key={lesson.id}
                        lesson={lesson}
                        index={lIdx}
                        isUnlocked={isUnlocked}
                        isCompleted={isCompleted}
                        isActive={isActive}
                        type={type}
                        onClick={setSelectedLesson}
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold">No sections found. Check back later!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonModal 
            lesson={selectedLesson}
            isOpen={!!selectedLesson}
            onClose={() => setSelectedLesson(null)}
            onStart={() => {
              onStartLesson(selectedLesson);
              setSelectedLesson(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const LessonScreen = ({ lesson, onComplete, onExit }: { lesson: any, onComplete: () => void, onExit: () => void }) => {
  const [step, setStep] = useState(0);
  const [showAiTutor, setShowAiTutor] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [userGuess, setUserGuess] = useState<string | null>(null);
  const [interactionDone, setInteractionDone] = useState(false);
  const [revealStage, setRevealStage] = useState<'buildup' | 'main' | 'breakdown' | 'final'>('buildup');
  const [breakdownStep, setBreakdownStep] = useState(0);

  // Combine steps and quizzes into a single sequence with de-duplication
  const lessonItems = useMemo(() => {
    const rawItems = [
      ...(lesson.steps || []),
      ...(lesson.quizzes || []).map((q: any) => ({ ...q, type: 'quiz' }))
    ];
    
    // De-duplicate items that have the same question or content text
    const seen = new Set();
    return rawItems.filter(item => {
      const text = (item.question || item.content || '').trim();
      if (!text) return true;
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    });
  }, [lesson]);

  const handleNext = () => {
    // Handle Reveal Experience Stages
    if (isCenteredView && (currentItem.type === 'reveal' || currentItem.type === 'explanation')) {
      const lines = currentItem.content.split('\n').slice(1).filter(l => l.trim());
      
      if (revealStage === 'buildup') {
        setRevealStage('main');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF4500']
        });
        return;
      }
      
      if (revealStage === 'main') {
        if (lines.length > 0) {
          setRevealStage('breakdown');
          setBreakdownStep(0);
        } else {
          setRevealStage('final');
        }
        return;
      }
      
      if (revealStage === 'breakdown') {
        if (breakdownStep < lines.length - 1) {
          setBreakdownStep(s => s + 1);
          return;
        } else {
          setRevealStage('final');
          return;
        }
      }
      
      if (revealStage === 'final') {
        // Fall through to normal progression
      } else {
        setRevealStage('final');
        return;
      }
    }

    if (step < lessonItems.length - 1) {
      setStep(s => s + 1);
      setUserGuess(null);
      setInteractionDone(false);
      setRevealStage('buildup');
      setBreakdownStep(0);
    } else {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#4ADE80', '#38BDF8', '#FACC15']
      });
      onComplete();
    }
  };

  const currentItem = lessonItems[step];

  const isCenteredView = ['hook', 'quiz', 'challenge', 'guess', 'reveal', 'question', 'prediction', 'fun_fact'].includes(currentItem.type) || 
    (currentItem.type === 'explanation' && currentItem.content.split('\n').length > 1);

  const askAi = async () => {
    setLoadingAi(true);
    const context = (currentItem.type === 'quiz' || currentItem.type === 'question' || currentItem.type === 'challenge' || currentItem.type === 'prediction') 
      ? `Question/Prompt: ${currentItem.question || currentItem.content}. Options: ${currentItem.options?.join(', ')}` 
      : `Concept: ${lesson.concept}. Content: ${currentItem.content}`;
    const res = await getAiTutorResponse(`Explain this simply for a student: ${context}`);
    setAiMessage(res);
    setLoadingAi(false);
    setShowAiTutor(true);
  };

  if (!currentItem) return null;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4 z-20 bg-white border-b border-gray-50">
        <button onClick={onExit} className="p-1 hover:bg-gray-100 rounded-full transition-colors shrink-0">
          <X size={20} className="text-gray-300" strokeWidth={3} />
        </button>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / lessonItems.length) * 100}%` }}
            className="h-full bg-primary relative"
          >
            <div className="absolute top-0.5 left-1 right-1 h-0.5 bg-white/30 rounded-full"></div>
          </motion.div>
        </div>
        <div className="text-[10px] font-black text-gray-400 whitespace-nowrap shrink-0">
          {step + 1} / {lessonItems.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-6 py-2 flex flex-col scrollbar-hide">
          <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="flex-1 flex flex-col min-h-full"
          >
            {/* Centered Layout - Hooks & Questions */}
            {isCenteredView && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                
                <div className="space-y-6 w-full max-w-sm">
                  {currentItem.type === 'hook' ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-primary p-10 rounded-[48px] shadow-2xl border-4 border-white/20 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <div className="text-6xl mb-6">👋</div>
                      <h3 className="text-[10px] font-black text-white/70 uppercase tracking-[0.4em] mb-4">The Concept</h3>
                      <h2 className="text-2xl font-black text-white leading-tight">
                        {currentItem.content}
                      </h2>
                    </motion.div>
                  ) : currentItem.type === 'fun_fact' ? (
                    <motion.div 
                      initial={{ rotate: -2, scale: 0.9, opacity: 0 }}
                      animate={{ rotate: 0, scale: 1, opacity: 1 }}
                      className="bg-secondary-yellow p-10 rounded-[48px] shadow-xl border-4 border-white/30 relative overflow-hidden w-full"
                    >
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                      <div className="text-5xl mb-4">🤯</div>
                      <h3 className="text-xs font-black text-yellow-700 uppercase tracking-[0.3em] mb-4">Did you know?</h3>
                      <p className="text-xl font-black text-text-dark leading-tight">
                        {currentItem.content.includes('\n') ? currentItem.content.split('\n')[1] : currentItem.content}
                      </p>
                    </motion.div>
                  ) : currentItem.type === 'reveal' || (currentItem.type === 'explanation' && currentItem.content.split('\n').length > 1) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {revealStage === 'buildup' && (
                          <motion.div 
                            key="buildup"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.1, opacity: 0, filter: 'blur(20px)' }}
                            className="w-full max-w-sm flex flex-col items-center justify-center gap-10 group relative"
                          >
                            <motion.div 
                              animate={{ 
                                y: [0, -15, 0],
                                rotate: [0, -5, 5, -5, 0]
                              }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="text-[100px] relative z-10"
                            >
                              🤖
                            </motion.div>
                            <div className="text-center relative z-10">
                              <h2 className="text-2xl font-black text-gray-800 mb-3 uppercase tracking-widest">Wait... something interesting!</h2>
                              <p className="text-primary text-sm font-black uppercase tracking-[0.2em] animate-pulse">Click the button to reveal 🎁</p>
                            </div>
                          </motion.div>
                        )}

                        {revealStage === 'main' && (
                          <motion.div 
                            key="main"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="w-full max-w-sm text-center space-y-8 relative"
                          >
                            <div className="text-6xl mb-4">
                              ✨
                            </div>
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">How it works</h3>
                            <h2 className="text-2xl font-black text-text-dark leading-tight">
                              {currentItem.content.split('\n')[0]}
                            </h2>
                          </motion.div>
                        )}

                        {revealStage === 'breakdown' && (
                          <motion.div 
                            key="breakdown"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full max-w-sm"
                          >
                            {(() => {
                              const lines = currentItem.content.split('\n').slice(1).filter(l => l.trim());
                              const currentLine = lines[breakdownStep] || "";
                              
                              return (
                                <div className="flex flex-col items-center text-center space-y-10 relative overflow-hidden">
                                  {/* Mascot / Icon */}
                                  <motion.div 
                                    key={`icon-${breakdownStep}`}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl"
                                  >
                                    {breakdownStep % 2 === 0 ? '🧠' : '✨'}
                                  </motion.div>
 
                                  {/* Content */}
                                  <motion.div 
                                    key={`content-${breakdownStep}`}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="space-y-4"
                                  >
                                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">How it works</h3>
                                    {currentLine.includes(':') && (
                                      <h2 className="text-2xl font-black text-text-dark leading-tight">
                                        {currentLine.split(':')[0].trim()}
                                      </h2>
                                    )}
                                    <p className="text-lg font-bold text-gray-500 leading-relaxed">
                                      {currentLine.includes(':') 
                                        ? currentLine.split(':').slice(1).join(':').trim() 
                                        : (currentLine.startsWith('•') ? currentLine.substring(1).trim() : currentLine)}
                                    </p>
                                  </motion.div>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}

                        {revealStage === 'final' && (
                          <motion.div 
                            key="final"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="w-full max-w-sm text-center space-y-8"
                          >
                            <div className="relative inline-block">
                              <motion.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-7xl"
                              >
                                🚀
                              </motion.div>
                              <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-lg border-4 border-white">
                                ✨
                              </div>
                            </div>
                            <h2 className="text-2xl font-black text-text-dark">You're crushing it!</h2>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="relative overflow-hidden">
                        {/* Type Label */}
                        <div className="flex items-center gap-3 mb-8">
                          <div className={`p-2.5 rounded-2xl ${
                            currentItem.type === 'quiz' ? 'bg-primary/10 text-primary' :
                            currentItem.type === 'challenge' ? 'bg-orange-100 text-orange-500' :
                            currentItem.type === 'question' ? 'bg-purple-100 text-purple-500' :
                            currentItem.type === 'prediction' ? 'bg-blue-100 text-blue-500' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {currentItem.type === 'quiz' ? <Trophy size={24} /> :
                             currentItem.type === 'challenge' ? <Target size={24} /> :
                             currentItem.type === 'question' ? <Brain size={24} /> :
                             currentItem.type === 'prediction' ? <Sparkles size={24} /> :
                             <HelpCircle size={24} />}
                          </div>
                          <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">
                            {currentItem.type === 'quiz' ? 'Final Quiz' :
                             currentItem.type === 'challenge' ? 'Mini Challenge' :
                             currentItem.type === 'question' ? 'How it works?' :
                             currentItem.type === 'prediction' ? "What's Next?" :
                             'Quick Guess'}
                          </span>
                        </div>

                        <h2 className="text-2xl font-black text-text-dark leading-tight relative z-10">
                          {currentItem.question || currentItem.content}
                        </h2>
                      </div>

                      {interactionDone && userGuess && (
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className={`p-4 rounded-2xl font-black text-center ${
                            userGuess === currentItem.correct 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-red-50 text-red-500'
                          }`}
                        >
                          {userGuess === currentItem.correct 
                            ? (currentItem.type === 'prediction' ? "Great guess! Let's see if you're right... 🔮" : 
                               currentItem.type === 'challenge' ? "Mission Accomplished! You're a pro! 🏆" :
                               "Let’s gooo 🔥 you got it!")
                            : (currentItem.type === 'prediction' ? "Interesting! Let's see what actually happens... 👀" :
                               "Close 😅 let’s understand this…")}
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 gap-3">
                        {currentItem.options?.map((opt: string, idx: number) => (
                          <motion.button 
                            key={opt}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 * idx }}
                            disabled={interactionDone}
                            onClick={() => {
                              setUserGuess(opt);
                              setInteractionDone(true);
                              if (opt === currentItem.correct) {
                                confetti({
                                  particleCount: 40,
                                  spread: 50,
                                  origin: { y: 0.8 },
                                  colors: ['#22C55E', '#4ADE80']
                                });
                              }
                            }}
                            className={`group relative w-full p-4 text-left border-2 rounded-2xl font-black text-base transition-all active:translate-y-1 active:shadow-none
                              ${userGuess === opt 
                                ? (opt === currentItem.correct 
                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_4px_0_0_#46A302]' 
                                    : 'bg-red-50 border-red-200 text-red-500 shadow-[0_4px_0_0_#FF4B4B]') 
                                : (interactionDone && opt === currentItem.correct 
                                    ? 'bg-primary/5 border-primary/30 text-primary/70' 
                                    : 'bg-white border-gray-200 text-gray-600 shadow-[0_4px_0_0_#E5E5E5] hover:border-primary/50')}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black border-2 transition-colors
                                ${userGuess === opt 
                                  ? (opt === currentItem.correct ? 'bg-primary text-white border-primary' : 'bg-red-500 text-white border-red-500') 
                                  : 'bg-gray-50 text-gray-400 border-gray-100 group-hover:border-primary/30'}
                              `}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className="flex-1">{opt}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content Layout - Stepwise Reveal */}
            {!isCenteredView && (
              <div className="flex-1 flex flex-col pt-2">
                <div className="flex-1 flex flex-col">
                  {/* Default Content (Stepwise) */}
                  {!['hook', 'quiz', 'challenge', 'guess', 'reveal', 'question', 'prediction', 'fun_fact'].includes(currentItem.type) && (
                    <div className="flex-1 flex flex-col pt-2">
                      <div className="relative flex-1 flex flex-col">
                        {/* 1. SMALL HEADER (emotion trigger) */}
                        <motion.div 
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="flex items-center gap-4 mb-4 relative z-10"
                        >
                          <div className="text-3xl">
                            🤖
                          </div>
                          <div>
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none mb-1.5">
                              {currentItem.type === 'explanation' ? '🎉 AHA MOMENT' : '💡 QUICK LESSON'}
                            </h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {currentItem.title || "Let's Learn!"}
                            </p>
                          </div>
                        </motion.div>

                        <div className="space-y-8 flex-1 flex flex-col justify-center">
                          {/* 2. MAIN IDEA (big bold text) */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                          >
                            <h2 className="text-xl md:text-2xl font-black text-text-dark leading-[1.1] tracking-tight">
                              {currentItem.content.split('\n')[0]}
                            </h2>
                          </motion.div>

                          {/* 3. SUPPORTING LINE & 4. HIGHLIGHT POINTS */}
                          <div className="space-y-6">
                            {currentItem.content.split('\n').slice(1).map((line: string, i: number) => {
                              const isSupporting = i === 0;
                              return (
                                <motion.div 
                                  key={i}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: 0.4 + (i * 0.15) }}
                                  className={`flex gap-4 ${isSupporting ? 'items-start' : 'items-center'}`}
                                >
                                  {!isSupporting && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                                  )}
                                  <p className={`${
                                    isSupporting 
                                      ? 'text-base font-bold text-gray-500 leading-relaxed italic' 
                                      : 'text-sm font-bold text-gray-600'
                                  }`}>
                                    {line.startsWith('•') ? line.substring(1).trim() : line}
                                  </p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col bg-white border-t border-gray-50 z-20 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
          <div className="p-8 flex gap-4">
            <button 
              onClick={askAi}
              className="w-14 h-14 bg-secondary-purple text-white rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#9333EA] active:translate-y-1 active:shadow-none transition-all shrink-0"
            >
              {loadingAi ? <Loader2 className="animate-spin" /> : <MessageCircle size={28} />}
            </button>
            <button 
              onClick={handleNext} 
              disabled={['quiz', 'challenge', 'guess', 'question', 'prediction'].includes(currentItem.type) && !interactionDone}
              className={`btn-primary flex-1 text-lg py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale`}
            >
            {(() => {
              if (isCenteredView && (currentItem.type === 'reveal' || currentItem.type === 'explanation')) {
                if (revealStage === 'buildup') return 'Reveal 🎁';
                if (revealStage === 'main' || revealStage === 'breakdown') return 'Got it →';
                if (revealStage === 'final') return 'Continue →';
              }
              return step === lessonItems.length - 1 ? 'Finish Lesson 🎉' : 'Continue →';
            })()}
          </button>
        </div>
      </div>
    </div>

      {/* AI Tutor Modal */}
      <AnimatePresence>
        {showAiTutor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm flex items-end justify-center p-4"
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl border-t-4 border-primary"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-black text-2xl text-text-dark">AiBO Tutor</h3>
                    <p className="text-xs text-primary font-black uppercase tracking-widest">Your AI Sidekick</p>
                  </div>
                </div>
                <button onClick={() => setShowAiTutor(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-300" strokeWidth={3} />
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl mb-8 border-2 border-gray-100">
                <p className="text-lg font-bold text-gray-600 leading-relaxed">{aiMessage}</p>
              </div>
              <button onClick={() => setShowAiTutor(false)} className="btn-primary w-full text-lg uppercase tracking-widest">Got it!</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StreakModal = ({ streak, isOpen, onClose }: { streak: number, isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-[48px] p-10 text-center shadow-2xl relative overflow-hidden"
      >
        {/* Background Sparkles */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-50"
          />
        </div>

        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-8xl mb-4"
              >
                🔥
              </motion.div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -top-2 -right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg border-4 border-white"
              >
                {streak}
              </motion.div>
            </div>
          </motion.div>

          <motion.h2 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-black text-text-dark mb-4"
          >
            {streak} Day Streak!
          </motion.h2>

          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-500 font-bold mb-10 leading-relaxed"
          >
            You're on fire! Keep learning every day to build your knowledge.
          </motion.p>

          <motion.button 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={onClose}
            className="btn-primary w-full text-xl py-4"
          >
            Continue →
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { user, setUser, onboarded, setOnboarded, addXp, addCoins, streak, completeLesson, setGradeLevel, reset, isAdmin, setAdmin } = useStore();
  const [screen, setScreen] = useState<'auth' | 'splash' | 'intro' | 'personalize' | 'main' | 'lesson'>('auth');
  const [activeTab, setActiveTab] = useState('learn');
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streak);

  useEffect(() => {
    if (streak > prevStreak) {
      setShowStreakModal(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6321', '#FFD700', '#FF4500']
      });
    }
    setPrevStreak(streak);
  }, [streak]);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkProfile(session.user);
      } else {
        setInitializing(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkProfile(session.user);
      } else {
        setUser(null);
        reset();
        setScreen('auth');
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (authUser: any) => {
    try {
      const userEmail = authUser.email?.toLowerCase();
      // Hardcoded admin check for the provided email in SQL schema
      const isAdminEmail = userEmail === 'shaurya@aebo.com' || userEmail === 'sapanajadhav3510@gmail.com' || userEmail === 'kartavyagatha@gmail.com';
      
      const profile = await getUserProfile(authUser.id);
      
      if (profile) {
        setGradeLevel(profile.grade_level || 6);
        setOnboarded(true);
        const isUserAdmin = profile.role === 'admin' || isAdminEmail;
        setAdmin(isUserAdmin);
        
        // Load progress
        const completed = await fetchUserProgress(authUser.id);
        completed.forEach(id => completeLesson(id));
        
        // If admin, default to admin tab
        if (isUserAdmin) {
          setActiveTab('admin');
        }
        
        setScreen('main');
      } else {
        setAdmin(isAdminEmail);
        if (isAdminEmail) {
          setActiveTab('admin');
        }
        setScreen('splash');
      }
    } catch (err) {
      console.error("Profile check error:", err);
      setScreen('splash');
    } finally {
      setInitializing(false);
    }
  };

  const handleStartLesson = (lesson: any) => {
    setActiveLesson(lesson);
    setScreen('lesson');
  };

  const handleLessonComplete = async () => {
    if (activeLesson && user) {
      completeLesson(activeLesson.id);
      addXp(activeLesson.xp_reward || 20);
      addCoins(activeLesson.coins_reward || 10);
      
      // Save progress to Supabase
      try {
        await saveUserProgress({
          user_id: user.id,
          lesson_id: activeLesson.id,
          completed: true,
          xp_earned: activeLesson.xp_reward || 20
        });
      } catch (err) {
        console.error("Error saving progress:", err);
      }
    }
    setScreen('main');
    setActiveLesson(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (initializing) {
    return (
      <div className="mobile-container items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (activeTab === 'admin' && screen === 'main' && isAdmin) {
    return <AdminPanel onBackToApp={() => setActiveTab('learn')} />;
  }

  return (
    <div className="mobile-container">
      <AnimatePresence mode="wait">
        {screen === 'auth' && <AuthScreen key="auth" />}
        {screen === 'splash' && <SplashScreen key="splash" onNext={() => setScreen('intro')} />}
        {screen === 'intro' && <CharacterIntro key="intro" onNext={() => setScreen('personalize')} />}
        {screen === 'personalize' && <Personalization key="personalize" onNext={() => { setOnboarded(true); setScreen('main'); }} />}
        
        {screen === 'main' && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full">
            {activeTab === 'learn' && <HomeScreen onStartLesson={handleStartLesson} />}
            {activeTab === 'practice' && <RewardsView />}
            {activeTab === 'leaderboard' && <LeaderboardView />}
            {activeTab === 'challenges' && <SocialView />}
            {activeTab === 'profile' && <ProfileView />}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={isAdmin} />
          </motion.div>
        )}

        {screen === 'lesson' && activeLesson && (
          <LessonScreen 
            key="lesson"
            lesson={activeLesson} 
            onComplete={handleLessonComplete}
            onExit={() => setScreen('main')}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStreakModal && (
          <StreakModal 
            streak={streak} 
            isOpen={showStreakModal} 
            onClose={() => setShowStreakModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
