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
import { toast } from "sonner";
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
  const {
    currentUser
  } = useAppStore();
  const [formData, setFormData] = useState<PaymentFormData>({
    clientName: pendingSalePayment?.clientName || "",
    amount: pendingSalePayment?.selling_price || 0,
    status: "paid" as const,
    method: "",
    description: pendingSalePayment ? `Payment for Sale #${pendingSalePayment.sale_id} - ${pendingSalePayment.product?.product_name || 'Product'}` : "",
    relatedSaleId: pendingSalePayment?.sale_id,
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
  const [isGSTLoading, setIsGSTLoading] = useState(false);
  const {
    handleSubmit: secureSubmit,
    isSubmitting,
    errors: validationErrors
  } = useSecureForm({
    validateFn: validatePaymentData,
    onSubmit: async sanitizedData => {
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
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name as keyof PaymentFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };
  const handleGSTLookup = async () => {
    if (!formData.gstNumber) {
      toast.error("Please enter a GST number");
      return;
    }
    setIsGSTLoading(true);
    try {
      // Mock GST lookup - in real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data for demonstration
      setFormData(prev => ({
        ...prev,
        address: "123 Business Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      }));
      toast.success("GST details retrieved successfully");
    } catch (error) {
      toast.error("Failed to retrieve GST details");
    } finally {
      setIsGSTLoading(false);
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
        clientName: pendingSalePayment.clientName || "",
        amount: pendingSalePayment.selling_price || 0,
        description: `Payment for Sale #${pendingSalePayment.sale_id} - ${pendingSalePayment.product?.product_name || 'Product'}`,
        relatedSaleId: pendingSalePayment.sale_id
      }));
    }
  }, [pendingSalePayment]);
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Add New Payment</DialogTitle>
          
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {validationErrors.length > 0 && <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-sm text-red-600">
                {validationErrors.map((error, index) => <li key={index}>• {error}</li>)}
              </ul>
            </div>}

          <PaymentClientSection clientName={formData.clientName} clients={clients} onChange={handleChange} error={errors.clientName} />
          
          <PaymentDetailsSection description={formData.description} amount={formData.amount} method={formData.method} status={formData.status} onChange={handleChange} errors={{
          description: errors.description,
          amount: errors.amount,
          method: errors.method
        }} />
          
          <PaymentGSTSection gstNumber={formData.gstNumber} address={formData.address} city={formData.city} state={formData.state} pincode={formData.pincode} onChange={handleChange} onLookup={handleGSTLookup} error={errors.gstNumber} isLoading={isGSTLoading} />
          
          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};
export default PaymentDialog;