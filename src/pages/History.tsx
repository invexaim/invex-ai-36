
import { useState, useEffect } from "react";
import useAppStore from "@/store/appStore";
import { HistoryHeader } from "@/components/history/HistoryHeader";
import { HistoryStats } from "@/components/history/HistoryStats";
import { HistoryCharts } from "@/components/history/HistoryCharts";
import { TransactionSection } from "@/components/history/TransactionSection";

const History = () => {
  const { sales, products, deleteSale } = useAppStore();
  
  // Ensure we save any pending changes when visiting this page
  useEffect(() => {
    const saveData = async () => {
      try {
        const { saveDataToSupabase, currentUser, isSignedIn } = useAppStore.getState();
        
        if (currentUser && isSignedIn) {
          console.log("Ensuring data is saved when viewing History page");
          await saveDataToSupabase();
        }
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };
    
    saveData();
  }, []);
  
  // To ensure we're showing all-time sales data, we don't need any additional filters here
  // The TransactionSection component will handle the display
  
  return (
    <div className="space-y-8 animate-fade-in">
      <HistoryHeader />
      
      <HistoryStats sales={sales} />
      
      <HistoryCharts sales={sales} showAllTime={true} />
      
      <TransactionSection
        sales={sales}
        onDeleteTransaction={deleteSale}
        productsExist={products.length > 0}
      />
    </div>
  );
};

export default History;
