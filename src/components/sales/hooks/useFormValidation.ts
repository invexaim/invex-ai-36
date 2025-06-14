
import { SaleFormData, FormErrors } from "./types";

export const useFormValidation = () => {
  const validateForm = (saleData: SaleFormData, isFromEstimate: boolean = false) => {
    const errors: FormErrors = {
      product_id: !saleData.product_id,
      quantity_sold: saleData.quantity_sold <= 0,
      selling_price: saleData.selling_price <= 0,
      clientName: !isFromEstimate && !saleData.clientName.trim()
    };
    
    return {
      errors,
      isValid: !Object.values(errors).some(error => error)
    };
  };

  return { validateForm };
};
