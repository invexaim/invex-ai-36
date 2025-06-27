
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AddExpiryDialog } from "@/components/expiry/AddExpiryDialog";
import useAppStore from "@/store/appStore";
import MainLayout from "@/components/layout/MainLayout";

const AddExpiry = () => {
  const navigate = useNavigate();
  const { products, addProductExpiry } = useAppStore();

  const handleAddExpiry = (expiryData: any) => {
    const selectedProduct = products.find(p => p.product_id === expiryData.product_id);
    if (selectedProduct) {
      addProductExpiry({
        ...expiryData,
        user_id: "", // This will be set by the store methods
        product_name: selectedProduct.product_name,
      });
    }
    navigate("/expiry");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/expiry")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Expiry
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Add Product Expiry</CardTitle>
            <CardDescription>
              Enter the product expiry details below. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddExpiryDialog
              open={true}
              onOpenChange={() => {}}
              onAddExpiry={handleAddExpiry}
              products={products}
              isFullPage={true}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AddExpiry;
