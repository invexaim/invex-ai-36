
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { validateSaleData, processSaleSubmission } from "../utils/saleProcessor";

interface UseSaleSubmissionProps {
  newSaleData: {
    product_id: number;
    quantity_sold: number;
    selling_price: number;
    clientId: number;
    clientName: string;
  };
  validateForm: () => boolean;
  isFromEstimate: boolean;
  estimateInfo: {
    currentIndex: number;
    totalItems: number;
    hasMoreItems: boolean;
  } | null;
  moveToNextEstimateItem: () => void;
  pendingEstimateForSale: any;
  products: any[];
  recordSale: any;
  setPendingSalePayment: any;
  setPendingEstimateForSale: any;
  onClose: () => void;
}

export const useSaleSubmission = ({
  newSaleData,
  validateForm,
  isFromEstimate,
  estimateInfo,
  moveToNextEstimateItem,
  pendingEstimateForSale,
  products,
  recordSale,
  setPendingSalePayment,
  setPendingEstimateForSale,
  onClose
}: UseSaleSubmissionProps) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSale = async () => {
    console.log("RECORD SALE FORM: Starting sale recording process", {
      isFromEstimate,
      saleData: newSaleData,
      estimateInfo
    });
    
    if (isSubmitting) {
      console.log("RECORD SALE FORM: Already submitting, preventing duplicate");
      toast.warning("Sale recording in progress, please wait...");
      return;
    }

    // Validate basic requirements
    if (!recordSale || typeof recordSale !== 'function') {
      console.error("RECORD SALE FORM: recordSale function is not available");
      toast.error("Sale recording system is not available. Please refresh the page and try again.");
      return;
    }

    // For estimates, ensure we have valid product data
    if (isFromEstimate) {
      if (!newSaleData.product_id) {
        console.error("RECORD SALE FORM: No product ID from estimate");
        toast.error("Product information missing from estimate");
        return;
      }
      
      if (newSaleData.quantity_sold <= 0 || newSaleData.selling_price <= 0) {
        toast.error("Please enter valid quantity and price");
        return;
      }
    } else {
      // For regular sales, validate the form normally
      if (!validateForm()) {
        console.log("RECORD SALE FORM: Form validation failed");
        toast.error("Please fill in all required fields correctly");
        return;
      }
    }

    // Validate products availability
    if (!products || products.length === 0) {
      console.error("RECORD SALE FORM: No products available");
      toast.error("No products available. Please add products first.");
      return;
    }

    // Validate sale data and stock
    const validation = validateSaleData(newSaleData, products, recordSale);
    if (!validation.isValid) {
      console.log("RECORD SALE FORM: Sale data validation failed");
      return;
    }

    console.log("RECORD SALE FORM: All validations passed, proceeding with sale recording");
    setIsSubmitting(true);
    
    try {
      // Add estimate ID to sale data if available
      const saleDataWithEstimate = {
        ...newSaleData,
        estimateId: pendingEstimateForSale?.id
      };

      const result = await processSaleSubmission(saleDataWithEstimate, recordSale);
      
      if (result.success && result.sale) {
        console.log("RECORD SALE FORM: Sale recorded successfully:", result.sale);
        
        // Check if this is the last item from an estimate
        const shouldCompleteEstimate = estimateInfo && !estimateInfo.hasMoreItems;
        
        if (estimateInfo && estimateInfo.hasMoreItems) {
          // Move to next item in estimate
          moveToNextEstimateItem();
          toast.success(`Item ${estimateInfo.currentIndex + 1} of ${estimateInfo.totalItems} recorded! Continue with next item.`);
          setIsSubmitting(false);
          return;
        }
        
        // Store the sale details for the payment page with estimate info
        const saleWithEstimateInfo = {
          ...result.sale,
          estimateId: pendingEstimateForSale?.id,
          isFromEstimate: !!pendingEstimateForSale,
          shouldCompleteEstimate
        };
        
        setPendingSalePayment(saleWithEstimateInfo);
        console.log("RECORD SALE FORM: Pending sale payment set with estimate info");
        
        // Clear the pending estimate since we're done with it
        console.log("RECORD SALE FORM: Clearing pending estimate data");
        setPendingEstimateForSale(null);
        
        // Show success message
        if (shouldCompleteEstimate) {
          toast.success("All estimate items recorded! Redirecting to payments...");
        } else if (isFromEstimate) {
          toast.success("Estimate sale recorded! Redirecting to payments...");
        } else {
          toast.success("Sale recorded successfully! Redirecting to payments...");
        }
        
        // Close dialog first
        onClose();
        
        // Navigate to payments page with a slight delay to ensure dialog closes
        setTimeout(() => {
          console.log("RECORD SALE FORM: Navigating to payments page");
          navigate("/payments");
        }, 100);
        
      } else {
        console.error("RECORD SALE FORM: Sale recording failed:", result);
        toast.error("Failed to record sale. Please check the details and try again.");
      }
    } catch (error) {
      console.error("RECORD SALE FORM: Unexpected error during sale submission:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleAddSale
  };
};
