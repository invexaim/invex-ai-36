
import React, { useState } from "react";
import { ExpiryHeader } from "@/components/expiry/ExpiryHeader";
import { ExpiryStats } from "@/components/expiry/ExpiryStats";
import { ExpiryTable } from "@/components/expiry/ExpiryTable";
import { AddExpiryDialog } from "@/components/expiry/AddExpiryDialog";
import useAppStore from "@/store/appStore";

const Expiry = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { 
    productExpiries, 
    addProductExpiry,
    updateProductExpiry,
    deleteProductExpiry,
    products
  } = useAppStore();

  const handleAddExpiry = (expiryData: any) => {
    const selectedProduct = products.find(p => p.product_id === expiryData.product_id);
    if (selectedProduct) {
      addProductExpiry({
        ...expiryData,
        user_id: "", // This will be set by the store methods
        product_name: selectedProduct.product_name,
      });
    }
  };

  // Filter expiries based on search and status
  const filteredExpiries = productExpiries.filter(expiry => {
    const matchesSearch = expiry.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (expiry.batch_number && expiry.batch_number.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || expiry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <ExpiryHeader 
        onAddExpiry={() => setShowAddDialog(true)}
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

      <AddExpiryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddExpiry={handleAddExpiry}
        products={products}
      />
    </div>
  );
};

export default Expiry;
