
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import EstimateInfoCard from "./form/EstimateInfoCard";
import SaleFormContent from "./form/SaleFormContent";
import LoadingState from "./form/LoadingState";
import { useSaleFormSimple } from "./hooks/useSaleFormSimple";
import { useFormReadiness } from "./hooks/useFormReadiness";
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
    pendingEstimateForSale 
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

  const { isFormReady, hasProducts, hasRecordSale, hasPendingEstimate } = useFormReadiness(
    isFromEstimate,
    isInitialized
  );

  const { isSubmitting, handleSubmit } = useFormSubmission(onClose, isFromEstimate);

  const selectedProduct = products?.find(p => p.product_id === newSaleData.product_id);

  const onSubmit = async () => {
    await handleSubmit(newSaleData, validateForm, estimateInfo, moveToNextItem);
  };

  if (!isFormReady) {
    return (
      <LoadingState
        hasProducts={hasProducts}
        hasRecordSale={hasRecordSale}
        isFromEstimate={isFromEstimate}
        hasPendingEstimate={hasPendingEstimate}
        isInitialized={isInitialized}
      />
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
          <Button onClick={onSubmit} disabled={isSubmitting || !isFormReady}>
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
