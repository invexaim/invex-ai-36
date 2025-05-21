
import React, { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReportDownloadDialog from "../products/ReportDownloadDialog";

export const HistoryHeader = () => {
  const [openReportDialog, setOpenReportDialog] = useState(false);
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your transaction history
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => setOpenReportDialog(true)}
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" /> Download Report
      </Button>
      
      <ReportDownloadDialog 
        open={openReportDialog}
        onOpenChange={setOpenReportDialog}
      />
    </div>
  );
};
