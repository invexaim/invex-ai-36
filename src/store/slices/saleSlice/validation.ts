
import { toast } from 'sonner';
import { Product } from '@/types';
import { SaleData, SaleValidationResult } from './types';

export const validateSaleData = (
  saleData: SaleData, 
  products: Product[]
): SaleValidationResult => {
  console.log("SALE VALIDATION: Starting validation for:", saleData);
  
  if (!saleData) {
    console.error("SALE VALIDATION: No sale data provided");
    return { isValid: false, error: "No sale data provided" };
  }
  
  if (!saleData.product_id || !saleData.quantity_sold || !saleData.selling_price) {
    console.error("SALE VALIDATION: Missing required sale data", saleData);
    return { isValid: false, error: "Missing required sale information" };
  }
  
  if (!products || products.length === 0) {
    console.error("SALE VALIDATION: No products available");
    return { isValid: false, error: "No products available" };
  }
  
  // Find the product
  const product = products.find(p => p.product_id === saleData.product_id);
  
  if (!product) {
    console.error("SALE VALIDATION: Product not found for ID:", saleData.product_id);
    return { isValid: false, error: "Product not found" };
  }
  
  console.log("SALE VALIDATION: Found product:", product);
  
  // Check stock availability
  const currentUnits = parseInt(product.units as string);
  if (isNaN(currentUnits) || currentUnits < saleData.quantity_sold) {
    console.error("SALE VALIDATION: Insufficient stock", { 
      available: currentUnits, 
      requested: saleData.quantity_sold 
    });
    return { 
      isValid: false, 
      error: `Insufficient stock. Available: ${currentUnits}` 
    };
  }
  
  console.log("SALE VALIDATION: Validation passed");
  return { isValid: true };
};

export const validateRecordSaleFunction = (recordSale: any): boolean => {
  if (!recordSale || typeof recordSale !== 'function') {
    console.error("SALE VALIDATION: recordSale function is not available");
    toast.error("Sale recording system is not available. Please refresh the page and try again.");
    return false;
  }
  return true;
};
