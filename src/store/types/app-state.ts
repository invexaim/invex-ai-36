
import { ProductState } from './product-state';
import { SaleState } from './sale-state';
import { ClientState } from './client-state';
import { PaymentState } from './payment-state';
import { UserState } from './user-state';
import { Product, Sale, Client, Payment } from '@/types';

export interface AppState extends 
  Omit<ProductState, 'setProducts' | 'setCategories'>,
  Omit<SaleState, 'setSales'>,
  Omit<ClientState, 'setClients'>,
  Omit<PaymentState, 'setPayments' | 'setPendingSalePayment'>,
  Omit<UserState, 'setupRealtimeUpdates'>
{
  // User state
  isSignedIn: boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  
  // Payment handling
  pendingSalePayment: Sale | null;
  setPendingSalePayment: (sale: Sale | null) => void;
  
  // Force immediate data save
  forceSaveData: () => Promise<void>;
  
  // Products & categories
  setCategories: (categories: string[]) => void;
  
  // Session management
  setupRealtimeUpdates: (userId: string) => (() => void);
  
  // Methods for data slices that were omitted
  setProducts: (products: Product[]) => void;
  setSales: (sales: Sale[]) => void;
  setClients: (clients: Client[]) => void;
  setPayments: (payments: Payment[]) => void;
  
  // Method to save data to Supabase
  saveDataToSupabase: () => Promise<void>;
}

// Helper function to check if a value is a valid user data row
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
