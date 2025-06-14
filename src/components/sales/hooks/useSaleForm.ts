
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";

interface SaleFormData {
  product_id: number;
  quantity_sold: number;
  selling_price: number;
  clientId: number;
  clientName: string;
}

interface FormErrors {
  product_id: boolean;
  quantity_sold: boolean;
  selling_price: boolean;
  clientName: boolean;
}

export const useSaleForm = () => {
  const { pendingEstimateForSale, products } = useAppStore();
  
  // Only treat as estimate-based if there's actually pending estimate data
  const isFromEstimate = !!(pendingEstimateForSale && pendingEstimateForSale.items && pendingEstimateForSale.items.length > 0);
  
  const [newSaleData, setNewSaleData] = useState<SaleFormData>({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
  });
  
  const [formErrors, setFormErrors] = useState<FormErrors>({
    product_id: false,
    quantity_sold: false,
    selling_price: false,
    clientName: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEstimateItem, setCurrentEstimateItem] = useState(0);

  // Only pre-populate form with estimate data if we're actually from an estimate
  useEffect(() => {
    if (isFromEstimate) {
      const currentItem = pendingEstimateForSale.items[currentEstimateItem];
      console.log("SALE FORM: Pre-populating with estimate data:", {
        currentItem,
        currentIndex: currentEstimateItem,
        totalItems: pendingEstimateForSale.items.length
      });
      
      // Find the product by matching name or ID
      let productId = currentItem.product_id;
      if (!productId && products) {
        const matchedProduct = products.find(p => 
          p.product_name === currentItem.product_name ||
          p.product_name === currentItem.name
        );
        productId = matchedProduct?.product_id || 0;
      }
      
      setNewSaleData({
        product_id: productId || 0,
        quantity_sold: currentItem.quantity || 1,
        selling_price: currentItem.price || 0,
        clientId: 0,
        clientName: pendingEstimateForSale.clientName || "",
      });
    } else {
      // Reset to default values for regular sales
      console.log("SALE FORM: Resetting form for regular sale");
      setNewSaleData({
        product_id: 0,
        quantity_sold: 1,
        selling_price: 0,
        clientId: 0,
        clientName: "",
      });
    }
  }, [pendingEstimateForSale, currentEstimateItem, isFromEstimate, products]);

  const validateForm = () => {
    const errors: FormErrors = {
      product_id: !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !isFromEstimate && !newSaleData.clientName.trim() // Only require client for regular sales
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
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

  const getEstimateItemsInfo = () => {
    if (!isFromEstimate) return null;
    
    return {
      items: pendingEstimateForSale.items,
      currentIndex: currentEstimateItem,
      totalItems: pendingEstimateForSale.items.length,
      hasMoreItems: currentEstimateItem < pendingEstimateForSale.items.length - 1
    };
  };

  const moveToNextEstimateItem = () => {
    if (isFromEstimate && currentEstimateItem < pendingEstimateForSale.items.length - 1) {
      const nextIndex = currentEstimateItem + 1;
      setCurrentEstimateItem(nextIndex);
      // The useEffect will handle updating the form data
    }
  };

  return {
    newSaleData,
    formErrors,
    isSubmitting,
    setIsSubmitting,
    validateForm,
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange,
    getEstimateItemsInfo,
    moveToNextEstimateItem,
    isFromEstimate
  };
};
