import { AppState } from '../types';

export const createStoreMethods = (
  set: any,
  get: any,
  setWithAutoSave: (fn: any) => void,
  slices: any,
  saveDataToSupabase: () => Promise<void>,
  setupRealtimeUpdates: (userId: string) => (() => void)
) => {
  console.log("STORE METHODS: Creating store methods with slices:", Object.keys(slices));
  console.log("STORE METHODS: Sale slice recordSale function:", typeof slices.saleSlice?.recordSale);
  
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
    
    // ENSURE recordSale is the primary function - with proper error handling
    recordSale: (...args) => {
      console.log("STORE METHODS: recordSale called with args:", args);
      if (!slices.saleSlice || typeof slices.saleSlice.recordSale !== 'function') {
        console.error("STORE METHODS: Sale slice recordSale function not available");
        console.error("STORE METHODS: Available slices:", Object.keys(slices));
        console.error("STORE METHODS: Sale slice contents:", slices.saleSlice);
        return null;
      }
      console.log("STORE METHODS: Calling sale slice recordSale function");
      return slices.saleSlice.recordSale(...args);
    },
    
    // Keep addSale for backward compatibility
    addSale: (...args) => {
      console.log("STORE METHODS: addSale called (redirecting to recordSale)");
      const storeMethods = get();
      return storeMethods.recordSale(...args);
    },
    
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
