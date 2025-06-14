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
    
    // Combine all slices and methods - ENSURE storeMethods override slice methods
    const combinedStore = {
      // Product slice
      ...slices.productSlice,
      // Sale slice - but recordSale will be overridden by storeMethods
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
      // Meeting slice
      ...slices.meetingSlice,
      // Expiry slice
      ...slices.expirySlice,
      // Store methods - these OVERRIDE any slice methods with same names
      ...storeMethods,
      // EXPLICITLY ensure recordSale is from storeMethods
      recordSale: storeMethods.recordSale,
      addSale: storeMethods.addSale
    };
    
    console.log("APP STORE: Final store recordSale type:", typeof combinedStore.recordSale);
    return combinedStore;
  }
);

export default useAppStore;
