
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

  const updateEstimateStatus = (estimateId: string, newStatus: "pending" | "accepted" | "rejected" | "completed") => {
    console.log("Updating estimate status in localStorage:", estimateId, "to", newStatus);
    
    try {
      const storedEstimates = localStorage.getItem('estimates');
      if (storedEstimates) {
        const estimates = JSON.parse(storedEstimates);
        const updatedEstimates = estimates.map((est: any) => 
          est.id === estimateId ? { ...est, status: newStatus } : est
        );
        
        localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
        console.log("Estimate status updated successfully in localStorage");
      }
    } catch (error) {
      console.error("Error updating estimate status:", error);
    }
  };

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
    
    // Check if this payment is for an estimate-based sale
    if (pendingSalePayment?.estimateId && pendingSalePayment?.shouldCompleteEstimate) {
      console.log("Payment completed for estimate:", pendingSalePayment.estimateId);
      updateEstimateStatus(pendingSalePayment.estimateId, "completed");
    }
    
    // Clear pending sale payment
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
