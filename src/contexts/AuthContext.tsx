
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import AuthService from '@/services/authService';
import useAppStore from '@/store/appStore';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authChecked: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export the same hook with different name for compatibility
export function useAuthContext() {
  return useAuth();
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const { setupRealtimeUpdates, syncDataWithSupabase, setProducts, setSales, setClients, setPayments, setMeetings } = useAppStore();

  // Function to clear all user data when switching users
  const clearUserData = () => {
    console.log('AUTH: Clearing all user data for user switch');
    setProducts([]);
    setSales([]);
    setClients([]);
    setPayments([]);
    setMeetings([]);
  };

  useEffect(() => {
    let isMounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { session: initialSession } = await AuthService.getSession();
        
        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user || null);
          
          if (initialSession?.user) {
            console.log('AUTH: User authenticated, setting up realtime updates');
            // Clear any existing data first
            clearUserData();
            // Then sync data for this user
            setTimeout(async () => {
              try {
                await syncDataWithSupabase({ silent: true });
                setupRealtimeUpdates();
              } catch (error) {
                console.error('AUTH: Error syncing data on init:', error);
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error('AUTH: Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const subscription = AuthService.onAuthStateChange((user) => {
      console.log('AUTH: Auth state change:', user?.id);
      
      if (isMounted) {
        const previousUserId = session?.user?.id;
        const newUserId = user?.id;
        
        setUser(user);
        setSession(user ? { user } as Session : null);
        
        if (user && newUserId !== previousUserId) {
          console.log('AUTH: New user signed in, clearing data and syncing');
          // Clear data immediately when a different user signs in
          clearUserData();
          
          // Sync data for the new user after a short delay
          setTimeout(async () => {
            try {
              await syncDataWithSupabase({ silent: true });
              setupRealtimeUpdates();
            } catch (error) {
              console.error('AUTH: Error syncing data for new user:', error);
            }
          }, 100);
        } else if (!user) {
          console.log('AUTH: User signed out, clearing data');
          clearUserData();
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setupRealtimeUpdates, syncDataWithSupabase, setProducts, setSales, setClients, setPayments, setMeetings, session?.user?.id]);

  const signOut = async () => {
    try {
      // Clear data before signing out
      clearUserData();
      await AuthService.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    authChecked,
    isLoading: loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
