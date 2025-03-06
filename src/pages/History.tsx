
import { useState, useEffect, useMemo } from "react";
import useAppStore from "@/store/appStore";
import { CardStat } from "@/components/ui/card-stat";
import { Calendar, ChartLineIcon, Package, Search, TrendingUp, Trash2 } from "lucide-react";
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
import { format, subDays, parseISO, isWithinInterval } from "date-fns";
import { toast } from "sonner";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";

const History = () => {
  const { sales, deleteSale, products } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [transactionType, setTransactionType] = useState("all");
  
  // Calculate totals from actual data
  const totalTransactions = sales.length;
  const totalProductsSold = sales.reduce(
    (acc, sale) => acc + sale.quantity_sold,
    0
  );
  const totalRevenue = sales.reduce(
    (acc, sale) => acc + sale.quantity_sold * sale.selling_price,
    0
  );

  // Generate sales trend data
  const salesChartData = useMemo(() => {
    // Generate data for the last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const formattedDate = format(date, "MMM dd");
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      // Filter sales for this day
      const daySales = sales.filter(sale => {
        const saleDate = parseISO(sale.sale_date);
        return isWithinInterval(saleDate, { start: dayStart, end: dayEnd });
      });
      
      // Calculate revenue for the day
      const revenue = daySales.reduce(
        (acc, sale) => acc + (sale.quantity_sold * sale.selling_price), 
        0
      );
      
      return {
        name: formattedDate,
        value: revenue
      };
    });
  }, [sales]);
  
  // Generate category data
  const categoryChartData = useMemo(() => {
    const categories = sales.reduce((acc, sale) => {
      const category = sale.product?.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += sale.quantity_sold * sale.selling_price;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  }, [sales]);

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
    deleteSale(id);
    toast.success("Transaction deleted successfully");
  };

  // Filter transactions based on user input
  const filteredTransactions = sales.filter((sale) => {
    const productName = sale.product?.product_name.toLowerCase() || "";
    const saleDate = selectedDate ? format(new Date(sale.sale_date), "yyyy-MM-dd") : "";
    
    const matchesSearch = productName.includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || saleDate === selectedDate;
    const matchesType = transactionType === "all" || transactionType === "sale"; // All sales are type 'sale'

    return matchesSearch && matchesDate && matchesType;
  });

  // Show initial welcome toast
  useEffect(() => {
    if (products.length === 0 && sales.length === 0) {
      toast.info("Add products and record sales to see transaction history", {
        duration: 5000,
      });
    }
  }, [products.length, sales.length]);

  return (
    <div className="space-y-8 animate-fade-in smooth-scroll">
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
          className="bg-blue-50 dark:bg-blue-950/30"
        />
        <CardStat
          title="Products Sold"
          value={totalProductsSold.toLocaleString()}
          icon={<Package className="w-5 h-5 text-primary" />}
          className="bg-green-50 dark:bg-green-950/30"
        />
        <CardStat
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          className="bg-purple-50 dark:bg-purple-950/30"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm h-[350px]">
          <h3 className="text-lg font-semibold mb-4">Sales Trend (Last 7 Days)</h3>
          <div className="h-[270px]">
            {sales.length > 0 ? (
              <LineChart 
                data={salesChartData} 
                dataKey="value" 
                xAxisDataKey="name"
                stroke="#4f46e5"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No sales data available yet</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg border shadow-sm h-[350px]">
          <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
          <div className="h-[270px]">
            {sales.length > 0 ? (
              <BarChart 
                data={categoryChartData} 
                dataKey="value" 
                xAxisDataKey="name"
                fill="#22c55e"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No category data available yet</p>
              </div>
            )}
          </div>
        </div>
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
                className="dark:text-white"
              />
            </div>
            <div>
              <select
                value={transactionType}
                onChange={handleTypeChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="sale">Sales</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 dark:text-white"
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
                filteredTransactions.map((sale) => {
                  const total = sale.quantity_sold * sale.selling_price;

                  return (
                    <TableRow key={sale.sale_id}>
                      <TableCell>
                        {format(new Date(sale.sale_date), "yyyy-MM-dd")}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          sale
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
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                      <p className="text-muted-foreground">
                        {products.length > 0 
                          ? "Record sales to view transaction history" 
                          : "Add products and record sales to view transaction history"}
                      </p>
                    </div>
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
