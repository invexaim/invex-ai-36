
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { AIInsight } from "@/types";
import { toast } from "sonner";
import useAppStore from "@/store/appStore";
import { format, subDays, parseISO, isWithinInterval } from "date-fns";

const Dashboard = () => {
  const { products, sales, clients, payments } = useAppStore();
  const navigate = useNavigate();

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

  // Generate AI insights based on actual data
  const generateAIInsights = useMemo((): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    // Only generate insights if we have products
    if (products.length === 0) {
      return [
        {
          title: "Add Products",
          description: "Start by adding products to your inventory to get personalized AI insights.",
          type: "info"
        },
        {
          title: "Track Sales",
          description: "Record sales transactions to enable sales analytics and forecasting.",
          type: "info"
        }
      ];
    }
    
    // 1. Low stock alerts
    const lowStockProducts = products.filter(p => parseInt(p.units as string) < p.reorder_level);
    if (lowStockProducts.length > 0) {
      insights.push({
        title: "Low Stock Alert",
        description: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's are' : ' is'} below reorder level${lowStockProducts.length > 1 ? 's' : ''}: ${lowStockProducts.slice(0, 2).map(p => p.product_name).join(', ')}${lowStockProducts.length > 2 ? ', and more.' : '.'}`,
        type: "warning"
      });
    }
    
    // 2. Price optimization insight
    if (sales.length > 0) {
      // Find products with highest profit margin
      const productSaleData = {} as Record<number, {revenue: number, count: number}>;
      sales.forEach(sale => {
        if (!productSaleData[sale.product_id]) {
          productSaleData[sale.product_id] = {revenue: 0, count: 0};
        }
        productSaleData[sale.product_id].revenue += sale.quantity_sold * sale.selling_price;
        productSaleData[sale.product_id].count += sale.quantity_sold;
      });
      
      // Find product with highest per-unit revenue
      let highestMarginProductId = -1;
      let highestMargin = 0;
      
      Object.entries(productSaleData).forEach(([productId, data]) => {
        const avgUnitRevenue = data.revenue / data.count;
        if (avgUnitRevenue > highestMargin) {
          highestMargin = avgUnitRevenue;
          highestMarginProductId = parseInt(productId);
        }
      });
      
      const highMarginProduct = products.find(p => p.product_id === highestMarginProductId);
      
      if (highMarginProduct) {
        insights.push({
          title: "Price Optimization",
          description: `"${highMarginProduct.product_name}" has your highest profit margin. Consider similar pricing strategies for related products in your ${highMarginProduct.category} category.`,
          type: "success"
        });
      }
    }
    
    // 3. Recent sales trends
    if (sales.length > 0) {
      // Calculate growth rate based on recent sales
      const recentSales = sales.sort((a, b) => 
        new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime()
      );
      
      if (recentSales.length >= 2) {
        const newestProductId = recentSales[0].product_id;
        const newestProduct = products.find(p => p.product_id === newestProductId);
        
        if (newestProduct) {
          insights.push({
            title: "Recent Sales Trend",
            description: `"${newestProduct.product_name}" is showing recent sales activity. Consider promoting related items from the ${newestProduct.category} category to increase cross-selling opportunities.`,
            type: "info"
          });
        }
      }
    }
    
    // 4. Inventory health
    const totalInventory = products.reduce((sum, p) => sum + parseInt(p.units as string), 0);
    const avgStock = totalInventory / products.length;
    
    if (avgStock > 30) {
      insights.push({
        title: "Inventory Health",
        description: `Your average stock level (${Math.round(avgStock)} units/product) is high. Consider special promotions to reduce excess inventory and improve cash flow.`,
        type: "warning"
      });
    } else if (avgStock < 10) {
      insights.push({
        title: "Inventory Warning",
        description: `Your average stock level (${Math.round(avgStock)} units/product) is low. Consider restocking popular items to avoid stockouts and lost sales.`,
        type: "warning"
      });
    } else {
      insights.push({
        title: "Balanced Inventory",
        description: `Your inventory levels appear well-balanced with an average of ${Math.round(avgStock)} units per product. Continue monitoring for optimal stock management.`,
        type: "success"
      });
    }
    
    return insights;
  }, [products, sales]);

  const aiInsights = generateAIInsights;

  // Handle card click for navigation
  const handleCardClick = (destination: string) => {
    navigate(destination);
  };

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
          className="bg-blue-50 dark:bg-blue-950/30 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleCardClick('/products')}
        />
        <CardStat
          title="Total Clients"
          value={clients.length}
          icon={<Users className="w-5 h-5 text-green-500" />}
          className="bg-green-50 dark:bg-green-950/30 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleCardClick('/clients')}
        />
        <CardStat
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<Wallet className="w-5 h-5 text-purple-500" />}
          className="bg-purple-50 dark:bg-purple-950/30 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleCardClick('/sales')}
        />
        <CardStat
          title="Low Stock Items"
          value={lowStockItems}
          icon={<AlertCircle className="w-5 h-5 text-destructive" />}
          className="bg-red-50 dark:bg-red-950/30 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleCardClick('/products/low-stock')}
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
              aiInsights.slice(0, 2).map((insight, index) => (
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
              aiInsights.slice(2, 4).map((insight, index) => (
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
