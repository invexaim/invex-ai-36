import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState } from './types';

import { createProductSlice } from './slices/productSlice';
import { createSaleSlice } from './slices/saleSlice';
import { createClientSlice } from './slices/clientSlice';
import { createPaymentSlice } from './slices/paymentSlice';
import { createUserSlice } from './slices/userSlice';

// Ensure we import React to fix the useSyncExternalStore issue
import * as React from 'react';

// Create a combined store with all slices
const useAppStore = create<AppState>()(
  persist(
    (...args) => {
      // Extract set and get from args
      const [set, get] = args;
      
      // Create a function that will be used to save data to Supabase
      const saveDataToSupabase = async () => {
        const { currentUser } = get();
        if (!currentUser) {
          console.log("No current user, skipping data save");
          return;
        }
        
        try {
          console.log("Saving data to Supabase from store");
          const { supabase } = await import('@/integrations/supabase/client');
          const userData = {
            user_id: currentUser.id,
            products: get().products || [],
            sales: get().sales || [],
            clients: get().clients || [],
            payments: get().payments || []
          };
          
          console.log("Saving the following data to Supabase:", {
            productsCount: userData.products.length,
            salesCount: userData.sales.length,
            clientsCount: userData.clients.length,
            paymentsCount: userData.payments.length
          });
          
          const { error } = await supabase
            .from('user_data')
            .upsert(userData as any, { 
              onConflict: 'user_id',
              ignoreDuplicates: false
            });
          
          if (error) {
            console.error('Error saving data to Supabase from store:', error);
            throw error;
          } else {
            console.log("Data successfully saved to Supabase from store");
          }
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
        }, 500); // Debounce save operations
      };
      
      // Combine all slices
      return {
        ...productSlice,
        ...saleSlice,
        ...clientSlice,
        ...paymentSlice,
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
        
        // Expose the saveDataToSupabase function
        saveDataToSupabase
      };
    },
    {
      name: 'invex-store', // Name for the persisted storage
      partialize: (state) => {
        // Only persist the data, not the user info
        // This ensures data is available locally but we rely on Supabase for the authoritative source
        const { currentUser, ...rest } = state;
        return rest;
      },
    }
  )
);

export default useAppStore;
