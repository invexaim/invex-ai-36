
import { User } from "@supabase/supabase-js";

export interface UserState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  syncDataWithSupabase: () => Promise<void>;
  saveDataToSupabase: () => Promise<void>;
  clearLocalData: () => void;
}
