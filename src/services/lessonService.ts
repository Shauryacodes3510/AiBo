import { supabase } from './supabase';
import { generateLesson } from './aiService';

export interface Lesson {
  id?: string;
  title: string;
  mission_title: string;
  concept: string;
  difficulty: string;
  grade_level: number;
  xp_reward: number;
  coins_reward: number;
  estimated_time: number;
  steps: LessonStep[];
}

export interface LessonStep {
  id?: string;
  lesson_id?: string;
  type: 'hook' | 'guess' | 'reveal' | 'challenge' | 'quiz' | 'observation' | 'interaction' | 'reward' | 'question' | 'prediction' | 'fun_fact' | 'explanation';
  title: string;
  content: string;
  step_options?: { option_text: string; is_correct: boolean }[];
  question?: string;
  options?: string[];
  correct?: string;
  explanation?: string;
  step_order: number;
}

export const fetchLessons = async () => {
  console.log(`🔍 Fetching sections and lessons...`);
  try {
    const { data, error } = await supabase
      .from("sections")
      .select(`
        *,
        lessons(
          *,
          lesson_steps(
            *,
            step_options(*)
          ),
          quizzes(
            *,
            quiz_options(*)
          )
        )
      `)
      .order("section_order", { ascending: true });

    if (error) throw error;

    // Sort lessons and steps on frontend
    const sortedData = data.map((section: any) => ({
      ...section,
      lessons: (section.lessons || [])
        .sort((a: any, b: any) => a.lesson_order - b.lesson_order)
        .map((lesson: any) => ({
          ...lesson,
          steps: (lesson.lesson_steps || [])
            .sort((a: any, b: any) => a.step_order - b.step_order)
            .map((step: any) => ({
              ...step,
              type: step.step_type,
              options: step.step_options?.map((o: any) => o.option_text),
              correct: step.step_options?.find((o: any) => o.is_correct)?.option_text
            })),
          quizzes: (lesson.quizzes || [])
            .sort((a: any, b: any) => a.question_order - b.question_order)
            .map((quiz: any) => ({
              ...quiz,
              options: quiz.quiz_options?.map((o: any) => o.option_text),
              correct: quiz.quiz_options?.find((o: any) => o.is_correct)?.option_text
            }))
        }))
    }));

    return sortedData;
  } catch (err) {
    console.error("❌ Error in fetchLessons:", err);
    throw err;
  }
};

export const createAndSaveNewLesson = async (topic: string, gradeLevel: number, difficulty: string) => {
  return await generateLesson(topic, gradeLevel, difficulty);
};

export interface UserProfile {
  user_id: string;
  email?: string;
  grade_level: number;
  ai_knowledge_level: string;
  weekly_time: number;
  role?: 'admin' | 'student';
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createUserProfile = async (profile: UserProfile) => {
  const { error } = await supabase
    .from('user_profiles')
    .insert([{
      ...profile,
      role: profile.role || 'student'
    }]);
  if (error) throw error;
};

export const fetchLeaderboard = async () => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, email, xp, level')
    .order('xp', { ascending: false })
    .limit(20);
  
  if (error) throw error;
  return data;
};

export const fetchGlobalActivity = async () => {
  const { data, error } = await supabase
    .from('user_progress')
    .select(`
      *,
      lessons (title)
    `)
    .order('completed_at', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data;
};

export const saveUserProgress = async (progress: any) => {
  const { error } = await supabase
    .from('user_progress')
    .insert([progress]);
  if (error) throw error;
};

export const fetchUserProgress = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('completed', true);
  
  if (error) throw error;
  return data.map(p => p.lesson_id);
};
