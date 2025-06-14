
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RecordSaleForm from "./RecordSaleForm";

interface SalesHeaderProps {
  productsExist: boolean;
  isRecordSaleOpen: boolean;
  onOpenRegularSale: () => void;
  onCloseDialog: () => void;
  isFromEstimate?: boolean;
}

const SalesHeader = ({ 
  productsExist, 
  isRecordSaleOpen, 
  onOpenRegularSale, 
  onCloseDialog,
  isFromEstimate = false 
}: SalesHeaderProps) => {

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Record and manage your sales transactions</p>
        </div>
        
        {productsExist && (
          <Button onClick={onOpenRegularSale} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Record Sale
          </Button>
        )}
      </div>

      {!productsExist && (
        <Card>
          <CardHeader>
            <CardTitle>No Products Available</CardTitle>
            <CardDescription>
              You need to add products before you can record sales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = '/products'}>
              Go to Products
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={isRecordSaleOpen} onOpenChange={(open) => !open && onCloseDialog()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isFromEstimate ? "Record Sale from Estimate" : "Record New Sale"}
            </DialogTitle>
          </DialogHeader>
          <RecordSaleForm onClose={onCloseDialog} isFromEstimate={isFromEstimate} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesHeader;
