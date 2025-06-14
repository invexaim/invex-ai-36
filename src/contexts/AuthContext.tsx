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

// Session management utilities
const SESSION_KEYS = {
  INITIAL_LOAD_COMPLETE: 'invex_initial_load_complete',
  LAST_SYNC_TIMESTAMP: 'invex_last_sync_timestamp',
  WELCOME_SHOWN: 'invex_welcome_shown'
};

const hasInitialLoadCompleted = () => {
  return sessionStorage.getItem(SESSION_KEYS.INITIAL_LOAD_COMPLETE) === 'true';
};

const markInitialLoadComplete = () => {
  sessionStorage.setItem(SESSION_KEYS.INITIAL_LOAD_COMPLETE, 'true');
};

const getLastSyncTimestamp = (): number => {
  const timestamp = sessionStorage.getItem(SESSION_KEYS.LAST_SYNC_TIMESTAMP);
  return timestamp ? parseInt(timestamp, 10) : 0;
};

const updateLastSyncTimestamp = () => {
  sessionStorage.setItem(SESSION_KEYS.LAST_SYNC_TIMESTAMP, Date.now().toString());
};

const clearSessionFlags = () => {
  Object.values(SESSION_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const syncDataWithSupabase = useAppStore(state => state.syncDataWithSupabase);
  const clearLocalData = useAppStore(state => state.clearLocalData);
  const setupRealtimeUpdates = useAppStore(state => state.setupRealtimeUpdates);
  const saveDataToSupabase = useAppStore(state => state.saveDataToSupabase);

  // Enhanced sync function with silent option
  const performDataSync = async (userId: string, options: { silent?: boolean; isInitialLoad?: boolean } = {}) => {
    const { silent = false, isInitialLoad = false } = options;
    
    try {
      console.log("AUTH: Starting data sync:", { userId, silent, isInitialLoad });
      
      // Disable auto sync by default - only sync on explicit user action
      setAutoSync(false);
      
      await syncDataWithSupabase();
      
      // Update sync timestamp
      updateLastSyncTimestamp();
      
      console.log("AUTH: Data synced successfully");
      
      // Only show toast for initial loads or explicit user actions
      if (!silent) {
        if (isInitialLoad) {
          const welcomeShown = sessionStorage.getItem(SESSION_KEYS.WELCOME_SHOWN);
          if (!welcomeShown) {
            toast.success("Welcome! Your data has been loaded");
            sessionStorage.setItem(SESSION_KEYS.WELCOME_SHOWN, 'true');
          }
        } else {
          toast.success("Your data has been updated");
        }
      }
      
    } catch (error) {
      console.error("AUTH: Error syncing data:", error);
      if (!silent) {
        toast.error("Failed to load your data. Please refresh the page.");
      }
      throw error;
    }
  };

  useEffect(() => {
    console.log("AUTH: Setting up auth state listeners...");
    let realtimeCleanup: (() => void) | null = null;
    
    // First check for existing session to avoid race conditions
    const checkSession = async () => {
      try {
        const { session, error } = await AuthService.getSession();
        const currentUser = session?.user ?? null;
        console.log("AUTH: Initial session check:", currentUser ? "User is logged in" : "No user session");
        
        setUser(currentUser);
        setCurrentUser(currentUser);
        
        if (currentUser) {
          const hasCompletedInitialLoad = hasInitialLoadCompleted();
          const lastSyncTime = getLastSyncTimestamp();
          const timeSinceLastSync = Date.now() - lastSyncTime;
          const shouldSyncData = !hasCompletedInitialLoad || timeSinceLastSync > 300000; // 5 minutes
          
          if (shouldSyncData) {
            console.log("AUTH: Performing initial data sync");
            await performDataSync(currentUser.id, { 
              silent: hasCompletedInitialLoad, 
              isInitialLoad: !hasCompletedInitialLoad 
            });
            markInitialLoadComplete();
          } else {
            console.log("AUTH: Skipping data sync - recent sync detected");
          }
          
          // Set up realtime updates but keep auto-sync disabled
          const cleanup = setupRealtimeUpdates(currentUser.id);
          if (typeof cleanup === 'function') {
            realtimeCleanup = cleanup;
          }
        }
        
        setAuthChecked(true);
        setIsLoading(false);
      } catch (error) {
        console.error("AUTH: Error checking session:", error);
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state listener after checking session
    const subscription = AuthService.onAuthStateChange(async (currentUser) => {
      console.log("AUTH: Auth state changed:", currentUser ? "User signed in" : "User signed out");
      
      setUser(currentUser);
      setCurrentUser(currentUser);
      
      if (currentUser) {
        // Check if this is a genuine new login or just a session refresh
        const hasCompletedInitialLoad = hasInitialLoadCompleted();
        const lastSyncTime = getLastSyncTimestamp();
        const timeSinceLastSync = Date.now() - lastSyncTime;
        
        // Only sync if it's been more than 30 seconds since last sync (indicates new login)
        const shouldSyncForNewLogin = !hasCompletedInitialLoad || timeSinceLastSync > 30000;
        
        if (shouldSyncForNewLogin) {
          try {
            console.log("AUTH: New login detected, syncing data");
            await performDataSync(currentUser.id, { 
              silent: false, 
              isInitialLoad: !hasCompletedInitialLoad 
            });
            markInitialLoadComplete();
          } catch (error) {
            console.error("AUTH: Error syncing data after auth change:", error);
          }
        } else {
          console.log("AUTH: Session refresh detected, skipping data sync");
        }
        
        // Set up realtime updates after login but keep auto-sync disabled
        if (realtimeCleanup) {
          realtimeCleanup();
        }
        const cleanup = setupRealtimeUpdates(currentUser.id);
        if (typeof cleanup === 'function') {
          realtimeCleanup = cleanup;
        }
      } else {
        // When user logs out, clear local data and session flags
        console.log("AUTH: User signed out, clearing local data");
        if (realtimeCleanup) {
          realtimeCleanup();
          realtimeCleanup = null;
        }
        clearLocalData();
        clearSessionFlags();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (realtimeCleanup) {
        realtimeCleanup();
      }
    };
  }, [setCurrentUser, syncDataWithSupabase, clearLocalData, setupRealtimeUpdates]);

  return (
    <AuthContext.Provider value={{ user, isLoading, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};
