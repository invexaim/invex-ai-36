
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { PurchaseOrderDialog } from "@/components/purchases/PurchaseOrderDialog";

const CreatePurchaseOrder = () => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  const handlePurchaseOrderCreated = (purchaseOrderData: any) => {
    console.log("Purchase order created:", purchaseOrderData);
    navigate("/purchases/list");
  };

  const handleCancel = () => {
    navigate("/purchases/orders");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/purchases/orders")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Purchase Orders
          </Button>
        </div>

        <Card className="max-w-7xl mx-auto">
          <CardContent className="p-0">
            <PurchaseOrderDialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (!open) handleCancel();
              }}
              onPurchaseOrderCreated={handlePurchaseOrderCreated}
              isFullScreen={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePurchaseOrder;
