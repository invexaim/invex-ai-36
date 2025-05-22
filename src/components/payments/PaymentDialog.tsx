
import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Client, Sale } from "@/types";

interface PaymentFormData {
  clientName: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  method: string;
  description: string;
  relatedSaleId: number | undefined;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: PaymentFormData) => void;
  clients: Client[];
  pendingSalePayment: Sale | null;
  onCancel: () => void;
}

const paymentMethods = ["Credit Card", "UPI", "Bank Transfer", "Cash", "Cheque"];

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
  });
  
  const [formErrors, setFormErrors] = useState({
    clientName: false,
    amount: false,
    method: false,
    description: false
  });

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

  const validateForm = () => {
    const errors = {
      clientName: !formData.clientName,
      amount: formData.amount <= 0,
      method: !formData.method,
      description: !formData.description
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
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
      <DialogContent className="sm:max-w-[425px]">
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
          <div className="space-y-2">
            <Label htmlFor="clientName">Client <span className="text-red-500">*</span></Label>
            <select
              id="clientName"
              name="clientName"
              className={`flex h-10 w-full rounded-md border ${formErrors.clientName ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              value={formData.clientName}
              onChange={handleChange}
              disabled={pendingSalePayment && !!pendingSalePayment.clientName}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.name}>
                  {client.name}
                </option>
              ))}
            </select>
            {formErrors.clientName && (
              <p className="text-xs text-red-500">Client is required</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter payment description"
              className={formErrors.description ? "border-red-500" : ""}
            />
            {formErrors.description && (
              <p className="text-xs text-red-500">Description is required</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) <span className="text-red-500">*</span></Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ""}
              onChange={handleChange}
              placeholder="Enter amount"
              className={formErrors.amount ? "border-red-500" : ""}
            />
            {formErrors.amount && (
              <p className="text-xs text-red-500">Amount must be greater than 0</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method <span className="text-red-500">*</span></Label>
            <select
              id="method"
              name="method"
              className={`flex h-10 w-full rounded-md border ${formErrors.method ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              value={formData.method}
              onChange={handleChange}
            >
              <option value="">Select payment method</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {formErrors.method && (
              <p className="text-xs text-red-500">Payment method is required</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
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
