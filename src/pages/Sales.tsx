
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";

const Sales = () => {
  const { products, sales, deleteSale, pendingEstimateForSale, setPendingEstimateForSale } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [isFromEstimate, setIsFromEstimate] = useState(false);

  // Only auto-open if explicitly coming from estimate (with flag)
  useEffect(() => {
    // Check if we have estimate data AND it's a fresh navigation from estimates
    const urlParams = new URLSearchParams(window.location.search);
    const fromEstimate = urlParams.get('fromEstimate') === 'true';
    
    if (pendingEstimateForSale && fromEstimate) {
      console.log("SALES PAGE: Auto-opening dialog for estimate-based sale");
      setIsFromEstimate(true);
      setIsRecordSaleOpen(true);
      // Clear the URL parameter
      window.history.replaceState({}, '', '/sales');
    } else if (pendingEstimateForSale && !fromEstimate) {
      // Clear stale estimate data if not coming from estimates
      console.log("SALES PAGE: Clearing stale estimate data");
      setPendingEstimateForSale(null);
    }
  }, [pendingEstimateForSale, setPendingEstimateForSale]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCloseDialog = () => {
    setIsRecordSaleOpen(false);
    setIsFromEstimate(false);
    // Clear estimate data when closing dialog if it was from estimate
    if (isFromEstimate) {
      setPendingEstimateForSale(null);
    }
  };

  const filteredSales = sales.filter((sale) => {
    const productName = sale.product?.product_name.toLowerCase() || "";
    const clientNameMatch = sale.clientName 
      ? sale.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    return productName.includes(searchTerm.toLowerCase()) || clientNameMatch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <SalesHeader 
        productsExist={products.length > 0} 
        isRecordSaleOpen={isRecordSaleOpen}
        setIsRecordSaleOpen={setIsRecordSaleOpen}
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
