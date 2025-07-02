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
      const result = slices.productSlice.addProduct(productData);
      
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
      
      return result;
    }),

    updateProduct: withImmediateSave(set, get, 'update product', (updatedProduct: Product) => {
      console.log("ENHANCED STORE: Updating product with immediate save:", updatedProduct.product_id);
      return slices.productSlice.updateProduct(updatedProduct);
    }),

    deleteProduct: withImmediateSave(set, get, 'delete product', (productId: number) => {
      console.log("ENHANCED STORE: Deleting product with immediate save:", productId);
      return slices.productSlice.deleteProduct(productId);
    }),

    // Enhanced client methods with immediate save
    addClient: withImmediateSave(set, get, 'add client', (clientData: Omit<Client, "id" | "totalPurchases" | "totalSpent" | "lastPurchase">) => {
      console.log("ENHANCED STORE: Adding client with immediate save:", clientData.name);
      return slices.clientSlice.addClient(clientData);
    }),

    deleteClient: withImmediateSave(set, get, 'delete client', (clientId: string) => {
      console.log("ENHANCED STORE: Deleting client with immediate save:", clientId);
      return slices.clientSlice.deleteClient(clientId);
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
      
      return newSale;
    }),

    // Add the missing addSale method
    addSale: withImmediateSave(set, get, 'add sale', (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => {
      console.log("ENHANCED STORE: Adding sale with immediate save:", saleData);
      return slices.saleSlice.addSale(saleData);
    }),

    // Enhanced payment methods with immediate save
    addPayment: withImmediateSave(set, get, 'add payment', (paymentData: Omit<Payment, 'payment_id' | 'payment_date'>) => {
      console.log("ENHANCED STORE: Adding payment with immediate save:", paymentData);
      return slices.paymentSlice.addPayment(paymentData);
    }),

    deletePayment: withImmediateSave(set, get, 'delete payment', (paymentId: number) => {
      console.log("ENHANCED STORE: Deleting payment with immediate save:", paymentId);
      return slices.paymentSlice.deletePayment(paymentId);
    }),

    // Enhanced expiry methods with immediate save - fix return types
    addProductExpiry: withImmediateSave(set, get, 'add product expiry', (expiryData: any) => {
      console.log("ENHANCED STORE: Adding product expiry with immediate save:", expiryData);
      return slices.expirySlice.addProductExpiry(expiryData);
    }),

    updateProductExpiry: withImmediateSave(set, get, 'update product expiry', (id: string, updates: any) => {
      console.log("ENHANCED STORE: Updating product expiry with immediate save:", id);
      return slices.expirySlice.updateProductExpiry(id, updates);
    }),

    deleteProductExpiry: withImmediateSave(set, get, 'delete product expiry', (id: string) => {
      console.log("ENHANCED STORE: Deleting product expiry with immediate save:", id);
      return slices.expirySlice.deleteProductExpiry(id);
    }),

    // Enhanced support methods with immediate save
    addComplaint: withImmediateSave(set, get, 'add complaint', (complaintData: any) => {
      console.log("ENHANCED STORE: Adding complaint with immediate save:", complaintData);
      return slices.supportSlice.addComplaint(complaintData);
    }),

    addFeedback: withImmediateSave(set, get, 'add feedback', (feedbackData: any) => {
      console.log("ENHANCED STORE: Adding feedback with immediate save:", feedbackData);
      return slices.supportSlice.addFeedback(feedbackData);
    }),

    addTicket: withImmediateSave(set, get, 'add ticket', (ticketData: any) => {
      console.log("ENHANCED STORE: Adding ticket with immediate save:", ticketData);
      return slices.supportSlice.addTicket(ticketData);
    }),

    // Enhanced meeting methods with immediate save
    addMeeting: withImmediateSave(set, get, 'add meeting', (meetingData: any) => {
      console.log("ENHANCED STORE: Adding meeting with immediate save:", meetingData);
      return slices.meetingSlice.addMeeting(meetingData);
    }),

    updateMeeting: withImmediateSave(set, get, 'update meeting', (id: string, updates: any) => {
      console.log("ENHANCED STORE: Updating meeting with immediate save:", id);
      return slices.meetingSlice.updateMeeting(id, updates);
    }),

    deleteMeeting: withImmediateSave(set, get, 'delete meeting', (id: string) => {
      console.log("ENHANCED STORE: Deleting meeting with immediate save:", id);
      return slices.meetingSlice.deleteMeeting(id);
    }),

    // Keep existing methods from slices that don't need enhancement
    saveDataToSupabase: slices.userSlice.saveDataToSupabase,
    syncDataWithSupabase: slices.userSlice.syncDataWithSupabase,
    clearLocalData: slices.userSlice.clearLocalData,
    setupRealtimeUpdates,
    
    // Include other slice methods that don't conflict
    setProducts: slices.productSlice.setProducts,
    importProductsFromCSV: slices.productSlice.importProductsFromCSV,
    categories: slices.productSlice.categories,
    setCategories: slices.productSlice.setCategories,
    transferProduct: slices.productSlice.transferProduct,
    restockProduct: slices.productSlice.restockProduct,
    
    // Client methods
    setClients: slices.clientSlice.setClients,
    updateClientPurchase: slices.clientSlice.updateClientPurchase,
    removeClient: slices.clientSlice.removeClient,
    
    // Sale methods
    setSales: slices.saleSlice.setSales,
    deleteSale: slices.saleSlice.deleteSale,
    
    // Payment methods
    setPayments: slices.paymentSlice.setPayments,
    pendingSalePayment: slices.paymentSlice.pendingSalePayment,
    setPendingSalePayment: slices.paymentSlice.setPendingSalePayment,
    pendingEstimateForSale: slices.paymentSlice.pendingEstimateForSale,
    setPendingEstimateForSale: slices.paymentSlice.setPendingEstimateForSale,
    
    // User methods
    currentUser: slices.userSlice.currentUser,
    setCurrentUser: slices.userSlice.setCurrentUser,
    isSignedIn: slices.userSlice.isSignedIn,
    setIsSignedIn: slices.userSlice.setIsSignedIn,
    isLoading: slices.userSlice.isLoading,
    setIsLoading: slices.userSlice.setIsLoading,
    
    // Company methods
    companyName: slices.companySlice.companyName,
    setCompanyName: slices.companySlice.setCompanyName,
    details: slices.companySlice.details,
    address: slices.companySlice.address,
    logo: slices.companySlice.logo,
    defaults: slices.companySlice.defaults,
    documents: slices.companySlice.documents,
    customFields: slices.companySlice.customFields,
    updateDetails: slices.companySlice.updateDetails,
    updateAddress: slices.companySlice.updateAddress,
    updateLogo: slices.companySlice.updateLogo,
    updateDefaults: slices.companySlice.updateDefaults,
    updateDocuments: slices.companySlice.updateDocuments,
    addCustomField: slices.companySlice.addCustomField,
    updateCustomField: slices.companySlice.updateCustomField,
    removeCustomField: slices.companySlice.removeCustomField,
    
    // Expiry methods
    productExpiries: slices.expirySlice.productExpiries,
    setProductExpiries: slices.expirySlice.setProductExpiries,
    loadProductExpiries: slices.expirySlice.loadProductExpiries,
    getExpiringProducts: slices.expirySlice.getExpiringProducts,
    getExpiredProducts: slices.expirySlice.getExpiredProducts,
    
    // Meeting methods
    meetings: slices.meetingSlice.meetings,
    setMeetings: slices.meetingSlice.setMeetings,
    
    // Support methods
    complaints: slices.supportSlice.complaints,
    feedback: slices.supportSlice.feedback,
    tickets: slices.supportSlice.tickets,
    setComplaints: slices.supportSlice.setComplaints,
    setFeedback: slices.supportSlice.setFeedback,
    setTickets: slices.supportSlice.setTickets,
  };
};
