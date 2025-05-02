
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserState, UserDataRow, isUserDataRow } from '../types';

export const createUserSlice = (
  set: any,
  get: any,
  saveDataToSupabase: () => Promise<void>
) => ({
  currentUser: null,
  
  setCurrentUser: (user: any | null) => set({ currentUser: user }),
  
  clearLocalData: () => {
    console.log("Clearing local state for UI refresh only, not affecting stored data");
    // Make sure to save data to Supabase before clearing local state
    const { currentUser } = get();
    if (currentUser) {
      console.log("Saving data before logout");
      saveDataToSupabase()
        .then(() => {
          console.log("Data saved successfully before logout");
          // Only clear the user information, not the actual data
          set({ currentUser: null });
        })
        .catch(error => {
          console.error("Error saving data before logout:", error);
          // Even if there's an error, still clear user information
          set({ currentUser: null });
        });
    } else {
      // No current user, just clear user information
      set({ currentUser: null });
    }
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
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No existing data found for user, will create new entry");
          
          // If the local state has data, save it to Supabase first
          const localProducts = get().products || [];
          const localSales = get().sales || [];
          const localClients = get().clients || [];
          const localPayments = get().payments || [];
          
          if (localProducts.length > 0 || localSales.length > 0 || 
              localClients.length > 0 || localPayments.length > 0) {
            console.log('Saving local data to Supabase for new user');
            
            try {
              const userData: UserDataRow = {
                user_id: userId,
                products: localProducts,
                sales: localSales,
                clients: localClients,
                payments: localPayments
              };
              
              const { error: insertError } = await supabase
                .from('user_data')
                .insert(userData as any);
                
              if (insertError) {
                console.error('Error inserting data to Supabase:', insertError);
                toast.error("Failed to save your data");
                throw insertError;
              } else {
                console.log("Successfully saved initial data to Supabase");
                return; // Return early as we're already using local data
              }
            } catch (insertErr) {
              console.error('Error during initial data save:', insertErr);
              toast.error("Failed to initialize your data");
              // Continue execution to try creating empty record
            }
          }
          
          // Create empty user data record
          const userData: UserDataRow = {
            user_id: userId,
            products: [],
            sales: [],
            clients: [],
            payments: []
          };
          
          const { error: insertError } = await supabase
            .from('user_data')
            .insert(userData as any);
            
          if (insertError) {
            console.error('Error inserting empty data to Supabase:', insertError);
            toast.error("Failed to initialize your data");
            throw insertError;
          } else {
            console.log("Successfully created empty data record in Supabase");
            set({
              products: [],
              sales: [],
              clients: [],
              payments: []
            });
            return;
          }
        } else {
          console.error('Error fetching data:', error);
          toast.error("Failed to load your data");
          throw error;
        }
      } else if (data) {
        // If data exists in Supabase, use it to update local state
        console.log('Found existing data for user:', data);
        
        try {
          // Safely parse and set products
          const products = Array.isArray(data.products) ? data.products : [];
          
          // Safely parse and set sales
          const sales = Array.isArray(data.sales) ? data.sales : [];
          
          // Safely parse and set clients
          const clients = Array.isArray(data.clients) ? data.clients : [];
          
          // Safely parse and set payments
          const payments = Array.isArray(data.payments) ? data.payments : [];
          
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
        } catch (parseError) {
          console.error('Error parsing data from Supabase:', parseError);
          toast.error("Error parsing your data");
          throw parseError;
        }
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
      
      // Get current data to save
      const userData: UserDataRow = {
        user_id: userId,
        products: get().products || [],
        sales: get().sales || [],
        clients: get().clients || [],
        payments: get().payments || [],
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('user_data')
        .upsert(userData as any, { 
          onConflict: 'user_id',
          ignoreDuplicates: false
        });
      
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
