
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, Client, Payment } from '@/types';

import { ProductState, createProductSlice } from './slices/productSlice';
import { SaleState, createSaleSlice } from './slices/saleSlice';
import { ClientState, createClientSlice } from './slices/clientSlice';
import { PaymentState, createPaymentSlice } from './slices/paymentSlice';

// Combine all state types
interface AppState extends 
  ProductState,
  SaleState,
  ClientState,
  PaymentState {}

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
      
      // Combine all slices
      return {
        ...productSlice,
        ...saleSlice,
        ...clientSlice,
        ...paymentSlice,
      };
    },
    {
      name: 'invex-store', // Name for the persisted storage
    }
  )
);

export default useAppStore;
