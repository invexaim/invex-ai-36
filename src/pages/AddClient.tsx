
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import useAppStore from "@/store/appStore";

const AddClient = () => {
  const navigate = useNavigate();
  const { addClient } = useAppStore();

  const handleAddClient = (clientData: any) => {
    addClient(clientData);
    navigate("/clients");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clients
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Client</CardTitle>
            <CardDescription>
              Enter the client details below. All fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddClientDialog 
              isOpen={true}
              onOpenChange={() => {}}
              onAddClient={handleAddClient}
              isFullPage={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddClient;
