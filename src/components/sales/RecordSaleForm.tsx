
import { useState } from "react";
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
  
  const {
    newSaleData,
    formErrors,
    validateForm,
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange,
    estimateInfo,
    moveToNextItem
  } = useSaleFormSimple(isFromEstimate);

  const selectedProduct = products?.find(p => p.product_id === newSaleData.product_id);

  const handleSubmit = async () => {
    console.log("RECORD SALE: Starting submission", { isFromEstimate, newSaleData });
    
    if (isSubmitting) {
      toast.warning("Sale recording in progress...");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!recordSale || typeof recordSale !== 'function') {
      toast.error("Sale recording system not available");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = recordSale(newSaleData);
      
      if (result) {
        console.log("RECORD SALE: Sale recorded successfully:", result);
        
        // Handle estimate flow
        if (estimateInfo && estimateInfo.hasMoreItems) {
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
        
        setPendingSalePayment(saleWithEstimateInfo);
        
        // Clear estimate if complete
        if (isFromEstimate) {
          setPendingEstimateForSale(null);
        }
        
        toast.success("Sale recorded! Redirecting to payments...");
        onClose();
        
        setTimeout(() => {
          navigate("/payments");
        }, 100);
        
      } else {
        toast.error("Failed to record sale");
      }
    } catch (error) {
      console.error("RECORD SALE: Error:", error);
      toast.error("An error occurred while recording the sale");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          products={products}
          clients={clients}
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
          <Button onClick={handleSubmit} disabled={isSubmitting}>
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
