
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import EstimateInfoCard from "./form/EstimateInfoCard";
import SaleFormContent from "./form/SaleFormContent";
import { useSaleFormSimple } from "./hooks/useSaleFormSimple";
import { useFormSubmission } from "./hooks/useFormSubmission";
import useAppStore from "@/store/appStore";

interface RecordSaleFormProps {
  onClose: () => void;
  isFromEstimate?: boolean;
}

const RecordSaleForm = ({ onClose, isFromEstimate = false }: RecordSaleFormProps) => {
  const { 
    products, 
    clients, 
    addClient, 
    pendingEstimateForSale,
    recordSale 
  } = useAppStore();
  
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

  const { isSubmitting, handleSubmit } = useFormSubmission(onClose, isFromEstimate);

  // Simple validation - show error if critical data is missing
  if (!products || products.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">No products available</p>
        <p className="text-sm text-muted-foreground">Please add products before recording sales.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  if (!recordSale || typeof recordSale !== 'function') {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Sales system not ready</p>
        <p className="text-sm text-muted-foreground">Please refresh the page and try again.</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  const selectedProduct = products?.find(p => p.product_id === newSaleData.product_id);

  const onSubmit = async () => {
    await handleSubmit(newSaleData, validateForm, estimateInfo, moveToNextItem);
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
          <Button onClick={onSubmit} disabled={isSubmitting}>
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
