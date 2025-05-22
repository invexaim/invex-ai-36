
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

interface CreateChallanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChallanForm {
  clientName: string;
  date: Date;
  deliveryAddress: string;
  items: ChallanItem[];
  notes: string;
  vehicleNo: string;
}

interface ChallanItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
}

export function CreateChallanDialog({
  open,
  onOpenChange,
}: CreateChallanDialogProps) {
  const [items, setItems] = useState<ChallanItem[]>([
    { id: 1, productId: 0, name: "", quantity: 1 },
  ]);
  
  const clients = useAppStore((state) => state.clients);
  const products = useAppStore((state) => state.products);
  
  const form = useForm<ChallanForm>({
    defaultValues: {
      clientName: "",
      date: new Date(),
      deliveryAddress: "",
      items: [],
      notes: "",
      vehicleNo: "",
    },
  });
  
  const addItem = () => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    setItems([...items, { id: newId, productId: 0, name: "", quantity: 1 }]);
  };
  
  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };
  
  const updateItem = (id: number, field: keyof ChallanItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const onSubmit = (data: ChallanForm) => {
    if (items.some(item => !item.name || item.quantity <= 0)) {
      toast.error("Please fill in all item details with valid quantities");
      return;
    }
    
    // Combine form data with items
    const challanData = {
      ...data,
      items: items,
      status: "delivered",
      challanNo: `DC-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    
    console.log("Creating delivery challan:", challanData);
    toast.success("Delivery challan created successfully");
    onOpenChange(false);
    
    // Reset form and items
    form.reset();
    setItems([{ id: 1, productId: 0, name: "", quantity: 1 }]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Delivery Challan</DialogTitle>
        </DialogHeader>
        
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
              
              <FormField
                control={form.control}
                name="vehicleNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle No.</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vehicle number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="deliveryAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Delivery address"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <h3 className="font-medium mb-2">Items</h3>
              <div className="border rounded-md p-2">
                <div className="grid grid-cols-12 gap-2 font-medium text-sm py-2 px-2">
                  <div className="col-span-8">Item</div>
                  <div className="col-span-3">Quantity</div>
                  <div className="col-span-1"></div>
                </div>
                
                <Separator />
                
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center py-2 px-2">
                    <div className="col-span-8">
                      <Select
                        value={item.name}
                        onValueChange={(value) => {
                          const selectedProduct = products.find(p => p.product_name === value);
                          if (selectedProduct) {
                            updateItem(item.id, 'productId', selectedProduct.product_id);
                            updateItem(item.id, 'name', value);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem 
                              key={product.product_id} 
                              value={product.product_name}
                            >
                              {product.product_name} (Available: {product.units})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => 
                          updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)
                        }
                      />
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
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes for delivery"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Delivery Challan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
