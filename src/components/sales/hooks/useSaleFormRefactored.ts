
import { useEffect } from "react";
import useAppStore from "@/store/appStore";
import { useFormState } from "./useFormState";
import { useFormValidation } from "./useFormValidation";
import { useEstimateHandling } from "./useEstimateHandling";
import { useFormHandlers } from "./useFormHandlers";

export const useSaleFormRefactored = (isFromEstimate: boolean = false) => {
  const { products } = useAppStore();
  
  const {
    newSaleData,
    formErrors,
    updateSaleData,
    updateErrors,
    resetForm,
    setFormErrors
  } = useFormState();
  
  const { validateForm: validateFormData } = useFormValidation();
  
  const {
    estimateInfo,
    moveToNextItem,
    initializeFromEstimate
  } = useEstimateHandling(isFromEstimate);
  
  const formHandlers = useFormHandlers({ updateSaleData, updateErrors });

  // Initialize form based on mode
  useEffect(() => {
    if (isFromEstimate) {
      const estimateData = initializeFromEstimate();
      if (estimateData) {
        updateSaleData(estimateData);
      }
    } else {
      console.log("SALE FORM: Initializing regular sale");
      resetForm();
    }
  }, [isFromEstimate, estimateInfo?.currentIndex, products]);

  const validateForm = () => {
    const validation = validateFormData(newSaleData, isFromEstimate);
    setFormErrors(validation.errors);
    return validation.isValid;
  };

  return {
    newSaleData,
    formErrors,
    validateForm,
    estimateInfo,
    moveToNextItem,
    isFromEstimate,
    ...formHandlers
  };
};
