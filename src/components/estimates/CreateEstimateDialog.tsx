
import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useForm } from "react-hook-form";
import useAppStore from "@/store/appStore";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const clients = useAppStore((state) => state.clients);
  const products = useAppStore((state) => state.products);
  
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
  
  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, name: "", quantity: 1, price: 0, total: 0 }]);
  };
  
  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const updateItem = (id: number, field: keyof EstimateItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total if quantity or price changed
        if (field === 'quantity' || field === 'price') {
          updatedItem.total = updatedItem.quantity * updatedItem.price;
        }
        return updatedItem;
      }
      return item;
    }));
  };
  
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.name}>
                                {client.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="new">Enter Client Name</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <div className="border rounded-md p-2">
                  <div className="grid grid-cols-12 gap-2 font-medium text-sm py-2 px-2">
                    <div className="col-span-5">Item</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Total</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  <Separator />
                  
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-2 px-2">
                      <div className="col-span-5">
                        <Select
                          value={item.name}
                          onValueChange={(value) => updateItem(item.id, 'name', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem 
                                key={product.product_id} 
                                value={product.product_name}
                                onClick={() => updateItem(item.id, 'price', product.price)}
                              >
                                {product.product_name} - ₹{product.price}
                              </SelectItem>
                            ))}
                            <SelectItem value="custom">Custom Item</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => 
                            updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => 
                            updateItem(item.id, 'price', parseFloat(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="col-span-2 text-right pt-2">
                        ₹{(item.quantity * item.price).toLocaleString()}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="py-2 px-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      className="w-full"
                      onClick={addItem}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-end py-2 px-2">
                    <div className="w-1/3 space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg">
                        <span>Total:</span>
                        <span>₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes for the client"
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Terms and conditions"
                          className="resize-none h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
