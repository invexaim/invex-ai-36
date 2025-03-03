
import { useState } from "react";
import { mockSales } from "@/data/mockData";
import { CardStat } from "@/components/ui/card-stat";
import { Calendar, ChartLineIcon, Package, Search, TrendingUp, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sale } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";

const History = () => {
  const [transactions, setTransactions] = useState(mockSales);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [transactionType, setTransactionType] = useState("all");

  // Calculate totals
  const totalTransactions = transactions.length;
  const totalProductsSold = transactions.reduce(
    (acc, sale) => acc + sale.quantity_sold,
    0
  );
  const totalRevenue = transactions.reduce(
    (acc, sale) => acc + sale.quantity_sold * sale.selling_price,
    0
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTransactionType(e.target.value);
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(transaction => transaction.sale_id !== id));
    toast.success("Transaction deleted successfully");
  };

  // Function to determine transaction type (for demo purposes)
  const getTransactionType = (index: number): "sale" | "restock" => {
    return index % 2 === 0 ? "sale" : "restock";
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((sale) => {
    const productName = sale.product?.product_name.toLowerCase() || "";
    const saleDate = format(new Date(sale.sale_date), "yyyy-MM-dd");
    const type = getTransactionType(sale.sale_id);

    const matchesSearch = productName.includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || saleDate === selectedDate;
    const matchesType =
      transactionType === "all" || type === transactionType;

    return matchesSearch && matchesDate && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-1">
          View historical transactions and analytics
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CardStat
          title="Total Transactions"
          value={totalTransactions.toLocaleString()}
          icon={<Calendar className="w-5 h-5 text-primary" />}
          className="bg-blue-50"
        />
        <CardStat
          title="Products Sold"
          value={totalProductsSold.toLocaleString()}
          icon={<Package className="w-5 h-5 text-primary" />}
          className="bg-green-50"
        />
        <CardStat
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          className="bg-purple-50"
        />
      </div>

      {/* Transaction History */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 mb-4">
            <ChartLineIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Transaction History</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
            <div>
              <select
                value={transactionType}
                onChange={handleTypeChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="all">All Types</option>
                <option value="sale">Sales</option>
                <option value="restock">Restocks</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((sale, index) => {
                  const transactionType = getTransactionType(sale.sale_id);
                  const total = sale.quantity_sold * sale.selling_price;

                  return (
                    <TableRow key={sale.sale_id}>
                      <TableCell>
                        {format(new Date(sale.sale_date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transactionType === "sale"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {transactionType}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {sale.product?.product_name}
                      </TableCell>
                      <TableCell>{sale.quantity_sold}</TableCell>
                      <TableCell>₹{sale.selling_price.toFixed(2)}</TableCell>
                      <TableCell>
                        ₹{total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(sale.sale_id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No transactions found
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

export default History;
