
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChartLineIcon, Plus, Search, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import useAppStore from "@/store/appStore";

const Sales = () => {
  const { products, sales, clients, recordSale, deleteSale } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [openNewSale, setOpenNewSale] = useState(false);
  const [newSaleData, setNewSaleData] = useState({
    product_id: 0,
    quantity_sold: 1,
    selling_price: 0,
    clientId: 0,
    clientName: "",
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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
    recordSale(newSaleData);
    
    // Reset form and close dialog
    setNewSaleData({
      product_id: 0,
      quantity_sold: 1,
      selling_price: 0,
      clientId: 0,
      clientName: "",
    });
    setOpenNewSale(false);
  };

  const filteredSales = sales.filter((sale) => {
    const productName = sale.product?.product_name.toLowerCase() || "";
    const clientNameMatch = sale.clientName 
      ? sale.clientName.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
    return productName.includes(searchTerm.toLowerCase()) || clientNameMatch;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sales records
          </p>
        </div>
        <Dialog open={openNewSale} onOpenChange={setOpenNewSale}>
          <Button 
            className="self-start sm:self-auto"
            onClick={() => setOpenNewSale(true)}
            disabled={products.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" /> Record Sale
          </Button>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Record New Sale</DialogTitle>
              <DialogDescription>
                Enter the details of the sale below.
              </DialogDescription>
            </DialogHeader>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenNewSale(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={handleAddSale}
                disabled={!newSaleData.product_id || newSaleData.quantity_sold <= 0 || newSaleData.selling_price <= 0}
              >
                Record Sale
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-2">
              <ChartLineIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Sales Records</h2>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sales..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <ChartLineIcon className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <TableRow key={sale.sale_id}>
                    <TableCell className="font-medium">
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{sale.product?.product_name}</TableCell>
                    <TableCell>
                      {sale.clientName ? (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {sale.clientName}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No client</span>
                      )}
                    </TableCell>
                    <TableCell>{sale.quantity_sold}</TableCell>
                    <TableCell>₹{sale.selling_price.toFixed(2)}</TableCell>
                    <TableCell>
                      ₹{(sale.quantity_sold * sale.selling_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSale(sale.sale_id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {sales.length === 0 
                      ? "No sales recorded yet. Record a sale using the button above."
                      : "No sales found matching your search."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Sales;
