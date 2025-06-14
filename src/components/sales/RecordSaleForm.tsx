
import useAppStore from "@/store/appStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import EstimateInfoCard from "./form/EstimateInfoCard";
import SaleFormContent from "./form/SaleFormContent";
import FormActions from "./form/FormActions";
import { useSaleForm } from "./hooks/useSaleForm";
import { useSaleSubmission } from "./hooks/useSaleSubmission";

interface RecordSaleFormProps {
  onClose: () => void;
  isFromEstimate?: boolean;
}

const RecordSaleForm = ({ onClose, isFromEstimate = false }: RecordSaleFormProps) => {
  const store = useAppStore();
  const { 
    products, 
    clients, 
    recordSale, 
    setPendingSalePayment, 
    addClient, 
    pendingEstimateForSale,
    setPendingEstimateForSale 
  } = store;
  
  console.log("RECORD SALE FORM: Component mounted", { isFromEstimate, hasEstimate: !!pendingEstimateForSale });
  
  const {
    newSaleData,
    formErrors,
    validateForm,
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange,
    getEstimateItemsInfo,
    moveToNextEstimateItem,
    isFromEstimate: shouldUseEstimate
  } = useSaleForm(isFromEstimate);

  const estimateInfo = getEstimateItemsInfo();

  const { isSubmitting, handleAddSale } = useSaleSubmission({
    newSaleData,
    validateForm,
    isFromEstimate: shouldUseEstimate,
    estimateInfo,
    moveToNextEstimateItem,
    pendingEstimateForSale,
    products,
    recordSale,
    setPendingSalePayment,
    setPendingEstimateForSale,
    onClose
  });

  const selectedProduct = products?.find(p => p.product_id === newSaleData.product_id);

  return (
    <ScrollArea className="h-[80vh]">
      <div className="grid gap-4 py-4 px-2 pr-4">
        {/* Only show estimate info card when actually from estimate */}
        {shouldUseEstimate && pendingEstimateForSale && (
          <EstimateInfoCard 
            pendingEstimateForSale={pendingEstimateForSale}
            estimateInfo={estimateInfo}
          />
        )}
        
        <SaleFormContent
          isFromEstimate={shouldUseEstimate}
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
        
        <FormActions
          onCancel={onClose}
          onSubmit={handleAddSale}
          isSubmitting={isSubmitting}
          submitText={
            estimateInfo && estimateInfo.hasMoreItems 
              ? `Record Item ${estimateInfo.currentIndex + 1} & Continue`
              : shouldUseEstimate
              ? "Complete Estimate & Proceed to Payment"
              : "Record Sale & Proceed to Payment"
          }
        />
      </div>
    </ScrollArea>
  );
};

export default RecordSaleForm;
