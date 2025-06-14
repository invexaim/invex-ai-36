
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle } from "lucide-react";
import useAppStore from "@/store/appStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface RecordSaleFormProps {
  onClose: () => void;
}

const RecordSaleForm = ({ onClose }: RecordSaleFormProps) => {
  const navigate = useNavigate();
  const { products, clients, recordSale, setPendingSalePayment, addClient } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSaleData, setNewSaleData] = useState({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
  });
  
  const [formErrors, setFormErrors] = useState({
    product_id: false,
    quantity_sold: false,
    selling_price: false,
    clientName: false
  });

  // New client form state
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  const [newClientErrors, setNewClientErrors] = useState({
    name: false
  });

  const validateForm = () => {
    const errors = {
      product_id: !newSaleData.product_id,
      quantity_sold: newSaleData.quantity_sold <= 0,
      selling_price: newSaleData.selling_price <= 0,
      clientName: !newSaleData.clientName
    };
    
    setFormErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleAddSale = async () => {
    // Prevent double submissions
    if (isSubmitting) {
      return;
    }

    // Validate the form
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log("SALE FORM: Starting sale recording process", newSaleData);
      
      // Record the sale using our store function
      const recordedSale = recordSale(newSaleData);
      
      if (recordedSale) {
        console.log("SALE FORM: Sale recorded successfully", recordedSale);
        
        // Store the sale details for the payment page
        setPendingSalePayment(recordedSale);
        
        // Show success message
        toast.success("Sale recorded! Redirecting to payments...");
        
        // Reset form state
        setNewSaleData({
          product_id: 0,
          quantity_sold: 1,
          selling_price: 0,
          clientId: 0,
          clientName: "",
        });
        
        // Navigate to payments page BEFORE closing dialog
        console.log("SALE FORM: Navigating to payments page");
        navigate("/payments");
        
        // Close dialog AFTER navigation
        setTimeout(() => {
          onClose();
        }, 100);
        
      } else {
        console.error("SALE FORM: Failed to record sale - recordSale returned null");
        toast.error("Failed to record sale. Please try again.");
      }
    } catch (error) {
      console.error("SALE FORM: Error recording sale:", error);
      toast.error("An error occurred while recording the sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateClientForm = () => {
    const errors = {
      name: !newClientData.name.trim()
    };
    
    setNewClientErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleAddNewClient = () => {
    // Validate client data
    if (!validateClientForm()) {
      return;
    }
    
    // Add the new client
    const clientData = {
      ...newClientData,
      joinDate: new Date().toISOString(),
      openInvoices: 0
    };
    
    addClient(clientData);
    
    // Update the sale data with the new client name
    setNewSaleData({
      ...newSaleData,
      clientName: newClientData.name,
    });
    
    // Reset error for client name
    setFormErrors({
      ...formErrors,
      clientName: false
    });
    
    // Reset new client form
    setNewClientData({
      name: "",
      email: "",
      phone: "",
    });
    
    // Hide the form
    setShowNewClientForm(false);
  };

  return (
    <ScrollArea className="h-[80vh]">
      <div className="grid gap-4 py-4 px-2 pr-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product <span className="text-red-500">*</span></Label>
          <select
            id="product"
            className={`flex h-10 w-full rounded-md border ${formErrors.product_id ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
            onChange={(e) => {
              const productId = parseInt(e.target.value);
              const selectedProduct = products.find(
                (p) => p.product_id === productId
              );
              setNewSaleData({
                ...newSaleData,
                product_id: productId,
                selling_price: selectedProduct?.price || 0,
              });
              setFormErrors({
                ...formErrors,
                product_id: !productId
              });
            }}
            value={newSaleData.product_id || ""}
            disabled={isSubmitting}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option 
                key={product.product_id} 
                value={product.product_id}
                disabled={parseInt(product.units as string) <= 0}
              >
                {product.product_name} - ₹{product.price.toFixed(2)}
                {parseInt(product.units as string) <= 0 ? " (Out of Stock)" : ""}
              </option>
            ))}
          </select>
          {formErrors.product_id && (
            <p className="text-xs text-red-500">Product selection is required</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="client">Client <span className="text-red-500">*</span></Label>
          <div className="flex gap-2">
            <select
              id="client"
              className={`flex h-10 w-full rounded-md border ${formErrors.clientName ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
              onChange={(e) => {
                const clientId = parseInt(e.target.value);
                const selectedClient = clients.find(
                  (c) => c.id === clientId
                );
                
                if (e.target.value === "new") {
                  setShowNewClientForm(true);
                  return;
                }
                
                setNewSaleData({
                  ...newSaleData,
                  clientId: clientId,
                  clientName: selectedClient?.name || "",
                });
                
                setFormErrors({
                  ...formErrors,
                  clientName: !selectedClient?.name
                });
                
                // Hide new client form if a client is selected
                if (clientId > 0) {
                  setShowNewClientForm(false);
                }
              }}
              value={newSaleData.clientId || ""}
              disabled={isSubmitting}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option 
                  key={client.id} 
                  value={client.id}
                >
                  {client.name}
                </option>
              ))}
              <option value="new">➕ Add New Client</option>
            </select>
            
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={() => setShowNewClientForm(!showNewClientForm)}
              disabled={isSubmitting}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
          {formErrors.clientName && (
            <p className="text-xs text-red-500">Client selection is required</p>
          )}
        </div>
        
        {showNewClientForm && (
          <div className="bg-muted/40 p-4 rounded-md border mt-2">
            <h3 className="text-sm font-medium mb-3">Add New Client</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="client-name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="client-name"
                  value={newClientData.name}
                  onChange={(e) => {
                    setNewClientData({...newClientData, name: e.target.value});
                    setNewClientErrors({...newClientErrors, name: !e.target.value.trim()});
                  }}
                  placeholder="Client name"
                  className={newClientErrors.name ? "border-red-500" : ""}
                  disabled={isSubmitting}
                />
                {newClientErrors.name && (
                  <p className="text-xs text-red-500">Client name is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="client-email">Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                  placeholder="Email address"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="client-phone">Phone</Label>
                <Input
                  id="client-phone"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                  placeholder="Phone number"
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                type="button" 
                onClick={handleAddNewClient}
                className="w-full"
                disabled={isSubmitting}
              >
                Save Client
              </Button>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity <span className="text-red-500">*</span></Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max={newSaleData.product_id ? products.find(p => p.product_id === newSaleData.product_id)?.units : undefined}
            value={newSaleData.quantity_sold}
            onChange={(e) => {
              const quantity = parseInt(e.target.value) || 0;
              setNewSaleData({
                ...newSaleData,
                quantity_sold: quantity,
              });
              setFormErrors({
                ...formErrors,
                quantity_sold: quantity <= 0
              });
            }}
            className={formErrors.quantity_sold ? "border-red-500" : ""}
            disabled={isSubmitting}
          />
          {formErrors.quantity_sold && (
            <p className="text-xs text-red-500">Quantity must be greater than 0</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={newSaleData.selling_price || ""}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                setNewSaleData({
                  ...newSaleData,
                  selling_price: price,
                });
                setFormErrors({
                  ...formErrors,
                  selling_price: price <= 0
                });
              }}
              className={formErrors.selling_price ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            <span className="absolute right-3 top-2.5 text-muted-foreground">
              INR
            </span>
          </div>
          {formErrors.selling_price && (
            <p className="text-xs text-red-500">Price must be greater than 0</p>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleAddSale}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Recording Sale..." : "Record Sale"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default RecordSaleForm;
