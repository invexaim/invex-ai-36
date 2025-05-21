
import { create } from 'zustand';
import { Product } from '@/types';
import { toast } from 'sonner';
import { ProductState } from '../types';

export const createProductSlice = (set: any, get: any) => ({
  products: [],
  categories: ["Electronics", "Clothing", "Food", "Books", "Furniture", "Uncategorized"],
  
  setProducts: (products: Product[]) => set({ products }),
  
  setCategories: (categories: string[]) => set({ categories }),
  
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
  
  restockProduct: (productId, quantity) => set((state: ProductState) => {
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
  }),
  
  transferProduct: (productId, quantity, destinationType) => set((state: ProductState) => {
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
  }),
  
  importProductsFromCSV: async (file: File): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            toast.error("Error reading file");
            reject(new Error("Error reading file"));
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
            reject(new Error("CSV format not recognized"));
            return;
          }
          
          // Parse products from CSV
          const importedProducts: Product[] = [];
          
          set((state: ProductState) => {
            let nextId = state.products.length > 0 
              ? Math.max(...state.products.map(p => p.product_id)) + 1 
              : 1;
            
            // Track new categories to add
            const currentCategories = new Set(state.categories);
            const newCategories: string[] = [];
            
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
                
                // Add new categories
                if (category && !currentCategories.has(category)) {
                  currentCategories.add(category);
                  newCategories.push(category);
                }
              }
            }
            
            if (importedProducts.length === 0) {
              toast.error("No valid products found in CSV");
              reject(new Error("No valid products found"));
              return state;
            }
            
            toast.success(`Successfully imported ${importedProducts.length} products`);
            
            // Update with new categories if any
            if (newCategories.length > 0) {
              return { 
                products: [...state.products, ...importedProducts],
                categories: [...state.categories, ...newCategories]
              };
            }
            
            return { products: [...state.products, ...importedProducts] };
          });
          
          resolve();
        } catch (error) {
          toast.error("Error parsing CSV file");
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        toast.error("Error reading file");
        reject(error);
      };
      
      reader.readAsText(file);
    });
  }
});

// Create a standalone store for direct usage if needed
const useProductStore = create<ProductState>((set, get) => 
  createProductSlice(set, get)
);

export default useProductStore;
