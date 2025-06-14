
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RecordSaleForm from "./RecordSaleForm";
import useAppStore from "@/store/appStore";

interface SalesHeaderProps {
  productsExist: boolean;
  isRecordSaleOpen: boolean;
  setIsRecordSaleOpen: (open: boolean) => void;
}

const SalesHeader = ({ productsExist, isRecordSaleOpen, setIsRecordSaleOpen }: SalesHeaderProps) => {
  const { setPendingEstimateForSale } = useAppStore();

  const handleRecordSale = () => {
    console.log("SALES HEADER: Opening regular sale dialog");
    // Clear any pending estimate data when opening regular sale
    setPendingEstimateForSale(null);
    setIsRecordSaleOpen(true);
  };

  const handleCloseDialog = () => {
    console.log("SALES HEADER: Closing sale dialog");
    setIsRecordSaleOpen(false);
    // Clear pending estimate when closing dialog
    setPendingEstimateForSale(null);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground">Record and manage your sales transactions</p>
        </div>
        
        {productsExist && (
          <Button onClick={handleRecordSale} className="flex items-center gap-2">
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

      <Dialog open={isRecordSaleOpen} onOpenChange={setIsRecordSaleOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
          </DialogHeader>
          <RecordSaleForm onClose={handleCloseDialog} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SalesHeader;
