
import { Sale } from '@/types';

export interface SaleState {
  sales: Sale[];
  setSales: (sales: Sale[]) => void;
  recordSale: (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => Sale;
  deleteSale: (saleId: number) => void;
  addSale: (saleData: Omit<Sale, 'sale_id' | 'sale_date'>) => void;
}
