import { create } from 'zustand';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { UserState } from './types';
import { saveUserDataToSupabase, fetchUserDataFromSupabase, createEmptyUserData } from './dataSync';
import { isUserDataRow } from '../../types';
import { clearPendingChanges } from '../../realtimeSync';

export const createUserSlice = (
  set: any,
  get: any,
  saveDataToSupabase: () => Promise<void>
) => ({
  currentUser: null,
  isSignedIn: false,
  isLoading: false,
  
  setCurrentUser: (user: User | null) => set({ currentUser: user, isSignedIn: !!user }),
  
  setIsSignedIn: (isSignedIn: boolean) => set({ isSignedIn }),
  
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  
  clearLocalData: () => {
    console.log("Clearing local state for UI refresh only, not affecting stored data");
    // Make sure to save data to Supabase before clearing local state
    const { currentUser } = get();
    if (currentUser) {
      console.log("Saving data before logout");
      saveDataToSupabase()
        .then(() => {
          console.log("Data saved successfully before logout");
          clearPendingChanges(); // Clear pending changes flag
          // Only clear the user information, not the actual data
          set({ currentUser: null, isSignedIn: false });
        })
        .catch(error => {
          console.error("Error saving data before logout:", error);
          // Even if there's an error, still clear user information
          set({ currentUser: null, isSignedIn: false });
        });
    } else {
      // No current user, just clear user information
      set({ currentUser: null, isSignedIn: false });
    }
  },
  
  syncDataWithSupabase: async () => {
    const { currentUser } = get();
    if (!currentUser) {
      console.log("No current user, skipping data sync");
      return;
    }
    
    try {
      const userId = currentUser.id;
      const userData = await fetchUserDataFromSupabase(userId);
      
      if (!userData) {
        // If no data exists in Supabase, check if we have local data to save
        const localProducts = get().products || [];
        const localSales = get().sales || [];
        const localClients = get().clients || [];
        const localPayments = get().payments || [];
        
        if (localProducts.length > 0 || localSales.length > 0 || 
            localClients.length > 0 || localPayments.length > 0) {
          console.log('Saving local data to Supabase for new user');
          await saveUserDataToSupabase(userId, get());
          return; // Return early as we're already using local data
        } else {
          // No local data, create empty record
          await createEmptyUserData(userId);
          set({
            products: [],
            sales: [],
            clients: [],
            payments: []
          });
        }
      } else {
        // Check if we should use remote data or keep local data
        const localProducts = get().products || [];
        const localSales = get().sales || [];
        const localClients = get().clients || [];
        const localPayments = get().payments || [];
        
        const hasLocalData = localProducts.length > 0 || localSales.length > 0 || 
                           localClients.length > 0 || localPayments.length > 0;
        
        if (hasLocalData) {
          // Ask user which data to keep
          const useRemoteData = confirm(
            "You have both local and cloud data. Would you like to use the cloud data? " +
            "(Click 'Cancel' to keep your local data and upload it to the cloud)"
          );
          
          if (useRemoteData) {
            // Use remote data
            const products = Array.isArray(userData.products) ? userData.products : [];
            const sales = Array.isArray(userData.sales) ? userData.sales : [];
            const clients = Array.isArray(userData.clients) ? userData.clients : [];
            const payments = Array.isArray(userData.payments) ? userData.payments : [];
            
            set({
              products,
              sales,
              clients,
              payments
            });
            
            console.log("Using cloud data");
          } else {
            // Keep local data and save to cloud
            console.log("Keeping local data and saving to cloud");
            await saveUserDataToSupabase(userId, get());
          }
        } else {
          // No local data, use remote data
          try {
            const products = Array.isArray(userData.products) ? userData.products : [];
            const sales = Array.isArray(userData.sales) ? userData.sales : [];
            const clients = Array.isArray(userData.clients) ? userData.clients : [];
            const payments = Array.isArray(userData.payments) ? userData.payments : [];
            
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
      await saveUserDataToSupabase(currentUser.id, get());
      clearPendingChanges(); // Clear pending changes after successful save
    } catch (error) {
      console.error('Error in saveDataToSupabase:', error);
      throw error;
    }
  },
  
  setupRealtimeUpdates: (userId: string): (() => void) => {
    // Implementation is in the main store to handle unsubscribe logic
    return () => {}; // Return empty function as fallback
  }
});

// Standalone store implementation
const useUserStore = create<UserState>((set, get) => 
  createUserSlice(set, get, async () => {})
);

export default useUserStore;
