
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";
import usePersistData from "@/hooks/usePersistData";

const Sales = () => {
  // Use the persist data hook to ensure data is saved during navigation
  usePersistData();
  
  const { products, sales, deleteSale, saveDataToSupabase } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteSale = (saleId: number) => {
    deleteSale(saleId);
    
    // Explicitly save data after deleting a sale
    saveDataToSupabase().catch(err => 
      console.error("Error saving after sale deletion:", err)
    );
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
      <SalesHeader productsExist={products.length > 0} />
      <SalesListSection
        sales={filteredSales}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onDeleteSale={handleDeleteSale}
        totalSales={sales.length}
      />
    </div>
  );
};

export default Sales;
