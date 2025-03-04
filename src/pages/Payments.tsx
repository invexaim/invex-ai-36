
import { useState } from "react";
import { CreditCard, Plus, Search, Trash2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useAppStore from "@/store/appStore";

const paymentMethods = ["Credit Card", "UPI", "Bank Transfer", "Cash", "Cheque"];

const Payments = () => {
  const { payments, addPayment, deletePayment, clients } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    amount: 0,
    status: "paid" as "paid" | "pending" | "failed",
    method: "",
    description: "",
  });

  const totalPaid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "amount") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = () => {
    if (!formData.description || formData.amount <= 0 || !formData.method) {
      return;
    }
    
    // Add payment
    addPayment({
      ...formData,
      clientName: formData.clientName || "General",
    });
    
    // Reset form
    setFormData({
      clientName: "",
      amount: 0,
      status: "paid",
      method: "",
      description: "",
    });
    
    // Close dialog
    setIsAddPaymentOpen(false);
  };

  const filteredPayments = payments.filter((payment) =>
    payment.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Manage your payments and transactions
          </p>
        </div>
        <Button
          onClick={() => setIsAddPaymentOpen(true)}
          className="self-start sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> New Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
              <h3 className="text-3xl font-bold mt-1">₹{totalPaid.toLocaleString()}</h3>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
              <h3 className="text-3xl font-bold mt-1">₹{totalPending.toLocaleString()}</h3>
              <p className="text-xs text-muted-foreground mt-1">{payments.filter(p => p.status === 'pending').length} payments pending</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10">
              <CreditCard className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
              <h3 className="text-3xl font-bold mt-1">{payments.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">transactions this month</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/10">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-xl font-semibold flex items-center">
            Payment History
            <Button variant="ghost" size="sm" className="ml-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
        </div>

        {payments.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {new Date(payment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{payment.clientName}</TableCell>
                      <TableCell>{payment.description || "-"}</TableCell>
                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePayment(payment.id)}
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
                      No payments found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No payments recorded yet.</h3>
            <p className="text-muted-foreground mt-1 mb-6">Add your first payment to get started.</p>
            <Button onClick={() => setIsAddPaymentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Payment
            </Button>
          </div>
        )}
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">New Payment</DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Add a new payment record. Fill in the payment details below.
            </p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter payment description"
              />
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">Payment Method <span className="text-red-500">*</span></Label>
              <select
                id="method"
                name="method"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            
            <div className="space-y-2">
              <Label htmlFor="clientName">Client (Optional)</Label>
              <select
                id="clientName"
                name="clientName"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.clientName}
                onChange={handleChange}
              >
                <option value="">Select a client (optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.name}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddPaymentOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.description || formData.amount <= 0 || !formData.method}
              className="w-full sm:w-auto"
            >
              <CreditCard className="mr-2 h-4 w-4" /> Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
