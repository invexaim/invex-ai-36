
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ExpiryHeader } from "@/components/expiry/ExpiryHeader";
import { ExpiryStats } from "@/components/expiry/ExpiryStats";
import { ExpiryTable } from "@/components/expiry/ExpiryTable";
import useAppStore from "@/store/appStore";

const Expiry = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchParams] = useSearchParams();
  
  const { 
    productExpiries, 
    updateProductExpiry,
    deleteProductExpiry,
    products,
    getExpiringProducts,
    getExpiredProducts
  } = useAppStore();

  // Set initial filter based on URL parameter
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'expiring') {
      setStatusFilter('expiring');
    } else if (filterParam === 'expired') {
      setStatusFilter('expired');
    }
  }, [searchParams]);

  // Filter expiries based on search and status
  const filteredExpiries = productExpiries.filter(expiry => {
    const matchesSearch = expiry.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expiry.batch_number && expiry.batch_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    
    if (statusFilter === "expiring") {
      // Show products expiring within 7 days but not yet expired
      const today = new Date();
      const next7Days = new Date();
      next7Days.setDate(today.getDate() + 7);
      const expiryDate = new Date(expiry.expiry_date);
      matchesStatus = expiry.status === 'active' && expiryDate >= today && expiryDate <= next7Days;
    } else if (statusFilter === "expired") {
      // Show expired products
      const today = new Date();
      const expiryDate = new Date(expiry.expiry_date);
      matchesStatus = expiry.status === 'active' && expiryDate < today;
    } else if (statusFilter !== "all") {
      matchesStatus = expiry.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ExpiryHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      
      <ExpiryStats expiries={productExpiries} />
      
      <ExpiryTable 
        expiries={filteredExpiries}
        onUpdateExpiry={updateProductExpiry}
        onDeleteExpiry={deleteProductExpiry}
      />
    </div>
  );
};

export default Expiry;
