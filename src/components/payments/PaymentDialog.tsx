import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Client, Sale } from "@/types";
import PaymentClientSection from "./form/PaymentClientSection";
import PaymentDetailsSection from "./form/PaymentDetailsSection";
import PaymentGSTSection from "./form/PaymentGSTSection";
import { PaymentFormData, PaymentFormErrors } from "./form/types";
import { useSecureForm } from "@/hooks/useSecureForm";
import { validatePaymentData } from "@/utils/validationUtils";
import useAppStore from "@/store/appStore";

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: PaymentFormData) => void;
  onCancel: () => void;
  clients: Client[];
  pendingSalePayment?: Sale | null;
}

const PaymentDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onCancel, 
  clients, 
  pendingSalePayment 
}: PaymentDialogProps) => {
  const { currentUser } = useAppStore();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    clientName: pendingSalePayment?.customer || "",
    amount: pendingSalePayment?.total || 0,
    status: "paid" as const,
    method: "",
    description: pendingSalePayment ? 
      `Payment for Sale #${pendingSalePayment.id} - ${pendingSalePayment.products?.map(p => p.name).join(", ")}` : 
      "",
    relatedSaleId: pendingSalePayment?.id,
    gstNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: ""
  });

  const [errors, setErrors] = useState<PaymentFormErrors>({
    clientName: false,
    amount: false,
    method: false,
    description: false,
    gstNumber: false
  });

  const { handleSubmit: secureSubmit, isSubmitting, errors: validationErrors } = useSecureForm({
    validateFn: validatePaymentData,
    onSubmit: async (sanitizedData) => {
      onSubmit(sanitizedData);
      handleClose();
    },
    rateLimitAction: 'payment_creation',
    userId: currentUser?.id
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    secureSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name as keyof PaymentFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PaymentFormErrors = {
      clientName: !formData.clientName.trim(),
      amount: !formData.amount || formData.amount <= 0,
      method: !formData.method,
      description: !formData.description.trim(),
      gstNumber: false
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleClose = () => {
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
      pincode: ""
    });
    setErrors({
      clientName: false,
      amount: false,
      method: false,
      description: false,
      gstNumber: false
    });
    onClose();
  };

  useEffect(() => {
    if (pendingSalePayment) {
      setFormData(prev => ({
        ...prev,
        clientName: pendingSalePayment.customer || "",
        amount: pendingSalePayment.total || 0,
        description: `Payment for Sale #${pendingSalePayment.id} - ${pendingSalePayment.products?.map(p => p.name).join(", ")}`,
        relatedSaleId: pendingSalePayment.id
      }));
    }
  }, [pendingSalePayment]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Add New Payment</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-sm text-red-600">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <PaymentClientSection 
            clientName={formData.clientName}
            clients={clients}
            onChange={handleChange}
            error={errors.clientName}
          />
          
          <PaymentDetailsSection
            description={formData.description}
            amount={formData.amount}
            method={formData.method}
            status={formData.status}
            onChange={handleChange}
            errors={{
              description: errors.description,
              amount: errors.amount,
              method: errors.method
            }}
          />
          
          <PaymentGSTSection
            gstNumber={formData.gstNumber}
            address={formData.address}
            city={formData.city}
            state={formData.state}
            pincode={formData.pincode}
            onChange={handleChange}
            error={errors.gstNumber}
          />
          
          <div className="flex justify-end space-x-3 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
