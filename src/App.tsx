
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, ReactNode } from "react";
import { supabase } from "./integrations/supabase/client";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import History from "./pages/History";
import Payments from "./pages/Payments";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Stock from "./pages/Stock";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import useAppStore from "./store/appStore";
import { toast } from "sonner";

// Create a QueryClient instance outside the component
const queryClient = new QueryClient();

// Define the ProtectedRoute props interface
interface ProtectedRouteProps {
  children: ReactNode;
}

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setCurrentUser = useAppStore(state => state.setCurrentUser);
  const syncDataWithSupabase = useAppStore(state => state.syncDataWithSupabase);
  const clearLocalData = useAppStore(state => state.clearLocalData);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log("Setting up auth state listeners...");
    
    // First check for existing session to avoid race conditions
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setCurrentUser(currentUser);
        
        if (currentUser) {
          // When user logs in, sync their data from Supabase to local state
          try {
            console.log("User authenticated, syncing data...");
            await syncDataWithSupabase();
            console.log("Data synced successfully after auth change");
            toast.success("Your data has been loaded");
          } catch (error) {
            console.error("Error syncing data after auth change:", error);
            toast.error("Failed to load your data. Please refresh and try again.");
          }
        } else if (event === 'SIGNED_OUT') {
          // When user logs out, clear local data
          console.log("User signed out, clearing local data");
          clearLocalData();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser, syncDataWithSupabase, clearLocalData]);

  // Protected route component
  const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    // Add check for authChecked to ensure we've at least attempted to check auth status
    if (isLoading || !authChecked) {
      return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    
    // If not loading and no user, redirect to auth page
    if (!user) {
      console.log("No authenticated user, redirecting to /auth");
      return <Navigate to="/auth" replace />;
    }
    
    // Otherwise render children
    return <>{children}</>;
  };

  // If still loading initial auth state, show loading
  if (isLoading && !authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading application...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Redirect root to either dashboard or auth depending on auth state */}
            <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />} />
            
            {/* Auth route - accessible only when not logged in */}
            <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
            
            {/* Protected routes - need authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <MainLayout>
                  <Products />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/sales" element={
              <ProtectedRoute>
                <MainLayout>
                  <Sales />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/history" element={
              <ProtectedRoute>
                <MainLayout>
                  <History />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <MainLayout>
                  <Payments />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/clients" element={
              <ProtectedRoute>
                <MainLayout>
                  <Clients />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/stock" element={
              <ProtectedRoute>
                <MainLayout>
                  <Stock />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/clients/:clientId" element={
              <ProtectedRoute>
                <MainLayout>
                  <ClientDetail />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/products/low-stock" element={
              <ProtectedRoute>
                <MainLayout>
                  <Products filterType="low-stock" />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
