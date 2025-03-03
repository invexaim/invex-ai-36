
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { toast } from "sonner";

// Import refactored components
import { StatsCards } from "@/components/products/StatsCards";
import { InsightsSection } from "@/components/products/InsightsSection";
import { StockPredictor } from "@/components/products/StockPredictor";
import { ProductsTable } from "@/components/products/ProductsTable";

// Import add product dialog
import { AddProductDialog } from "@/components/products/AddProductDialog";
import useAppStore from "@/store/appStore";

const Products = () => {
  const { products, addProduct, importProductsFromCSV } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      setUploading(true);
      
      try {
        await importProductsFromCSV(file);
        toast.success("Products imported successfully");
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import products");
      } finally {
        setUploading(false);
        // Reset file input
        e.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and inventory
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="csv-upload" className="cursor-pointer">
            <div className="inline-flex items-center justify-center h-10 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium">
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Importing..." : "Import CSV"}
            </div>
            <input 
              id="csv-upload" 
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <Button
            onClick={() => setIsAddProductOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards products={products} />

      {/* AI Insights */}
      <InsightsSection />

      {/* Stock Predictor Section */}
      <StockPredictor products={products} />

      {/* Products Table */}
      <ProductsTable 
        products={products} 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
      />
      
      {/* Add Product Dialog */}
      <AddProductDialog 
        open={isAddProductOpen} 
        onOpenChange={setIsAddProductOpen}
        onAddProduct={addProduct}
      />
    </div>
  );
};

export default Products;
