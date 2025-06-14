
import { StateCreator } from 'zustand';
import { ProductExpiry } from '@/types';
import { AppState } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ExpiryState {
  productExpiries: ProductExpiry[];
  setProductExpiries: (expiries: ProductExpiry[]) => void;
  addProductExpiry: (expiry: Omit<ProductExpiry, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateProductExpiryStatus: (id: string, status: 'active' | 'expired' | 'disposed') => Promise<void>;
  deleteProductExpiry: (id: string) => Promise<void>;
  loadProductExpiries: () => Promise<void>;
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

  addProductExpiry: async (expiryData) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      toast.error("Please sign in to add expiry dates");
      return;
    }

    try {
      const newExpiry = {
        user_id: currentUser.id,
        product_id: expiryData.product_id,
        product_name: expiryData.product_name,
        expiry_date: expiryData.expiry_date,
        batch_number: expiryData.batch_number,
        quantity: expiryData.quantity,
        status: 'active' as const,
        notes: expiryData.notes,
      };

      const { data, error } = await supabase
        .from('product_expiry')
        .insert([newExpiry])
        .select()
        .single();

      if (error) {
        console.error('Error adding product expiry:', error);
        toast.error("Failed to add expiry date");
        return;
      }

      // Update local state
      set((state) => ({
        productExpiries: [...state.productExpiries, data],
      }));

      console.log("Added new product expiry:", data);
      toast.success("Product expiry date added successfully");
    } catch (error) {
      console.error('Error adding product expiry:', error);
      toast.error("Failed to add expiry date");
    }
  },

  updateProductExpiryStatus: async (id, status) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      toast.error("Please sign in to update expiry status");
      return;
    }

    try {
      const { error } = await supabase
        .from('product_expiry')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error updating expiry status:', error);
        toast.error("Failed to update expiry status");
        return;
      }

      // Update local state
      set((state) => ({
        productExpiries: state.productExpiries.map((expiry) =>
          expiry.id === id
            ? { ...expiry, status, updated_at: new Date().toISOString() }
            : expiry
        ),
      }));

      console.log(`Updated expiry ${id} status to ${status}`);
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error('Error updating expiry status:', error);
      toast.error("Failed to update expiry status");
    }
  },

  deleteProductExpiry: async (id) => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      toast.error("Please sign in to delete expiry records");
      return;
    }

    try {
      const { error } = await supabase
        .from('product_expiry')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error deleting expiry record:', error);
        toast.error("Failed to delete expiry record");
        return;
      }

      // Update local state
      set((state) => ({
        productExpiries: state.productExpiries.filter((expiry) => expiry.id !== id),
      }));

      console.log("Deleted product expiry:", id);
      toast.success("Expiry record deleted");
    } catch (error) {
      console.error('Error deleting expiry record:', error);
      toast.error("Failed to delete expiry record");
    }
  },

  loadProductExpiries: async () => {
    const currentUser = get().currentUser;
    if (!currentUser) {
      console.log("No current user, skipping expiry data load");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('product_expiry')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('expiry_date', { ascending: true });

      if (error) {
        console.error('Error loading expiry data:', error);
        toast.error("Failed to load expiry data");
        return;
      }

      set({ productExpiries: data || [] });
      console.log("Loaded expiry data:", data?.length || 0, "records");
    } catch (error) {
      console.error('Error loading expiry data:', error);
      toast.error("Failed to load expiry data");
    }
  },
});
