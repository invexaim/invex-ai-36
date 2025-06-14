
import React from 'react';
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
                    onClick={() => onPrintEstimate(estimate)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditEstimate(estimate)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => onDeleteEstimate(estimate.id)}
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
  );
}
