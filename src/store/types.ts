export interface Product {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  units: string;
  reorder_level: number;
  created_at: string;
}

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface Inventory {
  inventory_id: number;
  product_id: number;
  quantity_in_stock: number;
  last_updated: string;
  product?: Product;
}

export interface Sale {
  sale_id: number;
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  sale_date: string;
  product?: Product;
  clientId?: number;
  clientName?: string;
  relatedSaleId?: number; // Add reference to related sale
}

export interface ProductPurchase {
  productName: string;
  quantity: number;
  amount: number;
  purchaseDate: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalPurchases: number;
  totalSpent: number;
  lastPurchase: string;
  joinDate: string;
  openInvoices: number;
  purchaseHistory: ProductPurchase[];
  gstNumber?: string;
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface Payment {
  id: number;
  date: string;
  clientName: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  method: string;
  description?: string;
  relatedSaleId?: number;
  gstNumber?: string;
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface InventoryAnalysis {
  analysis_id: number;
  product_id: number;
  seasonal_demand_prediction: string;
  weekly_sales_trend: string;
  festival_event_demand: string;
  expiry_based_recommendation: string;
  supplier_price_trend: string;
  stock_optimization_alert: string;
  competitor_price_monitoring: string;
  analysis_date: string;
  product?: Product;
}

export interface CardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'info' | 'warning' | 'success';
}

export interface StockPredictionInput {
  date: string;
  product_id: number;
  current_stock: number;
  previous_sales: number;
  price: number;
}

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

export interface SaleState {
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  recordSale: (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => Sale;
  deleteSale: (saleId: number) => void;
  addSale: (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => void;
}

export interface ClientState {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Omit<Client, 'id' | 'totalPurchases' | 'totalSpent' | 'lastPurchase' | 'joinDate' | 'openInvoices' | 'purchaseHistory'>) => void;
  updateClientPurchase: (clientName: string, amount: number, productName: string, quantity: number) => void;
  deleteClient: (clientId: number) => void;
  removeClient: (clientId: number) => void;
}

export interface PaymentState {
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  deletePayment: (paymentId: number) => void;
  pendingSalePayment: Sale | null;
  setPendingSalePayment: (sale: Sale | null) => void;
}

export interface UserState {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  isSignedIn: boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  saveDataToSupabase: () => Promise<void>;
  syncDataWithSupabase: () => Promise<void>;
  clearLocalData: () => void;
  setupRealtimeUpdates: (userId: string) => (() => void);
}

export interface AppState extends ProductState, SaleState, ClientState, PaymentState, UserState {
  // Additional state properties
  isSignedIn: boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  pendingSalePayment: Sale | null;
  setPendingSalePayment: (sale: Sale | null) => void;
  saveDataToSupabase: () => Promise<void>;
  setupRealtimeUpdates: (userId: string) => () => void;
  addSale: (saleData: any) => Sale | null;
  
  // Company state
  companyName: string;
  setCompanyName: (name: string) => void;
}

// Add this helper function to check if a value is a valid user data row
export function isUserDataRow(value: any): boolean {
  if (!value || typeof value !== 'object') return false;
  
  // Check if it has the expected structure
  return (
    'products' in value && 
    'sales' in value && 
    'clients' in value && 
    'payments' in value
  );
}
