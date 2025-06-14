
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
      console.log("STORE METHODS: Setting pending sale payment:", sale);
      set({ pendingSalePayment: sale });
    },
    setPendingEstimateForSale: (estimate) => {
      console.log("STORE METHODS: Setting pending estimate for sale:", estimate);
      set({ pendingEstimateForSale: estimate });
    },
    
    // Initialize required state properties
    isSignedIn: false,
    setIsSignedIn: (isSignedIn) => set({ isSignedIn }),
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),
    pendingSalePayment: null,
    pendingEstimateForSale: null,
    
    // Expose the saveDataToSupabase function
    saveDataToSupabase,
    
    // PRIMARY recordSale function with comprehensive error handling
    recordSale: (...args) => {
      console.log("STORE METHODS: recordSale called with args:", args);
      
      // Validate slices availability
      if (!slices) {
        console.error("STORE METHODS: No slices available");
        return null;
      }
      
      if (!slices.saleSlice) {
        console.error("STORE METHODS: Sale slice not available");
        console.error("STORE METHODS: Available slices:", Object.keys(slices));
        return null;
      }
      
      if (typeof slices.saleSlice.recordSale !== 'function') {
        console.error("STORE METHODS: Sale slice recordSale function not available");
        console.error("STORE METHODS: Sale slice contents:", Object.keys(slices.saleSlice));
        return null;
      }
      
      try {
        console.log("STORE METHODS: Calling sale slice recordSale function");
        const result = slices.saleSlice.recordSale(...args);
        console.log("STORE METHODS: recordSale result:", result);
        
        if (result && result.sale_id) {
          console.log("STORE METHODS: Sale recorded successfully with ID:", result.sale_id);
          return result;
        } else if (result === null) {
          console.error("STORE METHODS: recordSale returned null");
          return null;
        } else {
          console.error("STORE METHODS: recordSale returned unexpected result:", result);
          return null;
        }
      } catch (error) {
        console.error("STORE METHODS: Error in recordSale wrapper:", error);
        return null;
      }
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
    
    // Add debug function to clear processed transactions
    clearProcessedTransactions: () => {
      console.log("STORE: Clearing processed transactions");
      if (slices.clientSlice?.clearProcessedTransactions) {
        slices.clientSlice.clearProcessedTransactions();
      }
    },
    
    // Add function to recalculate client totals
    recalculateClientTotals: (clientId: number) => {
      console.log("STORE: Recalculating client totals for:", clientId);
      if (slices.clientSlice?.recalculateClientTotals) {
        slices.clientSlice.recalculateClientTotals(clientId);
      }
    },
    
    // Setup realtime updates
    setupRealtimeUpdates
  };
};
