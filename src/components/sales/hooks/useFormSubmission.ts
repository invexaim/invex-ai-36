
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";

interface SubmissionData {
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  clientId: number;
  clientName: string;
}

interface EstimateInfo {
  currentIndex: number;
  hasMoreItems: boolean;
}

export const useFormSubmission = (
  onClose: () => void,
  isFromEstimate: boolean
) => {
  const navigate = useNavigate();
  const { 
    products, 
    recordSale, 
    setPendingSalePayment, 
    pendingEstimateForSale,
    setPendingEstimateForSale 
  } = useAppStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    newSaleData: SubmissionData,
    validateForm: () => boolean,
    estimateInfo: EstimateInfo | null,
    moveToNextItem: () => void
  ) => {
    console.log("FORM SUBMISSION: Starting submission", { 
      isFromEstimate, 
      newSaleData,
      isSubmitting 
    });
    
    if (isSubmitting) {
      console.warn("FORM SUBMISSION: Already submitting");
      toast.warning("Sale recording in progress...");
      return;
    }

    if (!validateForm()) {
      console.log("FORM SUBMISSION: Form validation failed");
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedProduct = products?.find(p => p.product_id === newSaleData.product_id);
    if (selectedProduct) {
      const availableStock = parseInt(selectedProduct.units as string);
      if (availableStock < newSaleData.quantity_sold) {
        console.warn("FORM SUBMISSION: Insufficient stock", {
          available: availableStock,
          required: newSaleData.quantity_sold
        });
        toast.error(`Insufficient stock. Available: ${availableStock}, Required: ${newSaleData.quantity_sold}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      console.log("FORM SUBMISSION: Calling recordSale with data:", newSaleData);
      
      if (typeof recordSale !== 'function') {
        throw new Error("recordSale function not available");
      }
      
      const result = recordSale(newSaleData);
      console.log("FORM SUBMISSION: recordSale result:", result);
      
      if (result && result.sale_id) {
        console.log("FORM SUBMISSION: Sale recorded successfully:", result);
        
        if (estimateInfo && estimateInfo.hasMoreItems) {
          console.log("FORM SUBMISSION: Moving to next estimate item");
          moveToNextItem();
          toast.success(`Item ${estimateInfo.currentIndex + 1} recorded! Continue with next item.`);
          setIsSubmitting(false);
          return;
        }
        
        const saleWithEstimateInfo = {
          ...result,
          estimateId: pendingEstimateForSale?.id,
          isFromEstimate: !!pendingEstimateForSale
        };
        
        if (typeof setPendingSalePayment === 'function') {
          console.log("FORM SUBMISSION: Setting pending sale payment");
          setPendingSalePayment(saleWithEstimateInfo);
        } else {
          console.error("FORM SUBMISSION: setPendingSalePayment not available");
          throw new Error("Payment system not available");
        }
        
        if (isFromEstimate) {
          console.log("FORM SUBMISSION: Clearing pending estimate");
          setPendingEstimateForSale(null);
        }
        
        toast.success("Sale recorded! Redirecting to payments...");
        onClose();
        
        setTimeout(() => {
          console.log("FORM SUBMISSION: Navigating to payments");
          navigate("/payments");
        }, 100);
        
      } else {
        console.error("FORM SUBMISSION: recordSale failed, result:", result);
        throw new Error("Failed to record sale - invalid result");
      }
    } catch (error) {
      console.error("FORM SUBMISSION: Error during submission:", error);
      toast.error(`Error recording sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
