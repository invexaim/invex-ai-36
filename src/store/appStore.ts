
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState } from './types';
import { toast } from "sonner";

import { createProductSlice } from './slices/productSlice';
import { createSaleSlice } from './slices/saleSlice';
import { createClientSlice } from './slices/clientSlice';
import { createPaymentSlice } from './slices/paymentSlice';
import { createUserSlice } from './slices/userSlice';
import { saveUserDataToSupabase, setupRealtimeSubscription } from './slices/userSlice/dataSync';

// Ensure we import React to fix the useSyncExternalStore issue
import * as React from 'react';

// Create a combined store with all slices
const useAppStore = create<AppState>()(
  persist(
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
        // Method to update client purchase history
        (clientName, amount) => {
          clientSlice.updateClientPurchase(clientName, amount);
        }
      );
      
      const paymentSlice = createPaymentSlice(
        set, 
        get,
        // Give payment slice access to update client
        (clientName: string, amount: number) => {
          clientSlice.updateClientPurchase(clientName, amount);
        }
      );
      
      // Add auto-save functionality when data changes
      const setWithAutoSave = (fn: any) => {
        // Apply the state update
        set(fn);
        
        // Schedule a save operation if the user is logged in
        setTimeout(() => {
          const state = get();
          if (state.currentUser) {
            saveDataToSupabase().catch(error => {
              console.error("Error auto-saving data after state change:", error);
            });
          }
        }, 300); // Reduce debounce time for faster sync
      };
      
      // Variable to store unsubscribe function for realtime updates
      let realtimeUnsubscribe: (() => void) | null = null;
      
      // Flag to prevent updates from the same device
      let lastUpdateTimestamp = Date.now();
      
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
        
        // Add the addSale alias for recordSale for backward compatibility
        addSale: (saleData) => {
          saleSlice.recordSale(saleData);
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
            
            // Check if this is a recent update from this device
            const currentTime = Date.now();
            if (currentTime - lastUpdateTimestamp < 5000) {
              console.log("Ignoring recent update from this device");
              return;
            }
            
            // Compare local data with received data to prevent unnecessary updates
            const products = Array.isArray(userData.products) ? userData.products : [];
            const sales = Array.isArray(userData.sales) ? userData.sales : [];
            const clients = Array.isArray(userData.clients) ? userData.clients : [];
            const payments = Array.isArray(userData.payments) ? userData.payments : [];
            
            const currentState = get();
            const hasDataChanged = 
              JSON.stringify(products) !== JSON.stringify(currentState.products) ||
              JSON.stringify(sales) !== JSON.stringify(currentState.sales) ||
              JSON.stringify(clients) !== JSON.stringify(currentState.clients) ||
              JSON.stringify(payments) !== JSON.stringify(currentState.payments);
              
            if (!hasDataChanged) {
              console.log("No changes detected in realtime data, ignoring update");
              return;
            }
            
            console.log("Updating store with realtime data:", { 
              productsCount: products.length,
              salesCount: sales.length,
              clientsCount: clients.length,
              paymentsCount: payments.length
            });
            
            set({
              products,
              sales,
              clients,
              payments
            });
            
            toast.success("Data synchronized from another device", {
              id: "realtime-sync",
              duration: 2000
            });
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
    },
    {
      name: 'invex-store', // Name for the persisted storage
      partialize: (state) => {
        // Only persist the data, not the user info
        // This ensures data is available locally but we rely on Supabase for the authoritative source
        const { currentUser, pendingSalePayment, ...rest } = state;
        return rest;
      },
    }
  )
);

export default useAppStore;
