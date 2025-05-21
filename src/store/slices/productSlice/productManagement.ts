
import { Product } from '@/types';
import { ProductState } from '@/store/types';
import { toast } from 'sonner';

export const addProduct = (set: any) => (productData: any) => set((state: ProductState) => {
  const newProduct: Product = {
    product_id: state.products.length > 0 ? Math.max(...state.products.map(p => p.product_id)) + 1 : 1,
    product_name: productData.product_name,
    category: productData.category,
    price: productData.price,
    units: productData.units,
    reorder_level: productData.reorder_level,
    created_at: new Date().toISOString(),
  };
  
  toast.success("Product added successfully");
  return { products: [...state.products, newProduct] };
});

export const deleteProduct = (set: any) => (productId: number) => set((state: ProductState) => {
  toast.success("Product deleted successfully");
  return { products: state.products.filter(product => product.product_id !== productId) };
});

export const restockProduct = (set: any) => (productId: number, quantity: number) => set((state: ProductState) => {
  const productIndex = state.products.findIndex(p => p.product_id === productId);
  
  if (productIndex === -1) {
    toast.error("Product not found");
    return state;
  }
  
  const product = state.products[productIndex];
  const currentUnits = parseInt(product.units as string, 10);
  
  if (isNaN(quantity) || quantity <= 0) {
    toast.error("Please enter a valid quantity");
    return state;
  }
  
  const updatedProducts = [...state.products];
  updatedProducts[productIndex] = {
    ...product,
    units: (currentUnits + quantity).toString()
  };
  
  toast.success(`Successfully added ${quantity} units to ${product.product_name}`);
  return { products: updatedProducts };
});
