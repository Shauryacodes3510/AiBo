import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Sparkles, 
  Layers, 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  ChevronRight, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { supabase } from '../services/supabase';

// --- Types ---

interface Section {
  id: string;
  title: string;
  description: string;
  section_order: number;
}

interface Lesson {
  id: string;
  section_id: string;
  title: string;
  concept: string;
  description: string;
  lesson_order: number;
  xp_reward: number;
  estimated_time: number;
  difficulty: string;
  created_at: string;
}

interface LessonStep {
  id?: string;
  lesson_id?: string;
  step_order: number;
  step_type: 'hook' | 'story' | 'guess' | 'reveal' | 'challenge';
  content: string;
  step_options?: StepOption[];
}

interface StepOption {
  id?: string;
  step_id?: string;
  option_text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id?: string;
  lesson_id?: string;
  question: string;
  question_order: number;
  quiz_options: QuizOption[];
}

interface QuizOption {
  id?: string;
  quiz_id?: string;
  option_text: string;
  is_correct: boolean;
}

// --- Sub-components ---

const DashboardView = ({ stats, recentLessons, recentActivity }: any) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Lessons', value: stats.totalLessons, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
          { label: 'Completed Lessons', value: stats.totalCompletedLessons, icon: CheckCircle2, color: 'text-purple-500', bg: 'bg-purple-50' },
          { label: 'XP Distributed', value: stats.totalXpDistributed, icon: Sparkles, color: 'text-yellow-500', bg: 'bg-yellow-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-black text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-black mb-3 text-gray-800">Recent Lessons</h3>
          <div className="space-y-2">
            {recentLessons?.map((lesson: any) => (
              <div key={lesson.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-bold text-gray-800 text-xs">{lesson.title}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">{lesson.concept} • Grade {lesson.grade_level}</p>
                </div>
                <div className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${lesson.lesson_status === 'published' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  {lesson.lesson_status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-base font-black mb-3 text-gray-800">Recent Activity</h3>
          <div className="space-y-2">
            {recentActivity?.map((activity: any) => (
              <div key={activity.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-xs">
                  {activity.user_profiles?.email?.[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-800">
                    <span className="text-primary">{activity.user_profiles?.email}</span> completed a lesson
                  </p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    {new Date(activity.completed_at).toLocaleDateString()} • +{activity.xp_earned} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionsView = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSection, setNewSection] = useState<Partial<Section>>({ title: '', description: '', section_order: 1 });

  const loadSections = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('sections').select('*').order('section_order', { ascending: true });
    if (!error) setSections(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleAdd = async () => {
    if (!newSection.title) return;
    const { error } = await supabase.from('sections').insert([newSection]);
    if (!error) {
      setIsAdding(false);
      setNewSection({ title: '', description: '', section_order: sections.length + 1 });
      loadSections();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section? All lessons in it will be unsectioned.')) return;
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (!error) loadSections();
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-black text-gray-800">Sections</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary py-1 px-2.5 flex items-center gap-1.5 text-[10px]"
        >
          <Plus size={14} /> Add Section
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-3 rounded-xl border-2 border-primary shadow-xl space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <input 
              type="text" 
              placeholder="Section Title" 
              value={newSection.title}
              onChange={e => setNewSection({...newSection, title: e.target.value})}
              className="p-2 bg-gray-50 border border-gray-100 rounded-lg font-bold text-xs"
            />
            <input 
              type="text" 
              placeholder="Description" 
              value={newSection.description}
              onChange={e => setNewSection({...newSection, description: e.target.value})}
              className="p-2 bg-gray-50 border border-gray-100 rounded-lg font-bold text-xs"
            />
            <input 
              type="number" 
              placeholder="Order" 
              value={newSection.section_order}
              onChange={e => setNewSection({...newSection, section_order: parseInt(e.target.value)})}
              className="p-2 bg-gray-50 border border-gray-100 rounded-lg font-bold text-xs"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-2.5 py-1 text-gray-400 font-bold text-[10px]">Cancel</button>
            <button onClick={handleAdd} className="btn-primary px-3 py-1 text-[10px]">Save Section</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={4} className="p-6 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={20} /></td></tr>
            ) : sections.map(s => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 font-black text-primary text-xs">{s.section_order}</td>
                <td className="px-3 py-2 font-bold text-gray-800 text-xs">{s.title}</td>
                <td className="px-3 py-2 text-[10px] text-gray-500">{s.description}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => handleDelete(s.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LessonsListView = ({ onEdit, onPreview }: { onEdit: (l: Lesson) => void, onPreview: (l: Lesson) => void }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const loadLessons = async () => {
    setLoading(true);
    let query = supabase.from('lessons').select('*').order('created_at', { ascending: false });
    
    if (filterGrade !== 'all') query = query.eq('grade_level', parseInt(filterGrade));
    if (filterDifficulty !== 'all') query = query.eq('difficulty', filterDifficulty);
    
    const { data, error } = await query;
    if (!error) setLessons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLessons();
  }, [filterGrade, filterDifficulty]);

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) || 
    l.concept.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (!error) loadLessons();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search lessons..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-medium text-xs"
            />
          </div>
          <select 
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none font-medium text-xs"
          >
            <option value="all">All Grades</option>
            {[6, 7, 8, 9, 10].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select 
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-2.5 py-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none font-medium text-xs"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest">
            <tr>
              <th className="px-3 py-2">Lesson Title</th>
              <th className="px-3 py-2">Concept</th>
              <th className="px-3 py-2">Difficulty</th>
              <th className="px-3 py-2">XP</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center">
                  <Loader2 className="animate-spin text-primary mx-auto" size={20} />
                </td>
              </tr>
            ) : filteredLessons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-6 text-center text-gray-400 font-bold text-xs">
                  No lessons found.
                </td>
              </tr>
            ) : filteredLessons.map(lesson => (
              <tr key={lesson.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 font-bold text-gray-800 text-xs">{lesson.title}</td>
                <td className="px-3 py-2 text-[10px] text-gray-500">{lesson.concept}</td>
                <td className="px-3 py-2">
                  <span className={`px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                    lesson.difficulty === 'beginner' ? 'bg-green-100 text-green-600' :
                    lesson.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {lesson.difficulty}
                  </span>
                </td>
                <td className="px-3 py-2 font-bold text-primary text-xs">+{lesson.xp_reward}</td>
                <td className="px-3 py-2 text-right space-x-1">
                  <button onClick={() => onPreview(lesson)} className="p-1 text-gray-400 hover:text-primary transition-colors"><Eye size={14} /></button>
                  <button onClick={() => onEdit(lesson)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(lesson.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const LessonEditorView = ({ lesson: initialLesson, onCancel, onSave }: { lesson?: Lesson, onCancel: () => void, onSave: () => void }) => {
  const [lesson, setLesson] = useState<Partial<Lesson>>(initialLesson || {
    title: '',
    section_id: '',
    concept: '',
    description: '',
    lesson_order: 1,
    xp_reward: 20,
    estimated_time: 5,
    difficulty: 'beginner'
  });

  const [sections, setSections] = useState<Section[]>([]);
  const [steps, setSteps] = useState<LessonStep[]>([]);
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSections();
    if (initialLesson?.id) {
      loadDetails(initialLesson.id);
    }
  }, [initialLesson]);

  const loadSections = async () => {
    const { data } = await supabase.from('sections').select('*').order('section_order', { ascending: true });
    if (data) setSections(data);
  };

  const loadDetails = async (id: string) => {
    setLoading(true);
    const { data: stepsData } = await supabase.from('lesson_steps').select('*, step_options(*)').eq('lesson_id', id).order('step_order', { ascending: true });
    const { data: quizData } = await supabase.from('quizzes').select('*, quiz_options(*)').eq('lesson_id', id).order('question_order', { ascending: true });
    
    if (stepsData) setSteps(stepsData);
    if (quizData) setQuizzes(quizData);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!lesson.section_id) {
      alert("Please select a section.");
      return;
    }
    setSaving(true);
    try {
      let lessonId = lesson.id;
      
      // 1. Save Lesson
      if (lessonId) {
        await supabase.from('lessons').update(lesson).eq('id', lessonId);
      } else {
        const { data, error } = await supabase.from('lessons').insert([lesson]).select().single();
        if (error) throw error;
        lessonId = data.id;
      }

      // 2. Save Steps
      await supabase.from('lesson_steps').delete().eq('lesson_id', lessonId);
      for (const step of steps) {
        const { data: insertedStep, error: stepError } = await supabase.from('lesson_steps').insert([{
          lesson_id: lessonId,
          step_order: step.step_order,
          step_type: step.step_type,
          content: step.content
        }]).select().single();
        
        if (stepError) throw stepError;

        if (step.step_options && step.step_options.length > 0) {
          await supabase.from('step_options').insert(step.step_options.map(opt => ({
            step_id: insertedStep.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          })));
        }
      }

      // 3. Save Quizzes
      await supabase.from('quizzes').delete().eq('lesson_id', lessonId);
      for (const q of quizzes) {
        const { data: insertedQ, error: qError } = await supabase.from('quizzes').insert([{
          lesson_id: lessonId,
          question: q.question,
          question_order: q.question_order
        }]).select().single();

        if (qError) throw qError;

        if (q.quiz_options && q.quiz_options.length > 0) {
          await supabase.from('quiz_options').insert(q.quiz_options.map(opt => ({
            quiz_id: insertedQ.id,
            option_text: opt.option_text,
            is_correct: opt.is_correct
          })));
        }
      }

      onSave();
    } catch (err) {
      console.error("Error saving lesson:", err);
      alert("Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    setSteps([...steps, { step_order: steps.length + 1, step_type: 'hook', content: '', step_options: [] }]);
  };

  const addQuiz = () => {
    setQuizzes([...quizzes, { question: '', question_order: quizzes.length + 1, quiz_options: [{ option_text: '', is_correct: true }, { option_text: '', is_correct: false }] }]);
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-gray-800">{lesson.id ? 'Edit Lesson' : 'Create Lesson'}</h2>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-3 py-1 bg-white border border-gray-200 rounded-lg font-bold text-gray-400 hover:bg-gray-50 text-xs">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5 py-1 px-3 text-xs">
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Save Lesson
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Lesson Info */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-base font-black text-gray-800 border-b border-gray-100 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lesson Title</label>
                <input 
                  type="text" 
                  value={lesson.title}
                  onChange={(e) => setLesson({...lesson, title: e.target.value})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                  placeholder="e.g. Intro to Neural Networks"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Section</label>
                <select 
                  value={lesson.section_id}
                  onChange={(e) => setLesson({...lesson, section_id: e.target.value})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                >
                  <option value="">Select Section</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Concept</label>
                <input 
                  type="text" 
                  value={lesson.concept}
                  onChange={(e) => setLesson({...lesson, concept: e.target.value})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                  placeholder="e.g. Computer Vision"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lesson Order</label>
                <input 
                  type="number" 
                  value={lesson.lesson_order}
                  onChange={(e) => setLesson({...lesson, lesson_order: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                <textarea 
                  value={lesson.description}
                  onChange={(e) => setLesson({...lesson, description: e.target.value})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold min-h-[60px] text-xs"
                  placeholder="What will students learn in this lesson?"
                />
              </div>
            </div>
          </div>

          {/* Steps Editor */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-800">Lesson Steps</h3>
              <button onClick={addStep} className="flex items-center gap-1.5 text-primary font-black uppercase text-[9px] hover:bg-primary/5 px-2.5 py-1 rounded-lg transition-all">
                <Plus size={12} /> Add Step
              </button>
            </div>
            
            <div className="space-y-2.5">
              {steps.map((step, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group">
                  <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => {
                      if (idx === 0) return;
                      const newSteps = [...steps];
                      [newSteps[idx-1], newSteps[idx]] = [newSteps[idx], newSteps[idx-1]];
                      setSteps(newSteps.map((s, i) => ({ ...s, step_order: i + 1 })));
                    }} className="p-0.5 bg-white border border-gray-100 rounded-md shadow-sm hover:text-primary"><ArrowUp size={10} /></button>
                    <button onClick={() => {
                      if (idx === steps.length - 1) return;
                      const newSteps = [...steps];
                      [newSteps[idx+1], newSteps[idx]] = [newSteps[idx], newSteps[idx+1]];
                      setSteps(newSteps.map((s, i) => ({ ...s, step_order: i + 1 })));
                    }} className="p-0.5 bg-white border border-gray-100 rounded-md shadow-sm hover:text-primary"><ArrowDown size={10} /></button>
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center font-black text-gray-400 text-[10px]">{idx + 1}</div>
                      <select 
                        value={step.step_type}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[idx].step_type = e.target.value as any;
                          setSteps(newSteps);
                        }}
                        className="bg-transparent font-black text-gray-800 focus:outline-none text-xs"
                      >
                        <option value="hook">Hook</option>
                        <option value="story">Story</option>
                        <option value="guess">Guess</option>
                        <option value="reveal">Reveal</option>
                        <option value="challenge">Challenge</option>
                      </select>
                    </div>
                    <button onClick={() => setSteps(steps.filter((_, i) => i !== idx))} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>

                  <textarea 
                    value={step.content}
                    onChange={(e) => {
                      const newSteps = [...steps];
                      newSteps[idx].content = e.target.value;
                      setSteps(newSteps);
                    }}
                    className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-medium mb-2 text-xs"
                    placeholder="Step content..."
                  />

                  {/* Step Options */}
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Step Options (For Guess/Challenge)</p>
                    <div className="space-y-1">
                      {step.step_options?.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-1.5">
                          <input 
                            type="radio" 
                            checked={opt.is_correct} 
                            onChange={() => {
                              const newSteps = [...steps];
                              newSteps[idx].step_options = newSteps[idx].step_options?.map((o, i) => ({ ...o, is_correct: i === oIdx }));
                              setSteps(newSteps);
                            }}
                            className="w-3 h-3 text-primary focus:ring-primary"
                          />
                          <input 
                            type="text" 
                            value={opt.option_text}
                            onChange={(e) => {
                              const newSteps = [...steps];
                              if (newSteps[idx].step_options) {
                                newSteps[idx].step_options![oIdx].option_text = e.target.value;
                                setSteps(newSteps);
                              }
                            }}
                            className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary text-[10px] font-medium"
                            placeholder={`Option ${oIdx + 1}`}
                          />
                          <button onClick={() => {
                            const newSteps = [...steps];
                            newSteps[idx].step_options = newSteps[idx].step_options?.filter((_, i) => i !== oIdx);
                            setSteps(newSteps);
                          }} className="text-gray-300 hover:text-red-500"><X size={10} /></button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const newSteps = [...steps];
                          newSteps[idx].step_options = [...(newSteps[idx].step_options || []), { option_text: '', is_correct: false }];
                          setSteps(newSteps);
                        }}
                        className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5"
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Settings Card */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-base font-black text-gray-800 border-b border-gray-100 pb-2">Settings</h3>
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Difficulty</label>
                <select 
                  value={lesson.difficulty}
                  onChange={(e) => setLesson({...lesson, difficulty: e.target.value})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">XP Reward</label>
                <input 
                  type="number" 
                  value={lesson.xp_reward}
                  onChange={(e) => setLesson({...lesson, xp_reward: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estimated Time (min)</label>
                <input 
                  type="number" 
                  value={lesson.estimated_time}
                  onChange={(e) => setLesson({...lesson, estimated_time: parseInt(e.target.value)})}
                  className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                />
              </div>
            </div>
          </div>

          {/* Quiz Editor */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-gray-800">Quiz Questions</h3>
              <button onClick={addQuiz} className="text-primary font-black uppercase text-[9px] hover:bg-primary/5 px-2 py-1 rounded-lg transition-all">
                + Add
              </button>
            </div>
            
            <div className="space-y-2.5">
              {quizzes.map((q, qIdx) => (
                <div key={qIdx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Question {qIdx + 1}</span>
                    <button onClick={() => setQuizzes(quizzes.filter((_, i) => i !== qIdx))} className="text-gray-300 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                  <input 
                    type="text" 
                    value={q.question}
                    onChange={(e) => {
                      const newQuizzes = [...quizzes];
                      newQuizzes[qIdx].question = e.target.value;
                      setQuizzes(newQuizzes);
                    }}
                    className="w-full p-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary font-bold text-xs"
                    placeholder="Question text..."
                  />
                  <div className="space-y-1">
                    {q.quiz_options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-1.5">
                        <input 
                          type="radio" 
                          checked={opt.is_correct} 
                          onChange={() => {
                            const newQuizzes = [...quizzes];
                            newQuizzes[qIdx].quiz_options = newQuizzes[qIdx].quiz_options.map((o, i) => ({ ...o, is_correct: i === oIdx }));
                            setQuizzes(newQuizzes);
                          }}
                          className="w-3 h-3 text-primary focus:ring-primary"
                        />
                        <input 
                          type="text" 
                          value={opt.option_text}
                          onChange={(e) => {
                            const newQuizzes = [...quizzes];
                            newQuizzes[qIdx].quiz_options[oIdx].option_text = e.target.value;
                            setQuizzes(newQuizzes);
                          }}
                          className="flex-1 p-1.5 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:border-primary text-[10px] font-medium"
                          placeholder={`Option ${oIdx + 1}`}
                        />
                        {q.quiz_options.length > 2 && (
                          <button onClick={() => {
                            const newQuizzes = [...quizzes];
                            newQuizzes[qIdx].quiz_options = newQuizzes[qIdx].quiz_options.filter((_, i) => i !== oIdx);
                            setQuizzes(newQuizzes);
                          }} className="text-gray-300 hover:text-red-500"><X size={10} /></button>
                        )}
                      </div>
                    ))}
                    {q.quiz_options.length < 4 && (
                      <button 
                        onClick={() => {
                          const newQuizzes = [...quizzes];
                          newQuizzes[qIdx].quiz_options.push({ option_text: '', is_correct: false });
                          setQuizzes(newQuizzes);
                        }}
                        className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIGeneratorView = ({ onComplete }: { onComplete: () => void }) => {
  const [concept, setConcept] = useState('');
  const [grade, setGrade] = useState(6);
  const [difficulty, setDifficulty] = useState('beginner');
  const [sectionId, setSectionId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    const { data } = await supabase.from('sections').select('*').order('section_order', { ascending: true });
    if (data) setSections(data);
  };

  const handleGenerate = async () => {
    if (!concept || !sectionId) return;
    setLoading(true);
    setLogs([`🚀 Starting generation for: ${concept}...`]);
    
    try {
      for (let i = 0; i < count; i++) {
        setLogs(prev => [...prev, `⏳ Generating lesson ${i + 1} of ${count}...`]);
        const res = await fetch('/api/generateLesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: concept, gradeLevel: grade, difficulty, sectionId })
        });
        const data = await res.json();
        if (data.success) {
          setLogs(prev => [...prev, `✅ Lesson ${i + 1} created successfully!`]);
        } else {
          setLogs(prev => [...prev, `❌ Failed to generate lesson ${i + 1}: ${data.message}`]);
        }
      }
      setLogs(prev => [...prev, `🎉 All tasks completed!`]);
      setTimeout(onComplete, 2000);
    } catch (err) {
      setLogs(prev => [...prev, `❌ Critical error during generation.`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">AI Lesson Generator</h2>
            <p className="text-gray-400 font-medium">Create high-quality AI curriculum in seconds.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Concept / Topic</label>
            <input 
              type="text" 
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary font-bold text-lg"
              placeholder="e.g. Generative Adversarial Networks"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Section</label>
              <select 
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary font-bold"
              >
                <option value="">Select Section</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Target Grade</label>
              <select 
                value={grade}
                onChange={(e) => setGrade(parseInt(e.target.value))}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary font-bold"
              >
                {[6, 7, 8, 9, 10].map(g => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Number of Lessons</label>
            <input 
              type="number" 
              min="1" max="10"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-primary font-bold"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !concept}
            className="btn-primary w-full flex items-center justify-center gap-3 text-xl py-5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={24} />}
            Generate Lessons
          </button>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-2xl p-6 font-mono text-xs text-green-400 space-y-1 max-h-[200px] overflow-y-auto">
          {logs.map((log, i) => <div key={i}>{log}</div>)}
        </div>
      )}
    </div>
  );
};

// --- Main Admin Panel ---

export const AdminPanel = ({ onBackToApp }: { onBackToApp?: () => void }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState<any>({ totalLessons: 0, totalStudents: 0, totalCompletedLessons: 0, totalXpDistributed: 0 });
  const [recentLessons, setRecentLessons] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.stats) {
        setStats(data.stats);
        setRecentLessons(data.recentLessons);
        setRecentActivity(data.recentActivity);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      window.location.reload(); // Simple way to reset app state
    }
  };

  useEffect(() => {
    if (activeView === 'dashboard') {
      loadDashboardData();
    }
  }, [activeView]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lessons', label: 'Lessons', icon: BookOpen },
    { id: 'generate', label: 'Generate Lessons', icon: Sparkles },
    { id: 'sections', label: 'Sections & Units', icon: Layers },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 bg-gray-50 flex z-[200] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl">🤖</div>
            <h1 className="text-2xl font-black text-gray-800 tracking-tighter">AiBO Admin</h1>
          </div>
          
          <nav className="space-y-2">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setEditingLesson(undefined);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeView === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8 space-y-4">
          {onBackToApp && (
            <button 
              onClick={onBackToApp}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-primary hover:bg-primary/5 transition-all border-2 border-primary/10"
            >
              <LayoutDashboard size={20} />
              Student View
            </button>
          )}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Logged in as</p>
            <p className="text-xs font-bold text-gray-800 truncate">Admin User</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10">
          <h2 className="text-xl font-black text-gray-800 capitalize">{activeView.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            {activeView === 'lessons' && (
              <button 
                onClick={() => setActiveView('edit-lesson')}
                className="btn-primary py-2 px-6 flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> Create Lesson
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10">
          {loading && activeView === 'dashboard' ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-primary" size={48} />
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && <DashboardView stats={stats} recentLessons={recentLessons} recentActivity={recentActivity} />}
              {activeView === 'sections' && <SectionsView />}
              {activeView === 'lessons' && (
                <LessonsListView 
                  onEdit={(l) => {
                    setEditingLesson(l);
                    setActiveView('edit-lesson');
                  }} 
                  onPreview={(l) => {
                    // Preview logic could go here
                    alert(`Previewing: ${l.title}`);
                  }}
                />
              )}
              {activeView === 'edit-lesson' && (
                <LessonEditorView 
                  lesson={editingLesson} 
                  onCancel={() => setActiveView('lessons')} 
                  onSave={() => setActiveView('lessons')}
                />
              )}
              {activeView === 'generate' && <AIGeneratorView onComplete={() => setActiveView('lessons')} />}
              {['sections', 'students', 'settings'].includes(activeView) && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl mb-4">🤖</div>
                  <h3 className="text-2xl font-black text-gray-800">Under Construction</h3>
                  <p className="text-gray-400 font-medium max-w-xs">We're working hard to bring you this feature soon! 🚀</p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
