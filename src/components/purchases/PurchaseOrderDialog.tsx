
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
import { PurchaseOrderHeader } from "./form/PurchaseOrderHeader";
import { PurchaseOrderItems } from "./form/PurchaseOrderItems";
import { PurchaseOrderNotes } from "./form/PurchaseOrderNotes";
import { useSuppliers } from "@/components/suppliers/hooks/useSuppliers";

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated?: (orderData: any) => void;
}

interface PurchaseOrderFormData {
  orderNo: string;
  supplierName: string;
  supplierEmail: string;
  supplierPhone: string;
  supplierAddress: string;
  supplierGST: string;
  orderDate: string;
  expectedDelivery: string;
  paymentMode: string;
  notes: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function PurchaseOrderDialog({
  open,
  onOpenChange,
  onOrderCreated,
}: PurchaseOrderDialogProps) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const { addSupplier } = useSuppliers();
  
  const form = useForm<PurchaseOrderFormData>({
    defaultValues: {
      orderNo: `PO-${Date.now().toString().slice(-6)}`,
      supplierName: "",
      supplierEmail: "",
      supplierPhone: "",
      supplierAddress: "",
      supplierGST: "",
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: "",
      paymentMode: "pending",
      notes: "",
    },
  });

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    // Determine status based on payment mode
    const status = data.paymentMode === "pending" ? "pending" : "completed";

    const orderData = {
      id: Date.now().toString(),
      ...data,
      items,
      totalAmount: calculateTotal(),
      status,
      paymentStatus: data.paymentMode === "pending" ? "pending" : "paid",
      createdAt: new Date().toISOString(),
    };

    // Save supplier information if not empty
    if (data.supplierName.trim()) {
      try {
        await addSupplier({
          name: data.supplierName,
          email: data.supplierEmail || "",
          phone: data.supplierPhone || "",
          address: data.supplierAddress || "",
          gst: data.supplierGST || "",
        });
      } catch (error) {
        console.error("Error saving supplier:", error);
        // Don't block order creation if supplier save fails
      }
    }

    console.log("Creating purchase order:", orderData);
    toast.success("Purchase order created successfully");
    
    if (onOrderCreated) {
      onOrderCreated(orderData);
    }
    
    onOpenChange(false);
    form.reset();
    setItems([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <PurchaseOrderHeader form={form} />
            <PurchaseOrderItems items={items} setItems={setItems} />
            <PurchaseOrderNotes form={form} />
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-lg font-semibold">
                Total: ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create Purchase Order
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
