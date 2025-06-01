
import { toast } from "sonner";
import { AppState } from './types';

// Variable to store the timestamp of the last update from this device
let lastUpdateTimestamp = Date.now();

// Flag to control automatic syncing - Disabled by default
let autoSyncEnabled = false;

// Track if we have pending local changes
let hasPendingChanges = false;

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
    
    // Mark that we have pending changes
    hasPendingChanges = true;
    
    // Only schedule a save operation if auto-sync is enabled and the user is logged in
    if (autoSyncEnabled) {
      setTimeout(() => {
        const state = get();
        if (state.currentUser) {
          saveDataToSupabase()
            .then(() => {
              hasPendingChanges = false; // Clear pending changes after successful save
            })
            .catch(error => {
              console.error("Error auto-saving data after state change:", error);
            });
        }
      }, 300); // Reduce debounce time for faster sync
    }
  };

  return setWithAutoSave;
}

/**
 * Processes real-time updates from Supabase
 */
export function processRealtimeUpdate(
  userData: any, 
  get: () => AppState, 
  set: (state: any) => void
): boolean {
  // If auto-sync is disabled, ignore updates
  if (!autoSyncEnabled) {
    console.log("Ignoring update: auto-sync is disabled");
    return false;
  }
  
  // If we have pending local changes, don't override them
  if (hasPendingChanges) {
    console.log("Ignoring update: pending local changes detected");
    return false;
  }
  
  // Check if this is a recent update from this device (within 10 seconds)
  const currentTime = Date.now();
  if (currentTime - lastUpdateTimestamp < 10000) {
    console.log("Ignoring recent update from this device");
    return false;
  }
  
  // Compare timestamps to see if remote data is actually newer
  const remoteTimestamp = new Date(userData.updated_at || 0).getTime();
  const localTimestamp = lastUpdateTimestamp;
  
  if (remoteTimestamp <= localTimestamp) {
    console.log("Ignoring older remote data");
    return false;
  }
  
  // Compare local data with received data to prevent unnecessary updates
  const products = Array.isArray(userData.products) ? userData.products : [];
  const sales = Array.isArray(userData.sales) ? userData.sales : [];
  const clients = Array.isArray(userData.clients) ? userData.clients : [];
  const payments = Array.isArray(userData.payments) ? userData.payments : [];
  
  const currentState = get();
  const hasDataChanged = 
    JSON.stringify(products) !== JSON.stringify(currentState.products) ||
    JSON.stringify(sales) !== JSON.stringify(currentState.sales) ||
    JSON.stringify(clients) !== JSON.stringify(currentState.clients) ||
    JSON.stringify(payments) !== JSON.stringify(currentState.payments);
    
  if (!hasDataChanged) {
    console.log("No changes detected in realtime data, ignoring update");
    return false;
  }
  
  // Only apply updates if user has been idle for a while and explicitly confirms
  console.log("Remote data is newer and different from local data");
  
  // Don't show confirmation dialog automatically - this prevents data loss
  // Instead, just log that an update is available
  console.log("Update available from another device, but preserving local changes");
  
  // Optionally show a non-intrusive notification
  toast.info("Updates available from another device", {
    id: "update-available",
    duration: 3000,
    action: {
      label: "Sync",
      onClick: () => {
        console.log("User manually triggered sync");
        set({
          products,
          sales,
          clients,
          payments
        });
        toast.success("Data synchronized", { id: "manual-sync" });
      }
    }
  });
  
  return false; // Don't auto-apply the update
}

/**
 * Updates the last update timestamp to mark that we've made a local change
 */
export function updateLastTimestamp() {
  lastUpdateTimestamp = Date.now();
  hasPendingChanges = true; // Mark that we have pending changes
}

/**
 * Enable or disable automatic syncing
 */
export function setAutoSync(enabled: boolean) {
  autoSyncEnabled = enabled;
  console.log(`Auto-sync ${enabled ? 'enabled' : 'disabled'}`);
  
  if (!enabled) {
    hasPendingChanges = false; // Clear pending changes when disabling auto-sync
  }
}

/**
 * Check if auto sync is enabled
 */
export function isAutoSyncEnabled() {
  return autoSyncEnabled;
}

/**
 * Mark that pending changes have been saved
 */
export function clearPendingChanges() {
  hasPendingChanges = false;
}

/**
 * Check if there are pending changes
 */
export function hasPendingLocalChanges() {
  return hasPendingChanges;
}
