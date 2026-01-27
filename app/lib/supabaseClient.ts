import { createClient } from "@supabase/supabase-js";

// TEMP ONLY: do NOT commit this file with real keys.
// Replace with your actual values:
const SUPABASE_URL = "https://eoeoaifreavxejmahwvy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvZW9haWZyZWF2eGVqbWFod3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDg5NDMsImV4cCI6MjA4NTAyNDk0M30.MAhak45Pv-zAXFkx3LTRHk8i45iaK9axyyN4KQ0laHo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
