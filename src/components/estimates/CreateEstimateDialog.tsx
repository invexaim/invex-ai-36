
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

import { EstimateFormHeader } from "./form/EstimateFormHeader";
import { EstimateItemsSection } from "./form/EstimateItemsSection";
import { EstimateNotesSection } from "./form/EstimateNotesSection";

interface CreateEstimateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEstimateCreated?: (estimateData: any) => void;
}

interface EstimateForm {
  clientName: string;
  date: Date;
  validUntil: Date;
  items: EstimateItem[];
  notes: string;
  terms: string;
}

interface EstimateItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export function CreateEstimateDialog({
  open,
  onOpenChange,
  onEstimateCreated
}: CreateEstimateDialogProps) {
  const [items, setItems] = useState<EstimateItem[]>([
    { id: 1, name: "", quantity: 1, price: 0, total: 0 },
  ]);
  
  const form = useForm<EstimateForm>({
    defaultValues: {
      clientName: "",
      date: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: [],
      notes: "",
      terms: "Payment due within 30 days of issue.",
    },
  });
  
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const onSubmit = (data: EstimateForm) => {
    if (items.some(item => !item.name || item.quantity <= 0)) {
      toast.error("Please fill in all item details with valid quantities");
      return;
    }
    
    // Combine form data with items
    const estimateData = {
      ...data,
      items: items,
      status: "pending",
      totalAmount: calculateTotal(),
      referenceNo: `EST-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Creating estimate:", estimateData);
    toast.success("Estimate created successfully");
    
    // Call the callback function if it exists
    if (onEstimateCreated) {
      onEstimateCreated(estimateData);
    }
    
    onOpenChange(false);
    
    // Reset form and items
    form.reset();
    setItems([{ id: 1, name: "", quantity: 1, price: 0, total: 0 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create New Estimate</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <EstimateFormHeader control={form.control} />
              
              <EstimateItemsSection 
                items={items}
                setItems={setItems}
              />
              
              <EstimateNotesSection control={form.control} />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Estimate</Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
