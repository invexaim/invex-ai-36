
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import useAppStore from "@/store/appStore";
import PaymentHeader from "@/components/payments/PaymentHeader";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentTable from "@/components/payments/PaymentTable";
import PaymentDialog from "@/components/payments/PaymentDialog";

const Payments = () => {
  const { 
    payments, 
    addPayment, 
    deletePayment, 
    clients, 
    pendingSalePayment, 
    setPendingSalePayment 
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
