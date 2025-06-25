
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, AlertTriangle, Package, Trash2 } from "lucide-react";
import useAppStore from "@/store/appStore";
import { toast } from "sonner";

const Expiry = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const products = useAppStore((state) => state.products);

  // For demo purposes, we'll simulate expired products
  // In a real application, this would come from actual product expiry data
  const getExpiredDate = (productId: number) => {
    const baseDate = new Date();
    const randomDays = Math.floor(Math.random() * 30) + 1; // 1-30 days ago
    baseDate.setDate(baseDate.getDate() - randomDays);
    return baseDate;
  };

  const getDaysExpired = (expiredDate: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - expiredDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Filter expired products (simulated for demo)
  const expiredProducts = products
    .filter((product) => {
      const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase());
      const units = parseInt(product.units as string, 10);
      return matchesSearch && units > 0;
    })
    .slice(0, Math.floor(products.length * 0.1)) // Show ~10% of products as expired for demo
    .map((product) => ({
      ...product,
      expiredDate: getExpiredDate(product.product_id),
    }))
    .sort((a, b) => b.expiredDate.getTime() - a.expiredDate.getTime());

  const handleDisposeProduct = (productId: number, productName: string) => {
    // In a real application, this would update the product status or remove it
    toast.success(`${productName} marked for disposal`);
  };

  const handleClearanceAction = (productId: number, productName: string) => {
    // In a real application, this would trigger clearance sale or discount
    toast.success(`${productName} marked for clearance sale`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Expired Products
          </h1>
          <p className="text-muted-foreground">
            Products that have exceeded their expiry date
          </p>
        </div>
        <Badge variant="destructive" className="text-lg px-4 py-2">
          {expiredProducts.length} Items
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search expired products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Alert Banner */}
      {expiredProducts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                Action Required: {expiredProducts.length} expired products need immediate attention
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expiredProducts.map((product) => {
          const daysExpired = getDaysExpired(product.expiredDate);
          
          return (
            <Card key={product.product_id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500 bg-red-50">
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
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expired:</span>
                    <span className="text-sm font-medium text-red-600">
                      {product.expiredDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Days Expired:</span>
                    <Badge variant="destructive">
                      {daysExpired} days ago
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Stock:</span>
                    <span className="text-sm">{product.units} units</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Value:</span>
                    <span className="font-semibold text-red-600">
                      ₹{(parseFloat(product.price.toString()) * parseInt(product.units as string, 10)).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleClearanceAction(product.product_id, product.product_name)}
                      className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      Clearance
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDisposeProduct(product.product_id, product.product_name)}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Dispose
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {expiredProducts.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Expired Products</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No expired products match your search criteria." 
                : "No products have expired. Great inventory management!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Expiry;
