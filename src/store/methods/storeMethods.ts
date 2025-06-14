
import { AppState, Sale } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const createStoreMethods = (
  set: any, 
  get: any,
  setWithAutoSave: (fn: any) => void,
  slices: any,
  setupRealtimeUpdates: (userId: string) => void
) => {
  // Legacy method that matches the original signature for backward compatibility
  const recordSaleWithParams = async (
    productName: string, 
    quantitySold: number, 
    sellingPrice: number,
    clientName: string
  ) => {
    // Convert to sale data format and call the main recordSale method
    const product = get().products.find((p: Product) => p.product_name === productName);
    if (!product) {
      console.error("STORE METHODS: Product not found:", productName);
      return;
    }

    const saleData = {
      product_id: product.product_id,
      quantity_sold: quantitySold,
      selling_price: sellingPrice,
      clientName: clientName
    };

    return recordSale(saleData);
  };

  const recordSale = (saleData: Omit<Sale, 'sale_id' | 'sale_date'>): Sale => {
    try {
      console.log("STORE METHODS: Recording sale:", saleData);
      
      // Input validation
      if (!saleData.product_id || typeof saleData.product_id !== 'number') {
        console.error("STORE METHODS: Invalid product ID");
        throw new Error("Invalid product ID");
      }
      if (!saleData.quantity_sold || typeof saleData.quantity_sold !== 'number' || saleData.quantity_sold <= 0) {
        console.error("STORE METHODS: Invalid quantity sold");
        throw new Error("Invalid quantity sold");
      }
      if (!saleData.selling_price || typeof saleData.selling_price !== 'number' || saleData.selling_price <= 0) {
        console.error("STORE METHODS: Invalid selling price");
        throw new Error("Invalid selling price");
      }
      if (!saleData.clientName || typeof saleData.clientName !== 'string' || saleData.clientName.trim() === '') {
        console.error("STORE METHODS: Invalid client name");
        throw new Error("Invalid client name");
      }
      
      // Find the product
      const product = get().products.find((p: Product) => p.product_id === saleData.product_id);
      if (!product) {
        console.error("STORE METHODS: Product not found:", saleData.product_id);
        throw new Error("Product not found");
      }
      
      // Check if there are enough units in stock
      const availableUnits = parseInt(product.units as string);
      if (availableUnits < saleData.quantity_sold) {
        console.error("STORE METHODS: Not enough units in stock");
        throw new Error("Not enough units in stock");
      }
      
      // Calculate the new number of units
      const newUnits = availableUnits - saleData.quantity_sold;
      
      // Update the product units
      set((state: AppState) => ({
        products: state.products.map(p =>
          p.product_id === product.product_id ? { ...p, units: newUnits.toString() } : p
        )
      }));
      
      // Create a new sale object
      const newSale: Sale = {
        sale_id: Date.now(),
        product_id: saleData.product_id,
        quantity_sold: saleData.quantity_sold,
        selling_price: saleData.selling_price,
        sale_date: new Date().toISOString(),
        clientName: saleData.clientName,
        product: product
      };
      
      // Add the new sale to the sales array
      set((state: AppState) => ({
        sales: [...state.sales, newSale]
      }));
      
      // Update client purchase history
      if (slices.clientSlice?.updateClientPurchase) {
        slices.clientSlice.updateClientPurchase(
          saleData.clientName, 
          saleData.selling_price * saleData.quantity_sold, 
          product.product_name, 
          saleData.quantity_sold
        );
      }
      
      console.log("STORE METHODS: Sale recorded successfully");
      
      // Save data to Supabase asynchronously
      saveDataToSupabase().catch(error => {
        console.error("STORE METHODS: Error saving to Supabase:", error);
      });
      
      return newSale;
      
    } catch (error) {
      console.error("STORE METHODS: Error recording sale:", error);
      throw error;
    }
  };

  const addSale = (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => {
    try {
      console.log("STORE METHODS: Adding sale:", saleData);
      
      // Input validation
      if (!saleData.product_id || typeof saleData.product_id !== 'number') {
        console.error("STORE METHODS: Invalid product ID");
        return;
      }
      if (!saleData.quantity_sold || typeof saleData.quantity_sold !== 'number' || saleData.quantity_sold <= 0) {
        console.error("STORE METHODS: Invalid quantity sold");
        return;
      }
      if (!saleData.selling_price || typeof saleData.selling_price !== 'number' || saleData.selling_price <= 0) {
        console.error("STORE METHODS: Invalid selling price");
        return;
      }
      if (!saleData.clientName || typeof saleData.clientName !== 'string' || saleData.clientName.trim() === '') {
        console.error("STORE METHODS: Invalid client name");
        return;
      }
      
      // Find the product by ID
      const product = get().products.find((p: Product) => p.product_id === saleData.product_id);
      if (!product) {
        console.error("STORE METHODS: Product not found:", saleData.product_id);
        return;
      }
      
      // Create a new sale object
      const newSale: Sale = {
        sale_id: Date.now(),
        product_id: saleData.product_id,
        quantity_sold: saleData.quantity_sold,
        selling_price: saleData.selling_price,
        sale_date: new Date().toISOString(),
        clientName: saleData.clientName,
        product: product
      };
      
      // Add the new sale to the sales array
      set((state: AppState) => ({
        sales: [...state.sales, newSale]
      }));
      
      // Update client purchase history
      if (slices.clientSlice?.updateClientPurchase) {
        slices.clientSlice.updateClientPurchase(
          saleData.clientName, 
          saleData.selling_price * saleData.quantity_sold, 
          product.product_name, 
          saleData.quantity_sold
        );
      }
      
      console.log("STORE METHODS: Sale added successfully");
      
      // Save data to Supabase asynchronously
      saveDataToSupabase().catch(error => {
        console.error("STORE METHODS: Error saving to Supabase:", error);
      });
      
    } catch (error) {
      console.error("STORE METHODS: Error adding sale:", error);
    }
  };

  const syncDataWithSupabase = async () => {
    try {
      console.log("STORE METHODS: Starting data sync with Supabase");
      const currentUser = get().currentUser;
      
      if (!currentUser) {
        console.log("STORE METHODS: No current user, skipping sync");
        return;
      }

      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("STORE METHODS: Error fetching user data:", error);
        throw error;
      }

      if (data) {
        console.log("STORE METHODS: Found user data, updating store");
        set((state: AppState) => ({
          products: data.products || [],
          sales: data.sales || [],
          clients: data.clients || [],
          payments: data.payments || []
        }));
      } else {
        console.log("STORE METHODS: No user data found, initializing empty data");
        set((state: AppState) => ({
          products: [],
          sales: [],
          clients: [],
          payments: []
        }));
      }

      // Sync product expiries separately
      const { data: expiryData, error: expiryError } = await supabase
        .from('product_expiry')
        .select('*')
        .eq('user_id', currentUser.id);

      if (expiryError) {
        console.error("STORE METHODS: Error fetching expiry data:", expiryError);
      } else {
        console.log("STORE METHODS: Synced expiry data:", expiryData?.length || 0, "records");
        set((state: AppState) => ({
          productExpiries: expiryData || []
        }));
      }

    } catch (error) {
      console.error("STORE METHODS: Error in syncDataWithSupabase:", error);
      throw error;
    }
  };

  const saveDataToSupabase = async () => {
    try {
      console.log("STORE METHODS: Starting data save to Supabase");
      const currentUser = get().currentUser;
      
      if (!currentUser) {
        console.error("STORE METHODS: No current user, cannot save data");
        return;
      }

      const state = get();
      const userData = {
        user_id: currentUser.id,
        products: state.products,
        sales: state.sales,
        clients: state.clients,
        payments: state.payments,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_data')
        .upsert(userData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error("STORE METHODS: Error saving user data:", error);
        throw error;
      }

      // Save product expiries
      if (state.productExpiries && state.productExpiries.length > 0) {
        const expiryData = state.productExpiries.map(expiry => ({
          ...expiry,
          user_id: currentUser.id
        }));

        const { error: expiryError } = await supabase
          .from('product_expiry')
          .upsert(expiryData, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (expiryError) {
          console.error("STORE METHODS: Error saving expiry data:", expiryError);
        } else {
          console.log("STORE METHODS: Saved expiry data successfully");
        }
      }

      console.log("STORE METHODS: Data saved to Supabase successfully");
    } catch (error) {
      console.error("STORE METHODS: Error in saveDataToSupabase:", error);
      throw error;
    }
  };

  const clearLocalData = async () => {
    console.log("STORE METHODS: Clearing all local data");
    set((state: AppState) => ({
      products: [],
      sales: [],
      clients: [],
      payments: [],
      productExpiries: []
    }));
  };

  return {
    recordSale,
    recordSaleWithParams, // Keep for backward compatibility
    addSale,
    syncDataWithSupabase,
    saveDataToSupabase,
    clearLocalData
  };
};
