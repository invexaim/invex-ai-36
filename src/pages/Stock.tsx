
import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/store/appStore";
import { StockHeader } from "@/components/products/stock/StockHeader";
import { StockStats } from "@/components/products/stock/StockStats";
import { SearchAndActions } from "@/components/products/stock/SearchAndActions";
import { ProductInventory } from "@/components/products/stock/ProductInventory";
import ReportDownloadDialog from "@/components/products/ReportDownloadDialog";
import AddProductDialog from "@/components/products/AddProductDialog";
import TransferProductDialog from "@/components/products/TransferProductDialog";

const Stock = () => {
  const navigate = useNavigate();
  const { products, addProduct, restockProduct, transferProduct } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

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
    if (activeTab === 1) {
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
    setIsAddProductOpen(false);
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
      <Tab.Group onChange={(index) => setActiveTab(index)}>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/10 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium transition-all
              ${
                selected
                  ? "bg-white shadow text-blue-900"
                  : "text-gray-600 hover:bg-white/[0.12]"
              }`
            }
          >
            Local Stock
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium transition-all
              ${
                selected
                  ? "bg-white shadow text-blue-900"
                  : "text-gray-600 hover:bg-white/[0.12]"
              }`
            }
          >
            Warehouse
          </Tab>
        </Tab.List>

        <Tab.Panels className="mt-2">
          <Tab.Panel>
            <ProductInventory products={localProducts} location="local" />
          </Tab.Panel>
          <Tab.Panel>
            <ProductInventory products={warehouseProducts} location="warehouse" />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {/* Add Product Dialog */}
      <AddProductDialog
        isOpen={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        onAddProduct={handleAddProduct}
        initialData={{ 
          product_name: "",
          price: 0,
          units: "0",
          reorder_level: 5,
          category: "Uncategorized"
        }}
      />

      {/* Transfer Product Dialog */}
      <TransferProductDialog
        isOpen={isTransferOpen}
        onOpenChange={setIsTransferOpen}
        products={products}
        onTransferProduct={transferProduct}
      />

      {/* Report Dialog */}
      <ReportDownloadDialog open={isReportOpen} onOpenChange={setIsReportOpen} />
    </div>
  );
};

export default Stock;
