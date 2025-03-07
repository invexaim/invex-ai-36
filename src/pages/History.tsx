
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import { format, parseISO, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { HistoryHeader } from "@/components/history/HistoryHeader";
import { HistoryStats } from "@/components/history/HistoryStats";
import { HistoryCharts } from "@/components/history/HistoryCharts";
import { TransactionSection } from "@/components/history/TransactionSection";

const History = () => {
  const { sales, deleteSale, products } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [transactionType, setTransactionType] = useState("all");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTransactionType(e.target.value);
  };

  const handleDeleteTransaction = (id: number) => {
    deleteSale(id);
    toast.success("Transaction deleted successfully");
  };

  // Filter transactions based on user input
  const filteredTransactions = sales.filter((sale) => {
    const productName = sale.product?.product_name.toLowerCase() || "";
    const saleDate = selectedDate ? format(new Date(sale.sale_date), "yyyy-MM-dd") : "";
    
    const matchesSearch = productName.includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || saleDate === selectedDate;
    const matchesType = transactionType === "all" || transactionType === "sale"; // All sales are type 'sale'

    return matchesSearch && matchesDate && matchesType;
  });

  // Show initial welcome toast
  useEffect(() => {
    if (products.length === 0 && sales.length === 0) {
      toast.info("Add products and record sales to see transaction history", {
        duration: 5000,
      });
    }
  }, [products.length, sales.length]);

  return (
    <div className="space-y-8 animate-fade-in smooth-scroll">
      <HistoryHeader />
      <HistoryStats sales={sales} />
      <HistoryCharts sales={sales} />
      <TransactionSection
        sales={sales}
        products={products}
        searchTerm={searchTerm}
        selectedDate={selectedDate}
        transactionType={transactionType}
        filteredTransactions={filteredTransactions}
        onSearchChange={handleSearchChange}
        onDateChange={handleDateChange}
        onTypeChange={handleTypeChange}
        onDeleteTransaction={handleDeleteTransaction}
      />
    </div>
  );
};

export default History;
