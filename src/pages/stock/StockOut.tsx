
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Package, Search, XCircle } from "lucide-react";
import { useState } from "react";
import useAppStore from "@/store/appStore";

const StockOut = () => {
  const { products } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter products that are out of stock 
  // For demo purposes, we'll show products with reorder_level = 0 as out of stock
  const outOfStockProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    // In a real app, you'd check against current inventory levels
    // For now, we'll use reorder_level = 0 to indicate out of stock
    return matchesSearch && product.reorder_level === 0;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <XCircle className="h-8 w-8 text-red-600" />
              Out of Stock Products
            </h1>
            <p className="text-muted-foreground">Products that are currently out of stock</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {outOfStockProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No out of stock products</h3>
            <p className="mt-1 text-sm text-gray-500">All products are currently in stock.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outOfStockProducts.map((product) => (
              <Card key={product.product_id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{product.product_name}</CardTitle>
                      <Badge variant="secondary" className="mt-2">
                        {product.category}
                      </Badge>
                    </div>
                    <Badge variant="destructive">
                      Out of Stock
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-semibold">₹{product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unit:</span>
                      <span className="text-sm">{product.units}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Stock:</span>
                      <span className="text-sm font-medium text-red-600">0</span>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Added: {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default StockOut;
