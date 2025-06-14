
import { useState, useEffect, useRef } from "react";
import useAppStore from "@/store/appStore";

export const useFormReadiness = (isFromEstimate: boolean, isInitialized: boolean) => {
  const { products, clients, recordSale, pendingEstimateForSale } = useAppStore();
  const [isFormReady, setIsFormReady] = useState(false);
  const previousReadyState = useRef(false);

  useEffect(() => {
    console.log("FORM READINESS: Checking form readiness", {
      hasProducts: !!products && products.length > 0,
      hasClients: !!clients,
      hasRecordSale: typeof recordSale === 'function',
      isFromEstimate,
      hasPendingEstimate: !!pendingEstimateForSale,
      isInitialized
    });

    const hasProducts = products && products.length > 0;
    const hasClients = !!clients;
    const hasRecordSaleFunction = typeof recordSale === 'function';
    const hasEstimateWhenNeeded = !isFromEstimate || !!pendingEstimateForSale;
    
    const ready = hasProducts && hasClients && hasRecordSaleFunction && hasEstimateWhenNeeded && isInitialized;
    
    // Only update state if readiness actually changed to prevent flickering
    if (ready !== previousReadyState.current) {
      console.log("FORM READINESS: Form readiness changed", {
        from: previousReadyState.current,
        to: ready,
        hasProducts,
        hasClients,
        hasRecordSaleFunction,
        hasEstimateWhenNeeded,
        isInitialized
      });
      
      previousReadyState.current = ready;
      setIsFormReady(ready);
    }
    
    if (!ready) {
      console.warn("FORM READINESS: Form not ready", {
        missingProducts: !hasProducts,
        missingClients: !hasClients,
        missingRecordSale: !hasRecordSaleFunction,
        missingEstimate: isFromEstimate && !pendingEstimateForSale,
        notInitialized: !isInitialized
      });
    }
  }, [products, clients, recordSale, isFromEstimate, pendingEstimateForSale, isInitialized]);

  return {
    isFormReady,
    hasProducts: products && products.length > 0,
    hasRecordSale: typeof recordSale === 'function',
    hasPendingEstimate: !!pendingEstimateForSale
  };
};
