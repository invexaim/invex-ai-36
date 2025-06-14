
import { Sale, Product } from '@/types';

export interface SaleData {
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  clientId?: number;
  clientName?: string;
  estimateId?: string;
}

export interface SaleValidationResult {
  isValid: boolean;
  error?: string;
}

export interface SaleCreationContext {
  products: Product[];
  updateProduct: (updatedProduct: Product) => void;
  updateClientPurchase: (clientName: string, amount: number, productName: string, quantity: number, transactionId?: string) => void;
}
