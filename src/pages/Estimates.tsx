
import React, { useState, useEffect } from 'react';
import { FileText, PlusCircle, CalendarIcon, Download, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAppStore from '@/store/appStore';
import { CreateEstimateDialog } from '@/components/estimates/CreateEstimateDialog';
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
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
}

const Estimates = () => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const products = useAppStore((state) => state.products);
  const clients = useAppStore((state) => state.clients);

  // Mock estimates data (this would normally come from your store)
  useEffect(() => {
    // Create sample data for visualization
    const mockEstimates: Estimate[] = [];
    
    // We'll properly integrate this with the store later
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
    
    setEstimates(mockEstimates);
  }, []);

  const handleCreateEstimate = (estimateData: any) => {
    const newEstimate = {
      id: `EST-${Date.now().toString().slice(-6)}`,
      clientName: estimateData.clientName,
      date: estimateData.date,
      referenceNo: estimateData.referenceNo,
      totalAmount: estimateData.totalAmount,
      status: estimateData.status,
      createdAt: estimateData.createdAt,
    };
    
    const updatedEstimates = [newEstimate, ...estimates];
    setEstimates(updatedEstimates);
    
    // Store locally for now, later will be integrated with the main store
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  const deleteEstimate = (id: string) => {
    const updatedEstimates = estimates.filter(est => est.id !== id);
    setEstimates(updatedEstimates);
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
  };

  function getStatusColor(status: string) {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "expired":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "pending":
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Estimates & Quotations
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
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Estimates Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create estimates or quotations for your clients and send them via email or WhatsApp.
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
                <TableHead className="text-right">Amount</TableHead>
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
                  <TableCell className="text-right">
                    ₹{estimate.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(estimate.status)}`}>
                      {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
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
        <h2 className="text-lg font-semibold mb-4">About Estimates & Quotations</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Create professional estimates and quotations for your products or services</li>
          <li>Share them with clients via email, WhatsApp, or as printed copies</li>
          <li>Convert estimates to invoices with a single click</li>
          <li>Track which estimates have been accepted or rejected</li>
          <li>Set expiry dates for your quotations</li>
        </ul>
      </div>
      
      {/* Create Estimate Dialog */}
      <CreateEstimateDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onEstimateCreated={handleCreateEstimate} 
      />
    </div>
  );
};

export default Estimates;
