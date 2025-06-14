
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RecordSaleForm from "./RecordSaleForm";

interface SalesHeaderProps {
  productsExist: boolean;
}

const SalesHeader = ({ productsExist }: SalesHeaderProps) => {
  const [openNewSale, setOpenNewSale] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
        <p className="text-muted-foreground mt-1">
          Manage your sales records
        </p>
      </div>
      <Dialog open={openNewSale} onOpenChange={setOpenNewSale}>
        <Button 
          className="self-start sm:self-auto"
          onClick={() => setOpenNewSale(true)}
          disabled={!productsExist}
        >
          <Plus className="mr-2 h-4 w-4" /> Record Sale
        </Button>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record New Sale</DialogTitle>
            <DialogDescription>
              Enter the details of the sale below.
            </DialogDescription>
          </DialogHeader>
          <RecordSaleForm onClose={() => setOpenNewSale(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesHeader;
