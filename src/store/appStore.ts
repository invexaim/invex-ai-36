import { AppState } from './types';
import { toast } from "sonner";

import { createProductSlice } from './slices/productSlice';
import { createSaleSlice } from './slices/saleSlice';
import { createClientSlice } from './slices/clientSlice';
import { createPaymentSlice } from './slices/paymentSlice';
import { createUserSlice } from './slices/userSlice';
import { createCompanySlice } from './slices/companySlice';
import { saveUserDataToSupabase, setupRealtimeSubscription } from './slices/userSlice/dataSync';
import { createPersistedStore } from './createStore';
import { configureAutoSave, processRealtimeUpdate, updateLastTimestamp } from './realtimeSync';
import { createExpirySlice } from './slices/expirySlice';

// Create a combined store with all slices
const useAppStore = createPersistedStore<AppState>(
  (set, get, store) => {
    // Create a function that will be used to save data to Supabase
    const saveDataToSupabase = async () => {
      const { currentUser } = get();
      if (!currentUser) {
        console.log("No current user, skipping data save");
        return;
      }
      
      try {
        console.log("Saving data to Supabase from store");
        updateLastTimestamp(); // Mark this as a local update
        await saveUserDataToSupabase(currentUser.id, get());
      } catch (error) {
        console.error('Error in saveDataToSupabase:', error);
        throw error;
      }
    };
    
    // Initialize user slice with the proper save function
    const userSlice = createUserSlice(set, get, saveDataToSupabase);
    
    // Create individual slices with cross-slice access
    const productSlice = createProductSlice(set, get);
    
    const clientSlice = createClientSlice(set, get);
    
    const companySlice = createCompanySlice(set, get);
    
    const expirySlice = createExpirySlice(set, get);
    
    // Create sale slice with direct reference to client update function
    // Pass the updateClientPurchase function with proper signature including transactionId
    const saleSlice = createSaleSlice(
      set, 
      get, 
      // Give sale slice access to products
      () => get().products,
      // Method to update a product from the sale slice
      (updatedProduct) => {
        set((state: AppState) => ({
          products: state.products.map(p => 
            p.product_id === updatedProduct.product_id ? updatedProduct : p
          )
        }));
      },
      // CRITICAL: Pass the EXACT client update function with transaction ID support
      (clientName: string, amount: number, productName: string, quantity: number, transactionId?: string) => {
        console.log("APP STORE: Routing client update with transaction ID:", { 
          clientName, 
          amount, 
          productName, 
          quantity, 
          transactionId 
        });
        clientSlice.updateClientPurchase(clientName, amount, productName, quantity, transactionId);
      }
    );
    
    const paymentSlice = createPaymentSlice(
      set, 
      get,
      // Give payment slice access to update client - but don't double count sales
      (clientName: string, amount: number) => {
        // Generate unique transaction ID for payments
        const transactionId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log("APP STORE: Processing payment with transaction ID:", { clientName, amount, transactionId });
        // Only update for actual payments, not sales
        clientSlice.updateClientPurchase(clientName, amount, "Payment", 1, transactionId);
      }
    );
    
    // Configure auto-saving functionality
    const setWithAutoSave = configureAutoSave(set, get, saveDataToSupabase);
    
    // Variable to store unsubscribe function for realtime updates
    let realtimeUnsubscribe: (() => void) | null = null;
    
    // Combine all slices and expose them
    return {
      // Product slice
      ...productSlice,
      // Sale slice
      ...saleSlice,
      // Client slice
      ...clientSlice,
      // Payment slice with deletePayment explicitly included
      ...paymentSlice,
      deletePayment: paymentSlice.deletePayment,
      // User slice
      ...userSlice,
      // Company slice
      ...companySlice,
      // Expiry slice
      ...expirySlice,
      
      // Override set method for specific actions to trigger Supabase sync
      setProducts: (products) => {
        setWithAutoSave({ products });
      },
      setSales: (sales) => {
        setWithAutoSave({ sales });
      },
      setClients: (clients) => {
        setWithAutoSave({ clients });
      },
      setPayments: (payments) => {
        setWithAutoSave({ payments });
      },
      setPendingSalePayment: (sale) => {
        set({ pendingSalePayment: sale });
      },
      
      // Initialize required state properties
      isSignedIn: false,
      setIsSignedIn: (isSignedIn) => set({ isSignedIn }),
      isLoading: false,
      setIsLoading: (isLoading) => set({ isLoading }),
      pendingSalePayment: null,
      
      // Expose the saveDataToSupabase function
      saveDataToSupabase,
      
      // ENSURE recordSale is the primary function (no addSale wrapper)
      addSale: saleSlice.recordSale,
      
      // Add debug function to clear processed transactions
      clearProcessedTransactions: () => {
        console.log("APP STORE: Clearing processed transactions");
        if (clientSlice.clearProcessedTransactions) {
          clientSlice.clearProcessedTransactions();
        }
      },
      
      // Add function to recalculate client totals
      recalculateClientTotals: (clientId: number) => {
        console.log("APP STORE: Recalculating client totals for:", clientId);
        if (clientSlice.recalculateClientTotals) {
          clientSlice.recalculateClientTotals(clientId);
        }
      },
      
      // Set up realtime updates for the current user
      setupRealtimeUpdates: (userId: string): (() => void) => {
        console.log("Setting up realtime updates in store for user:", userId);
        
        // Clean up any existing subscription
        if (realtimeUnsubscribe) {
          realtimeUnsubscribe();
          realtimeUnsubscribe = null;
        }
        
        // Set up new subscription
        realtimeUnsubscribe = setupRealtimeSubscription(userId, (userData) => {
          console.log("Receiving realtime update:", userData);
          
          // Process the update using our utility function
          processRealtimeUpdate(userData, get, set);
        });
        
        // Force a data sync on setup
        const { syncDataWithSupabase } = get();
        syncDataWithSupabase().catch(error => {
          console.error("Error syncing data during realtime setup:", error);
        });
        
        // Always return a cleanup function, even if realtimeUnsubscribe is null
        return () => {
          if (realtimeUnsubscribe) {
            realtimeUnsubscribe();
            realtimeUnsubscribe = null;
          }
        };
      }
    };
  }
);

export default useAppStore;
