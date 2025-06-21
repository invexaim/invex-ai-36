
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";

const Sales = () => {
  const { products, sales, deleteSale, pendingEstimateForSale, setPendingEstimateForSale } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
        isRecordSaleOpen={false}
        onOpenRecordSale={() => {}}
        onCloseRecordSale={() => {}}
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
