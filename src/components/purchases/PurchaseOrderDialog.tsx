
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PurchaseOrderHeader } from "./form/PurchaseOrderHeader";
import { PurchaseOrderItems } from "./form/PurchaseOrderItems";
import { PurchaseOrderNotes } from "./form/PurchaseOrderNotes";

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseOrderCreated?: (purchaseOrderData: any) => void;
  editingPurchaseOrder?: any;
  isFullScreen?: boolean;
}

interface PurchaseOrderForm {
  supplierName: string;
  orderDate: Date;
  expectedDate: Date;
  items: PurchaseOrderItem[];
  notes: string;
  terms: string;
  discount: number;
  gstRate: number;
}

interface PurchaseOrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  gstRate: number;
  total: number;
}

export function PurchaseOrderDialog({
  open,
  onOpenChange,
  onPurchaseOrderCreated,
  editingPurchaseOrder,
  isFullScreen = false
}: PurchaseOrderDialogProps) {
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { id: 1, name: "", quantity: 1, price: 0, gstRate: 18, total: 0 },
  ]);
  
  const form = useForm<PurchaseOrderForm>({
    defaultValues: {
      supplierName: "",
      orderDate: new Date(),
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      items: [],
      notes: "",
      terms: "Payment due within 30 days of delivery.",
      discount: 0,
      gstRate: 18,
    },
  });

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateGST = () => {
    return items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      return sum + (itemTotal * item.gstRate / 100);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const gst = calculateGST();
    const discount = form.getValues("discount") || 0;
    return subtotal + gst - discount;
  };

  const onSubmit = (data: PurchaseOrderForm) => {
    if (items.some(item => !item.name || item.quantity <= 0)) {
      toast.error("Please fill in all item details with valid quantities");
      return;
    }
    
    const purchaseOrderData = {
      ...data,
      items: items,
      subtotal: calculateSubtotal(),
      gstAmount: calculateGST(),
      totalAmount: calculateTotal(),
      poNo: editingPurchaseOrder?.poNo || `PO-${Date.now().toString().slice(-6)}`,
      status: editingPurchaseOrder?.status || "pending",
      createdAt: editingPurchaseOrder?.createdAt || new Date().toISOString(),
    };
    
    // Save to localStorage for purchase history
    const existingPurchases = JSON.parse(localStorage.getItem('purchaseOrders') || '[]');
    const updatedPurchases = [purchaseOrderData, ...existingPurchases];
    localStorage.setItem('purchaseOrders', JSON.stringify(updatedPurchases));
    
    console.log(editingPurchaseOrder ? "Updating purchase order:" : "Creating purchase order:", purchaseOrderData);
    toast.success(editingPurchaseOrder ? "Purchase order updated successfully" : "Purchase order created successfully");
    
    if (onPurchaseOrderCreated) {
      onPurchaseOrderCreated(purchaseOrderData);
    }
    
    onOpenChange(false);
    form.reset();
    setItems([{ id: 1, name: "", quantity: 1, price: 0, gstRate: 18, total: 0 }]);
  };

  if (isFullScreen) {
    return (
      <div className="w-full max-w-none">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {editingPurchaseOrder ? "Edit Purchase Order" : "Create New Purchase Order"}
            </h2>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PurchaseOrderHeader control={form.control} />
              
              <PurchaseOrderItems 
                items={items}
                setItems={setItems}
              />

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST:</span>
                    <span>₹{calculateGST().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>₹{form.watch("discount")?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <PurchaseOrderNotes control={form.control} />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPurchaseOrder ? "Update Purchase Order" : "Create Purchase Order"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingPurchaseOrder ? "Edit Purchase Order" : "Create New Purchase Order"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <PurchaseOrderHeader control={form.control} />
              
              <PurchaseOrderItems 
                items={items}
                setItems={setItems}
              />

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST:</span>
                    <span>₹{calculateGST().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>₹{form.watch("discount")?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <PurchaseOrderNotes control={form.control} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPurchaseOrder ? "Update Purchase Order" : "Create Purchase Order"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
