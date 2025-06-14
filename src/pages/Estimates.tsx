
import React, { useState, useEffect } from 'react';
import { Calculator, PlusCircle, Download, Pencil, Trash2, CheckCircle2, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAppStore from '@/store/appStore';
import { CreateEstimateDialog } from '@/components/estimates/CreateEstimateDialog';
import { EstimatePrint } from '@/components/estimates/EstimatePrint';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
  const { products } = useAppStore();

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

  function getStatusColor(status: string) {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Estimates
          </h1>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Estimate
        </Button>
      </div>

      {/* Main Content */}
      {estimates.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-16">
            <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Estimates Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create estimates to provide price quotes to your customers.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Estimate
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reference No.</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.map((estimate) => (
                <TableRow key={estimate.id}>
                  <TableCell>
                    {new Date(estimate.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{estimate.referenceNo}</TableCell>
                  <TableCell>{estimate.clientName}</TableCell>
                  <TableCell>₹{estimate.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(estimate.status)}`}>
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePrintEstimate(estimate)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => deleteEstimate(estimate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">About Estimates</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Create detailed price quotes for potential customers</li>
          <li>Track estimate status (pending, accepted, rejected)</li>
          <li>Convert accepted estimates to invoices</li>
          <li>Set validity periods for your estimates</li>
          <li>Print professional estimate documents</li>
        </ul>
      </div>
      
      {/* Create Estimate Dialog */}
      <CreateEstimateDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onEstimateCreated={handleCreateEstimate}
      />
      
      {/* Print Dialog */}
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
