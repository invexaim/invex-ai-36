
import { SaleFormData, FormErrors } from "./types";

interface UseFormHandlersProps {
  updateSaleData: (updates: Partial<SaleFormData>) => void;
  updateErrors: (errors: Partial<FormErrors>) => void;
}

export const useFormHandlers = ({ updateSaleData, updateErrors }: UseFormHandlersProps) => {
  const handleProductChange = (productId: number, price: number) => {
    updateSaleData({
      product_id: productId,
      selling_price: price,
    });
    updateErrors({ product_id: !productId });
  };

  const handleClientChange = (clientId: number, clientName: string) => {
    updateSaleData({
      clientId: clientId,
      clientName: clientName,
    });
    updateErrors({ clientName: !clientName.trim() });
  };

  const handleQuantityChange = (quantity: number) => {
    updateSaleData({ quantity_sold: quantity });
    updateErrors({ quantity_sold: quantity <= 0 });
  };

  const handlePriceChange = (price: number) => {
    updateSaleData({ selling_price: price });
    updateErrors({ selling_price: price <= 0 });
  };

  return {
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange
  };
};
