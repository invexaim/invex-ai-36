
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, Client, Payment } from '@/types';
import { supabase } from '@/integrations/supabase/client';

import { ProductState, createProductSlice } from './slices/productSlice';
import { SaleState, createSaleSlice } from './slices/saleSlice';
import { ClientState, createClientSlice } from './slices/clientSlice';
import { PaymentState, createPaymentSlice } from './slices/paymentSlice';

// Add user state
interface UserState {
  currentUser: any | null;
  setCurrentUser: (user: any | null) => void;
  syncDataWithSupabase: () => Promise<void>;
}

// Combine all state types
interface AppState extends 
  ProductState,
  SaleState,
  ClientState,
  PaymentState,
  UserState {}

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
        if (!currentUser) return;
        
        try {
          const userId = currentUser.id;
          
          // First, try to fetch existing data from Supabase
          const { data: existingData, error } = await supabase
            .from('user_data')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching data:', error);
            return;
          }
          
          if (existingData) {
            // If data exists in Supabase, update local state
            set({
              products: existingData.products || [],
              sales: existingData.sales || [],
              clients: existingData.clients || [],
              payments: existingData.payments || []
            });
          } else {
            // If no data exists yet, save current data to Supabase
            const currentData = {
              user_id: userId,
              products: get().products,
              sales: get().sales,
              clients: get().clients,
              payments: get().payments
            };
            
            await supabase
              .from('user_data')
              .insert(currentData);
          }
        } catch (error) {
          console.error('Error syncing data with Supabase:', error);
        }
      };
      
      const saveDataToSupabase = async () => {
        const { currentUser } = get();
        if (!currentUser) return;
        
        try {
          const userId = currentUser.id;
          const currentData = {
            user_id: userId,
            products: get().products,
            sales: get().sales,
            clients: get().clients,
            payments: get().payments,
            updated_at: new Date().toISOString()
          };
          
          const { error } = await supabase
            .from('user_data')
            .upsert(currentData);
          
          if (error) {
            console.error('Error saving data to Supabase:', error);
          }
        } catch (error) {
          console.error('Error saving to Supabase:', error);
        }
      };
      
      // User state
      const userState: UserState = {
        currentUser: null,
        setCurrentUser: (user) => set({ currentUser: user }),
        syncDataWithSupabase
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
    }
  )
);

export default useAppStore;
