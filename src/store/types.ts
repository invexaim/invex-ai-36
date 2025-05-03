
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
}

export interface Payment {
  id: number;
  date: string;
  clientName: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  method: string;
  description?: string;
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
}

export interface SaleState {
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  addSale: (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => void;
}

export interface ClientState {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Omit<Client, 'id' | 'totalPurchases' | 'totalSpent' | 'lastPurchase' | 'joinDate' | 'openInvoices'>) => void;
  updateClientPurchase: (clientName: string, amount: number) => void;
}

export interface PaymentState {
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
}

export interface UserState {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  isSignedIn: boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  saveDataToSupabase: () => Promise<void>;
}

export interface AppState extends ProductState, SaleState, ClientState, PaymentState, UserState {}
