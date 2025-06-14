
import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductExpiry } from "@/types";
import { EditExpiryDialog } from "./EditExpiryDialog";

interface ExpiryTableProps {
  expiries: ProductExpiry[];
  onUpdateExpiry: (id: string, updates: Partial<ProductExpiry>) => void;
  onDeleteExpiry: (id: string) => void;
}

export const ExpiryTable = ({ expiries, onUpdateExpiry, onDeleteExpiry }: ExpiryTableProps) => {
  const [editingExpiry, setEditingExpiry] = useState<ProductExpiry | null>(null);

  const getStatusBadge = (status: string, expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    
    if (status === 'disposed') {
      return <Badge variant="secondary">Disposed</Badge>;
    }
    
    if (status === 'expired' || expiry < today) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const daysToExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry <= 7) {
      return <Badge variant="outline" className="border-warning text-warning">Expiring Soon</Badge>;
    }
    
    return <Badge variant="outline" className="border-success text-success">Active</Badge>;
  };

  const handleStatusChange = (expiry: ProductExpiry, newStatus: string) => {
    onUpdateExpiry(expiry.id, { status: newStatus as 'active' | 'expired' | 'disposed' });
  };

  if (expiries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Expiry Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No expiry records found</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking product expiration dates to manage your inventory effectively.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Product Expiry Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expiries.map((expiry) => (
                <TableRow key={expiry.id}>
                  <TableCell className="font-medium">{expiry.product_name}</TableCell>
                  <TableCell>{expiry.batch_number || "-"}</TableCell>
                  <TableCell>{format(new Date(expiry.expiry_date), "MMM dd, yyyy")}</TableCell>
                  <TableCell>{expiry.quantity}</TableCell>
                  <TableCell>{getStatusBadge(expiry.status, expiry.expiry_date)}</TableCell>
                  <TableCell>{expiry.notes || "-"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingExpiry(expiry)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {expiry.status === 'active' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(expiry, 'expired')}>
                              Mark as Expired
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(expiry, 'disposed')}>
                              Mark as Disposed
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => onDeleteExpiry(expiry.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingExpiry && (
        <EditExpiryDialog
          expiry={editingExpiry}
          open={!!editingExpiry}
          onOpenChange={() => setEditingExpiry(null)}
          onUpdateExpiry={onUpdateExpiry}
        />
      )}
    </>
  );
};
