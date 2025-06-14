
import { toast } from "sonner";
import { AppState } from './types';

// Variable to store the timestamp of the last update from this device
let lastUpdateTimestamp = Date.now();

// Flag to control automatic syncing - Disabled by default
let autoSyncEnabled = false;

// Flag to track if we're currently processing a realtime update
let isProcessingRealtimeUpdate = false;

// Mutex to prevent concurrent state updates
let updateMutex = false;

/**
 * Configures a store for auto-saving with Supabase
 */
export function configureAutoSave(
  set: any, 
  get: any, 
  saveDataToSupabase: () => Promise<void>
) {
  // Add auto-save functionality when data changes
  const setWithAutoSave = (fn: any) => {
    // Apply the state update
    set(fn);
    
    // Only schedule a save operation if auto-sync is enabled, user is logged in, 
    // and we're not processing a realtime update
    if (autoSyncEnabled && !isProcessingRealtimeUpdate) {
      setTimeout(() => {
        const state = get();
        if (state.currentUser && !isProcessingRealtimeUpdate) {
          console.log("AUTO-SAVE: Triggering auto-save after state change");
          updateLastTimestamp(); // Mark this as a local update
          saveDataToSupabase().catch(error => {
            console.error("Error auto-saving data after state change:", error);
          });
        }
      }, 500); // Increased debounce time for better stability
    }
  };

  return setWithAutoSave;
}

/**
 * Processes real-time updates from Supabase with improved deduplication
 */
export function processRealtimeUpdate(
  userData: any, 
  get: () => AppState, 
  set: (state: any) => void
): boolean {
  // Prevent concurrent updates
  if (updateMutex) {
    console.log("REALTIME: Update mutex active, skipping update");
    return false;
  }

  // If auto-sync is disabled, ignore updates
  if (!autoSyncEnabled) {
    console.log("REALTIME: Ignoring update - auto-sync is disabled");
    return false;
  }
  
  // Check if this is a recent update from this device
  const currentTime = Date.now();
  if (currentTime - lastUpdateTimestamp < 10000) { // Increased to 10 seconds
    console.log("REALTIME: Ignoring recent update from this device");
    return false;
  }
  
  // Set processing flag to prevent auto-save conflicts
  isProcessingRealtimeUpdate = true;
  updateMutex = true;
  
  try {
    // Compare local data with received data to prevent unnecessary updates
    const products = Array.isArray(userData.products) ? userData.products : [];
    const sales = Array.isArray(userData.sales) ? userData.sales : [];
    const clients = Array.isArray(userData.clients) ? userData.clients : [];
    const payments = Array.isArray(userData.payments) ? userData.payments : [];
    
    const currentState = get();
    
    // Deep comparison to detect actual changes
    const hasDataChanged = 
      JSON.stringify(products) !== JSON.stringify(currentState.products) ||
      JSON.stringify(sales) !== JSON.stringify(currentState.sales) ||
      JSON.stringify(clients) !== JSON.stringify(currentState.clients) ||
      JSON.stringify(payments) !== JSON.stringify(currentState.payments);
      
    if (!hasDataChanged) {
      console.log("REALTIME: No changes detected, ignoring update");
      return false;
    }
    
    // Always ask user permission before applying changes from another device
    if (confirm("Another device has updated your data. Would you like to sync these changes now?")) {
      console.log("REALTIME: Updating store with realtime data:", { 
        productsCount: products.length,
        salesCount: sales.length,
        clientsCount: clients.length,
        paymentsCount: payments.length
      });
      
      // Clear processed transactions to prevent conflicts with new data
      const { clearProcessedTransactions } = get();
      if (clearProcessedTransactions) {
        clearProcessedTransactions();
      }
      
      set({
        products,
        sales,
        clients,
        payments
      });
      
      toast.success("Data synchronized from another device", {
        id: "realtime-sync",
        duration: 2000
      });
      
      return true;
    } else {
      console.log("REALTIME: User rejected data sync from another device");
      return false;
    }
  } finally {
    // Always clear the processing flags
    setTimeout(() => {
      isProcessingRealtimeUpdate = false;
      updateMutex = false;
      console.log("REALTIME: Processing flags cleared");
    }, 1000); // Clear after 1 second to ensure stability
  }
}

/**
 * Updates the last update timestamp to mark that we've made a local change
 */
export function updateLastTimestamp() {
  lastUpdateTimestamp = Date.now();
  console.log("REALTIME: Updated last timestamp:", lastUpdateTimestamp);
}

/**
 * Enable or disable automatic syncing
 */
export function setAutoSync(enabled: boolean) {
  autoSyncEnabled = enabled;
  console.log(`REALTIME: Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
}

/**
 * Check if auto sync is enabled
 */
export function isAutoSyncEnabled() {
  return autoSyncEnabled;
}

/**
 * Check if currently processing realtime update
 */
export function isProcessingRealtime() {
  return isProcessingRealtimeUpdate;
}
