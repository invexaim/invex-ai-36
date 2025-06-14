
import { useState, useEffect } from "react";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import { EstimateInfo, SaleFormData } from "./types";

export const useEstimateHandling = (isFromEstimate: boolean) => {
  const { pendingEstimateForSale, products } = useAppStore();
  const [currentEstimateItem, setCurrentEstimateItem] = useState(0);

  const getEstimateInfo = (): EstimateInfo | null => {
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

  const initializeFromEstimate = (): Partial<SaleFormData> | null => {
    if (!isFromEstimate || !pendingEstimateForSale?.items?.length) return null;

    console.log("ESTIMATE HANDLING: Initializing with estimate data");
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
      return {
        product_id: matchedProduct.product_id,
        quantity_sold: currentItem.quantity || 1,
        selling_price: currentItem.price || matchedProduct.price,
        clientId: 0,
        clientName: pendingEstimateForSale.clientName || "",
      };
    } else {
      toast.error(`Product "${currentItem.name}" not found in inventory`);
      return null;
    }
  };

  return {
    estimateInfo: getEstimateInfo(),
    moveToNextItem,
    initializeFromEstimate,
    currentEstimateItem
  };
};
