import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get Gemini client
const getGeminiClient = (customKey?: string) => {
  const apiKey = customKey || process.env.Lesson_api || process.env.GEMINI_API_KEY || process.env.API_KEY || "";
  return new GoogleGenAI({ apiKey });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "AiBO Backend is running" });
  });

  // Admin Stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const { count: lessonsCount } = await supabase.from("lessons").select("*", { count: 'exact', head: true });
      const { count: studentsCount } = await supabase.from("user_profiles").select("*", { count: 'exact', head: true }).eq('role', 'student');
      const { count: progressCount } = await supabase.from("user_progress").select("*", { count: 'exact', head: true });
      
      const { data: xpData } = await supabase.from("user_progress").select("xp_earned");
      const totalXp = xpData?.reduce((sum, item) => sum + (item.xp_earned || 0), 0) || 0;

      const { data: recentLessons } = await supabase.from("lessons").select("*").order("created_at", { ascending: false }).limit(5);
      const { data: recentActivity } = await supabase.from("user_progress").select("*, user_profiles(email)").order("completed_at", { ascending: false }).limit(5);

      res.json({
        stats: {
          totalLessons: lessonsCount || 0,
          totalStudents: studentsCount || 0,
          totalCompletedLessons: progressCount || 0,
          totalXpDistributed: totalXp
        },
        recentLessons,
        recentActivity
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/generateLesson", async (req, res) => {
    const { topic, gradeLevel, difficulty, sectionId } = req.body;
    console.log(`🚀 Server generating lesson with Gemini for: ${topic}, Grade: ${gradeLevel}`);

    const prompt = `
      You are an expert AI educator for students in Grade ${gradeLevel}.
      Create a highly structured, storytelling-based lesson about "${topic}" at a "${difficulty}" level.
      
      TONE:
      - Friendly older brother/mentor
      - Playful and simple
      - Short sentences (max 1-2 lines per card)
      - Emojis occasionally
      
      STORYTELLING FLOW (Strictly follow this order):
      1. CONCEPT: A bold hook and a short explanation of the core idea.
      2. WHY_QUESTION: A transition question (e.g., "Wait… how does this even work? 🤔").
      3. DEEP_DIVE: A logical sequence of 3-4 steps that build understanding (e.g., Step 1: ..., Step 2: ...).
      4. FUN_FACT: A "Did you know? 🤯" fact that relates directly to the concept.
      5. QUIZ: A final multiple-choice question to test understanding.
      
      FORMAT:
      Return ONLY a JSON object with this structure:
      {
        "lesson_title": "Fun Lesson Title",
        "concept_summary": "${topic}",
        "description": "Short engaging description",
        "content": {
          "concept": "The hook and initial explanation.",
          "why_question": "Wait… how does this even work? 🤔",
          "deep_dive": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
          "fun_fact": "The 'Did you know' fact.",
          "final_question": {
            "question": "...",
            "options": [{"text": "A", "correct": true}, {"text": "B", "correct": false}]
          }
        }
      }`;

    try {
      const genAI = getGeminiClient();
      const result = await genAI.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are an AI curriculum designer. Return only valid JSON matching the requested schema.",
        },
      });

      const lessonData = JSON.parse(result.text || "{}");
      const { content } = lessonData;

      console.log("✅ Gemini generated lesson JSON. Inserting into Supabase...");

      // 1. Insert Lesson
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .insert([{
          section_id: sectionId,
          title: lessonData.lesson_title,
          concept: lessonData.concept_summary,
          description: lessonData.description,
          grade_level: gradeLevel,
          difficulty: difficulty,
          xp_reward: 20,
          estimated_time: 5,
          lesson_order: 1 // Default, admin can change
        }])
        .select()
        .single();

      if (lessonError) throw lessonError;

      const lessonId = lesson.id;

      // 2. Construct and Insert Steps in Fixed Order
      const stepsToInsert = [
        { step_type: 'hook', content: content.concept },
        { step_type: 'question', content: content.why_question, options: [{ text: "Let's find out!", correct: true }, { text: "I'm curious!", correct: true }] },
        { step_type: 'reveal', content: `How it works\n${content.deep_dive.map((s: string, i: number) => `Step ${i + 1}: ${s}`).join('\n')}` },
        { step_type: 'fun_fact', content: `Did you know? 🤯\n${content.fun_fact}` }
      ];

      for (let i = 0; i < stepsToInsert.length; i++) {
        const step = stepsToInsert[i];
        const { data: insertedStep, error: stepError } = await supabase
          .from("lesson_steps")
          .insert([{
            lesson_id: lessonId,
            step_order: i + 1,
            step_type: step.step_type,
            content: step.content
          }])
          .select()
          .single();

        if (stepError) throw stepError;

        if (step.options) {
          await supabase.from("step_options").insert(step.options.map((opt: any) => ({
            step_id: insertedStep.id,
            option_text: opt.text,
            is_correct: opt.correct
          })));
        }
      }

      // 3. Insert Final Quiz
      if (content.final_question) {
        const q = content.final_question;
        const { data: insertedQ, error: qError } = await supabase
          .from('quizzes')
          .insert([{
            lesson_id: lessonId,
            question: q.question,
            question_order: 1
          }])
          .select()
          .single();

        if (qError) throw qError;

        if (q.options) {
          await supabase.from('quiz_options').insert(q.options.map((opt: any) => ({
            quiz_id: insertedQ.id,
            option_text: opt.text,
            is_correct: opt.correct
          })));
        }
      }

      console.log("🎉 Lesson successfully stored in Supabase!");
      res.json({ success: true, lessonId });

    } catch (error: any) {
      console.error("❌ Error generating lesson:", error);
      res.status(500).json({ 
        success: false, 
        message: "Lesson generation failed.",
        error: error.message 
      });
    }
  });

  app.post("/api/aiTutor", async (req, res) => {
    const { message, context } = req.body;
    try {
      const genAI = getGeminiClient();
      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: message }] }],
        config: {
          maxOutputTokens: 500,
          systemInstruction: `You are AiBO, a super fun and playful AI learning buddy for kids aged 11-16. 
          Your goal is to make AI feel like a giant game! 🎮
          Use lots of emojis (✨, 🧠, 🚀, ✨) and keep your explanations very simple.
          Context: ${context || ""}`,
        },
      });
      res.json({ text: result.text });
    } catch (error: any) {
      console.error("❌ Gemini Tutor Error:", error);
      res.status(500).json({ error: "I'm having a little trouble connecting to my brain right now!" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AiBO Server running on http://localhost:${PORT}`);
  });
}

startServer();
