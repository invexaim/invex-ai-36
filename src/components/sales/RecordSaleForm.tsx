
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, ChevronDown } from "lucide-react";
import useAppStore from "@/store/appStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RecordSaleFormProps {
  onClose: () => void;
}

const RecordSaleForm = ({ onClose }: RecordSaleFormProps) => {
  const navigate = useNavigate();
  const { products, clients, recordSale, setPendingSalePayment, addClient } = useAppStore();
  const [newSaleData, setNewSaleData] = useState({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
  });

  // New client form state
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleAddSale = (e?: React.MouseEvent) => {
    // Prevent default if event is provided to avoid page refreshes
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validate the form
    if (!newSaleData.product_id) {
      return;
    }

    if (newSaleData.quantity_sold <= 0) {
      return;
    }

    if (newSaleData.selling_price <= 0) {
      return;
    }

    // Record the sale using our store function
    const recordedSale = recordSale(newSaleData);
    
    if (recordedSale) {
      // Store the sale details for the payment page
      setPendingSalePayment(recordedSale);
      
      // First close the dialog to prevent state issues during navigation
      onClose();
      
      // Navigate to payments page after a small delay to ensure dialog is closed
      setTimeout(() => {
        navigate("/payments");
      }, 10);
    } else {
      // If sale recording failed, just close the dialog
      onClose();
    }
    
    // Reset form 
    setNewSaleData({
      product_id: 0,
      quantity_sold: 1,
      selling_price: 0,
      clientId: 0,
      clientName: "",
    });
  };

  const handleAddNewClient = (e?: React.MouseEvent) => {
    // Prevent default if event is provided
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Validate client data
    if (!newClientData.name.trim()) {
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
    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <select
          id="product"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          }}
          value={newSaleData.product_id || ""}
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
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <div className="flex gap-2">
          <select
            id="client"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => {
              const value = e.target.value;
              
              if (value === "new") {
                setShowNewClientForm(true);
                setNewSaleData({
                  ...newSaleData,
                  clientId: 0,
                  clientName: "",
                });
              } else {
                const clientId = parseInt(value);
                const selectedClient = clients.find(
                  (c) => c.id === clientId
                );
                setNewSaleData({
                  ...newSaleData,
                  clientId: clientId,
                  clientName: selectedClient?.name || "",
                });
                
                // Hide new client form if a client is selected
                if (clientId > 0) {
                  setShowNewClientForm(false);
                }
              }
            }}
            value={newSaleData.clientId || ""}
          >
            <option value="">Select a client (optional)</option>
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowNewClientForm(!showNewClientForm);
            }}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showNewClientForm && (
        <div className="bg-muted/40 p-4 rounded-md border mt-2">
          <h3 className="text-sm font-medium mb-3">Add New Client</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="client-name">Name</Label>
              <Input
                id="client-name"
                value={newClientData.name}
                onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                placeholder="Client name"
              />
            </div>
            <div>
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                value={newClientData.email}
                onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                placeholder="Email address"
              />
            </div>
            <div>
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({...newClientData, phone: e.target.value})}
                placeholder="Phone number"
              />
            </div>
            <Button 
              type="button" 
              onClick={handleAddNewClient}
              disabled={!newClientData.name.trim()}
              className="w-full"
            >
              Save Client
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          max={newSaleData.product_id ? products.find(p => p.product_id === newSaleData.product_id)?.units : undefined}
          value={newSaleData.quantity_sold}
          onChange={(e) =>
            setNewSaleData({
              ...newSaleData,
              quantity_sold: parseInt(e.target.value) || 1,
            })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <div className="relative">
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={newSaleData.selling_price || ""}
            onChange={(e) =>
              setNewSaleData({
                ...newSaleData,
                selling_price: parseFloat(e.target.value) || 0,
              })
            }
          />
          <span className="absolute right-3 top-2.5 text-muted-foreground">
            INR
          </span>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button 
          variant="outline" 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleAddSale}
          disabled={!newSaleData.product_id || newSaleData.quantity_sold <= 0 || newSaleData.selling_price <= 0}
        >
          Record Sale
        </Button>
      </div>
    </div>
  );
};

export default RecordSaleForm;
