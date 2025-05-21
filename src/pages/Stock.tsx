
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/store/appStore";
import { StockHeader } from "@/components/products/stock/StockHeader";
import { StockStats } from "@/components/products/stock/StockStats";
import { SearchAndActions } from "@/components/products/stock/SearchAndActions";
import { ProductInventory } from "@/components/products/stock/ProductInventory";
import ReportDownloadDialog from "@/components/products/ReportDownloadDialog";
import { AddProductDialog } from "@/components/products/AddProductDialog";
import { TransferProductDialog } from "@/components/products/TransferProductDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product } from "@/types";
import usePersistData from "@/hooks/usePersistData";

const Stock = () => {
  // Use the persist data hook to ensure data is saved during navigation
  usePersistData();
  
  const navigate = useNavigate();
  const { products, addProduct, restockProduct, transferProduct, saveDataToSupabase } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("local");

  // Filter products based on search query and location
  const filterProducts = (products, search, isWarehouse = false) => {
    return products.filter((product) => {
      const matchesSearch = product.product_name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesLocation = isWarehouse
        ? product.product_name.includes("(Warehouse)")
        : !product.product_name.includes("(Warehouse)");
      return matchesSearch && matchesLocation;
    });
  };

  const localProducts = filterProducts(products, searchQuery, false);
  const warehouseProducts = filterProducts(products, searchQuery, true);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddProduct = (productData) => {
    // For stock page, we need to determine if it's warehouse or local based on activeTab
    if (activeTab === "warehouse") {
      // If Warehouse tab is active
      addProduct({
        ...productData,
        product_name: `${productData.product_name} (Warehouse)`,
        category: productData.category || "Uncategorized",
      });
    } else {
      // Local stock
      addProduct({
        ...productData,
        category: productData.category || "Uncategorized",
      });
    }
    
    // Explicitly save data after adding product
    saveDataToSupabase().catch(err => 
      console.error("Error saving after adding product:", err)
    );
    
    setIsAddProductOpen(false);
  };

  // Add this wrapper function to handle the different parameter signatures
  const handleRestockProduct = (product: Product) => {
    // We would typically show a dialog here to get the quantity
    // For now, we'll just restock with a default value of 1
    restockProduct(product.product_id, 1);
    
    // Explicitly save data after restocking
    saveDataToSupabase().catch(err => 
      console.error("Error saving after restocking:", err)
    );
  };

  // Add this wrapper function for the delete operation
  const handleDeleteProduct = (productId: number) => {
    console.log('Delete product', productId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <StockHeader onOpenReportDialog={() => setIsReportOpen(true)} />

      {/* Statistics */}
      <StockStats products={products} />

      {/* Search and Actions */}
      <SearchAndActions
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenTransferDialog={() => setIsTransferOpen(true)}
        onOpenProductDialog={() => setIsAddProductOpen(true)}
      />

      {/* Tabs */}
      <Tabs defaultValue="local" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="local">Local Stock</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="local">
          <ProductInventory 
            products={localProducts} 
            title="Local Inventory" 
            description="Products available in your local shop"
            onRestock={handleRestockProduct}
            onDelete={handleDeleteProduct}
          />
        </TabsContent>
        
        <TabsContent value="warehouse">
          <ProductInventory 
            products={warehouseProducts}
            title="Warehouse Inventory"
            description="Products available in your warehouse"
            onRestock={handleRestockProduct}
            onDelete={handleDeleteProduct} 
          />
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onAddProduct={handleAddProduct}
      />

      {/* Transfer Product Dialog */}
      <TransferProductDialog
        open={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        sourceType={activeTab === "local" ? "local" : "warehouse"}
      />

      {/* Report Dialog */}
      <ReportDownloadDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
};

export default Stock;
