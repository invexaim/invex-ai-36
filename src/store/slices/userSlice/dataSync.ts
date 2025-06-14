
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Track active subscriptions to prevent duplicates
let activeSubscriptions = new Set<string>();

// Enhanced conflict detection and resolution
interface DataConflict {
  local: any;
  remote: any;
  field: string;
}

/**
 * Detect conflicts between local and remote data
 */
const detectConflicts = (localData: any, remoteData: any): DataConflict[] => {
  const conflicts: DataConflict[] = [];
  
  if (!localData || !remoteData) {
    return conflicts;
  }
  
  // Compare each data type
  ['products', 'sales', 'clients', 'payments'].forEach(field => {
    const localArray = localData[field] || [];
    const remoteArray = remoteData[field] || [];
    
    if (JSON.stringify(localArray) !== JSON.stringify(remoteArray)) {
      conflicts.push({
        local: localArray,
        remote: remoteArray,
        field
      });
    }
  });
  
  return conflicts;
};

/**
 * Resolve conflicts with user preference for local data
 */
const resolveConflicts = (conflicts: DataConflict[]): any => {
  const resolved: any = {};
  
  conflicts.forEach(conflict => {
    // For now, prefer local data with more items (user has been working)
    const localCount = Array.isArray(conflict.local) ? conflict.local.length : 0;
    const remoteCount = Array.isArray(conflict.remote) ? conflict.remote.length : 0;
    
    if (localCount >= remoteCount) {
      resolved[conflict.field] = conflict.local;
      console.log(`DATASYNC: Resolved conflict for ${conflict.field} - keeping local data (${localCount} items)`);
    } else {
      resolved[conflict.field] = conflict.remote;
      console.log(`DATASYNC: Resolved conflict for ${conflict.field} - using remote data (${remoteCount} items)`);
    }
  });
  
  return resolved;
};

export async function saveUserDataToSupabase(userId: string, state: any) {
  console.log("DATASYNC: Saving data to Supabase for user:", userId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("DATASYNC: User not authenticated or ID mismatch");
    toast.error("Authentication required to save data");
    throw new Error("Authentication required");
  }
  
  try {
    // Create backup before saving
    const backupData = {
      products: [...(state.products || [])],
      sales: [...(state.sales || [])],
      clients: [...(state.clients || [])],
      payments: [...(state.payments || [])],
      timestamp: Date.now()
    };
    
    // Save backup to sessionStorage for recovery
    try {
      sessionStorage.setItem('invex_data_backup', JSON.stringify(backupData));
    } catch (e) {
      console.warn("DATASYNC: Could not save backup to sessionStorage");
    }
    
    // Get current data to save
    const userData = {
      user_id: userId,
      products: state.products || [],
      sales: state.sales || [],
      clients: state.clients || [],
      payments: state.payments || [],
      updated_at: new Date().toISOString()
    };
    
    console.log("DATASYNC: Saving data:", {
      productsCount: userData.products.length,
      salesCount: userData.sales.length,
      clientsCount: userData.clients.length,
      paymentsCount: userData.payments.length
    });
    
    const { error } = await supabase
      .from('user_data')
      .upsert(userData as any, { 
        onConflict: 'user_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('DATASYNC: Error saving data to Supabase:', error);
      
      // Try to restore from backup
      const backup = sessionStorage.getItem('invex_data_backup');
      if (backup) {
        console.log("DATASYNC: Data save failed, backup available for recovery");
      }
      
      toast.error("Failed to save your changes - data backed up locally");
      throw error;
    } else {
      console.log("DATASYNC: Data successfully saved to Supabase");
      // Clear backup after successful save
      sessionStorage.removeItem('invex_data_backup');
    }
  } catch (error) {
    console.error('DATASYNC: Error saving to Supabase:', error);
    toast.error("Error saving your changes - data backed up locally");
    throw error;
  }
}

export async function fetchUserDataFromSupabase(userId: string, options: { skipConflictCheck?: boolean } = {}) {
  console.log("DATASYNC: Starting data sync for user:", userId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("DATASYNC: User not authenticated or ID mismatch");
    if (!options.skipConflictCheck) {
      toast.error("Authentication required to load data");
    }
    throw new Error("Authentication required");
  }
  
  try {
    // Check for local backup first
    let localBackup = null;
    try {
      const backup = sessionStorage.getItem('invex_data_backup');
      if (backup) {
        localBackup = JSON.parse(backup);
        console.log("DATASYNC: Found local backup data");
      }
    } catch (e) {
      console.warn("DATASYNC: Could not parse local backup");
    }
    
    // Try to fetch existing data from Supabase using RLS-protected query
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log("DATASYNC: No existing data found for user");
        
        // If we have local backup, offer to restore it
        if (localBackup && !options.skipConflictCheck) {
          const shouldRestore = confirm(
            "No data found on server, but you have local backup data. Would you like to restore it?"
          );
          
          if (shouldRestore) {
            console.log("DATASYNC: Restoring from local backup");
            return {
              products: localBackup.products || [],
              sales: localBackup.sales || [],
              clients: localBackup.clients || [],
              payments: localBackup.payments || []
            };
          }
        }
        
        return null;
      } else {
        console.error('DATASYNC: Error fetching data:', error);
        if (!options.skipConflictCheck) {
          toast.error("Failed to load your data");
        }
        throw error;
      }
    } 
    
    if (data) {
      console.log('DATASYNC: Found existing data for user:', {
        productsCount: Array.isArray(data.products) ? data.products.length : 0,
        salesCount: Array.isArray(data.sales) ? data.sales.length : 0,
        clientsCount: Array.isArray(data.clients) ? data.clients.length : 0,
        paymentsCount: Array.isArray(data.payments) ? data.payments.length : 0
      });
      
      // Check for conflicts with local backup
      if (localBackup && !options.skipConflictCheck) {
        const conflicts = detectConflicts(localBackup, data);
        
        if (conflicts.length > 0) {
          console.log("DATASYNC: Detected conflicts between local and remote data");
          
          const shouldResolveConflicts = confirm(
            `Found differences between your local data and server data. ` +
            `Would you like to automatically resolve conflicts? ` +
            `(Your local changes will be preserved where possible)`
          );
          
          if (shouldResolveConflicts) {
            const resolvedData = resolveConflicts(conflicts);
            
            // Merge resolved data with remote data
            const mergedData = {
              products: resolvedData.products || data.products || [],
              sales: resolvedData.sales || data.sales || [],
              clients: resolvedData.clients || data.clients || [],
              payments: resolvedData.payments || data.payments || []
            };
            
            toast.success("Data conflicts resolved - local changes preserved");
            return mergedData;
          }
        }
      }
      
      // Clear backup after successful sync
      if (localBackup) {
        sessionStorage.removeItem('invex_data_backup');
      }
      
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('DATASYNC: Error fetching data from Supabase:', error);
    if (!options.skipConflictCheck) {
      toast.error("Error loading your data");
    }
    throw error;
  }
}

