
import { create } from 'zustand';
import { Product } from '@/types';
import { toast } from 'sonner';

export interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'product_id' | 'created_at'>) => void;
  deleteProduct: (productId: number) => void;
  importProductsFromCSV: (file: File) => Promise<void>;
  // For store combination
  setProducts: (products: Product[]) => void;
}

export const createProductSlice = (set: any, get: any) => ({
  products: [],
  
  setProducts: (products: Product[]) => set({ products }),
  
  addProduct: (productData) => set((state: ProductState) => {
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
  }),
  
  deleteProduct: (productId) => set((state: ProductState) => {
    toast.success("Product deleted successfully");
    return { products: state.products.filter(product => product.product_id !== productId) };
  }),
  
  importProductsFromCSV: async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            toast.error("Error reading file");
            reject("Error reading file");
            return;
          }
          
          const csvText = event.target.result as string;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(header => header.trim());
          
          // Find indices for required fields
          const nameIndex = headers.findIndex(h => 
            h.toLowerCase().includes('name') || h.toLowerCase().includes('product'));
          const categoryIndex = headers.findIndex(h => 
            h.toLowerCase().includes('category'));
          const priceIndex = headers.findIndex(h => 
            h.toLowerCase().includes('price'));
          const unitsIndex = headers.findIndex(h => 
            h.toLowerCase().includes('units') || h.toLowerCase().includes('stock') || h.toLowerCase().includes('quantity'));
          const reorderIndex = headers.findIndex(h => 
            h.toLowerCase().includes('reorder') || h.toLowerCase().includes('threshold'));
          
          if (nameIndex === -1 || priceIndex === -1 || unitsIndex === -1) {
            toast.error("CSV format not recognized. Required columns: product name, price, and stock/units");
            reject("CSV format not recognized");
            return;
          }
          
          // Parse products from CSV
          const importedProducts: Product[] = [];
          
          set((state: ProductState) => {
            let nextId = state.products.length > 0 
              ? Math.max(...state.products.map(p => p.product_id)) + 1 
              : 1;
            
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue; // Skip empty lines
              
              const values = lines[i].split(',').map(value => value.trim());
              
              // Extract values
              const productName = values[nameIndex];
              const category = categoryIndex !== -1 ? values[categoryIndex] : 'Uncategorized';
              const price = parseFloat(values[priceIndex]) || 0;
              const units = values[unitsIndex] || '0';
              const reorderLevel = reorderIndex !== -1 ? parseInt(values[reorderIndex]) || 5 : 5;
              
              if (productName && price) {
                importedProducts.push({
                  product_id: nextId++,
                  product_name: productName,
                  category,
                  price,
                  units,
                  reorder_level: reorderLevel,
                  created_at: new Date().toISOString()
                });
              }
            }
            
            if (importedProducts.length === 0) {
              toast.error("No valid products found in CSV");
              reject("No valid products found");
              return state;
            }
            
            toast.success(`Successfully imported ${importedProducts.length} products`);
            return { products: [...state.products, ...importedProducts] };
          });
          
          resolve();
        } catch (error) {
          toast.error("Error parsing CSV file");
          reject("Error parsing CSV");
        }
      };
      
      reader.onerror = () => {
        toast.error("Error reading file");
        reject("Error reading file");
      };
      
      reader.readAsText(file);
    });
  }
});

// Create a standalone store for direct usage if needed
export const useProductStore = create<ProductState>((set, get) => 
  createProductSlice(set, get)
);

export default useProductStore;
