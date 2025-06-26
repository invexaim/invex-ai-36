export interface Product {
  product_id: number;
  product_name: string;
  category: string;
  expiry_date?: string; // Add optional expiry date field
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
  relatedSaleId?: number;
  transactionId?: string; // Add transaction ID for deduplication
  estimateId?: string; // Add estimate ID for tracking
  isFromEstimate?: boolean; // Flag to indicate if sale is from estimate
  shouldCompleteEstimate?: boolean; // Flag to indicate if estimate should be completed
}

export interface ProductPurchase {
  productName: string;
  quantity: number;
  amount: number;
  purchaseDate: string;
  transactionId?: string; // Add transaction ID for deduplication
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
  transactionId?: string; // Add transaction ID for deduplication
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

export interface ProductExpiry {
  id: string;
  user_id: string;
  product_id: number;
  product_name: string;
  expiry_date: string;
  batch_number?: string;
  quantity: number;
  status: 'active' | 'expired' | 'disposed';
  notes?: string;
  created_at: string;
  updated_at: string;
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
  processedTransactions?: Set<string>; // Track processed transactions
  setClients: (clients: Client[]) => void;
  addClient: (client: Omit<Client, 'id' | 'totalPurchases' | 'totalSpent' | 'lastPurchase' | 'joinDate' | 'openInvoices' | 'purchaseHistory'>) => void;
  updateClientPurchase: (clientName: string, amount: number, productName: string, quantity: number, transactionId?: string) => void;
  deleteClient: (clientId: number) => void;
  removeClient: (clientId: number) => void;
  recalculateClientTotals?: (clientId: number) => void;
  clearProcessedTransactions?: () => void;
}

// Add interface for pending estimate data
export interface PendingEstimateData {
  id: string;
  clientName: string;
  referenceNo: string;
  totalAmount: number;
  items: any[];
  notes?: string;
  terms?: string;
}

export interface PaymentState {
  payments: Payment[];
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  deletePayment: (paymentId: number) => void;
  pendingSalePayment: Sale | null;
  setPendingSalePayment: (sale: Sale | null) => void;
  // Add pending estimate for sales
  pendingEstimateForSale: PendingEstimateData | null;
  setPendingEstimateForSale: (estimate: PendingEstimateData | null) => void;
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

export interface CompanyState {
  // Legacy field for backward compatibility
  companyName: string;
  
  // Comprehensive company data
  details: {
    companyName: string;
    registrationNumber: string;
    taxId: string;
    email: string;
    phone: string;
    website: string;
  };
  address: {
    street: string;
    aptSuite: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  logo: {
    logoUrl: string;
    logoFile?: File;
  };
  defaults: {
    currency: string;
    taxRate: number;
    paymentTerms: string;
    invoicePrefix: string;
    estimatePrefix: string;
    defaultNote: string;
  };
  documents: {
    invoiceTemplate: string;
    estimateTemplate: string;
    termsAndConditions: string;
    footerText: string;
  };
  customFields: Array<{
    id: string;
    name: string;
    type: 'text' | 'number' | 'date' | 'dropdown';
    options?: string[];
    required: boolean;
  }>;
  
  // Company actions
  setCompanyName: (name: string) => void;
  updateDetails: (details: any) => void;
  updateAddress: (address: any) => void;
  updateLogo: (logo: any) => void;
  updateDefaults: (defaults: any) => void;
  updateDocuments: (documents: any) => void;
  addCustomField: (field: any) => void;
  updateCustomField: (id: string, field: any) => void;
  removeCustomField: (id: string) => void;
}

import { MeetingState } from './slices/meetingSlice';

export interface AppState extends ProductState, ClientState, SaleState, PaymentState, UserState, CompanyState, MeetingState {
  // Expiry state
  productExpiries: ProductExpiry[];
  setProductExpiries: (expiries: ProductExpiry[]) => void;
  addProductExpiry: (expiry: Omit<ProductExpiry, 'id' | 'created_at' | 'updated_at'>) => ProductExpiry;
  updateProductExpiry: (id: string, updates: Partial<ProductExpiry>) => void;
  deleteProductExpiry: (id: string) => void;
  loadProductExpiries: () => Promise<void>;
  getExpiringProducts: (daysAhead?: number) => ProductExpiry[];
  getExpiredProducts: () => ProductExpiry[];
  
  // Additional properties for reports
  expenses?: any[];
  purchases?: any[];
  purchaseReturns?: any[];
  salesReturns?: any[];
  suppliers?: any[];
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
