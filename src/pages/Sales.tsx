
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";

const Sales = () => {
  const { products, sales, deleteSale, pendingEstimateForSale, setPendingEstimateForSale } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);

  // Auto-open record sale dialog if there's a pending estimate
  useEffect(() => {
    if (pendingEstimateForSale) {
      console.log("SALES PAGE: Auto-opening dialog for estimate:", pendingEstimateForSale.referenceNo);
      setIsRecordSaleOpen(true);
    }
  }, [pendingEstimateForSale]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleOpenRecordSale = () => {
    // Clear any pending estimate data when manually opening record sale
    if (pendingEstimateForSale) {
      console.log("SALES PAGE: Clearing pending estimate for regular sale");
      setPendingEstimateForSale(null);
    }
    setIsRecordSaleOpen(true);
  };

  const handleCloseRecordSale = () => {
    setIsRecordSaleOpen(false);
    // Don't automatically clear estimate here - let the form handle cleanup
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
        onOpenRecordSale={handleOpenRecordSale}
        onCloseRecordSale={handleCloseRecordSale}
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
