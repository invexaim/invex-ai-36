
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/store/appStore";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import EstimateInfoCard from "./form/EstimateInfoCard";
import SaleFormContent from "./form/SaleFormContent";
import { useSaleFormSimple } from "./hooks/useSaleFormSimple";

interface RecordSaleFormProps {
  onClose: () => void;
  isFromEstimate?: boolean;
}

const RecordSaleForm = ({ onClose, isFromEstimate = false }: RecordSaleFormProps) => {
  const navigate = useNavigate();
  const { 
    products, 
    clients, 
    recordSale, 
    setPendingSalePayment, 
    addClient, 
    pendingEstimateForSale,
    setPendingEstimateForSale 
  } = useAppStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);
  
  const {
    newSaleData,
    formErrors,
    validateForm,
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange,
    estimateInfo,
    moveToNextItem,
    isInitialized
  } = useSaleFormSimple(isFromEstimate);

  // Check if form is ready - fixed type error
  useEffect(() => {
    console.log("RECORD SALE FORM: Checking form readiness", {
      hasProducts: !!products && products.length > 0,
      hasClients: !!clients,
      hasRecordSale: typeof recordSale === 'function',
      isFromEstimate,
      hasPendingEstimate: !!pendingEstimateForSale,
      isInitialized,
      newSaleData
    });

    // Fix: Ensure we always pass a boolean to setIsFormReady
    const hasProducts = products && products.length > 0;
    const hasClients = !!clients;
    const hasRecordSaleFunction = typeof recordSale === 'function';
    const hasEstimateWhenNeeded = !isFromEstimate || !!pendingEstimateForSale;
    
    const ready = hasProducts && hasClients && hasRecordSaleFunction && hasEstimateWhenNeeded && isInitialized;
    
    console.log("RECORD SALE FORM: Form readiness check", {
      hasProducts,
      hasClients,
      hasRecordSaleFunction,
      hasEstimateWhenNeeded,
      isInitialized,
      ready
    });
    
    setIsFormReady(ready);
    
    if (!ready) {
      console.warn("RECORD SALE FORM: Form not ready", {
        missingProducts: !hasProducts,
        missingClients: !hasClients,
        missingRecordSale: !hasRecordSaleFunction,
        missingEstimate: isFromEstimate && !pendingEstimateForSale,
        notInitialized: !isInitialized
      });
    }
  }, [products, clients, recordSale, isFromEstimate, pendingEstimateForSale, isInitialized, newSaleData]);

  const selectedProduct = products?.find(p => p.product_id === newSaleData.product_id);

  const handleSubmit = async () => {
    console.log("RECORD SALE FORM: Starting submission", { 
      isFromEstimate, 
      newSaleData,
      isFormReady,
      isSubmitting 
    });
    
    if (!isFormReady) {
      console.error("RECORD SALE FORM: Form not ready for submission");
      toast.error("Form is not ready. Please wait or refresh the page.");
      return;
    }
    
    if (isSubmitting) {
      console.warn("RECORD SALE FORM: Already submitting");
      toast.warning("Sale recording in progress...");
      return;
    }

    // Validate form data
    if (!validateForm()) {
      console.log("RECORD SALE FORM: Form validation failed");
      toast.error("Please fill in all required fields");
      return;
    }

    // Additional validation for stock
    if (selectedProduct) {
      const availableStock = parseInt(selectedProduct.units as string);
      if (availableStock < newSaleData.quantity_sold) {
        console.warn("RECORD SALE FORM: Insufficient stock", {
          available: availableStock,
          required: newSaleData.quantity_sold
        });
        toast.error(`Insufficient stock. Available: ${availableStock}, Required: ${newSaleData.quantity_sold}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      console.log("RECORD SALE FORM: Calling recordSale with data:", newSaleData);
      
      // Ensure recordSale function is available
      if (typeof recordSale !== 'function') {
        throw new Error("recordSale function not available");
      }
      
      const result = recordSale(newSaleData);
      console.log("RECORD SALE FORM: recordSale result:", result);
      
      if (result && result.sale_id) {
        console.log("RECORD SALE FORM: Sale recorded successfully:", result);
        
        // Handle estimate flow
        if (estimateInfo && estimateInfo.hasMoreItems) {
          console.log("RECORD SALE FORM: Moving to next estimate item");
          moveToNextItem();
          toast.success(`Item ${estimateInfo.currentIndex + 1} recorded! Continue with next item.`);
          setIsSubmitting(false);
          return;
        }
        
        // Set pending payment
        const saleWithEstimateInfo = {
          ...result,
          estimateId: pendingEstimateForSale?.id,
          isFromEstimate: !!pendingEstimateForSale
        };
        
        if (typeof setPendingSalePayment === 'function') {
          console.log("RECORD SALE FORM: Setting pending sale payment");
          setPendingSalePayment(saleWithEstimateInfo);
        } else {
          console.error("RECORD SALE FORM: setPendingSalePayment not available");
          throw new Error("Payment system not available");
        }
        
        // Clear estimate if complete
        if (isFromEstimate) {
          console.log("RECORD SALE FORM: Clearing pending estimate");
          setPendingEstimateForSale(null);
        }
        
        toast.success("Sale recorded! Redirecting to payments...");
        onClose();
        
        setTimeout(() => {
          console.log("RECORD SALE FORM: Navigating to payments");
          navigate("/payments");
        }, 100);
        
      } else {
        console.error("RECORD SALE FORM: recordSale failed, result:", result);
        throw new Error("Failed to record sale - invalid result");
      }
    } catch (error) {
      console.error("RECORD SALE FORM: Error during submission:", error);
      toast.error(`Error recording sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state if form is not ready
  if (!isFormReady) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Preparing form...</p>
          {!products || products.length === 0 && (
            <p className="text-sm text-red-600 mt-2">No products available</p>
          )}
          {typeof recordSale !== 'function' && (
            <p className="text-sm text-red-600 mt-2">Sales system not ready</p>
          )}
          {isFromEstimate && !pendingEstimateForSale && (
            <p className="text-sm text-red-600 mt-2">No estimate data available</p>
          )}
          {!isInitialized && (
            <p className="text-sm text-yellow-600 mt-2">Initializing form...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[80vh]">
      <div className="grid gap-4 py-4 px-2 pr-4">
        {isFromEstimate && pendingEstimateForSale && estimateInfo && (
          <EstimateInfoCard 
            pendingEstimateForSale={pendingEstimateForSale}
            estimateInfo={estimateInfo}
          />
        )}
        
        <SaleFormContent
          isFromEstimate={isFromEstimate}
          estimateInfo={estimateInfo}
          selectedProduct={selectedProduct}
          products={products || []}
          clients={clients || []}
          newSaleData={newSaleData}
          formErrors={formErrors}
          isSubmitting={isSubmitting}
          onProductChange={handleProductChange}
          onClientChange={handleClientChange}
          onQuantityChange={handleQuantityChange}
          onPriceChange={handlePriceChange}
          onAddClient={addClient}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !isFormReady}>
            {isSubmitting ? "Recording..." : 
             estimateInfo && estimateInfo.hasMoreItems 
               ? `Record Item ${estimateInfo.currentIndex + 1} & Continue`
               : isFromEstimate
               ? "Complete Estimate & Proceed to Payment"
               : "Record Sale & Proceed to Payment"
            }
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default RecordSaleForm;
