
export interface StockPredictionInput {
  date: string;
  product_id: number;
  current_stock: number;
  previous_sales: number;
  price: number;
}
