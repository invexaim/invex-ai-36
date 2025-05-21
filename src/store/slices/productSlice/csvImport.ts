
import { ProductState } from '@/store/types';
import { toast } from 'sonner';

export const importProductsFromCSV = (set: any) => async (file: File): Promise<void> => {
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
        const importedProducts = [];
        
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
};
