
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, Package } from "lucide-react";
import useAppStore from "@/store/appStore";
import { Product } from "@/types";

const LowStock = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const products = useAppStore((state) => state.products);

  // Filter products with low stock (units <= reorder_level)
  const lowStockProducts = products.filter((product: Product) => {
    const units = parseInt(product.units as string, 10);
    const reorderLevel = product.reorder_level || 5;
    return units <= reorderLevel && units > 0 &&
           product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getUrgencyLevel = (units: number, reorderLevel: number) => {
    if (units === 0) return "critical";
    if (units <= reorderLevel / 2) return "high";
    return "medium";
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            Low Stock
          </h1>
          <p className="text-muted-foreground">
            Items below minimum threshold that need reordering
          </p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {lowStockProducts.length} Items
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search low stock products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lowStockProducts.map((product) => {
          const units = parseInt(product.units as string, 10);
          const reorderLevel = product.reorder_level || 5;
          const urgency = getUrgencyLevel(units, reorderLevel);
          
          return (
            <Card key={product.product_id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-400">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">{product.product_name}</CardTitle>
                  </div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Stock:</span>
                    <Badge variant="outline" className="bg-red-50 text-red-700">
                      {units} units
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Reorder Level:</span>
                    <span className="text-sm">{reorderLevel} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Urgency:</span>
                    <Badge className={getUrgencyColor(urgency)}>
                      {urgency.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Price:</span>
                    <span className="font-semibold">₹{product.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {lowStockProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Low Stock Items</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "No low stock products match your search criteria." : "All products have sufficient stock levels."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LowStock;
