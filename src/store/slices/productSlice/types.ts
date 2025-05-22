
import { Product } from '@/types';

export interface ProductState {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (productData: Omit<Product, 'product_id' | 'created_at'>) => void;
  deleteProduct: (productId: number) => void;
  importProductsFromCSV: (file: File) => Promise<void>;
  categories: string[];
  setCategories: (categories: string[]) => void;
  transferProduct: (productId: number, quantity: number, destinationType: 'local' | 'warehouse') => void;
  restockProduct: (productId: number, quantity: number) => void;
}
