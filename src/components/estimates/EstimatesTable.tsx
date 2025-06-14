
import React, { useState } from 'react';
import { Pencil, Trash2, CheckCircle2, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';
import useAppStore from '@/store/appStore';
import { toast } from 'sonner';

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

interface EstimatesTableProps {
  estimates: Estimate[];
  onPrintEstimate: (estimate: Estimate) => void;
  onDeleteEstimate: (id: string) => void;
  onEditEstimate: (estimate: Estimate) => void;
}

export function EstimatesTable({ estimates, onPrintEstimate, onDeleteEstimate, onEditEstimate }: EstimatesTableProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const navigate = useNavigate();
  const { setPendingSalePayment } = useAppStore();

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

  const handleApprovalClick = (estimate: Estimate) => {
    setSelectedEstimate(estimate);
    setShowApprovalDialog(true);
  };

  const handleApprovalConfirm = () => {
    if (!selectedEstimate) return;

    // Convert estimate to sale format
    const saleData = {
      id: selectedEstimate.id,
      clientName: selectedEstimate.clientName,
      items: selectedEstimate.items || [],
      totalAmount: selectedEstimate.totalAmount,
      referenceNo: selectedEstimate.referenceNo,
      estimateApproved: true
    };

    // Set the pending sale data
    setPendingSalePayment(saleData);
    
    toast.success("Estimate approved! Redirecting to record sale...");
    
    // Close dialog and navigate
    setShowApprovalDialog(false);
    setSelectedEstimate(null);
    
    // Navigate to sales page
    setTimeout(() => {
      navigate("/sales");
    }, 100);
  };

  const handleApprovalDeny = () => {
    setShowApprovalDialog(false);
    setSelectedEstimate(null);
    toast.info("Estimate approval cancelled");
  };

  // Sort estimates by reference number in descending order (newest first)
  const sortedEstimates = [...estimates].sort((a, b) => {
    // Extract number from reference number (e.g., "EST-123456" -> 123456)
    const extractNumber = (refNo: string) => {
      const match = refNo.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    
    const aNum = extractNumber(a.referenceNo);
    const bNum = extractNumber(b.referenceNo);
    
    return bNum - aNum; // Descending order
  });

  return (
    <>
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
            {sortedEstimates.map((estimate) => (
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
                      onClick={() => onPrintEstimate(estimate)}
                      title="Print Estimate"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditEstimate(estimate)}
                      title="Edit Estimate"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {estimate.status === "pending" && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleApprovalClick(estimate)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Approve Estimate"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-red-50"
                      onClick={() => onDeleteEstimate(estimate.id)}
                      title="Delete Estimate"
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

      <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Estimate</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to approve this estimate and proceed to record a new sale with the estimated products?
              <br />
              <br />
              <strong>Estimate:</strong> {selectedEstimate?.referenceNo}
              <br />
              <strong>Client:</strong> {selectedEstimate?.clientName}
              <br />
              <strong>Amount:</strong> ₹{selectedEstimate?.totalAmount.toLocaleString()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleApprovalDeny}>
              Deny
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleApprovalConfirm}>
              Allow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
