
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
      // Method to update client purchase history with product details - ENSURE THIS IS ONLY CALLED ONCE
      (clientName, amount, productName, quantity) => {
        console.log("Updating client purchase from appStore:", { clientName, amount, productName, quantity });
        // Call the client slice method directly to avoid duplication
        clientSlice.updateClientPurchase(clientName, amount, productName, quantity);
      }
    );
    
    const paymentSlice = createPaymentSlice(
      set, 
      get,
      // Give payment slice access to update client
      (clientName: string, amount: number) => {
        clientSlice.updateClientPurchase(clientName, amount, "Payment", 1);
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
      // Sale slice - use the original recordSale without duplication
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
      
      // Add the addSale alias for recordSale for backward compatibility - return the sale
      addSale: saleSlice.recordSale,
      
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
