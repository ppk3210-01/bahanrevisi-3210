
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { TemporaryDatabase as Database } from '@/types/supabase';

const SUPABASE_URL = "https://vodfnexxrevgrxmmaksy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvZGZuZXh4cmV2Z3J4bW1ha3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3NDY2ODQsImV4cCI6MjA1OTMyMjY4NH0.wIpm86J2RD3BHytc59cIjGRiOfbY3bOLqRdbGdpKmJI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
