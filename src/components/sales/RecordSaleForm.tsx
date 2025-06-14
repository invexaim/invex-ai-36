
import { useNavigate } from "react-router-dom";
import useAppStore from "@/store/appStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ProductSelector from "./form/ProductSelector";
import ClientSelector from "./form/ClientSelector";
import SaleDetailsForm from "./form/SaleDetailsForm";
import FormActions from "./form/FormActions";
import { useSaleForm } from "./hooks/useSaleForm";
import { validateSaleData, processSaleSubmission } from "./utils/saleProcessor";

interface RecordSaleFormProps {
  onClose: () => void;
}

const RecordSaleForm = ({ onClose }: RecordSaleFormProps) => {
  const navigate = useNavigate();
  const store = useAppStore();
  const { products, clients, recordSale, setPendingSalePayment, addClient } = store;
  
  console.log("RECORD SALE FORM: Store functions available:", {
    recordSale: typeof recordSale,
    setPendingSalePayment: typeof setPendingSalePayment,
    productsCount: products.length,
    clientsCount: clients.length
  });
  
  const {
    newSaleData,
    formErrors,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange
  } = useSaleForm();

  const handleAddSale = async () => {
    console.log("RECORD SALE FORM: Starting sale recording with data:", newSaleData);
    console.log("RECORD SALE FORM: recordSale function:", typeof recordSale);
    
    // Prevent double submissions
    if (isSubmitting) {
      console.log("RECORD SALE FORM: Already submitting, preventing duplicate");
      return;
    }

    // Validate the form first
    if (!validateForm()) {
      console.log("RECORD SALE FORM: Form validation failed");
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Check if recordSale function is available
    if (typeof recordSale !== 'function') {
      console.error("RECORD SALE FORM: recordSale is not a function, type:", typeof recordSale);
      console.error("RECORD SALE FORM: Store object:", store);
      toast.error("Sale recording function is not available. Please refresh the page and try again.");
      return;
    }

    // Validate sale data and stock
    const validation = validateSaleData(newSaleData, products, recordSale);
    if (!validation.isValid) {
      console.log("RECORD SALE FORM: Validation failed");
      return;
    }

    setIsSubmitting(true);
    
    const result = await processSaleSubmission(newSaleData, recordSale);
    
    if (result.success && result.sale) {
      // Store the sale details for the payment page
      setPendingSalePayment(result.sale);
      
      // Show success message
      toast.success("Sale recorded successfully! Redirecting to payments...");
      
      // Navigate to payments page immediately
      console.log("RECORD SALE FORM: Navigating to payments page");
      navigate("/payments");
      
      // Close dialog after a short delay to ensure navigation completes
      setTimeout(() => {
        console.log("RECORD SALE FORM: Closing dialog");
        onClose();
      }, 100);
    }
    
    setIsSubmitting(false);
  };

  const selectedProduct = products.find(p => p.product_id === newSaleData.product_id);

  return (
    <ScrollArea className="h-[80vh]">
      <div className="grid gap-4 py-4 px-2 pr-4">
        <ProductSelector
          products={products}
          selectedProductId={newSaleData.product_id}
          onProductChange={handleProductChange}
          error={formErrors.product_id}
          disabled={isSubmitting}
        />
        
        <ClientSelector
          clients={clients}
          selectedClientId={newSaleData.clientId}
          selectedClientName={newSaleData.clientName}
          onClientChange={handleClientChange}
          onAddClient={addClient}
          error={formErrors.clientName}
          disabled={isSubmitting}
        />
        
        <SaleDetailsForm
          quantity={newSaleData.quantity_sold}
          price={newSaleData.selling_price}
          maxQuantity={selectedProduct ? parseInt(selectedProduct.units as string) : undefined}
          onQuantityChange={handleQuantityChange}
          onPriceChange={handlePriceChange}
          quantityError={formErrors.quantity_sold}
          priceError={formErrors.selling_price}
          disabled={isSubmitting}
        />
        
        <FormActions
          onCancel={onClose}
          onSubmit={handleAddSale}
          isSubmitting={isSubmitting}
        />
      </div>
    </ScrollArea>
  );
};

export default RecordSaleForm;
