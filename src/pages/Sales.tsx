
import MainLayout from "@/components/layout/MainLayout";
import SalesHeader from "@/components/sales/SalesHeader";
import SalesListSection from "@/components/sales/SalesListSection";
import useAppStore from "@/store/appStore";
import { useState } from "react";

const Sales = () => {
  const { sales, products, clients } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteSale = (saleId: number) => {
    // Implementation for deleting sale
    console.log("Delete sale:", saleId);
  };

  const filteredSales = sales.filter(sale =>
    sale.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sale_id.toString().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <SalesHeader 
          productsExist={products.length > 0}
          isRecordSaleOpen={isRecordSaleOpen}
          onOpenRecordSale={() => setIsRecordSaleOpen(true)}
          onCloseRecordSale={() => setIsRecordSaleOpen(false)}
        />
        <SalesListSection 
          sales={filteredSales}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onDeleteSale={handleDeleteSale}
          totalSales={sales.length}
        />
      </div>
    </MainLayout>
  );
};

export default Sales;
