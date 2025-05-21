
import { Product } from './product';

export interface Sale {
  sale_id: number;
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  sale_date: string;
  product?: Product;
  clientId?: number;
  clientName?: string;
  relatedSaleId?: number; // Reference to related sale
}
