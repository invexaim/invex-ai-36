
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useAppStore from "@/store/appStore";

interface RecordSaleFormProps {
  onClose: () => void;
}

const RecordSaleForm = ({ onClose }: RecordSaleFormProps) => {
  const navigate = useNavigate();
  const { products, clients, recordSale, setPendingSalePayment } = useAppStore();
  const [newSaleData, setNewSaleData] = useState({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
  });

  const handleAddSale = () => {
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
      
      // Navigate to payments page
      navigate("/payments");
    }
    
    // Reset form and close dialog
    setNewSaleData({
      product_id: 0,
      quantity_sold: 1,
      selling_price: 0,
      clientId: 0,
      clientName: "",
    });
    onClose();
  };

  return (
    <div className="grid gap-4 py-4">
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
        <select
          id="client"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => {
            const clientId = parseInt(e.target.value);
            const selectedClient = clients.find(
              (c) => c.id === clientId
            );
            setNewSaleData({
              ...newSaleData,
              clientId: clientId,
              clientName: selectedClient?.name || "",
            });
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
        </select>
      </div>
      
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
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
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
