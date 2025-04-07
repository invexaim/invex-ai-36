
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, Client, Payment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

import { ProductState, createProductSlice } from './slices/productSlice';
import { SaleState, createSaleSlice } from './slices/saleSlice';
import { ClientState, createClientSlice } from './slices/clientSlice';
import { PaymentState, createPaymentSlice } from './slices/paymentSlice';

// Add user state
interface UserState {
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  syncDataWithSupabase: () => Promise<void>;
  clearLocalData: () => void;
}

// Combine all state types
interface AppState extends 
  ProductState,
  SaleState,
  ClientState,
  PaymentState,
  UserState {}

// Type helper for Supabase user_data table
interface UserDataRow {
  user_id: string;
  products: Json;
  sales: Json;
  clients: Json;
  payments: Json;
  created_at?: string | null;
  updated_at?: string | null;
  id?: string;
}

// Create a combined store with all slices
const useAppStore = create<AppState>()(
  persist(
    (...args) => {
      // Extract set and get from args
      const [set, get] = args;
      
      // Create individual slices with cross-slice access
      const productSlice = createProductSlice(set, get);
      
      const clientSlice = createClientSlice(set, get);
      
      const saleSlice = createSaleSlice(
        set, 
        get, 
        // Give sale slice access to products
        () => get().products,
        // Method to update a product from the sale slice
        (updatedProduct: Product) => {
          set((state: AppState) => ({
            products: state.products.map(p => 
              p.product_id === updatedProduct.product_id ? updatedProduct : p
            )
          }));
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
      
      // Helper functions to sync with Supabase
      const syncDataWithSupabase = async () => {
        const { currentUser } = get();
        if (!currentUser) {
          console.log("No current user, skipping data sync");
          return;
        }
        
        try {
          console.log("Starting data sync for user:", currentUser.id);
          const userId = currentUser.id;
          
          // First, try to fetch existing data from Supabase
          const { data: existingData, error } = await supabase
            .from('user_data')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (error) {
            if (error.code === 'PGRST116') {
              console.log("No existing data found for user, will create new entry");
              
              // If no data exists yet, save current data to Supabase
              console.log('No existing data, saving current state to Supabase');
              const userData: UserDataRow = {
                user_id: userId,
                products: get().products as unknown as Json,
                sales: get().sales as unknown as Json,
                clients: get().clients as unknown as Json,
                payments: get().payments as unknown as Json
              };
              
              const { error: insertError } = await supabase
                .from('user_data')
                .insert(userData);
                
              if (insertError) {
                console.error('Error inserting data to Supabase:', insertError);
                toast.error("Failed to save your data");
              } else {
                console.log("Successfully saved initial data to Supabase");
              }
            } else {
              console.error('Error fetching data:', error);
              toast.error("Failed to load your data");
              return;
            }
          } else if (existingData) {
            // If data exists in Supabase, parse JSON data and update local state
            console.log('Found existing data for user:', existingData);
            
            // Safely parse and set products
            const products = Array.isArray(existingData.products) 
              ? (existingData.products as unknown) as Product[] 
              : [];
            
            // Safely parse and set sales
            const sales = Array.isArray(existingData.sales) 
              ? (existingData.sales as unknown) as Sale[] 
              : [];
            
            // Safely parse and set clients
            const clients = Array.isArray(existingData.clients) 
              ? (existingData.clients as unknown) as Client[] 
              : [];
            
            // Safely parse and set payments
            const payments = Array.isArray(existingData.payments) 
              ? (existingData.payments as unknown) as Payment[] 
              : [];
            
            console.log("Setting data from Supabase:", { 
              productsCount: products.length,
              salesCount: sales.length,
              clientsCount: clients.length,
              paymentsCount: payments.length
            });
            
            // Update store with fetched data
            set({
              products,
              sales,
              clients,
              payments
            });
            
            console.log("Data loaded successfully from Supabase");
          }
        } catch (error) {
          console.error('Error syncing data with Supabase:', error);
          toast.error("Error synchronizing your data");
        }
      };
      
      const saveDataToSupabase = async () => {
        const { currentUser } = get();
        if (!currentUser) {
          console.log("No current user, skipping data save");
          return;
        }
        
        try {
          console.log("Saving data to Supabase for user:", currentUser.id);
          const userId = currentUser.id;
          const userData: UserDataRow = {
            user_id: userId,
            products: get().products as unknown as Json,
            sales: get().sales as unknown as Json,
            clients: get().clients as unknown as Json,
            payments: get().payments as unknown as Json,
            updated_at: new Date().toISOString()
          };
          
          const { error } = await supabase
            .from('user_data')
            .upsert(userData, { onConflict: 'user_id' });
          
          if (error) {
            console.error('Error saving data to Supabase:', error);
            toast.error("Failed to save your changes");
          } else {
            console.log("Data successfully saved to Supabase");
          }
        } catch (error) {
          console.error('Error saving to Supabase:', error);
          toast.error("Error saving your changes");
        }
      };
      
      // User state
      const userState: UserState = {
        currentUser: null,
        setCurrentUser: (user) => set({ currentUser: user }),
        syncDataWithSupabase,
        clearLocalData: () => {
          set({ 
            products: [], 
            sales: [], 
            clients: [], 
            payments: [] 
          });
        }
      };
      
      // Add listeners to save data when it changes
      const originalSet = set;
      const setWithSave = (fn: any) => {
        originalSet(fn);
        const state = get();
        if (state.currentUser) {
          saveDataToSupabase();
        }
      };
      
      // Combine all slices
      return {
        ...productSlice,
        ...saleSlice,
        ...clientSlice,
        ...paymentSlice,
        ...userState,
        
        // Override set method for specific actions to trigger Supabase sync
        setProducts: (products) => {
          setWithSave({ products });
        },
        setSales: (sales) => {
          setWithSave({ sales });
        },
        setClients: (clients) => {
          setWithSave({ clients });
        },
        setPayments: (payments) => {
          setWithSave({ payments });
        },
      };
    },
    {
      name: 'invex-store', // Name for the persisted storage
      partialize: (state) => {
        // Only persist data, not the current user
        // This ensures we always fetch fresh data from Supabase on login
        const { currentUser, ...rest } = state;
        return rest;
      },
    }
  )
);

export default useAppStore;
