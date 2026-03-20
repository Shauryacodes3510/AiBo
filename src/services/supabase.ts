import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase credentials missing! Check your .env file.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Quick connection check
supabase.from('lessons').select('id').limit(1).then(({ error }) => {
  if (error) {
    console.warn("⚠️ Supabase connection check failed (might be RLS or missing table):", error.message);
  } else {
    console.log("🚀 Supabase connection successful!");
  }
});
