
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Edit, Trash2 } from "lucide-react";
import { ProductExpiry } from "@/types";
import { EditExpiryDialog } from "./EditExpiryDialog";

interface ExpiryTableProps {
  expiries: ProductExpiry[];
  onUpdateExpiry: (id: string, updates: Partial<ProductExpiry>) => void;
  onDeleteExpiry: (id: string) => void;
}

export const ExpiryTable = ({ expiries, onUpdateExpiry, onDeleteExpiry }: ExpiryTableProps) => {
  const [editingExpiry, setEditingExpiry] = useState<ProductExpiry | null>(null);

  const getStatusBadgeVariant = (status: string, expiryDate: string) => {
    if (status === 'disposed') return 'secondary';
    if (status === 'expired') return 'destructive';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 0) return 'destructive';
    if (daysDiff <= 7) return 'warning';
    return 'default';
  };

  const getStatusIcon = (status: string, expiryDate: string) => {
    if (status === 'disposed') return <Trash2 className="h-3 w-3" />;
    if (status === 'expired') return <AlertTriangle className="h-3 w-3" />;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 7) return <AlertTriangle className="h-3 w-3" />;
    return <Calendar className="h-3 w-3" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (expiries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No expiry records found</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Batch Number</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expiries.map((expiry) => (
              <TableRow key={expiry.id}>
                <TableCell className="font-medium">{expiry.product_name}</TableCell>
                <TableCell>{expiry.batch_number || '-'}</TableCell>
                <TableCell>{expiry.quantity}</TableCell>
                <TableCell>{formatDate(expiry.expiry_date)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getStatusBadgeVariant(expiry.status, expiry.expiry_date)}
                    className="flex items-center gap-1 w-fit"
                  >
                    {getStatusIcon(expiry.status, expiry.expiry_date)}
                    {expiry.status.charAt(0).toUpperCase() + expiry.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {expiry.notes || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingExpiry(expiry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteExpiry(expiry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditExpiryDialog
        expiry={editingExpiry}
        open={!!editingExpiry}
        onOpenChange={(open) => !open && setEditingExpiry(null)}
        onUpdateExpiry={onUpdateExpiry}
      />
    </>
  );
};
