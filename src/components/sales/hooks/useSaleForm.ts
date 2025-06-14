
import { useState } from "react";
import { toast } from "sonner";

interface SaleFormData {
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  clientId: number;
  clientName: string;
}

interface FormErrors {
  product_id: boolean;
  quantity_sold: boolean;
  selling_price: boolean;
  clientName: boolean;
}

export const useSaleForm = () => {
  const [newSaleData, setNewSaleData] = useState<SaleFormData>({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({
    product_id: false,
    quantity_sold: false,
    selling_price: false,
    clientName: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: FormErrors = {
      product_id: !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !newSaleData.clientName.trim()
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleProductChange = (productId: number, price: number) => {
    console.log("SALE FORM: Product changed", { productId, price });
    setNewSaleData({
      ...newSaleData,
      product_id: productId,
      selling_price: price,
    });
    setFormErrors({
      ...formErrors,
      product_id: !productId
    });
  };

  const handleClientChange = (clientId: number, clientName: string) => {
    console.log("SALE FORM: Client changed", { clientId, clientName });
    setNewSaleData({
      ...newSaleData,
      clientId: clientId,
      clientName: clientName,
    });
    
    setFormErrors({
      ...formErrors,
      clientName: !clientName.trim()
    });
  };

  const handleQuantityChange = (quantity: number) => {
    setNewSaleData({
      ...newSaleData,
      quantity_sold: quantity,
    });
    setFormErrors({
      ...formErrors,
      quantity_sold: quantity <= 0
    });
  };

  const handlePriceChange = (price: number) => {
    setNewSaleData({
      ...newSaleData,
      selling_price: price,
    });
    setFormErrors({
      ...formErrors,
      selling_price: price <= 0
    });
  };

  return {
    newSaleData,
    formErrors,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange
  };
};
