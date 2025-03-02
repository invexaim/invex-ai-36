
import { useState } from "react";
import { mockProducts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Product } from "@/types";

// Import refactored components
import { StatsCards } from "@/components/products/StatsCards";
import { InsightsSection } from "@/components/products/InsightsSection";
import { StockPredictor } from "@/components/products/StockPredictor";
import { ProductsTable } from "@/components/products/ProductsTable";

const Products = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProduct = () => {
    toast.success("Product added successfully", {
      description: "Your new product has been added to the inventory",
    });
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
        <Button
          onClick={handleAddProduct}
          className="self-start sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
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
    </div>
  );
};

export default Products;
