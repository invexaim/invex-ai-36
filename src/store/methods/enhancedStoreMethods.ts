import { AppState } from '../types';
import { Sale, Product, ProductExpiry, Payment, Client } from '@/types';
import { toast } from 'sonner';
import { withImmediateSave, createDefaultAutoSave } from '../config/enhancedAutoSave';

export const createEnhancedStoreMethods = (set: any, get: any, setWithAutoSave: any, slices: any, setupRealtimeUpdates: any) => {
  const immediateAutoSave = createDefaultAutoSave(set, get);

  return {
    // Enhanced product methods with immediate save
    addProduct: withImmediateSave(set, get, 'add product', (productData: Omit<Product, 'product_id' | 'created_at'>) => {
      console.log("ENHANCED STORE: Adding product with immediate save:", productData);
      slices.productSlice.addProduct(productData);
      
      // Handle expiry record creation if needed
      if (productData.expiry_date) {
        const state = get();
        const newProduct = state.products[state.products.length - 1];
        
        if (newProduct) {
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
        }
      }
    }),

    updateProduct: withImmediateSave(set, get, 'update product', (updatedProduct: Product) => {
      console.log("ENHANCED STORE: Updating product with immediate save:", updatedProduct.product_id);
      slices.productSlice.updateProduct(updatedProduct);
    }),

    deleteProduct: withImmediateSave(set, get, 'delete product', (productId: number) => {
      console.log("ENHANCED STORE: Deleting product with immediate save:", productId);
      slices.productSlice.deleteProduct(productId);
    }),

    // Enhanced client methods with immediate save
    addClient: withImmediateSave(set, get, 'add client', (clientData: Omit<Client, "id" | "totalPurchases" | "totalSpent" | "lastPurchase">) => {
      console.log("ENHANCED STORE: Adding client with immediate save:", clientData.name);
      slices.clientSlice.addClient(clientData);
    }),

    deleteClient: withImmediateSave(set, get, 'delete client', (clientId: string) => {
      console.log("ENHANCED STORE: Deleting client with immediate save:", clientId);
      slices.clientSlice.deleteClient(clientId);
    }),

    // Enhanced sale methods with immediate save
    recordSale: withImmediateSave(set, get, 'record sale', (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => {
      console.log("ENHANCED STORE: Recording sale with immediate save:", saleData);
      
      const state = get();
      const newSale: Sale = {
        sale_id: state.sales.length > 0 ? Math.max(...state.sales.map(s => s.sale_id)) + 1 : 1,
        ...saleData,
        sale_date: new Date().toISOString(),
      };
      
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
      
      // Update client data if needed
      if (saleData.clientName && !saleData.transactionId) {
        const transactionId = `sale_${newSale.sale_id}_${Date.now()}`;
        newSale.transactionId = transactionId;
        
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
    }),

    // Enhanced payment methods with immediate save
    addPayment: withImmediateSave(set, get, 'add payment', (paymentData: Omit<Payment, 'payment_id' | 'payment_date'>) => {
      console.log("ENHANCED STORE: Adding payment with immediate save:", paymentData);
      slices.paymentSlice.addPayment(paymentData);
    }),

    deletePayment: withImmediateSave(set, get, 'delete payment', (paymentId: number) => {
      console.log("ENHANCED STORE: Deleting payment with immediate save:", paymentId);
      slices.paymentSlice.deletePayment(paymentId);
    }),

    // Enhanced expiry methods with immediate save
    addProductExpiry: withImmediateSave(set, get, 'add product expiry', (expiryData: any) => {
      console.log("ENHANCED STORE: Adding product expiry with immediate save:", expiryData);
      slices.expirySlice.addProductExpiry(expiryData);
    }),

    updateProductExpiry: withImmediateSave(set, get, 'update product expiry', (id: string, updates: any) => {
      console.log("ENHANCED STORE: Updating product expiry with immediate save:", id);
      slices.expirySlice.updateProductExpiry(id, updates);
    }),

    deleteProductExpiry: withImmediateSave(set, get, 'delete product expiry', (id: string) => {
      console.log("ENHANCED STORE: Deleting product expiry with immediate save:", id);
      slices.expirySlice.deleteProductExpiry(id);
    }),

    // Enhanced support methods with immediate save
    addComplaint: withImmediateSave(set, get, 'add complaint', (complaintData: any) => {
      console.log("ENHANCED STORE: Adding complaint with immediate save:", complaintData);
      slices.supportSlice.addComplaint(complaintData);
    }),

    addFeedback: withImmediateSave(set, get, 'add feedback', (feedbackData: any) => {
      console.log("ENHANCED STORE: Adding feedback with immediate save:", feedbackData);
      slices.supportSlice.addFeedback(feedbackData);
    }),

    addTicket: withImmediateSave(set, get, 'add ticket', (ticketData: any) => {
      console.log("ENHANCED STORE: Adding ticket with immediate save:", ticketData);
      slices.supportSlice.addTicket(ticketData);
    }),

    // Enhanced meeting methods with immediate save
    addMeeting: withImmediateSave(set, get, 'add meeting', (meetingData: any) => {
      console.log("ENHANCED STORE: Adding meeting with immediate save:", meetingData);
      slices.meetingSlice.addMeeting(meetingData);
    }),

    updateMeeting: withImmediateSave(set, get, 'update meeting', (id: string, updates: any) => {
      console.log("ENHANCED STORE: Updating meeting with immediate save:", id);
      slices.meetingSlice.updateMeeting(id, updates);
    }),

    deleteMeeting: withImmediateSave(set, get, 'delete meeting', (id: string) => {
      console.log("ENHANCED STORE: Deleting meeting with immediate save:", id);
      slices.meetingSlice.deleteMeeting(id);
    }),

    // Keep existing methods
    saveDataToSupabase: slices.userSlice.saveDataToSupabase,
    syncDataWithSupabase: slices.userSlice.syncDataWithSupabase,
    clearLocalData: slices.userSlice.clearLocalData,
    setupRealtimeUpdates,
  };
};
