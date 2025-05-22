import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import AuthService from "@/services/authService";
import { setAutoSync } from "@/store/realtimeSync";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  authChecked: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  authChecked: false,
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const syncDataWithSupabase = useAppStore(state => state.syncDataWithSupabase);
  const clearLocalData = useAppStore(state => state.clearLocalData);
  const setupRealtimeUpdates = useAppStore(state => state.setupRealtimeUpdates);
  const saveDataToSupabase = useAppStore(state => state.saveDataToSupabase);

  useEffect(() => {
    console.log("Setting up auth state listeners...");
    let realtimeCleanup: (() => void) | null = null;
    
    // First check for existing session to avoid race conditions
    const checkSession = async () => {
      try {
        const { session, error } = await AuthService.getSession();
        const currentUser = session?.user ?? null;
        console.log("Initial session check:", currentUser ? "User is logged in" : "No user session");
        
        setUser(currentUser);
        setCurrentUser(currentUser);
        
        if (currentUser) {
          // If user is already logged in, sync their data
          try {
            console.log("User already authenticated, syncing data on initial load...");
            
            // Disable auto sync by default - only sync on explicit user action
            setAutoSync(false);
            
            await syncDataWithSupabase();
            console.log("Data synced successfully on initial load");
            
            // Set up realtime updates but keep auto-sync disabled
            const cleanup = setupRealtimeUpdates(currentUser.id);
            if (typeof cleanup === 'function') {
              realtimeCleanup = cleanup;
            }
            
            // Remove welcome shown flag from previous sessions when loading app
            sessionStorage.removeItem("welcomeShown");
          } catch (error) {
            console.error("Error syncing data on initial load:", error);
            toast.error("Failed to load your data. Please refresh the page.");
          }
        }
        
        setAuthChecked(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener after checking session
    const subscription = AuthService.onAuthStateChange(async (currentUser) => {
      setUser(currentUser);
      setCurrentUser(currentUser);
      
      if (currentUser) {
        // When user logs in, sync their data from Supabase to local state
        try {
          console.log("User authenticated, syncing data...");
          
          // Disable auto sync by default - only sync on explicit user action
          setAutoSync(false);
          
          await syncDataWithSupabase();
          console.log("Data synced successfully after auth change");
          toast.success("Your data has been loaded");
          
          // Set up realtime updates after login but keep auto-sync disabled
          if (realtimeCleanup) {
            realtimeCleanup();
          }
          const cleanup = setupRealtimeUpdates(currentUser.id);
          if (typeof cleanup === 'function') {
            realtimeCleanup = cleanup;
          }
          
          // Remove welcome shown flag to show welcome message on new login
          sessionStorage.removeItem("welcomeShown");
        } catch (error) {
          console.error("Error syncing data after auth change:", error);
          toast.error("Failed to load your data. Please refresh and try again.");
        }
      } else {
        // When user logs out, clear local data
        console.log("User signed out, clearing local data");
        if (realtimeCleanup) {
          realtimeCleanup();
          realtimeCleanup = null;
        }
        clearLocalData();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeCleanup) {
        realtimeCleanup();
      }
    };
  }, [setCurrentUser, syncDataWithSupabase, clearLocalData, setupRealtimeUpdates, saveDataToSupabase]);

  return (
    <AuthContext.Provider value={{ user, isLoading, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};
