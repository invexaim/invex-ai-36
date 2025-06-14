
export interface SaleFormData {
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  clientId: number;
  clientName: string;
}

export interface FormErrors {
  product_id: boolean;
  quantity_sold: boolean;
  selling_price: boolean;
  clientName: boolean;
}

export interface EstimateInfo {
  items: any[];
  currentIndex: number;
  totalItems: number;
  hasMoreItems: boolean;
}
