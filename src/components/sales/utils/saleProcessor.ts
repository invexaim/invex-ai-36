
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
  console.log("SALE PROCESSOR: Available products:", products?.length || 0);
  console.log("SALE PROCESSOR: recordSale function type:", typeof recordSale);
  
  // Validate recordSale function
  if (typeof recordSale !== 'function') {
    console.error("SALE PROCESSOR: recordSale is not a function, type:", typeof recordSale);
    toast.error("Sale recording function is not available");
    return { isValid: false };
  }

  // Validate products array
  if (!products || !Array.isArray(products) || products.length === 0) {
    console.error("SALE PROCESSOR: No products available");
    toast.error("No products available for sale");
    return { isValid: false };
  }

  // Validate sale data
  if (!saleData) {
    console.error("SALE PROCESSOR: No sale data provided");
    toast.error("Sale data is missing");
    return { isValid: false };
  }

  if (!saleData.product_id) {
    console.error("SALE PROCESSOR: No product selected");
    toast.error("Please select a product");
    return { isValid: false };
  }

  if (!saleData.quantity_sold || saleData.quantity_sold <= 0) {
    console.error("SALE PROCESSOR: Invalid quantity");
    toast.error("Please enter a valid quantity");
    return { isValid: false };
  }

  if (!saleData.selling_price || saleData.selling_price <= 0) {
    console.error("SALE PROCESSOR: Invalid price");
    toast.error("Please enter a valid price");
    return { isValid: false };
  }

  if (!saleData.clientName || !saleData.clientName.trim()) {
    console.error("SALE PROCESSOR: No client name provided");
    toast.error("Please select or enter a client name");
    return { isValid: false };
  }

  // Find and validate selected product
  const selectedProduct = products.find(p => p.product_id === saleData.product_id);
  if (!selectedProduct) {
    console.error("SALE PROCESSOR: Product not found for ID:", saleData.product_id);
    toast.error("Selected product not found");
    return { isValid: false };
  }

  console.log("SALE PROCESSOR: Found product:", selectedProduct);

  // Validate stock availability
  const availableStock = parseInt(selectedProduct.units as string);
  if (isNaN(availableStock)) {
    console.error("SALE PROCESSOR: Invalid stock data for product:", selectedProduct);
    toast.error("Product stock data is invalid");
    return { isValid: false };
  }

  if (availableStock < saleData.quantity_sold) {
    console.error("SALE PROCESSOR: Insufficient stock", { 
      available: availableStock, 
      requested: saleData.quantity_sold 
    });
    toast.error(`Insufficient stock. Available: ${availableStock}, Requested: ${saleData.quantity_sold}`);
    return { isValid: false };
  }

  console.log("SALE PROCESSOR: Validation passed successfully");
  return { isValid: true, selectedProduct };
};

export const processSaleSubmission = async (
  saleData: SaleData,
  recordSale: Function
) => {
  try {
    console.log("SALE PROCESSOR: Starting sale submission process");
    console.log("SALE PROCESSOR: Sale data to submit:", {
      productId: saleData.product_id,
      quantity: saleData.quantity_sold,
      price: saleData.selling_price,
      clientName: saleData.clientName?.trim(),
      clientId: saleData.clientId
    });
    
    // Validate function availability one more time
    if (typeof recordSale !== 'function') {
      console.error("SALE PROCESSOR: recordSale function validation failed");
      toast.error("Sale recording function is not available");
      return { success: false };
    }
    
    console.log("SALE PROCESSOR: Calling recordSale function...");
    
    // Prepare clean sale data
    const cleanSaleData = {
      product_id: saleData.product_id,
      quantity_sold: saleData.quantity_sold,
      selling_price: saleData.selling_price,
      clientId: saleData.clientId,
      clientName: saleData.clientName.trim()
    };
    
    // Record the sale using our store function
    const recordedSale = recordSale(cleanSaleData);
    
    console.log("SALE PROCESSOR: recordSale function returned:", recordedSale);
    console.log("SALE PROCESSOR: Return type:", typeof recordedSale);
    
    // Validate the result
    if (!recordedSale) {
      console.error("SALE PROCESSOR: recordSale returned null or undefined");
      toast.error("Failed to record sale. Please check the product availability and try again.");
      return { success: false };
    }
    
    if (typeof recordedSale !== 'object') {
      console.error("SALE PROCESSOR: recordSale returned invalid type:", typeof recordedSale);
      toast.error("Sale recording returned invalid data. Please try again.");
      return { success: false };
    }
    
    if (!recordedSale.sale_id) {
      console.error("SALE PROCESSOR: recordSale returned object without sale_id:", recordedSale);
      toast.error("Sale recorded but missing ID. Please check the sales list.");
      return { success: false };
    }
    
    console.log("SALE PROCESSOR: Sale recorded successfully with ID:", recordedSale.sale_id);
    return { success: true, sale: recordedSale };
    
  } catch (error) {
    console.error("SALE PROCESSOR: Error during sale submission:", error);
    console.error("SALE PROCESSOR: Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(`Error recording sale: ${errorMessage}`);
    return { success: false };
  }
};
