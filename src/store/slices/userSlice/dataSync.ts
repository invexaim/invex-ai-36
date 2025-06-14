
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Track active subscriptions to prevent duplicates
let activeSubscriptions = new Set<string>();

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
      toast.error("Failed to save your changes");
      throw error;
    } else {
      console.log("DATASYNC: Data successfully saved to Supabase");
    }
  } catch (error) {
    console.error('DATASYNC: Error saving to Supabase:', error);
    toast.error("Error saving your changes");
    throw error;
  }
}

export async function fetchUserDataFromSupabase(userId: string) {
  console.log("DATASYNC: Starting data sync for user:", userId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("DATASYNC: User not authenticated or ID mismatch");
    toast.error("Authentication required to load data");
    throw new Error("Authentication required");
  }
  
  try {
    // Try to fetch existing data from Supabase using RLS-protected query
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log("DATASYNC: No existing data found for user");
        return null;
      } else {
        console.error('DATASYNC: Error fetching data:', error);
        toast.error("Failed to load your data");
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
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('DATASYNC: Error fetching data from Supabase:', error);
    toast.error("Error loading your data");
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
          // Check if update timestamp is recent to avoid processing stale updates
          const updateTime = new Date(payload.new.updated_at).getTime();
          const now = Date.now();
          const isRecentUpdate = (now - updateTime) < 120000; // Within last 2 minutes
          
          if (isRecentUpdate) {
            console.log("DATASYNC: Processing update from another device");
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
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log("DATASYNC: Attempting to resubscribe to realtime updates");
          if (!activeSubscriptions.has(subscriptionKey)) {
            setupRealtimeSubscription(userId, dataUpdateCallback);
          }
        }, 10000); // Wait 10 seconds before retry
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
