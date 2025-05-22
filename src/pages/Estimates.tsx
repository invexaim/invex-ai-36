
import React, { useState } from 'react';
import { FileText, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAppStore from '@/store/appStore';
import { CreateEstimateDialog } from '@/components/estimates/CreateEstimateDialog';

const Estimates = () => {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const products = useAppStore((state) => state.products);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Estimates & Quotations
          </h1>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Estimate
        </Button>
      </div>

      {/* Main Content */}
      <Card className="p-6">
        <div className="text-center py-16">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Estimates Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create estimates or quotations for your clients and send them via email or WhatsApp.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Estimate
          </Button>
        </div>
      </Card>

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">About Estimates & Quotations</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Create professional estimates and quotations for your products or services</li>
          <li>Share them with clients via email, WhatsApp, or as printed copies</li>
          <li>Convert estimates to invoices with a single click</li>
          <li>Track which estimates have been accepted or rejected</li>
          <li>Set expiry dates for your quotations</li>
        </ul>
      </div>
      
      {/* Create Estimate Dialog */}
      <CreateEstimateDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </div>
  );
};

export default Estimates;
