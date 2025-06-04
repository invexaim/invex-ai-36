
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export async function saveUserDataToSupabase(userId: string, state: any) {
  console.log("Saving data to Supabase for user:", userId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("User not authenticated or ID mismatch");
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

export async function fetchUserDataFromSupabase(userId: string) {
  console.log("Starting data sync for user:", userId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("User not authenticated or ID mismatch");
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
        console.log("No existing data found for user");
        return null;
      } else {
        console.error('Error fetching data:', error);
        toast.error("Failed to load your data");
        throw error;
      }
    } 
    
    if (data) {
      console.log('Found existing data for user:', data);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching data from Supabase:', error);
    toast.error("Error loading your data");
    throw error;
  }
}

export async function createEmptyUserData(userId: string) {
  console.log("Creating empty user data record for user:", userId);
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    console.error("User not authenticated or ID mismatch");
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
      console.error('Error inserting empty data to Supabase:', error);
      toast.error("Failed to initialize your data");
      throw error;
    } else {
      console.log("Successfully created empty data record in Supabase");
      return {
        products: [],
        sales: [],
        clients: [],
        payments: []
      };
    }
  } catch (error) {
    console.error('Error creating empty user data:', error);
    toast.error("Failed to initialize your data");
    throw error;
  }
}

export function setupRealtimeSubscription(userId: string, dataUpdateCallback: (data: any) => void) {
  console.log("Setting up realtime subscription for user:", userId);
  
  // First unsubscribe from any existing channels to prevent duplicate subscriptions
  try {
    // Clean up any existing subscriptions
    supabase.removeAllChannels();
    console.log("Removed all existing channels before setting up new subscription");
  } catch (e) {
    console.error("Error removing existing channels:", e);
  }
  
  const channel = supabase
    .channel('user_data_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log("Received realtime update:", payload);
        if (payload.new) {
          // Check if update timestamp is recent to avoid processing stale updates
          const updateTime = new Date(payload.new.updated_at).getTime();
          const now = Date.now();
          const isRecentUpdate = (now - updateTime) < 60000; // Within last minute
          
          if (isRecentUpdate) {
            console.log("Processing update from another device");
            // The callback will update the store with the new data
            dataUpdateCallback(payload.new);
          } else {
            console.log("Ignoring stale update");
          }
        }
      }
    )
    .subscribe((status) => {
      console.log("Realtime subscription status:", status);
      if (status === "SUBSCRIBED") {
        console.log("Successfully subscribed to realtime updates for user:", userId);
      } else if (status === "CHANNEL_ERROR") {
        console.error("Error subscribing to realtime updates");
        // Try to resubscribe after a delay
        setTimeout(() => {
          console.log("Attempting to resubscribe to realtime updates");
          channel.subscribe();
        }, 5000);
      }
    });
  
  // Return unsubscribe function
  return () => {
    console.log("Removing realtime subscription");
    supabase.removeChannel(channel);
  };
}
