
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, AlertCircle, Package } from "lucide-react";
import useAppStore from "@/store/appStore";
import { Product } from "@/types";

const StockOut = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const products = useAppStore((state) => state.products);
  const categories = useAppStore((state) => state.categories || []);

  // Filter out-of-stock products (units = 0)
  const stockOutProducts = products.filter((product: Product) => {
    const units = parseInt(product.units as string, 10);
    const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
    
    return units === 0 && matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            Stock Out
          </h1>
          <p className="text-muted-foreground">
            Items that are completely out of stock
          </p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {stockOutProducts.length} Items
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search out of stock products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockOutProducts.map((product) => (
          <Card key={product.product_id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-red-600" />
                  <CardTitle className="text-lg">{product.product_name}</CardTitle>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Badge variant="destructive">OUT OF STOCK</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reorder Level:</span>
                  <span className="text-sm">{product.reorder_level || 'Not set'} units</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-semibold">₹{product.price}</span>
                </div>
                {product.created_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Added:</span>
                    <span className="text-sm">
                      {new Date(product.created_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stockOutProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Out of Stock Items</h3>
            <p className="text-muted-foreground">
              {searchQuery || categoryFilter !== "all" 
                ? "No out of stock products match your filters." 
                : "All products are currently in stock."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockOut;
