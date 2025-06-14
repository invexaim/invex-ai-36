
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

// Tab visibility tracking
let isTabVisible = true;
let lastTabVisibilityChange = Date.now();

// User activity tracking
let lastUserActivity = Date.now();
let userActivityTimeout: NodeJS.Timeout | null = null;

// Local data backup for conflict resolution
let localDataBackup: any = null;

/**
 * Initialize tab visibility tracking
 */
const initializeTabVisibility = () => {
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
      lastTabVisibilityChange = Date.now();
      console.log("REALTIME: Tab visibility changed to:", isTabVisible ? "visible" : "hidden");
    });
  }
};

/**
 * Track user activity to prevent sync during active use
 */
const trackUserActivity = () => {
  lastUserActivity = Date.now();
  
  if (userActivityTimeout) {
    clearTimeout(userActivityTimeout);
  }
  
  // Clear activity flag after 30 seconds of inactivity
  userActivityTimeout = setTimeout(() => {
    console.log("REALTIME: User activity timeout reached");
  }, 30000);
};

// Initialize tracking when module loads
if (typeof document !== 'undefined') {
  initializeTabVisibility();
  
  // Track user interactions
  ['click', 'keydown', 'scroll', 'mousemove'].forEach(eventType => {
    document.addEventListener(eventType, trackUserActivity, { passive: true });
  });
}

/**
 * Check if we should ignore updates based on various factors
 */
const shouldIgnoreUpdate = (userData: any): boolean => {
  const currentTime = Date.now();
  
  // Ignore if tab was recently switched (within 60 seconds)
  if (currentTime - lastTabVisibilityChange < 60000) {
    console.log("REALTIME: Ignoring update - recent tab visibility change");
    return true;
  }
  
  // Ignore if this is a recent update from this device (increased to 60 seconds)
  if (currentTime - lastUpdateTimestamp < 60000) {
    console.log("REALTIME: Ignoring recent update from this device");
    return true;
  }
  
  // Ignore if user was recently active (within 10 seconds)
  if (currentTime - lastUserActivity < 10000) {
    console.log("REALTIME: Ignoring update - recent user activity");
    return true;
  }
  
  // Ignore if auto-sync is disabled
  if (!autoSyncEnabled) {
    console.log("REALTIME: Ignoring update - auto-sync is disabled");
    return true;
  }
  
  return false;
};

/**
 * Create backup of local data before sync
 */
const createLocalDataBackup = (currentState: AppState): void => {
  localDataBackup = {
    products: [...(currentState.products || [])],
    sales: [...(currentState.sales || [])],
    clients: [...(currentState.clients || [])],
    payments: [...(currentState.payments || [])],
    timestamp: Date.now()
  };
  console.log("REALTIME: Created local data backup");
};

/**
 * Intelligent merge of local and remote data
 */
const intelligentMerge = (localData: any, remoteData: any): any => {
  if (!localData || !remoteData) {
    return remoteData || localData;
  }
  
  // For now, prefer local data if it has more recent changes
  // This can be enhanced with more sophisticated merge logic
  const localTimestamp = localData.timestamp || 0;
  const remoteTimestamp = new Date(remoteData.updated_at || 0).getTime();
  
  if (localTimestamp > remoteTimestamp) {
    console.log("REALTIME: Local data is more recent, keeping local changes");
    return localData;
  }
  
  console.log("REALTIME: Remote data is more recent, using remote data");
  return remoteData;
};

/**
 * Check if data has meaningful changes
 */
