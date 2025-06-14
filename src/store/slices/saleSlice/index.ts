
import { create } from 'zustand';
import { Sale, Product } from '@/types';
import { toast } from 'sonner';
import { SaleState } from '../../types';
import { validateSaleData, validateRecordSaleFunction } from './validation';
import { 
  createSaleRecord, 
  updateProductStock, 
  updateClientPurchaseRecord, 
  restoreProductStock 
} from './operations';
import { SaleData } from './types';

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
  addSale: (saleData: SaleData) => {
    return get().recordSale(saleData);
  },
  
  recordSale: (saleData: SaleData) => {
    try {
      console.log("SALE SLICE: Starting recordSale with data:", saleData);
      
      // Validate record sale function
      if (!validateRecordSaleFunction(get().recordSale)) {
        return null;
      }
      
      const products = getProducts();
      console.log("SALE SLICE: Available products:", products.length);
      
      // Validate sale data
      const validation = validateSaleData(saleData, products);
      if (!validation.isValid) {
        toast.error(validation.error || "Sale validation failed");
        return null;
      }
      
      // Find the product (we know it exists from validation)
      const product = products.find(p => p.product_id === saleData.product_id)!;
      
      // Get current state to create new sale
      const currentState = get();
      if (!currentState || !Array.isArray(currentState.sales)) {
        console.error("SALE SLICE: Invalid current state", currentState);
        toast.error("Invalid application state");
        return null;
      }
      
      const currentSales = currentState.sales;
      const newSale = createSaleRecord(saleData, product, currentSales);
      
      // Update the state
      const updateResult = set((state: SaleState) => {
        console.log("SALE SLICE: Updating state with new sale");
        const clientInfo = saleData.clientName ? ` to ${saleData.clientName}` : '';
        toast.success(`Sale recorded: ${saleData.quantity_sold} ${product.product_name}(s)${clientInfo}`);
        
        return { 
          sales: [newSale, ...state.sales]
        };
      });
      
      console.log("SALE SLICE: State update result:", updateResult);
      
      // Update product stock
      updateProductStock(product, saleData.quantity_sold, updateProduct);
      
      // Update client purchase record
      updateClientPurchaseRecord(saleData, product, newSale.transactionId!, updateClientPurchase);
      
      console.log("SALE SLICE: Sale recording completed successfully:", newSale);
      return newSale;
      
    } catch (error) {
      console.error("SALE SLICE: Error in recordSale:", error);
      console.error("SALE SLICE: Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      toast.error(`Failed to record sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  },
  
  deleteSale: (saleId: number) => {
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
    restoreProductStock(saleToDelete, products, updateProduct);
    
    // Remove the sale
    set((state: SaleState) => {
      toast.success("Sale deleted successfully");
      return { 
        sales: state.sales.filter(sale => sale.sale_id !== saleId)
      };
    });
    
    console.log("SALE DELETE: Sale deletion complete");
  }
});

// This is just a placeholder since the standalone store needs the product store
const useStandaloneSaleStore = create<SaleState>((set, get) => 
  createSaleSlice(set, get, () => [], () => {}, () => {})
);

export default useStandaloneSaleStore;