export async function createEmptyUserData(userId: string) {
  console.log("DATASYNC: Creating empty user data record for user:", userId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("DATASYNC: User not authenticated or ID mismatch");
    toast.error("Authentication required to initialize data");
    throw new Error("Authentication required");
  }
  
  try {
    const userData = {
      user_id: userId,
      products: [],
      sales: [],
      clients: [],
      payments: []
    };
    
    const { error } = await supabase
      .from('user_data')
      .insert(userData as any);
      
    if (error) {
      console.error('DATASYNC: Error inserting empty data to Supabase:', error);
      toast.error("Failed to initialize your data");
      throw error;
    } else {
      console.log("DATASYNC: Successfully created empty data record in Supabase");
      return {
        products: [],
        sales: [],
        clients: [],
        payments: []
      };
    }
  } catch (error) {
    console.error('DATASYNC: Error creating empty user data:', error);
    toast.error("Failed to initialize your data");
    throw error;
  }
}

export function setupRealtimeSubscription(userId: string, dataUpdateCallback: (data: any) => void) {
  const subscriptionKey = `user_data_${userId}`;
  
  // Check if subscription already exists
  if (activeSubscriptions.has(subscriptionKey)) {
    console.log("DATASYNC: Subscription already exists for user:", userId);
    return () => {
      console.log("DATASYNC: Cleanup called for existing subscription");
      activeSubscriptions.delete(subscriptionKey);
      supabase.removeAllChannels();
    };
  }
  
  console.log("DATASYNC: Setting up NEW realtime subscription for user:", userId);
  
  // Clean up any existing channels to prevent duplicate subscriptions
  try {
    supabase.removeAllChannels();
    activeSubscriptions.clear(); // Clear tracking as well
    console.log("DATASYNC: Removed all existing channels before setting up new subscription");
  } catch (e) {
    console.error("DATASYNC: Error removing existing channels:", e);
  }
  
  // Mark this subscription as active
  activeSubscriptions.add(subscriptionKey);
  
  const channel = supabase
    .channel(`user_data_changes_${userId}`) // Make channel name unique per user
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log("DATASYNC: Received realtime update:", {
          userId,
          updateTime: payload.new?.updated_at,
          hasNewData: !!payload.new
        });
        
        if (payload.new) {
          // Enhanced time checking for realtime updates
          const updateTime = new Date(payload.new.updated_at).getTime();
          const now = Date.now();
          const isRecentUpdate = (now - updateTime) < 300000; // Within last 5 minutes (increased)
          
          if (isRecentUpdate) {
            console.log("DATASYNC: Processing update from another device");
            
            // Enhanced update processing with better filtering
            const timeSinceUpdate = now - updateTime;
            console.log("DATASYNC: Update is", Math.round(timeSinceUpdate / 1000), "seconds old");
            
            // The callback will update the store with the new data
            dataUpdateCallback(payload.new);
          } else {
            console.log("DATASYNC: Ignoring stale update", {
              updateTime: new Date(updateTime).toISOString(),
              now: new Date(now).toISOString(),
              ageMinutes: Math.round((now - updateTime) / 60000)
            });
          }
        }
      }
    )
    .subscribe((status) => {
      console.log("DATASYNC: Realtime subscription status:", status, "for user:", userId);
      if (status === "SUBSCRIBED") {
        console.log("DATASYNC: Successfully subscribed to realtime updates for user:", userId);
      } else if (status === "CHANNEL_ERROR") {
        console.error("DATASYNC: Error subscribing to realtime updates");
        // Mark subscription as failed
        activeSubscriptions.delete(subscriptionKey);
        // Enhanced retry logic with exponential backoff
        const retryDelay = Math.min(30000, 5000 * Math.pow(2, activeSubscriptions.size)); // Max 30 seconds
        setTimeout(() => {
          console.log("DATASYNC: Attempting to resubscribe to realtime updates after", retryDelay / 1000, "seconds");
          if (!activeSubscriptions.has(subscriptionKey)) {
            setupRealtimeSubscription(userId, dataUpdateCallback);
          }
        }, retryDelay);
      } else if (status === "CLOSED") {
        console.log("DATASYNC: Subscription closed for user:", userId);
        activeSubscriptions.delete(subscriptionKey);
      }
    });
  
  // Return enhanced cleanup function
  return () => {
    console.log("DATASYNC: Removing realtime subscription for user:", userId);
    activeSubscriptions.delete(subscriptionKey);
    supabase.removeChannel(channel);
  };
}
