import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Eye, Edit, Trash2, Download, RotateCcw } from "lucide-react";
import { PurchaseOrderDialog } from "./PurchaseOrderDialog";

interface PurchaseOrder {
  id: string;
  poNo: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  totalAmount: number;
  status: "pending" | "approved" | "received" | "cancelled";
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export function PurchaseOrderList() {
  const navigate = useNavigate();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPurchaseOrderDialogOpen, setIsPurchaseOrderDialogOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);

  const filteredPurchaseOrders = purchaseOrders.filter((po) =>
    po.poNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePurchaseOrder = () => {
    setEditingPurchaseOrder(null);
    setIsPurchaseOrderDialogOpen(true);
  };

  const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setEditingPurchaseOrder(purchaseOrder);
    setIsPurchaseOrderDialogOpen(true);
  };

  const handleCreateReturn = (purchaseOrder: PurchaseOrder) => {
    navigate("/purchases/returns/create", {
      state: {
        returnData: {
          purchaseOrderNo: purchaseOrder.poNo,
          supplierName: purchaseOrder.supplierName,
          items: purchaseOrder.items,
          totalAmount: purchaseOrder.totalAmount,
          originalPurchaseOrder: purchaseOrder
        }
      }
    });
  };

  const handlePurchaseOrderCreated = (purchaseOrderData: any) => {
    if (editingPurchaseOrder) {
      setPurchaseOrders(prev => prev.map(po => 
        po.id === editingPurchaseOrder.id ? { ...purchaseOrderData, id: editingPurchaseOrder.id } : po
      ));
    } else {
      const newPurchaseOrder = {
        ...purchaseOrderData,
        id: Date.now().toString(),
        status: "pending" as const
      };
      setPurchaseOrders(prev => [newPurchaseOrder, ...prev]);
    }
  };

  const handleDeletePurchaseOrder = (purchaseOrderId: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      setPurchaseOrders(prev => prev.filter(po => po.id !== purchaseOrderId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-green-100 text-green-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Orders
              </CardTitle>
              <CardDescription>
                Manage all your purchase orders
              </CardDescription>
            </div>
            <Button onClick={handleCreatePurchaseOrder}>
              Create Purchase Order
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search purchase orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredPurchaseOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase orders found</h3>
              <p className="text-gray-500 mb-4">
                {purchaseOrders.length === 0 
                  ? "Create your first purchase order to get started" 
                  : "No purchase orders match your search criteria"
                }
              </p>
              {purchaseOrders.length === 0 && (
                <Button onClick={handleCreatePurchaseOrder}>
                  Create First Purchase Order
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO No</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchaseOrders.map((purchaseOrder) => (
                    <TableRow key={purchaseOrder.id}>
                      <TableCell className="font-medium">
                        {purchaseOrder.poNo}
                      </TableCell>
                      <TableCell>{purchaseOrder.supplierName}</TableCell>
                      <TableCell>
                        {new Date(purchaseOrder.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(purchaseOrder.expectedDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{purchaseOrder.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(purchaseOrder.status)}>
                          {purchaseOrder.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPurchaseOrder(purchaseOrder)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCreateReturn(purchaseOrder)}
                            title="Create Return"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePurchaseOrder(purchaseOrder.id)}
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
          )}
        </CardContent>
      </Card>

      <PurchaseOrderDialog
        open={isPurchaseOrderDialogOpen}
        onOpenChange={setIsPurchaseOrderDialogOpen}
        onPurchaseOrderCreated={handlePurchaseOrderCreated}
        editingPurchaseOrder={editingPurchaseOrder}
      />
    </div>
  );
}
