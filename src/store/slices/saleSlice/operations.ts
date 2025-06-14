
import { toast } from 'sonner';
import { Sale, Product } from '@/types';
import { SaleData, SaleCreationContext } from './types';

export const generateTransactionId = (saleData: SaleData): string => {
  return `sale-${Date.now()}-${saleData.product_id}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createSaleRecord = (
  saleData: SaleData,
  product: Product,
  currentSales: Sale[]
): Sale => {
  const transactionId = generateTransactionId(saleData);
  console.log("SALE OPERATIONS: Generated transaction ID:", transactionId);
  
  const newSaleId = currentSales.length > 0 ? Math.max(...currentSales.map(s => s.sale_id)) + 1 : 1;
  
  const newSale: Sale = {
    sale_id: newSaleId,
    product_id: saleData.product_id,
    quantity_sold: saleData.quantity_sold,
    selling_price: saleData.selling_price,
    sale_date: new Date().toISOString(),
    product,
    clientId: saleData.clientId,
    clientName: saleData.clientName,
    transactionId
  };
  
  console.log("SALE OPERATIONS: Created sale record:", {
    saleId: newSale.sale_id,
    transactionId,
    clientName: saleData.clientName,
    product: product.product_name,
    quantity: saleData.quantity_sold,
    price: saleData.selling_price
  });
  
  return newSale;
};

export const updateProductStock = (
  product: Product,
  quantitySold: number,
  updateProduct: (updatedProduct: Product) => void
): void => {
  const currentUnits = parseInt(product.units as string);
  const newUnits = Math.max(0, currentUnits - quantitySold);
  const updatedProduct = { 
    ...product, 
    units: newUnits.toString() 
  };
  
  console.log("SALE OPERATIONS: Updating product stock:", {
    productId: product.product_id,
    oldUnits: currentUnits,
    newUnits,
    quantitySold
  });
  
  if (typeof updateProduct !== 'function') {
    console.error("SALE OPERATIONS: updateProduct is not a function");
    toast.error("Cannot update product stock");
    return;
  }
  
  updateProduct(updatedProduct);
};

export const updateClientPurchaseRecord = (
  saleData: SaleData,
  product: Product,
  transactionId: string,
  updateClientPurchase: (clientName: string, amount: number, productName: string, quantity: number, transactionId?: string) => void
): void => {
  if (saleData.clientName && saleData.clientName.trim()) {
    console.log("SALE OPERATIONS: Updating client purchase:", { 
      clientName: saleData.clientName, 
      amount: saleData.selling_price, 
      productName: product.product_name, 
      quantity: saleData.quantity_sold,
      transactionId
    });
    
    if (typeof updateClientPurchase !== 'function') {
      console.error("SALE OPERATIONS: updateClientPurchase is not a function");
    } else {
      updateClientPurchase(
        saleData.clientName.trim(), 
        saleData.selling_price, 
        product.product_name, 
        saleData.quantity_sold,
        transactionId
      );
    }
  } else {
    console.log("SALE OPERATIONS: No client specified, skipping client update");
  }
};

export const restoreProductStock = (
  sale: Sale,
  products: Product[],
  updateProduct: (updatedProduct: Product) => void
): void => {
  const product = products.find(p => p.product_id === sale.product_id);
  
  if (product) {
    const currentUnits = parseInt(product.units as string);
    const newUnits = currentUnits + sale.quantity_sold;
    const updatedProduct = { 
      ...product, 
      units: newUnits.toString() 
    };
    
    console.log("SALE OPERATIONS: Restoring product stock:", {
      productId: product.product_id,
      oldUnits: currentUnits,
      newUnits,
      quantityRestored: sale.quantity_sold
    });
    
    updateProduct(updatedProduct);
  }
};
