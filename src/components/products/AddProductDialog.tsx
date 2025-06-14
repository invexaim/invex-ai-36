
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import useAppStore from "@/store/appStore";
import { AddCategoryDialog } from "./AddCategoryDialog";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: Omit<Product, 'product_id' | 'created_at'>) => void;
}

export const AddProductDialog = ({
  open,
  onOpenChange,
  onAddProduct,
}: AddProductDialogProps) => {
  const { categories = [], addProductExpiry, products } = useAppStore();
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [includeExpiry, setIncludeExpiry] = useState(false);
  
  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    price: 0,
    units: "0",
    reorder_level: 5,
  });

  const [expiryData, setExpiryData] = useState({
    expiry_date: undefined as Date | undefined,
    batch_number: "",
    expiry_quantity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === 'reorder_level') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExpiryData({ ...expiryData, [name]: value });
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const handleExpiryDateChange = (date: Date | undefined) => {
    setExpiryData({ ...expiryData, expiry_date: date });
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      category: "",
      price: 0,
      units: "0",
      reorder_level: 5,
    });
    setExpiryData({
      expiry_date: undefined,
      batch_number: "",
      expiry_quantity: "",
    });
    setIncludeExpiry(false);
  };

  const handleSubmit = () => {
    // Validate form data
    if (!formData.product_name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.category) {
      toast.error("Category is required");
      return;
    }

    if (formData.price <= 0) {
      toast.error("Price must be greater than zero");
      return;
    }

    if (parseInt(formData.units) < 0) {
      toast.error("Units cannot be negative");
      return;
    }

    // Validate expiry data if included
    if (includeExpiry) {
      if (!expiryData.expiry_date) {
        toast.error("Expiry date is required when tracking expiry");
        return;
      }

      if (expiryData.expiry_date <= new Date()) {
        toast.error("Expiry date must be in the future");
        return;
      }

      const expiryQuantity = parseInt(expiryData.expiry_quantity) || parseInt(formData.units);
      if (expiryQuantity <= 0) {
        toast.error("Expiry quantity must be greater than zero");
        return;
      }

      if (expiryQuantity > parseInt(formData.units)) {
        toast.error("Expiry quantity cannot exceed total units");
        return;
      }
    }

    // Calculate the next product ID
    const nextProductId = products.length > 0 ? Math.max(...products.map(p => p.product_id)) + 1 : 1;

    // Submit product
    onAddProduct(formData);
    
    // If expiry data is included, add it to expiry tracking
    if (includeExpiry && expiryData.expiry_date) {
      addProductExpiry({
        product_id: nextProductId,
        product_name: formData.product_name,
        expiry_date: expiryData.expiry_date.toISOString().split('T')[0],
        batch_number: expiryData.batch_number || undefined,
        quantity: parseInt(expiryData.expiry_quantity) || parseInt(formData.units),
        notes: `Added with product creation`,
      });
      
      toast.success(`Product added with expiry tracking`);
    }
    
    // Reset form and close dialog
    resetForm();
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for the new product below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>

            {/* Expiry Date Toggle */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include_expiry"
                  checked={includeExpiry}
                  onChange={(e) => setIncludeExpiry(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="include_expiry" className="text-sm font-medium">
                  Track expiry date for this product
                </Label>
              </div>
            </div>

            {/* Expiry Date Field */}
            {includeExpiry && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !expiryData.expiry_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expiryData.expiry_date ? (
                          format(expiryData.expiry_date, "PPP")
                        ) : (
                          <span>Pick expiry date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={expiryData.expiry_date}
                        onSelect={handleExpiryDateChange}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="batch_number">Batch Number (Optional)</Label>
                    <Input
                      id="batch_number"
                      name="batch_number"
                      value={expiryData.batch_number}
                      onChange={handleExpiryChange}
                      placeholder="e.g., BATCH001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiry_quantity">Expiry Quantity</Label>
                    <Input
                      id="expiry_quantity"
                      name="expiry_quantity"
                      type="number"
                      min="1"
                      value={expiryData.expiry_quantity}
                      onChange={handleExpiryChange}
                      placeholder={formData.units || "0"}
                    />
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.category} 
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  size="icon" 
                  variant="outline" 
                  onClick={() => setShowAddCategoryDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ""}
                onChange={handleChange}
                placeholder="Enter price"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="units">Units in Stock</Label>
              <Input
                id="units"
                name="units"
                type="number"
                min="0"
                value={formData.units}
                onChange={handleChange}
                placeholder="Enter stock quantity"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level</Label>
              <Input
                id="reorder_level"
                name="reorder_level"
                type="number"
                min="1"
                value={formData.reorder_level}
                onChange={handleChange}
                placeholder="Enter reorder level"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddCategoryDialog 
        open={showAddCategoryDialog} 
        onOpenChange={setShowAddCategoryDialog} 
      />
    </>
  );
};
