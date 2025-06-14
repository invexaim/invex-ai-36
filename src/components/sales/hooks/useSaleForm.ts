
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

  // Initialize form - ONLY pre-populate if there's a pending estimate
  useEffect(() => {
    console.log("SALE FORM: Form initialization effect", { 
      hasPendingEstimate: !!pendingEstimateForSale,
      pendingEstimateData: pendingEstimateForSale 
    });

    if (pendingEstimateForSale && pendingEstimateForSale.items && pendingEstimateForSale.items.length > 0) {
      const currentItem = pendingEstimateForSale.items[currentEstimateItem];
      console.log("SALE FORM: Pre-populating with estimate data:", {
        currentItem,
        currentIndex: currentEstimateItem,
        totalItems: pendingEstimateForSale.items.length
      });
      
      // Find product info to get proper product_id
      const product = products.find(p => 
        p.product_id === currentItem.product_id || 
        p.product_name === currentItem.name ||
        p.product_name === currentItem.product_name
      );
      
      setNewSaleData({
        product_id: product?.product_id || currentItem.product_id || 0,
        quantity_sold: currentItem.quantity || 1,
        selling_price: currentItem.price || 0,
        clientId: 0,
        clientName: pendingEstimateForSale.clientName || "",
      });
    } else {
      // Reset to empty form for regular sales
      console.log("SALE FORM: Resetting to empty form for regular sale");
      setNewSaleData({
        product_id: 0,
        quantity_sold: 1,
        selling_price: 0,
        clientId: 0,
        clientName: "",
      });
    }
  }, [pendingEstimateForSale, currentEstimateItem, products]);

  const validateForm = () => {
    // For estimates, skip product and client validation since they're pre-filled
    const isFromEstimate = !!pendingEstimateForSale;
    
    const errors: FormErrors = {
      product_id: !isFromEstimate && !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !isFromEstimate && !newSaleData.clientName.trim()
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
    if (!pendingEstimateForSale?.items) return null;
    
    return {
      items: pendingEstimateForSale.items,
      currentIndex: currentEstimateItem,
      totalItems: pendingEstimateForSale.items.length,
      hasMoreItems: currentEstimateItem < pendingEstimateForSale.items.length - 1
    };
  };

  const moveToNextEstimateItem = () => {
    if (pendingEstimateForSale?.items && currentEstimateItem < pendingEstimateForSale.items.length - 1) {
      const nextIndex = currentEstimateItem + 1;
      setCurrentEstimateItem(nextIndex);
      // The useEffect will handle updating the form data
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
    moveToNextEstimateItem
  };
};
