import { ProductState } from '@/store/types';
import { toast } from 'sonner';

export const transferProduct = (set: any) => (productId: number, quantity: number, destinationType: 'local' | 'warehouse') => set((state: ProductState) => {
  const productIndex = state.products.findIndex(p => p.product_id === productId);
  
  if (productIndex === -1) {
    toast.error("Product not found");
    return state;
  }
  
  const product = state.products[productIndex];
  const isWarehouse = product.product_name.includes("(Warehouse)");
  
  // If product is already in the destination location
  if ((isWarehouse && destinationType === 'warehouse') || (!isWarehouse && destinationType === 'local')) {
    toast.error(`Product is already in ${destinationType} stock`);
    return state;
  }
  
  // Check if we have enough quantity to transfer
  const currentUnits = parseInt(product.units as string, 10);
  if (currentUnits < quantity) {
    toast.error("Not enough units available to transfer");
    return state;
  }
  
  // Create new product in the destination or update existing one
  const productNameWithoutLocation = product.product_name.replace(" (Warehouse)", "");
  const destinationProductName = destinationType === 'warehouse' ? 
    `${productNameWithoutLocation} (Warehouse)` : 
    productNameWithoutLocation;
  
  // Find if destination product already exists
  const destProductIndex = state.products.findIndex(p => 
    p.product_name === destinationProductName && 
    p.category === product.category
  );
  
  const updatedProducts = [...state.products];
  
  // Update source product quantity
  updatedProducts[productIndex] = {
    ...product,
    units: (currentUnits - quantity).toString()
  };
  
  // If destination product exists, update its quantity
  if (destProductIndex !== -1) {
    const destProduct = updatedProducts[destProductIndex];
    const destUnits = parseInt(destProduct.units as string, 10);
    updatedProducts[destProductIndex] = {
      ...destProduct,
      units: (destUnits + quantity).toString()
    };
  } else {
    // Otherwise create a new product at destination
    updatedProducts.push({
      product_id: Math.max(...state.products.map(p => p.product_id)) + 1,
      product_name: destinationProductName,
      category: product.category,
      price: product.price,
      units: quantity.toString(),
      reorder_level: product.reorder_level,
      created_at: new Date().toISOString(),
    });
  }
  
  toast.success(`${quantity} units transferred to ${destinationType} stock`);
  return { products: updatedProducts };
});
