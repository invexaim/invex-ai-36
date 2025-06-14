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
        console.log("STORE: No current user, skipping data save");
        return;
      }
      
      try {
        console.log("STORE: Saving data to Supabase from store");
        updateLastTimestamp(); // Mark this as a local update
        await saveUserDataToSupabase(currentUser.id, get());
      } catch (error) {
        console.error('STORE: Error in saveDataToSupabase:', error);
        throw error;
      }
    };
    
    // Initialize user slice with the proper save function
    const userSlice = createUserSlice(set, get, saveDataToSupabase);
    
    // Create individual slices with cross-slice access
    const productSlice = createProductSlice(set, get);
    
    const clientSlice = createClientSlice(set, get);
    
    const companySlice = createCompanySlice(set, get);
    
    const expirySlice = createExpirySlice(set, get, store);
    
    // ENHANCED: Create sale slice with improved transaction tracking
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
      // ENHANCED: Pass the client update function with better validation
      (clientName: string, amount: number, productName: string, quantity: number, transactionId?: string) => {
        // Validate inputs before proceeding
        if (!clientName || !clientName.trim()) {
          console.log("STORE: Skipping client update - no client name");
          return;
        }
        
        if (typeof amount !== 'number' || amount <= 0) {
          console.log("STORE: Skipping client update - invalid amount:", amount);
          return;
        }
        
        if (typeof quantity !== 'number' || quantity <= 0) {
          console.log("STORE: Skipping client update - invalid quantity:", quantity);
          return;
        }
        
        console.log("STORE: Routing client update with transaction ID:", { 
          clientName: clientName.trim(), 
          amount, 
          productName, 
          quantity, 
          transactionId 
        });
        
        clientSlice.updateClientPurchase(clientName.trim(), amount, productName, quantity, transactionId);
      }
    );
    
    // ENHANCED: Payment slice with better transaction management
    const paymentSlice = createPaymentSlice(
      set, 
      get,
      // Give payment slice access to update client - but don't double count sales
      (clientName: string, amount: number) => {
        // Validate inputs
        if (!clientName || !clientName.trim() || typeof amount !== 'number' || amount <= 0) {
          console.log("STORE: Skipping payment client update - invalid inputs");
          return;
        }
        
        // Generate unique transaction ID for payments
        const transactionId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        console.log("STORE: Processing payment with transaction ID:", { 
          clientName: clientName.trim(), 
          amount, 
          transactionId 
        });
        
        // Only update for actual payments, not sales
        clientSlice.updateClientPurchase(clientName.trim(), amount, "Payment", 1, transactionId);
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
      // User slice with enhanced sync method
      ...userSlice,
      
      // Override syncDataWithSupabase to support silent option
      syncDataWithSupabase: async (options: { silent?: boolean } = {}) => {
        return userSlice.syncDataWithSupabase(options);
      },
      
      // Company slice
      ...companySlice,
      // Expiry slice
      ...expirySlice,
      
      // ENHANCED: Override set method for specific actions to trigger Supabase sync
      setProducts: (products) => {
        console.log("STORE: Setting products:", products.length);
        setWithAutoSave({ products });
      },
      setSales: (sales) => {
        console.log("STORE: Setting sales:", sales.length);
        setWithAutoSave({ sales });
      },
      setClients: (clients) => {
        console.log("STORE: Setting clients:", clients.length);
        setWithAutoSave({ clients });
      },
      setPayments: (payments) => {
        console.log("STORE: Setting payments:", payments.length);
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
      
      // ENHANCED: Add debug function to clear processed transactions
      clearProcessedTransactions: () => {
        console.log("STORE: Clearing processed transactions");
        if (clientSlice.clearProcessedTransactions) {
          clientSlice.clearProcessedTransactions();
        }
      },
      
      // ENHANCED: Add function to recalculate client totals
      recalculateClientTotals: (clientId: number) => {
        console.log("STORE: Recalculating client totals for:", clientId);
        if (clientSlice.recalculateClientTotals) {
          clientSlice.recalculateClientTotals(clientId);
        }
      },
      
      // ENHANCED: Set up realtime updates with better cleanup
      setupRealtimeUpdates: (userId: string): (() => void) => {
        console.log("STORE: Setting up realtime updates for user:", userId);
        
        // Clean up any existing subscription
        if (realtimeUnsubscribe) {
          console.log("STORE: Cleaning up existing subscription");
          realtimeUnsubscribe();
          realtimeUnsubscribe = null;
        }
        
        // Set up new subscription
        realtimeUnsubscribe = setupRealtimeSubscription(userId, (userData) => {
          console.log("STORE: Receiving realtime update:", {
            productsCount: Array.isArray(userData.products) ? userData.products.length : 0,
            salesCount: Array.isArray(userData.sales) ? userData.sales.length : 0,
            clientsCount: Array.isArray(userData.clients) ? userData.clients.length : 0,
            paymentsCount: Array.isArray(userData.payments) ? userData.payments.length : 0
          });
          
          // Process the update using our utility function
          processRealtimeUpdate(userData, get, set);
        });
        
        // Force a data sync on setup
        const { syncDataWithSupabase } = get();
        syncDataWithSupabase().catch(error => {
          console.error("STORE: Error syncing data during realtime setup:", error);
        });
        
        // Always return a cleanup function, even if realtimeUnsubscribe is null
        return () => {
          console.log("STORE: Cleanup function called");
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
