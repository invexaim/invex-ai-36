
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { EstimatePrintHeader } from './print/EstimatePrintHeader';
import { EstimateDetailsSection } from './print/EstimateDetailsSection';
import { EstimateItemsTable } from './print/EstimateItemsTable';
import { EstimateTermsSection } from './print/EstimateTermsSection';
import { EstimatePrintStyles } from './print/EstimatePrintStyles';

interface EstimatePrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: any;
}

export function EstimatePrint({ 
  open, 
  onOpenChange, 
  estimate
}: EstimatePrintProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Print Estimate</DialogTitle>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print-content bg-white" id="estimate-print">
          <EstimatePrintHeader />
          <EstimateDetailsSection estimate={estimate} />
          <EstimateItemsTable estimate={estimate} />
          <EstimateTermsSection estimate={estimate} />
        </div>
        
        <EstimatePrintStyles />
      </DialogContent>
    </Dialog>
  );
}
