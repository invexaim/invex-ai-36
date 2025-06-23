
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sale } from "@/types";

interface SalesReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sale: Sale | null;
  onReturnCreated?: (returnData: any) => void;
}

interface ReturnForm {
  returnQuantity: number;
  returnReason: string;
  refundType: string;
  notes: string;
}

const returnReasons = [
  "Defective Product",
  "Wrong Item Shipped",
  "Customer Changed Mind",
  "Damaged During Shipping",
  "Expired Product",
  "Quality Issues",
  "Other"
];

export function SalesReturnDialog({
  open,
  onOpenChange,
  sale,
  onReturnCreated
}: SalesReturnDialogProps) {
  const form = useForm<ReturnForm>({
    defaultValues: {
      returnQuantity: 1,
      returnReason: "",
      refundType: "refund",
      notes: "",
    },
  });

  const onSubmit = (data: ReturnForm) => {
    if (!sale) {
      toast.error("No sale selected for return");
      return;
    }

    if (data.returnQuantity > sale.quantity_sold) {
      toast.error(`Return quantity cannot exceed sold quantity (${sale.quantity_sold})`);
      return;
    }

    const returnAmount = (sale.selling_price * data.returnQuantity);
    
    const returnData = {
      id: Date.now(),
      originalSaleId: sale.sale_id,
      productId: sale.product_id,
      productName: sale.product?.product_name,
      clientName: sale.clientName,
      returnQuantity: data.returnQuantity,
      returnAmount,
      returnReason: data.returnReason,
      refundType: data.refundType,
      notes: data.notes,
      returnDate: new Date().toISOString(),
      status: "pending",
    };

    console.log("Creating sales return:", returnData);
    toast.success("Sales return created successfully");
    
    if (onReturnCreated) {
      onReturnCreated(returnData);
    }
    
    onOpenChange(false);
    form.reset();
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Sales Return</DialogTitle>
        </DialogHeader>

        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Original Sale Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Product:</span>
                <p>{sale.product?.product_name}</p>
              </div>
              <div>
                <span className="font-medium">Client:</span>
                <p>{sale.clientName || "No client"}</p>
              </div>
              <div>
                <span className="font-medium">Quantity Sold:</span>
                <p>{sale.quantity_sold}</p>
              </div>
              <div>
                <span className="font-medium">Unit Price:</span>
                <p>₹{sale.selling_price.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="returnQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={sale.quantity_sold}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum returnable quantity: {sale.quantity_sold}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="returnReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Reason</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select return reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {returnReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refundType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="refund">Cash Refund</SelectItem>
                      <SelectItem value="credit">Store Credit</SelectItem>
                      <SelectItem value="exchange">Exchange</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about the return..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Return Amount:</span>
                <span className="text-lg font-bold">
                  ₹{(sale.selling_price * form.watch("returnQuantity")).toFixed(2)}
                </span>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Process Return
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
