
import { useState, useEffect, useCallback } from "react";
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

export const useSaleForm = (isFromEstimate: boolean = false) => {
  const { pendingEstimateForSale, products } = useAppStore();
  
  // Use the passed prop instead of calculating from store to prevent conflicts
  const shouldUseEstimate = isFromEstimate && !!(pendingEstimateForSale && pendingEstimateForSale.items && pendingEstimateForSale.items.length > 0);
  
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

  // Memoize the form initialization to prevent flickering
  const initializeForm = useCallback(() => {
    if (shouldUseEstimate) {
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
      console.log("SALE FORM: Initializing form for regular sale");
      setNewSaleData({
        product_id: 0,
        quantity_sold: 1,
        selling_price: 0,
        clientId: 0,
        clientName: "",
      });
    }
  }, [shouldUseEstimate, pendingEstimateForSale, currentEstimateItem, products]);

  // Initialize form when component mounts or key dependencies change
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const validateForm = () => {
    const errors: FormErrors = {
      product_id: !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !shouldUseEstimate && !newSaleData.clientName.trim() // Only require client for regular sales
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleProductChange = (productId: number, price: number) => {
    console.log("SALE FORM: Product changed", { productId, price });
    setNewSaleData(prev => ({
      ...prev,
      product_id: productId,
      selling_price: price,
    }));
    setFormErrors(prev => ({
      ...prev,
      product_id: !productId
    }));
  };

  const handleClientChange = (clientId: number, clientName: string) => {
    console.log("SALE FORM: Client changed", { clientId, clientName });
    setNewSaleData(prev => ({
      ...prev,
      clientId: clientId,
      clientName: clientName,
    }));
    
    setFormErrors(prev => ({
      ...prev,
      clientName: !clientName.trim()
    }));
  };

  const handleQuantityChange = (quantity: number) => {
    setNewSaleData(prev => ({
      ...prev,
      quantity_sold: quantity,
    }));
    setFormErrors(prev => ({
      ...prev,
      quantity_sold: quantity <= 0
    }));
  };

  const handlePriceChange = (price: number) => {
    setNewSaleData(prev => ({
      ...prev,
      selling_price: price,
    }));
    setFormErrors(prev => ({
      ...prev,
      selling_price: price <= 0
    }));
  };

  const getEstimateItemsInfo = () => {
    if (!shouldUseEstimate) return null;
    
    return {
      items: pendingEstimateForSale.items,
      currentIndex: currentEstimateItem,
      totalItems: pendingEstimateForSale.items.length,
      hasMoreItems: currentEstimateItem < pendingEstimateForSale.items.length - 1
    };
  };

  const moveToNextEstimateItem = () => {
    if (shouldUseEstimate && currentEstimateItem < pendingEstimateForSale.items.length - 1) {
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
    isFromEstimate: shouldUseEstimate
  };
};
