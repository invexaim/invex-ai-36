
import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import { AddCategoryDialog } from "./AddCategoryDialog";
import { ProductFormFields } from "./forms/ProductFormFields";

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
  const { categories = [] } = useAppStore();
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    price: 0,
    units: "0",
    reorder_level: 5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else if (name === 'reorder_level') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryChange = (value: string) => {
    setFormData({ ...formData, category: value });
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      category: "",
      price: 0,
      units: "0",
      reorder_level: 5,
    });
    setExpiryDate(undefined);
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

    // Submit product with expiry date - this will now automatically create expiry record
    const productData = {
      ...formData,
      expiry_date: expiryDate ? expiryDate.toISOString().split('T')[0] : undefined,
    };
    
    console.log("ADD PRODUCT DIALOG: Submitting product with expiry:", productData);
    onAddProduct(productData);
    
    // Show appropriate success message
    if (expiryDate) {
      toast.success("Product added and expiry record created successfully");
    } else {
      toast.success("Product added successfully");
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
          
          <ProductFormFields
            formData={formData}
            categories={categories}
            expiryDate={expiryDate}
            onFormDataChange={handleChange}
            onCategoryChange={handleCategoryChange}
            onExpiryDateChange={setExpiryDate}
            onAddCategory={() => setShowAddCategoryDialog(true)}
          />
          
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
