
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
import { EstimateFormHeader } from "@/components/estimates/form/EstimateFormHeader";
import { EstimateItemsSection } from "@/components/estimates/form/EstimateItemsSection";
import { EstimateNotesSection } from "@/components/estimates/form/EstimateNotesSection";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvoiceCreated?: (invoiceData: any) => void;
  prefilledClientName?: string;
  editingInvoice?: any;
}

interface InvoiceForm {
  clientName: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  discount: number;
  gstRate: number;
}

interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  gstRate: number;
  total: number;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  onInvoiceCreated,
  prefilledClientName,
  editingInvoice
}: InvoiceDialogProps) {
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, name: "", quantity: 1, price: 0, gstRate: 18, total: 0 },
  ]);
  
  const form = useForm<InvoiceForm>({
    defaultValues: {
      clientName: prefilledClientName || "",
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: [],
      notes: "",
      terms: "Payment due within 30 days of issue.",
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

  const onSubmit = (data: InvoiceForm) => {
    if (items.some(item => !item.name || item.quantity <= 0)) {
      toast.error("Please fill in all item details with valid quantities");
      return;
    }
    
    const invoiceData = {
      ...data,
      items: items,
      subtotal: calculateSubtotal(),
      gstAmount: calculateGST(),
      totalAmount: calculateTotal(),
      invoiceNo: editingInvoice?.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
      status: editingInvoice?.status || "pending",
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
    };
    
    console.log(editingInvoice ? "Updating invoice:" : "Creating invoice:", invoiceData);
    toast.success(editingInvoice ? "Invoice updated successfully" : "Invoice created successfully");
    
    if (onInvoiceCreated) {
      onInvoiceCreated(invoiceData);
    }
    
    onOpenChange(false);
    form.reset();
    setItems([{ id: 1, name: "", quantity: 1, price: 0, gstRate: 18, total: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <EstimateFormHeader control={form.control} />
              
              <EstimateItemsSection 
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
              
              <EstimateNotesSection control={form.control} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInvoice ? "Update Invoice" : "Create Invoice"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
