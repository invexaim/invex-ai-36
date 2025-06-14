
import { AppState } from '../types';
import { createProductSlice } from '../slices/productSlice';
import { createSaleSlice } from '../slices/saleSlice';
import { createClientSlice } from '../slices/clientSlice';
import { createPaymentSlice } from '../slices/paymentSlice';
import { createUserSlice } from '../slices/userSlice';
import { createCompanySlice } from '../slices/companySlice';
import { createExpirySlice } from '../slices/expirySlice';

export const integrateSlices = (
  set: any, 
  get: any, 
  store: any,
  saveDataToSupabase: () => Promise<void>,
  setWithAutoSave: (fn: any) => void
) => {
  // Initialize user slice with the proper save function
  const userSlice = createUserSlice(set, get, saveDataToSupabase);
  
  // Create individual slices with cross-slice access
  const productSlice = createProductSlice(set, get);
  const clientSlice = createClientSlice(set, get);
  const companySlice = createCompanySlice(set, get);
  const expirySlice = createExpirySlice(set, get, store);
  
  // ENHANCED: Create sale slice with improved transaction tracking
  const saleSlice = createSaleSlice(
    set, 
    get, 
    // Give sale slice access to products
    () => get().products,
    // Method to update a product from the sale slice
    (updatedProduct) => {
      set((state: AppState) => ({
        products: state.products.map(p => 
          p.product_id === updatedProduct.product_id ? updatedProduct : p
        )
      }));
    },
    // ENHANCED: Pass the client update function with better validation
    (clientName: string, amount: number, productName: string, quantity: number, transactionId?: string) => {
      // Validate inputs before proceeding
      if (!clientName || !clientName.trim()) {
        console.log("STORE: Skipping client update - no client name");
        return;
      }
      
      if (typeof amount !== 'number' || amount <= 0) {
        console.log("STORE: Skipping client update - invalid amount:", amount);
        return;
      }
      
      if (typeof quantity !== 'number' || quantity <= 0) {
        console.log("STORE: Skipping client update - invalid quantity:", quantity);
        return;
      }
      
      console.log("STORE: Routing client update with transaction ID:", { 
        clientName: clientName.trim(), 
        amount, 
        productName, 
        quantity, 
        transactionId 
      });
      
      clientSlice.updateClientPurchase(clientName.trim(), amount, productName, quantity, transactionId);
    }
  );
  
  // ENHANCED: Payment slice with better transaction management
  const paymentSlice = createPaymentSlice(
    set, 
    get,
    // Give payment slice access to update client - but don't double count sales
    (clientName: string, amount: number) => {
      // Validate inputs
      if (!clientName || !clientName.trim() || typeof amount !== 'number' || amount <= 0) {
        console.log("STORE: Skipping payment client update - invalid inputs");
        return;
      }
      
      // Generate unique transaction ID for payments
      const transactionId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log("STORE: Processing payment with transaction ID:", { 
        clientName: clientName.trim(), 
        amount, 
        transactionId 
      });
      
      // Only update for actual payments, not sales
      clientSlice.updateClientPurchase(clientName.trim(), amount, "Payment", 1, transactionId);
    }
  );

  return {
    userSlice,
    productSlice,
    clientSlice,
    companySlice,
    expirySlice,
    saleSlice,
    paymentSlice
  };
};
