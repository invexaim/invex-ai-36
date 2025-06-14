
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

  // Initialize form based on mode
  useEffect(() => {
    if (isFromEstimate && pendingEstimateForSale?.items?.length > 0) {
      console.log("SALE FORM: Initializing with estimate data");
      const currentItem = pendingEstimateForSale.items[currentEstimateItem];
      
      // Find product by ID first, then by name
      let matchedProduct = null;
      if (currentItem.product_id) {
        matchedProduct = products.find(p => p.product_id === currentItem.product_id);
      }
      if (!matchedProduct && currentItem.name) {
        matchedProduct = products.find(p => p.product_name === currentItem.name);
      }
      
      if (matchedProduct) {
        setNewSaleData({
          product_id: matchedProduct.product_id,
          quantity_sold: currentItem.quantity || 1,
          selling_price: currentItem.price || matchedProduct.price,
          clientId: 0,
          clientName: pendingEstimateForSale.clientName || "",
        });
      } else {
        toast.error(`Product "${currentItem.name}" not found in inventory`);
      }
    } else {
      console.log("SALE FORM: Initializing regular sale");
      setNewSaleData({
        product_id: 0,
        quantity_sold: 1,
        selling_price: 0,
        clientId: 0,
        clientName: "",
      });
    }
  }, [isFromEstimate, pendingEstimateForSale, currentEstimateItem, products]);

  const validateForm = () => {
    const errors: FormErrors = {
      product_id: !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !isFromEstimate && !newSaleData.clientName.trim()
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleProductChange = (productId: number, price: number) => {
    setNewSaleData(prev => ({
      ...prev,
      product_id: productId,
      selling_price: price,
    }));
    setFormErrors(prev => ({ ...prev, product_id: !productId }));
  };

  const handleClientChange = (clientId: number, clientName: string) => {
    setNewSaleData(prev => ({
      ...prev,
      clientId: clientId,
      clientName: clientName,
    }));
    setFormErrors(prev => ({ ...prev, clientName: !clientName.trim() }));
  };

  const handleQuantityChange = (quantity: number) => {
    setNewSaleData(prev => ({ ...prev, quantity_sold: quantity }));
    setFormErrors(prev => ({ ...prev, quantity_sold: quantity <= 0 }));
  };

  const handlePriceChange = (price: number) => {
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
    if (currentEstimateItem < (pendingEstimateForSale?.items?.length || 0) - 1) {
      setCurrentEstimateItem(prev => prev + 1);
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
    isFromEstimate
  };
};
