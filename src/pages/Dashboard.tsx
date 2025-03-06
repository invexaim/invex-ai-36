
import { useEffect, useMemo } from "react";
import { CardStat } from "@/components/ui/card-stat";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import {
  AlertCircle,
  Calendar,
  ChartPieIcon,
  TrendingUp,
  Package,
  Users,
  Wallet,
} from "lucide-react";
import { mockAIInsights } from "@/data/mockData";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import { format, subDays, parseISO, isWithinInterval } from "date-fns";

const Dashboard = () => {
  const { products, sales, clients, payments } = useAppStore();

  // First time welcome message
  useEffect(() => {
    // Welcome toast on first load
    toast.success("Welcome to Invex AI", {
      description: "Your intelligent inventory management system",
      duration: 5000,
    });
  }, []);

  // Calculate low stock items
  const lowStockItems = useMemo(() => {
    return products.filter(p => parseInt(p.units as string) < p.reorder_level).length;
  }, [products]);

  // Generate data for monthly sales trend
  const monthlySalesData = useMemo(() => {
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

  // Calculate total revenue from all sales
  const totalRevenue = useMemo(() => {
    return sales.reduce((total, sale) => 
      total + (sale.quantity_sold * sale.selling_price), 0);
  }, [sales]);

  // Calculate growth rate (mock for now - in real app would use historical data)
  const growthRate = sales.length > 0 ? "24%" : "0%";

  return (
    <div className="space-y-8 animate-fade-in smooth-scroll">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your inventory system with AI-powered insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStat
          title="Total Products"
          value={products.length}
          icon={<Package className="w-5 h-5 text-primary" />}
          className="bg-blue-50 dark:bg-blue-950/30"
        />
        <CardStat
          title="Total Clients"
          value={clients.length}
          icon={<Users className="w-5 h-5 text-green-500" />}
          className="bg-green-50 dark:bg-green-950/30"
        />
        <CardStat
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<Wallet className="w-5 h-5 text-purple-500" />}
          className="bg-purple-50 dark:bg-purple-950/30"
        />
        <CardStat
          title="Low Stock Items"
          value={lowStockItems}
          icon={<AlertCircle className="w-5 h-5 text-destructive" />}
          className="bg-red-50 dark:bg-red-950/30"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <LineChart 
            title="Daily Sales Trend"
            data={monthlySalesData.length > 0 ? monthlySalesData : [{name: 'No data', value: 0}]} 
            dataKey="value" 
            stroke="#38bdf8"
          />
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <BarChart
            title="Revenue by Category"
            data={categoryChartData.length > 0 ? categoryChartData : [{name: 'No data', value: 0}]}
            dataKey="value"
            fill="#38bdf8"
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
          <div className="space-y-4">
            {products.length > 0 ? (
              mockAIInsights.slice(0, 2).map((insight, index) => (
                <AIInsightCard key={index} insight={insight} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Add products to see AI-powered insights</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Weekly Analysis</h3>
          <div className="space-y-4">
            {products.length > 0 ? (
              mockAIInsights.slice(2, 4).map((insight, index) => (
                <AIInsightCard key={index} insight={insight} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Add products to see weekly analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
