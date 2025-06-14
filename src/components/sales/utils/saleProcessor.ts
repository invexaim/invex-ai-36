
import { toast } from "sonner";

interface Product {
  product_id: number;
  product_name: string;
  units: string | number;
}

interface SaleData {
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  clientId: number;
  clientName: string;
}

export const validateSaleData = (
  saleData: SaleData,
  products: Product[],
  recordSale: Function
) => {
  console.log("SALE PROCESSOR: Starting validation with data:", saleData);
  
  // Check if recordSale function exists
  if (typeof recordSale !== 'function') {
    console.error("SALE PROCESSOR: recordSale is not a function");
    toast.error("Sale recording function is not available");
    return { isValid: false };
  }

  // Check if product exists and has sufficient stock
  const selectedProduct = products.find(p => p.product_id === saleData.product_id);
  if (!selectedProduct) {
    console.log("SALE PROCESSOR: Product not found");
    toast.error("Selected product not found");
    return { isValid: false };
  }

  const availableStock = parseInt(selectedProduct.units as string);
  if (isNaN(availableStock) || availableStock < saleData.quantity_sold) {
    console.log("SALE PROCESSOR: Insufficient stock", { 
      available: availableStock, 
      requested: saleData.quantity_sold 
    });
    toast.error(`Insufficient stock. Available: ${availableStock}, Requested: ${saleData.quantity_sold}`);
    return { isValid: false };
  }

  return { isValid: true, selectedProduct };
};

export const processSaleSubmission = async (
  saleData: SaleData,
  recordSale: Function
) => {
  try {
    console.log("SALE PROCESSOR: Attempting to record sale", {
      productId: saleData.product_id,
      quantity: saleData.quantity_sold,
      price: saleData.selling_price,
      clientName: saleData.clientName
    });
    
    // Record the sale using our store function
    const recordedSale = recordSale({
      product_id: saleData.product_id,
      quantity_sold: saleData.quantity_sold,
      selling_price: saleData.selling_price,
      clientId: saleData.clientId,
      clientName: saleData.clientName.trim()
    });
    
    console.log("SALE PROCESSOR: recordSale result:", recordedSale);
    
    if (recordedSale && recordedSale.sale_id) {
      console.log("SALE PROCESSOR: Sale recorded successfully", recordedSale);
      return { success: true, sale: recordedSale };
    } else {
      console.error("SALE PROCESSOR: recordSale returned invalid result:", recordedSale);
      toast.error("Failed to record sale. Please try again.");
      return { success: false };
    }
  } catch (error) {
    console.error("SALE PROCESSOR: Error recording sale:", error);
    console.error("SALE PROCESSOR: Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    toast.error(`Error recording sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false };
  }
};
