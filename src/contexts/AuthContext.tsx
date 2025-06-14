
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
  const { setupRealtimeUpdates } = useAppStore();

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
            setupRealtimeUpdates(initialSession.user.id);
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
        setUser(user);
        setSession(user ? { user } as Session : null);
        
        if (user) {
          console.log('AUTH: User signed in, setting up realtime updates');
          setupRealtimeUpdates(user.id);
        } else {
          console.log('AUTH: User signed out, cleaning up');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setupRealtimeUpdates]);

  const signOut = async () => {
    try {
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
