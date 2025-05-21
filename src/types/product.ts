
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
