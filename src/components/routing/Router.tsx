
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import MainLayout from "../layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Sales from "@/pages/Sales";
import History from "@/pages/History";
import Payments from "@/pages/Payments";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Stock from "@/pages/Stock";
import Estimates from "@/pages/Estimates";
import Delivery from "@/pages/Delivery";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import Expiry from "@/pages/Expiry";
import { useAuthContext } from "@/contexts/AuthContext";

// Define the ProtectedRoute props interface
interface ProtectedRouteProps {
  children: ReactNode;
}

// Define the AuthGuard props interface
interface AuthGuardProps {
  children: ReactNode;
}

export const Router = () => {
  let authContextValue;
  
  try {
    authContextValue = useAuthContext();
  } catch (error) {
    // If AuthContext is not available, show loading
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Initializing authentication...</div>
      </div>
    );
  }

  const { user, isLoading, authChecked } = authContextValue;

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

  // AuthGuard component
  const AuthGuard = ({ children }: AuthGuardProps) => {
    const { user, isLoading, authChecked } = useAuthContext();
    
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
        
        <Route path="/estimates" element={
          <ProtectedRoute>
            <MainLayout>
              <Estimates />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/delivery" element={
          <ProtectedRoute>
            <MainLayout>
              <Delivery />
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
        
        <Route path="/expiry" element={
          <ProtectedRoute>
            <MainLayout>
              <Expiry />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <MainLayout>
                <Settings />
              </MainLayout>
            </AuthGuard>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
