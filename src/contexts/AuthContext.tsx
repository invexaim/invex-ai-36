
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import AuthService from "@/services/authService";

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

  useEffect(() => {
    console.log("Setting up auth state listeners...");
    
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
            await syncDataWithSupabase();
            console.log("Data synced successfully on initial load");
            
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
      const wasLoggedIn = user !== null;
      const isLoggedIn = currentUser !== null;
      const isNewLogin = !wasLoggedIn && isLoggedIn;
      
      setUser(currentUser);
      setCurrentUser(currentUser);
      
      if (currentUser) {
        // When user logs in, sync their data from Supabase to local state
        try {
          console.log("User authenticated, syncing data...");
          await syncDataWithSupabase();
          console.log("Data synced successfully after auth change");
          
          // Set a flag to show welcome message only on new login
          if (isNewLogin) {
            toast.success("Your data has been loaded");
            sessionStorage.setItem("isNewLogin", "true");
          }
        } catch (error) {
          console.error("Error syncing data after auth change:", error);
          toast.error("Failed to load your data. Please refresh and try again.");
        }
      } else {
        // When user logs out, clear local data
        console.log("User signed out, clearing local data");
        clearLocalData();
        sessionStorage.removeItem("isNewLogin");
        sessionStorage.removeItem("welcomeShown");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser, syncDataWithSupabase, clearLocalData, user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};
