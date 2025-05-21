
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import useAppStore from "@/store/appStore";
import PaymentHeader from "@/components/payments/PaymentHeader";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentTable from "@/components/payments/PaymentTable";
import PaymentDialog from "@/components/payments/PaymentDialog";
import usePersistData from "@/hooks/usePersistData";

const Payments = () => {
  // Use the persist data hook to ensure data is saved during navigation
  usePersistData();
  
  const { 
    payments, 
    addPayment, 
    deletePayment, 
    clients, 
    pendingSalePayment, 
    setPendingSalePayment,
    saveDataToSupabase 
  } = useAppStore();
  
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);

  // Initialize add payment dialog when navigating from sales page
  useEffect(() => {
    if (pendingSalePayment) {
      setIsAddPaymentOpen(true);
    }
  }, [pendingSalePayment]);

  const handleAddPayment = () => {
    setIsAddPaymentOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddPaymentOpen(false);
  };

  const handleSubmitPayment = (formData) => {
    // Add payment
    addPayment({
      ...formData,
    });
    
    // Clear pending sale payment if there was one
    if (pendingSalePayment) {
      setPendingSalePayment(null);
    }
    
    // Explicitly save data after adding payment
    saveDataToSupabase().catch(err => 
      console.error("Error saving payment data:", err)
    );
    
    // Close dialog
    setIsAddPaymentOpen(false);
  };
  
  const handleCancel = () => {
    // Clear pending sale reference when canceling
    if (pendingSalePayment) {
      setPendingSalePayment(null);
    }
    setIsAddPaymentOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PaymentHeader onAddPayment={handleAddPayment} />
      
      <PaymentStats payments={payments} />
      
      <PaymentTable 
        payments={payments} 
        onDeletePayment={deletePayment} 
        onAddPayment={handleAddPayment} 
      />
      
      <PaymentDialog 
        isOpen={isAddPaymentOpen}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitPayment}
        clients={clients}
        pendingSalePayment={pendingSalePayment}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default Payments;
