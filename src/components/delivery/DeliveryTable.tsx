
import React from 'react';
import { Pencil, Trash2, CheckCircle2, Printer } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DeliveryChallan {
  id: string;
  clientName: string;
  date: string;
  challanNo: string;
  status: "pending" | "delivered" | "cancelled";
  vehicleNo?: string;
  deliveryAddress?: string;
  createdAt: string;
  items?: any[];
  itemsCount?: number;
  notes?: string;
}

interface DeliveryTableProps {
  challans: DeliveryChallan[];
  onEditChallan: (challan: DeliveryChallan) => void;
  onDeleteChallan: (id: string) => void;
  onPrintChallan: (challan: DeliveryChallan) => void;
  onStatusChange: (id: string, newStatus: "delivered") => void;
}

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function DeliveryTable({ 
  challans, 
  onEditChallan, 
  onDeleteChallan, 
  onPrintChallan,
  onStatusChange
}: DeliveryTableProps) {
  const handleMarkAsDelivered = (challan: DeliveryChallan) => {
    console.log("Marking challan as delivered:", challan.id, challan.status);
    if (challan.status === "pending") {
      onStatusChange(challan.id, "delivered");
    }
  };

  // Sort challans by challan number in descending order (newest first)
  const sortedChallans = [...challans].sort((a, b) => {
    // Extract number from challan number (e.g., "DC-123456" -> 123456)
    const extractNumber = (challanNo: string) => {
      const match = challanNo.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    };
    
    const aNum = extractNumber(a.challanNo);
    const bNum = extractNumber(b.challanNo);
    
    return bNum - aNum; // Descending order
  });

  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Challan No.</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-center">Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedChallans.map((challan) => (
            <TableRow key={challan.id}>
              <TableCell>
                {new Date(challan.date).toLocaleDateString()}
              </TableCell>
              <TableCell>{challan.challanNo}</TableCell>
              <TableCell>{challan.clientName}</TableCell>
              <TableCell className="text-center">{challan.itemsCount || 0}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getStatusColor(challan.status)}`}>
                  {challan.status.charAt(0).toUpperCase() + challan.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onPrintChallan(challan)}
                    title="Print Challan"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditChallan(challan)}
                    title="Edit Challan"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {challan.status === "pending" && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleMarkAsDelivered(challan)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Mark as Delivered"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive hover:bg-red-50"
                    onClick={() => onDeleteChallan(challan.id)}
                    title="Delete Challan"
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
