
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserState, UserDataRow } from '../types';

export const createUserSlice = (
  set: any,
  get: any,
  saveDataToSupabase: () => Promise<void>
) => ({
  currentUser: null,
  
  setCurrentUser: (user: any | null) => set({ currentUser: user }),
  
  clearLocalData: () => {
    set({ 
      products: [], 
      sales: [], 
      clients: [], 
      payments: [] 
    });
  },
  
  syncDataWithSupabase: async () => {
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
            products: get().products,
            sales: get().sales,
            clients: get().clients,
            payments: get().payments
          };
          
          const { error: insertError } = await supabase
            .from('user_data')
            .insert(userData);
            
          if (insertError) {
            console.error('Error inserting data to Supabase:', insertError);
            toast.error("Failed to save your data");
            throw insertError;
          } else {
            console.log("Successfully saved initial data to Supabase");
          }
        } else {
          console.error('Error fetching data:', error);
          toast.error("Failed to load your data");
          throw error;
        }
      } else if (existingData) {
        // If data exists in Supabase, parse JSON data and update local state
        console.log('Found existing data for user:', existingData);
        
        // Safely parse and set products
        const products = Array.isArray(existingData.products) 
          ? existingData.products
          : [];
        
        // Safely parse and set sales
        const sales = Array.isArray(existingData.sales) 
          ? existingData.sales
          : [];
        
        // Safely parse and set clients
        const clients = Array.isArray(existingData.clients) 
          ? existingData.clients
          : [];
        
        // Safely parse and set payments
        const payments = Array.isArray(existingData.payments) 
          ? existingData.payments
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
      throw error;
    }
  },
  
  saveDataToSupabase: async () => {
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
        products: get().products,
        sales: get().sales,
        clients: get().clients,
        payments: get().payments,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('user_data')
        .upsert(userData, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error saving data to Supabase:', error);
        toast.error("Failed to save your changes");
        throw error;
      } else {
        console.log("Data successfully saved to Supabase");
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      toast.error("Error saving your changes");
      throw error;
    }
  }
});

// This is just a placeholder since the standalone store needs deeper integration
const useUserStore = create<UserState>((set, get) => 
  createUserSlice(set, get, async () => {})
);

export default useUserStore;
