
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryField } from "./CategoryField";
import { ExpiryDateField } from "./ExpiryDateField";

interface FormData {
  product_name: string;
  category: string;
  price: number;
  units: string;
  reorder_level: number;
}

interface ProductFormFieldsProps {
  formData: FormData;
  categories: string[];
  expiryDate: Date | undefined;
  onFormDataChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (value: string) => void;
  onExpiryDateChange: (date: Date | undefined) => void;
  onAddCategory: () => void;
}

export const ProductFormFields = ({
  formData,
  categories,
  expiryDate,
  onFormDataChange,
  onCategoryChange,
  onExpiryDateChange,
  onAddCategory,
}: ProductFormFieldsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="product_name">Product Name</Label>
        <Input
          id="product_name"
          name="product_name"
          value={formData.product_name}
          onChange={onFormDataChange}
          placeholder="Enter product name"
        />
      </div>
      
      <CategoryField
        categories={categories}
        value={formData.category}
        onChange={onCategoryChange}
        onAddCategory={onAddCategory}
      />

      <ExpiryDateField
        expiryDate={expiryDate}
        onExpiryDateChange={onExpiryDateChange}
      />
      
      <div className="space-y-2">
        <Label htmlFor="price">Price (₹)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price || ""}
          onChange={onFormDataChange}
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
          onChange={onFormDataChange}
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
          onChange={onFormDataChange}
          placeholder="Enter reorder level"
        />
      </div>
    </div>
  );
};
