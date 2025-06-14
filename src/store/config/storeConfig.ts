
import { AppState } from '../types';
import { toast } from "sonner";
import { saveUserDataToSupabase, setupRealtimeSubscription } from '../slices/userSlice/dataSync';
import { configureAutoSave, processRealtimeUpdate, updateLastTimestamp } from '../realtimeSync';

export const createStoreConfiguration = (set: any, get: any) => {
  // Create a function that will be used to save data to Supabase
  const saveDataToSupabase = async () => {
    const { currentUser } = get();
    if (!currentUser) {
      console.log("STORE: No current user, skipping data save");
      return;
    }
    
    try {
      console.log("STORE: Saving data to Supabase from store");
      updateLastTimestamp(); // Mark this as a local update
      await saveUserDataToSupabase(currentUser.id, get());
    } catch (error) {
      console.error('STORE: Error in saveDataToSupabase:', error);
      throw error;
    }
  };

  // Configure auto-saving functionality
  const setWithAutoSave = configureAutoSave(set, get, saveDataToSupabase);

  // Variable to store unsubscribe function for realtime updates
  let realtimeUnsubscribe: (() => void) | null = null;

  // Setup realtime updates with better cleanup
  const setupRealtimeUpdates = (userId: string): (() => void) => {
    console.log("STORE: Setting up realtime updates for user:", userId);
    
    // Clean up any existing subscription
    if (realtimeUnsubscribe) {
      console.log("STORE: Cleaning up existing subscription");
      realtimeUnsubscribe();
      realtimeUnsubscribe = null;
    }
    
    // Set up new subscription
    realtimeUnsubscribe = setupRealtimeSubscription(userId, (userData) => {
      console.log("STORE: Receiving realtime update:", {
        productsCount: Array.isArray(userData.products) ? userData.products.length : 0,
        salesCount: Array.isArray(userData.sales) ? userData.sales.length : 0,
        clientsCount: Array.isArray(userData.clients) ? userData.clients.length : 0,
        paymentsCount: Array.isArray(userData.payments) ? userData.payments.length : 0
      });
      
      // Process the update using our utility function
      processRealtimeUpdate(userData, get, set);
    });
    
    // Force a data sync on setup
    const { syncDataWithSupabase } = get();
    syncDataWithSupabase().catch(error => {
      console.error("STORE: Error syncing data during realtime setup:", error);
    });
    
    // Always return a cleanup function, even if realtimeUnsubscribe is null
    return () => {
      console.log("STORE: Cleanup function called");
      if (realtimeUnsubscribe) {
        realtimeUnsubscribe();
        realtimeUnsubscribe = null;
      }
    };
  };

  return {
    saveDataToSupabase,
    setWithAutoSave,
    setupRealtimeUpdates
  };
};
