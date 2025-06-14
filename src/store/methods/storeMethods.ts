
import { AppState } from '../types';

export const createStoreMethods = (
  set: any,
  get: any,
  setWithAutoSave: (fn: any) => void,
  slices: any,
  saveDataToSupabase: () => Promise<void>,
  setupRealtimeUpdates: (userId: string) => (() => void)
) => {
  return {
    // Override set method for specific actions to trigger Supabase sync
    setProducts: (products) => {
      console.log("STORE: Setting products:", products.length);
      setWithAutoSave({ products });
    },
    setSales: (sales) => {
      console.log("STORE: Setting sales:", sales.length);
      setWithAutoSave({ sales });
    },
    setClients: (clients) => {
      console.log("STORE: Setting clients:", clients.length);
      setWithAutoSave({ clients });
    },
    setPayments: (payments) => {
      console.log("STORE: Setting payments:", payments.length);
      setWithAutoSave({ payments });
    },
    setPendingSalePayment: (sale) => {
      set({ pendingSalePayment: sale });
    },
    
    // Initialize required state properties
    isSignedIn: false,
    setIsSignedIn: (isSignedIn) => set({ isSignedIn }),
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),
    pendingSalePayment: null,
    
    // Expose the saveDataToSupabase function
    saveDataToSupabase,
    
    // ENSURE recordSale is the primary function (no addSale wrapper)
    addSale: slices.saleSlice.recordSale,
    
    // Override syncDataWithSupabase to support silent option
    syncDataWithSupabase: async (options: { silent?: boolean } = {}) => {
      return slices.userSlice.syncDataWithSupabase(options);
    },
    
    // ENHANCED: Add debug function to clear processed transactions
    clearProcessedTransactions: () => {
      console.log("STORE: Clearing processed transactions");
      if (slices.clientSlice.clearProcessedTransactions) {
        slices.clientSlice.clearProcessedTransactions();
      }
    },
    
    // ENHANCED: Add function to recalculate client totals
    recalculateClientTotals: (clientId: number) => {
      console.log("STORE: Recalculating client totals for:", clientId);
      if (slices.clientSlice.recalculateClientTotals) {
        slices.clientSlice.recalculateClientTotals(clientId);
      }
    },
    
    // Setup realtime updates
    setupRealtimeUpdates
  };
};
