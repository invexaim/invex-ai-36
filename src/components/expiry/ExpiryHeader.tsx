
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import AddExpiryDialog from "./AddExpiryDialog";

const ExpiryHeader = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          Product Expiry
        </h1>
        <p className="text-muted-foreground">
          Track product expiry dates and manage inventory freshness
        </p>
      </div>
      
      <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Expiry Date
      </Button>

      <AddExpiryDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
};

export default ExpiryHeader;
