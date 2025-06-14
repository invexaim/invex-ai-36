
import React, { useState, useEffect } from 'react';
import { EstimatesHeader } from '@/components/estimates/EstimatesHeader';
import { EstimatesEmptyState } from '@/components/estimates/EstimatesEmptyState';
import { EstimatesTable } from '@/components/estimates/EstimatesTable';
import { EstimatesAboutSection } from '@/components/estimates/EstimatesAboutSection';
import { CreateEstimateDialog } from '@/components/estimates/CreateEstimateDialog';
import { EstimatePrint } from '@/components/estimates/EstimatePrint';

interface Estimate {
  id: string;
  clientName: string;
  date: string;
  referenceNo: string;
  totalAmount: number;
  status: "pending" | "accepted" | "rejected";
  validUntil: string;
  createdAt: string;
  items?: any[];
  notes?: string;
  terms?: string;
}

const Estimates = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

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

  const handleCreateEstimate = (estimateData: any) => {
    const newEstimate = {
      id: estimateData.referenceNo || `EST-${Date.now().toString().slice(-6)}`,
      clientName: estimateData.clientName,
      date: estimateData.date,
      referenceNo: estimateData.referenceNo || `EST-${Date.now().toString().slice(-6)}`,
      totalAmount: estimateData.totalAmount || 0,
      status: estimateData.status || "pending",
      validUntil: estimateData.validUntil,
      createdAt: estimateData.createdAt || new Date().toISOString(),
      items: estimateData.items,
      notes: estimateData.notes,
      terms: estimateData.terms,
    };
    
    const updatedEstimates = [newEstimate, ...estimates];
    setEstimates(updatedEstimates);
    
    // Store locally
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  const deleteEstimate = (id: string) => {
    const updatedEstimates = estimates.filter(est => est.id !== id);
    setEstimates(updatedEstimates);
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  const handlePrintEstimate = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setIsPrintDialogOpen(true);
  };

  const handleOpenCreateDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <EstimatesHeader onCreateEstimate={handleOpenCreateDialog} />

      {estimates.length === 0 ? (
        <EstimatesEmptyState onCreateEstimate={handleOpenCreateDialog} />
      ) : (
        <EstimatesTable 
          estimates={estimates}
          onPrintEstimate={handlePrintEstimate}
          onDeleteEstimate={deleteEstimate}
        />
      )}

      <EstimatesAboutSection />
      
      <CreateEstimateDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onEstimateCreated={handleCreateEstimate}
      />
      
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
