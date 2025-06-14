
import { AppState } from '../types';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export const createStoreMethods = (
  set: any, 
  get: any,
  setWithAutoSave: (fn: any) => void,
  slices: any,
  setupRealtimeUpdates: (userId: string) => void
) => {
  const recordSale = async (
    productName: string, 
    quantitySold: number, 
    sellingPrice: number,
    clientName: string
  ) => {
    try {
      console.log("STORE METHODS: Recording sale:", { productName, quantitySold, sellingPrice, clientName });
      
      // Input validation
      if (!productName || typeof productName !== 'string' || productName.trim() === '') {
        console.error("STORE METHODS: Invalid product name");
        return;
      }
      if (!quantitySold || typeof quantitySold !== 'number' || quantitySold <= 0) {
        console.error("STORE METHODS: Invalid quantity sold");
        return;
      }
      if (!sellingPrice || typeof sellingPrice !== 'number' || sellingPrice <= 0) {
        console.error("STORE METHODS: Invalid selling price");
        return;
      }
      if (!clientName || typeof clientName !== 'string' || clientName.trim() === '') {
        console.error("STORE METHODS: Invalid client name");
        return;
      }
      
      // Find the product by name
      const product = get().products.find((p: Product) => p.product_name === productName);
      if (!product) {
        console.error("STORE METHODS: Product not found:", productName);
        return;
      }
      
      // Check if there are enough units in stock
      const availableUnits = parseInt(product.units as string);
      if (availableUnits < quantitySold) {
        console.error("STORE METHODS: Not enough units in stock");
        return;
      }
      
      // Calculate the new number of units
      const newUnits = availableUnits - quantitySold;
      
      // Update the product units
      set((state: AppState) => ({
        products: state.products.map(p =>
          p.product_id === product.product_id ? { ...p, units: newUnits.toString() } : p
        )
      }));
      
      // Create a new sale object
      const newSale = {
        sale_id: Date.now().toString(), // Generate a unique ID
        product_id: product.product_id,
        product_name: productName,
        quantity_sold: quantitySold,
        selling_price: sellingPrice,
        sale_date: new Date().toISOString(),
        client_name: clientName
      };
      
      // Add the new sale to the sales array
      set((state: AppState) => ({
        sales: [...state.sales, newSale]
      }));
      
      // Update client purchase history
      slices.saleSlice.updateClientPurchase(clientName, sellingPrice * quantitySold, productName, quantitySold);
      
      console.log("STORE METHODS: Sale recorded successfully");
      
      // Save data to Supabase
      await saveDataToSupabase();
      
    } catch (error) {
      console.error("STORE METHODS: Error recording sale:", error);
    }
  };

  const addSale = async (sale: any) => {
    try {
      console.log("STORE METHODS: Adding sale:", sale);
      
      // Input validation
      if (!sale) {
        console.error("STORE METHODS: Invalid sale data");
        return;
      }
      if (!sale.product_id || typeof sale.product_id !== 'number') {
        console.error("STORE METHODS: Invalid product ID");
        return;
      }
      if (!sale.quantity_sold || typeof sale.quantity_sold !== 'number' || sale.quantity_sold <= 0) {
        console.error("STORE METHODS: Invalid quantity sold");
        return;
      }
      if (!sale.selling_price || typeof sale.selling_price !== 'number' || sale.selling_price <= 0) {
        console.error("STORE METHODS: Invalid selling price");
        return;
      }
      if (!sale.client_name || typeof sale.client_name !== 'string' || sale.client_name.trim() === '') {
        console.error("STORE METHODS: Invalid client name");
        return;
      }
      
      // Find the product by ID
      const product = get().products.find((p: Product) => p.product_id === sale.product_id);
      if (!product) {
        console.error("STORE METHODS: Product not found:", sale.product_id);
        return;
      }
      
      // Create a new sale object
      const newSale = {
        sale_id: Date.now().toString(), // Generate a unique ID
        product_id: sale.product_id,
        product_name: product.product_name,
        quantity_sold: sale.quantity_sold,
        selling_price: sale.selling_price,
        sale_date: new Date().toISOString(),
        client_name: sale.client_name
      };
      
      // Add the new sale to the sales array
      set((state: AppState) => ({
        sales: [...state.sales, newSale]
      }));
      
      // Update client purchase history
      slices.saleSlice.updateClientPurchase(sale.client_name, sale.selling_price * sale.quantity_sold, product.product_name, sale.quantity_sold);
      
      console.log("STORE METHODS: Sale added successfully");
      
      // Save data to Supabase
      await saveDataToSupabase();
      
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
    addSale,
    syncDataWithSupabase,
    saveDataToSupabase,
    clearLocalData
  };
};
