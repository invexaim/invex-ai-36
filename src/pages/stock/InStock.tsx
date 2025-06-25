
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Package } from "lucide-react";
import useAppStore from "@/store/appStore";
import { Product } from "@/types";

const InStock = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const products = useAppStore((state) => state.products);

  // Filter products that are in stock (units > 0)
  const inStockProducts = products.filter((product: Product) => 
    parseInt(product.units as string, 10) > 0 &&
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">In Stock</h1>
          <p className="text-muted-foreground">
            All items currently available in inventory
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {inStockProducts.length} Items
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inStockProducts.map((product) => (
          <Card key={product.product_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{product.product_name}</CardTitle>
                </div>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Quantity:</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {product.units} units
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-semibold">₹{product.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reorder Level:</span>
                  <span className="text-sm">{product.reorder_level || 'Not set'}</span>
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

      {inStockProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Items in Stock</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "No products match your search criteria." : "No products are currently in stock."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InStock;
