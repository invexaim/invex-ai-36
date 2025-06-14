import { Search, RefreshCw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Payment } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard } from "lucide-react";
interface PaymentTableProps {
  payments: Payment[];
  onDeletePayment: (id: number) => void;
  onAddPayment: () => void;
}
const PaymentTable = ({
  payments,
  onDeletePayment,
  onAddPayment
}: PaymentTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  const filteredPayments = payments.filter(payment => payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const generateReferenceNumber = (paymentId: number, clientName: string) => {
    const prefix = clientName ? clientName.substring(0, 3).toUpperCase() : "PAY";
    const paddedId = paymentId.toString().padStart(4, '0');
    return `${prefix}${paddedId}`;
  };
  if (payments.length === 0) {
    return <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No payments recorded yet.</h3>
        <p className="text-muted-foreground mt-1 mb-6">Add your first payment to get started.</p>
        <Button onClick={onAddPayment}>
          <CreditCard className="mr-2 h-4 w-4" /> Add Your First Payment
        </Button>
      </div>;
  }
  return <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-6 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold flex items-center">
          Payment History
          <Button variant="ghost" size="sm" className="ml-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search payments..." value={searchTerm} onChange={handleSearchChange} className="pl-10" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>S.No</TableHead>
              <TableHead>Ref No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Method</TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPayments.length > 0 ? currentPayments.map((payment, index) => <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {generateReferenceNumber(payment.id, payment.clientName)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {new Date(payment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{payment.clientName}</TableCell>
                  <TableCell>{payment.description || "-"}</TableCell>
                  <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === "paid" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : payment.status === "pending" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  
                </TableRow>) : <TableRow>
                <TableCell colSpan={9} className="text-center py-4">
                  No payments found matching your search.
                </TableCell>
              </TableRow>}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} payments
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({
            length: totalPages
          }, (_, i) => i + 1).map(page => <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => handlePageChange(page)} className="w-8 h-8 p-0">
                  {page}
                </Button>)}
            </div>
            
            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>}
    </div>;
};
export default PaymentTable;