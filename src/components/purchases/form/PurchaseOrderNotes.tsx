
import React from "react";
import { Control } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface PurchaseOrderForm {
  supplierName: string;
  orderDate: Date;
  expectedDate: Date;
  items: any[];
  notes: string;
  terms: string;
  discount: number;
  gstRate: number;
}

interface PurchaseOrderNotesProps {
  control: Control<PurchaseOrderForm>;
}

export function PurchaseOrderNotes({ control }: PurchaseOrderNotesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Internal Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional notes for internal use"
                className="resize-none h-20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="terms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Terms & Conditions</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Terms and conditions for the supplier"
                className="resize-none h-20"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
