
import { useState } from "react";
import { SaleFormData, FormErrors } from "./types";

export const useFormState = (initialData?: Partial<SaleFormData>) => {
  const [newSaleData, setNewSaleData] = useState<SaleFormData>({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
    ...initialData
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({
    product_id: false,
    quantity_sold: false,
    selling_price: false,
    clientName: false
  });

  const updateSaleData = (updates: Partial<SaleFormData>) => {
    setNewSaleData(prev => ({ ...prev, ...updates }));
  };

  const updateErrors = (errors: Partial<FormErrors>) => {
    setFormErrors(prev => ({ ...prev, ...errors }));
  };

  const resetForm = () => {
    setNewSaleData({
      product_id: 0,
      quantity_sold: 1,
      selling_price: 0,
      clientId: 0,
      clientName: "",
    });
    setFormErrors({
      product_id: false,
      quantity_sold: false,
      selling_price: false,
      clientName: false
    });
  };

  return {
    newSaleData,
    formErrors,
    updateSaleData,
    updateErrors,
    resetForm,
    setNewSaleData,
    setFormErrors
  };
};
