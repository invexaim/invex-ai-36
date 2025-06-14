
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
      clientName: !newSaleData.clientName.trim()
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleAddSale = async () => {
    console.log("SALE FORM: Starting sale recording with data:", newSaleData);
    
    // Prevent double submissions
    if (isSubmitting) {
      console.log("SALE FORM: Already submitting, preventing duplicate");
      return;
    }

    // Validate the form first
    if (!validateForm()) {
      console.log("SALE FORM: Form validation failed");
      toast.error("Please fill in all required fields correctly");
      return;
    }

    // Check if product exists and has sufficient stock
    const selectedProduct = products.find(p => p.product_id === newSaleData.product_id);
    if (!selectedProduct) {
      console.log("SALE FORM: Product not found");
      toast.error("Selected product not found");
      return;
    }

    const availableStock = parseInt(selectedProduct.units as string);
    if (availableStock < newSaleData.quantity_sold) {
      console.log("SALE FORM: Insufficient stock", { 
        available: availableStock, 
        requested: newSaleData.quantity_sold 
      });
      toast.error(`Insufficient stock. Available: ${availableStock}, Requested: ${newSaleData.quantity_sold}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("SALE FORM: Attempting to record sale", {
        productId: newSaleData.product_id,
        quantity: newSaleData.quantity_sold,
        price: newSaleData.selling_price,
        clientName: newSaleData.clientName
      });
      
      // Record the sale using our store function
      const recordedSale = recordSale({
        product_id: newSaleData.product_id,
        quantity_sold: newSaleData.quantity_sold,
        selling_price: newSaleData.selling_price,
        clientId: newSaleData.clientId,
        clientName: newSaleData.clientName.trim()
      });
      
      console.log("SALE FORM: recordSale result:", recordedSale);
      
      if (recordedSale) {
        console.log("SALE FORM: Sale recorded successfully", recordedSale);
        
        // Store the sale details for the payment page
        setPendingSalePayment(recordedSale);
        
        // Show success message
        toast.success("Sale recorded successfully! Redirecting to payments...");
        
        // Navigate to payments page immediately
        console.log("SALE FORM: Navigating to payments page");
        navigate("/payments");
        
        // Close dialog after a short delay to ensure navigation completes
        setTimeout(() => {
          console.log("SALE FORM: Closing dialog");
          onClose();
        }, 100);
        
      } else {
        console.error("SALE FORM: recordSale returned null or undefined");
        toast.error("Failed to record sale. Please try again.");
      }
    } catch (error) {
      console.error("SALE FORM: Error recording sale:", error);
      toast.error(`Error recording sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProductChange = (productId: number, price: number) => {
    console.log("SALE FORM: Product changed", { productId, price });
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
    console.log("SALE FORM: Client changed", { clientId, clientName });
    setNewSaleData({
      ...newSaleData,
      clientId: clientId,
      clientName: clientName,
    });
    
    setFormErrors({
      ...formErrors,
      clientName: !clientName.trim()
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