const hasMeaningfulChanges = (localData: any, remoteData: any): boolean => {
  if (!localData || !remoteData) {
    return true;
  }
  
  // Compare data lengths first (quick check)
  const localCounts = {
    products: (localData.products || []).length,
    sales: (localData.sales || []).length,
    clients: (localData.clients || []).length,
    payments: (localData.payments || []).length
  };
  
  const remoteCounts = {
    products: (remoteData.products || []).length,
    sales: (remoteData.sales || []).length,
    clients: (remoteData.clients || []).length,
    payments: (remoteData.payments || []).length
  };
  
  // If counts are different, there are meaningful changes
  const hasDifferentCounts = Object.keys(localCounts).some(
    key => localCounts[key] !== remoteCounts[key]
  );
  
  if (hasDifferentCounts) {
    console.log("REALTIME: Detected meaningful changes in data counts");
    return true;
  }
  
  // Additional deep comparison can be added here if needed
  return false;
};

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
    // Create backup before applying changes
    const currentState = get();
    createLocalDataBackup(currentState);
    
    // Apply the state update
    set(fn);
    
    // Track this as user activity
    trackUserActivity();
    
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
      }, 1000); // Increased debounce time for better stability
    }
  };

  return setWithAutoSave;
}

/**
 * Processes real-time updates from Supabase with enhanced conflict resolution
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

  // Check if we should ignore this update
  if (shouldIgnoreUpdate(userData)) {
    return false;
  }
  
  // Set processing flag to prevent auto-save conflicts
  isProcessingRealtimeUpdate = true;
  updateMutex = true;
  
  try {
    // Get current state and create backup
    const currentState = get();
    createLocalDataBackup(currentState);
    
    // Compare local data with received data
    const products = Array.isArray(userData.products) ? userData.products : [];
    const sales = Array.isArray(userData.sales) ? userData.sales : [];
    const clients = Array.isArray(userData.clients) ? userData.clients : [];
    const payments = Array.isArray(userData.payments) ? userData.payments : [];
    
    // Check for meaningful changes
    if (!hasMeaningfulChanges(currentState, userData)) {
      console.log("REALTIME: No meaningful changes detected, ignoring update");
      return false;
    }
    
    // Only prompt user for significant conflicts during active use
    const isUserActive = (Date.now() - lastUserActivity) < 30000;
    const hasLocalChanges = localDataBackup && (Date.now() - localDataBackup.timestamp) < 300000; // 5 minutes
    
    if (isUserActive && hasLocalChanges) {
      // User is actively working and has recent local changes
      console.log("REALTIME: User is active with local changes, deferring sync");
      
      // Show a non-intrusive notification
      toast.info("Data updated on another device. Changes will sync when you're done.", {
        id: "deferred-sync",
        duration: 5000
      });
      
      return false;
    }
    
    // For background updates when user is not active, apply changes silently
    console.log("REALTIME: Applying background sync update");
    
    // Use intelligent merge instead of direct overwrite
    const mergedData = {
      products: intelligentMerge(currentState.products, products),
      sales: intelligentMerge(currentState.sales, sales),
      clients: intelligentMerge(currentState.clients, clients),
      payments: intelligentMerge(currentState.payments, payments)
    };
    
    // Clear processed transactions to prevent conflicts with new data
    const { clearProcessedTransactions } = get();
    if (clearProcessedTransactions) {
      clearProcessedTransactions();
    }
    
    set(mergedData);
    
    // Only show success message if there were actual meaningful changes applied
    if (JSON.stringify(mergedData) !== JSON.stringify(currentState)) {
      toast.success("Data synchronized", {
        id: "background-sync",
        duration: 2000
      });
    }
    
    return true;
  } finally {
    // Always clear the processing flags
    setTimeout(() => {
      isProcessingRealtimeUpdate = false;
      updateMutex = false;
      console.log("REALTIME: Processing flags cleared");
    }, 2000); // Increased to 2 seconds for better stability
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

/**
 * Get local data backup
 */
export function getLocalDataBackup() {
  return localDataBackup;
}

/**
 * Force sync local data with remote (for manual sync operations)
 */
export function forceSyncWithConfirmation(
  remoteData: any,
  get: () => AppState,
  set: (state: any) => void
): boolean {
  const currentState = get();
  createLocalDataBackup(currentState);
  
  if (hasMeaningfulChanges(currentState, remoteData)) {
    const shouldSync = confirm(
      "Your data differs from the server version. Would you like to sync with the server data? " +
      "Your local changes will be preserved where possible."
    );
    
    if (shouldSync) {
      return processRealtimeUpdate(remoteData, get, set);
    }
  }
  
  return false;
}
