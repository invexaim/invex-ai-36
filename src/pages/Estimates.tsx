import React, { useState, useEffect } from 'react';
import { EstimatesHeader } from '@/components/estimates/EstimatesHeader';
import { EstimatesEmptyState } from '@/components/estimates/EstimatesEmptyState';
import { EstimatesTable } from '@/components/estimates/EstimatesTable';
import { EstimatesAboutSection } from '@/components/estimates/EstimatesAboutSection';
import { CreateEstimateDialog } from '@/components/estimates/CreateEstimateDialog';
import { EstimatePrint } from '@/components/estimates/EstimatePrint';
import { useNavigate } from 'react-router-dom';

interface Estimate {
  id: string;
  clientName: string;
  date: string;
  referenceNo: string;
  totalAmount: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  validUntil: string;
  createdAt: string;
  items?: any[];
  notes?: string;
  terms?: string;
}

const Estimates = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);
  const navigate = useNavigate();

  // Load estimates from localStorage
  useEffect(() => {
    const storedEstimates = localStorage.getItem('estimates');
    if (storedEstimates) {
      try {
        const parsed = JSON.parse(storedEstimates);
        if (Array.isArray(parsed)) {
          setEstimates(parsed);
          return;
        }
      } catch (e) {
        console.error("Error parsing stored estimates:", e);
      }
    }
    
    // Default to empty array
    setEstimates([]);
  }, []);

  const updateEstimateStatus = (estimateId: string, newStatus: "pending" | "accepted" | "rejected" | "completed") => {
    console.log("Updating estimate status:", estimateId, "to", newStatus);
    
    const updatedEstimates = estimates.map(est => 
      est.id === estimateId ? { ...est, status: newStatus } : est
    );
    
    setEstimates(updatedEstimates);
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
    
    console.log("Estimate status updated successfully");
  };

  const handleUpdateEstimate = (estimateData: any) => {
    const updatedEstimate = {
      ...editingEstimate,
      clientName: estimateData.clientName,
      date: estimateData.date,
      totalAmount: estimateData.totalAmount || 0,
      status: estimateData.status || "pending",
      validUntil: estimateData.validUntil,
      items: estimateData.items,
      notes: estimateData.notes,
      terms: estimateData.terms,
    };
    
    const updatedEstimates = estimates.map(est => 
      est.id === editingEstimate?.id ? updatedEstimate : est
    );
    setEstimates(updatedEstimates);
    
    // Store locally
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
    setEditingEstimate(null);
  };

  const deleteEstimate = (id: string) => {
    const updatedEstimates = estimates.filter(est => est.id !== id);
    setEstimates(updatedEstimates);
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  const handleCreateEstimate = () => {
    navigate('/estimates/create');
  };

  const handlePrintEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsPrintDialogOpen(true);
  };

  const handleEditEstimate = (estimate: Estimate) => {
    setEditingEstimate(estimate);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <EstimatesHeader onCreateEstimate={handleCreateEstimate} />

      {estimates.length === 0 ? (
        <EstimatesEmptyState onCreateEstimate={handleCreateEstimate} />
      ) : (
        <EstimatesTable 
          estimates={estimates}
          onPrintEstimate={handlePrintEstimate}
          onDeleteEstimate={deleteEstimate}
          onEditEstimate={handleEditEstimate}
          onUpdateEstimateStatus={updateEstimateStatus}
        />
      )}

      <EstimatesAboutSection />
      
      {editingEstimate && (
        <CreateEstimateDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          onEstimateCreated={handleUpdateEstimate}
          editingEstimate={editingEstimate}
        />
      )}
      
      {selectedEstimate && (
        <EstimatePrint
          open={isPrintDialogOpen}
          onOpenChange={setIsPrintDialogOpen}
          estimate={selectedEstimate}
        />
      )}
    </div>
  );
};

export default Estimates;
