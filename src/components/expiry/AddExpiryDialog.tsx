
import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useAppStore from "@/store/appStore";
import { toast } from "sonner";

interface AddExpiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExpiryFormData {
  product_id: number;
  product_name: string;
  expiry_date: string;
  batch_number: string;
  quantity: number;
  notes: string;
}

const AddExpiryDialog = ({ open, onOpenChange }: AddExpiryDialogProps) => {
  const { products, addProductExpiry } = useAppStore();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ExpiryFormData>();

  const selectedProductId = watch("product_id");

  const onSubmit = (data: ExpiryFormData) => {
    const selectedProduct = products.find(p => p.product_id === Number(data.product_id));
    if (!selectedProduct) {
      toast.error("Please select a valid product");
      return;
    }

    addProductExpiry({
      product_id: Number(data.product_id),
      product_name: selectedProduct.product_name,
      expiry_date: data.expiry_date,
      batch_number: data.batch_number || undefined,
      quantity: Number(data.quantity),
      notes: data.notes || undefined,
    });

    toast.success("Product expiry date added successfully");
    reset();
    onOpenChange(false);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.product_id === Number(productId));
    if (product) {
      setValue("product_id", product.product_id);
      setValue("product_name", product.product_name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Product Expiry Date</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="product">Product *</Label>
            <Select onValueChange={handleProductSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.product_id} value={product.product_id.toString()}>
                    {product.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.product_id && (
              <p className="text-sm text-destructive mt-1">Product is required</p>
            )}
          </div>

          <div>
            <Label htmlFor="expiry_date">Expiry Date *</Label>
            <Input
              id="expiry_date"
              type="date"
              {...register("expiry_date", { required: "Expiry date is required" })}
            />
            {errors.expiry_date && (
              <p className="text-sm text-destructive mt-1">{errors.expiry_date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", { 
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be at least 1" }
              })}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="batch_number">Batch Number</Label>
            <Input
              id="batch_number"
              {...register("batch_number")}
              placeholder="Optional batch identifier"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about this batch"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expiry Date</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpiryDialog;
