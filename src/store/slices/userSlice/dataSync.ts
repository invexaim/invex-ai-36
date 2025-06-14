
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
    console.error("DATASYNC: User not authenticated or ID mismatch", { 
      expectedUserId: userId, 
      actualUserId: user?.id 
    });
    toast.error("Authentication error - please log in again");
    // Clear potentially stale data
    localStorage.removeItem('invex_data_backup');
    sessionStorage.removeItem('invex_data_backup');
    throw new Error("Authentication required");
  }
  
  try {
    // Create backup before saving
    const backupData = {
      products: [...(state.products || [])],
      sales: [...(state.sales || [])],
      clients: [...(state.clients || [])],
      payments: [...(state.payments || [])],
      timestamp: Date.now(),
      userId: userId // Include userId in backup for verification
    };
    
    // Save backup to sessionStorage for recovery
    try {
      sessionStorage.setItem('invex_data_backup', JSON.stringify(backupData));
    } catch (e) {
      console.warn("DATASYNC: Could not save backup to sessionStorage");
    }
    
    // Get current data to save - ensure user_id is explicitly set
    const userData = {
      user_id: userId,
      products: state.products || [],
      sales: state.sales || [],
      clients: state.clients || [],
      payments: state.payments || [],
      updated_at: new Date().toISOString()
    };
    
    console.log("DATASYNC: Saving data for user ID:", userId, {
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
      console.log("DATASYNC: Data successfully saved to Supabase for user:", userId);
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
  
  // Check if user is authenticated and matches expected userId
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("DATASYNC: User not authenticated or ID mismatch", { 
      expectedUserId: userId, 
      actualUserId: user?.id 
    });
    if (!options.skipConflictCheck) {
      toast.error("Authentication error - please log in again");
      // Clear potentially stale data
      localStorage.removeItem('invex_data_backup');
      sessionStorage.removeItem('invex_data_backup');
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
        // Verify backup belongs to current user
        if (localBackup.userId && localBackup.userId !== userId) {
          console.warn("DATASYNC: Local backup belongs to different user, clearing");
          sessionStorage.removeItem('invex_data_backup');
          localBackup = null;
        } else {
          console.log("DATASYNC: Found local backup data for user:", userId);
        }
      }
    } catch (e) {
      console.warn("DATASYNC: Could not parse local backup");
      sessionStorage.removeItem('invex_data_backup');
    }
    
    // Try to fetch existing data from Supabase using RLS-protected query
    console.log("DATASYNC: Fetching data for authenticated user:", userId);
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log("DATASYNC: No existing data found for user:", userId);
        
        // If we have local backup, offer to restore it
        if (localBackup && !options.skipConflictCheck) {
          const shouldRestore = confirm(
            "No data found on server, but you have local backup data. Would you like to restore it?"
          );
          
          if (shouldRestore) {
            console.log("DATASYNC: Restoring from local backup for user:", userId);
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
        console.error('DATASYNC: Error fetching data for user:', userId, error);
        if (!options.skipConflictCheck) {
          toast.error("Failed to load your data");
        }
        throw error;
      }
    } 
    
    if (data) {
      // Verify data belongs to current user (extra safety check)
      if (data.user_id !== userId) {
        console.error('DATASYNC: Data user_id mismatch!', { 
          dataUserId: data.user_id, 
          expectedUserId: userId 
        });
        toast.error("Data access error - please log in again");
        throw new Error("Data access violation");
      }
      
      console.log('DATASYNC: Found existing data for user:', userId, {
        productsCount: Array.isArray(data.products) ? data.products.length : 0,
        salesCount: Array.isArray(data.sales) ? data.sales.length : 0,
        clientsCount: Array.isArray(data.clients) ? data.clients.length : 0,
        paymentsCount: Array.isArray(data.payments) ? data.payments.length : 0
      });
      
      // Check for conflicts with local backup
      if (localBackup && !options.skipConflictCheck) {
        const conflicts = detectConflicts(localBackup, data);
        
        if (conflicts.length > 0) {
          console.log("DATASYNC: Detected conflicts between local and remote data for user:", userId);
          
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
    console.error('DATASYNC: Error fetching data from Supabase for user:', userId, error);
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
    console.error("DATASYNC: User not authenticated or ID mismatch for createEmptyUserData", { 
      expectedUserId: userId, 
      actualUserId: user?.id 
    });
    toast.error("Authentication error - please log in again");
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
    
    console.log("DATASYNC: Creating empty data for user:", userId);
    const { error } = await supabase
      .from('user_data')
      .insert(userData as any);
      
    if (error) {
      console.error('DATASYNC: Error inserting empty data to Supabase for user:', userId, error);
      toast.error("Failed to initialize your data");
      throw error;
    } else {
      console.log("DATASYNC: Successfully created empty data record in Supabase for user:", userId);
      return {
        products: [],
        sales: [],
        clients: [],
        payments: []
      };
    }
  } catch (error) {
    console.error('DATASYNC: Error creating empty user data for user:', userId, error);
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
        console.log("DATASYNC: Received realtime update for user:", userId, {
          updateTime: payload.new?.updated_at,
          hasNewData: !!payload.new
        });
        
        if (payload.new) {
          // Verify the update is for the correct user (extra safety)
          if (payload.new.user_id !== userId) {
            console.error("DATASYNC: Received update for wrong user!", {
              expectedUserId: userId,
              receivedUserId: payload.new.user_id
            });
            return;
          }
          
          // Enhanced time checking for realtime updates
          const updateTime = new Date(payload.new.updated_at).getTime();
          const now = Date.now();
          const isRecentUpdate = (now - updateTime) < 300000; // Within last 5 minutes (increased)
          
          if (isRecentUpdate) {
            console.log("DATASYNC: Processing update from another device for user:", userId);
            
            // Enhanced update processing with better filtering
            const timeSinceUpdate = now - updateTime;
            console.log("DATASYNC: Update is", Math.round(timeSinceUpdate / 1000), "seconds old");
            
            // The callback will update the store with the new data
            dataUpdateCallback(payload.new);
          } else {
            console.log("DATASYNC: Ignoring stale update for user:", userId, {
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
        console.error("DATASYNC: Error subscribing to realtime updates for user:", userId);
        // Mark subscription as failed
        activeSubscriptions.delete(subscriptionKey);
        // Enhanced retry logic with exponential backoff
        const retryDelay = Math.min(30000, 5000 * Math.pow(2, activeSubscriptions.size)); // Max 30 seconds
        setTimeout(() => {
          console.log("DATASYNC: Attempting to resubscribe to realtime updates after", retryDelay / 1000, "seconds for user:", userId);
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
