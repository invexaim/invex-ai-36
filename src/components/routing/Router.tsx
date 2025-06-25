
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import MainLayout from "../layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import AddProduct from "@/pages/AddProduct";
import Sales from "@/pages/Sales";
import RecordSale from "@/pages/RecordSale";
import Purchases from "@/pages/Purchases";
import History from "@/pages/History";
import Payments from "@/pages/Payments";
import AddPayment from "@/pages/AddPayment";
import Clients from "@/pages/Clients";
import AddClient from "@/pages/AddClient";
import ClientDetail from "@/pages/ClientDetail";
import Stock from "@/pages/Stock";
import Estimates from "@/pages/Estimates";
import CreateEstimate from "@/pages/CreateEstimate";
import Delivery from "@/pages/Delivery";
import CreateChallan from "@/pages/CreateChallan";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import Settings from "@/pages/Settings";
import Expiry from "@/pages/Expiry";
import AddExpiry from "@/pages/AddExpiry";
import PurchaseOrders from "@/pages/PurchaseOrders";
import PurchaseReturns from "@/pages/PurchaseReturns";
import SupplierManagement from "@/pages/SupplierManagement";
import PurchaseList from "@/pages/PurchaseList";
import SalesInvoices from "@/pages/SalesInvoices";
import SalesReturns from "@/pages/SalesReturns";
import SalesGST from "@/pages/SalesGST";
import SalesDiscounts from "@/pages/SalesDiscounts";
import CreatePurchaseOrder from "@/pages/CreatePurchaseOrder";
import CreatePurchaseReturn from "@/pages/CreatePurchaseReturn";
import CreateSupplier from "@/pages/CreateSupplier";

// Stock subpages
import InStock from "@/pages/stock/InStock";
import LowStock from "@/pages/stock/LowStock";
import StockOut from "@/pages/stock/StockOut";
import ShortExpiry from "@/pages/stock/ShortExpiry";
import ExpiryStock from "@/pages/stock/Expiry";

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

        <Route path="/products/add" element={
          <ProtectedRoute>
            <AddProduct />
          </ProtectedRoute>
        } />
        
        <Route path="/sales" element={
          <ProtectedRoute>
            <MainLayout>
              <Sales />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/sales/record" element={
          <ProtectedRoute>
            <RecordSale />
          </ProtectedRoute>
        } />

        {/* New Sales Routes */}
        <Route path="/sales/invoices" element={
          <ProtectedRoute>
            <MainLayout>
              <SalesInvoices />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/sales/invoices/new" element={
          <ProtectedRoute>
            <MainLayout>
              <SalesInvoices />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/sales/returns" element={
          <ProtectedRoute>
            <MainLayout>
              <SalesReturns />
            </MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/purchases" element={
          <ProtectedRoute>
            <MainLayout>
              <Purchases />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/purchases/orders" element={
          <ProtectedRoute>
            <MainLayout>
              <PurchaseOrders />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/purchases/orders/create" element={
          <ProtectedRoute>
            <CreatePurchaseOrder />
          </ProtectedRoute>
        } />

        <Route path="/purchases/returns" element={
          <ProtectedRoute>
            <MainLayout>
              <PurchaseReturns />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/purchases/returns/create" element={
          <ProtectedRoute>
            <CreatePurchaseReturn />
          </ProtectedRoute>
        } />

        <Route path="/purchases/suppliers" element={
          <ProtectedRoute>
            <MainLayout>
              <SupplierManagement />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/purchases/suppliers/create" element={
          <ProtectedRoute>
            <CreateSupplier />
          </ProtectedRoute>
        } />

        <Route path="/purchases/list" element={
          <ProtectedRoute>
            <MainLayout>
              <PurchaseList />
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

        <Route path="/payments/add" element={
          <ProtectedRoute>
            <AddPayment />
          </ProtectedRoute>
        } />
        
        <Route path="/clients" element={
          <ProtectedRoute>
            <MainLayout>
              <Clients />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/clients/add" element={
          <ProtectedRoute>
            <AddClient />
          </ProtectedRoute>
        } />
        
        {/* Stock Routes */}
        <Route path="/stock" element={<Navigate to="/stock/in-stock" replace />} />
        
        <Route path="/stock/in-stock" element={
          <ProtectedRoute>
            <MainLayout>
              <InStock />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/stock/low-stock" element={
          <ProtectedRoute>
            <MainLayout>
              <LowStock />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/stock/stock-out" element={
          <ProtectedRoute>
            <MainLayout>
              <StockOut />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/stock/short-expiry" element={
          <ProtectedRoute>
            <MainLayout>
              <ShortExpiry />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/stock/expiry" element={
          <ProtectedRoute>
            <MainLayout>
              <ExpiryStock />
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

        <Route path="/estimates/create" element={
          <ProtectedRoute>
            <CreateEstimate />
          </ProtectedRoute>
        } />
        
        <Route path="/delivery" element={
          <ProtectedRoute>
            <MainLayout>
              <Delivery />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/delivery/create" element={
          <ProtectedRoute>
            <CreateChallan />
          </ProtectedRoute>
        } />
        
        <Route path="/expiry" element={
          <ProtectedRoute>
            <MainLayout>
              <Expiry />
            </MainLayout>
          </ProtectedRoute>
        } />

        <Route path="/expiry/add" element={
          <ProtectedRoute>
            <AddExpiry />
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
