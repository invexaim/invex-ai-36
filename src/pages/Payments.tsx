
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import useAppStore from "@/store/appStore";
import PaymentHeader from "@/components/payments/PaymentHeader";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentTable from "@/components/payments/PaymentTable";

const Payments = () => {
  const { 
    payments, 
    deletePayment, 
    clients, 
    pendingSalePayment, 
    setPendingSalePayment 
  } = useAppStore();

  return (
    <div className="space-y-8 animate-fade-in">
      <PaymentHeader />
      
      <PaymentStats payments={payments} />
      
      <PaymentTable 
        payments={payments} 
        onDeletePayment={deletePayment} 
      />
    </div>
  );
};

export default Payments;
