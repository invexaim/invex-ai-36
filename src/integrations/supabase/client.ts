
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gnobwirrspnrqjjehqsc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdub2J3aXJyc3BucnFqamVocXNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDI3ODUsImV4cCI6MjA1OTc3ODc4NX0.bq4sJqhOvRCNkUFT4nfbj47LdUj_Po8tkgxmFmIqXew";

// Since we can't modify the Database type directly, we'll create a custom typed client
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// We'll manually type our table operations when using them
export type UserDataTable = {
  id: string;
  user_id: string;
  products: any[];
  sales: any[];
  clients: any[];
  payments: any[];
  created_at: string | null;
  updated_at: string | null;
}
