
import { AppState } from './types';
import { createPersistedStore } from './createStore';
import { createStoreConfiguration } from './config/storeConfig';
import { integrateSlices } from './integration/sliceIntegration';
import { createStoreMethods } from './methods/storeMethods';

// Create a combined store with all slices
const useAppStore = createPersistedStore<AppState>(
  (set, get, store) => {
    // Create store configuration
    const { saveDataToSupabase, setWithAutoSave, setupRealtimeUpdates } = createStoreConfiguration(set, get);
    
    // Integrate all slices
    const slices = integrateSlices(set, get, store, saveDataToSupabase, setWithAutoSave);
    
    // Create store methods
    const storeMethods = createStoreMethods(set, get, setWithAutoSave, slices, saveDataToSupabase, setupRealtimeUpdates);
    
    // Combine all slices and methods
    return {
      // Product slice
      ...slices.productSlice,
      // Sale slice
      ...slices.saleSlice,
      // Client slice
      ...slices.clientSlice,
      // Payment slice with deletePayment explicitly included
      ...slices.paymentSlice,
      deletePayment: slices.paymentSlice.deletePayment,
      // User slice
      ...slices.userSlice,
      // Company slice
      ...slices.companySlice,
      // Expiry slice
      ...slices.expirySlice,
      // Store methods
      ...storeMethods
    };
  }
);

export default useAppStore;
