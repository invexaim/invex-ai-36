
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import useAppStore from "@/store/appStore";

const Stock = () => {
  const [activeTab, setActiveTab] = useState("local");
  const products = useAppStore((state) => state.products);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Columns for the data table
  const columns = [
    {
      accessorKey: "product_name",
      header: "Product Name",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "units",
      header: "Available Units",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return <div>${price.toFixed(2)}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Transfer
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage your local shop and warehouse inventory
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Local Stock</CardTitle>
            <CardDescription>Stock available in your shop</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500 mr-2" />
              <div>
                <div className="text-3xl font-bold">{products.length}</div>
                <div className="text-muted-foreground">Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Warehouse Stock</CardTitle>
            <CardDescription>Stock available in your warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Warehouse className="h-8 w-8 text-green-500 mr-2" />
              <div>
                <div className="text-3xl font-bold">{Math.round(products.length * 1.5)}</div>
                <div className="text-muted-foreground">Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="local" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="local" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Local Stock</span>
          </TabsTrigger>
          <TabsTrigger value="warehouse" className="flex items-center gap-2">
            <Warehouse className="h-4 w-4" />
            <span>Warehouse Stock</span>
          </TabsTrigger>
        </TabsList>

        <div className="mb-4">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <TabsContent value="local" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local Stock Inventory</CardTitle>
              <CardDescription>
                Manage stock available in your shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable columns={columns} data={filteredProducts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Stock Inventory</CardTitle>
              <CardDescription>
                Manage stock available in your warehouse/godown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={filteredProducts.map(product => ({
                  ...product,
                  units: Math.round(parseInt(product.units) * 2.5).toString() // Just for demonstration
                }))} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Stock;
