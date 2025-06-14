
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";
import { toast } from "sonner";

const Sales = () => {
  const { 
    products, 
    sales, 
    deleteSale, 
    pendingEstimateForSale, 
    setPendingEstimateForSale,
    recordSale 
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [isFromEstimate, setIsFromEstimate] = useState(false);

  // Debug store state
  useEffect(() => {
    console.log("SALES PAGE: Store state check:", {
      productsCount: products?.length || 0,
      salesCount: sales?.length || 0,
      recordSaleType: typeof recordSale,
      recordSaleAvailable: !!recordSale,
      pendingEstimate: !!pendingEstimateForSale
    });
  }, [products, sales, recordSale, pendingEstimateForSale]);

  // Handle estimate navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromEstimate = urlParams.get('fromEstimate') === 'true';
    
    console.log("SALES PAGE: URL params check:", { fromEstimate, hasPendingEstimate: !!pendingEstimateForSale });
    
    if (pendingEstimateForSale && fromEstimate) {
      console.log("SALES PAGE: Opening estimate-based sale");
      setIsFromEstimate(true);
      setIsRecordSaleOpen(true);
      // Clear URL parameter
      window.history.replaceState({}, '', '/sales');
    }
  }, [pendingEstimateForSale]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCloseDialog = () => {
    console.log("SALES PAGE: Closing dialog", { isFromEstimate });
    setIsRecordSaleOpen(false);
    if (isFromEstimate) {
      setPendingEstimateForSale(null);
    }
    setIsFromEstimate(false);
  };

  const handleOpenRegularSale = () => {
    console.log("SALES PAGE: Opening regular sale");
    
    // Validate store functions before opening
    if (!recordSale || typeof recordSale !== 'function') {
      console.error("SALES PAGE: recordSale function not available");
      toast.error("Sales system not ready. Please refresh the page and try again.");
      return;
    }
    
    setPendingEstimateForSale(null);
    setIsFromEstimate(false);
    setIsRecordSaleOpen(true);
  };

  const filteredSales = sales?.filter((sale) => {
    const productName = sale.product?.product_name?.toLowerCase() || "";
    const clientNameMatch = sale.clientName 
      ? sale.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    return productName.includes(searchTerm.toLowerCase()) || clientNameMatch;
  }) || [];

  // Add loading state check
  if (!products || !sales) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <SalesHeader 
        productsExist={products.length > 0} 
        isRecordSaleOpen={isRecordSaleOpen}
        onOpenRegularSale={handleOpenRegularSale}
        onCloseDialog={handleCloseDialog}
        isFromEstimate={isFromEstimate}
      />
      <SalesListSection
        sales={filteredSales}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onDeleteSale={deleteSale}
        totalSales={sales.length}
      />
    </div>
  );
};

export default Sales;
