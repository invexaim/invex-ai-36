import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Warehouse, Plus, Trash2, MoveHorizontal, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useAppStore from "@/store/appStore";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransferProductDialog } from "@/components/products/TransferProductDialog";
import { AddCategoryDialog } from "@/components/products/AddCategoryDialog";
import { RestockProductDialog } from "@/components/products/RestockProductDialog";
import { Product } from "@/types";

const formSchema = z.object({
  product_name: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  units: z.string().min(1, "Units is required"),
  reorder_level: z.string().optional(),
  location: z.enum(["local", "warehouse"]),
});

const Stock = () => {
  const [activeTab, setActiveTab] = useState("local");
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  
  const products = useAppStore((state) => state.products);
  const categories = useAppStore((state) => state.categories || []);
  const addProduct = useAppStore((state) => state.addProduct);
  const deleteProduct = useAppStore((state) => state.deleteProduct);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_name: "",
      category: "",
      price: "",
      units: "",
      reorder_level: "5",
      location: "local",
    },
  });

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onSubmit = (values) => {
    try {
      // Add warehouse tag to product name if it's for warehouse
      const productData = {
        ...values,
        product_name: values.location === "warehouse" 
          ? `${values.product_name} (Warehouse)` 
          : values.product_name,
        price: parseFloat(values.price),
        reorder_level: parseInt(values.reorder_level || "5"),
      };
      
      addProduct(productData);
      toast.success("Product added successfully");
      form.reset();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    }
  };

  // Function to handle product deletion
  const handleDeleteProduct = (productId) => {
    try {
      deleteProduct(productId);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  // Function to handle product restock
  const handleRestock = (product: Product) => {
    setSelectedProduct(product);
    setShowRestockDialog(true);
  };

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
        // Changed from $ to ₹ (INR)
        return <div>₹{price.toFixed(2)}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleRestock(product)}
              className="text-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Restock
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteProduct(product.product_id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
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
                <div className="text-3xl font-bold">
                  {products.filter(p => !p.product_name.includes("(Warehouse)")).length}
                </div>
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
                <div className="text-3xl font-bold">
                  {products.filter(p => p.product_name.includes("(Warehouse)")).length}
                </div>
                <div className="text-muted-foreground">Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        
        <div className="flex gap-2">
          <Button onClick={() => setOpenTransferDialog(true)} className="flex items-center gap-2">
            <MoveHorizontal className="h-4 w-4" /> Transfer Products
          </Button>
          
          {/* Add Product Dialog Trigger */}
          <Button onClick={() => setOpenDialog(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
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
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <MoveHorizontal className="h-4 w-4" />
            <span>Transfer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Local Stock Inventory</CardTitle>
              <CardDescription>
                Manage stock available in your shop
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={filteredProducts.filter(product => !product.product_name.includes("(Warehouse)"))} 
              />
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
                data={filteredProducts.filter(product => product.product_name.includes("(Warehouse)"))} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Stock</CardTitle>
              <CardDescription>
                Move products between your local shop and warehouse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/50 p-6 rounded-lg border">
                  <h3 className="font-medium text-lg mb-4">Transfer from Local to Warehouse</h3>
                  <p className="text-muted-foreground mb-4">
                    Move excess inventory from your shop to the warehouse for storage
                  </p>
                  <Button 
                    onClick={() => {
                      setActiveTab("transfer");
                      setOpenTransferDialog(true);
                    }} 
                    className="w-full"
                  >
                    <Package className="h-4 w-4 mr-2" /> 
                    Local to Warehouse
                  </Button>
                </div>
                <div className="bg-muted/50 p-6 rounded-lg border">
                  <h3 className="font-medium text-lg mb-4">Transfer from Warehouse to Local</h3>
                  <p className="text-muted-foreground mb-4">
                    Restock your local shop with products from the warehouse
                  </p>
                  <Button 
                    onClick={() => {
                      setActiveTab("transfer");
                      setOpenTransferDialog(true);
                    }} 
                    className="w-full"
                  >
                    <Warehouse className="h-4 w-4 mr-2" /> 
                    Warehouse to Local
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new product to your inventory.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="product_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setShowAddCategoryDialog(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Location</FormLabel>
                    <div className="flex gap-4">
                      <Label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="local"
                          checked={field.value === "local"}
                          onChange={() => field.onChange("local")}
                          className="h-4 w-4"
                        />
                        <span>Local Shop</span>
                      </Label>
                      <Label className="flex items-center gap-2">
                        <input
                          type="radio"
                          value="warehouse"
                          checked={field.value === "warehouse"}
                          onChange={() => field.onChange("warehouse")}
                          className="h-4 w-4"
                        />
                        <span>Warehouse</span>
                      </Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Transfer Product Dialog */}
      <TransferProductDialog 
        open={openTransferDialog} 
        onOpenChange={setOpenTransferDialog}
        sourceType={activeTab === "warehouse" ? "warehouse" : "local"}
      />

      {/* Add Category Dialog */}
      <AddCategoryDialog 
        open={showAddCategoryDialog}
        onOpenChange={setShowAddCategoryDialog}
      />

      {/* Restock Product Dialog */}
      <RestockProductDialog
        open={showRestockDialog}
        onOpenChange={setShowRestockDialog}
        product={selectedProduct}
      />
    </div>
  );
};

export default Stock;
