
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hfhmiaskzqcydeyjzayb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaG1pYXNrenFjeWRleWp6YXliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMTk5ODksImV4cCI6MjA1OTY5NTk4OX0.xt-IaZ6bjdhGsaB6ygGLs4LvbAHqnlU0N7EfaUZVhJM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
