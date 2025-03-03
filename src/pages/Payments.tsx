
import { useState } from "react";
import { CardStat } from "@/components/ui/card-stat";
import { CreditCard, DollarSign, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Payment {
  id: number;
  date: string;
  clientName: string;
  amount: number;
  status: "paid" | "pending" | "failed";
  method: string;
}

const mockPayments: Payment[] = [
  {
    id: 1,
    date: "2023-10-15",
    clientName: "Rahul Sharma",
    amount: 15000,
    status: "paid",
    method: "Credit Card",
  },
  {
    id: 2,
    date: "2023-10-12",
    clientName: "Priya Patel",
    amount: 8500,
    status: "paid",
    method: "UPI",
  },
  {
    id: 3,
    date: "2023-10-08",
    clientName: "Amit Kumar",
    amount: 12000,
    status: "pending",
    method: "Bank Transfer",
  },
  {
    id: 4,
    date: "2023-10-05",
    clientName: "Neha Singh",
    amount: 9000,
    status: "failed",
    method: "Credit Card",
  },
  {
    id: 5,
    date: "2023-10-01",
    clientName: "Vikram Desai",
    amount: 20000,
    status: "paid",
    method: "UPI",
  },
];

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState("");

  const totalPaid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeletePayment = (id: number) => {
    setPayments(payments.filter(payment => payment.id !== id));
    toast.success("Payment deleted successfully");
  };

  const filteredPayments = payments.filter((payment) =>
    payment.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          Manage your payment transactions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardStat
          title="Total Paid"
          value={`₹${totalPaid.toLocaleString()}`}
          icon={<CreditCard className="w-5 h-5 text-primary" />}
          className="bg-green-50"
        />
        <CardStat
          title="Pending Payments"
          value={`₹${totalPending.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          className="bg-yellow-50"
        />
        <CardStat
          title="Transactions"
          value={payments.length.toString()}
          icon={<CreditCard className="w-5 h-5 text-primary" />}
          className="bg-blue-50"
        />
      </div>

      {/* Payments Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold">Payment History</h2>
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
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
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
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
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
                        onClick={() => handleDeletePayment(payment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No payments found
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

export default Payments;
