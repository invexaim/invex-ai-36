
import { StateCreator } from 'zustand';
import { ProductExpiry } from '@/types';
import { AppState } from '../types';

export interface ExpiryState {
  productExpiries: ProductExpiry[];
  setProductExpiries: (expiries: ProductExpiry[]) => void;
  addProductExpiry: (expiry: Omit<ProductExpiry, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => void;
  updateProductExpiryStatus: (id: string, status: 'active' | 'expired' | 'disposed') => void;
  deleteProductExpiry: (id: string) => void;
}

export const createExpirySlice: StateCreator<
  AppState,
  [],
  [],
  ExpiryState
> = (set, get) => ({
  productExpiries: [],

  setProductExpiries: (expiries) => {
    set({ productExpiries: expiries });
  },

  addProductExpiry: (expiryData) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      console.warn("No current user found when adding expiry date");
      return;
    }

    const newExpiry: ProductExpiry = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: currentUser.id,
      product_id: expiryData.product_id,
      product_name: expiryData.product_name,
      expiry_date: expiryData.expiry_date,
      batch_number: expiryData.batch_number,
      quantity: expiryData.quantity,
      status: 'active',
      notes: expiryData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      productExpiries: [...state.productExpiries, newExpiry],
    }));

    console.log("Added new product expiry:", newExpiry);
  },

  updateProductExpiryStatus: (id, status) => {
    set((state) => ({
      productExpiries: state.productExpiries.map((expiry) =>
        expiry.id === id
          ? { ...expiry, status, updated_at: new Date().toISOString() }
          : expiry
      ),
    }));

    console.log(`Updated expiry ${id} status to ${status}`);
  },

  deleteProductExpiry: (id) => {
    set((state) => ({
      productExpiries: state.productExpiries.filter((expiry) => expiry.id !== id),
    }));

    console.log("Deleted product expiry:", id);
  },
});
