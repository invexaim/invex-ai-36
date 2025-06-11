
import { create } from 'zustand';
import { Sale, Product } from '@/types';
import { toast } from 'sonner';
import { SaleState } from '../types';

export const createSaleSlice = (
  set: any, 
  get: any, 
  getProducts: () => Product[], 
  updateProduct: (updatedProduct: Product) => void,
  updateClientPurchase: (clientName: string, amount: number, productName: string, quantity: number, transactionId?: string) => void
) => ({
  sales: [],
  
  setSales: (sales: Sale[]) => set({ sales }),
  
  // Renamed function for backward compatibility
  addSale: (saleData) => {
    return get().recordSale(saleData);
  },
  
  recordSale: (saleData) => {
    const products = getProducts();
    // Find the product
    const product = products.find(p => p.product_id === saleData.product_id);
    
    if (!product) {
      toast.error("Product not found");
      return null;
    }
    
    // Generate unique transaction ID for this sale
    const transactionId = `sale-${Date.now()}-${saleData.product_id}-${Math.random().toString(36).substr(2, 9)}`;
    console.log("SALE RECORD: Starting sale with transaction ID:", transactionId);
    
    // Create new sale
    let newSale: Sale;
    
    set((state: SaleState) => {
      newSale = {
        sale_id: state.sales.length > 0 ? Math.max(...state.sales.map(s => s.sale_id)) + 1 : 1,
        product_id: saleData.product_id,
        quantity_sold: saleData.quantity_sold,
        selling_price: saleData.selling_price,
        sale_date: new Date().toISOString(),
        product,
        clientId: saleData.clientId,
        clientName: saleData.clientName,
        transactionId // Add transaction ID to sale record
      };
      
      const clientInfo = saleData.clientName ? ` to ${saleData.clientName}` : '';
      console.log("SALE RECORD: Created sale record:", {
        saleId: newSale.sale_id,
        transactionId,
        clientName: saleData.clientName,
        product: product.product_name,
        quantity: saleData.quantity_sold,
        price: saleData.selling_price
      });
      
      toast.success(`Sale recorded successfully: ${saleData.quantity_sold} ${product.product_name}(s)${clientInfo}`);
      
      return { 
        sales: [newSale, ...state.sales]
      };
    });
    
    // Update product stock in the product store
    const currentUnits = parseInt(product.units as string);
    const newUnits = Math.max(0, currentUnits - saleData.quantity_sold);
    const updatedProduct = { 
      ...product, 
      units: newUnits.toString() 
    };
    
    console.log("SALE RECORD: Updating product stock:", {
      productId: product.product_id,
      oldUnits: currentUnits,
      newUnits,
      quantitySold: saleData.quantity_sold
    });
    
    updateProduct(updatedProduct);
    
    // CRITICAL: Only update client purchase if client name exists and we have a transaction ID
    if (saleData.clientName && saleData.clientName.trim()) {
      console.log("SALE RECORD: Updating client purchase with transaction ID:", { 
        clientName: saleData.clientName, 
        amount: saleData.selling_price, 
        productName: product.product_name, 
        quantity: saleData.quantity_sold,
        transactionId
      });
      
      // Call the update function with transaction ID to prevent duplicates
      updateClientPurchase(
        saleData.clientName, 
        saleData.selling_price, 
        product.product_name, 
        saleData.quantity_sold,
        transactionId
      );
    } else {
      console.log("SALE RECORD: No client specified, skipping client update");
    }
    
    return newSale;
  },
  
  deleteSale: (saleId) => {
    const state = get();
    // Find the sale to be deleted
    const saleToDelete = state.sales.find((sale: Sale) => sale.sale_id === saleId);
    
    if (!saleToDelete) {
      toast.error("Sale not found");
      return;
    }
    
    console.log("SALE DELETE: Deleting sale:", {
      saleId,
      transactionId: saleToDelete.transactionId,
      clientName: saleToDelete.clientName
    });
    
    // Update product stock in the product store
    const products = getProducts();
    const product = products.find(p => p.product_id === saleToDelete.product_id);
    
    if (product) {
      const currentUnits = parseInt(product.units as string);
      const newUnits = currentUnits + saleToDelete.quantity_sold;
      const updatedProduct = { 
        ...product, 
        units: newUnits.toString() 
      };
      
      console.log("SALE DELETE: Restoring product stock:", {
        productId: product.product_id,
        oldUnits: currentUnits,
        newUnits,
        quantityRestored: saleToDelete.quantity_sold
      });
      
      updateProduct(updatedProduct);
    }
    
    // Remove the sale
    set((state: SaleState) => {
      toast.success("Sale deleted successfully");
      return { 
        sales: state.sales.filter(sale => sale.sale_id !== saleId)
      };
    });
    
    // Note: We don't reverse the client purchase here as it would require
    // more complex logic to handle the transaction ID and ensure consistency
    console.log("SALE DELETE: Sale deletion complete, client totals not automatically adjusted");
  }
});

// This is just a placeholder since the standalone store needs the product store
// The actual implementation will be in the root store
const useStandaloneSaleStore = create<SaleState>((set, get) => 
  createSaleSlice(set, get, () => [], () => {}, () => {})
);

export default useStandaloneSaleStore;
