
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { CreateEstimateDialog } from "@/components/estimates/CreateEstimateDialog";
import MainLayout from "@/components/layout/MainLayout";

const CreateEstimate = () => {
  const navigate = useNavigate();

  const handleEstimateCreated = (estimateData: any) => {
    // Get existing estimates
    const storedEstimates = localStorage.getItem('estimates');
    let estimates = [];
    
    if (storedEstimates) {
      try {
        estimates = JSON.parse(storedEstimates);
      } catch (e) {
        console.error("Error parsing stored estimates:", e);
      }
    }

    const newEstimate = {
      id: estimateData.referenceNo || `EST-${Date.now().toString().slice(-6)}`,
      clientName: estimateData.clientName,
      date: estimateData.date,
      referenceNo: estimateData.referenceNo || `EST-${Date.now().toString().slice(-6)}`,
      totalAmount: estimateData.totalAmount || 0,
      status: estimateData.status || "pending",
      validUntil: estimateData.validUntil,
      createdAt: estimateData.createdAt || new Date().toISOString(),
      items: estimateData.items,
      notes: estimateData.notes,
      terms: estimateData.terms,
    };
    
    const updatedEstimates = [newEstimate, ...estimates];
    localStorage.setItem('estimates', JSON.stringify(updatedEstimates));
    
    navigate("/estimates");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/estimates")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Estimates
          </Button>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Estimate</CardTitle>
            <CardDescription>
              Enter the estimate details below. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEstimateDialog 
              open={true}
              onOpenChange={() => {}}
              onEstimateCreated={handleEstimateCreated}
              isFullPage={true}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateEstimate;
