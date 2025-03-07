
import { Product, Sale, Client, Payment } from '@/types';

export interface ProductState {
  products: Product[];
  addProduct: (product: Omit<Product, 'product_id' | 'created_at'>) => void;
  deleteProduct: (productId: number) => void;
  importProductsFromCSV: (file: File) => Promise<void>;
  setProducts: (products: Product[]) => void;
}

export interface SaleState {
  sales: Sale[];
  recordSale: (sale: Omit<Sale, 'sale_id' | 'sale_date'>) => void;
  deleteSale: (saleId: number) => void;
  setSales: (sales: Sale[]) => void;
}

export interface ClientState {
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "lastPurchase" | "totalPurchases" | "totalSpent">) => void;
  deleteClient: (clientId: number) => void;
  removeClient: (clientId: number) => void;
  updateClientPurchase: (clientName: string, amount: number) => void;
  setClients: (clients: Client[]) => void;
}

export interface PaymentState {
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;
  deletePayment: (paymentId: number) => void;
  setPayments: (payments: Payment[]) => void;
}

export interface AppState extends 
  ProductState,
  SaleState,
  ClientState,
  PaymentState {}
