
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import useAppStore from "@/store/appStore";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  
  const {
    setCurrentUser,
    syncDataWithSupabase,
    setupRealtimeUpdates,
    forceSaveData,
    saveDataToSupabase,
  } = useAppStore();
  
  // Detect page navigation/visibility changes to ensure data is saved
  useEffect(() => {
    const saveBeforeUnloadOrHide = async () => {
      if (user) {
        console.log("Saving data before page unload or visibility change");
        try {
          await saveDataToSupabase();
        } catch (error) {
          console.error("Error saving data before unload/visibility change:", error);
        }
      }
    };
    
    // Save data when user navigates away or closes tab
    window.addEventListener("beforeunload", saveBeforeUnloadOrHide);
    
    // Save data when tab becomes hidden (switching tabs)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        saveBeforeUnloadOrHide();
      }
    });
    
    return () => {
      window.removeEventListener("beforeunload", saveBeforeUnloadOrHide);
      document.removeEventListener("visibilitychange", saveBeforeUnloadOrHide);
    };
  }, [user, saveDataToSupabase]);

  // Setup initial authentication check and subscription to auth changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupAuth = async () => {
      try {
        // Initial auth check
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user || null;
        
        if (currentUser) {
          console.log("User authenticated, syncing data...");
          setUser(currentUser);
          setCurrentUser(currentUser);
          try {
            await syncDataWithSupabase();
            console.log("Data synced successfully after auth change");
            
            // Setup realtime updates for authenticated user
            if (unsubscribe) {
              unsubscribe();
            }
            unsubscribe = setupRealtimeUpdates(currentUser.id);
            
          } catch (error) {
            console.error("Error syncing data after auth check:", error);
          }
        }
        
        setIsLoading(false);
        setAuthChecked(true);
        
        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            const newUser = session?.user || null;
            
            // Make sure to save current data before updating user
            if (user && newUser && user.id !== newUser.id) {
              try {
                await forceSaveData();
              } catch (error) {
                console.error("Error saving data during user change:", error);
              }
            }
            
            setUser(newUser);
            setCurrentUser(newUser);
            
            if (event === "SIGNED_IN" && newUser) {
              console.log("User authenticated, syncing data...");
              try {
                await syncDataWithSupabase();
                console.log("Data synced successfully after auth change");
                
                // Clean up old subscription if exists
                if (unsubscribe) {
                  unsubscribe();
                  unsubscribe = null;
                }
                
                // Setup new subscription for the authenticated user
                if (newUser) {
                  unsubscribe = setupRealtimeUpdates(newUser.id);
                }
                
              } catch (error) {
                console.error("Error syncing data after auth change:", error);
              }
            } else if (event === "SIGNED_OUT") {
              // Clean up subscription
              if (unsubscribe) {
                unsubscribe();
                unsubscribe = null;
              }
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
          if (unsubscribe) {
            unsubscribe();
          }
        };
      } catch (error) {
        console.error("Error in auth setup:", error);
        setIsLoading(false);
        setAuthChecked(true);
      }
    };
    
    setupAuth();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setCurrentUser, syncDataWithSupabase, setupRealtimeUpdates]);

  return (
    <AuthContext.Provider value={{ user, isLoading, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};
