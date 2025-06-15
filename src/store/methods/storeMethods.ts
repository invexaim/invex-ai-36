import { AppState } from '../types';
import { Sale, Product, ProductExpiry } from '@/types';
import { toast } from 'sonner';

export const createStoreMethods = (set: any, get: any, setWithAutoSave: any, slices: any, setupRealtimeUpdates: any) => ({
  // Enhanced addProduct method that creates expiry records
  addProduct: (productData: Omit<Product, 'product_id' | 'created_at'>) => {
    console.log("STORE METHODS: Adding product with data:", productData);
    
    // Add the product using the existing slice method
    const result = slices.productSlice.addProduct(productData);
    
    // If the product has an expiry date, create an expiry record
    if (productData.expiry_date) {
      const state = get();
      
      // Get the newly added product (it will be the last one in the array)
      const newProduct = state.products[state.products.length - 1];
      
      if (newProduct) {
        console.log("STORE METHODS: Creating expiry record for product:", newProduct.product_name);
        
        // Create expiry record
        const expiryData = {
          user_id: state.currentUser?.id || "",
          product_id: newProduct.product_id,
          product_name: newProduct.product_name,
          expiry_date: productData.expiry_date,
          quantity: parseInt(productData.units) || 1,
          status: 'active' as const,
          notes: `Auto-created from product: ${newProduct.product_name}`,
        };
        
        slices.expirySlice.addProductExpiry(expiryData);
        toast.success(`Product and expiry record created for ${newProduct.product_name}`);
      }
    }
    
    return result;
  },

  // Keep existing recordSale method
  recordSale: (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => {
    console.log("STORE METHODS: Recording sale with data:", saleData);
    
    const state = get();
    
    // Create the sale record
    const newSale: Sale = {
      sale_id: state.sales.length > 0 ? Math.max(...state.sales.map(s => s.sale_id)) + 1 : 1,
      ...saleData,
      sale_date: new Date().toISOString(),
    };
    
    console.log("STORE METHODS: Created sale record:", newSale);
    
    // Update sales
    set((currentState: AppState) => ({
      sales: [...currentState.sales, newSale]
    }));
    
    // Update product stock
    set((currentState: AppState) => ({
      products: currentState.products.map(product => 
        product.product_id === saleData.product_id
          ? { 
              ...product, 
              units: Math.max(0, parseInt(product.units) - saleData.quantity_sold).toString()
            }
          : product
      )
    }));
    
    // Update client data if client info is provided
    if (saleData.clientName && !saleData.transactionId) {
      const transactionId = `sale_${newSale.sale_id}_${Date.now()}`;
      newSale.transactionId = transactionId;
      
      // Find the product for purchase history
      const soldProduct = state.products.find(p => p.product_id === saleData.product_id);
      
      if (soldProduct) {
        slices.clientSlice.updateClientPurchase(
          saleData.clientName,
          saleData.selling_price * saleData.quantity_sold,
          soldProduct.product_name,
          saleData.quantity_sold,
          transactionId
        );
      }
    }
    
    console.log("STORE METHODS: Sale recorded successfully");
    return newSale;
  },

  // Enhanced addSale method
  addSale: (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => {
    return get().recordSale(saleData);
  },
  
  // Keep other existing methods
  saveDataToSupabase: slices.userSlice.saveDataToSupabase,
  syncDataWithSupabase: slices.userSlice.syncDataWithSupabase,
  clearLocalData: slices.userSlice.clearLocalData,
  setupRealtimeUpdates,
});
