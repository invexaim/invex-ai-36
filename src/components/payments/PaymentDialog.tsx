
import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Client, Sale } from "@/types";
import { validateGSTNumber, lookupGSTDetails, formatGSTNumber } from "@/services/gstService";
import { toast } from "sonner";
import PaymentClientSection from "./form/PaymentClientSection";
import PaymentGSTSection from "./form/PaymentGSTSection";
import PaymentDetailsSection from "./form/PaymentDetailsSection";
import { PaymentFormData, PaymentFormErrors } from "./form/types";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: PaymentFormData) => void;
  clients: Client[];
  pendingSalePayment: Sale | null;
  onCancel: () => void;
}

const PaymentDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  clients, 
  pendingSalePayment, 
  onCancel 
}: PaymentDialogProps) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    clientName: "",
    amount: 0,
    status: "paid",
    method: "",
    description: "",
    relatedSaleId: undefined,
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  
  const [formErrors, setFormErrors] = useState<PaymentFormErrors>({
    clientName: false,
    amount: false,
    method: false,
    description: false,
    gstNumber: false
  });

  const [isGSTLoading, setIsGSTLoading] = useState(false);

  // Initialize payment form with pending sale data if available
  useEffect(() => {
    if (pendingSalePayment) {
      setFormData({
        clientName: pendingSalePayment.clientName || "",
        amount: pendingSalePayment.quantity_sold * pendingSalePayment.selling_price,
        status: "paid",
        method: "",
        description: `Payment for ${pendingSalePayment.quantity_sold} ${pendingSalePayment.product?.product_name || "items"}`,
        relatedSaleId: pendingSalePayment.sale_id,
        gstNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
    } else {
      // Reset form when no pending sale
      setFormData({
        clientName: "",
        amount: 0,
        status: "paid",
        method: "",
        description: "",
        relatedSaleId: undefined,
        gstNumber: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
      });
    }
  }, [pendingSalePayment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "amount") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
      setFormErrors({
        ...formErrors,
        amount: parseFloat(value) <= 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      
      // Clear error for the field that was just changed
      if (name in formErrors) {
        setFormErrors({
          ...formErrors,
          [name]: value.trim() === ""
        });
      }
    }
  };

  const handleGSTLookup = async () => {
    const gstNumber = formatGSTNumber(formData.gstNumber);
    
    if (!gstNumber) {
      toast.error("Please enter a GST number");
      return;
    }

    if (!validateGSTNumber(gstNumber)) {
      setFormErrors({
        ...formErrors,
        gstNumber: true
      });
      toast.error("Invalid GST number format");
      return;
    }

    setIsGSTLoading(true);
    setFormErrors({
      ...formErrors,
      gstNumber: false
    });

    try {
      const gstDetails = await lookupGSTDetails(gstNumber);
      
      if (gstDetails) {
        setFormData({
          ...formData,
          gstNumber: gstDetails.gstNumber,
          address: gstDetails.address,
          city: gstDetails.city,
          state: gstDetails.state,
          pincode: gstDetails.pincode,
        });
        toast.success("GST details found and populated");
      } else {
        toast.error("GST number not found in database");
      }
    } catch (error) {
      toast.error("Error looking up GST details");
    } finally {
      setIsGSTLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {
      clientName: !formData.clientName,
      amount: formData.amount <= 0,
      method: !formData.method,
      description: !formData.description,
      gstNumber: formData.gstNumber && !validateGSTNumber(formatGSTNumber(formData.gstNumber))
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    onSubmit({
      ...formData,
      gstNumber: formData.gstNumber ? formatGSTNumber(formData.gstNumber) : ""
    });
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {pendingSalePayment ? "Complete Sale Payment" : "New Payment"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {pendingSalePayment 
              ? "Complete the payment for your recently recorded sale." 
              : "Add a new payment record. Fill in the payment details below."}
          </p>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <PaymentClientSection
            clientName={formData.clientName}
            clients={clients}
            onChange={handleChange}
            error={formErrors.clientName}
            disabled={pendingSalePayment && !!pendingSalePayment.clientName}
          />

          <PaymentGSTSection
            gstNumber={formData.gstNumber}
            address={formData.address}
            city={formData.city}
            state={formData.state}
            pincode={formData.pincode}
            onChange={handleChange}
            onLookup={handleGSTLookup}
            error={formErrors.gstNumber}
            isLoading={isGSTLoading}
          />
          
          <PaymentDetailsSection
            description={formData.description}
            amount={formData.amount}
            method={formData.method}
            status={formData.status}
            onChange={handleChange}
            errors={{
              description: formErrors.description,
              amount: formErrors.amount,
              method: formErrors.method
            }}
          />
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            className="w-full sm:w-auto"
          >
            <CreditCard className="mr-2 h-4 w-4" /> 
            {pendingSalePayment ? "Complete Payment" : "Add Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
