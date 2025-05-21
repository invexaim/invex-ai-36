
import { ProductState } from '@/store/types';
import { Product } from '@/types';
import { addProduct, deleteProduct, restockProduct } from './productManagement';
import { transferProduct } from './productTransfer';
import { importProductsFromCSV } from './csvImport';

export const createProductSlice = (set: any, get: any) => ({
  products: [],
  categories: ["Electronics", "Clothing", "Food", "Books", "Furniture", "Uncategorized"],
  
  setProducts: (products: Product[]) => set({ products }),
  
  setCategories: (categories: string[]) => set({ categories }),
  
  // Import product management functions
  addProduct: addProduct(set),
  deleteProduct: deleteProduct(set),
  restockProduct: restockProduct(set),
  
  // Import product transfer function
  transferProduct: transferProduct(set),
  
  // Import CSV import function
  importProductsFromCSV: importProductsFromCSV(set),
});
