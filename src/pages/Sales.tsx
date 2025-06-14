
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";

const Sales = () => {
  const { products, sales, deleteSale, pendingEstimateForSale, setPendingEstimateForSale } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [isFromEstimate, setIsFromEstimate] = useState(false);

  // Handle estimate navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromEstimate = urlParams.get('fromEstimate') === 'true';
    
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
    setIsRecordSaleOpen(false);
    if (isFromEstimate) {
      setPendingEstimateForSale(null);
    }
    setIsFromEstimate(false);
  };

  const handleOpenRegularSale = () => {
    console.log("SALES PAGE: Opening regular sale");
    setPendingEstimateForSale(null);
    setIsFromEstimate(false);
    setIsRecordSaleOpen(true);
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
