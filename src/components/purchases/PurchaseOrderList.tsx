
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Package, Calendar, User, CreditCard, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierName: string;
  orderDate: string;
  expectedDelivery: string;
  totalAmount: number;
  status: "pending" | "completed" | "cancelled";
  paymentMode: string;
  paymentStatus: "pending" | "paid";
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

interface PurchaseOrderListProps {
  orders: PurchaseOrder[];
  onOrderUpdate?: (updatedOrder: PurchaseOrder) => void;
  onCreateReturn?: (order: PurchaseOrder) => void;
}

export function PurchaseOrderList({ orders, onOrderUpdate, onCreateReturn }: PurchaseOrderListProps) {
  const [localOrders, setLocalOrders] = useState<PurchaseOrder[]>(orders);

  React.useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  const handleMarkCompleted = (orderId: string) => {
    const updatedOrders = localOrders.map(order => 
      order.id === orderId 
        ? { ...order, status: "completed" as const, paymentStatus: "paid" as const }
        : order
    );
    
    setLocalOrders(updatedOrders);
    
    const updatedOrder = updatedOrders.find(order => order.id === orderId);
    if (updatedOrder && onOrderUpdate) {
      onOrderUpdate(updatedOrder);
    }
    
    toast.success("Purchase order marked as completed");
  };

  const handleCreateReturn = (order: PurchaseOrder) => {
    if (onCreateReturn) {
      onCreateReturn(order);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentModeColor = (mode: string) => {
    switch (mode) {
      case "cash":
        return "bg-green-100 text-green-800";
      case "upi":
        return "bg-blue-100 text-blue-800";
      case "card":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (localOrders.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase orders</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new purchase order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {localOrders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{order.orderNo}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{order.supplierName}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge className={getStatusColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                <Badge className={getPaymentModeColor(order.paymentMode)}>
                  <CreditCard className="h-3 w-3 mr-1" />
                  {order.paymentMode.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Order: {new Date(order.orderDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Expected: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
              </div>
              <div className="text-sm font-medium">
                Total: ₹{order.totalAmount.toFixed(2)}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-700">Items:</h4>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                  <span>{item.name}</span>
                  <span>{item.quantity} × ₹{item.unitPrice} = ₹{item.total}</span>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-end">
              {order.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() => handleMarkCompleted(order.id)}
                  className="flex items-center gap-1"
                >
                  <Check className="h-4 w-4" />
                  Mark Completed
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCreateReturn(order)}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Create Return
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
