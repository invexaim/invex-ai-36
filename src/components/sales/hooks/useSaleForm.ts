
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
  
  // Cleaner logic for determining if this is an estimate-based sale
  const isEstimateSale = isFromEstimate && pendingEstimateForSale && pendingEstimateForSale.items && pendingEstimateForSale.items.length > 0;
  
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

  const [currentEstimateItem, setCurrentEstimateItem] = useState(0);

  // Enhanced product matching for estimate items
  const findProductFromEstimateItem = useCallback((estimateItem: any) => {
    if (!products || !estimateItem) return null;
    
    // First try to match by product_id if available
    if (estimateItem.product_id) {
      const productById = products.find(p => p.product_id === estimateItem.product_id);
      if (productById) {
        console.log("SALE FORM: Found product by ID:", productById);
        return productById;
      }
    }
    
    // Fallback to name matching for older estimates
    if (estimateItem.name || estimateItem.product_name) {
      const productName = estimateItem.name || estimateItem.product_name;
      const productByName = products.find(p => p.product_name === productName);
      if (productByName) {
        console.log("SALE FORM: Found product by name:", productByName);
        return productByName;
      }
    }
    
    console.warn("SALE FORM: Could not find product for estimate item:", estimateItem);
    return null;
  }, [products]);

  // Initialize form data
  const initializeForm = useCallback(() => {
    if (isEstimateSale) {
      const currentItem = pendingEstimateForSale.items[currentEstimateItem];
      console.log("SALE FORM: Initializing with estimate item:", currentItem);
      
      const matchedProduct = findProductFromEstimateItem(currentItem);
      
      if (!matchedProduct) {
        toast.error(`Product "${currentItem.name || currentItem.product_name}" from estimate not found in inventory`);
        return;
      }
      
      // Check stock availability
      const availableStock = parseInt(matchedProduct.units as string);
      const requestedQuantity = currentItem.quantity || 1;
      
      if (availableStock < requestedQuantity) {
        toast.warning(`Only ${availableStock} units available for ${matchedProduct.product_name}. Estimate requested ${requestedQuantity}.`);
      }
      
      setNewSaleData({
        product_id: matchedProduct.product_id,
        quantity_sold: requestedQuantity,
        selling_price: currentItem.price || matchedProduct.price,
        clientId: 0,
        clientName: pendingEstimateForSale.clientName || "",
      });
    } else {
      // Regular sale - start with clean form
      console.log("SALE FORM: Initializing regular sale form");
      setNewSaleData({
        product_id: 0,
        quantity_sold: 1,
        selling_price: 0,
        clientId: 0,
        clientName: "",
      });
    }
  }, [isEstimateSale, pendingEstimateForSale, currentEstimateItem, findProductFromEstimateItem]);

  // Initialize form when component mounts or dependencies change
  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const validateForm = () => {
    if (isEstimateSale) {
      // For estimate sales, only validate quantity and price
      // Product and client are pre-filled from estimate
      const errors: FormErrors = {
        product_id: !newSaleData.product_id,
        quantity_sold: newSaleData.quantity_sold <= 0,
        selling_price: newSaleData.selling_price <= 0,
        clientName: false // Don't validate client for estimates
      };
      
      setFormErrors(errors);
      return !errors.product_id && !errors.quantity_sold && !errors.selling_price;
    } else {
      // For regular sales, validate all fields
      const errors: FormErrors = {
        product_id: !newSaleData.product_id,
        quantity_sold: newSaleData.quantity_sold <= 0,
        selling_price: newSaleData.selling_price <= 0,
        clientName: !newSaleData.clientName.trim()
      };
      
      setFormErrors(errors);
      return !Object.values(errors).some(error => error);
    }
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
    if (!isEstimateSale) return null;
    
    return {
      items: pendingEstimateForSale.items,
      currentIndex: currentEstimateItem,
      totalItems: pendingEstimateForSale.items.length,
      hasMoreItems: currentEstimateItem < pendingEstimateForSale.items.length - 1
    };
  };

  const moveToNextEstimateItem = () => {
    if (isEstimateSale && currentEstimateItem < pendingEstimateForSale.items.length - 1) {
      const nextIndex = currentEstimateItem + 1;
      console.log("SALE FORM: Moving to next estimate item:", nextIndex);
      setCurrentEstimateItem(nextIndex);
      // Form will reinitialize automatically via useEffect
    }
  };

  return {
    newSaleData,
    formErrors,
    validateForm,
    handleProductChange,
    handleClientChange,
    handleQuantityChange,
    handlePriceChange,
    getEstimateItemsInfo,
    moveToNextEstimateItem,
    isFromEstimate: isEstimateSale
  };
};
