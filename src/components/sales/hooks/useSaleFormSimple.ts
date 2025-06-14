
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

export const useSaleFormSimple = (isFromEstimate: boolean = false) => {
  const { pendingEstimateForSale, products } = useAppStore();
  
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form based on mode
  useEffect(() => {
    console.log("SALE FORM SIMPLE: Initializing form", {
      isFromEstimate,
      hasPendingEstimate: !!pendingEstimateForSale,
      estimateItemsCount: pendingEstimateForSale?.items?.length || 0,
      currentEstimateItem,
      productsCount: products?.length || 0
    });

    if (isFromEstimate && pendingEstimateForSale?.items?.length > 0) {
      console.log("SALE FORM SIMPLE: Initializing with estimate data");
      const currentItem = pendingEstimateForSale.items[currentEstimateItem];
      console.log("SALE FORM SIMPLE: Current estimate item:", currentItem);
      
      if (!currentItem) {
        console.error("SALE FORM SIMPLE: No current item found");
        toast.error("No estimate item found");
        setIsInitialized(true);
        return;
      }
      
      // Find product by ID first, then by name
      let matchedProduct = null;
      if (currentItem.product_id) {
        matchedProduct = products?.find(p => p.product_id === currentItem.product_id);
      }
      if (!matchedProduct && currentItem.name) {
        matchedProduct = products?.find(p => p.product_name === currentItem.name);
      }
      
      console.log("SALE FORM SIMPLE: Matched product:", matchedProduct);
      
      if (matchedProduct) {
        const newData = {
          product_id: matchedProduct.product_id,
          quantity_sold: currentItem.quantity || 1,
          selling_price: currentItem.price || matchedProduct.price,
          clientId: 0,
          clientName: pendingEstimateForSale.clientName || "",
        };
        console.log("SALE FORM SIMPLE: Setting estimate data:", newData);
        setNewSaleData(newData);
      } else {
        console.error("SALE FORM SIMPLE: Product not found for item:", currentItem);
        toast.error(`Product "${currentItem.name}" not found in inventory`);
      }
    } else if (!isFromEstimate) {
      console.log("SALE FORM SIMPLE: Initializing regular sale");
      setNewSaleData({
        product_id: 0,
        quantity_sold: 1,
        selling_price: 0,
        clientId: 0,
        clientName: "",
      });
    }
    
    setIsInitialized(true);
  }, [isFromEstimate, pendingEstimateForSale, currentEstimateItem, products]);

  const validateForm = () => {
    console.log("SALE FORM SIMPLE: Validating form", { newSaleData, isFromEstimate });
    
    const errors: FormErrors = {
      product_id: !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !isFromEstimate && !newSaleData.clientName.trim()
    };
    
    console.log("SALE FORM SIMPLE: Validation errors:", errors);
    setFormErrors(errors);
    
    const isValid = !Object.values(errors).some(error => error);
    console.log("SALE FORM SIMPLE: Form is valid:", isValid);
    
    return isValid;
  };

  const handleProductChange = (productId: number, price: number) => {
    console.log("SALE FORM SIMPLE: Product change", { productId, price });
    setNewSaleData(prev => ({
      ...prev,
      product_id: productId,
      selling_price: price,
    }));
    setFormErrors(prev => ({ ...prev, product_id: !productId }));
  };

  const handleClientChange = (clientId: number, clientName: string) => {
    console.log("SALE FORM SIMPLE: Client change", { clientId, clientName });
    setNewSaleData(prev => ({
      ...prev,
      clientId: clientId,
      clientName: clientName,
    }));
    setFormErrors(prev => ({ ...prev, clientName: !clientName.trim() }));
  };

  const handleQuantityChange = (quantity: number) => {
    console.log("SALE FORM SIMPLE: Quantity change", { quantity });
    setNewSaleData(prev => ({ ...prev, quantity_sold: quantity }));
    setFormErrors(prev => ({ ...prev, quantity_sold: quantity <= 0 }));
  };

  const handlePriceChange = (price: number) => {
    console.log("SALE FORM SIMPLE: Price change", { price });
    setNewSaleData(prev => ({ ...prev, selling_price: price }));
    setFormErrors(prev => ({ ...prev, selling_price: price <= 0 }));
  };

  const getEstimateInfo = () => {
    if (!isFromEstimate || !pendingEstimateForSale?.items) return null;
    
    return {
      items: pendingEstimateForSale.items,
      currentIndex: currentEstimateItem,
      totalItems: pendingEstimateForSale.items.length,
      hasMoreItems: currentEstimateItem < pendingEstimateForSale.items.length - 1
    };
  };

  const moveToNextItem = () => {
    const maxItems = pendingEstimateForSale?.items?.length || 0;
    console.log("SALE FORM SIMPLE: Moving to next item", { 
      currentIndex: currentEstimateItem, 
      maxItems 
    });
    
    if (currentEstimateItem < maxItems - 1) {
      setCurrentEstimateItem(prev => prev + 1);
      setIsInitialized(false); // Trigger re-initialization
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
    estimateInfo: getEstimateInfo(),
    moveToNextItem,
    isFromEstimate,
    isInitialized
  };
};
