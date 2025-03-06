import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Sale, Client, Payment } from '@/types';
import { toast } from 'sonner';

interface AppState {
  // Data collections
  products: Product[];
  sales: Sale[];
  clients: Client[];
  payments: Payment[];
  
  // Actions for products
  addProduct: (product: Omit<Product, 'product_id' | 'created_at'>) => void;
  deleteProduct: (productId: number) => void;
  
  // Actions for sales
  recordSale: (sale: Omit<Sale, 'sale_id' | 'sale_date'>) => void;
  deleteSale: (saleId: number) => void;
  
  // Actions for clients
  addClient: (client: Omit<Client, 'id' | 'lastPurchase' | 'totalPurchases' | 'totalSpent'>) => void;
  deleteClient: (clientId: number) => void;
  removeClient: (clientId: number) => void;
  
  // Actions for payments
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  deletePayment: (paymentId: number) => void;
  
  // File import
  importProductsFromCSV: (file: File) => Promise<void>;
}

const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial empty states
      products: [],
      sales: [],
      clients: [],
      payments: [],
      
      // Product actions
      addProduct: (productData) => set((state) => {
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
      
      deleteProduct: (productId) => set((state) => {
        toast.success("Product deleted successfully");
        return { products: state.products.filter(product => product.product_id !== productId) };
      }),
      
      // Sale actions
      recordSale: (saleData) => set((state) => {
        // Find the product
        const product = state.products.find(p => p.product_id === saleData.product_id);
        
        if (!product) {
          toast.error("Product not found");
          return state;
        }
        
        // Create new sale
        const newSale: Sale = {
          sale_id: state.sales.length > 0 ? Math.max(...state.sales.map(s => s.sale_id)) + 1 : 1,
          product_id: saleData.product_id,
          quantity_sold: saleData.quantity_sold,
          selling_price: saleData.selling_price,
          sale_date: new Date().toISOString(),
          product: product,
        };
        
        // Update product stock
        const updatedProducts = state.products.map(p => {
          if (p.product_id === saleData.product_id) {
            const currentUnits = parseInt(p.units as string);
            const newUnits = Math.max(0, currentUnits - saleData.quantity_sold);
            return { ...p, units: newUnits.toString() };
          }
          return p;
        });
        
        toast.success(`Sale recorded successfully: ${saleData.quantity_sold} ${product.product_name}(s)`);
        
        return { 
          sales: [newSale, ...state.sales],
          products: updatedProducts
        };
      }),
      
      deleteSale: (saleId) => set((state) => {
        // Find the sale to be deleted
        const saleToDelete = state.sales.find(sale => sale.sale_id === saleId);
        
        if (!saleToDelete) {
          toast.error("Sale not found");
          return state;
        }
        
        // Return product to inventory
        const updatedProducts = state.products.map(p => {
          if (p.product_id === saleToDelete.product_id) {
            const currentUnits = parseInt(p.units as string);
            const newUnits = currentUnits + saleToDelete.quantity_sold;
            return { ...p, units: newUnits.toString() };
          }
          return p;
        });
        
        toast.success("Sale deleted successfully");
        
        return { 
          sales: state.sales.filter(sale => sale.sale_id !== saleId),
          products: updatedProducts
        };
      }),
      
      // Client actions
      addClient: (clientData) => set((state) => {
        const newClient: Client = {
          id: state.clients.length > 0 ? Math.max(...state.clients.map(c => c.id)) + 1 : 1,
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          totalPurchases: 0,
          totalSpent: 0,
          lastPurchase: new Date().toISOString(),
          joinDate: new Date().toISOString(),
          openInvoices: 0,
        };
        
        toast.success("Client added successfully");
        return { clients: [...state.clients, newClient] };
      }),
      
      deleteClient: (clientId) => set((state) => {
        toast.success("Client deleted successfully");
        return { clients: state.clients.filter(client => client.id !== clientId) };
      }),
      
      removeClient: (clientId) => set((state) => {
        toast.success("Client deleted successfully");
        return { clients: state.clients.filter(client => client.id !== clientId) };
      }),
      
      // Payment actions
      addPayment: (paymentData) => set((state) => {
        const newPayment: Payment = {
          id: state.payments.length > 0 ? Math.max(...state.payments.map(p => p.id)) + 1 : 1,
          date: new Date().toISOString(),
          clientName: paymentData.clientName,
          amount: paymentData.amount,
          status: paymentData.status,
          method: paymentData.method,
          description: paymentData.description,
        };
        
        // Update client if exists
        const updatedClients = state.clients.map(client => {
          if (client.name === paymentData.clientName) {
            return {
              ...client,
              totalPurchases: client.totalPurchases + 1,
              totalSpent: client.totalSpent + paymentData.amount,
              lastPurchase: new Date().toISOString(),
            };
          }
          return client;
        });
        
        toast.success("Payment added successfully");
        
        return { 
          payments: [newPayment, ...state.payments],
          clients: updatedClients
        };
      }),
      
      deletePayment: (paymentId) => set((state) => {
        toast.success("Payment deleted successfully");
        return { payments: state.payments.filter(payment => payment.id !== paymentId) };
      }),
      
      // CSV import functionality
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
              
              set((state) => {
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
    }),
    {
      name: 'invex-store', // Name for the persisted storage
    }
  )
);

export default useAppStore;
