
import { useState } from "react";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Client } from "@/types";
import GSTLookupSection from "../payments/form/GSTLookupSection";

interface AddClientDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddClient: (client: Omit<Client, "id" | "totalPurchases" | "totalSpent" | "lastPurchase">) => void;
}

export const AddClientDialog = ({ 
  isOpen, 
  onOpenChange, 
  onAddClient 
}: AddClientDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gstNumber: "",
    companyName: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [isGSTLoading, setIsGSTLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGSTDetailsUpdate = (details: {
    companyName: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      ...details
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }
    
    onAddClient({
      ...formData,
      joinDate: new Date().toISOString(),
      openInvoices: 0,
      purchaseHistory: []
    });
    
    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      gstNumber: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      pincode: ""
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Enter the details for the new client below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Client Basic Details */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter client's full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter client's email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter client's phone number"
            />
          </div>

          {/* GST Section with Address and Company Name */}
          <GSTLookupSection
            gstNumber={formData.gstNumber}
            companyName={formData.companyName}
            address={formData.address}
            city={formData.city}
            state={formData.state}
            pincode={formData.pincode}
            onChange={handleChange}
            onGSTDetailsUpdate={handleGSTDetailsUpdate}
            error={false}
            isLoading={isGSTLoading}
            setIsLoading={setIsGSTLoading}
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            <User className="mr-2 h-4 w-4" /> Add Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
