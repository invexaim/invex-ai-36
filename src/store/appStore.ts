import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, Client, Payment } from '@/types';

import { ProductState, createProductSlice } from './slices/productSlice';
import { SaleState, createSaleSlice } from './slices/saleSlice';
import { ClientState, createClientSlice } from './slices/clientSlice';
import { PaymentState, createPaymentSlice } from './slices/paymentSlice';
import { supabase } from '@/integrations/supabase/client';

// Combine all state types
interface AppState extends 
  ProductState,
  SaleState,
  ClientState,
  PaymentState {
    currentUser: string | null;
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
      
      // Combine all slices with the current user tracking
      return {
        ...productSlice,
        ...saleSlice,
        ...clientSlice,
        ...paymentSlice,
        currentUser: null,
        
        // Add method to set current user
        setCurrentUser: (userId: string | null) => {
          set({ currentUser: userId });
        },
      };
    },
    {
      name: 'invex-store', // Name for the persisted storage
      partialize: (state) => {
        // Only persist data that belongs to the current user or is not user-specific
        const userId = state.currentUser;
        
        if (!userId) {
          // If no user is logged in, don't persist any data
          return {
            currentUser: null,
            products: [],
            sales: [],
            clients: [],
            payments: []
          };
        }
        
        // Otherwise, return the full state
        return state;
      },
    }
  )
);

// Add a listener to sync the current user with Supabase
supabase.auth.onAuthStateChange((event, session) => {
  const currentStore = useAppStore.getState();
  const userId = session?.user?.id || null;
  
  // Only update if the user ID has changed
  if (currentStore.currentUser !== userId) {
    useAppStore.getState().setCurrentUser(userId);
    
    // Clear store when logging out
    if (event === 'SIGNED_OUT') {
      useAppStore.setState({
        products: [],
        sales: [],
        clients: [],
        payments: []
      });
    }
  }
});

export default useAppStore;
