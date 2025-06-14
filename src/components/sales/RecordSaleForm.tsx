
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useAppStore from "@/store/appStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import ProductSelector from "./form/ProductSelector";
import ClientSelector from "./form/ClientSelector";
import SaleDetailsForm from "./form/SaleDetailsForm";

interface RecordSaleFormProps {
  onClose: () => void;
}

const RecordSaleForm = ({ onClose }: RecordSaleFormProps) => {
  const navigate = useNavigate();
  const { products, clients, recordSale, setPendingSalePayment, addClient } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSaleData, setNewSaleData] = useState({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
  });
  
  const [formErrors, setFormErrors] = useState({
    product_id: false,
    quantity_sold: false,
    selling_price: false,
    clientName: false
  });

  const validateForm = () => {
    const errors = {
      product_id: !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !newSaleData.clientName
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleAddSale = async () => {
    // Prevent double submissions
    if (isSubmitting) {
      return;
    }

    // Validate the form
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("SALE FORM: Starting sale recording process", newSaleData);
      
      // Record the sale using our store function
      const recordedSale = recordSale(newSaleData);
      
      if (recordedSale) {
        console.log("SALE FORM: Sale recorded successfully", recordedSale);
        
        // Store the sale details for the payment page
        setPendingSalePayment(recordedSale);
        
        // Show success message
        toast.success("Sale recorded! Redirecting to payments...");
        
        // Reset form state
        setNewSaleData({
          product_id: 0,
          quantity_sold: 1,
          selling_price: 0,
          clientId: 0,
          clientName: "",
        });
        
        // Navigate to payments page BEFORE closing dialog
        console.log("SALE FORM: Navigating to payments page");
        navigate("/payments");
        
        // Close dialog AFTER navigation
        setTimeout(() => {
          onClose();
        }, 100);
        
      } else {
        console.error("SALE FORM: Failed to record sale - recordSale returned null");
        toast.error("Failed to record sale. Please try again.");
      }
    } catch (error) {
      console.error("SALE FORM: Error recording sale:", error);
      toast.error("An error occurred while recording the sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductChange = (productId: number, price: number) => {
    setNewSaleData({
      ...newSaleData,
      product_id: productId,
      selling_price: price,
    });
    setFormErrors({
      ...formErrors,
      product_id: !productId
    });
  };

  const handleClientChange = (clientId: number, clientName: string) => {
    setNewSaleData({
      ...newSaleData,
      clientId: clientId,
      clientName: clientName,
    });
    
    setFormErrors({
      ...formErrors,
      clientName: !clientName
    });
  };

  const handleQuantityChange = (quantity: number) => {
    setNewSaleData({
      ...newSaleData,
      quantity_sold: quantity,
    });
    setFormErrors({
      ...formErrors,
      quantity_sold: quantity <= 0
    });
  };

  const handlePriceChange = (price: number) => {
    setNewSaleData({
      ...newSaleData,
      selling_price: price,
    });
    setFormErrors({
      ...formErrors,
      selling_price: price <= 0
    });
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
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleAddSale}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Recording Sale..." : "Record Sale"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default RecordSaleForm;
